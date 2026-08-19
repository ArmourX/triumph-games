using System;
using System.Collections.Generic;
using MonsterCollect.Data;

namespace MonsterCollect.Ranch
{
    /// <summary>Player item storage persisted in ranch save data.</summary>
    public static class PlayerInventoryService
    {
        public static IReadOnlyList<InventoryEntry> Entries
        {
            get
            {
                MonsterCollectionService.EnsureRanchSystemsLoaded();
                return MonsterCollectionService.GetInventorySnapshot();
            }
        }

        public static int GetQuantity(string itemId)
        {
            if (string.IsNullOrEmpty(itemId))
            {
                return 0;
            }

            foreach (InventoryEntry entry in Entries)
            {
                if (entry.itemId == itemId)
                {
                    return entry.quantity;
                }
            }

            return 0;
        }

        public static bool HasItem(string itemId, int amount = 1)
        {
            return GetQuantity(itemId) >= amount;
        }

        public static void AddItem(string itemId, int amount)
        {
            if (string.IsNullOrEmpty(itemId) || amount <= 0)
            {
                return;
            }

            MonsterCollectionService.AddInventoryItem(itemId, amount);
        }

        public static bool TryRemoveItem(string itemId, int amount)
        {
            if (string.IsNullOrEmpty(itemId) || amount <= 0)
            {
                return false;
            }

            return MonsterCollectionService.TryRemoveInventoryItem(itemId, amount);
        }

        public static RanchItemDefinition GetDefinition(string itemId)
        {
            return RanchCatalogRegistry.Items.FindById(itemId);
        }

        public static void GrantStarterPackIfNeeded()
        {
            MonsterCollectionService.GrantStarterInventoryIfNeeded();
        }
    }
}
