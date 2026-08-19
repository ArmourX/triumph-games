using UnityEngine;

namespace MonsterCollect.Progression
{
    public static class RuntimeTrainerRankCatalogFactory
    {
        public static TrainerRankCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<TrainerRankCatalog>();
            catalog.Ranks = new[]
            {
                Rank("novice", "Novice Trainer", 0, 0, new string[] { "strength", "agility" }, 0),
                Rank("apprentice", "Apprentice", 100, 2, new[] { "intelligence" }, 25),
                Rank("ranger", "Ranger", 300, 2, new[] { "defense" }, 40),
                Rank("expert", "Expert", 600, 2, System.Array.Empty<string>(), 60),
                Rank("master", "Master Trainer", 1000, 2, System.Array.Empty<string>(), 80),
                Rank("legend", "Legend", 2000, 4, System.Array.Empty<string>(), 120)
            };
            return catalog;
        }

        private static TrainerRankDefinition Rank(
            string id, string name, int xp, int slots, string[] training, int coinBonus)
        {
            var r = ScriptableObject.CreateInstance<TrainerRankDefinition>();
            r.RankId = id;
            r.DisplayName = name;
            r.Description = name;
            r.RequiredXp = xp;
            r.BonusRanchSlots = slots;
            r.UnlockTrainingTypes = training;
            r.CoinBonusOnRankUp = coinBonus;
            return r;
        }
    }
}
