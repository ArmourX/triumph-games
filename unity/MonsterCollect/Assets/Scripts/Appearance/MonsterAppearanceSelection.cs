using System;
using UnityEngine;

namespace MonsterCollect.Appearance
{
    /// <summary>Resolved part variant IDs for one monster, derived deterministically from its hash.</summary>
    [Serializable]
    public class MonsterAppearanceSelection
    {
        public string BodyVariantId;
        public string HeadVariantId;
        public string ArmsLegsVariantId;
        public string TailVariantId;
        public string EyesVariantId;
        public string PatternVariantId;
        public string AccessoryVariantId;

        public bool IsValid =>
            !string.IsNullOrEmpty(BodyVariantId) &&
            !string.IsNullOrEmpty(HeadVariantId);

        public string GetVariantId(MonsterPartSlot slot)
        {
            return slot switch
            {
                MonsterPartSlot.Body => BodyVariantId,
                MonsterPartSlot.Head => HeadVariantId,
                MonsterPartSlot.ArmsLegs => ArmsLegsVariantId,
                MonsterPartSlot.Tail => TailVariantId,
                MonsterPartSlot.Eyes => EyesVariantId,
                MonsterPartSlot.PatternOverlay => PatternVariantId,
                MonsterPartSlot.Accessory => AccessoryVariantId,
                _ => null
            };
        }

        public void SetVariantId(MonsterPartSlot slot, string variantId)
        {
            switch (slot)
            {
                case MonsterPartSlot.Body:
                    BodyVariantId = variantId;
                    break;
                case MonsterPartSlot.Head:
                    HeadVariantId = variantId;
                    break;
                case MonsterPartSlot.ArmsLegs:
                    ArmsLegsVariantId = variantId;
                    break;
                case MonsterPartSlot.Tail:
                    TailVariantId = variantId;
                    break;
                case MonsterPartSlot.Eyes:
                    EyesVariantId = variantId;
                    break;
                case MonsterPartSlot.PatternOverlay:
                    PatternVariantId = variantId;
                    break;
                case MonsterPartSlot.Accessory:
                    AccessoryVariantId = variantId;
                    break;
            }
        }
    }
}
