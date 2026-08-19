using System;
using MonsterCollect.Battle;
using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using MonsterCollect.Ranch;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace MonsterCollect.Ranch
{
    public readonly struct ExplorationStartResult
    {
        public ExplorationStartResult(bool success, string message)
        {
            Success = success;
            Message = message;
        }

        public bool Success { get; }
        public string Message { get; }
    }

    public readonly struct ExplorationReturnResult
    {
        public ExplorationReturnResult(
            bool returned,
            string message,
            int essenceGained = 0,
            int trainerXpGained = 0,
            string resourceGained = null,
            int resourceQuantity = 0,
            string bonusItemGained = null,
            bool wildEncounter = false)
        {
            Returned = returned;
            Message = message;
            EssenceGained = essenceGained;
            TrainerXpGained = trainerXpGained;
            ResourceGained = resourceGained;
            ResourceQuantity = resourceQuantity;
            BonusItemGained = bonusItemGained;
            WildEncounter = wildEncounter;
        }

        public bool Returned { get; }
        public string Message { get; }
        public int EssenceGained { get; }
        public int TrainerXpGained { get; }
        public string ResourceGained { get; }
        public int ResourceQuantity { get; }
        public string BonusItemGained { get; }
        public bool WildEncounter { get; }
    }

    /// <summary>Menu-based zone exploration trips for the active monster.</summary>
    public static class ExplorationService
    {
        public static ExplorationStartResult TryStart(MonsterData monster, string zoneId, double utcNowSeconds)
        {
            if (monster == null)
            {
                return new ExplorationStartResult(false, "Set an active monster first.");
            }

            if (LifespanRetirementService.IsUnavailableForActivities(monster))
            {
                return new ExplorationStartResult(false, LifespanRetirementService.GetUnavailableReason(monster));
            }

            ExplorationZoneEntry zone = RanchCatalogRegistry.ExplorationZones.FindById(zoneId);
            if (zone == null)
            {
                return new ExplorationStartResult(false, "Unknown zone.");
            }

            if (!RanchBiomeService.IsBiomeUnlocked(zone.biomeId))
            {
                return new ExplorationStartResult(false, "Biome not unlocked yet.");
            }

            if (zone.requiredTrainerRankIndex > TrainerProgressionService.RankIndex)
            {
                return new ExplorationStartResult(false, "Trainer rank too low for this zone.");
            }

            MonsterRaisingService.EnsureRaisingState(monster);
            MonsterRaisingState state = monster.Raising;

            if (AdventureService.IsPartyMember(monster.Id))
            {
                return new ExplorationStartResult(false, "Already on an adventure party.");
            }

            if (state.isOnExploration)
            {
                return new ExplorationStartResult(false, "Already exploring.");
            }

            if (state.isOnErrantry)
            {
                return new ExplorationStartResult(false, "Monster is on errantry.");
            }

            if (state.level < zone.minMonsterLevel)
            {
                return new ExplorationStartResult(false, $"Requires monster level {zone.minMonsterLevel}.");
            }

            if (state.energy < 25f)
            {
                return new ExplorationStartResult(false, "Need at least 25 energy.");
            }

            double durationSeconds = zone.durationHours * 3600d / Math.Max(0.01, GameSettings.ErrantryTimeMultiplier);
            state.isOnExploration = true;
            state.explorationZoneId = zoneId;
            state.explorationStartedUtc = utcNowSeconds;
            state.explorationEndsUtc = utcNowSeconds + durationSeconds;
            state.energy = MonsterRaisingService.ClampMeterPublic(state.energy - 15f);
            state.lastSimulatedUtc = utcNowSeconds;

            return new ExplorationStartResult(true, $"{monster.GetDisplayName()} left for {zone.displayName}.");
        }

        public static ExplorationReturnResult ProcessReturn(MonsterData monster, double utcNowSeconds)
        {
            if (monster?.Raising == null || !monster.Raising.isOnExploration)
            {
                return new ExplorationReturnResult(false, string.Empty);
            }

            if (AdventureService.IsPartyMember(monster.Id))
            {
                return new ExplorationReturnResult(false, string.Empty);
            }

            MonsterRaisingState state = monster.Raising;
            if (utcNowSeconds < state.explorationEndsUtc)
            {
                return new ExplorationReturnResult(false, string.Empty);
            }

            ExplorationZoneEntry zone = RanchCatalogRegistry.ExplorationZones.FindById(state.explorationZoneId);
            state.isOnExploration = false;
            state.explorationZoneId = string.Empty;

            if (zone == null)
            {
                return new ExplorationReturnResult(true, "Returned from exploration.");
            }

            var rng = new System.Random(MonsterProceduralTraits.SeedFromInt(
                monster.DexNumber + (int)state.explorationStartedUtc + zone.zoneId.GetHashCode()));

            float rewardMul = WorldCycleService.GetExplorationRewardMultiplier();
            rewardMul *= 1f + RanchCustomizationService.GetErrantryRewardBonus();

            int essence = (int)Math.Round(
                rng.Next(zone.minEssence, zone.maxEssence + 1) * rewardMul);
            int trainerXp = (int)Math.Round(
                rng.Next(zone.minTrainerXp, zone.maxTrainerXp + 1) * rewardMul);

            string resourceId = null;
            int resourceQty = 0;
            if (zone.resourceItemIds != null &&
                zone.resourceItemIds.Length > 0 &&
                rng.NextDouble() <= zone.resourceDropChance * rewardMul)
            {
                resourceId = zone.resourceItemIds[rng.Next(zone.resourceItemIds.Length)];
                resourceQty = rng.Next(zone.minResourceAmount, zone.maxResourceAmount + 1);
                PlayerInventoryService.AddItem(resourceId, resourceQty);
            }

            string bonusItem = null;
            if (zone.bonusItemIds != null &&
                zone.bonusItemIds.Length > 0 &&
                rng.NextDouble() <= zone.bonusItemChance * rewardMul)
            {
                bonusItem = zone.bonusItemIds[rng.Next(zone.bonusItemIds.Length)];
                PlayerInventoryService.AddItem(bonusItem, 1);
            }

            float wildChance = zone.wildEncounterChance * WorldCycleService.GetWildEncounterMultiplier();
            bool wildEncounter = rng.NextDouble() <= wildChance;
            if (wildEncounter)
            {
                QueueWildBattle(zone, monster.Id);
            }

            state.mood = MonsterRaisingService.ClampMeterPublic(state.mood + 5f);
            state.fatigue = MonsterRaisingService.ClampMeterPublic(state.fatigue + 8f);
            state.lastSimulatedUtc = utcNowSeconds;

            if (essence > 0)
            {
                MonsterCollectionService.AddEssence(essence);
            }

            if (trainerXp > 0)
            {
                TrainerProgressionService.AddTrainerXp(trainerXp);
            }

            RanchProgressionService.AddCarePoints(1);
            ProgressionEventReporter.ReportExplorationComplete(zone.zoneId);

            string message = $"{monster.GetDisplayName()} returned from {zone.displayName}.";
            if (resourceId != null)
            {
                message += $" Gathered {resourceQty}x {resourceId.Replace("mat_", "")}.";
            }

            if (bonusItem != null)
            {
                message += $" Found {bonusItem}!";
            }

            if (wildEncounter)
            {
                message += " A wild monster appeared!";
            }

            return new ExplorationReturnResult(
                true,
                message,
                essence,
                trainerXp,
                resourceId,
                resourceQty,
                bonusItem,
                wildEncounter);
        }

        public static double GetRemainingSeconds(MonsterData monster, double utcNowSeconds)
        {
            if (monster?.Raising == null || !monster.Raising.isOnExploration)
            {
                return 0d;
            }

            return Math.Max(0d, monster.Raising.explorationEndsUtc - utcNowSeconds);
        }

        public static bool HasPendingWildBattle => MonsterCollectionService.ExplorationState?.hasPendingWildBattle ?? false;

        public static bool TryConsumePendingWildBattle(out string zoneId, out int opponentLevel, out string playerMonsterId)
        {
            zoneId = string.Empty;
            opponentLevel = 1;
            playerMonsterId = string.Empty;
            ExplorationSaveState state = MonsterCollectionService.ExplorationState;
            if (state == null || !state.hasPendingWildBattle)
            {
                return false;
            }

            zoneId = state.pendingWildBattleZoneId;
            opponentLevel = state.pendingWildOpponentLevel;
            playerMonsterId = state.pendingWildMonsterId;
            state.hasPendingWildBattle = false;
            state.pendingWildBattleZoneId = string.Empty;
            state.pendingWildOpponentLevel = 0;
            state.pendingWildMonsterId = string.Empty;
            MonsterCollectionService.SaveExploration();
            return true;
        }

        public static bool TryLaunchPendingWildBattle(out string message)
        {
            message = string.Empty;
            ExplorationSaveState state = MonsterCollectionService.ExplorationState;
            if (state == null || !state.hasPendingWildBattle)
            {
                message = "No wild encounter waiting.";
                return false;
            }

            string zoneId = state.pendingWildBattleZoneId;
            int opponentLevel = state.pendingWildOpponentLevel;
            string playerMonsterId = state.pendingWildMonsterId;

            MonsterData player = MonsterCollectionService.FindById(playerMonsterId)
                ?? MonsterCollectionService.ActiveMonster;
            if (player == null)
            {
                message = "Set an active monster to fight the wild encounter.";
                return false;
            }

            state.hasPendingWildBattle = false;
            state.pendingWildBattleZoneId = string.Empty;
            state.pendingWildOpponentLevel = 0;
            state.pendingWildMonsterId = string.Empty;
            MonsterCollectionService.SaveExploration();

            int seed = zoneId.GetHashCode() ^ opponentLevel ^ player.DexNumber;
            ExplorationZoneEntry zone = RanchCatalogRegistry.ExplorationZones.FindById(zoneId);
            MonsterData wild = WildMonsterFactory.CreateWildForRegion(seed, opponentLevel, zone?.biomeId);
            BattleSession.ConfigureExplorationWild(player.Id, wild);
            SceneManager.LoadScene(GameScenes.Battle);
            message = $"A wild {wild.Name} appeared!";
            return true;
        }

        private static void QueueWildBattle(ExplorationZoneEntry zone, string monsterId)
        {
            MonsterCollectionService.EnsureExplorationLoaded();
            ExplorationSaveState state = MonsterCollectionService.ExplorationState;
            state.hasPendingWildBattle = true;
            state.pendingWildBattleZoneId = zone.zoneId;
            state.pendingWildOpponentLevel = zone.wildOpponentLevel;
            state.pendingWildMonsterId = monsterId;
            MonsterCollectionService.SaveExploration();
        }
    }
}
