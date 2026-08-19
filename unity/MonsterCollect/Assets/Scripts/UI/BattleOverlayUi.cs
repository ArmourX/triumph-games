using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    internal static class BattleOverlayUi
    {
        public static RectTransform CreateRect(string name, Transform parent, Vector2 min, Vector2 max)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = min;
            rect.anchorMax = max;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            return rect;
        }

        public static Image CreateImage(string name, Transform parent, Vector2 min, Vector2 max, Color color)
        {
            var rect = CreateRect(name, parent, min, max);
            var image = rect.gameObject.AddComponent<Image>();
            image.color = color;
            return image;
        }

        public static Text CreateText(
            string name,
            Transform parent,
            Font font,
            int size,
            FontStyle style,
            TextAnchor align,
            Vector2 min,
            Vector2 max,
            Color color)
        {
            var rect = CreateRect(name, parent, min, max);
            var text = rect.gameObject.AddComponent<Text>();
            text.font = font;
            text.fontSize = size;
            text.fontStyle = style;
            text.alignment = align;
            text.color = color;
            text.raycastTarget = false;
            return text;
        }

        public static RawImage CreateRaw(string name, Transform parent, Vector2 min, Vector2 max)
        {
            var rect = CreateRect(name, parent, min, max);
            var raw = rect.gameObject.AddComponent<RawImage>();
            raw.color = Color.white;
            return raw;
        }

        public static Button CreateButton(
            string name,
            Transform parent,
            Font font,
            string label,
            Vector2 min,
            Vector2 max,
            Color color,
            UnityAction onClick)
        {
            var image = CreateImage(name, parent, min, max, color);
            var button = image.gameObject.AddComponent<Button>();
            button.targetGraphic = image;

            CreateText("Label", image.transform, font, 28, FontStyle.Bold, TextAnchor.MiddleCenter,
                Vector2.zero, Vector2.one, Color.white).text = label;
            button.onClick.AddListener(onClick);
            return button;
        }

        public static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }
}
