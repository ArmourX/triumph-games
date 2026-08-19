using UnityEngine;

namespace MonsterCollect.Monster
{
    [CreateAssetMenu(fileName = "TypeCombinationCatalog", menuName = "Monster Collect/Type Combination Catalog")]
    public class TypeCombinationCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Monster/TypeCombinationCatalog";

        public TypeCombinationDefinition[] Combinations = System.Array.Empty<TypeCombinationDefinition>();

        public TypeCombinationDefinition Find(MonsterSpecies a, MonsterSpecies b)
        {
            if (Combinations == null)
            {
                return null;
            }

            for (int i = 0; i < Combinations.Length; i++)
            {
                TypeCombinationDefinition combo = Combinations[i];
                if (combo == null)
                {
                    continue;
                }

                if (Matches(combo, a, b))
                {
                    return combo;
                }
            }

            return null;
        }

        private static bool Matches(TypeCombinationDefinition combo, MonsterSpecies a, MonsterSpecies b)
        {
            return (combo.ParentA == a && combo.ParentB == b) ||
                   (combo.ParentA == b && combo.ParentB == a);
        }
    }
}
