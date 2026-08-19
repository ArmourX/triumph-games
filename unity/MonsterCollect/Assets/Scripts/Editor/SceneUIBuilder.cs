#if UNITY_EDITOR
using MonsterCollect.Core;
using MonsterCollect.UI;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.Editor
{
    /// <summary>Shared uGUI construction helpers for Monster Collect scenes.</summary>
    public static class SceneUIBuilder
    {
        public const float TopHudHeight = 84f;
        public const float LeftRailWidth = 118f;
        public const float NavBarHeight = TopHudHeight;
        public static readonly Vector2 ReferenceResolution = new Vector2(1920, 1080);

        public static Font DefaultFont => MobileGameUiKit.BodyFont;

        public static GameObject CreateCanvas(string name)
        {
            var canvasGo = new GameObject(name, typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            var canvas = canvasGo.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;

            var scaler = canvasGo.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = ReferenceResolution;
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = 0.5f;

            var letterboxGo = CreateUIObject("Letterbox", canvasGo.transform);
            StretchFullScreen(letterboxGo.GetComponent<RectTransform>());
            var letterbox = letterboxGo.AddComponent<Image>();
            letterbox.color = new Color(0.02f, 0.03f, 0.06f, 1f);
            letterbox.raycastTarget = false;

            var playFrameGo = CreateUIObject("PlayFrame", canvasGo.transform);
            var playRect = playFrameGo.GetComponent<RectTransform>();
            playRect.anchorMin = new Vector2(0.5f, 0.5f);
            playRect.anchorMax = new Vector2(0.5f, 0.5f);
            playRect.sizeDelta = ReferenceResolution;
            playFrameGo.AddComponent<LandscapePlayFrame>();

            var frameBg = playFrameGo.AddComponent<Image>();
            frameBg.color = new Color(0.07f, 0.09f, 0.16f, 1f);
            frameBg.raycastTarget = false;
            UiSkinUtility.ApplySceneBackground(frameBg);

            var safeAreaGo = CreateUIObject("SafeArea", playFrameGo.transform);
            StretchFullScreen(safeAreaGo.GetComponent<RectTransform>());
            return canvasGo;
        }

        public static Transform GetCanvasContentRoot(GameObject canvasGo)
        {
            Transform playFrame = canvasGo.transform.Find("PlayFrame");
            if (playFrame != null)
            {
                Transform safeArea = playFrame.Find("SafeArea");
                return safeArea != null ? safeArea : playFrame;
            }

            Transform legacySafe = canvasGo.transform.Find("SafeArea");
            return legacySafe != null ? legacySafe : canvasGo.transform;
        }

        public static GameObject CreateUIObject(string name, Transform parent)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            return go;
        }

        public static void StretchFullScreen(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        public static void StretchBelowNavBar(RectTransform rect)
        {
            StretchContentArea(rect);
        }

        public static void StretchContentArea(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = new Vector2(LeftRailWidth, 12f);
            rect.offsetMax = new Vector2(-16f, -TopHudHeight - 8f);
        }

        public static SceneNavigationBar CreateNavigationBar(Transform parent, string activeScene)
        {
            Font font = DefaultFont;
            Transform contentRoot = GetCanvasContentRoot(parent.gameObject);

            var hudGo = CreateUIObject("TopHud", contentRoot);
            var hudRect = hudGo.GetComponent<RectTransform>();
            hudRect.anchorMin = new Vector2(0f, 1f);
            hudRect.anchorMax = new Vector2(1f, 1f);
            hudRect.pivot = new Vector2(0.5f, 1f);
            hudRect.sizeDelta = new Vector2(0f, TopHudHeight);
            hudRect.anchoredPosition = Vector2.zero;
            var hudBg = hudGo.AddComponent<Image>();
            UiSkinUtility.ApplyNavBarBackground(hudBg);
            hudBg.color = new Color(hudBg.color.r, hudBg.color.g, hudBg.color.b, 0.92f);

            var logoGo = CreateUIObject("Logo", hudGo.transform);
            var logoRect = logoGo.GetComponent<RectTransform>();
            logoRect.anchorMin = new Vector2(0.02f, 0.12f);
            logoRect.anchorMax = new Vector2(0.28f, 0.88f);
            logoRect.offsetMin = Vector2.zero;
            logoRect.offsetMax = Vector2.zero;
            var logoText = logoGo.AddComponent<Text>();
            logoText.font = MobileGameUiKit.TitleFont;
            logoText.fontSize = 34;
            logoText.fontStyle = FontStyle.Bold;
            logoText.alignment = TextAnchor.MiddleLeft;
            UiSkinUtility.StyleTitle(logoText);
            logoText.text = "QRmon";

            Text trainerText = CreateHudPill(hudGo.transform, "TrainerPill", 0.30f, 0.48f, font, "Trainer");
            Text energyText = CreateHudPill(hudGo.transform, "EnergyPill", 0.49f, 0.64f, font, "Energy");
            Text coinsText = CreateHudPill(hudGo.transform, "CoinsPill", 0.65f, 0.80f, font, "Coins");

            var railGo = CreateUIObject("LeftRail", contentRoot);
            var railRect = railGo.GetComponent<RectTransform>();
            railRect.anchorMin = new Vector2(0f, 0f);
            railRect.anchorMax = new Vector2(0f, 1f);
            railRect.pivot = new Vector2(0f, 0.5f);
            railRect.sizeDelta = new Vector2(LeftRailWidth, -TopHudHeight);
            railRect.anchoredPosition = new Vector2(0f, -TopHudHeight * 0.5f);
            var railBg = railGo.AddComponent<Image>();
            UiSkinUtility.ApplyNavBarBackground(railBg);
            railBg.color = new Color(0.06f, 0.09f, 0.16f, 0.88f);

            var navBar = hudGo.AddComponent<SceneNavigationBar>();

            Button scanButton = CreateRailTab(railGo.transform, "ScanTab", "Scan", 0.78f, 0.96f, font, out Image scanHighlight);
            Button ranchButton = CreateRailTab(railGo.transform, "RanchTab", "Home", 0.58f, 0.76f, font, out Image ranchHighlight);
            Button dexButton = CreateRailTab(railGo.transform, "DexTab", "Dex", 0.38f, 0.56f, font, out Image dexHighlight);
            Button battleButton = CreateRailTab(railGo.transform, "BattleTab", "Battle", 0.18f, 0.36f, font, out Image battleHighlight);
            Button adventureButton = CreateRailTab(railGo.transform, "AdventureTab", "Explore", 0.02f, 0.16f, font, out _);

            Button settingsButton = CreateHudIconButton(hudGo.transform, "SettingsTab", "Set", 0.90f, 0.98f, font);
            Button goalsButton = CreateHudIconButton(hudGo.transform, "GoalsTab", "Goals", 0.81f, 0.89f, font);

            var navSo = new SerializedObject(navBar);
            navSo.FindProperty("scanButton").objectReferenceValue = scanButton;
            navSo.FindProperty("ranchButton").objectReferenceValue = ranchButton;
            navSo.FindProperty("dexButton").objectReferenceValue = dexButton;
            navSo.FindProperty("battleButton").objectReferenceValue = battleButton;
            navSo.FindProperty("settingsButton").objectReferenceValue = settingsButton;
            navSo.FindProperty("goalsButton").objectReferenceValue = goalsButton;
            navSo.FindProperty("adventureButton").objectReferenceValue = adventureButton;
            navSo.FindProperty("scanHighlight").objectReferenceValue = scanHighlight;
            navSo.FindProperty("ranchHighlight").objectReferenceValue = ranchHighlight;
            navSo.FindProperty("dexHighlight").objectReferenceValue = dexHighlight;
            navSo.FindProperty("battleHighlight").objectReferenceValue = battleHighlight;
            navSo.FindProperty("trainerText").objectReferenceValue = trainerText;
            navSo.FindProperty("energyText").objectReferenceValue = energyText;
            navSo.FindProperty("coinsText").objectReferenceValue = coinsText;
            navSo.FindProperty("activeSceneName").stringValue = activeScene;
            navSo.ApplyModifiedPropertiesWithoutUndo();

            return navBar;
        }

        private static Text CreateHudPill(Transform parent, string name, float minX, float maxX, Font font, string placeholder)
        {
            var go = CreateUIObject(name, parent);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(minX, 0.18f);
            rect.anchorMax = new Vector2(maxX, 0.82f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            var image = go.AddComponent<Image>();
            image.color = new Color(0.08f, 0.12f, 0.22f, 0.85f);
            UiSkinUtility.ApplyModalPanel(image);

            var textGo = CreateUIObject("Label", go.transform);
            StretchFullScreen(textGo.GetComponent<RectTransform>());
            var text = textGo.AddComponent<Text>();
            text.font = font;
            text.fontSize = 20;
            text.alignment = TextAnchor.MiddleCenter;
            UiSkinUtility.StyleMuted(text);
            text.text = placeholder;
            return text;
        }

        private static Button CreateHudIconButton(Transform parent, string name, string label, float minX, float maxX, Font font)
        {
            var go = CreateUIObject(name, parent);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(minX, 0.16f);
            rect.anchorMax = new Vector2(maxX, 0.84f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            var image = go.AddComponent<Image>();
            UiSkinUtility.ApplyTabButton(image, false);
            var button = go.AddComponent<Button>();

            var labelGo = CreateUIObject("Label", go.transform);
            StretchFullScreen(labelGo.GetComponent<RectTransform>());
            var text = labelGo.AddComponent<Text>();
            text.font = font;
            text.fontSize = 18;
            text.alignment = TextAnchor.MiddleCenter;
            UiSkinUtility.StyleButtonLabel(text);
            text.text = label;
            return button;
        }

        private static Button CreateRailTab(
            Transform parent,
            string name,
            string label,
            float minY,
            float maxY,
            Font font,
            out Image highlight)
        {
            var tabGo = CreateUIObject(name, parent);
            var tabRect = tabGo.GetComponent<RectTransform>();
            tabRect.anchorMin = new Vector2(0.08f, minY);
            tabRect.anchorMax = new Vector2(0.92f, maxY);
            tabRect.offsetMin = Vector2.zero;
            tabRect.offsetMax = Vector2.zero;

            var tabImage = tabGo.AddComponent<Image>();
            UiSkinUtility.ApplyTabButton(tabImage, false);
            var button = tabGo.AddComponent<Button>();

            var highlightGo = CreateUIObject("Highlight", tabGo.transform);
            StretchFullScreen(highlightGo.GetComponent<RectTransform>());
            highlight = highlightGo.AddComponent<Image>();
            UiSkinUtility.ApplyTabButton(highlight, true);
            highlight.enabled = false;

            var labelGo = CreateUIObject("Label", tabGo.transform);
            StretchFullScreen(labelGo.GetComponent<RectTransform>());
            var labelText = labelGo.AddComponent<Text>();
            labelText.font = font;
            labelText.fontSize = 20;
            labelText.alignment = TextAnchor.MiddleCenter;
            UiSkinUtility.StyleButtonLabel(labelText);
            labelText.text = label;

            return button;
        }

        public static Text CreateHeader(Transform parent, string text, float topAnchorMin, float topAnchorMax)
        {
            var headerGo = CreateUIObject("Header", parent);
            var headerRect = headerGo.GetComponent<RectTransform>();
            headerRect.anchorMin = new Vector2(0.02f, topAnchorMin);
            headerRect.anchorMax = new Vector2(0.62f, topAnchorMax);
            headerRect.offsetMin = Vector2.zero;
            headerRect.offsetMax = Vector2.zero;

            var headerText = headerGo.AddComponent<Text>();
            headerText.font = MobileGameUiKit.TitleFont;
            headerText.fontSize = 32;
            headerText.fontStyle = FontStyle.Bold;
            headerText.alignment = TextAnchor.MiddleLeft;
            UiSkinUtility.StyleTitle(headerText);
            headerText.text = text;
            return headerText;
        }

        public static Button CreatePrimaryButton(Transform parent, string name, string label, Vector2 anchorMin, Vector2 anchorMax)
        {
            var buttonGo = CreateUIObject(name, parent);
            var buttonRect = buttonGo.GetComponent<RectTransform>();
            buttonRect.anchorMin = anchorMin;
            buttonRect.anchorMax = anchorMax;
            buttonRect.offsetMin = Vector2.zero;
            buttonRect.offsetMax = Vector2.zero;

            var buttonImage = buttonGo.AddComponent<Image>();
            UiSkinUtility.ApplyPrimaryButton(buttonImage);
            var button = buttonGo.AddComponent<Button>();

            var labelGo = CreateUIObject("Label", buttonGo.transform);
            StretchFullScreen(labelGo.GetComponent<RectTransform>());
            var labelText = labelGo.AddComponent<Text>();
            labelText.font = DefaultFont;
            labelText.fontSize = 26;
            labelText.alignment = TextAnchor.MiddleCenter;
            UiSkinUtility.StyleButtonLabel(labelText);
            labelText.text = label;

            return button;
        }

        public static void ApplyContentBackground(Image image)
        {
            if (image == null)
            {
                return;
            }

            image.sprite = null;
            image.color = new Color(1f, 1f, 1f, 0f);
        }
    }
}
#endif
