using UnityEngine;

namespace MonsterCollect.Ranch
{
    public static class RuntimeRanchBiomeCatalogFactory
    {
        public static RanchBiomeCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<RanchBiomeCatalog>();
            catalog.Biomes = new[]
            {
                Biome("biome_meadow", "Home Meadow", "Gentle fields around the ranch. Safe first trips.", 0, "bg_meadow", 0.45f, 0.75f, 0.45f, 1, "Grass", string.Empty),
                Biome("biome_forest", "Verdant Forest", "Shaded trails and thickets. Grass-leaning wilds.", 1, "bg_forest", 0.25f, 0.6f, 0.35f, 4, "Grass", "forest_open"),
                Biome("biome_volcano", "Ashen Volcano", "Heat, cinders, and Fire-leaning wilds.", 2, "bg_volcano", 0.72f, 0.32f, 0.18f, 8, "Fire", "volcano_open"),
                Biome("biome_mountain", "Stone Peaks", "High passes and crystal caves.", 2, "bg_mountain", 0.55f, 0.55f, 0.6f, 8, "Earth", string.Empty),
                Biome("biome_ocean", "Open Ocean", "Tide pools and storm cliffs. Water-leaning wilds.", 3, "bg_ocean", 0.28f, 0.55f, 0.82f, 10, "Water", "ocean_open"),
                Biome("biome_coast", "Sunlit Coast", "Older coastal routes still in the atlas.", 3, "bg_coast", 0.35f, 0.65f, 0.85f, 10, "Water", string.Empty),
                Biome("biome_ruins", "Ancient Ruins", "Relics and shadow. High risk, rare finds.", 4, "bg_ruins", 0.5f, 0.4f, 0.65f, 14, "Shadow", "ruins_open")
            };
            return catalog;
        }

        private static RanchBiomeEntry Biome(
            string id,
            string name,
            string desc,
            int rank,
            string bg,
            float r,
            float g,
            float b,
            int recLevel,
            string element,
            string storyId)
        {
            return new RanchBiomeEntry
            {
                biomeId = id,
                displayName = name,
                description = desc,
                requiredTrainerRankIndex = rank,
                backgroundId = bg,
                mapTint = new Color(r, g, b),
                recommendedLevel = recLevel,
                preferredElement = element,
                storyUnlockId = storyId
            };
        }
    }
}
