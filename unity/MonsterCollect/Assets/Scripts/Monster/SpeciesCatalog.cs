using System.Collections.Generic;
using UnityEngine;

namespace MonsterCollect.Monster
{
    [CreateAssetMenu(fileName = "SpeciesCatalog", menuName = "Monster Collect/Species Catalog")]
    public class SpeciesCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Monster/SpeciesCatalog";

        public SpeciesDefinition[] Species = System.Array.Empty<SpeciesDefinition>();

        private Dictionary<MonsterSpecies, SpeciesDefinition> lookup;

        public SpeciesDefinition Find(MonsterSpecies species)
        {
            EnsureLookup();
            return lookup.TryGetValue(species, out SpeciesDefinition def) ? def : null;
        }

        public SpeciesDefinition FindByMoveId(string moveId)
        {
            if (string.IsNullOrEmpty(moveId) || Species == null)
            {
                return null;
            }

            for (int i = 0; i < Species.Length; i++)
            {
                SpeciesDefinition def = Species[i];
                if (def != null &&
                    (def.PrimaryMoveId == moveId || def.SecondaryMoveId == moveId))
                {
                    return def;
                }
            }

            return null;
        }

        private void EnsureLookup()
        {
            if (lookup != null)
            {
                return;
            }

            lookup = new Dictionary<MonsterSpecies, SpeciesDefinition>();
            if (Species == null)
            {
                return;
            }

            for (int i = 0; i < Species.Length; i++)
            {
                SpeciesDefinition def = Species[i];
                if (def != null)
                {
                    lookup[def.Species] = def;
                }
            }
        }

        private void OnEnable()
        {
            lookup = null;
        }
    }
}
