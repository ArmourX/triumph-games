using UnityEngine;

namespace MonsterCollect.Progression
{
    public static class RuntimeQuestCatalogFactory
    {
        public static QuestCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<QuestCatalog>();
            catalog.Quests = new[]
            {
                // Daily
                Quest("daily_scan_unique", "Code Explorer", QuestCategory.Daily, QuestObjectiveType.ScanUniqueCodes, 5,
                    "Scan 5 different QR codes today.", coin: 40, xp: 30),
                Quest("daily_win_3", "Battle Ready", QuestCategory.Daily, QuestObjectiveType.WinBattles, 3,
                    "Win 3 battles.", coin: 35, xp: 35),
                Quest("daily_feed_3", "Good Caretaker", QuestCategory.Daily, QuestObjectiveType.FeedMonster, 3,
                    "Feed your active monster 3 times.", coin: 25, xp: 20),
                Quest("daily_errantry", "Day Trip", QuestCategory.Daily, QuestObjectiveType.CompleteErrantry, 1,
                    "Complete 1 errantry mission.", coin: 45, xp: 40),

                // Weekly
                Quest("weekly_fire_wins", "Pyromancer", QuestCategory.Weekly, QuestObjectiveType.WinWithElement, 3,
                    "Win 3 battles with a Fire-type monster.", param: "Fire", coin: 80, xp: 70),
                Quest("weekly_breed_rare", "Rare Breeder", QuestCategory.Weekly, QuestObjectiveType.BreedMinRarity, 1,
                    "Breed a Rare or higher monster.", param: "Rare", coin: 100, xp: 90, essence: 30),
                Quest("weekly_discover_15", "Field Researcher", QuestCategory.Weekly, QuestObjectiveType.DiscoverDexEntries, 15,
                    "Discover 15 new Monster Book entries this week.", coin: 90, xp: 80),
                Quest("weekly_shop", "Supporter", QuestCategory.Weekly, QuestObjectiveType.SpendCoins, 100,
                    "Spend 100 ranch coins at the shop.", coin: 60, xp: 50),
                Quest("weekly_adventure", "Errant Trainers", QuestCategory.Weekly, QuestObjectiveType.CompleteExploration, 2,
                    "Complete 2 region adventures this week.", coin: 70, xp: 55),
                Quest("weekly_circuit", "Circuit Weekend", QuestCategory.Weekly, QuestObjectiveType.WinCircuitMatches, 2,
                    "Win 2 ranked circuit matches this week.", coin: 80, xp: 60),

                // Main quest line
                Quest("main_first_capture", "First Steps", QuestCategory.Main, QuestObjectiveType.ScanMonster, 1,
                    "Scan your first monster.", order: 0, coin: 20, xp: 50, item: "care_treat", itemQty: 2),
                Quest("main_first_win", "Into Battle", QuestCategory.Main, QuestObjectiveType.WinBattles, 1,
                    "Win your first battle.", order: 1, coin: 30, xp: 60),
                Quest("main_first_adventure", "Leave the Meadow", QuestCategory.Main, QuestObjectiveType.CompleteExploration, 1,
                    "Send monsters on your first meadow adventure.", order: 2, coin: 35, xp: 50),
                Quest("main_forest_path", "The Forest Path", QuestCategory.Main, QuestObjectiveType.CompleteExploration, 1,
                    "Explore the Verdant Forest.", order: 3, param: "forest", coin: 45, xp: 70),
                Quest("main_dex_10", "Growing Collection", QuestCategory.Main, QuestObjectiveType.DiscoverDexEntries, 10,
                    "Discover 10 Monster Book entries.", order: 4, coin: 50, xp: 80, essence: 25),
                Quest("main_first_breed", "Fusion Lab", QuestCategory.Main, QuestObjectiveType.BreedMonster, 1,
                    "Breed your first fusion monster.", order: 5, coin: 60, xp: 100, essence: 40),
                Quest("main_rank_2", "Rising Trainer", QuestCategory.Main, QuestObjectiveType.ReachTrainerRank, 2,
                    "Reach Ranger rank (Trainer Rank 3).", order: 6, param: "2", coin: 100, xp: 150, item: "lucky_bell"),
                Quest("main_dex_50", "Monster Scholar", QuestCategory.Main, QuestObjectiveType.DiscoverDexEntries, 50,
                    "Discover 50 Monster Book entries.", order: 7, coin: 150, xp: 200, essence: 75)
            };
            return catalog;
        }

        private static QuestDefinition Quest(
            string id,
            string name,
            QuestCategory category,
            QuestObjectiveType objective,
            int target,
            string desc,
            string param = "",
            int order = 0,
            int coin = 0,
            int xp = 0,
            int essence = 0,
            string item = "",
            int itemQty = 1)
        {
            var q = ScriptableObject.CreateInstance<QuestDefinition>();
            q.QuestId = id;
            q.DisplayName = name;
            q.Description = desc;
            q.Category = category;
            q.Objective = objective;
            q.TargetCount = target;
            q.ObjectiveParameter = param;
            q.MainQuestOrder = order;
            q.CoinReward = coin;
            q.TrainerXpReward = xp;
            q.EssenceReward = essence;
            q.ItemRewardId = item;
            q.ItemRewardQuantity = itemQty;
            return q;
        }
    }
}
