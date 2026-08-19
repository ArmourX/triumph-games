using System;
using MonsterCollect.Progression;
using MonsterCollect.Ranch;

namespace MonsterCollect.Monster
{
    /// <summary>Result of a raising action (training, feed, rest).</summary>
    public readonly struct RaisingActionResult
    {
        public bool Success { get; }
        public string Message { get; }
        public int AttackDelta { get; }
        public int SpeedDelta { get; }
        public int DefenseDelta { get; }
        public int HpDelta { get; }

        public RaisingActionResult(
            bool success,
            string message,
            int attackDelta = 0,
            int speedDelta = 0,
            int defenseDelta = 0,
            int hpDelta = 0)
        {
            Success = success;
            Message = message;
            AttackDelta = attackDelta;
            SpeedDelta = speedDelta;
            DefenseDelta = defenseDelta;
            HpDelta = hpDelta;
        }

        public static RaisingActionResult Fail(string message) => new RaisingActionResult(false, message);
        public static RaisingActionResult Ok(string message, int attackDelta = 0, int speedDelta = 0, int defenseDelta = 0, int hpDelta = 0) =>
            new RaisingActionResult(true, message, attackDelta, speedDelta, defenseDelta, hpDelta);
    }

    /// <summary>
    /// Core raising simulation: meter decay, training, feeding, and care states.
    /// </summary>
    public static class MonsterRaisingService
    {
        public const int MaxStrengthTrainingsPerDay = 2;
        public const int MaxAgilityTrainingsPerDay = 2;
        public const int MaxIntelligenceTrainingsPerDay = 2;
        public const int MaxDefenseTrainingsPerDay = 2;
        public const int MaxFeedsPerDay = 3;
        public const int MaxRestsPerDay = 2;
        public const double TrainingCooldownSeconds = 600d;

        private const float HungerDecayPerHour = 4f;
        private const float EnergyDecayPerHour = 3f;
        private const float MoodDecayPerHour = 2f;
        private const float LifespanDecayPerHour = 0.5f;
        private const float FatigueDecayPerHour = 2f;

        public static float ClampMeterPublic(float value) => ClampMeter(value);

        public static void ResetDailyCountersIfNeededPublic(MonsterRaisingState state, double utcNowSeconds)
        {
            ResetDailyCountersIfNeeded(state, utcNowSeconds);
        }

        public static void EnsureRaisingState(MonsterData monster)
        {
            if (monster == null)
            {
                return;
            }

            if (monster.Raising == null)
            {
                monster.Raising = MonsterRaisingState.CreateDefault();
            }

            if (monster.Raising.level < 1)
            {
                monster.Raising.level = 1;
            }

            if (monster.Raising.learnedMoveIds == null)
            {
                monster.Raising.learnedMoveIds = Array.Empty<string>();
            }

            if (monster.Raising.lastSimulatedUtc <= 0d)
            {
                monster.Raising.lastSimulatedUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            }

            MonsterPersonalityService.Resolve(monster);
        }

        public static void SimulateElapsedTime(MonsterData monster, double utcNowSeconds)
        {
            EnsureRaisingState(monster);
            ResetDailyCountersIfNeeded(monster.Raising, utcNowSeconds);

            MonsterRaisingState state = monster.Raising;

            if (state.isRetired)
            {
                state.lastSimulatedUtc = utcNowSeconds;
                return;
            }

            ErrantryReturnResult errantry = ErrantryService.ProcessReturn(monster, utcNowSeconds);
            if (errantry.Returned)
            {
                state.lastSimulatedUtc = utcNowSeconds;
                return;
            }

            AdventureService.ProcessDue(utcNowSeconds);
            if (AdventureService.IsPartyMember(monster.Id))
            {
                state.lastSimulatedUtc = utcNowSeconds;
                return;
            }

            ExplorationReturnResult exploration = ExplorationService.ProcessReturn(monster, utcNowSeconds);
            if (exploration.Returned)
            {
                state.lastSimulatedUtc = utcNowSeconds;
                return;
            }

            if (state.isOnErrantry || state.isOnExploration)
            {
                state.lastSimulatedUtc = utcNowSeconds;
                return;
            }

            double elapsed = utcNowSeconds - state.lastSimulatedUtc;

            if (elapsed <= 0d)
            {
                return;
            }

            float hours = (float)(elapsed / 3600d);
            CustomizationBonuses bonuses = RanchCustomizationService.GetBonuses();
            float moodDecay = MoodDecayPerHour * (1f - bonuses.MoodDecayReduction);

            state.hunger = ClampMeter(state.hunger - HungerDecayPerHour * hours);
            state.energy = ClampMeter(state.energy - EnergyDecayPerHour * hours);
            state.mood = ClampMeter(state.mood - moodDecay * hours);
            state.lifespan = ClampMeter(state.lifespan - LifespanDecayPerHour * hours);
            state.fatigue = ClampMeter(state.fatigue - FatigueDecayPerHour * hours);

            LifespanRetirementService.ApplyLifespanTick(monster, hours);
            ApplyNeglectPenalties(monster, hours);
            state.lastSimulatedUtc = utcNowSeconds;
        }

