using UnityEngine;

namespace MonsterCollect.Progression
{
    public static class RuntimeMonsterBookRewardCatalogFactory
    {
        public static MonsterBookRewardCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<MonsterBookRewardCatalog>();
            catalog.Rewards = new[]
            {
                Reward("book_10", "Scout Badge", 0.1f, 30, 50, 25, 40, "apple", 5),
                Reward("book_25", "Researcher Pin", 0.25f, 75, 100, 50, 80, "care_treat", 3),
                Reward("book_50", "Collector Medal", 0.5f, 150, 175, 100, 120, "herbal_tonic", 2),
                Reward("book_75", "Master Archivist", 0.75f, 225, 250, 150, 180, "power_charm", 1),
                Reward("book_100", "Complete Monster Book", 1f, 300, 500, 300, 300, "lucky_bell", 1)
            };
            return catalog;
        }

        private static MonsterBookRewardDefinition Reward(
            string id, string name, float ratio, int minCount,
            int coins, int essence, int xp, string item, int itemQty)
        {
            var r = ScriptableObject.CreateInstance<MonsterBookRewardDefinition>();
            r.RewardId = id;
            r.DisplayName = name;
            r.Description = name;
            r.RequiredCompletionRatio = ratio;
            r.RequiredDiscoveredCount = minCount;
            r.CoinReward = coins;
            r.EssenceReward = essence;
            r.TrainerXpReward = xp;
            r.ItemRewardId = item;
            r.ItemRewardQuantity = itemQty;
            return r;
        }
    }
}
