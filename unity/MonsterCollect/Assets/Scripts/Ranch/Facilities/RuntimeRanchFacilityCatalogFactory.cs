using UnityEngine;

namespace MonsterCollect.Ranch
{
    public static class RuntimeRanchFacilityCatalogFactory
    {
        public static RanchFacilityCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<RanchFacilityCatalog>();
            catalog.Facilities = new[]
            {
                Facility("facility_gym", "Training Gym", RanchFacilityKind.Gym,
                    carePoints: 0, attack: 1, defense: 1, fatigue: 15f),
                Facility("facility_spa", "Relaxation Spa", RanchFacilityKind.Spa,
                    carePoints: 25, dex: 5, fatigueRelief: 35f, mood: 15f, lifespan: 2f),
                Facility("facility_library", "Move Library", RanchFacilityKind.Library,
                    carePoints: 50, wins: 3, moveChance: 0.35f, move: "iron_guard")
            };
            return catalog;
        }

        private static RanchFacilityDefinition Facility(
            string id,
            string name,
            RanchFacilityKind kind,
            int carePoints = 0,
            int dex = 0,
            int wins = 0,
            int attack = 0,
            int defense = 0,
            int speed = 0,
            float mood = 0f,
            float lifespan = 0f,
            float fatigueRelief = 0f,
            float fatigue = 0f,
            float moveChance = 0f,
            string move = "war_cry")
        {
            var def = ScriptableObject.CreateInstance<RanchFacilityDefinition>();
            def.FacilityId = id;
            def.DisplayName = name;
            def.Kind = kind;
            def.Description = name;
            def.RequiredCarePoints = carePoints;
            def.RequiredDexUnlocks = dex;
            def.RequiredBattleWins = wins;
            def.AttackGain = attack;
            def.DefenseGain = defense;
            def.SpeedGain = speed;
            def.MoodGain = mood;
            def.LifespanRestore = lifespan;
            def.FatigueRelief = fatigueRelief;
            def.FatigueCost = fatigue;
            def.MoveLearnChance = moveChance;
            def.MoveToTeach = move;
            return def;
        }
    }
}
