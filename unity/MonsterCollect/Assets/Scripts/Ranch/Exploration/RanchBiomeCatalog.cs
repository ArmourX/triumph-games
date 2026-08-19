using System;
using UnityEngine;

namespace MonsterCollect.Ranch
{
    [Serializable]
    public class RanchBiomeEntry
    {
        public string biomeId = "biome_meadow";
        public string displayName = "Home Meadow";
        public string description = "Your starting ranch lands.";
        public int requiredTrainerRankIndex;
        public string backgroundId = "bg_meadow";
        public Color mapTint = new Color(0.45f, 0.75f, 0.45f);
        public int recommendedLevel = 1;
        public string preferredElement = string.Empty;
        public string storyUnlockId = string.Empty;
    }

    [CreateAssetMenu(fileName = "RanchBiomeCatalog", menuName = "Monster Collect/Ranch Biome Catalog")]
    public class RanchBiomeCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Ranch/RanchBiomeCatalog";

        public RanchBiomeEntry[] Biomes = Array.Empty<RanchBiomeEntry>();

        public RanchBiomeEntry FindById(string biomeId)
        {
            if (string.IsNullOrEmpty(biomeId) || Biomes == null)
            {
                return null;
            }

            for (int i = 0; i < Biomes.Length; i++)
            {
                RanchBiomeEntry biome = Biomes[i];
                if (biome != null && biome.biomeId == biomeId)
                {
                    return biome;
                }
            }

            return null;
        }
    }
}
