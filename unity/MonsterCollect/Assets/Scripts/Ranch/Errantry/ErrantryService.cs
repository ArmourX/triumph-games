using System;
using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Progression;

namespace MonsterCollect.Ranch
{
    public readonly struct ErrantryStartResult
    {
        public bool Success { get; }
        public string Message { get; }

        public ErrantryStartResult(bool success, string message)
        {
            Success = success;
            Message = message;
        }
    }

    public readonly struct ErrantryReturnResult
    {
        public bool Returned { get; }
        public string Message { get; }
        public int EssenceGained { get; }
        public int CarePointsGained { get; }
        public string ItemGained { get; }
        public string MoveLearned { get; }
        public bool WasInjured { get; }

        public ErrantryReturnResult(
            bool returned,
            string message,
            int essenceGained = 0,
            int carePointsGained = 0,
            string itemGained = null,
            string moveLearned = null,
            bool wasInjured = false)
        {
            Returned = returned;
            Message = message;
            EssenceGained = essenceGained;
            CarePointsGained = carePointsGained;
            ItemGained = itemGained;
            MoveLearned = moveLearned;
            WasInjured = wasInjured;
        }
    }

    /// <summary>Send active monster on timed expeditions.</summary>
    public static class ErrantryService
    {
        public static ErrantryStartResult TryStart(MonsterData monster, string missionId, double utcNowSeconds)
        {
            if (monster == null)
            {
                return new ErrantryStartResult(false, "No active monster.");
            }

            if (LifespanRetirementService.IsUnavailableForActivities(monster))
            {
                return new ErrantryStartResult(false, LifespanRetirementService.GetUnavailableReason(monster));
            }

            ErrantryMissionDefinition mission = RanchCatalogRegistry.Errantry.FindById(missionId);
            if (mission == null)
            {
                return new ErrantryStartResult(false, "Unknown mission.");
            }

            MonsterRaisingService.EnsureRaisingState(monster);
            MonsterRaisingState state = monster.Raising;

            if (state.isOnErrantry)
            {
                return new ErrantryStartResult(false, "Already on errantry.");
            }

            if (state.isOnExploration)
            {
                return new ErrantryStartResult(false, "Monster is exploring a zone.");
            }

            if (state.level < mission.MinLevel)
            {
                return new ErrantryStartResult(false, $"Requires level {mission.MinLevel}.");
            }

            if (state.energy < 30f)
            {
                return new ErrantryStartResult(false, "Monster needs at least 30 energy.");
            }

            double durationSeconds = mission.DurationHours * 3600d / Math.Max(0.01, GameSettings.ErrantryTimeMultiplier);
            state.isOnErrantry = true;
            state.errantryMissionId = missionId;
            state.errantryStartedUtc = utcNowSeconds;
            state.errantryEndsUtc = utcNowSeconds + durationSeconds;
            state.errantryInjurySeverity = 0;
            state.energy = MonsterRaisingService.ClampMeterPublic(state.energy - 20f);
            state.lastSimulatedUtc = utcNowSeconds;

            return new ErrantryStartResult(true, $"{monster.Name} departed on {mission.DisplayName}.");
        }

