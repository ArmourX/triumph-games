using UnityEngine;

namespace MonsterCollect.Ranch
{
    public static class RuntimeErrantryMissionCatalogFactory
    {
        public static ErrantryMissionCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<ErrantryMissionCatalog>();
            catalog.Missions = new[]
            {
                Mission("forest_scout", "Forest Scout", 1, 0.5f, 5, 15, 1, 3,
                    new[] { "apple", "care_treat" }, injury: 0.1f, move: "vine_whip"),
                Mission("mountain_trek", "Mountain Trek", 3, 2f, 15, 40, 2, 6,
                    new[] { "power_charm", "herbal_tonic" }, injury: 0.25f, move: "earth_slam"),
                Mission("ancient_ruins", "Ancient Ruins", 8, 4f, 30, 80, 4, 10,
                    new[] { "speed_seed", "longevity_pill", "lucky_bell" }, injury: 0.35f, move: "shadow_hex")
            };
            return catalog;
        }

        private static ErrantryMissionDefinition Mission(
            string id,
            string name,
            int minLevel,
            float hours,
            int minEssence,
            int maxEssence,
            int minCare,
            int maxCare,
            string[] items,
            float injury,
            string move)
        {
            var def = ScriptableObject.CreateInstance<ErrantryMissionDefinition>();
            def.MissionId = id;
            def.DisplayName = name;
            def.Description = name;
            def.MinLevel = minLevel;
            def.DurationHours = hours;
            def.MinEssence = minEssence;
            def.MaxEssence = maxEssence;
            def.MinCarePoints = minCare;
            def.MaxCarePoints = maxCare;
            def.PossibleItemIds = items;
            def.ItemDropChance = 0.4f;
            def.MoveLearnChance = 0.18f;
            def.MoveToLearn = move;
            def.InjuryChance = injury;
            return def;
        }
    }
}
