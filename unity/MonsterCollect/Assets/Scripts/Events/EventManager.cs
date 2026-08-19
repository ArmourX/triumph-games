using System;
using System.Collections.Generic;
using System.IO;
using MonsterCollect.Core.Analytics;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using UnityEngine;

namespace MonsterCollect.Events
{
    /// <summary>
    /// Offline-first seasonal event orchestrator. Loads ScriptableObject catalogs and JSON,
    /// applies schedule windows, aggregates modifiers, tracks per-event progress in save data.
    /// </summary>
    public static class EventManager
    {
        public const string ResourcesJsonPath = "Config/events";
        public const string OverrideFileName = "events_override.json";

        private const int QrBonusObjectiveType = 12;

        private static readonly List<SeasonalEventDefinition> catalog = new List<SeasonalEventDefinition>();
        private static readonly List<SeasonalEventDefinition> activeCache = new List<SeasonalEventDefinition>();
        private static EventModifierSnapshot modifierCache = EventModifierSnapshot.Identity;
        private static bool initialized;
        private static long lastRefreshUtc;

        public static event Action ActiveEventsChanged;

        public static IReadOnlyList<SeasonalEventDefinition> AllEvents => catalog;
        public static IReadOnlyList<SeasonalEventDefinition> ActiveEvents => activeCache;
        public static EventModifierSnapshot Modifiers => modifierCache;

        public static void Initialize()
        {
            if (initialized)
            {
                RefreshActiveEvents(force: true);
                return;
            }

            initialized = true;
            ReloadCatalog();
            MonsterCollectionService.EnsureEventsLoaded();
            RefreshActiveEvents(force: true);
        }

        public static void Reload()
        {
            initialized = true;
            ReloadCatalog();
            RefreshActiveEvents(force: true);
        }

        public static bool TryApplyDownloadedJson(string json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return false;
            }

            try
            {
                string path = Path.Combine(Application.persistentDataPath, OverrideFileName);
                File.WriteAllText(path, json);
                Reload();
                return true;
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[EventManager] Failed to apply downloaded JSON: {ex.Message}");
                return false;
            }
        }

        public static SeasonalEventDefinition GetPrimaryBannerEvent()
        {
            RefreshActiveEvents();
            if (activeCache.Count == 0)
            {
                return null;
            }

            SeasonalEventDefinition best = activeCache[0];
            for (int i = 1; i < activeCache.Count; i++)
            {
                if (activeCache[i].Priority > best.Priority)
                {
                    best = activeCache[i];
                }
            }

            return best;
        }

        public static long GetRemainingSeconds(string eventId)
        {
            SeasonalEventDefinition def = FindDefinition(eventId);
            if (def == null)
            {
                return 0;
            }

            long now = GetNowUtc(def);
            if (!EventScheduleEvaluator.IsActive(def, now))
            {
                return 0;
            }

            if (def.ScheduleKind == EventScheduleKind.AlwaysActive)
            {
                return -1;
            }

            long end = EventScheduleEvaluator.GetEndUtcSeconds(def, now);
            return end > now ? end - now : 0;
        }

        public static string FormatCountdown(long remainingSeconds)
        {
            if (remainingSeconds < 0)
            {
                return "Ongoing";
            }

            if (remainingSeconds <= 0)
            {
                return "Ended";
            }

            var span = TimeSpan.FromSeconds(remainingSeconds);
            if (span.TotalDays >= 1d)
            {
                return $"{(int)span.TotalDays}d {span.Hours}h";
            }

            if (span.TotalHours >= 1d)
            {
                return $"{span.Hours}h {span.Minutes}m";
            }

            return $"{span.Minutes}m {span.Seconds}s";
        }

        public static float GetBattleRewardMultiplier() => modifierCache.BattleRewardMultiplier;

        public static float GetTrainerXpMultiplier() => modifierCache.TrainerXpMultiplier;

        public static int GetScanLimitBonus() => modifierCache.ScanLimitBonus;

        public static float GetScanEnergyCostMultiplier() => modifierCache.ScanEnergyCostMultiplier;

        public static int GetBreedingEssenceDiscount() => modifierCache.BreedingEssenceDiscount;

        public static float GetExclusiveItemDropChance() => modifierCache.ExclusiveItemDropChance;

        public static int GetBonusRarityPercent(MonsterRarity rarity) => (int)modifierCache.GetRarityBoost(rarity);

