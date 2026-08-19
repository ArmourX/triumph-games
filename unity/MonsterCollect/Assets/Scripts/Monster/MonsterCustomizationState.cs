using System;
using UnityEngine;

namespace MonsterCollect.Monster
{
    /// <summary>Cosmetic overrides that do not change base-form determinism.</summary>
    [Serializable]
    public class MonsterCustomizationState
    {
        public string customDisplayName = string.Empty;
        public float primaryHueShift;
        public float secondaryHueShift;
        public float primarySaturationShift;
        public float secondarySaturationShift;
        public string[] unlockedAccessoryIds = Array.Empty<string>();
        public string equippedAccessoryVariantId = string.Empty;

        public static MonsterCustomizationState CreateDefault()
        {
            return new MonsterCustomizationState
            {
                unlockedAccessoryIds = Array.Empty<string>()
            };
        }

        public bool HasCustomName => !string.IsNullOrWhiteSpace(customDisplayName);
    }
}
