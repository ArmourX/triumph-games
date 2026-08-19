using UnityEngine;

namespace MonsterCollect.Circuit
{
    public static class CircuitCatalogRegistry
    {
        private static TournamentCatalog catalog;

        public static TournamentCatalog Catalog
        {
            get
            {
                if (catalog == null)
                {
                    catalog = Resources.Load<TournamentCatalog>(TournamentCatalog.DefaultResourcePath)
                        ?? RuntimeTournamentCatalogFactory.Create();
                }

                return catalog;
            }
        }
    }
}