        public static bool TryMatchQrBonus(string extractedPayload, out EventQrMatchResult bestMatch)
        {
            bestMatch = default;
            RefreshActiveEvents();

            float bestMul = 0f;
            for (int i = 0; i < activeCache.Count; i++)
            {
                SeasonalEventDefinition def = activeCache[i];
                if (!EventQrMatcher.TryMatch(def, extractedPayload, out EventQrMatchResult match))
                {
                    continue;
                }

                if (match.BonusMultiplier >= bestMul)
                {
                    bestMul = match.BonusMultiplier;
                    bestMatch = match;
                }
            }

            return bestMatch.HasMatch;
        }

        public static void ApplyScanCapture(MonsterData monster, string extractedPayload)
        {
            if (monster == null)
            {
                return;
            }

            Initialize();
            RefreshActiveEvents();

            if (TryMatchQrBonus(extractedPayload, out EventQrMatchResult qrMatch))
            {
                ApplyQrMatchToMonster(monster, qrMatch);
                RecordQrBonusTrigger(qrMatch.EventId);
            }

            for (int i = 0; i < activeCache.Count; i++)
            {
                string eventId = activeCache[i].EventId;
                EventProgressEntry progress = GetOrCreateProgress(eventId);
                progress.scans++;
                progress.lastActivityUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                IncrementQuestProgress(eventId, QuestObjectiveType.ScanMonster, 1);
                IncrementQuestProgress(eventId, QuestObjectiveType.ScanUniqueCodes, 1);
            }

            MonsterCollectionService.SaveEvents();
            GameAnalyticsService.Track("event_scan", new Dictionary<string, object>
            {
                { "event_id", monster.CapturedDuringEventId ?? string.Empty },
                { "variant", monster.EventVariantTag ?? string.Empty }
            });
        }

        public static void RecordBattleWin()
        {
            Initialize();
            RefreshActiveEvents();

            for (int i = 0; i < activeCache.Count; i++)
            {
                string eventId = activeCache[i].EventId;
                EventProgressEntry progress = GetOrCreateProgress(eventId);
                progress.battlesWon++;
                progress.lastActivityUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                IncrementQuestProgress(eventId, QuestObjectiveType.WinBattles, 1);
            }

            MonsterCollectionService.SaveEvents();
        }

        public static IReadOnlyList<EventQuestEntry> GetQuestsForEvent(string eventId)
        {
            SeasonalEventDefinition def = FindDefinition(eventId);
            return def?.EventQuests ?? Array.Empty<EventQuestEntry>();
        }

        public static EventQuestProgressEntry GetQuestProgress(string eventId, string questId)
        {
            EventProgressEntry progress = FindProgress(eventId);
            if (progress?.questProgress == null)
            {
                return null;
            }

            for (int i = 0; i < progress.questProgress.Length; i++)
            {
                if (progress.questProgress[i].questId == questId)
                {
                    return progress.questProgress[i];
                }
            }

            return null;
        }

        public static bool TryClaimEventQuest(string eventId, string questId, out string message)
        {
            Initialize();
            SeasonalEventDefinition def = FindDefinition(eventId);
            EventQuestEntry quest = FindQuest(def, questId);
            EventQuestProgressEntry progress = GetOrCreateQuestProgress(eventId, questId);

            if (quest == null || progress == null)
            {
                message = "Quest not found.";
                return false;
            }

            if (!progress.completed)
            {
                message = "Quest not completed yet.";
                return false;
            }

            if (progress.rewardClaimed)
            {
                message = "Reward already claimed.";
                return false;
            }

            if (quest.coinReward > 0)
            {
                TrainerProgressionService.AddCoins(quest.coinReward);
            }

            if (quest.trainerXpReward > 0)
            {
                TrainerProgressionService.AddTrainerXp(quest.trainerXpReward);
            }

            if (quest.essenceReward > 0)
            {
                MonsterCollectionService.AddEssence(quest.essenceReward);
            }

            if (!string.IsNullOrWhiteSpace(quest.itemRewardId) && quest.itemRewardQuantity > 0)
            {
                MonsterCollectionService.AddInventoryItem(quest.itemRewardId, quest.itemRewardQuantity);
            }

            progress.rewardClaimed = true;
            MonsterCollectionService.SaveEvents();
            GameAnalyticsService.Track("event_quest_claimed", new Dictionary<string, object>
            {
                { "event_id", eventId },
                { "quest_id", questId }
            });
            message = "Reward claimed!";
            return true;
        }

