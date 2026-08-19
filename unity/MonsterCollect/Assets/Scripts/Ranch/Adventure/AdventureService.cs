using System;
using System.Collections.Generic;
using System.Text;
using MonsterCollect.Battle;
using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace MonsterCollect.Ranch
{
    public readonly struct AdventureDepartResult
    {
        public AdventureDepartResult(bool success, string message)
        {
            Success = success;
            Message = message;
        }

        public bool Success { get; }
        public string Message { get; }
    }

    /// <summary>Party adventures (1–3 monsters) with offline timers, logs, events, and wild encounters.</summary>
    public static class AdventureService
    {
        public const int MaxParty = 3;
        public const int MaxLogLines = 24;

        public static AdventurePartyState Party
        {
            get
            {
                EnsureReady();
                ExplorationSaveState state = MonsterCollectionService.ExplorationState;
                state.party ??= new AdventurePartyState();
                return state.party;
            }
        }

        public static void EnsureReady()
        {
            MonsterCollectionService.EnsureExplorationLoaded();
            ExplorationSaveState state = MonsterCollectionService.ExplorationState;
            state.party ??= new AdventurePartyState();
            state.completedStoryBeatIds ??= Array.Empty<string>();
            state.adventureLog ??= Array.Empty<string>();
        }

        public static bool IsPartyMember(string monsterId)
        {
            if (string.IsNullOrEmpty(monsterId))
            {
                return false;
            }

            AdventurePartyState party = Party;
            if (!party.isActive || party.monsterIds == null)
            {
                return false;
            }

            for (int i = 0; i < party.monsterIds.Length; i++)
            {
                if (party.monsterIds[i] == monsterId)
                {
                    return true;
                }
            }

            return false;
        }

        public static double GetRemainingSeconds(double utcNow)
        {
            AdventurePartyState party = Party;
            if (!party.isActive)
            {
                return 0d;
            }

            return Math.Max(0d, party.endsUtc - utcNow);
        }

        public static IReadOnlyList<string> GetLog()
        {
            EnsureReady();
            return MonsterCollectionService.ExplorationState.adventureLog ?? Array.Empty<string>();
        }

        public static AdventureDepartResult TryDepart(IReadOnlyList<string> monsterIds, string zoneId, double utcNow)
        {
            EnsureReady();
            AdventurePartyState party = Party;
            if (party.isActive)
            {
                return new AdventureDepartResult(false, "A party is already away.");
            }

            ExplorationZoneEntry zone = RanchCatalogRegistry.ExplorationZones.FindById(zoneId);
            if (zone == null)
            {
                return new AdventureDepartResult(false, "Unknown region.");
            }

            if (!RanchBiomeService.IsBiomeUnlocked(zone.biomeId) &&
                !AdventureStoryService.IsBiomeUnlockedByStory(zone.biomeId))
            {
                return new AdventureDepartResult(false, "That region is still sealed.");
            }

            if (zone.requiredTrainerRankIndex > TrainerProgressionService.RankIndex &&
                !AdventureStoryService.IsBiomeUnlockedByStory(zone.biomeId))
            {
                return new AdventureDepartResult(false, "Trainer rank too low.");
            }

            var partyMonsters = new List<MonsterData>();
            if (monsterIds != null)
            {
                for (int i = 0; i < monsterIds.Count && partyMonsters.Count < MaxParty; i++)
                {
                    MonsterData monster = MonsterCollectionService.FindById(monsterIds[i]);
                    if (monster == null || Contains(partyMonsters, monster.Id))
                    {
                        continue;
                    }

                    MonsterRaisingService.EnsureRaisingState(monster);
                    if (LifespanRetirementService.IsUnavailableForActivities(monster) ||
                        monster.Raising.isOnErrantry ||
                        monster.Raising.isOnExploration)
                    {
                        return new AdventureDepartResult(false, $"{monster.GetDisplayName()} cannot leave right now.");
                    }

                    if (monster.Raising.level < zone.minMonsterLevel)
                    {
                        return new AdventureDepartResult(false, $"{monster.GetDisplayName()} is below Lv {zone.minMonsterLevel}.");
                    }

                    if (monster.Raising.energy < 20f)
                    {
                        return new AdventureDepartResult(false, $"{monster.GetDisplayName()} is too tired.");
                    }

                    partyMonsters.Add(monster);
                }
            }

            if (partyMonsters.Count == 0)
            {
                return new AdventureDepartResult(false, "Pick 1–3 ranch monsters.");
            }

            double durationSeconds = zone.durationHours * 3600d / Math.Max(0.01, GameSettings.ErrantryTimeMultiplier);
            var ids = new string[partyMonsters.Count];
            for (int i = 0; i < partyMonsters.Count; i++)
            {
                MonsterData monster = partyMonsters[i];
                ids[i] = monster.Id;
                monster.Raising.isOnExploration = true;
                monster.Raising.explorationZoneId = zone.zoneId;
                monster.Raising.explorationStartedUtc = utcNow;
                monster.Raising.explorationEndsUtc = utcNow + durationSeconds;
                monster.Raising.energy = MonsterRaisingService.ClampMeterPublic(monster.Raising.energy - 12f);
                MonsterCollectionService.UpdateMonster(monster);
            }

            party.isActive = true;
            party.monsterIds = ids;
            party.zoneId = zone.zoneId;
            party.biomeId = zone.biomeId;
            party.startedUtc = utcNow;
            party.endsUtc = utcNow + durationSeconds;
            party.hasPendingEncounter = false;
            party.lastTripResolved = false;
            party.lastResultSummary = string.Empty;
            ClearLog();
            AppendLog($"Departed for {zone.displayName} with {ids.Length} monster(s).");
            AppendLog($"ETA {ErrantryService.FormatRemainingTime(durationSeconds)}.");
            MonsterCollectionService.SaveExploration();
            return new AdventureDepartResult(true, $"Party left for {zone.displayName}.");
        }

        public static bool ProcessDue(double utcNow)
        {
            AdventurePartyState party = Party;
            if (!party.isActive || utcNow < party.endsUtc)
            {
                return false;
            }

            ResolveTrip(utcNow);
            return true;
        }

        public static string CheckStatus(double utcNow)
        {
            ProcessDue(utcNow);
            AdventurePartyState party = Party;
            if (party.isActive)
            {
                return ErrantryService.FormatRemainingTime(GetRemainingSeconds(utcNow));
            }

            if (!string.IsNullOrEmpty(party.lastResultSummary))
            {
                return party.lastResultSummary;
            }

            return "No party is currently away.";
        }

        public static bool TryAutoResolveEncounter(out string message)
        {
            message = string.Empty;
            AdventurePartyState party = Party;
            if (!party.hasPendingEncounter)
            {
                message = "No wild encounter waiting.";
                return false;
            }

            MonsterData player = MonsterCollectionService.FindById(party.pendingPlayerMonsterId)
                ?? FirstPartyMonster();
            if (player == null)
            {
                message = "No fighter available.";
                return false;
            }

            MonsterData wild = WildMonsterFactory.CreateWildForRegion(
                party.pendingEncounterSeed,
                party.pendingOpponentLevel,
                party.biomeId);

            var rng = new System.Random(party.pendingEncounterSeed ^ 917);
            int playerScore = player.Attack + player.Speed / 2 + (player.Raising?.level ?? 1) * 3 + rng.Next(0, 12);
            int wildScore = wild.Attack + wild.Speed / 2 + wild.Raising.level * 3 + rng.Next(0, 12);
            bool won = playerScore >= wildScore;

            MonsterRaisingService.EnsureRaisingState(player);
            if (won)
            {
                player.Raising.battleExperience += 10 + party.pendingOpponentLevel;
                player.Raising.battleWins++;
                player.Raising.trainingPoints += 1;
                AppendLog($"Auto-battle: {player.GetDisplayName()} beat {wild.Name}.");
                message = $"{player.GetDisplayName()} won the wild fight!";
            }
            else
            {
                player.Raising.battleLosses++;
                player.Raising.fatigue = MonsterRaisingService.ClampMeterPublic(player.Raising.fatigue + 10f);
                if (rng.NextDouble() < 0.35d)
                {
                    player.Raising.errantryInjurySeverity = Math.Max(player.Raising.errantryInjurySeverity, 1);
                    AppendLog($"{player.GetDisplayName()} was injured in the skirmish.");
                }

                AppendLog($"Auto-battle: {wild.Name} drove the party back.");
                message = $"{player.GetDisplayName()} lost the skirmish.";
            }

            ClearPendingEncounter();
            MonsterCollectionService.UpdateMonster(player);
            MonsterCollectionService.SaveExploration();
            return true;
        }

        public static bool TryLaunchEncounterBattle(out string message)
        {
            message = string.Empty;
            AdventurePartyState party = Party;
            if (!party.hasPendingEncounter)
            {
                message = "No wild encounter waiting.";
                return false;
            }

            MonsterData player = MonsterCollectionService.FindById(party.pendingPlayerMonsterId)
                ?? FirstPartyMonster();
            if (player == null)
            {
                message = "Pick a ranch fighter first.";
                return false;
            }

            MonsterData wild = WildMonsterFactory.CreateWildForRegion(
                party.pendingEncounterSeed,
                party.pendingOpponentLevel,
                party.biomeId);
            ClearPendingEncounter();
            MonsterCollectionService.SaveExploration();
            BattleSession.ConfigureExplorationWild(player.Id, wild);
            SceneManager.LoadScene(GameScenes.Battle);
            message = $"A wild {wild.Name} appeared!";
            return true;
        }

        private static void ResolveTrip(double utcNow)
        {
            AdventurePartyState party = Party;
            ExplorationZoneEntry zone = RanchCatalogRegistry.ExplorationZones.FindById(party.zoneId);
            List<MonsterData> members = LoadPartyMonsters();
            if (zone == null || members.Count == 0)
            {
                FinishParty(utcNow, "The party returned.");
                return;
            }

            int seed = MonsterProceduralTraits.SeedFromInt(
                zone.zoneId.GetHashCode() + (int)party.startedUtc + members.Count);
            var rng = new System.Random(seed);

            float rewardMul = WorldCycleService.GetExplorationRewardMultiplier();
            rewardMul *= 1f + RanchCustomizationService.GetErrantryRewardBonus();

            int essence = (int)Math.Round(rng.Next(zone.minEssence, zone.maxEssence + 1) * rewardMul * (0.7f + members.Count * 0.2f));
            int trainerXp = (int)Math.Round(rng.Next(zone.minTrainerXp, zone.maxTrainerXp + 1) * rewardMul);
            int training = rng.Next(zone.minTrainingPoints, Math.Max(zone.minTrainingPoints, zone.maxTrainingPoints) + 1);
            bool injured = false;
            bool blessing = false;
            var summary = new StringBuilder();
            summary.Append($"Returned from {zone.displayName}. ");

            if (rng.NextDouble() <= zone.eventChance)
            {
                AdventureEventEntry ev = RollEvent(zone.biomeId, rng);
                if (ev != null)
                {
                    ApplyEvent(ev, members, rng);
                    AppendLog(ev.logText);
                    summary.Append(ev.displayName).Append(". ");
                    blessing |= ev.kind == AdventureEventKind.Blessing;
                    injured |= ev.kind == AdventureEventKind.Injury;
                    if (ev.kind == AdventureEventKind.Wild)
                    {
                        QueueEncounter(zone, members[0].Id, seed ^ 33);
                    }
                }
            }

            if (zone.resourceItemIds != null &&
                zone.resourceItemIds.Length > 0 &&
                rng.NextDouble() <= zone.resourceDropChance * rewardMul)
            {
                string resourceId = zone.resourceItemIds[rng.Next(zone.resourceItemIds.Length)];
                int qty = rng.Next(zone.minResourceAmount, zone.maxResourceAmount + 1) + (members.Count - 1);
                PlayerInventoryService.AddItem(resourceId, qty);
                AppendLog($"Found {qty}x {FormatItem(resourceId)}.");
                summary.Append($"+{qty} {FormatItem(resourceId)}. ");
            }

            if (zone.bonusItemIds != null &&
                zone.bonusItemIds.Length > 0 &&
                rng.NextDouble() <= zone.bonusItemChance * rewardMul)
            {
                string bonus = zone.bonusItemIds[rng.Next(zone.bonusItemIds.Length)];
                PlayerInventoryService.AddItem(bonus, 1);
                AppendLog($"Rare find: {FormatItem(bonus)}!");
                summary.Append($"Found {FormatItem(bonus)}. ");
            }

            float wildChance = zone.wildEncounterChance * WorldCycleService.GetWildEncounterMultiplier();
            if (!party.hasPendingEncounter && rng.NextDouble() <= wildChance)
            {
                QueueEncounter(zone, members[0].Id, seed ^ 91);
                AppendLog("A wild monster blocked the trail!");
                summary.Append("Wild encounter! ");
            }

            if (rng.NextDouble() <= zone.injuryChance)
            {
                MonsterData victim = members[rng.Next(members.Count)];
                victim.Raising.errantryInjurySeverity = Math.Max(victim.Raising.errantryInjurySeverity, 1);
                injured = true;
                AppendLog($"{victim.GetDisplayName()} came back injured.");
            }

            for (int i = 0; i < members.Count; i++)
            {
                MonsterData monster = members[i];
                monster.Raising.battleExperience += 6 + zone.recommendedLevel;
                monster.Raising.trainingPoints += training;
                monster.Raising.mood = MonsterRaisingService.ClampMeterPublic(monster.Raising.mood + 4f);
                monster.Raising.fatigue = MonsterRaisingService.ClampMeterPublic(monster.Raising.fatigue + 7f + members.Count);
                monster.Raising.isOnExploration = false;
                monster.Raising.explorationZoneId = string.Empty;
                monster.Raising.lastSimulatedUtc = utcNow;
                MonsterCollectionService.UpdateMonster(monster);
            }

            if (essence > 0)
            {
                MonsterCollectionService.AddEssence(essence);
            }

            if (trainerXp > 0)
            {
                TrainerProgressionService.AddTrainerXp(trainerXp);
            }

            RanchProgressionService.AddCarePoints(members.Count);
            ProgressionEventReporter.ReportExplorationComplete(zone.zoneId);
            AdventureStoryService.OnAdventureComplete(zone);

            party.lastEssence = essence;
            party.lastTrainingPoints = training;
            party.lastInjured = injured;
            party.lastBlessing = blessing;
            party.lastTripResolved = true;
            party.lastResultSummary = summary.ToString().Trim();
            party.isActive = false;
            party.monsterIds = Array.Empty<string>();
            party.zoneId = string.Empty;
            AppendLog(party.lastResultSummary);
            MonsterCollectionService.SaveExploration();
        }

        private static void ApplyEvent(AdventureEventEntry ev, List<MonsterData> members, System.Random rng)
        {
            if (!string.IsNullOrEmpty(ev.itemId) && ev.itemAmount > 0)
            {
                PlayerInventoryService.AddItem(ev.itemId, ev.itemAmount);
            }

            for (int i = 0; i < members.Count; i++)
            {
                MonsterData monster = members[i];
                if (ev.trainingPoints > 0)
                {
                    monster.Raising.trainingPoints += ev.trainingPoints;
                }

                if (ev.battleXp > 0)
                {
                    monster.Raising.battleExperience += ev.battleXp;
                }

                monster.Raising.fatigue = MonsterRaisingService.ClampMeterPublic(monster.Raising.fatigue + ev.fatigueDelta);
                monster.Raising.mood = MonsterRaisingService.ClampMeterPublic(monster.Raising.mood + ev.moodDelta);
                if (ev.injurySeverity > 0 && rng.NextDouble() < 0.5d)
                {
                    monster.Raising.errantryInjurySeverity = Math.Max(monster.Raising.errantryInjurySeverity, ev.injurySeverity);
                }
            }
        }

        private static AdventureEventEntry RollEvent(string biomeId, System.Random rng)
        {
            AdventureEventEntry[] all = RanchCatalogRegistry.AdventureEvents.Events;
            if (all == null || all.Length == 0)
            {
                return null;
            }

            int total = 0;
            for (int i = 0; i < all.Length; i++)
            {
                if (EventFits(all[i], biomeId))
                {
                    total += Math.Max(1, all[i].weight);
                }
            }

            if (total <= 0)
            {
                return null;
            }

            int roll = rng.Next(total);
            for (int i = 0; i < all.Length; i++)
            {
                if (!EventFits(all[i], biomeId))
                {
                    continue;
                }

                roll -= Math.Max(1, all[i].weight);
                if (roll < 0)
                {
                    return all[i];
                }
            }

            return all[0];
        }

        private static bool EventFits(AdventureEventEntry ev, string biomeId)
        {
            return ev != null && (string.IsNullOrEmpty(ev.biomeId) || ev.biomeId == biomeId);
        }

        private static void QueueEncounter(ExplorationZoneEntry zone, string monsterId, int seed)
        {
            AdventurePartyState party = Party;
            party.hasPendingEncounter = true;
            party.pendingOpponentLevel = zone.wildOpponentLevel;
            party.pendingEncounterSeed = seed;
            party.pendingPlayerMonsterId = monsterId;

            MonsterCollectionService.EnsureExplorationLoaded();
            ExplorationSaveState state = MonsterCollectionService.ExplorationState;
            state.hasPendingWildBattle = true;
            state.pendingWildBattleZoneId = zone.zoneId;
            state.pendingWildOpponentLevel = zone.wildOpponentLevel;
            state.pendingWildMonsterId = monsterId;
        }

        private static void ClearPendingEncounter()
        {
            AdventurePartyState party = Party;
            party.hasPendingEncounter = false;
            party.pendingPlayerMonsterId = string.Empty;
            ExplorationSaveState state = MonsterCollectionService.ExplorationState;
            state.hasPendingWildBattle = false;
            state.pendingWildBattleZoneId = string.Empty;
            state.pendingWildOpponentLevel = 0;
            state.pendingWildMonsterId = string.Empty;
        }

        private static void FinishParty(double utcNow, string message)
        {
            List<MonsterData> members = LoadPartyMonsters();
            for (int i = 0; i < members.Count; i++)
            {
                members[i].Raising.isOnExploration = false;
                members[i].Raising.explorationZoneId = string.Empty;
                members[i].Raising.lastSimulatedUtc = utcNow;
                MonsterCollectionService.UpdateMonster(members[i]);
            }

            AdventurePartyState party = Party;
            party.isActive = false;
            party.monsterIds = Array.Empty<string>();
            party.lastResultSummary = message;
            AppendLog(message);
            MonsterCollectionService.SaveExploration();
        }

        private static List<MonsterData> LoadPartyMonsters()
        {
            var list = new List<MonsterData>();
            string[] ids = Party.monsterIds ?? Array.Empty<string>();
            for (int i = 0; i < ids.Length; i++)
            {
                MonsterData monster = MonsterCollectionService.FindById(ids[i]);
                if (monster != null)
                {
                    MonsterRaisingService.EnsureRaisingState(monster);
                    list.Add(monster);
                }
            }

            return list;
        }

        private static MonsterData FirstPartyMonster()
        {
            List<MonsterData> members = LoadPartyMonsters();
            return members.Count > 0 ? members[0] : MonsterCollectionService.ActiveMonster;
        }

        private static bool Contains(List<MonsterData> list, string id)
        {
            for (int i = 0; i < list.Count; i++)
            {
                if (list[i].Id == id)
                {
                    return true;
                }
            }

            return false;
        }

        public static void AppendLog(string line)
        {
            EnsureReady();
            ExplorationSaveState state = MonsterCollectionService.ExplorationState;
            var lines = new List<string>(state.adventureLog ?? Array.Empty<string>())
            {
                $"[{DateTime.Now:HH:mm}] {line}"
            };

            if (lines.Count > MaxLogLines)
            {
                lines.RemoveRange(0, lines.Count - MaxLogLines);
            }

            state.adventureLog = lines.ToArray();
        }

        private static void ClearLog()
        {
            MonsterCollectionService.ExplorationState.adventureLog = Array.Empty<string>();
        }

        private static string FormatItem(string itemId)
        {
            if (string.IsNullOrEmpty(itemId))
            {
                return "item";
            }

            RanchItemDefinition def = RanchCatalogRegistry.Items?.FindById(itemId);
            return def != null ? def.DisplayName : itemId.Replace("mat_", string.Empty);
        }
    }
}
