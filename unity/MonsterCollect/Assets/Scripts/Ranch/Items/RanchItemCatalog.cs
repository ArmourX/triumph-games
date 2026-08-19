using UnityEngine;

namespace MonsterCollect.Ranch
{
    [CreateAssetMenu(fileName = "RanchItemCatalog", menuName = "Monster Collect/Ranch Item Catalog")]
    public class RanchItemCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Ranch/RanchItemCatalog";

        public RanchItemDefinition[] Items = System.Array.Empty<RanchItemDefinition>();

        public RanchItemDefinition FindById(string itemId)
        {
            if (string.IsNullOrEmpty(itemId) || Items == null)
            {
                return null;
            }

            for (int i = 0; i < Items.Length; i++)
            {
                RanchItemDefinition item = Items[i];
                if (item != null && item.ItemId == itemId)
                {
                    return item;
                }
            }

            return null;
        }
    }
}
