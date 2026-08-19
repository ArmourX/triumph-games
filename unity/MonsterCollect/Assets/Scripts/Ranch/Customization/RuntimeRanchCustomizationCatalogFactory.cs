using UnityEngine;

namespace MonsterCollect.Ranch
{
    public static class RuntimeRanchCustomizationCatalogFactory
    {
        public const int MaxDecorations = 3;

        public static RanchCustomizationCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<RanchCustomizationCatalog>();
            catalog.Backgrounds = new[]
            {
                Background("bg_meadow", "Meadow", 0, moodDecay: 0.05f),
                Background("bg_highlands", "Highlands", 30, training: 0.05f),
                Background("bg_shrine", "Shrine Grove", 80, moodDecay: 0.1f, training: 0.08f)
            };
            catalog.Decorations = new[]
            {
                Decoration("deco_fountain", "Stone Fountain", 10, essence: 40, mood: 0.02f),
                Decoration("deco_training_dummy", "Training Dummy", 20, essence: 60, training: 0.05f),
                Decoration("deco_herb_garden", "Herb Garden", 40, essence: 80, lifespanPerDay: 0.2f),
                Decoration("deco_trophy_wall", "Trophy Wall", 60, essence: 100, errantry: 0.1f)
            };
            return catalog;
        }

        private static RanchBackgroundDefinition Background(
            string id, string name, int carePoints, float moodDecay = 0f, float training = 0f)
        {
            var def = ScriptableObject.CreateInstance<RanchBackgroundDefinition>();
            def.BackgroundId = id;
            def.DisplayName = name;
            def.Description = name;
            def.UnlockCarePoints = carePoints;
            def.MoodDecayReduction = moodDecay;
            def.TrainingSuccessBonus = training;
            return def;
        }

        private static RanchDecorationDefinition Decoration(
            string id, string name, int carePoints, int essence,
            float mood = 0f, float training = 0f, float lifespanPerDay = 0f, float errantry = 0f)
        {
            var def = ScriptableObject.CreateInstance<RanchDecorationDefinition>();
            def.DecorationId = id;
            def.DisplayName = name;
            def.Description = name;
            def.UnlockCarePoints = carePoints;
            def.EssenceCost = essence;
            def.MoodBonus = mood;
            def.TrainingSuccessBonus = training;
            def.LifespanBonusPerDay = lifespanPerDay;
            def.ErrantryRewardBonus = errantry;
            return def;
        }
    }
}
