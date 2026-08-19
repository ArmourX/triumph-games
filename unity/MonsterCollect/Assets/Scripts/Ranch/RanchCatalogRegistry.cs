using UnityEngine;

namespace MonsterCollect.Ranch
{
    /// <summary>Loads ranch ScriptableObject catalogs from Resources or runtime fallbacks.</summary>
    public static class RanchCatalogRegistry
    {
        private static RanchItemCatalog itemCatalog;
        private static RanchFacilityCatalog facilityCatalog;
        private static ErrantryMissionCatalog errantryCatalog;
        private static RanchCustomizationCatalog customizationCatalog;
        private static RanchBiomeCatalog biomeCatalog;
        private static ExplorationZoneCatalog explorationZoneCatalog;
        private static CraftingRecipeCatalog craftingCatalog;
        private static AdventureEventCatalog adventureEventCatalog;

        public static RanchItemCatalog Items
        {
            get
            {
                if (itemCatalog == null)
                {
                    itemCatalog = Resources.Load<RanchItemCatalog>(RanchItemCatalog.DefaultResourcePath)
                        ?? RuntimeRanchItemCatalogFactory.Create();
                }

                return itemCatalog;
            }
        }

        public static RanchFacilityCatalog Facilities
        {
            get
            {
                if (facilityCatalog == null)
                {
                    facilityCatalog = Resources.Load<RanchFacilityCatalog>(RanchFacilityCatalog.DefaultResourcePath)
                        ?? RuntimeRanchFacilityCatalogFactory.Create();
                }

                return facilityCatalog;
            }
        }

        public static ErrantryMissionCatalog Errantry
        {
            get
            {
                if (errantryCatalog == null)
                {
                    errantryCatalog = Resources.Load<ErrantryMissionCatalog>(ErrantryMissionCatalog.DefaultResourcePath)
                        ?? RuntimeErrantryMissionCatalogFactory.Create();
                }

                return errantryCatalog;
            }
        }

        public static RanchCustomizationCatalog Customization
        {
            get
            {
                if (customizationCatalog == null)
                {
                    customizationCatalog = Resources.Load<RanchCustomizationCatalog>(RanchCustomizationCatalog.DefaultResourcePath)
                        ?? RuntimeRanchCustomizationCatalogFactory.Create();
                }

                return customizationCatalog;
            }
        }

        public static RanchBiomeCatalog Biomes
        {
            get
            {
                if (biomeCatalog == null)
                {
                    biomeCatalog = Resources.Load<RanchBiomeCatalog>(RanchBiomeCatalog.DefaultResourcePath)
                        ?? RuntimeRanchBiomeCatalogFactory.Create();
                }

                return biomeCatalog;
            }
        }

        public static ExplorationZoneCatalog ExplorationZones
        {
            get
            {
                if (explorationZoneCatalog == null)
                {
                    explorationZoneCatalog = Resources.Load<ExplorationZoneCatalog>(ExplorationZoneCatalog.DefaultResourcePath)
                        ?? RuntimeExplorationZoneCatalogFactory.Create();
                }

                return explorationZoneCatalog;
            }
        }

        public static CraftingRecipeCatalog Crafting
        {
            get
            {
                if (craftingCatalog == null)
                {
                    craftingCatalog = Resources.Load<CraftingRecipeCatalog>(CraftingRecipeCatalog.DefaultResourcePath)
                        ?? RuntimeCraftingRecipeCatalogFactory.Create();
                }

                return craftingCatalog;
            }
        }

        public static AdventureEventCatalog AdventureEvents
        {
            get
            {
                if (adventureEventCatalog == null)
                {
                    adventureEventCatalog = Resources.Load<AdventureEventCatalog>(AdventureEventCatalog.DefaultResourcePath)
                        ?? RuntimeAdventureEventCatalogFactory.Create();
                }

                return adventureEventCatalog;
            }
        }
    }
}
