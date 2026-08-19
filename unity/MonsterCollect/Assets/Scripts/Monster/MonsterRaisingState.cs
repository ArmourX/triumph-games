using System;

namespace MonsterCollect.Monster
{
    /// <summary>
    /// Persisted care and training progress for a ranch monster.
    /// </summary>
    [Serializable]
    public class MonsterRaisingState
    {
        public float hunger = 80f;
        public float energy = 80f;
        public float mood = 80f;
        public float lifespan = 100f;
        public float fatigue;

        public int personality = -1;
        public bool isRetired;
        public float retirementBreedingBonus;

        public bool isOnErrantry;
        public string errantryMissionId = string.Empty;
        public double errantryStartedUtc;
        public double errantryEndsUtc;
        public int errantryInjurySeverity;

        public string[] learnedMoveIds = Array.Empty<string>();

        public int strengthTrainingsToday;
        public int agilityTrainingsToday;
        public int intelligenceTrainingsToday;
        public int defenseTrainingsToday;
        public int feedsToday;
        public int restsToday;
        public int gymUsesToday;
        public int spaUsesToday;
        public int libraryUsesToday;

        public string lastDayKey = string.Empty;
        public double lastSimulatedUtc;

        public double lastStrengthTrainUtc;
        public double lastAgilityTrainUtc;
        public double lastIntelligenceTrainUtc;
        public double lastDefenseTrainUtc;

        public int battleExperience;
        public int battleWins;
        public int battleLosses;
        public int level = 1;
        public int trainingPoints;

        public int totalStrengthTrainings;
        public int totalAgilityTrainings;
        public int totalIntelligenceTrainings;
        public int totalDefenseTrainings;

        public bool isOnExploration;
        public string explorationZoneId = string.Empty;
        public double explorationStartedUtc;
        public double explorationEndsUtc;

        public float nextTrainingBonus;
        public float nextBattleDamageBonus;

        public static MonsterRaisingState CreateDefault()
        {
            return new MonsterRaisingState
            {
                hunger = 85f,
                energy = 85f,
                mood = 80f,
                lifespan = 100f,
                fatigue = 0f,
                personality = -1,
                learnedMoveIds = Array.Empty<string>(),
                lastSimulatedUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
            };
        }

        public MonsterCareCondition GetCareConditions()
        {
            MonsterCareCondition conditions = MonsterCareCondition.None;

            if (isRetired)
            {
                conditions |= MonsterCareCondition.Retired;
            }

            if (isOnErrantry)
            {
                conditions |= MonsterCareCondition.OnErrantry;
            }

            if (errantryInjurySeverity > 0)
            {
                conditions |= MonsterCareCondition.Injured;
            }

            if (fatigue >= 70f)
            {
                conditions |= MonsterCareCondition.Exhausted;
            }

            if (energy < 25f)
            {
                conditions |= MonsterCareCondition.Tired;
            }

            if (hunger < 20f)
            {
                conditions |= MonsterCareCondition.Weak;
            }

            if (mood < 15f || (hunger < 10f && energy < 10f))
            {
                conditions |= MonsterCareCondition.Neglected;
            }

            if (lifespan <= 20f && !isRetired)
            {
                conditions |= MonsterCareCondition.Aging;
            }

            return conditions;
        }
    }
}
