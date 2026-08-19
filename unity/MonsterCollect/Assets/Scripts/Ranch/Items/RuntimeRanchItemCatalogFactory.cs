using UnityEngine;

namespace MonsterCollect.Ranch
{
    public static class RuntimeRanchItemCatalogFactory
    {
        public static RanchItemCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<RanchItemCatalog>();
            catalog.Items = new[]
            {
                Item("apple", "Crisp Apple", RanchItemCategory.Food, hunger: 25f, mood: 3f),
                Item("hearty_stew", "Hearty Stew", RanchItemCategory.Food, hunger: 45f, energy: 10f, mood: 8f),
                Item("vitality_soup", "Vitality Soup", RanchItemCategory.Food, hunger: 20f, lifespan: 5f, fatigue: -10f),
                Item("energy_drink", "Energy Drink", RanchItemCategory.Food, energy: 35f, hunger: -5f),
                Item("care_treat", "Care Treat", RanchItemCategory.Food, hunger: 15f, mood: 15f, fatigue: -5f),
                Item("herbal_tonic", "Herbal Tonic", RanchItemCategory.Medicine, energy: 20f, mood: 10f, fatigue: -20f, lifespan: 3f),
                Item("revive_mist", "Revive Mist", RanchItemCategory.Medicine, energy: 50f, mood: 20f, fatigue: -30f),
                Item("power_charm", "Power Charm", RanchItemCategory.Training, attack: 1, trainingBonus: 0.15f),
                Item("speed_seed", "Speed Seed", RanchItemCategory.Training, speed: 1, trainingBonus: 0.15f),
                Item("iron_tablet", "Iron Tablet", RanchItemCategory.Training, defense: 1),
                Item("mind_tea", "Mind Tea", RanchItemCategory.Training, trainingBonus: 0.2f, mood: 5f),
                Item("lucky_bell", "Lucky Bell", RanchItemCategory.Charm, mood: 5f, battleBonus: 0.05f),
                Item("longevity_pill", "Longevity Pill", RanchItemCategory.Medicine, lifespan: 12f, mood: -3f),
                Material("mat_berries", "Wild Berries"),
                Material("mat_herbs", "Forest Herbs"),
                Material("mat_mushroom", "Cave Mushroom"),
                Material("mat_reeds", "River Reeds"),
                Material("mat_stone", "Smooth Stone"),
                Material("mat_crystal", "Glow Crystal"),
                Material("mat_shell", "Sea Shell"),
                Material("mat_resin", "Tree Resin"),
                Material("mat_relic", "Ancient Relic")
            };
            return catalog;
        }

        private static RanchItemDefinition Item(
            string id,
            string name,
            RanchItemCategory category,
            float hunger = 0f,
            float energy = 0f,
            float mood = 0f,
            float lifespan = 0f,
            float fatigue = 0f,
            int attack = 0,
            int defense = 0,
            int speed = 0,
            float trainingBonus = 0f,
            float battleBonus = 0f)
        {
            var def = ScriptableObject.CreateInstance<RanchItemDefinition>();
            def.ItemId = id;
            def.DisplayName = name;
            def.Category = category;
            def.HungerDelta = hunger;
            def.EnergyDelta = energy;
            def.MoodDelta = mood;
            def.LifespanDelta = lifespan;
            def.FatigueDelta = fatigue;
            def.AttackDelta = attack;
            def.DefenseDelta = defense;
            def.SpeedDelta = speed;
            def.TrainingSuccessBonus = trainingBonus;
            def.BattleDamageBonus = battleBonus;
            def.Description = BuildDescription(def);
            return def;
        }

        private static RanchItemDefinition Material(string id, string name)
        {
            var def = ScriptableObject.CreateInstance<RanchItemDefinition>();
            def.ItemId = id;
            def.DisplayName = name;
            def.Category = RanchItemCategory.Material;
            def.Description = $"{name} — crafting material from exploration.";
            return def;
        }

        private static string BuildDescription(RanchItemDefinition def)
        {
            return $"{def.DisplayName} — consumable for ranch care.";
        }
    }
}
