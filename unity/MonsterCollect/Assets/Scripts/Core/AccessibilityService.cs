using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.Core
{
    /// <summary>Applies global text scaling and accessibility helpers.</summary>
    public static class AccessibilityService
    {
        private static float lastAppliedScale = -1f;

        public static void ApplyTextScale()
        {
            float scale = GameSettings.TextScale;
            if (Mathf.Approximately(scale, lastAppliedScale))
            {
                return;
            }

            lastAppliedScale = scale;
            Text[] texts = Object.FindObjectsOfType<Text>(true);

            for (int i = 0; i < texts.Length; i++)
            {
                Text text = texts[i];
                if (text == null)
                {
                    continue;
                }

                if (!text.TryGetComponent(out AccessibilityTextScale marker))
                {
                    marker = text.gameObject.AddComponent<AccessibilityTextScale>();
                    marker.CaptureBaseSize(text.fontSize);
                }

                marker.Apply(scale);
            }
        }

        public static string GetElementSymbol(string elementName)
        {
            if (!GameSettings.ColorblindIndicatorsEnabled || string.IsNullOrEmpty(elementName))
            {
                return string.Empty;
            }

            return elementName switch
            {
                "Fire" => "[F]",
                "Water" => "[W]",
                "Grass" => "[G]",
                "Electric" => "[E]",
                "Earth" => "[R]",
                "Wind" => "[A]",
                "Shadow" => "[S]",
                "Light" => "[L]",
                _ => "[?]"
            };
        }
    }

    /// <summary>Stores the authored font size before accessibility scaling.</summary>
    [DisallowMultipleComponent]
    public sealed class AccessibilityTextScale : MonoBehaviour
    {
        [SerializeField] private int baseFontSize = 18;

        public void CaptureBaseSize(int size)
        {
            baseFontSize = Mathf.Max(8, size);
        }

        public void Apply(float scale)
        {
            if (TryGetComponent(out Text text))
            {
                text.fontSize = Mathf.RoundToInt(baseFontSize * scale);
            }
        }
    }
}
