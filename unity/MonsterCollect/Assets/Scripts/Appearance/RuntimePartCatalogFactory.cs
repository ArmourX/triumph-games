using UnityEngine;

namespace MonsterCollect.Appearance
{
    /// <summary>Builds an in-memory catalog when Resources assets have not been generated yet.</summary>
    public static class RuntimePartCatalogFactory
    {
        public static MonsterPartCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<MonsterPartCatalog>();
            catalog.Variants = new[]
            {
                Create("body_round", MonsterPartSlot.Body, 0, MonsterPartShapeKind.BodyRound),
                Create("body_oval", MonsterPartSlot.Body, 0, MonsterPartShapeKind.BodyOval),
                Create("body_angular", MonsterPartSlot.Body, 0, MonsterPartShapeKind.BodyAngular),
                Create("body_blob", MonsterPartSlot.Body, 0, MonsterPartShapeKind.BodyBlob),

                Create("head_round", MonsterPartSlot.Head, 10, MonsterPartShapeKind.HeadRound),
                Create("head_pointed", MonsterPartSlot.Head, 10, MonsterPartShapeKind.HeadPointed),
                Create("head_wide", MonsterPartSlot.Head, 10, MonsterPartShapeKind.HeadWide),
                Create("head_small", MonsterPartSlot.Head, 10, MonsterPartShapeKind.HeadSmall),

                Create("limbs_stub", MonsterPartSlot.ArmsLegs, 5, MonsterPartShapeKind.LimbsStub, PartTintMode.Secondary),
                Create("limbs_long", MonsterPartSlot.ArmsLegs, 5, MonsterPartShapeKind.LimbsLong, PartTintMode.Secondary),
                Create("limbs_none", MonsterPartSlot.ArmsLegs, 5, MonsterPartShapeKind.None),

                Create("tail_short", MonsterPartSlot.Tail, 8, MonsterPartShapeKind.TailShort, PartTintMode.Secondary),
                Create("tail_long", MonsterPartSlot.Tail, 8, MonsterPartShapeKind.TailLong, PartTintMode.Secondary),
                Create("tail_fin", MonsterPartSlot.Tail, 8, MonsterPartShapeKind.TailFin, PartTintMode.Accent),
                Create("tail_none", MonsterPartSlot.Tail, 8, MonsterPartShapeKind.None),

                Create("eyes_dot", MonsterPartSlot.Eyes, 20, MonsterPartShapeKind.EyesDot, PartTintMode.Accent),
                Create("eyes_big", MonsterPartSlot.Eyes, 20, MonsterPartShapeKind.EyesBig, PartTintMode.Accent),
                Create("eyes_angry", MonsterPartSlot.Eyes, 20, MonsterPartShapeKind.EyesAngry, PartTintMode.Accent),
                Create("eyes_sleepy", MonsterPartSlot.Eyes, 20, MonsterPartShapeKind.EyesSleepy, PartTintMode.Accent),

                Create("pattern_stripes", MonsterPartSlot.PatternOverlay, 15, MonsterPartShapeKind.PatternStripes, PartTintMode.Secondary),
                Create("pattern_spots", MonsterPartSlot.PatternOverlay, 15, MonsterPartShapeKind.PatternSpots, PartTintMode.Secondary),
                Create("pattern_none", MonsterPartSlot.PatternOverlay, 15, MonsterPartShapeKind.None),

                Create("acc_horn", MonsterPartSlot.Accessory, 25, MonsterPartShapeKind.AccessoryHorn, PartTintMode.Accent),
                Create("acc_wings", MonsterPartSlot.Accessory, 25, MonsterPartShapeKind.AccessoryWings, PartTintMode.Secondary),
                Create("acc_crown", MonsterPartSlot.Accessory, 25, MonsterPartShapeKind.AccessoryCrown, PartTintMode.Accent),
                Create("acc_none", MonsterPartSlot.Accessory, 25, MonsterPartShapeKind.None)
            };

            return catalog;
        }

        private static MonsterPartVariantDefinition Create(
            string id,
            MonsterPartSlot slot,
            int sortOrder,
            MonsterPartShapeKind shape,
            PartTintMode tintMode = PartTintMode.Primary)
        {
            var variant = ScriptableObject.CreateInstance<MonsterPartVariantDefinition>();
            variant.VariantId = id;
            variant.Slot = slot;
            variant.SortOrder = sortOrder;
            variant.Shape = shape;
            variant.TintMode = tintMode;
            variant.LocalScale = Vector2.one;
            variant.LocalOffset = Vector2.zero;
            return variant;
        }
    }
}