        public static RaisingActionResult TryFeed(MonsterData monster, double utcNowSeconds)
        {
            if (!CanPerformCareAction(monster, out string blockReason))
            {
                return RaisingActionResult.Fail(blockReason);
            }

            EnsureRaisingState(monster);
            SimulateElapsedTime(monster, utcNowSeconds);
            ResetDailyCountersIfNeeded(monster.Raising, utcNowSeconds);

            MonsterRaisingState state = monster.Raising;

            if (state.feedsToday >= MaxFeedsPerDay)
            {
                return RaisingActionResult.Fail($"Feed limit reached ({MaxFeedsPerDay}/day).");
            }

            state.feedsToday++;
            float hungerGain = 30f;
            if (MonsterPersonalityService.Resolve(monster) == MonsterPersonality.Lazy)
            {
                hungerGain += 5f;
            }

            state.hunger = ClampMeter(state.hunger + hungerGain);
            state.mood = ClampMeter(state.mood + 5f);
            state.lastSimulatedUtc = utcNowSeconds;
            RanchProgressionService.AddCarePoints(1);
            ProgressionEventReporter.ReportFeed();

            return RaisingActionResult.Ok("Fed! Hunger restored.");
        }

        public static RaisingActionResult TryRest(MonsterData monster, double utcNowSeconds)
        {
            if (!CanPerformCareAction(monster, out string blockReason))
            {
                return RaisingActionResult.Fail(blockReason);
            }

            EnsureRaisingState(monster);
            SimulateElapsedTime(monster, utcNowSeconds);
            ResetDailyCountersIfNeeded(monster.Raising, utcNowSeconds);

            MonsterRaisingState state = monster.Raising;

            if (state.restsToday >= MaxRestsPerDay)
            {
                return RaisingActionResult.Fail($"Rest limit reached ({MaxRestsPerDay}/day).");
            }

            state.restsToday++;
            float energyGain = 40f;
            float fatigueRelief = 20f;
            if (MonsterPersonalityService.Resolve(monster) == MonsterPersonality.Lazy)
            {
                energyGain += 10f;
                fatigueRelief += 10f;
            }

            state.energy = ClampMeter(state.energy + energyGain);
            state.mood = ClampMeter(state.mood + 10f);
            state.hunger = ClampMeter(state.hunger - 5f);
            state.fatigue = ClampMeter(state.fatigue - fatigueRelief);
            state.lastSimulatedUtc = utcNowSeconds;
            RanchProgressionService.AddCarePoints(1);

            return RaisingActionResult.Ok("Rested! Energy restored.");
        }

        public static RaisingActionResult TryStrengthTraining(MonsterData monster, double utcNowSeconds)
        {
            return TryTraining(
                monster,
                utcNowSeconds,
                TrainingFocus.Strength,
                isStrength: true,
                minEnergy: 30f,
                minHunger: 20f,
                energyCost: 15f,
                hungerCost: 10f,
                moodCost: 5f,
                fatigueCost: 12f,
                maxPerDay: MaxStrengthTrainingsPerDay,
                trainingsToday: m => m.Raising.strengthTrainingsToday,
                incrementTraining: m =>
                {
                    m.Raising.strengthTrainingsToday++;
                    m.Raising.totalStrengthTrainings++;
                },
                lastTrainUtc: m => m.Raising.lastStrengthTrainUtc,
                setLastTrainUtc: (m, t) => m.Raising.lastStrengthTrainUtc = t,
                applyStat: (m, amount) => m.Attack += amount);
        }

