using UnityEngine;

namespace MonsterCollect.Progression
{
    [CreateAssetMenu(fileName = "MonsterBookReward", menuName = "Monster Collect/Monster Book Reward")]
    public class MonsterBookRewardDefinition : ScriptableObject
    {
        public string RewardId = "book_10";
        public string DisplayName = "Scout Badge";
        [TextArea] public string Description = "Discover 10% of the Monster Book.";
        [Range(0f, 1f)] public float RequiredCompletionRatio = 0.1f;
        public int RequiredDiscoveredCount;
        public int CoinReward = 50;
        public int EssenceReward = 25;
        public int TrainerXpReward = 40;
        public string ItemRewardId = string.Empty;
        public int ItemRewardQuantity = 1;
    }

    [CreateAssetMenu(fileName = "MonsterBookRewardCatalog", menuName = "Monster Collect/Monster Book Reward Catalog")]
    public class MonsterBookRewardCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Progression/MonsterBookRewardCatalog";

        public MonsterBookRewardDefinition[] Rewards = System.Array.Empty<MonsterBookRewardDefinition>();

        public MonsterBookRewardDefinition FindById(string rewardId)
        {
            if (string.IsNullOrEmpty(rewardId) || Rewards == null)
            {
                return null;
            }

            for (int i = 0; i < Rewards.Length; i++)
            {
                MonsterBookRewardDefinition reward = Rewards[i];
                if (reward != null && reward.RewardId == rewardId)
                {
                    return reward;
                }
            }

            return null;
        }
    }
}
