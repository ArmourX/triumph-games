using System;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Builds styled home-hub widgets from the 300Mind mobile UI kit theme.</summary>
    internal static class HomeHubUiFactory
    {
        private static readonly Color TrackColor = new Color(0.07f, 0.09f, 0.16f, 0.94f);
        private static readonly Color FillColor = new Color(0.28f, 0.86f, 1f, 1f);
        private static readonly Color BadgeColor = new Color(0.90f, 0.16f, 0.22f, 1f);

        private static MobileGameUiKitTheme Theme => MobileGameUiKit.Theme;

        public static void ApplyStretchSprite(Image image, Sprite sprite, Color tint)
        {
            if (image == null)
            {
                return;
            }

            image.sprite = sprite;
            image.type = Image.Type.Simple;
            image.color = tint;
            UiSharpnessUtility.ApplyCrispImage(image, preserveAspect: false);
        }

        public static void ApplyPanel(Image image, Sprite sprite, float alpha = 1f)
        {
            if (image == null)
            {
                return;
            }

            if (sprite != null)
            {
                ApplyStretchSprite(image, sprite, new Color(1f, 1f, 1f, alpha));
                return;
            }

            UiSkinUtility.ApplyModalPanel(image);
            image.color = new Color(image.color.r, image.color.g, image.color.b, alpha);
        }

        public static void ApplyIcon(Image image, Sprite sprite)
        {
            if (image == null)
            {
                return;
            }

            image.sprite = sprite;
            image.color = Color.white;
            UiSharpnessUtility.ApplyCrispImage(image, preserveAspect: true);
            image.raycastTarget = false;
        }

        public static Image CreateSpriteImage(Transform parent, string name, Sprite sprite, bool preserveAspect = true)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<Image>();
            image.sprite = sprite;
            image.color = Color.white;
            UiSharpnessUtility.ApplyCrispImage(image, preserveAspect);
            image.raycastTarget = false;
            return image;
        }

        public static (Image track, Image fill, TMP_Text label) CreateProgressBar(Transform parent, string name)
        {
            Image track = CreateSolid(parent, name, TrackColor);
            Image fill = CreateSolid(track.transform, "Fill", FillColor);
            Stretch(fill.rectTransform);
            fill.rectTransform.offsetMin = new Vector2(6f, 6f);
            fill.rectTransform.offsetMax = new Vector2(-6f, -6f);
            fill.type = Image.Type.Filled;
            fill.fillMethod = Image.FillMethod.Horizontal;
            fill.fillOrigin = (int)Image.OriginHorizontal.Left;
            fill.fillAmount = 0f;
            fill.raycastTarget = false;

            TMP_Text label = CreateText(track.transform, "Label", 22, FontStyles.Bold, TextAlignmentOptions.Center);
            UiSkinUtility.StyleTmpButton(label);
            return (track, fill, label);
        }

        public static TMP_Text CreateBadge(Transform parent, string value)
        {
            var badgeGo = new GameObject("Badge", typeof(RectTransform), typeof(Image));
            badgeGo.transform.SetParent(parent, false);
            var image = badgeGo.GetComponent<Image>();
            image.sprite = null;
            image.color = BadgeColor;

            TMP_Text text = CreateText(badgeGo.transform, "Count", 22, FontStyles.Bold, TextAlignmentOptions.Center);
            text.text = value;
            text.color = Color.white;
            UiSkinUtility.StyleTmpButton(text);
            return text;
        }

        public static TMP_Text CreateCurrencyPill(
            Transform parent,
            string name,
            float minX,
            float maxX,
            Sprite icon,
            string value,
            Action onClick = null)
        {
            var pillGo = new GameObject(name, typeof(RectTransform), typeof(Image));
            pillGo.transform.SetParent(parent, false);
            Anchor(pillGo.GetComponent<RectTransform>(), minX, 0.08f, maxX, 0.92f);
            ApplyPanel(pillGo.GetComponent<Image>(), Theme?.currencyPill, 1f);
            if (onClick != null)
            {
                KitUi.MakeClickable(pillGo, onClick);
            }

            if (icon != null)
            {
                Image iconImage = CreateSpriteImage(pillGo.transform, "Icon", icon);
                Anchor(iconImage.rectTransform, 0.04f, 0.12f, 0.28f, 0.88f);
            }

            TMP_Text text = CreateText(pillGo.transform, "Value", 26, FontStyles.Bold, TextAlignmentOptions.Center);
            Anchor(text.rectTransform, 0.26f, 0f, 0.96f, 1f);
            text.text = value;
            UiSkinUtility.StyleTmpButton(text);
            return text;
        }

        public static Button CreateIconRailButton(
            Transform parent,
            string name,
            Sprite icon,
            string label,
            float minY,
            float maxY,
            Action onClick,
            out TMP_Text badge)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            Anchor(go.GetComponent<RectTransform>(), 0.04f, minY, 0.96f, maxY);
            var image = go.GetComponent<Image>();
            image.sprite = null;
            image.color = new Color(1f, 1f, 1f, 0.01f);

            if (icon != null)
            {
                Image iconImage = CreateSpriteImage(go.transform, "Icon", icon);
                Anchor(iconImage.rectTransform, 0.18f, 0.42f, 0.82f, 0.92f);
            }

            TMP_Text labelText = CreateText(go.transform, "Label", 20, FontStyles.Bold, TextAlignmentOptions.Bottom);
            Anchor(labelText.rectTransform, 0.04f, 0.04f, 0.96f, 0.40f);
            labelText.text = label;
            labelText.enableWordWrapping = true;
            UiSkinUtility.StyleTmpButton(labelText);

            var button = go.GetComponent<Button>();
            button.targetGraphic = image;
            button.onClick.AddListener(() => onClick?.Invoke());

            badge = CreateBadge(go.transform, "0");
            Anchor(badge.rectTransform.parent as RectTransform, 0.62f, 0.66f, 0.96f, 0.98f);
            return button;
        }

        public static Button CreateSquareModeButton(
            Transform parent,
            string name,
            Sprite icon,
            string label,
            float minX,
            float maxX,
            Action onClick,
            bool activeTab = false)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            Anchor(go.GetComponent<RectTransform>(), minX, 0.18f, maxX, 1f);
            var image = go.GetComponent<Image>();
            UiSkinUtility.ApplyTabButton(image, activeTab);
            image.type = Image.Type.Simple;

            if (icon != null)
            {
                Image iconImage = CreateSpriteImage(go.transform, "Icon", icon);
                Anchor(iconImage.rectTransform, 0.18f, 0.34f, 0.82f, 0.88f);
            }

            if (!string.IsNullOrEmpty(label))
            {
                TMP_Text labelText = CreateText(go.transform, "Label", 18, FontStyles.Bold, TextAlignmentOptions.Bottom);
                Anchor(labelText.rectTransform, 0.04f, 0.04f, 0.96f, 0.34f);
                labelText.text = label;
                UiSkinUtility.StyleTmpButton(labelText);
            }

            var button = go.GetComponent<Button>();
            button.targetGraphic = image;
            button.onClick.AddListener(() => onClick?.Invoke());
            return button;
        }

        public static TMP_Text CreateText(
            Transform parent,
            string name,
            float size,
            FontStyles style,
            TextAlignmentOptions alignment)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(TextMeshProUGUI));
            go.transform.SetParent(parent, false);
            Stretch(go.GetComponent<RectTransform>());
            var text = go.GetComponent<TextMeshProUGUI>();
            text.font = TmpFonts.Body;
            text.fontSize = size;
            text.fontStyle = style;
            text.alignment = alignment;
            text.raycastTarget = false;
            text.enableWordWrapping = false;
            text.overflowMode = TextOverflowModes.Overflow;
            text.richText = false;
            text.extraPadding = true;
            UiSkinUtility.StyleTmpBody(text);
            return text;
        }

        public static Image CreateSolid(Transform parent, string name, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<Image>();
            image.sprite = null;
            image.color = color;
            image.raycastTarget = false;
            return image;
        }

        public static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        public static void Anchor(RectTransform rect, float minX, float minY, float maxX, float maxY)
        {
            rect.anchorMin = new Vector2(minX, minY);
            rect.anchorMax = new Vector2(maxX, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }
}
