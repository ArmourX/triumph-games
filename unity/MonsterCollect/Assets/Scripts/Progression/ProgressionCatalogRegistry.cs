using UnityEngine;

namespace MonsterCollect.Progression
{
    public static class ProgressionCatalogRegistry
    {
        private static QuestCatalog questCatalog;
        private static TrainerRankCatalog rankCatalog;
        private static ShopCatalog shopCatalog;
        private static MonsterBookRewardCatalog bookCatalog;

        public static QuestCatalog Quests
        {
            get
            {
                if (questCatalog == null)
                {
                    questCatalog = Resources.Load<QuestCatalog>(QuestCatalog.DefaultResourcePath)
                        ?? RuntimeQuestCatalogFactory.Create();
                }

                return questCatalog;
            }
        }

        public static TrainerRankCatalog Ranks
        {
            get
            {
                if (rankCatalog == null)
                {
                    rankCatalog = Resources.Load<TrainerRankCatalog>(TrainerRankCatalog.DefaultResourcePath)
                        ?? RuntimeTrainerRankCatalogFactory.Create();
                }

                return rankCatalog;
            }
        }

        public static ShopCatalog Shop
        {
            get
            {
                if (shopCatalog == null)
                {
                    shopCatalog = Resources.Load<ShopCatalog>(ShopCatalog.DefaultResourcePath)
                        ?? RuntimeShopCatalogFactory.Create();
                }

                return shopCatalog;
            }
        }

        public static MonsterBookRewardCatalog BookRewards
        {
            get
            {
                if (bookCatalog == null)
                {
                    bookCatalog = Resources.Load<MonsterBookRewardCatalog>(MonsterBookRewardCatalog.DefaultResourcePath)
                        ?? RuntimeMonsterBookRewardCatalogFactory.Create();
                }

                return bookCatalog;
            }
        }
    }
}
