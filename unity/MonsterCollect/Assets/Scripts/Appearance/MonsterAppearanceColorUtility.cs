using UnityEngine;

namespace MonsterCollect.Appearance
{
    public static class MonsterAppearanceColorUtility
    {
        public static Color ApplyCustomization(Color baseColor, MonsterCollect.Monster.MonsterCustomizationState customization, bool primary)
        {
            if (customization == null)
            {
                return baseColor;
            }

            float hueShift = primary ? customization.primaryHueShift : customization.secondaryHueShift;
            float satShift = primary ? customization.primarySaturationShift : customization.secondarySaturationShift;
            if (Mathf.Approximately(hueShift, 0f) && Mathf.Approximately(satShift, 0f))
            {
                return baseColor;
            }

            Color.RGBToHSV(baseColor, out float h, out float s, out float v);
            h = Mathf.Repeat(h + hueShift, 1f);
            s = Mathf.Clamp01(s + satShift);
            return Color.HSVToRGB(h, s, v);
        }
    }
}