        public static RaisingActionResult TryAgilityTraining(MonsterData monster, double utcNowSeconds)
        {
            return TryTraining(
                monster,
                utcNowSeconds,
                TrainingFocus.Agility,
                isStrength: false,
                minEnergy: 25f,
                minHunger: 15f,
                energyCost: 12f,
                hungerCost: 8f,
                moodCost: 3f,
                fatigueCost: 10f,
                maxPerDay: MaxAgilityTrainingsPerDay,
                trainingsToday: m => m.Raising.agilityTrainingsToday,
                incrementTraining: m =>
                {
                    m.Raising.agilityTrainingsToday++;
                    m.Raising.totalAgilityTrainings++;
                },
                lastTrainUtc: m => m.Raising.lastAgilityTrainUtc,
                setLastTrainUtc: (m, t) => m.Raising.lastAgilityTrainUtc = t,
                applyStat: (m, amount) => m.Speed += amount);
        }

        public static RaisingActionResult TryIntelligenceTraining(MonsterData monster, double utcNowSeconds)
        {
            if (!TrainerProgressionService.IsTrainingUnlocked("intelligence"))
            {
                return RaisingActionResult.Fail("Intelligence training unlocks at Apprentice rank.");
            }

            return TryTraining(
                monster,
                utcNowSeconds,
                TrainingFocus.Intelligence,
                isStrength: false,
                minEnergy: 28f,
                minHunger: 18f,
                energyCost: 14f,
                hungerCost: 8f,
                moodCost: 2f,
                fatigueCost: 8f,
                maxPerDay: MaxIntelligenceTrainingsPerDay,
                trainingsToday: m => m.Raising.intelligenceTrainingsToday,
                incrementTraining: m =>
                {
                    m.Raising.intelligenceTrainingsToday++;
                    m.Raising.totalIntelligenceTrainings++;
                },
                lastTrainUtc: m => m.Raising.lastIntelligenceTrainUtc,
                setLastTrainUtc: (m, t) => m.Raising.lastIntelligenceTrainUtc = t,
                applyStat: (m, amount) => m.Hp += amount,
                statLabel: "HP");
        }

        public static RaisingActionResult TryDefenseTraining(MonsterData monster, double utcNowSeconds)
        {
            if (!TrainerProgressionService.IsTrainingUnlocked("defense"))
            {
                return RaisingActionResult.Fail("Defense training unlocks at Ranger rank.");
            }

            return TryTraining(
                monster,
                utcNowSeconds,
                TrainingFocus.Defense,
                isStrength: false,
                minEnergy: 28f,
                minHunger: 18f,
                energyCost: 14f,
                hungerCost: 9f,
                moodCost: 4f,
                fatigueCost: 11f,
                maxPerDay: MaxDefenseTrainingsPerDay,
                trainingsToday: m => m.Raising.defenseTrainingsToday,
                incrementTraining: m =>
                {
                    m.Raising.defenseTrainingsToday++;
                    m.Raising.totalDefenseTrainings++;
                },
                lastTrainUtc: m => m.Raising.lastDefenseTrainUtc,
                setLastTrainUtc: (m, t) => m.Raising.lastDefenseTrainUtc = t,
                applyStat: (m, amount) => m.Defense += amount,
                statLabel: "DEF",
                defenseDelta: true);
        }

        public static int GetEffectiveAttack(MonsterData monster)
        {
            if (monster == null)
            {
                return 0;
            }

            EnsureRaisingState(monster);
            int attack = monster.Attack;
            ApplyCareDebuffs(ref attack, monster.Raising.GetCareConditions(), tired: 2, weak: 3, neglected: 5, exhausted: 2, injured: 3);
            return attack < 1 ? 1 : attack;
        }

        public static int GetEffectiveSpeed(MonsterData monster)
        {
            if (monster == null)
            {
                return 0;
            }

            EnsureRaisingState(monster);
            int speed = monster.Speed;
            ApplyCareDebuffs(ref speed, monster.Raising.GetCareConditions(), tired: 3, weak: 0, neglected: 4, exhausted: 3, injured: 2);
            return speed < 1 ? 1 : speed;
        }

        public static int GetEffectiveDefense(MonsterData monster)
        {
            if (monster == null)
            {
                return 0;
            }

            EnsureRaisingState(monster);
            int defense = monster.Defense;
            ApplyCareDebuffs(ref defense, monster.Raising.GetCareConditions(), tired: 1, weak: 2, neglected: 3, exhausted: 2, injured: 4);
            return defense < 1 ? 1 : defense;
        }

