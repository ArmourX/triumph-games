using System;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Applies 2D Mobile Game UI Kit sprites and fonts to runtime-built uGUI.</summary>
    public static class UiSkinUtility
    {
        private static readonly Color DimOverlayColor = new Color(0.02f, 0.04f, 0.12f, 0.78f);
        private static readonly Color NavFallbackColor = new Color(0.08f, 0.12f, 0.22f, 0.98f);
        private static readonly Color TabFallbackColor = new Color(0.14f, 0.22f, 0.38f, 0.95f);
        private static readonly Color PrimaryFallbackColor = new Color(0.18f, 0.62f, 0.34f, 0.98f);
        private static readonly Color SecondaryFallbackColor = new Color(0.78f, 0.24f, 0.28f, 0.98f);
        private static readonly Color PanelFallbackColor = new Color(0.1f, 0.16f, 0.28f, 0.96f);

        public static void ApplySceneBackground(Image image)
        {
            if (image == null)
            {
                return;
            }

            MobileGameUiKitTheme theme = MobileGameUiKit.Theme;
            if (theme?.sceneBackground != null)
            {
                ApplySprite(image, theme.sceneBackground, Color.white);
                image.type = Image.Type.Simple;
                return;
            }

            image.sprite = null;
            image.color = new Color(0.09f, 0.11f, 0.2f, 1f);
        }

        public static void ApplyNavBarBackground(Image image)
        {
            MobileGameUiKitTheme theme = MobileGameUiKit.Theme;
            if (theme?.navBarBackground != null)
            {
                ApplySprite(image, theme.navBarBackground, Color.white);
                image.type = Image.Type.Sliced;
                return;
            }

            image.sprite = null;
            image.color = NavFallbackColor;
        }

        public static void ApplyModalPanel(Image image)
        {
            MobileGameUiKitTheme theme = MobileGameUiKit.Theme;
            if (theme?.panelModal != null)
            {
                ApplySprite(image, theme.panelModal, Color.white);
                image.type = Image.Type.Sliced;
                return;
            }

            image.sprite = null;
            image.color = PanelFallbackColor;
        }

        public static void ApplyDimOverlay(Image image)
        {
            image.sprite = null;
            image.color = DimOverlayColor;
        }

        public static void ApplyPrimaryButton(Image image)
        {
            MobileGameUiKitTheme theme = MobileGameUiKit.Theme;
            if (theme?.buttonPrimary != null)
            {
                ApplySprite(image, theme.buttonPrimary, Color.white);
                image.type = Image.Type.Simple;
                return;
            }

            image.sprite = null;
            image.color = PrimaryFallbackColor;
        }

        public static void ApplySecondaryButton(Image image)
        {
            MobileGameUiKitTheme theme = MobileGameUiKit.Theme;
            if (theme?.buttonSecondary != null)
            {
                ApplySprite(image, theme.buttonSecondary, Color.white);
                image.type = Image.Type.Simple;
                return;
            }

            image.sprite = null;
            image.color = SecondaryFallbackColor;
        }

        public static void ApplyTabButton(Image image, bool active)
        {
            MobileGameUiKitTheme theme = MobileGameUiKit.Theme;
            Sprite sprite = active ? theme?.buttonTabActive : theme?.buttonTab;
            if (sprite != null)
            {
                ApplySprite(image, sprite, Color.white);
                image.type = Image.Type.Sliced;
                return;
            }

            image.sprite = null;
            image.color = active
                ? new Color(0.2f, 0.45f, 0.82f, 0.98f)
                : TabFallbackColor;
        }

        public static void StyleTitle(Text text)
        {
            if (text == null)
            {
                return;
            }

            MobileGameUiKitTheme theme = MobileGameUiKit.Theme;
            text.font = MobileGameUiKit.TitleFont;
            text.color = theme?.titleColor ?? Color.white;
        }

        public static void StyleBody(Text text)
        {
            if (text == null)
            {
                return;
            }

            MobileGameUiKitTheme theme = MobileGameUiKit.Theme;
            text.font = MobileGameUiKit.BodyFont;
            text.color = theme?.bodyColor ?? Color.white;
        }

        public static void StyleMuted(Text text)
        {
            if (text == null)
            {
                return;
            }

            MobileGameUiKitTheme theme = MobileGameUiKit.Theme;
            text.font = MobileGameUiKit.LabelFont;
            text.color = theme?.mutedColor ?? new Color(0.75f, 0.8f, 0.88f);
        }

        public static void StyleButtonLabel(Text text)
        {
            if (text == null)
            {
                return;
            }

            MobileGameUiKitTheme theme = MobileGameUiKit.Theme;
            text.font = MobileGameUiKit.LabelFont;
            text.color = theme?.buttonLabelColor ?? Color.white;
        }

        public static Button CreateButton(
            Transform parent,
            string name,
            string label,
            Action onClick,
            float anchorMinX,
            float anchorMaxX,
            float anchorMinY,
            float anchorMaxY,
            bool secondary = false)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(anchorMinX, anchorMinY);
            rect.anchorMax = new Vector2(anchorMaxX, anchorMaxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            var image = go.GetComponent<Image>();
            if (secondary)
            {
                ApplySecondaryButton(image);
            }
            else
            {
                ApplyPrimaryButton(image);
            }

            var textGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            textGo.transform.SetParent(go.transform, false);
            Stretch(textGo.GetComponent<RectTransform>());
            var text = textGo.GetComponent<Text>();
            text.fontSize = 22;
            text.alignment = TextAnchor.MiddleCenter;
            text.text = label;
            StyleButtonLabel(text);

            var btn = go.GetComponent<Button>();
            btn.onClick.AddListener(() => onClick());
            return btn;
        }

        public static Text CreateText(
            Transform parent,
            string name,
            int size,
            FontStyle style,
            TextAnchor anchor,
            bool title = false)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent, false);
            var text = go.GetComponent<Text>();
            text.fontSize = size;
            text.fontStyle = style;
            text.alignment = anchor;

            if (title)
            {
                StyleTitle(text);
            }
            else
            {
                StyleBody(text);
            }

            return text;
        }

        public static Image CreatePanelImage(Transform parent, string name, bool modal = true)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<Image>();
            if (modal)
            {
                ApplyModalPanel(image);
            }
            else
            {
                ApplySceneBackground(image);
            }

            return image;
        }

        private static void ApplySprite(Image image, Sprite sprite, Color tint)
        {
            image.sprite = sprite;
            image.color = tint;
            image.preserveAspect = false;
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
