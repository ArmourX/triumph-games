using System;
using TMPro;
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
                image.type = Image.Type.Simple;
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
                image.type = Image.Type.Simple;
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
                image.type = Image.Type.Simple;
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
            UiSharpnessUtility.StyleSharpText(text, addOutline: false);
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
            UiSharpnessUtility.StyleSharpText(text, addOutline: false);
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
            UiSharpnessUtility.StyleSharpText(text, addOutline: false);
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
            UiSharpnessUtility.StyleSharpText(text, addOutline: false);
        }

        public static void StyleTmpTitle(TMP_Text text)
        {
            ApplyTmp(text, TmpFonts.Title, MobileGameUiKit.Theme?.titleColor ?? Color.white, true);
        }

        public static void StyleTmpBody(TMP_Text text)
        {
            ApplyTmp(text, TmpFonts.Body, MobileGameUiKit.Theme?.bodyColor ?? Color.white, false);
        }

        public static void StyleTmpButton(TMP_Text text)
        {
            ApplyTmp(text, TmpFonts.Label, MobileGameUiKit.Theme?.buttonLabelColor ?? Color.white, true);
        }

        private static void ApplyTmp(TMP_Text text, TMP_FontAsset font, Color color, bool outline)
        {
            if (text == null)
            {
                return;
            }

            if (font != null)
            {
                text.font = font;
            }

            text.color = color;
            text.extraPadding = true;
            text.raycastTarget = false;
            if (outline)
            {
                text.outlineWidth = 0.18f;
                text.outlineColor = new Color(0.05f, 0.07f, 0.12f, 0.92f);
            }
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

            TMP_Text text = HomeHubUiFactory.CreateText(go.transform, "Label", 22, FontStyles.Bold, TextAlignmentOptions.Center);
            text.text = label;
            StyleTmpButton(text);

            var btn = go.GetComponent<Button>();
            btn.targetGraphic = image;
            if (onClick != null)
            {
                btn.onClick.AddListener(() => onClick());
            }

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

        public static void StyleDropdown(Dropdown dropdown)
        {
            if (dropdown == null)
            {
                return;
            }

            Font font = ResolveUiFont();
            Color captionColor = MobileGameUiKit.Theme?.buttonLabelColor ?? Color.white;
            Color panelColor = new Color(0.08f, 0.13f, 0.24f, 0.98f);
            Color itemColor = new Color(0.12f, 0.2f, 0.36f, 1f);
            Color highlightColor = new Color(0.2f, 0.62f, 0.34f, 1f);

            Image background = dropdown.GetComponent<Image>();
            if (background != null)
            {
                ApplyPrimaryButton(background);
            }

            Text caption = dropdown.captionText;
            if (caption != null)
            {
                ApplyDropdownLabel(caption, font, captionColor, 22, TextAnchor.MiddleLeft);
                RectTransform captionRect = caption.rectTransform;
                captionRect.anchorMin = new Vector2(0.08f, 0.1f);
                captionRect.anchorMax = new Vector2(0.78f, 0.9f);
                captionRect.offsetMin = Vector2.zero;
                captionRect.offsetMax = Vector2.zero;
            }

            Transform arrow = dropdown.transform.Find("Arrow");
            if (arrow != null)
            {
                if (arrow.TryGetComponent(out Image arrowImage))
                {
                    arrowImage.enabled = false;
                    arrowImage.raycastTarget = false;
                }

                Transform arrowLabelTransform = arrow.Find("ArrowLabel");
                if (arrowLabelTransform == null)
                {
                    var arrowLabelGo = new GameObject("ArrowLabel", typeof(RectTransform), typeof(Text));
                    arrowLabelGo.transform.SetParent(arrow, false);
                    Stretch(arrowLabelGo.GetComponent<RectTransform>());
                    arrowLabelTransform = arrowLabelGo.transform;
                }

                if (arrowLabelTransform.TryGetComponent(out Text arrowText))
                {
                    ApplyDropdownLabel(arrowText, font, captionColor, 18, TextAnchor.MiddleCenter);
                    arrowText.text = "▼";
                }
            }

            StyleDropdownTemplate(dropdown, font, panelColor, itemColor, highlightColor, captionColor);
        }

        private static Font ResolveUiFont()
        {
            if (MobileGameUiKit.BodyFont != null)
            {
                return MobileGameUiKit.BodyFont;
            }

            Font builtin = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            if (builtin != null)
            {
                return builtin;
            }

            return Resources.GetBuiltinResource<Font>("Arial.ttf");
        }

        private static void ApplyDropdownLabel(Text text, Font font, Color color, int size, TextAnchor alignment)
        {
            if (text == null)
            {
                return;
            }

            if (font != null)
            {
                text.font = font;
            }

            text.fontSize = size;
            text.fontStyle = FontStyle.Bold;
            text.color = color;
            text.alignment = alignment;
            text.horizontalOverflow = HorizontalWrapMode.Overflow;
            text.verticalOverflow = VerticalWrapMode.Truncate;
            text.raycastTarget = false;
        }

        private static void StyleDropdownTemplate(
            Dropdown dropdown,
            Font font,
            Color panelColor,
            Color itemColor,
            Color highlightColor,
            Color labelColor)
        {
            RectTransform template = dropdown.template;
            if (template == null)
            {
                return;
            }

            template.anchorMin = new Vector2(0f, 0f);
            template.anchorMax = new Vector2(1f, 0f);
            template.pivot = new Vector2(0.5f, 1f);
            template.anchoredPosition = new Vector2(0f, -4f);
            template.sizeDelta = new Vector2(0f, 268f);
            template.gameObject.SetActive(false);

            if (template.TryGetComponent(out Image templateImage))
            {
                templateImage.sprite = null;
                templateImage.color = panelColor;
            }

            Canvas canvas = template.GetComponent<Canvas>();
            if (canvas == null)
            {
                canvas = template.gameObject.AddComponent<Canvas>();
            }

            canvas.overrideSorting = true;
            canvas.sortingOrder = 80;
            if (template.GetComponent<GraphicRaycaster>() == null)
            {
                template.gameObject.AddComponent<GraphicRaycaster>();
            }

            Transform viewport = template.Find("Viewport");
            if (viewport != null && viewport.TryGetComponent(out Image viewportImage))
            {
                viewportImage.sprite = null;
                viewportImage.color = panelColor;
            }

            Transform scrollbar = template.Find("Scrollbar");
            if (scrollbar != null && scrollbar.TryGetComponent(out Image scrollbarImage))
            {
                scrollbarImage.sprite = null;
                scrollbarImage.color = new Color(0.06f, 0.1f, 0.18f, 1f);
            }

            Transform handle = template.Find("Scrollbar/Sliding Area/Handle");
            if (handle != null && handle.TryGetComponent(out Image handleImage))
            {
                handleImage.sprite = null;
                handleImage.color = highlightColor;
            }

            Transform item = template.Find("Viewport/Content/Item");
            if (item == null)
            {
                return;
            }

            RectTransform itemRect = item.GetComponent<RectTransform>();
            itemRect.anchorMin = new Vector2(0f, 0.5f);
            itemRect.anchorMax = new Vector2(1f, 0.5f);
            itemRect.pivot = new Vector2(0.5f, 0.5f);
            itemRect.sizeDelta = new Vector2(0f, 42f);

            Transform itemBackground = item.Find("Item Background");
            if (itemBackground != null && itemBackground.TryGetComponent(out Image itemBg))
            {
                itemBg.sprite = null;
                itemBg.color = itemColor;
            }

            Transform checkmark = item.Find("Item Checkmark");
            if (checkmark != null)
            {
                RectTransform checkRect = checkmark.GetComponent<RectTransform>();
                checkRect.anchorMin = new Vector2(0f, 0.5f);
                checkRect.anchorMax = new Vector2(0f, 0.5f);
                checkRect.pivot = new Vector2(0.5f, 0.5f);
                checkRect.anchoredPosition = new Vector2(16f, 0f);
                checkRect.sizeDelta = new Vector2(14f, 14f);

                if (checkmark.TryGetComponent(out Image checkImage))
                {
                    checkImage.sprite = null;
                    checkImage.color = new Color(1f, 0.85f, 0.2f, 1f);
                }
            }

            Text itemText = dropdown.itemText;
            if (itemText == null)
            {
                Transform itemLabel = item.Find("Item Label");
                if (itemLabel != null)
                {
                    itemText = itemLabel.GetComponent<Text>();
                    dropdown.itemText = itemText;
                }
            }

            if (itemText != null)
            {
                ApplyDropdownLabel(itemText, font, labelColor, 22, TextAnchor.MiddleLeft);

                RectTransform labelRect = itemText.rectTransform;
                labelRect.anchorMin = Vector2.zero;
                labelRect.anchorMax = Vector2.one;
                labelRect.offsetMin = new Vector2(32f, 2f);
                labelRect.offsetMax = new Vector2(-10f, -2f);
            }

            Toggle toggle = item.GetComponent<Toggle>();
            if (toggle != null)
            {
                ColorBlock colors = toggle.colors;
                colors.normalColor = Color.white;
                colors.highlightedColor = new Color(1.15f, 1.15f, 1.15f, 1f);
                colors.pressedColor = highlightColor;
                colors.selectedColor = highlightColor;
                colors.disabledColor = new Color(0.6f, 0.6f, 0.65f, 0.6f);
                colors.colorMultiplier = 1f;
                toggle.colors = colors;
            }
        }

        private static void ApplySprite(Image image, Sprite sprite, Color tint)
        {
            image.sprite = sprite;
            image.color = tint;
            UiSharpnessUtility.ApplyCrispImage(image);
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
