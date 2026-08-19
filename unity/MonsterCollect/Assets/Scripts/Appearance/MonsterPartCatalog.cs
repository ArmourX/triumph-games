using System.Collections.Generic;
using UnityEngine;

namespace MonsterCollect.Appearance
{
    /// <summary>
    /// Data-driven registry of all part variants. Loaded from Resources at runtime.
    /// Author new variants via Monster Collect → Content Pipeline Window.
    /// </summary>
    [CreateAssetMenu(fileName = "MonsterPartCatalog", menuName = "Monster Collect/Part Catalog")]
    public class MonsterPartCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "MonsterAppearance/MonsterPartCatalog";

        public MonsterPartVariantDefinition[] Variants = System.Array.Empty<MonsterPartVariantDefinition>();

        private Dictionary<MonsterPartSlot, List<MonsterPartVariantDefinition>> slotLookup;

        public IReadOnlyList<MonsterPartVariantDefinition> GetVariantsForSlot(MonsterPartSlot slot)
        {
            EnsureLookup();
            return slotLookup.TryGetValue(slot, out List<MonsterPartVariantDefinition> list)
                ? list
                : (IReadOnlyList<MonsterPartVariantDefinition>)System.Array.Empty<MonsterPartVariantDefinition>();
        }

        public MonsterPartVariantDefinition FindById(string variantId)
        {
            if (string.IsNullOrEmpty(variantId) || Variants == null)
            {
                return null;
            }

            for (int i = 0; i < Variants.Length; i++)
            {
                MonsterPartVariantDefinition variant = Variants[i];
                if (variant != null && variant.VariantId == variantId)
                {
                    return variant;
                }
            }

            return null;
        }

        private void EnsureLookup()
        {
            if (slotLookup != null)
            {
                return;
            }

            slotLookup = new Dictionary<MonsterPartSlot, List<MonsterPartVariantDefinition>>();

            if (Variants == null)
            {
                return;
            }

            for (int i = 0; i < Variants.Length; i++)
            {
                MonsterPartVariantDefinition variant = Variants[i];
                if (variant == null)
                {
                    continue;
                }

                if (!slotLookup.TryGetValue(variant.Slot, out List<MonsterPartVariantDefinition> list))
                {
                    list = new List<MonsterPartVariantDefinition>();
                    slotLookup[variant.Slot] = list;
                }

                list.Add(variant);
            }

            foreach (List<MonsterPartVariantDefinition> list in slotLookup.Values)
            {
                list.Sort((a, b) => a.SortOrder.CompareTo(b.SortOrder));
            }
        }

        private void OnEnable()
        {
            slotLookup = null;
        }
    }
}
