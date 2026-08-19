using UnityEngine;

namespace MonsterCollect.Ranch
{
    public static class RuntimeExplorationZoneCatalogFactory
    {
        public static ExplorationZoneCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<ExplorationZoneCatalog>();
            catalog.Zones = new[]
            {
                Zone("meadow_forage", "biome_meadow", "Meadow Forage", 0, 1, 1, 0.2f, "Grass",
                    new[] { "mat_berries", "mat_herbs" }, bonus: new[] { "apple" }, wild: 0.12f, wildLv: 2, injury: 0.04f),
                Zone("meadow_pond", "biome_meadow", "Pond Edge", 0, 2, 2, 0.35f, "Water",
                    new[] { "mat_reeds", "mat_mushroom" }, wild: 0.18f, wildLv: 3, injury: 0.06f),

                Zone("forest_trail", "biome_forest", "Forest Trail", 1, 3, 4, 0.5f, "Grass",
                    new[] { "mat_herbs", "mat_mushroom", "mat_resin" }, wild: 0.22f, wildLv: 5, injury: 0.08f),
                Zone("forest_thicket", "biome_forest", "Berry Thicket", 1, 4, 5, 0.75f, "Grass",
                    new[] { "mat_berries", "mat_resin" }, bonus: new[] { "apple" }, wild: 0.24f, wildLv: 6, injury: 0.1f),

                Zone("volcano_trail", "biome_volcano", "Cinder Path", 2, 6, 8, 1f, "Fire",
                    new[] { "mat_stone", "mat_crystal" }, wild: 0.28f, wildLv: 9, injury: 0.14f),
                Zone("volcano_caldera", "biome_volcano", "Caldera Rim", 2, 10, 11, 1.6f, "Fire",
                    new[] { "mat_crystal", "mat_stone" }, bonus: new[] { "power_charm" }, wild: 0.34f, wildLv: 12, injury: 0.18f),

                Zone("mountain_pass", "biome_mountain", "Rocky Pass", 2, 5, 8, 1f, "Earth",
                    new[] { "mat_stone", "mat_crystal" }, wild: 0.25f, wildLv: 8, injury: 0.12f),
                Zone("mountain_cave", "biome_mountain", "Crystal Cave", 2, 8, 10, 1.5f, "Earth",
                    new[] { "mat_crystal", "mat_resin" }, bonus: new[] { "power_charm" }, wild: 0.3f, wildLv: 10, injury: 0.14f),

                Zone("ocean_tidepool", "biome_ocean", "Tide Pools", 3, 6, 10, 1f, "Water",
                    new[] { "mat_shell", "mat_reeds" }, wild: 0.24f, wildLv: 9, injury: 0.1f),
                Zone("ocean_storm", "biome_ocean", "Storm Cliffs", 3, 10, 12, 1.75f, "Water",
                    new[] { "mat_crystal", "mat_shell" }, bonus: new[] { "lucky_bell" }, wild: 0.35f, wildLv: 12, injury: 0.16f),

                Zone("coast_tidepool", "biome_coast", "Old Tide Pools", 3, 6, 10, 1f, "Water",
                    new[] { "mat_shell", "mat_reeds" }, wild: 0.24f, wildLv: 9, injury: 0.1f),
                Zone("coast_stormcliff", "biome_coast", "Storm Cliffs", 3, 10, 12, 1.75f, "Water",
                    new[] { "mat_crystal", "mat_shell" }, bonus: new[] { "lucky_bell" }, wild: 0.35f, wildLv: 12, injury: 0.16f),

                Zone("ruins_hall", "biome_ruins", "Ancient Hall", 4, 10, 14, 2f, "Shadow",
                    new[] { "mat_relic", "mat_crystal" }, wild: 0.3f, wildLv: 12, injury: 0.16f),
                Zone("ruins_vault", "biome_ruins", "Shadow Vault", 4, 15, 16, 3f, "Shadow",
                    new[] { "mat_relic", "mat_stone" }, bonus: new[] { "speed_seed", "herbal_tonic" }, wild: 0.4f, wildLv: 15, injury: 0.2f)
            };
            return catalog;
        }

        private static ExplorationZoneEntry Zone(
            string id,
            string biomeId,
            string name,
            int rank,
            int minLevel,
            int recLevel,
            float hours,
            string element,
            string[] resources,
            string[] bonus = null,
            float wild = 0.15f,
            int wildLv = 3,
            float injury = 0.08f)
        {
            return new ExplorationZoneEntry
            {
                zoneId = id,
                biomeId = biomeId,
                displayName = name,
                description = $"Explore {name}. Rec. Lv {recLevel}. {element} wilds.",
                requiredTrainerRankIndex = rank,
                minMonsterLevel = minLevel,
                recommendedLevel = recLevel,
                preferredElement = element,
                durationHours = hours,
                resourceItemIds = resources,
                resourceDropChance = 0.8f,
                minResourceAmount = 1,
                maxResourceAmount = 3,
                bonusItemIds = bonus ?? System.Array.Empty<string>(),
                bonusItemChance = bonus != null && bonus.Length > 0 ? 0.25f : 0f,
                minEssence = 4 + rank * 3,
                maxEssence = 10 + rank * 8,
                minTrainerXp = 4 + rank * 2,
                maxTrainerXp = 10 + rank * 4,
                wildEncounterChance = wild,
                wildOpponentLevel = wildLv,
                injuryChance = injury,
                eventChance = 0.5f,
                minTrainingPoints = 1,
                maxTrainingPoints = 1 + rank
            };
        }
    }
}