        public static string GetCareStatusMessage(MonsterData monster)
        {
            EnsureRaisingState(monster);
            MonsterCareCondition conditions = monster.Raising.GetCareConditions();

            if ((conditions & MonsterCareCondition.Retired) != 0)
            {
                return "Retired — provides breeding bonuses.";
            }

            if ((conditions & MonsterCareCondition.OnErrantry) != 0)
            {
                return "Away on errantry…";
            }

            if ((conditions & MonsterCareCondition.Neglected) != 0)
            {
                return "Neglected — feed and rest immediately!";
            }

            if ((conditions & MonsterCareCondition.Injured) != 0)
            {
                return "Injured — spa rest or herbal tonic recommended.";
            }

            if ((conditions & MonsterCareCondition.Aging) != 0)
            {
                return "Aging — consider retirement for legacy bonuses.";
            }

            if ((conditions & MonsterCareCondition.Exhausted) != 0)
            {
                return "Exhausted from fatigue — rest or visit the spa.";
            }

            if ((conditions & MonsterCareCondition.Weak) != 0 && (conditions & MonsterCareCondition.Tired) != 0)
            {
                return "Exhausted and weak — rest and feed needed.";
            }

            if ((conditions & MonsterCareCondition.Weak) != 0)
            {
                return "Weak from hunger — feed your monster.";
            }

            if ((conditions & MonsterCareCondition.Tired) != 0)
            {
                return "Too tired — rest before training.";
            }

            MonsterPersonality personality = MonsterPersonalityService.Resolve(monster);
            return $"{MonsterPersonalityService.GetDisplayName(personality)} spirit — ready to train!";
        }

        public static double GetTrainingCooldownRemaining(MonsterData monster, bool strength, double utcNowSeconds)
        {
            EnsureRaisingState(monster);
            double last = strength ? monster.Raising.lastStrengthTrainUtc : monster.Raising.lastAgilityTrainUtc;
            double remaining = TrainingCooldownSeconds - (utcNowSeconds - last);
            return remaining > 0d ? remaining : 0d;
        }

        public static void ConsumeBattleBonuses(MonsterData monster)
        {
            if (monster?.Raising == null)
            {
                return;
            }

            monster.Raising.nextBattleDamageBonus = 0f;
        }

        private static bool CanPerformCareAction(MonsterData monster, out string reason)
        {
            reason = LifespanRetirementService.GetUnavailableReason(monster);
            return string.IsNullOrEmpty(reason);
        }

        private static void ApplyCareDebuffs(
            ref int stat,
            MonsterCareCondition conditions,
            int tired,
            int weak,
            int neglected,
            int exhausted,
            int injured)
        {
            if ((conditions & MonsterCareCondition.Weak) != 0)
            {
                stat -= weak;
            }

            if ((conditions & MonsterCareCondition.Tired) != 0)
            {
                stat -= tired;
            }

            if ((conditions & MonsterCareCondition.Neglected) != 0)
            {
                stat -= neglected;
            }

            if ((conditions & MonsterCareCondition.Exhausted) != 0)
            {
                stat -= exhausted;
            }

            if ((conditions & MonsterCareCondition.Injured) != 0)
            {
                stat -= injured;
            }
        }

