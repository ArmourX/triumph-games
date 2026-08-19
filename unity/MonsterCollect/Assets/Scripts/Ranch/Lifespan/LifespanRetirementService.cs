using MonsterCollect.Monster;

namespace MonsterCollect.Ranch
{
    public readonly struct RetirementResult
    {
        public bool Success { get; }
        public string Message { get; }
        public float BreedingBonus { get; }

        public RetirementResult(bool success, string message, float breedingBonus = 0f)
        {
            Success = success;
            Message = message;
            BreedingBonus = breedingBonus;
        }
    }

    /// <summary>Lifespan, fatigue consequences, and retirement breeding bonuses.</summary>
    public static class LifespanRetirementService
    {
        public const float MinLifespanToRetireVoluntarily = 15f;
        public const float NaturalDeathLifespan = 0f;

        public static bool IsRetired(MonsterData monster)
        {
            return monster?.Raising != null && monster.Raising.isRetired;
        }

        public static bool IsOnErrantry(MonsterData monster)
        {
            return monster?.Raising != null && monster.Raising.isOnErrantry;
        }

        public static bool IsUnavailableForActivities(MonsterData monster)
        {
            if (monster?.Raising == null)
            {
                return true;
            }

            return monster.Raising.isRetired || monster.Raising.isOnErrantry;
        }

        public static string GetUnavailableReason(MonsterData monster)
        {
            if (monster?.Raising == null)
            {
                return "Invalid monster.";
            }

            if (monster.Raising.isRetired)
            {
                return "This monster is retired.";
            }

            if (monster.Raising.isOnErrantry)
            {
                return "Monster is away on errantry.";
            }

            return string.Empty;
        }

        public static void ApplyLifespanTick(MonsterData monster, float hours)
        {
            if (monster?.Raising == null || monster.Raising.isRetired)
            {
                return;
            }

            MonsterRaisingState state = monster.Raising;

            if (state.lifespan <= NaturalDeathLifespan && !state.isRetired)
            {
                AutoRetire(monster, forced: true);
                return;
            }

            CustomizationBonuses bonuses = RanchCustomizationService.GetBonuses();
            state.lifespan = MonsterRaisingService.ClampMeterPublic(
                state.lifespan + bonuses.LifespanPerDay * (hours / 24f));
        }

        public static RetirementResult TryRetire(MonsterData monster)
        {
            if (monster?.Raising == null)
            {
                return new RetirementResult(false, "Invalid monster.");
            }

            if (monster.Raising.isRetired)
            {
                return new RetirementResult(false, "Already retired.");
            }

            if (monster.Raising.isOnErrantry)
            {
                return new RetirementResult(false, "Wait until errantry ends.");
            }

            if (monster.Raising.lifespan > MinLifespanToRetireVoluntarily)
            {
                return new RetirementResult(false,
                    $"Can retire when lifespan is {MinLifespanToRetireVoluntarily} or below, or from the detail panel anytime after level 10.");
            }

            return ApplyRetirement(monster);
        }

        public static RetirementResult TryVoluntaryRetire(MonsterData monster)
        {
            if (monster?.Raising == null)
            {
                return new RetirementResult(false, "Invalid monster.");
            }

            if (monster.Raising.isRetired)
            {
                return new RetirementResult(false, "Already retired.");
            }

            if (monster.Raising.level < 10)
            {
                return new RetirementResult(false, "Reach level 10 to voluntarily retire.");
            }

            return ApplyRetirement(monster);
        }

        private static void AutoRetire(MonsterData monster, bool forced)
        {
            ApplyRetirement(monster);
            monster.Raising.lifespan = 0f;
        }

        private static RetirementResult ApplyRetirement(MonsterData monster)
        {
            MonsterRaisingState state = monster.Raising;
            state.isRetired = true;
            state.isOnErrantry = false;
            state.retirementBreedingBonus = CalculateBreedingBonus(monster);
            state.fatigue = 0f;

            return new RetirementResult(
                true,
                $"{monster.Name} retired peacefully. Breeding bonus: +{(int)(state.retirementBreedingBonus * 100)}% stats.",
                state.retirementBreedingBonus);
        }

        public static float CalculateBreedingBonus(MonsterData monster)
        {
            if (monster?.Raising == null)
            {
                return 0f;
            }

            if (!monster.Raising.isRetired)
            {
                return 0f;
            }

            if (monster.Raising.retirementBreedingBonus > 0f)
            {
                return monster.Raising.retirementBreedingBonus;
            }

            float levelFactor = monster.Raising.level / 100f;
            float winFactor = monster.Raising.battleWins / 200f;
            float bondFactor = monster.Raising.mood / 500f;
            return System.Math.Min(0.15f, 0.03f + levelFactor + winFactor + bondFactor);
        }

        public static float GetCombinedParentBreedingBonus(MonsterData parentA, MonsterData parentB)
        {
            return CalculateBreedingBonus(parentA) + CalculateBreedingBonus(parentB);
        }
    }
}
