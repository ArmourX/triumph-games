using UnityEngine;

namespace MonsterCollect.Progression
{
    [CreateAssetMenu(fileName = "TrainerRank", menuName = "Monster Collect/Trainer Rank")]
    public class TrainerRankDefinition : ScriptableObject
    {
        public string RankId = "novice";
        public string DisplayName = "Novice Trainer";
        [TextArea] public string Description = "Starting rank.";
        public int RequiredXp;
        public int BonusRanchSlots;
        public string[] UnlockTrainingTypes = System.Array.Empty<string>();
        public string[] UnlockMoveIds = System.Array.Empty<string>();
        public int CoinBonusOnRankUp = 25;
    }

    [CreateAssetMenu(fileName = "TrainerRankCatalog", menuName = "Monster Collect/Trainer Rank Catalog")]
    public class TrainerRankCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Progression/TrainerRankCatalog";

        public TrainerRankDefinition[] Ranks = System.Array.Empty<TrainerRankDefinition>();

        public TrainerRankDefinition GetRank(int index)
        {
            if (Ranks == null || index < 0 || index >= Ranks.Length)
            {
                return null;
            }

            return Ranks[index];
        }

        public int GetRankIndexForXp(int xp)
        {
            if (Ranks == null || Ranks.Length == 0)
            {
                return 0;
            }

            int index = 0;
            for (int i = 0; i < Ranks.Length; i++)
            {
                if (Ranks[i] != null && xp >= Ranks[i].RequiredXp)
                {
                    index = i;
                }
            }

            return index;
        }
    }
}