        public static bool IsBannerDismissed(string eventId)
        {
            EventSaveState state = MonsterCollectionService.EventState;
            if (state?.dismissedBannerEventIds == null)
            {
                return false;
            }

            for (int i = 0; i < state.dismissedBannerEventIds.Length; i++)
            {
                if (state.dismissedBannerEventIds[i] == eventId)
                {
                    return true;
                }
            }

            return false;
        }

        public static void DismissBanner(string eventId)
        {
            if (string.IsNullOrEmpty(eventId))
            {
                return;
            }

            MonsterCollectionService.EnsureEventsLoaded();
            EventSaveState state = MonsterCollectionService.EventState;
            var list = new List<string>(state.dismissedBannerEventIds ?? Array.Empty<string>());
            if (!list.Contains(eventId))
            {
                list.Add(eventId);
            }

            state.dismissedBannerEventIds = list.ToArray();
            MonsterCollectionService.SaveEvents();
        }

        public static string RollExclusiveBattleItem(System.Random rng)
        {
            if (modifierCache.ExclusiveItemIds == null || modifierCache.ExclusiveItemIds.Count == 0)
            {
                return null;
            }

            if (rng.NextDouble() >= modifierCache.ExclusiveItemDropChance)
            {
                return null;
            }

            var ids = new List<string>(modifierCache.ExclusiveItemIds);
            return ids[rng.Next(ids.Count)];
        }

        private static void ReloadCatalog()
        {
            catalog.Clear();
            MergeCatalog(RuntimeSeasonalEventCatalogFactory.Create());

            SeasonalEventCatalog resourceCatalog = Resources.Load<SeasonalEventCatalog>(SeasonalEventCatalog.DefaultResourcePath);
            if (resourceCatalog != null)
            {
                MergeCatalog(resourceCatalog);
            }

            TextAsset bundledJson = Resources.Load<TextAsset>(ResourcesJsonPath);
            if (bundledJson != null)
            {
                MergeJson(bundledJson.text);
            }

            string overridePath = Path.Combine(Application.persistentDataPath, OverrideFileName);
            if (File.Exists(overridePath))
            {
                MergeJson(File.ReadAllText(overridePath));
            }
        }

        private static void MergeCatalog(SeasonalEventCatalog source)
        {
            if (source?.Events == null)
            {
                return;
            }

            for (int i = 0; i < source.Events.Length; i++)
            {
                UpsertDefinition(source.Events[i]);
            }
        }

        private static void MergeJson(string json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return;
            }

