using System;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Progression;

namespace MonsterCollect.Ranch
{
    public readonly struct FacilityUseResult
    {
        public bool Success { get; }
        public string Message { get; }
        public int AttackDelta { get; }
        public int DefenseDelta { get; }
        public int SpeedDelta { get; }
        public string LearnedMoveId { get; }

        public FacilityUseResult(
            bool success,
            string message,
            int attackDelta = 0,
            int defenseDelta = 0,
            int speedDelta = 0,
            string learnedMoveId = null)
        {
            Success = success;
            Message = message;
            AttackDelta = attackDelta;
            DefenseDelta = defenseDelta;
            SpeedDelta = speedDelta;
            LearnedMoveId = learnedMoveId;
        }

        public static FacilityUseResult Fail(string message) => new FacilityUseResult(false, message);
    }

    /// <summary>Gym, Spa, and Library facility sessions.</summary>
    public static class RanchFacilityService
    {
        public static FacilityUseResult TryUse(string facilityId, MonsterData monster, double utcNowSeconds)
        {
            if (monster == null)
            {
                return FacilityUseResult.Fail("No active monster.");
            }

            if (LifespanRetirementService.IsUnavailableForActivities(monster))
            {
                return FacilityUseResult.Fail(LifespanRetirementService.GetUnavailableReason(monster));
            }

            RanchFacilityDefinition facility = RanchCatalogRegistry.Facilities.FindById(facilityId);
            if (facility == null)
            {
                return FacilityUseResult.Fail("Unknown facility.");
            }

            if (!RanchProgressionService.IsFacilityUnlocked(facilityId))
            {
                return FacilityUseResult.Fail($"{facility.DisplayName} is not unlocked yet.");
            }

            MonsterRaisingService.EnsureRaisingState(monster);
            MonsterRaisingService.SimulateElapsedTime(monster, utcNowSeconds);
            MonsterRaisingService.ResetDailyCountersIfNeededPublic(monster.Raising, utcNowSeconds);

            int usesToday = GetUsesToday(monster.Raising, facility.Kind);
            if (usesToday >= facility.MaxUsesPerDay)
            {
                return FacilityUseResult.Fail($"{facility.DisplayName} limit reached today.");
            }

            MonsterRaisingState state = monster.Raising;

            if (state.energy < facility.EnergyCost)
            {
                return FacilityUseResult.Fail("Not enough energy.");
            }

            state.energy = MonsterRaisingService.ClampMeterPublic(state.energy - facility.EnergyCost);
            state.hunger = MonsterRaisingService.ClampMeterPublic(state.hunger - facility.HungerCost);
            state.fatigue = MonsterRaisingService.ClampMeterPublic(state.fatigue + facility.FatigueCost - facility.FatigueRelief);
            state.mood = MonsterRaisingService.ClampMeterPublic(state.mood + facility.MoodGain);
            state.lifespan = MonsterRaisingService.ClampMeterPublic(state.lifespan + facility.LifespanRestore);

            IncrementUses(state, facility.Kind);

            int attackGain = 0;
            int defenseGain = 0;
            int speedGain = 0;
            string learnedMove = null;

            TrainingFocus focus = facility.Kind switch
            {
                RanchFacilityKind.Gym => TrainingFocus.Strength,
                RanchFacilityKind.Library => TrainingFocus.Intelligence,
                _ => TrainingFocus.Defense
            };

            float success = MonsterPersonalityService.GetTrainingMultiplier(monster, focus);

            if (facility.Kind == RanchFacilityKind.Gym)
            {
                if (RollSuccess(success))
                {
                    attackGain = facility.AttackGain;
                    defenseGain = facility.DefenseGain;
                    monster.Attack += attackGain;
                    monster.Defense += defenseGain;
                }
            }
            else if (facility.Kind == RanchFacilityKind.Spa)
            {
                state.fatigue = MonsterRaisingService.ClampMeterPublic(state.fatigue - facility.FatigueRelief);
            }
            else if (facility.Kind == RanchFacilityKind.Library)
            {
                float learnChance = facility.MoveLearnChance * success;
                if (!string.IsNullOrEmpty(facility.MoveToTeach) &&
                    RollChance(learnChance, monster, utcNowSeconds) &&
                    TryLearnMove(monster, facility.MoveToTeach))
                {
                    learnedMove = facility.MoveToTeach;
                }
            }

            state.lastSimulatedUtc = utcNowSeconds;
            RanchProgressionService.AddCarePoints(2);
            ProgressionEventReporter.ReportFacilityUsed();

            string message = learnedMove != null
                ? $"{facility.DisplayName}: learned {learnedMove}!"
                : attackGain > 0
                    ? $"{facility.DisplayName}: +{attackGain} ATK, +{defenseGain} DEF."
                    : $"{facility.DisplayName} session complete.";

            return new FacilityUseResult(true, message, attackGain, defenseGain, speedGain, learnedMove);
        }

        public static int GetUsesToday(MonsterRaisingState state, RanchFacilityKind kind)
        {
            return kind switch
            {
                RanchFacilityKind.Gym => state.gymUsesToday,
                RanchFacilityKind.Spa => state.spaUsesToday,
                RanchFacilityKind.Library => state.libraryUsesToday,
                _ => 0
            };
        }

        private static void IncrementUses(MonsterRaisingState state, RanchFacilityKind kind)
        {
            switch (kind)
            {
                case RanchFacilityKind.Gym:
                    state.gymUsesToday++;
                    break;
                case RanchFacilityKind.Spa:
                    state.spaUsesToday++;
                    break;
                case RanchFacilityKind.Library:
                    state.libraryUsesToday++;
                    break;
            }
        }

        public static bool TryLearnMove(MonsterData monster, string moveId)
        {
            if (string.IsNullOrEmpty(moveId))
            {
                return false;
            }

            MonsterRaisingService.EnsureRaisingState(monster);
            string[] moves = monster.Raising.learnedMoveIds ?? Array.Empty<string>();

            for (int i = 0; i < moves.Length; i++)
            {
                if (moves[i] == moveId)
                {
                    return false;
                }
            }

            var list = new System.Collections.Generic.List<string>(moves) { moveId };
            monster.Raising.learnedMoveIds = list.ToArray();
            return true;
        }

        private static bool RollSuccess(float multiplier)
        {
            float threshold = Math.Min(0.95f, 0.55f * multiplier);
            return UnityEngine.Random.value <= threshold;
        }

        private static bool RollChance(float chance, MonsterData monster, double utcNow)
        {
            int seed = MonsterProceduralTraits.SeedFromInt(
                monster.DexNumber + (int)utcNow + monster.Raising.battleWins);
            return new Random(seed).NextDouble() <= chance;
        }
    }
}