        public static ErrantryReturnResult ProcessReturn(MonsterData monster, double utcNowSeconds)
        {
            if (monster?.Raising == null || !monster.Raising.isOnErrantry)
            {
                return new ErrantryReturnResult(false, string.Empty);
            }

            MonsterRaisingState state = monster.Raising;

            if (utcNowSeconds < state.errantryEndsUtc)
            {
                return new ErrantryReturnResult(false, string.Empty);
            }

            ErrantryMissionDefinition mission = RanchCatalogRegistry.Errantry.FindById(state.errantryMissionId);
            state.isOnErrantry = false;

            if (mission == null)
            {
                state.errantryMissionId = string.Empty;
                return new ErrantryReturnResult(true, "Returned from errantry.");
            }

            var rng = new Random(MonsterProceduralTraits.SeedFromInt(
                monster.DexNumber + (int)state.errantryStartedUtc));

            float rewardBonus = 1f + RanchCustomizationService.GetErrantryRewardBonus();
            float personalityBonus = MonsterPersonalityService.Resolve(monster) == MonsterPersonality.Curious ? 1.15f : 1f;
            rewardBonus *= WorldCycleService.GetExplorationRewardMultiplier();

            int essence = (int)Math.Round(
                rng.Next(mission.MinEssence, mission.MaxEssence + 1) * rewardBonus * personalityBonus);
            int carePoints = (int)Math.Round(
                rng.Next(mission.MinCarePoints, mission.MaxCarePoints + 1) * rewardBonus);

            string itemId = null;
            if (mission.PossibleItemIds != null &&
                mission.PossibleItemIds.Length > 0 &&
                rng.NextDouble() <= mission.ItemDropChance * rewardBonus)
            {
                itemId = mission.PossibleItemIds[rng.Next(mission.PossibleItemIds.Length)];
                PlayerInventoryService.AddItem(itemId, 1);
            }

            string moveLearned = null;
            float learnChance = mission.MoveLearnChance * personalityBonus;
            if (!string.IsNullOrEmpty(mission.MoveToLearn) &&
                rng.NextDouble() <= learnChance &&
                RanchFacilityService.TryLearnMove(monster, mission.MoveToLearn))
            {
                moveLearned = mission.MoveToLearn;
            }

            bool injured = rng.NextDouble() <= mission.InjuryChance;
            if (injured)
            {
                state.errantryInjurySeverity = rng.Next(1, 4);
                state.mood = MonsterRaisingService.ClampMeterPublic(state.mood - mission.MoodPenaltyOnInjury);
                state.energy = MonsterRaisingService.ClampMeterPublic(state.energy - mission.EnergyDrainOnReturn);
                state.fatigue = MonsterRaisingService.ClampMeterPublic(state.fatigue + 15f * state.errantryInjurySeverity);
            }
            else
            {
                state.mood = MonsterRaisingService.ClampMeterPublic(state.mood + 8f);
                state.errantryInjurySeverity = 0;
            }

            state.energy = MonsterRaisingService.ClampMeterPublic(state.energy - mission.EnergyDrainOnReturn * 0.5f);
            state.lastSimulatedUtc = utcNowSeconds;
            state.errantryMissionId = string.Empty;

            if (essence > 0)
            {
                MonsterCollectionService.AddEssence(essence);
            }

            if (carePoints > 0)
            {
                RanchProgressionService.AddCarePoints(carePoints);
            }

            ProgressionEventReporter.ReportErrantryComplete();

            string message = injured
                ? $"{monster.Name} returned injured from {mission.DisplayName}."
                : $"{monster.Name} returned safely from {mission.DisplayName}.";

            if (moveLearned != null)
            {
                message += $" Learned {moveLearned}!";
            }

            return new ErrantryReturnResult(true, message, essence, carePoints, itemId, moveLearned, injured);
        }

        public static double GetRemainingSeconds(MonsterData monster, double utcNowSeconds)
        {
            if (monster?.Raising == null || !monster.Raising.isOnErrantry)
            {
                return 0d;
            }

            return Math.Max(0d, monster.Raising.errantryEndsUtc - utcNowSeconds);
        }

        public static string FormatRemainingTime(double seconds)
        {
            if (seconds <= 0d)
            {
                return "Ready to return";
            }

            var span = TimeSpan.FromSeconds(seconds);
            if (span.TotalHours >= 1d)
            {
                return $"{(int)span.TotalHours}h {span.Minutes}m left";
            }

            if (span.TotalMinutes >= 1d)
            {
                return $"{span.Minutes}m {span.Seconds}s left";
            }

            return $"{span.Seconds}s left";
        }
    }
}
