using System;

namespace MonsterCollect.Core.RemoteConfig
{
    [Serializable]
    public class RemoteConfigData
    {
        public int version = 1;
        public RarityWeightEntry[] rarityWeights = DefaultRarityWeights();
        public float battleRewardMultiplier = 1f;
        public float scanEnergyCostMultiplier = 1f;
        public float battleEnergyCostMultiplier = 1f;
        public int maxScansPerDay = 15;
        public LimitedTimeEventEntry[] activeEvents = Array.Empty<LimitedTimeEventEntry>();

        public static RarityWeightEntry[] DefaultRarityWeights()
        {
            return new[]
            {
                new RarityWeightEntry { rarity = "Legendary", cumulativePercent = 1 },
                new RarityWeightEntry { rarity = "Epic", cumulativePercent = 5 },
                new RarityWeightEntry { rarity = "Rare", cumulativePercent = 15 },
                new RarityWeightEntry { rarity = "Uncommon", cumulativePercent = 40 }
            };
        }
    }

    [Serializable]
    public class RarityWeightEntry
    {
        public string rarity = "Common";
        /// <summary>Cumulative roll threshold out of 100 (e.g. 1 = top 1%).</summary>
        public int cumulativePercent = 100;
    }

    [Serializable]
    public class LimitedTimeEventEntry
    {
        public string eventId = "weekend_bonus";
        public string displayName = "Weekend Bonus";
        public float battleRewardMultiplier = 1f;
        public float breedingEssenceDiscount = 0f;
        public string bonusRarity = string.Empty;
        public int bonusRarityPercentBoost;
        public long startUtc;
        public long endUtc;
    }
}
