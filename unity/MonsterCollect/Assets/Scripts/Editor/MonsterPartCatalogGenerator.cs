using System.Collections.Generic;
using System.IO;
using MonsterCollect.Appearance;
using UnityEditor;
using UnityEngine;

namespace MonsterCollect.Editor
{
    /// <summary>Creates the default part catalog and variant assets under Resources.</summary>
    public static class MonsterPartCatalogGenerator
    {
        private const string ResourceFolder = "Assets/Resources/MonsterAppearance";
        private const string VariantsFolder = ResourceFolder + "/Variants";
        private const string CatalogPath = ResourceFolder + "/MonsterPartCatalog.asset";

        [MenuItem("Monster Collect/Generate Default Part Catalog")]
        public static void GenerateDefaultCatalog()
        {
            EnsureFolder(ResourceFolder);
            EnsureFolder(VariantsFolder);

            var variantEntries = new List<MonsterPartVariantDefinition>();
            variantEntries.AddRange(CreateBodyVariants());
            variantEntries.AddRange(CreateHeadVariants());
            variantEntries.AddRange(CreateLimbsVariants());
            variantEntries.AddRange(CreateTailVariants());
            variantEntries.AddRange(CreateEyeVariants());
            variantEntries.AddRange(CreatePatternVariants());
            variantEntries.AddRange(CreateAccessoryVariants());

            MonsterPartCatalog catalog = AssetDatabase.LoadAssetAtPath<MonsterPartCatalog>(CatalogPath);
            if (catalog == null)
            {
                catalog = ScriptableObject.CreateInstance<MonsterPartCatalog>();
                AssetDatabase.CreateAsset(catalog, CatalogPath);
            }

            catalog.Variants = variantEntries.ToArray();
            EditorUtility.SetDirty(catalog);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log($"Monster part catalog generated with {variantEntries.Count} variants at {CatalogPath}");
        }

        private static IEnumerable<MonsterPartVariantDefinition> CreateBodyVariants()
        {
            yield return SaveVariant("body_round", MonsterPartSlot.Body, 0, MonsterPartShapeKind.BodyRound);
            yield return SaveVariant("body_oval", MonsterPartSlot.Body, 0, MonsterPartShapeKind.BodyOval);
            yield return SaveVariant("body_angular", MonsterPartSlot.Body, 0, MonsterPartShapeKind.BodyAngular);
            yield return SaveVariant("body_blob", MonsterPartSlot.Body, 0, MonsterPartShapeKind.BodyBlob);
        }

        private static IEnumerable<MonsterPartVariantDefinition> CreateHeadVariants()
        {
            yield return SaveVariant("head_round", MonsterPartSlot.Head, 10, MonsterPartShapeKind.HeadRound);
            yield return SaveVariant("head_pointed", MonsterPartSlot.Head, 10, MonsterPartShapeKind.HeadPointed);
            yield return SaveVariant("head_wide", MonsterPartSlot.Head, 10, MonsterPartShapeKind.HeadWide);
            yield return SaveVariant("head_small", MonsterPartSlot.Head, 10, MonsterPartShapeKind.HeadSmall);
        }

        private static IEnumerable<MonsterPartVariantDefinition> CreateLimbsVariants()
        {
            yield return SaveVariant("limbs_stub", MonsterPartSlot.ArmsLegs, 5, MonsterPartShapeKind.LimbsStub, PartTintMode.Secondary);
            yield return SaveVariant("limbs_long", MonsterPartSlot.ArmsLegs, 5, MonsterPartShapeKind.LimbsLong, PartTintMode.Secondary);
            yield return SaveVariant("limbs_none", MonsterPartSlot.ArmsLegs, 5, MonsterPartShapeKind.None);
        }

