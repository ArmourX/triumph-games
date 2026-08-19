using UnityEngine;

using UnityEngine;

// Content pipeline: Resources.Load first, RuntimeSpeciesCatalogFactory fallback.
// Author via Monster Collect → Content Pipeline Window.
namespace MonsterCollect.Monster
{
    public static class GameContentRegistry
    {
        private static SpeciesCatalog speciesCatalog;
        private static TypeCombinationCatalog typeCombinationCatalog;
        private static EvolutionCatalog evolutionCatalog;

        public static SpeciesCatalog Species
        {
            get
            {
                if (speciesCatalog == null)
                {
                    speciesCatalog = Resources.Load<SpeciesCatalog>(SpeciesCatalog.DefaultResourcePath)
                        ?? RuntimeSpeciesCatalogFactory.Create();
                }

                return speciesCatalog;
            }
        }

        public static TypeCombinationCatalog TypeCombinations
        {
            get
            {
                if (typeCombinationCatalog == null)
                {
                    typeCombinationCatalog = Resources.Load<TypeCombinationCatalog>(TypeCombinationCatalog.DefaultResourcePath)
                        ?? RuntimeSpeciesCatalogFactory.CreateTypeCombinations();
                }

                return typeCombinationCatalog;
            }
        }

        public static EvolutionCatalog Evolution
        {
            get
            {
                if (evolutionCatalog == null)
                {
                    evolutionCatalog = Resources.Load<EvolutionCatalog>(EvolutionCatalog.DefaultResourcePath)
                        ?? RuntimeEvolutionCatalogFactory.Create();
                }

                return evolutionCatalog;
            }
        }
    }
}