            try
            {
                EventCatalogJson parsed = JsonUtility.FromJson<EventCatalogJson>(json);
                if (parsed?.events == null)
                {
                    return;
                }

                for (int i = 0; i < parsed.events.Length; i++)
                {
                    SeasonalEventDefinition def = EventJsonLoader.ToDefinition(parsed.events[i]);
                    UpsertDefinition(def);
                }
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[EventManager] JSON parse error: {ex.Message}");
            }
        }

        private static void UpsertDefinition(SeasonalEventDefinition def)
        {
            if (def == null || string.IsNullOrWhiteSpace(def.EventId))
            {
                return;
            }

            for (int i = 0; i < catalog.Count; i++)
            {
                if (catalog[i].EventId == def.EventId)
                {
                    catalog[i] = def;
                    return;
                }
            }

            catalog.Add(def);
        }

        private static void RefreshActiveEvents(bool force = false)
        {
            long now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            if (!force && now - lastRefreshUtc < 5 && activeCache.Count > 0)
            {
                return;
            }

            int previousCount = activeCache.Count;
            activeCache.Clear();

            for (int i = 0; i < catalog.Count; i++)
            {
                SeasonalEventDefinition def = catalog[i];
                long eventNow = GetNowUtc(def);
                if (EventScheduleEvaluator.IsActive(def, eventNow))
                {
                    activeCache.Add(def);
                }
            }

            activeCache.Sort((a, b) => b.Priority.CompareTo(a.Priority));
            modifierCache = EventModifierAggregator.Combine(activeCache);
            lastRefreshUtc = now;

            if (previousCount != activeCache.Count)
            {
                ActiveEventsChanged?.Invoke();
            }
        }

        private static long GetNowUtc(SeasonalEventDefinition def)
        {
            return EventScheduleEvaluator.GetNowUtcSeconds(def != null && def.PreferUtcWhenOnline);
        }

        private static SeasonalEventDefinition FindDefinition(string eventId)
        {
            for (int i = 0; i < catalog.Count; i++)
            {
                if (catalog[i].EventId == eventId)
                {
                    return catalog[i];
                }
            }

            return null;
        }

        private static void ApplyQrMatchToMonster(MonsterData monster, EventQrMatchResult match)
        {
            monster.CapturedDuringEventId = match.EventId;
            if (!string.IsNullOrWhiteSpace(match.VariantTag))
            {
                monster.EventVariantTag = match.VariantTag;
                monster.Name = $"{monster.Name} ({match.VariantTag})";
            }

            if (match.BonusRarity.HasValue && match.BonusRarity.Value > monster.Rarity)
            {
                monster.Rarity = match.BonusRarity.Value;
            }
        }

        private static void RecordQrBonusTrigger(string eventId)
        {
            EventProgressEntry progress = GetOrCreateProgress(eventId);
            progress.qrBonusTriggers++;
            IncrementQuestProgress(eventId, (QuestObjectiveType)QrBonusObjectiveType, 1);
        }

        private static EventProgressEntry GetOrCreateProgress(string eventId)
        {
            MonsterCollectionService.EnsureEventsLoaded();
            EventSaveState state = MonsterCollectionService.EventState;
            var list = new List<EventProgressEntry>(state.eventProgress ?? Array.Empty<EventProgressEntry>());

            for (int i = 0; i < list.Count; i++)
            {
                if (list[i].eventId == eventId)
                {
                    return list[i];
                }
            }

            var created = new EventProgressEntry
            {
                eventId = eventId,
                firstParticipationUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                lastActivityUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                questProgress = Array.Empty<EventQuestProgressEntry>()
            };
            list.Add(created);
            state.eventProgress = list.ToArray();
            return created;
        }

        private static EventProgressEntry FindProgress(string eventId)
        {
            EventSaveState state = MonsterCollectionService.EventState;
            if (state?.eventProgress == null)
            {
                return null;
            }

            for (int i = 0; i < state.eventProgress.Length; i++)
            {
                if (state.eventProgress[i].eventId == eventId)
                {
                    return state.eventProgress[i];
                }
            }

            return null;
        }

        private static EventQuestProgressEntry GetOrCreateQuestProgress(string eventId, string questId)
        {
            EventProgressEntry eventProgress = GetOrCreateProgress(eventId);
            var list = new List<EventQuestProgressEntry>(eventProgress.questProgress ?? Array.Empty<EventQuestProgressEntry>());

            for (int i = 0; i < list.Count; i++)
            {
                if (list[i].questId == questId)
                {
                    return list[i];
                }
            }

            var created = new EventQuestProgressEntry { questId = questId };
            list.Add(created);
            eventProgress.questProgress = list.ToArray();
            return created;
        }

        private static EventQuestEntry FindQuest(SeasonalEventDefinition def, string questId)
        {
            if (def?.EventQuests == null)
            {
                return null;
            }

            for (int i = 0; i < def.EventQuests.Length; i++)
            {
                if (def.EventQuests[i].questId == questId)
                {
                    return def.EventQuests[i];
                }
            }

            return null;
        }

        private static void IncrementQuestProgress(string eventId, QuestObjectiveType objective, int amount)
        {
            IncrementQuestProgress(eventId, objective, amount, out _);
        }

        private static void IncrementQuestProgress(string eventId, QuestObjectiveType objective, int amount, out bool completedNow)
        {
            completedNow = false;
            SeasonalEventDefinition def = FindDefinition(eventId);
            if (def?.EventQuests == null)
            {
                return;
            }

            for (int i = 0; i < def.EventQuests.Length; i++)
            {
                EventQuestEntry quest = def.EventQuests[i];
                if (quest.objectiveType != (int)objective)
                {
                    continue;
                }

                EventQuestProgressEntry progress = GetOrCreateQuestProgress(eventId, quest.questId);
                if (progress.completed)
                {
                    continue;
                }

                progress.current = Mathf.Min(quest.targetCount, progress.current + amount);
                if (progress.current >= quest.targetCount)
                {
                    progress.completed = true;
                    completedNow = true;
                }
            }
        }
    }
}
