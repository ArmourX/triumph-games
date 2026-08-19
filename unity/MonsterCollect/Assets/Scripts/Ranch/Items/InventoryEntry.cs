using System;

namespace MonsterCollect.Ranch
{
    [Serializable]
    public class InventoryEntry
    {
        public string itemId = string.Empty;
        public int quantity;

        public InventoryEntry()
        {
        }

        public InventoryEntry(string itemId, int quantity)
        {
            this.itemId = itemId;
            this.quantity = quantity;
        }
    }
}
