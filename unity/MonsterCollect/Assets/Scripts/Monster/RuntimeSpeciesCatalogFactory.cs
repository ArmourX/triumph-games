using MonsterCollect.Battle;
using UnityEngine;

namespace MonsterCollect.Monster
{
    public static class RuntimeSpeciesCatalogFactory
    {
        public static SpeciesCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<SpeciesCatalog>();
            catalog.Species = new[]
            {
                Create(MonsterSpecies.Beast, "Beast", BattleElement.Earth, "earth_slam", "war_cry", 0.75f, 0f, 0f, 0f, 0f, 0f, 0f, 0.25f),
                Create(MonsterSpecies.Dragon, "Dragon", BattleElement.Fire, "flame_burst", "power_surge", 0f, 0.75f, 0f, 0f, 0f, 0f, 0f, 0.25f),
                Create(MonsterSpecies.Slime, "Slime", BattleElement.Water, "water_pulse", "shadow_hex", 0f, 0f, 0.75f, 0f, 0f, 0f, 0.1f, 0.15f),
                Create(MonsterSpecies.Elemental, "Elemental", BattleElement.Electric, "thunder_bolt", "power_surge", 0f, 0f, 0f, 0.75f, 0f, 0f, 0f, 0.25f),
                Create(MonsterSpecies.Spirit, "Spirit", BattleElement.Wind, "gale_strike", "curse", 0f, 0f, 0f, 0f, 0.75f, 0f, 0f, 0.25f),
                Create(MonsterSpecies.Insect, "Insect", BattleElement.Grass, "vine_whip", "sleep_dust", 0f, 0f, 0f, 0f, 0f, 0.75f, 0f, 0.25f),
                Create(MonsterSpecies.Aquatic, "Aquatic", BattleElement.Water, "water_pulse", "iron_guard", 0f, 0f, 0f, 0f, 0f, 0f, 0.75f, 0.25f),
                Create(MonsterSpecies.Undead, "Undead", BattleElement.Shadow, "shadow_hex", "curse", 0f, 0f, 0f, 0f, 0.1f, 0f, 0f, 0.9f)
            };

            return catalog;
        }

        public static TypeCombinationCatalog CreateTypeCombinations()
        {
            var catalog = ScriptableObject.CreateInstance<TypeCombinationCatalog>();
            catalog.Combinations = new[]
            {
                Combo("beast_dragon", MonsterSpecies.Beast, MonsterSpecies.Dragon, MonsterSpecies.Dragon, 0.6f, BattleElement.Fire),
                Combo("slime_aquatic", MonsterSpecies.Slime, MonsterSpecies.Aquatic, MonsterSpecies.Aquatic, 0.55f, BattleElement.Water),
                Combo("spirit_undead", MonsterSpecies.Spirit, MonsterSpecies.Undead, MonsterSpecies.Undead, 0.5f, BattleElement.Shadow),
                Combo("insect_elemental", MonsterSpecies.Insect, MonsterSpecies.Elemental, MonsterSpecies.Elemental, 0.55f, BattleElement.Electric)
            };

            return catalog;
        }

        private static SpeciesDefinition Create(
            MonsterSpecies species,
            string displayName,
            BattleElement element,
            string primaryMove,
            string secondaryMove,
            float beast,
            float dragon,
            float slime,
            float elemental,
            float spirit,
            float insect,
            float aquatic,
            float undead)
        {
            var def = ScriptableObject.CreateInstance<SpeciesDefinition>();
            def.Species = species;
            def.DisplayName = displayName;
            def.PrimaryElement = element;
            def.PrimaryMoveId = primaryMove;
            def.SecondaryMoveId = secondaryMove;
            def.DefaultAffinities = new[] { beast, dragon, slime, elemental, spirit, insect, aquatic, undead };
            return def;
        }

        private static TypeCombinationDefinition Combo(
            string id,
            MonsterSpecies a,
            MonsterSpecies b,
            MonsterSpecies preferred,
            float weight,
            BattleElement bonus)
        {
            var combo = ScriptableObject.CreateInstance<TypeCombinationDefinition>();
            combo.CombinationId = id;
            combo.ParentA = a;
            combo.ParentB = b;
            combo.PreferredOffspring = preferred;
            combo.OffspringWeight = weight;
            combo.BonusElement = bonus;
            return combo;
        }
    }
}
