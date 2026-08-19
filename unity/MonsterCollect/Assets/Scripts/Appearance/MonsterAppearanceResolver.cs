using MonsterCollect.Monster;
using UnityEngine;

namespace MonsterCollect.Appearance
{
    /// <summary>
    /// Maps SHA-256 hash segments to catalog variant IDs.
    /// Same hash always yields the same part selection.
    /// </summary>
    public static class MonsterAppearanceResolver
    {
        private static MonsterPartCatalog cachedCatalog;

        public static MonsterPartCatalog Catalog
        {
            get
            {
                if (cachedCatalog == null)
                {
                    cachedCatalog = Resources.Load<MonsterPartCatalog>(MonsterPartCatalog.DefaultResourcePath);
                }

                if (cachedCatalog == null)
                {
                    cachedCatalog = RuntimePartCatalogFactory.Create();
                }

                return cachedCatalog;
            }
        }

        public static MonsterAppearanceSelection Resolve(MonsterData data)
        {
            var selection = new MonsterAppearanceSelection();
            MonsterPartCatalog catalog = Catalog;

            if (catalog == null || data == null)
            {
                return selection;
            }

            MonsterEvolutionService.EnsureIdentityFields(data);

            if (data.EvolutionStage > 0 && data.AppearanceSelection != null && data.AppearanceSelection.IsValid)
            {
                ApplyCustomizationAccessory(data, data.AppearanceSelection);
                return data.AppearanceSelection;
            }

            byte[] hash = data.EvolutionStage > 0
                ? MonsterEvolutionService.GetAppearanceHashBytes(data)
                : MonsterHashUtility.GetHashBytes(data);

            selection.SetVariantId(MonsterPartSlot.Body, PickVariantId(catalog, MonsterPartSlot.Body, hash[0]));
            selection.SetVariantId(MonsterPartSlot.Head, PickVariantId(catalog, MonsterPartSlot.Head, hash[1]));
            selection.SetVariantId(MonsterPartSlot.ArmsLegs, PickVariantId(catalog, MonsterPartSlot.ArmsLegs, hash[2]));
            selection.SetVariantId(MonsterPartSlot.Tail, PickVariantId(catalog, MonsterPartSlot.Tail, hash[3]));
            selection.SetVariantId(MonsterPartSlot.Eyes, PickVariantId(catalog, MonsterPartSlot.Eyes, hash[4]));
            selection.SetVariantId(MonsterPartSlot.PatternOverlay, PickVariantId(catalog, MonsterPartSlot.PatternOverlay, hash[5]));
            selection.SetVariantId(MonsterPartSlot.Accessory, PickVariantId(catalog, MonsterPartSlot.Accessory, hash[6]));

            ApplyCustomizationAccessory(data, selection);
            return selection;
        }

        private static void ApplyCustomizationAccessory(MonsterData data, MonsterAppearanceSelection selection)
        {
            if (data?.Customization == null ||
                string.IsNullOrEmpty(data.Customization.equippedAccessoryVariantId))
            {
                return;
            }

            selection.SetVariantId(MonsterPartSlot.Accessory, data.Customization.equippedAccessoryVariantId);
        }

        private static string PickVariantId(MonsterPartCatalog catalog, MonsterPartSlot slot, byte hashByte)
        {
            var variants = catalog.GetVariantsForSlot(slot);
            if (variants == null || variants.Count == 0)
            {
                return null;
            }

            int index = hashByte % variants.Count;
            return variants[index]?.VariantId;
        }
    }
}
