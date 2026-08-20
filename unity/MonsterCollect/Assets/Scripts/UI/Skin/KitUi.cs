using System;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Shared 300Mind kit + TMP widgets for overlay hubs and scene chrome.</summary>
    public static class KitUi
    {
        public static Canvas ResolveGameCanvas()
        {
            Canvas[] canvases = UnityEngine.Object.FindObjectsOfType<Canvas>(true);
            for (int i = 0; i < canvases.Length; i++)
            {
                Canvas candidate = canvases[i];
                if (candidate != null && candidate.transform.Find("PlayFrame") != null)
                {
                    return candidate;
                }
            }

            return UnityEngine.Object.FindObjectOfType<Canvas>();
        }

        public static Transform OverlayParent(Canvas canvas)
        {
            Transform parent = LandscapePlayFrame.FindContentRoot(canvas) ?? canvas.transform;
            TmpFonts.PrepareCanvas(canvas);
            return parent;
        }

        public static Image Dim(Transform parent)
        {
            Image image = Solid(parent, "Dim", Color.white);
            UiSkinUtility.ApplyDimOverlay(image);
            Stretch(image.rectTransform);
            return image;
        }

        public static Image Card(Transform parent, float minX = 0.04f, float minY = 0.06f, float maxX = 0.96f, float maxY = 0.94f)
        {
            Image image = Solid(parent, "Card", Color.white);
            UiSkinUtility.ApplyModalPanel(image);
            Anchor(image.rectTransform, minX, minY, maxX, maxY);
            return image;
        }

        public static Image Solid(Transform parent, string name, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<Image>();
            image.sprite = null;
            image.color = color;
            return image;
        }

        public static TMP_Text Label(
            Transform parent,
            string name,
            string value,
            float size,
            TextAlignmentOptions alignment,
            bool title = false)
        {
            TMP_Text text = HomeHubUiFactory.CreateText(
                parent,
                name,
                size,
                title ? FontStyles.Bold : FontStyles.Normal,
                alignment);
            text.text = value;
            text.enableWordWrapping = !title;
            text.overflowMode = TextOverflowModes.Overflow;
            if (title)
            {
                UiSkinUtility.StyleTmpTitle(text);
            }
            else
            {
                UiSkinUtility.StyleTmpBody(text);
            }

            return text;
        }

        public static Button Button(
            Transform parent,
            string name,
            string label,
            float minX,
            float minY,
            float maxX,
            float maxY,
            Action onClick,
            bool secondary = false)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            Anchor(go.GetComponent<RectTransform>(), minX, minY, maxX, maxY);
            var image = go.GetComponent<Image>();
            if (secondary)
            {
                UiSkinUtility.ApplySecondaryButton(image);
            }
            else
            {
                UiSkinUtility.ApplyPrimaryButton(image);
            }

            image.type = Image.Type.Simple;
            TMP_Text text = HomeHubUiFactory.CreateText(go.transform, "Label", 22, FontStyles.Bold, TextAlignmentOptions.Center);
            text.text = label;
            UiSkinUtility.StyleTmpButton(text);

            var button = go.GetComponent<Button>();
            button.targetGraphic = image;
            if (onClick != null)
            {
                button.onClick.AddListener(() => onClick());
            }

            return button;
        }

        public static Button ColumnButton(Transform parent, string label, Action onClick)
        {
            var go = new GameObject(label, typeof(RectTransform), typeof(Image), typeof(Button), typeof(LayoutElement));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<Image>();
            UiSkinUtility.ApplyPrimaryButton(image);
            image.type = Image.Type.Simple;
            var layout = go.GetComponent<LayoutElement>();
            layout.preferredHeight = 64f;
            layout.minHeight = 56f;

            TMP_Text text = HomeHubUiFactory.CreateText(go.transform, "Label", 22, FontStyles.Bold, TextAlignmentOptions.Center);
            text.text = label;
            UiSkinUtility.StyleTmpButton(text);

            var button = go.GetComponent<Button>();
            button.targetGraphic = image;
            button.onClick.AddListener(() => onClick?.Invoke());
            return button;
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

        public static void AnchorTop(RectTransform rect, float minY, float maxY)
        {
            rect.anchorMin = new Vector2(0.04f, minY);
            rect.anchorMax = new Vector2(0.96f, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        public static void MakeClickable(GameObject target, Action onClick)
        {
            if (target == null || onClick == null)
            {
                return;
            }

            Image image = target.GetComponent<Image>() ?? target.AddComponent<Image>();
            if (image.sprite == null && image.color.a < 0.02f)
            {
                image.color = new Color(1f, 1f, 1f, 0.01f);
            }

            image.raycastTarget = true;
            Button button = target.GetComponent<Button>() ?? target.AddComponent<Button>();
            button.targetGraphic = image;
            button.onClick.RemoveAllListeners();
            button.onClick.AddListener(() => onClick());
        }

        public static T EnsureOverlay<T>(string objectName) where T : Component
        {
            T panel = UnityEngine.Object.FindObjectOfType<T>(true);
            if (panel != null)
            {
                return panel;
            }

            Canvas canvas = ResolveGameCanvas();
            if (canvas == null)
            {
                return null;
            }

            var go = new GameObject(objectName, typeof(RectTransform), typeof(T));
            go.transform.SetParent(OverlayParent(canvas), false);
            Stretch(go.GetComponent<RectTransform>());
            return go.GetComponent<T>();
        }

        public static TMP_Text ScrollLabel(Transform parent, float minX, float minY, float maxX, float maxY, TextAlignmentOptions alignment)
        {
            var scrollGo = new GameObject("BodyScroll", typeof(RectTransform), typeof(Image), typeof(Mask), typeof(ScrollRect));
            scrollGo.transform.SetParent(parent, false);
            Anchor(scrollGo.GetComponent<RectTransform>(), minX, minY, maxX, maxY);
            var bg = scrollGo.GetComponent<Image>();
            bg.color = new Color(0.07f, 0.09f, 0.16f, 0.45f);
            scrollGo.GetComponent<Mask>().showMaskGraphic = true;

            TMP_Text text = Label(scrollGo.transform, "Body", string.Empty, 20, alignment);
            text.enableWordWrapping = true;
            text.rectTransform.anchorMin = new Vector2(0f, 1f);
            text.rectTransform.anchorMax = new Vector2(1f, 1f);
            text.rectTransform.pivot = new Vector2(0.5f, 1f);
            text.rectTransform.offsetMin = new Vector2(12f, 0f);
            text.rectTransform.offsetMax = new Vector2(-12f, -8f);
            var fitter = text.gameObject.AddComponent<ContentSizeFitter>();
            fitter.horizontalFit = ContentSizeFitter.FitMode.Unconstrained;
            fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

            var scroll = scrollGo.GetComponent<ScrollRect>();
            scroll.content = text.rectTransform;
            scroll.horizontal = false;
            scroll.vertical = true;
            scroll.movementType = ScrollRect.MovementType.Clamped;
            return text;
        }

        public static RectTransform ButtonColumn(Transform parent, float minX, float minY, float maxX, float maxY)
        {
            var viewportGo = new GameObject("ButtonViewport", typeof(RectTransform), typeof(Image), typeof(Mask), typeof(ScrollRect));
            viewportGo.transform.SetParent(parent, false);
            Anchor(viewportGo.GetComponent<RectTransform>(), minX, minY, maxX, maxY);
            viewportGo.GetComponent<Image>().color = new Color(0.08f, 0.12f, 0.18f, 0.22f);
            viewportGo.GetComponent<Mask>().showMaskGraphic = false;

            var columnGo = new GameObject("ButtonColumn", typeof(RectTransform), typeof(VerticalLayoutGroup), typeof(ContentSizeFitter));
            columnGo.transform.SetParent(viewportGo.transform, false);
            var column = columnGo.GetComponent<RectTransform>();
            column.anchorMin = new Vector2(0f, 1f);
            column.anchorMax = new Vector2(1f, 1f);
            column.pivot = new Vector2(0.5f, 1f);
            column.offsetMin = Vector2.zero;
            column.offsetMax = Vector2.zero;

            var layout = columnGo.GetComponent<VerticalLayoutGroup>();
            layout.spacing = 10f;
            layout.childAlignment = TextAnchor.MiddleCenter;
            layout.childControlHeight = true;
            layout.childControlWidth = true;
            layout.childForceExpandHeight = false;
            layout.childForceExpandWidth = true;
            layout.padding = new RectOffset(10, 10, 10, 10);

            var fitter = columnGo.GetComponent<ContentSizeFitter>();
            fitter.horizontalFit = ContentSizeFitter.FitMode.Unconstrained;
            fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

            var scroll = viewportGo.GetComponent<ScrollRect>();
            scroll.content = column;
            scroll.viewport = viewportGo.GetComponent<RectTransform>();
            scroll.horizontal = false;
            scroll.vertical = true;
            scroll.movementType = ScrollRect.MovementType.Clamped;
            scroll.scrollSensitivity = 24f;
            return column;
        }

        public static InputField LegacyInput(
            Transform parent,
            string name,
            string placeholder,
            float minX,
            float minY,
            float maxX,
            float maxY)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(InputField));
            go.transform.SetParent(parent, false);
            Anchor(go.GetComponent<RectTransform>(), minX, minY, maxX, maxY);
            var image = go.GetComponent<Image>();
            UiSkinUtility.ApplyTabButton(image, false);

            Font font = MobileGameUiKit.BodyFont;
            var placeholderGo = new GameObject("Placeholder", typeof(RectTransform), typeof(Text));
            placeholderGo.transform.SetParent(go.transform, false);
            Stretch(placeholderGo.GetComponent<RectTransform>());
            var placeholderText = placeholderGo.GetComponent<Text>();
            placeholderText.font = font;
            placeholderText.fontSize = 18;
            placeholderText.text = placeholder;
            placeholderText.color = new Color(1f, 1f, 1f, 0.4f);

            var textGo = new GameObject("Text", typeof(RectTransform), typeof(Text));
            textGo.transform.SetParent(go.transform, false);
            Stretch(textGo.GetComponent<RectTransform>());
            var inputText = textGo.GetComponent<Text>();
            inputText.font = font;
            inputText.fontSize = 18;
            inputText.color = Color.white;
            inputText.supportRichText = false;

            var input = go.GetComponent<InputField>();
            input.textComponent = inputText;
            input.placeholder = placeholderText;
            return input;
        }

        public static void RestyleExisting(Transform root)
        {
            if (root == null)
            {
                return;
            }

            Image[] images = root.GetComponentsInChildren<Image>(true);
            for (int i = 0; i < images.Length; i++)
            {
                Image image = images[i];
                if (image == null || image.GetComponent<RawImage>() != null)
                {
                    continue;
                }

                if (image.GetComponentInParent<Slider>(true) != null && image.GetComponent<Button>() == null)
                {
                    continue;
                }

                string name = image.gameObject.name;
                if (name == "Dim" || name == "Backdrop")
                {
                    UiSkinUtility.ApplyDimOverlay(image);
                    continue;
                }

                if (name == "Card" || name == "DetailCard" || name.EndsWith("Pill"))
                {
                    UiSkinUtility.ApplyModalPanel(image);
                    continue;
                }

                if (image.GetComponent<Button>() != null)
                {
                    bool secondary = name.IndexOf("Close", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                     name.IndexOf("Skip", StringComparison.OrdinalIgnoreCase) >= 0 ||
                                     name.IndexOf("Back", StringComparison.OrdinalIgnoreCase) >= 0;
                    if (secondary)
                    {
                        UiSkinUtility.ApplySecondaryButton(image);
                    }
                    else
                    {
                        UiSkinUtility.ApplyPrimaryButton(image);
                    }
                }
            }

            Text[] labels = root.GetComponentsInChildren<Text>(true);
            for (int i = 0; i < labels.Length; i++)
            {
                Text label = labels[i];
                if (label == null)
                {
                    continue;
                }

                bool title = label.fontStyle == FontStyle.Bold ||
                             label.gameObject.name.IndexOf("Title", StringComparison.OrdinalIgnoreCase) >= 0;
                if (title)
                {
                    UiSkinUtility.StyleTitle(label);
                }
                else
                {
                    UiSkinUtility.StyleBody(label);
                }
            }
        }
    }
}