        private static RaisingActionResult TryTraining(
            MonsterData monster,
            double utcNowSeconds,
            TrainingFocus focus,
            bool isStrength,
            float minEnergy,
            float minHunger,
            float energyCost,
            float hungerCost,
            float moodCost,
            float fatigueCost,
            int maxPerDay,
            Func<MonsterData, int> trainingsToday,
            Action<MonsterData> incrementTraining,
            Func<MonsterData, double> lastTrainUtc,
            Action<MonsterData, double> setLastTrainUtc,
            Action<MonsterData, int> applyStat,
            string statLabel = null,
            bool defenseDelta = false)
        {
            if (!CanPerformCareAction(monster, out string blockReason))
            {
                return RaisingActionResult.Fail(blockReason);
            }

            EnsureRaisingState(monster);
            SimulateElapsedTime(monster, utcNowSeconds);
            ResetDailyCountersIfNeeded(monster.Raising, utcNowSeconds);

            MonsterRaisingState state = monster.Raising;
            string label = statLabel ?? (isStrength ? "Strength" : "Agility");

            if (trainingsToday(monster) >= maxPerDay)
            {
                return RaisingActionResult.Fail($"{label} limit reached ({maxPerDay}/day).");
            }

            if (isStrength || focus == TrainingFocus.Agility)
            {
                double cooldown = GetTrainingCooldownRemaining(monster, isStrength, utcNowSeconds);
                if (cooldown > 0d)
                {
                    int minutes = (int)Math.Ceiling(cooldown / 60d);
                    return RaisingActionResult.Fail($"{label} cooldown: {minutes}m remaining.");
                }
            }

            if (state.energy < minEnergy)
            {
                return RaisingActionResult.Fail("Not enough energy to train.");
            }

            if (state.hunger < minHunger)
            {
                return RaisingActionResult.Fail("Too hungry to train — feed first.");
            }

            if ((state.GetCareConditions() & MonsterCareCondition.Neglected) != 0)
            {
                return RaisingActionResult.Fail("Monster is neglected — restore care first.");
            }

            incrementTraining(monster);
            setLastTrainUtc(monster, utcNowSeconds);

            state.energy = ClampMeter(state.energy - energyCost);
            state.hunger = ClampMeter(state.hunger - hungerCost);
            state.mood = ClampMeter(state.mood - moodCost);
            state.fatigue = ClampMeter(state.fatigue + fatigueCost);

            float successRate = MonsterPersonalityService.GetTrainingMultiplier(monster, focus);
            int gain = RollTrainingGain(successRate, monster, utcNowSeconds) ? 1 : 0;

            if ((state.GetCareConditions() & MonsterCareCondition.Tired) != 0 ||
                (state.GetCareConditions() & MonsterCareCondition.Exhausted) != 0)
            {
                gain = 0;
            }

            if (gain > 0)
            {
                applyStat(monster, gain);
                state.nextTrainingBonus = 0f;
            }

            state.lastSimulatedUtc = utcNowSeconds;
            RanchProgressionService.AddCarePoints(2);

            if (gain > 0)
            {
                if (defenseDelta)
                {
                    return RaisingActionResult.Ok($"{label} training complete!", defenseDelta: gain);
                }

                if (focus == TrainingFocus.Intelligence)
                {
                    return RaisingActionResult.Ok($"{label} training complete!", hpDelta: gain);
                }

                return isStrength
                    ? RaisingActionResult.Ok($"{label} training complete!", attackDelta: gain)
                    : RaisingActionResult.Ok($"{label} training complete!", speedDelta: gain);
            }

            return RaisingActionResult.Ok($"{label} training done, but conditions prevented gains.");
        }

        private static bool RollTrainingGain(float multiplier, MonsterData monster, double utcNow)
        {
            float threshold = Math.Min(0.92f, 0.5f * multiplier * WorldCycleService.GetTrainingSuccessMultiplier());
            int seed = MonsterProceduralTraits.SeedFromInt(monster.DexNumber + (int)utcNow);
            return new Random(seed).NextDouble() <= threshold;
        }

        private static void ApplyNeglectPenalties(MonsterData monster, float hours)
        {
            MonsterCareCondition conditions = monster.Raising.GetCareConditions();

            if ((conditions & MonsterCareCondition.Neglected) != 0)
            {
                monster.Raising.mood = ClampMeter(monster.Raising.mood - 1.5f * hours);
            }

            if ((conditions & MonsterCareCondition.Weak) != 0)
            {
                monster.Raising.energy = ClampMeter(monster.Raising.energy - 0.5f * hours);
            }
        }

        private static void ResetDailyCountersIfNeeded(MonsterRaisingState state, double utcNowSeconds)
        {
            string today = GetDayKey(utcNowSeconds);

            if (state.lastDayKey == today)
            {
                return;
            }

            state.lastDayKey = today;
            state.strengthTrainingsToday = 0;
            state.agilityTrainingsToday = 0;
            state.intelligenceTrainingsToday = 0;
            state.defenseTrainingsToday = 0;
            state.feedsToday = 0;
            state.restsToday = 0;
            state.gymUsesToday = 0;
            state.spaUsesToday = 0;
            state.libraryUsesToday = 0;
        }

        private static string GetDayKey(double utcNowSeconds)
        {
            return DateTimeOffset.FromUnixTimeSeconds((long)utcNowSeconds).UtcDateTime.ToString("yyyy-MM-dd");
        }

        private static float ClampMeter(float value)
        {
            if (value < 0f)
            {
                return 0f;
            }

            if (value > 100f)
            {
                return 100f;
            }

            return value;
        }
    }
}