        private static IEnumerable<MonsterPartVariantDefinition> CreateTailVariants()
        {
            yield return SaveVariant("tail_short", MonsterPartSlot.Tail, 8, MonsterPartShapeKind.TailShort, PartTintMode.Secondary);
            yield return SaveVariant("tail_long", MonsterPartSlot.Tail, 8, MonsterPartShapeKind.TailLong, PartTintMode.Secondary);
            yield return SaveVariant("tail_fin", MonsterPartSlot.Tail, 8, MonsterPartShapeKind.TailFin, PartTintMode.Accent);
            yield return SaveVariant("tail_none", MonsterPartSlot.Tail, 8, MonsterPartShapeKind.None);
        }

        private static IEnumerable<MonsterPartVariantDefinition> CreateEyeVariants()
        {
            yield return SaveVariant("eyes_dot", MonsterPartSlot.Eyes, 20, MonsterPartShapeKind.EyesDot, PartTintMode.Accent);
            yield return SaveVariant("eyes_big", MonsterPartSlot.Eyes, 20, MonsterPartShapeKind.EyesBig, PartTintMode.Accent);
            yield return SaveVariant("eyes_angry", MonsterPartSlot.Eyes, 20, MonsterPartShapeKind.EyesAngry, PartTintMode.Accent);
            yield return SaveVariant("eyes_sleepy", MonsterPartSlot.Eyes, 20, MonsterPartShapeKind.EyesSleepy, PartTintMode.Accent);
        }

        private static IEnumerable<MonsterPartVariantDefinition> CreatePatternVariants()
        {
            yield return SaveVariant("pattern_stripes", MonsterPartSlot.PatternOverlay, 15, MonsterPartShapeKind.PatternStripes, PartTintMode.Secondary);
            yield return SaveVariant("pattern_spots", MonsterPartSlot.PatternOverlay, 15, MonsterPartShapeKind.PatternSpots, PartTintMode.Secondary);
            yield return SaveVariant("pattern_none", MonsterPartSlot.PatternOverlay, 15, MonsterPartShapeKind.None);
        }

        private static IEnumerable<MonsterPartVariantDefinition> CreateAccessoryVariants()
        {
            yield return SaveVariant("acc_horn", MonsterPartSlot.Accessory, 25, MonsterPartShapeKind.AccessoryHorn, PartTintMode.Accent);
            yield return SaveVariant("acc_wings", MonsterPartSlot.Accessory, 25, MonsterPartShapeKind.AccessoryWings, PartTintMode.Secondary);
            yield return SaveVariant("acc_crown", MonsterPartSlot.Accessory, 25, MonsterPartShapeKind.AccessoryCrown, PartTintMode.Accent);
            yield return SaveVariant("acc_none", MonsterPartSlot.Accessory, 25, MonsterPartShapeKind.None);
        }

        private static MonsterPartVariantDefinition SaveVariant(
            string id,
            MonsterPartSlot slot,
            int sortOrder,
            MonsterPartShapeKind shape,
            PartTintMode tintMode = PartTintMode.Primary)
        {
            string path = $"{VariantsFolder}/{id}.asset";
            MonsterPartVariantDefinition variant = AssetDatabase.LoadAssetAtPath<MonsterPartVariantDefinition>(path);

            if (variant == null)
            {
                variant = ScriptableObject.CreateInstance<MonsterPartVariantDefinition>();
                AssetDatabase.CreateAsset(variant, path);
            }

            variant.VariantId = id;
            variant.Slot = slot;
            variant.SortOrder = sortOrder;
            variant.Shape = shape;
            variant.TintMode = tintMode;
            variant.LocalScale = Vector2.one;
            variant.LocalOffset = Vector2.zero;
            EditorUtility.SetDirty(variant);
            return variant;
        }

        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path))
            {
                return;
            }

            string parent = Path.GetDirectoryName(path)?.Replace('\\', '/');
            string folderName = Path.GetFileName(path);

            if (!string.IsNullOrEmpty(parent) && !AssetDatabase.IsValidFolder(parent))
            {
                EnsureFolder(parent);
            }

            AssetDatabase.CreateFolder(parent, folderName);
        }
    }
}
