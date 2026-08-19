using System;
using UnityEngine;

namespace MonsterCollect.Ranch
{
    [Serializable]
    public class ExplorationZoneEntry
    {
        public string zoneId = "meadow_forage";
        public string biomeId = "biome_meadow";
        public string displayName = "Meadow Forage";
        public string description = "Gather common herbs and berries.";
        public int requiredTrainerRankIndex;
        public int minMonsterLevel = 1;
        public float durationHours = 0.25f;
        public string[] resourceItemIds = Array.Empty<string>();
        public float resourceDropChance = 0.75f;
        public int minResourceAmount = 1;
        public int maxResourceAmount = 2;
        public string[] bonusItemIds = Array.Empty<string>();
        public float bonusItemChance = 0.2f;
        public int minEssence;
        public int maxEssence = 8;
        public int minTrainerXp = 3;
        public int maxTrainerXp = 8;
        [Range(0f, 1f)] public float wildEncounterChance = 0.15f;
        public int wildOpponentLevel = 3;
        public int recommendedLevel = 1;
        public string preferredElement = string.Empty;
        [Range(0f, 1f)] public float injuryChance = 0.08f;
        [Range(0f, 1f)] public float eventChance = 0.45f;
        public int minTrainingPoints = 1;
        public int maxTrainingPoints = 2;
    }

    [CreateAssetMenu(fileName = "ExplorationZoneCatalog", menuName = "Monster Collect/Exploration Zone Catalog")]
    public class ExplorationZoneCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Ranch/ExplorationZoneCatalog";

        public ExplorationZoneEntry[] Zones = Array.Empty<ExplorationZoneEntry>();

        public ExplorationZoneEntry FindById(string zoneId)
        {
            if (string.IsNullOrEmpty(zoneId) || Zones == null)
            {
                return null;
            }

            for (int i = 0; i < Zones.Length; i++)
            {
                ExplorationZoneEntry zone = Zones[i];
                if (zone != null && zone.zoneId == zoneId)
                {
                    return zone;
                }
            }

            return null;
        }
    }
}
