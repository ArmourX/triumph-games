using UnityEngine;

namespace MonsterCollect.Ranch
{
    public static class RuntimeAdventureEventCatalogFactory
    {
        public static AdventureEventCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<AdventureEventCatalog>();
            catalog.Events = new[]
            {
                Event("trail_apple", "Trail Snack", "The party found extra food.", AdventureEventKind.Loot, "apple", 1, weight: 11),
                Event("trail_herbs", "Herb Patch", "The party gathered extra herbs.", AdventureEventKind.Loot, "mat_herbs", 2, weight: 14),
                Event("berry_cache", "Berry Cache", "A hidden berry cache!", AdventureEventKind.Loot, "mat_berries", 2, weight: 12),
                Event("spark_stone", "Spark Stone", "A warm stone hummed with power.", AdventureEventKind.Loot, "mat_crystal", 1, weight: 6, biome: "biome_volcano"),
                Event("tide_shell", "Tide Shell", "Waves left a gleaming shell.", AdventureEventKind.Loot, "mat_shell", 1, weight: 8, biome: "biome_ocean"),
                Event("ruin_relic", "Dusty Relic", "Something ancient caught the light.", AdventureEventKind.Loot, "mat_relic", 1, weight: 7, biome: "biome_ruins"),
                Event("sprint_drill", "Trail Sprint", "The party trained on the path.", AdventureEventKind.Training, tp: 2, xp: 8, weight: 12),
                Event("focus_camp", "Quiet Camp", "A calm night sharpened their minds.", AdventureEventKind.Training, tp: 1, xp: 12, mood: 6f, weight: 10),
                Event("rough_night", "Rough Camp", "Sleep was thin. Fatigue set in.", AdventureEventKind.Fatigue, fatigue: 12f, mood: -4f, weight: 9),
                Event("rockslide", "Rockslide", "A close call left bruises.", AdventureEventKind.Injury, injury: 1, fatigue: 10f, weight: 5),
                Event("ember_blessing", "Ember Blessing", "Warm winds restored their spirits.", AdventureEventKind.Blessing, mood: 12f, fatigue: -8f, xp: 10, weight: 4, biome: "biome_volcano"),
                Event("moon_well", "Moon Well", "Cool water washed the weariness away.", AdventureEventKind.Blessing, mood: 10f, fatigue: -10f, weight: 4),
                Event("wild_shadow", "Wild Shadow", "Something watches from the brush.", AdventureEventKind.Wild, weight: 11)
            };
            return catalog;
        }

        private static AdventureEventEntry Event(
            string id,
            string name,
            string log,
            AdventureEventKind kind,
            string item = "",
            int amount = 1,
            int tp = 0,
            int xp = 0,
            float fatigue = 0f,
            float mood = 0f,
            int injury = 0,
            int weight = 10,
            string biome = "")
        {
            return new AdventureEventEntry
            {
                eventId = id,
                displayName = name,
                logText = log,
                kind = kind,
                itemId = item,
                itemAmount = amount,
                trainingPoints = tp,
                battleXp = xp,
                fatigueDelta = fatigue,
                moodDelta = mood,
                injurySeverity = injury,
                weight = weight,
                biomeId = biome
            };
        }
    }
}
