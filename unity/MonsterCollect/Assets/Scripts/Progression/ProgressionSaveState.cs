using System;

namespace MonsterCollect.Progression
{
    [Serializable]
    public class QuestProgressEntry
    {
        public string questId = string.Empty;
        public int current;
        public bool completed;
        public bool rewardClaimed;
        public string[] trackedKeys = Array.Empty<string>();
    }

    [Serializable]
    public class ProgressionSaveState
    {
        public int trainerXp;
        public int trainerRankIndex;
        public int ranchCoins = 50;

        public string dailyQuestDayKey = string.Empty;
        public string weeklyQuestWeekKey = string.Empty;
        public string[] activeDailyQuestIds = Array.Empty<string>();
        public string[] activeWeeklyQuestIds = Array.Empty<string>();
        public QuestProgressEntry[] questProgress = Array.Empty<QuestProgressEntry>();
        public int mainQuestStage;

        public string[] claimedBookRewardIds = Array.Empty<string>();
        public string[] discoveredVariantHashes = Array.Empty<string>();
        public string[] discoveredEvolutionForms = Array.Empty<string>();
        public string[] unlockedTrainingTypes = Array.Empty<string>();
        public int bonusRanchSlots;

        public static ProgressionSaveState CreateDefault()
        {
            return new ProgressionSaveState
            {
                ranchCoins = 50,
                trainerRankIndex = 0,
                unlockedTrainingTypes = new[] { "strength", "agility" }
            };
        }
    }
}
