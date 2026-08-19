using UnityEngine;

namespace MonsterCollect.Appearance
{
    /// <summary>
    /// One part variant. Can be authored as a standalone asset or embedded in a catalog.
    /// Assign <see cref="SpriteOverride"/> for hand-made art; otherwise <see cref="Shape"/> is used procedurally.
    /// </summary>
    [CreateAssetMenu(fileName = "PartVariant", menuName = "Monster Collect/Part Variant")]
    public class MonsterPartVariantDefinition : ScriptableObject
    {
        public string VariantId = "body_round";
        public MonsterPartSlot Slot = MonsterPartSlot.Body;
        public int SortOrder;
        public MonsterPartShapeKind Shape = MonsterPartShapeKind.BodyRound;
        public Sprite SpriteOverride;
        public Vector2 LocalScale = Vector2.one;
        public Vector2 LocalOffset;
        public PartTintMode TintMode = PartTintMode.Primary;

        public bool IsEmptyShape => Shape == MonsterPartShapeKind.None && SpriteOverride == null;
    }
}
