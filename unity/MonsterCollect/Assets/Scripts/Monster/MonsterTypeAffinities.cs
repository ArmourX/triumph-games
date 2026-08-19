using System;
using UnityEngine;

namespace MonsterCollect.Monster
{
    /// <summary>
    /// Weighted affinity toward each monster family (species type).
    /// Values are normalized to sum to 1.0 after blending.
    /// </summary>
    [Serializable]
    public class MonsterTypeAffinities
    {
        public float beast;
        public float dragon;
        public float slime;
        public float elemental;
        public float spirit;
        public float insect;
        public float aquatic;
        public float undead;

        public float GetWeight(MonsterSpecies species)
        {
            return species switch
            {
                MonsterSpecies.Beast => beast,
                MonsterSpecies.Dragon => dragon,
                MonsterSpecies.Slime => slime,
                MonsterSpecies.Elemental => elemental,
                MonsterSpecies.Spirit => spirit,
                MonsterSpecies.Insect => insect,
                MonsterSpecies.Aquatic => aquatic,
                MonsterSpecies.Undead => undead,
                _ => 0f
            };
        }

        public void SetWeight(MonsterSpecies species, float value)
        {
            switch (species)
            {
                case MonsterSpecies.Beast: beast = value; break;
                case MonsterSpecies.Dragon: dragon = value; break;
                case MonsterSpecies.Slime: slime = value; break;
                case MonsterSpecies.Elemental: elemental = value; break;
                case MonsterSpecies.Spirit: spirit = value; break;
                case MonsterSpecies.Insect: insect = value; break;
                case MonsterSpecies.Aquatic: aquatic = value; break;
                case MonsterSpecies.Undead: undead = value; break;
            }
        }

        public bool IsEmpty()
        {
            return beast + dragon + slime + elemental + spirit + insect + aquatic + undead < 0.001f;
        }

        /// <summary>Single-species profile used for QR captures and backfill.</summary>
        public static MonsterTypeAffinities FromDominantSpecies(MonsterSpecies species, float dominance = 0.75f)
        {
            var affinities = new MonsterTypeAffinities();
            float remainder = 1f - dominance;
            float spread = remainder / 7f;

            foreach (MonsterSpecies value in Enum.GetValues(typeof(MonsterSpecies)))
            {
                affinities.SetWeight(value, value == species ? dominance : spread);
            }

            return affinities;
        }

        /// <summary>Even 50/50 merge of two parent affinity profiles.</summary>
        public static MonsterTypeAffinities Blend(MonsterTypeAffinities parentA, MonsterTypeAffinities parentB)
        {
            var blended = new MonsterTypeAffinities();

            foreach (MonsterSpecies species in Enum.GetValues(typeof(MonsterSpecies)))
            {
                float weight = parentA.GetWeight(species) * 0.5f + parentB.GetWeight(species) * 0.5f;
                blended.SetWeight(species, weight);
            }

            blended.Normalize();
            return blended;
        }

        public MonsterSpecies GetDominantSpecies()
        {
            MonsterSpecies dominant = MonsterSpecies.Beast;
            float best = -1f;

            foreach (MonsterSpecies species in Enum.GetValues(typeof(MonsterSpecies)))
            {
                float weight = GetWeight(species);
                if (weight > best)
                {
                    best = weight;
                    dominant = species;
                }
            }

            return dominant;
        }

        public string FormatTopAffinities(int count = 3)
        {
            var species = (MonsterSpecies[])Enum.GetValues(typeof(MonsterSpecies));
            Array.Sort(species, (a, b) => GetWeight(b).CompareTo(GetWeight(a)));

            count = Mathf.Clamp(count, 1, species.Length);
            var parts = new string[count];

            for (int i = 0; i < count; i++)
            {
                float percent = GetWeight(species[i]) * 100f;
                parts[i] = $"{species[i]} {percent:0}%";
            }

            return string.Join(" · ", parts);
        }

        public void Normalize()
        {
            float total = beast + dragon + slime + elemental + spirit + insect + aquatic + undead;

            if (total <= 0.001f)
            {
                var fallback = FromDominantSpecies(MonsterSpecies.Beast);
                beast = fallback.beast;
                dragon = fallback.dragon;
                slime = fallback.slime;
                elemental = fallback.elemental;
                spirit = fallback.spirit;
                insect = fallback.insect;
                aquatic = fallback.aquatic;
                undead = fallback.undead;
                return;
            }

            beast /= total;
            dragon /= total;
            slime /= total;
            elemental /= total;
            spirit /= total;
            insect /= total;
            aquatic /= total;
            undead /= total;
        }
    }
}
