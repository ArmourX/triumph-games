using System;
using System.Collections.Generic;
using MonsterCollect.Battle;
using MonsterCollect.Core;
using MonsterCollect.Core.Analytics;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Ranch;

namespace MonsterCollect.Progression
{
    public readonly struct QuestClaimResult
    {
        public bool Success { get; }
        public string Message { get; }

        public QuestClaimResult(bool success, string message)
        {
            Success = success;
            Message = message;
        }
    }

    /// <summary>Daily, weekly, and main quest tracking with data-driven definitions.</summary>
    public static class QuestService
    {
        public static void EnsureInitialized()
        {
            MonsterCollectionService.EnsureProgressionLoaded();
            ProgressionSaveState state = TrainerProgressionService.State;
            string today = GetDayKey(DateTimeOffset.UtcNow.ToUnixTimeSeconds());
            string week = GetWeekKey(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

            if (state.dailyQuestDayKey != today)
            {
                state.dailyQuestDayKey = today;
                state.activeDailyQuestIds = PickQuestIds(QuestCategory.Daily, 3);
                ResetQuestProgressForCategory(QuestCategory.Daily);
            }

            if (state.weeklyQuestWeekKey != week)
            {
                state.weeklyQuestWeekKey = week;
                state.activeWeeklyQuestIds = PickQuestIds(QuestCategory.Weekly, 2);
                ResetQuestProgressForCategory(QuestCategory.Weekly);
            }

            EnsureMainQuestProgress();
            MonsterCollectionService.SaveProgression();
        }

        public static IReadOnlyList<string> GetActiveQuestIds(QuestCategory category)
        {
            EnsureInitialized();
            ProgressionSaveState state = TrainerProgressionService.State;
            return category switch
            {
                QuestCategory.Daily => state.activeDailyQuestIds ?? Array.Empty<string>(),
                QuestCategory.Weekly => state.activeWeeklyQuestIds ?? Array.Empty<string>(),
                QuestCategory.Main => GetMainQuestId() != null ? new[] { GetMainQuestId() } : Array.Empty<string>(),
                _ => Array.Empty<string>()
            };
        }

        public static QuestProgressEntry GetProgress(string questId)
        {
            EnsureInitialized();
            return FindOrCreateProgress(questId);
        }

        public static QuestClaimResult TryClaimReward(string questId)
        {
            EnsureInitialized();
            QuestDefinition def = ProgressionCatalogRegistry.Quests.FindById(questId);
            QuestProgressEntry progress = FindOrCreateProgress(questId);

            if (def == null)
            {
                return new QuestClaimResult(false, "Unknown quest.");
            }

            if (!progress.completed)
            {
                return new QuestClaimResult(false, "Quest not complete yet.");
            }

            if (progress.rewardClaimed)
            {
                return new QuestClaimResult(false, "Reward already claimed.");
            }

            MonsterBookService.GrantRewardBundle(
                def.CoinReward,
                def.EssenceReward,
                def.TrainerXpReward,
                def.ItemRewardId,
                def.ItemRewardQuantity);

            progress.rewardClaimed = true;
            MonsterCollectionService.SaveProgression();
            MonsterCollectionService.NotifyCollectionChanged();
            GameAnalyticsService.TrackQuestClaimed(questId);
            GameFeedbackService.Instance?.PlayQuestComplete();

            if (def.Category == QuestCategory.Main)
            {
                TrainerProgressionService.State.mainQuestStage++;
                EnsureMainQuestProgress();
            }

            return new QuestClaimResult(true, $"Claimed: {def.DisplayName}");
        }

        public static void NotifyRankReached(int rankIndex)
        {
            UpdateQuests(QuestObjectiveType.ReachTrainerRank, rankIndex, null, null);
        }

        internal static void NotifyDexDiscovered(int totalDiscovered)
        {
            UpdateQuests(QuestObjectiveType.DiscoverDexEntries, 1, totalDiscovered.ToString(), null, isNewDiscovery: true);
        }

        public static void ReportMonsterScanned(MonsterData monster)
        {
            if (monster == null)
            {
                return;
            }

            string key = !string.IsNullOrEmpty(monster.SourceQrContent) ? monster.SourceQrContent : monster.FullHash;
            UpdateQuests(QuestObjectiveType.ScanMonster, 1, null, monster);
            UpdateQuests(QuestObjectiveType.ScanUniqueCodes, 1, key, monster, trackUniqueKey: key);
        }

        public static void ReportBattleWon(MonsterData playerMonster)
        {
            UpdateQuests(QuestObjectiveType.WinBattles, 1, null, playerMonster);

            if (playerMonster != null)
            {
                BattleElement element = BattleElementUtility.FromMonster(playerMonster);
                string elementName = BattleElementUtility.GetShortName(element);
                UpdateQuests(QuestObjectiveType.WinWithElement, 1, elementName, playerMonster);
            }
        }

        public static void ReportMonsterBred(MonsterData offspring)
        {
            UpdateQuests(QuestObjectiveType.BreedMonster, 1, null, offspring);

            if (offspring != null)
            {
                UpdateQuests(QuestObjectiveType.BreedMinRarity, 1, offspring.Rarity.ToString(), offspring);
            }
        }

        public static void ReportFeed()
        {
            UpdateQuests(QuestObjectiveType.FeedMonster, 1, null, null);
        }

        public static void ReportErrantryComplete()
        {
            UpdateQuests(QuestObjectiveType.CompleteErrantry, 1, null, null);
        }

        public static void ReportExplorationComplete(string zoneId)
        {
            UpdateQuests(QuestObjectiveType.CompleteExploration, 1, zoneId, null);
        }

        public static void ReportCircuitWin()
        {
            UpdateQuests(QuestObjectiveType.WinCircuitMatches, 1, null, null);
        }

        public static void ReportFacilityUsed()
        {
            UpdateQuests(QuestObjectiveType.UseFacility, 1, null, null);
        }

        public static void ReportCoinsSpent(int amount)
        {
            UpdateQuests(QuestObjectiveType.SpendCoins, amount, null, null);
        }

        private static void UpdateQuests(
            QuestObjectiveType objective,
            int amount,
            string param,
            MonsterData context,
            bool isNewDiscovery = false,
            string trackUniqueKey = null)
        {
            EnsureInitialized();
            QuestDefinition[] all = ProgressionCatalogRegistry.Quests.Quests;
            if (all == null)
            {
                return;
            }

            for (int i = 0; i < all.Length; i++)
            {
                QuestDefinition quest = all[i];
                if (quest == null || quest.Objective != objective || !IsQuestActive(quest))
                {
                    continue;
                }

                if (!MatchesParameter(quest, param, context))
                {
                    continue;
                }

                QuestProgressEntry progress = FindOrCreateProgress(quest.QuestId);

                if (progress.completed)
                {
                    continue;
                }

                if (objective == QuestObjectiveType.ScanUniqueCodes && !string.IsNullOrEmpty(trackUniqueKey))
                {
                    if (!ContainsKey(progress.trackedKeys, trackUniqueKey))
                    {
                        progress.trackedKeys = AppendKey(progress.trackedKeys, trackUniqueKey);
                        progress.current = progress.trackedKeys.Length;
                    }
                }
                else if (objective == QuestObjectiveType.DiscoverDexEntries && quest.Category == QuestCategory.Main)
                {
                    progress.current = MonsterBookService.DiscoveredDexCount;
                }
                else if (objective == QuestObjectiveType.DiscoverDexEntries && isNewDiscovery)
                {
                    progress.current += amount;
                }
                else if (objective == QuestObjectiveType.ReachTrainerRank)
                {
                    progress.current = TrainerProgressionService.RankIndex;
                }
                else if (objective == QuestObjectiveType.BreedMinRarity && context != null)
                {
                    if (MeetsRarityThreshold(context.Rarity, quest.ObjectiveParameter))
                    {
                        progress.current += amount;
                    }
                }
                else
                {
                    progress.current += amount;
                }

                if (progress.current >= quest.TargetCount)
                {
                    progress.current = quest.TargetCount;
                    if (!progress.completed)
                    {
                        progress.completed = true;
                        GameAnalyticsService.TrackQuestCompleted(quest.QuestId, quest.Category.ToString());
                    }
                }
            }

            MonsterCollectionService.SaveProgression();
        }

        private static bool IsQuestActive(QuestDefinition quest)
        {
            if (quest.Category == QuestCategory.Main)
            {
                QuestDefinition current = GetCurrentMainQuest();
                return current != null && current.QuestId == quest.QuestId;
            }

            string[] active = quest.Category == QuestCategory.Daily
                ? TrainerProgressionService.State.activeDailyQuestIds
                : TrainerProgressionService.State.activeWeeklyQuestIds;

            if (active == null)
            {
                return false;
            }

            for (int i = 0; i < active.Length; i++)
            {
                if (active[i] == quest.QuestId)
                {
                    return true;
                }
            }

            return false;
        }

        private static bool MatchesParameter(QuestDefinition quest, string param, MonsterData context)
        {
            if (string.IsNullOrEmpty(quest.ObjectiveParameter))
            {
                return true;
            }

            switch (quest.Objective)
            {
                case QuestObjectiveType.WinWithElement:
                    return string.Equals(quest.ObjectiveParameter, param, StringComparison.OrdinalIgnoreCase);
                case QuestObjectiveType.CompleteExploration:
                    if (string.IsNullOrEmpty(quest.ObjectiveParameter))
                    {
                        return true;
                    }

                    return !string.IsNullOrEmpty(param) &&
                           param.IndexOf(quest.ObjectiveParameter, StringComparison.OrdinalIgnoreCase) >= 0;
                case QuestObjectiveType.BreedMinRarity:
                    return context != null && MeetsRarityThreshold(context.Rarity, quest.ObjectiveParameter);
                case QuestObjectiveType.ReachTrainerRank:
                    if (int.TryParse(quest.ObjectiveParameter, out int requiredRank))
                    {
                        return TrainerProgressionService.RankIndex >= requiredRank;
                    }

                    return false;
                default:
                    return true;
            }
        }

        private static bool MeetsRarityThreshold(MonsterRarity rarity, string thresholdName)
        {
            if (!Enum.TryParse(thresholdName, true, out MonsterRarity threshold))
            {
                return false;
            }

            return rarity >= threshold;
        }

        private static QuestDefinition GetCurrentMainQuest()
        {
            QuestDefinition[] all = ProgressionCatalogRegistry.Quests.Quests;
            if (all == null)
            {
                return null;
            }

            int stage = TrainerProgressionService.State.mainQuestStage;

            for (int i = 0; i < all.Length; i++)
            {
                QuestDefinition quest = all[i];
                if (quest != null && quest.Category == QuestCategory.Main && quest.MainQuestOrder == stage)
                {
                    QuestProgressEntry progress = FindOrCreateProgress(quest.QuestId);
                    if (progress.rewardClaimed)
                    {
                        continue;
                    }

                    return quest;
                }
            }

            return null;
        }

        private static string GetMainQuestId()
        {
            return GetCurrentMainQuest()?.QuestId;
        }

        private static void EnsureMainQuestProgress()
        {
            QuestDefinition main = GetCurrentMainQuest();
            if (main == null)
            {
                return;
            }

            QuestProgressEntry progress = FindOrCreateProgress(main.QuestId);
            if (progress.rewardClaimed)
            {
                return;
            }

            if (main.Objective == QuestObjectiveType.DiscoverDexEntries)
            {
                progress.current = MonsterBookService.DiscoveredDexCount;
            }
            else if (main.Objective == QuestObjectiveType.ReachTrainerRank)
            {
                progress.current = TrainerProgressionService.RankIndex;
            }

            if (progress.current >= main.TargetCount)
            {
                progress.current = main.TargetCount;
                progress.completed = true;
            }
        }

        private static string[] PickQuestIds(QuestCategory category, int count)
        {
            QuestDefinition[] all = ProgressionCatalogRegistry.Quests.Quests;
            var pool = new List<string>();

            if (all != null)
            {
                for (int i = 0; i < all.Length; i++)
                {
                    if (all[i] != null && all[i].Category == category)
                    {
                        pool.Add(all[i].QuestId);
                    }
                }
            }

            Shuffle(pool, MonsterBookService.DiscoveredDexCount + (int)DateTimeOffset.UtcNow.ToUnixTimeSeconds());

            int take = Math.Min(count, pool.Count);
            var result = new string[take];
            for (int i = 0; i < take; i++)
            {
                result[i] = pool[i];
            }

            return result;
        }

        private static void Shuffle(List<string> list, int seed)
        {
            var rng = new Random(seed);
            for (int i = list.Count - 1; i > 0; i--)
            {
                int j = rng.Next(i + 1);
                (list[i], list[j]) = (list[j], list[i]);
            }
        }

        private static void ResetQuestProgressForCategory(QuestCategory category)
        {
            QuestDefinition[] all = ProgressionCatalogRegistry.Quests.Quests;
            if (all == null)
            {
                return;
            }

            for (int i = 0; i < all.Length; i++)
            {
                QuestDefinition quest = all[i];
                if (quest != null && quest.Category == category)
                {
                    RemoveProgress(quest.QuestId);
                }
            }
        }

        private static QuestProgressEntry FindOrCreateProgress(string questId)
        {
            ProgressionSaveState state = TrainerProgressionService.State;
            QuestProgressEntry[] entries = state.questProgress ?? Array.Empty<QuestProgressEntry>();

            for (int i = 0; i < entries.Length; i++)
            {
                if (entries[i].questId == questId)
                {
                    return entries[i];
                }
            }

            var entry = new QuestProgressEntry { questId = questId };
            var list = new List<QuestProgressEntry>(entries) { entry };
            state.questProgress = list.ToArray();
            return entry;
        }

        private static void RemoveProgress(string questId)
        {
            ProgressionSaveState state = TrainerProgressionService.State;
            var list = new List<QuestProgressEntry>(state.questProgress ?? Array.Empty<QuestProgressEntry>());
            list.RemoveAll(e => e.questId == questId);
            state.questProgress = list.ToArray();
        }

        private static bool ContainsKey(string[] keys, string key)
        {
            if (keys == null)
            {
                return false;
            }

            for (int i = 0; i < keys.Length; i++)
            {
                if (keys[i] == key)
                {
                    return true;
                }
            }

            return false;
        }

        private static string[] AppendKey(string[] keys, string key)
        {
            var list = new List<string>(keys ?? Array.Empty<string>()) { key };
            return list.ToArray();
        }

        private static string GetDayKey(double utcNow)
        {
            return DateTimeOffset.FromUnixTimeSeconds((long)utcNow).UtcDateTime.ToString("yyyy-MM-dd");
        }

        private static string GetWeekKey(double utcNow)
        {
            DateTime dt = DateTimeOffset.FromUnixTimeSeconds((long)utcNow).UtcDateTime;
            int week = (dt.DayOfYear - 1) / 7;
            return $"{dt.Year}-W{week:00}";
        }
    }
}
