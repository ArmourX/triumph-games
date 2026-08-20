using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Keeps runtime uGUI text and sprites readable on scaled canvases.</summary>
    public static class UiSharpnessUtility
    {
        private static readonly Color DefaultOutline = new Color(0.04f, 0.06f, 0.12f, 0.72f);
        private static readonly Vector2 DefaultOutlineDistance = new Vector2(1f, -1f);

        public static int EvenFontSize(int size)
        {
            int clamped = Mathf.Max(10, size);
            return clamped % 2 == 0 ? clamped : clamped + 1;
        }

        public static void StyleSharpText(Text text, bool addOutline = true)
        {
            if (text == null)
            {
                return;
            }

            text.fontSize = EvenFontSize(text.fontSize);
            text.resizeTextForBestFit = false;
            text.supportRichText = false;
            text.alignByGeometry = false;
            text.horizontalOverflow = HorizontalWrapMode.Overflow;
            text.verticalOverflow = VerticalWrapMode.Overflow;

            Outline outline = text.GetComponent<Outline>();
            if (outline != null)
            {
                outline.enabled = addOutline;
            }
        }

        public static void ApplyOutline(Text text, Color color, Vector2 distance)
        {
            if (text == null)
            {
                return;
            }

            Outline outline = text.GetComponent<Outline>() ?? text.gameObject.AddComponent<Outline>();
            outline.effectColor = color;
            outline.effectDistance = distance;
            outline.useGraphicAlpha = true;
        }

        public static void ApplyCrispImage(Image image, bool preserveAspect = false)
        {
            if (image == null)
            {
                return;
            }

            image.type = Image.Type.Simple;
            image.preserveAspect = preserveAspect;
            image.pixelsPerUnitMultiplier = 1f;
            image.useSpriteMesh = false;
        }

        public static void ApplyCrispRawImage(RawImage image)
        {
            if (image == null)
            {
                return;
            }

            image.uvRect = new Rect(0f, 0f, 1f, 1f);
            if (image.texture != null)
            {
                image.texture.filterMode = FilterMode.Bilinear;
                image.texture.anisoLevel = 0;
            }
        }

        public static void ApplyLandscapeCanvasScaler(CanvasScaler scaler)
        {
            if (scaler == null)
            {
                return;
            }

            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = SceneUIBuilderReference.Resolution;
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = 1f;
            scaler.referencePixelsPerUnit = 100f;
        }

        public static void ApplyCoverBackground(Image image, Sprite sprite)
        {
            if (image == null || sprite == null)
            {
                return;
            }

            ApplyCrispImage(image, preserveAspect: true);
            image.sprite = sprite;
            image.color = Color.white;

            AspectRatioFitter fitter = image.GetComponent<AspectRatioFitter>() ??
                                       image.gameObject.AddComponent<AspectRatioFitter>();
            fitter.aspectMode = AspectRatioFitter.AspectMode.EnvelopeParent;
            fitter.aspectRatio = sprite.rect.width / Mathf.Max(1f, sprite.rect.height);
        }
    }

    /// <summary>Runtime mirror of editor SceneUIBuilder reference resolution.</summary>
    public static class SceneUIBuilderReference
    {
        public static readonly Vector2 Resolution = new Vector2(1920f, 1080f);
    }
}
