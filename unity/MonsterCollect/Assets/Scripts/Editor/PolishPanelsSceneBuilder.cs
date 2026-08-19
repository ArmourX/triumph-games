#if UNITY_EDITOR
using MonsterCollect.UI;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.Editor
{
    /// <summary>Builds settings and share overlays used across scenes.</summary>
    public static class PolishPanelsSceneBuilder
    {
        private static readonly Color SectionColor = new Color(0.55f, 0.85f, 1f);
        private static readonly Color HintColor = new Color(0.72f, 0.72f, 0.78f);

        public static SettingsPanel CreateSettingsPanel(Transform parent, Font font)
        {
            var panelRoot = SceneUIBuilder.CreateUIObject("SettingsPanel", parent);
            SceneUIBuilder.StretchFullScreen(panelRoot.GetComponent<RectTransform>());
            var settingsPanel = panelRoot.AddComponent<SettingsPanel>();

            var backdropGo = SceneUIBuilder.CreateUIObject("Backdrop", panelRoot.transform);
            SceneUIBuilder.StretchFullScreen(backdropGo.GetComponent<RectTransform>());
            backdropGo.AddComponent<Image>().color = new Color(0f, 0f, 0f, 0.78f);

            var cardGo = SceneUIBuilder.CreateUIObject("Card", panelRoot.transform);
            var cardRect = cardGo.GetComponent<RectTransform>();
            cardRect.anchorMin = new Vector2(0.16f, 0.08f);
            cardRect.anchorMax = new Vector2(0.84f, 0.92f);
            cardRect.offsetMin = Vector2.zero;
            cardRect.offsetMax = Vector2.zero;
            cardGo.AddComponent<Image>().color = new Color(0.12f, 0.12f, 0.16f, 0.98f);

            CreateLabel(cardGo.transform, font, "Title", "Settings", 38, FontStyle.Bold,
                new Vector2(0.08f, 0.92f), new Vector2(0.88f, 0.98f), TextAnchor.MiddleLeft, Color.white);
            Button closeButton = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "TopCloseButton", "×",
                new Vector2(0.90f, 0.91f), new Vector2(0.98f, 0.98f));

            CreateLabel(cardGo.transform, font, "AudioHeader", "Audio & Feedback", 24, FontStyle.Bold,
                new Vector2(0.08f, 0.86f), new Vector2(0.92f, 0.91f), TextAnchor.MiddleLeft, SectionColor);
            Toggle sfxToggle = CreateToggle(cardGo.transform, font, "SfxToggle", "Sound effects", 0.82f);
            CreateHint(cardGo.transform, font, "SfxHint", "Play tones for button taps, scans, battles, and results.", 0.765f);
            Toggle particlesToggle = CreateToggle(cardGo.transform, font, "ParticlesToggle", "Celebration particles", 0.71f);
            CreateHint(cardGo.transform, font, "ParticlesHint", "Show sparkles when monsters are born, bred, or hit in battle.", 0.655f);

            CreateLabel(cardGo.transform, font, "ScannerHeader", "QR Scanner", 24, FontStyle.Bold,
                new Vector2(0.08f, 0.60f), new Vector2(0.92f, 0.65f), TextAnchor.MiddleLeft, SectionColor);
            Text scanLabel = CreateLabel(cardGo.transform, font, "ScanIntervalLabel", "Scan interval: 0.40s", 22, FontStyle.Normal,
                new Vector2(0.1f, 0.545f), new Vector2(0.9f, 0.595f), TextAnchor.MiddleLeft, Color.white);
            Slider scanSlider = CreateSlider(cardGo.transform, "ScanIntervalSlider", 0.505f);
            CreateHint(cardGo.transform, font, "ScanHint", "How often the camera looks for QR codes. Lower = faster, more battery use.", 0.445f);

            CreateLabel(cardGo.transform, font, "ProgressHeader", "Your Progress", 24, FontStyle.Bold,
                new Vector2(0.08f, 0.39f), new Vector2(0.92f, 0.44f), TextAnchor.MiddleLeft, SectionColor);
            Text statsText = CreateLabel(cardGo.transform, font, "StatsText", string.Empty, 20, FontStyle.Normal,
                new Vector2(0.1f, 0.18f), new Vector2(0.9f, 0.385f), TextAnchor.UpperLeft, new Color(0.9f, 0.9f, 0.92f));

            CreateLabel(cardGo.transform, font, "ActionsHeader", "Actions", 24, FontStyle.Bold,
                new Vector2(0.08f, 0.145f), new Vector2(0.92f, 0.175f), TextAnchor.MiddleLeft, SectionColor);
            CreateHint(cardGo.transform, font, "ClearScanHint", "Clear Scan History lets you re-scan the same QR codes today.", 0.115f);
            Button clearButton = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "ClearScanHistoryButton", "Clear Scan History",
                new Vector2(0.1f, 0.065f), new Vector2(0.48f, 0.105f));
            Button cheatsButton = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "OpenCheatsButton", "Debug Cheats",
                new Vector2(0.52f, 0.065f), new Vector2(0.9f, 0.105f));

            CreateCheatMenuPanel(parent, font);

            var panelSo = new SerializedObject(settingsPanel);
            panelSo.FindProperty("rootPanel").objectReferenceValue = panelRoot;
            panelSo.FindProperty("sfxToggle").objectReferenceValue = sfxToggle;
            panelSo.FindProperty("particlesToggle").objectReferenceValue = particlesToggle;
            panelSo.FindProperty("scanIntervalSlider").objectReferenceValue = scanSlider;
            panelSo.FindProperty("scanIntervalLabel").objectReferenceValue = scanLabel;
            panelSo.FindProperty("statsText").objectReferenceValue = statsText;
            panelSo.FindProperty("clearScanHistoryButton").objectReferenceValue = clearButton;
            panelSo.FindProperty("openCheatsButton").objectReferenceValue = cheatsButton;
            panelSo.FindProperty("closeButton").objectReferenceValue = closeButton;
            panelSo.ApplyModifiedPropertiesWithoutUndo();

            panelRoot.SetActive(false);
            return settingsPanel;
        }

        public static CheatMenuPanel CreateCheatMenuPanel(Transform parent, Font font)
        {
            var panelRoot = SceneUIBuilder.CreateUIObject("CheatMenuPanel", parent);
            SceneUIBuilder.StretchFullScreen(panelRoot.GetComponent<RectTransform>());
            var cheatPanel = panelRoot.AddComponent<CheatMenuPanel>();

            var backdropGo = SceneUIBuilder.CreateUIObject("Backdrop", panelRoot.transform);
            SceneUIBuilder.StretchFullScreen(backdropGo.GetComponent<RectTransform>());
            backdropGo.AddComponent<Image>().color = new Color(0f, 0f, 0f, 0.82f);

            var cardGo = SceneUIBuilder.CreateUIObject("Card", panelRoot.transform);
            var cardRect = cardGo.GetComponent<RectTransform>();
            cardRect.anchorMin = new Vector2(0.08f, 0.14f);
            cardRect.anchorMax = new Vector2(0.92f, 0.86f);
            cardRect.offsetMin = Vector2.zero;
            cardRect.offsetMax = Vector2.zero;
            cardGo.AddComponent<Image>().color = new Color(0.14f, 0.1f, 0.16f, 0.98f);

            CreateLabel(cardGo.transform, font, "Title", "Debug Cheats", 38, FontStyle.Bold,
                new Vector2(0.08f, 0.88f), new Vector2(0.92f, 0.96f), TextAnchor.MiddleLeft, Color.white);
            CreateHint(cardGo.transform, font, "CheatIntro", "For testing only. Unlocks dex entries and fills your ranch.", 0.83f);
            Text messageText = CreateLabel(cardGo.transform, font, "MessageText", string.Empty, 20, FontStyle.Normal,
                new Vector2(0.08f, 0.12f), new Vector2(0.92f, 0.22f), TextAnchor.MiddleCenter, new Color(0.85f, 0.95f, 0.85f));

            Button unlockDexBtn = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "UnlockDexButton", "Unlock All Dex",
                new Vector2(0.08f, 0.72f), new Vector2(0.92f, 0.8f));
            CreateHint(cardGo.transform, font, "UnlockDexHint", "Reveals every entry in the Dex (300 total).", 0.665f);
            Button fillRanchBtn = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "FillRanchButton", "Fill Ranch (300)",
                new Vector2(0.08f, 0.58f), new Vector2(0.92f, 0.66f));
            CreateHint(cardGo.transform, font, "FillRanchHint", "Adds one owned monster for each dex slot.", 0.525f);
            Button unlockAllBtn = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "UnlockAllButton", "Unlock All + Fill Ranch",
                new Vector2(0.08f, 0.44f), new Vector2(0.92f, 0.52f));
            CreateHint(cardGo.transform, font, "UnlockAllHint", "Does both actions above in one tap.", 0.385f);
            Button refillEnergyBtn = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "RefillEnergyButton", "Refill Energy",
                new Vector2(0.08f, 0.30f), new Vector2(0.48f, 0.38f));
            Button addEssenceBtn = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "AddEssenceButton", "+999 Essence",
                new Vector2(0.52f, 0.30f), new Vector2(0.92f, 0.38f));
            CreateHint(cardGo.transform, font, "BonusHint", "Refill Energy restores daily energy. Essence is used for breeding.", 0.245f);
            Button closeButton = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "CloseButton", "Close Cheats",
                new Vector2(0.3f, 0.24f), new Vector2(0.7f, 0.32f));

            var panelSo = new SerializedObject(cheatPanel);
            panelSo.FindProperty("rootPanel").objectReferenceValue = panelRoot;
            panelSo.FindProperty("messageText").objectReferenceValue = messageText;
            panelSo.FindProperty("unlockDexButton").objectReferenceValue = unlockDexBtn;
            panelSo.FindProperty("fillRanchButton").objectReferenceValue = fillRanchBtn;
            panelSo.FindProperty("unlockAllButton").objectReferenceValue = unlockAllBtn;
            panelSo.FindProperty("refillEnergyButton").objectReferenceValue = refillEnergyBtn;
            panelSo.FindProperty("addEssenceButton").objectReferenceValue = addEssenceBtn;
            panelSo.FindProperty("closeButton").objectReferenceValue = closeButton;
            panelSo.ApplyModifiedPropertiesWithoutUndo();

            panelRoot.SetActive(false);
            return cheatPanel;
        }

        public static MonsterSharePanel CreateSharePanel(Transform parent, Font font)
        {
            var panelRoot = SceneUIBuilder.CreateUIObject("MonsterSharePanel", parent);
            SceneUIBuilder.StretchFullScreen(panelRoot.GetComponent<RectTransform>());
            var sharePanel = panelRoot.AddComponent<MonsterSharePanel>();

            var backdropGo = SceneUIBuilder.CreateUIObject("Backdrop", panelRoot.transform);
            SceneUIBuilder.StretchFullScreen(backdropGo.GetComponent<RectTransform>());
            backdropGo.AddComponent<Image>().color = new Color(0f, 0f, 0f, 0.82f);

            var cardGo = SceneUIBuilder.CreateUIObject("Card", panelRoot.transform);
            var cardRect = cardGo.GetComponent<RectTransform>();
            cardRect.anchorMin = new Vector2(0.06f, 0.1f);
            cardRect.anchorMax = new Vector2(0.94f, 0.9f);
            cardRect.offsetMin = Vector2.zero;
            cardRect.offsetMax = Vector2.zero;
            cardGo.AddComponent<Image>().color = new Color(0.11f, 0.11f, 0.15f, 0.98f);

            CreateLabel(cardGo.transform, font, "Title", "Share Monster", 38, FontStyle.Bold,
                new Vector2(0.06f, 0.88f), new Vector2(0.94f, 0.96f), TextAnchor.MiddleLeft, Color.white);
            RawImage previewImage = CreatePreview(cardGo.transform, "Preview", new Vector2(0.06f, 0.62f), new Vector2(0.28f, 0.86f));
            RawImage qrImage = CreatePreview(cardGo.transform, "QrImage", new Vector2(0.32f, 0.48f), new Vector2(0.94f, 0.86f));
            Text detailsText = CreateLabel(cardGo.transform, font, "DetailsText", string.Empty, 22, FontStyle.Normal,
                new Vector2(0.06f, 0.34f), new Vector2(0.94f, 0.46f), TextAnchor.UpperCenter, Color.white);
            Text payloadText = CreateLabel(cardGo.transform, font, "PayloadText", string.Empty, 18, FontStyle.Normal,
                new Vector2(0.06f, 0.24f), new Vector2(0.94f, 0.33f), TextAnchor.MiddleCenter, Color.white);
            Button closeButton = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "CloseButton", "Close",
                new Vector2(0.38f, 0.08f), new Vector2(0.70f, 0.16f));
            Button copyButton = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "CopyButton", "Copy Code",
                new Vector2(0.72f, 0.08f), new Vector2(0.94f, 0.16f));
            Button publishButton = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "PublishButton", "Publish",
                new Vector2(0.06f, 0.02f), new Vector2(0.28f, 0.07f));
            Button showcaseButton = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "ShowcaseButton", "Showcase",
                new Vector2(0.30f, 0.02f), new Vector2(0.52f, 0.07f));
            Button saveImageButton = SceneUIBuilder.CreatePrimaryButton(cardGo.transform, "SaveImageButton", "Save PNG",
                new Vector2(0.54f, 0.02f), new Vector2(0.76f, 0.07f));

            var panelSo = new SerializedObject(sharePanel);
            panelSo.FindProperty("rootPanel").objectReferenceValue = panelRoot;
            panelSo.FindProperty("qrImage").objectReferenceValue = qrImage;
            panelSo.FindProperty("previewImage").objectReferenceValue = previewImage;
            panelSo.FindProperty("titleText").objectReferenceValue = cardGo.transform.Find("Title")?.GetComponent<Text>();
            panelSo.FindProperty("detailsText").objectReferenceValue = detailsText;
            panelSo.FindProperty("payloadText").objectReferenceValue = payloadText;
            panelSo.FindProperty("closeButton").objectReferenceValue = closeButton;
            panelSo.FindProperty("copyButton").objectReferenceValue = copyButton;
            panelSo.FindProperty("publishButton").objectReferenceValue = publishButton;
            panelSo.FindProperty("showcaseButton").objectReferenceValue = showcaseButton;
            panelSo.FindProperty("saveImageButton").objectReferenceValue = saveImageButton;
            panelSo.ApplyModifiedPropertiesWithoutUndo();

            panelRoot.SetActive(false);
            return sharePanel;
        }

        private static Text CreateLabel(
            Transform parent,
            Font font,
            string name,
            string text,
            int fontSize,
            FontStyle fontStyle,
            Vector2 anchorMin,
            Vector2 anchorMax,
            TextAnchor alignment,
            Color color)
        {
            var labelGo = SceneUIBuilder.CreateUIObject(name, parent);
            var labelRect = labelGo.GetComponent<RectTransform>();
            labelRect.anchorMin = anchorMin;
            labelRect.anchorMax = anchorMax;
            labelRect.offsetMin = Vector2.zero;
            labelRect.offsetMax = Vector2.zero;
            var labelText = labelGo.AddComponent<Text>();
            labelText.font = font;
            labelText.fontSize = fontSize;
            labelText.fontStyle = fontStyle;
            labelText.alignment = alignment;
            labelText.color = color;
            labelText.text = text;
            return labelText;
        }

        private static Text CreateHint(Transform parent, Font font, string name, string text, float anchorY)
        {
            return CreateLabel(
                parent,
                font,
                name,
                text,
                17,
                FontStyle.Italic,
                new Vector2(0.1f, anchorY - 0.035f),
                new Vector2(0.9f, anchorY),
                TextAnchor.UpperLeft,
                HintColor);
        }

        private static Toggle CreateToggle(Transform parent, Font font, string name, string label, float anchorY)
        {
            var toggleGo = SceneUIBuilder.CreateUIObject(name, parent);
            var toggleRect = toggleGo.GetComponent<RectTransform>();
            toggleRect.anchorMin = new Vector2(0.1f, anchorY - 0.045f);
            toggleRect.anchorMax = new Vector2(0.9f, anchorY);
            toggleRect.offsetMin = Vector2.zero;
            toggleRect.offsetMax = Vector2.zero;

            var backgroundGo = SceneUIBuilder.CreateUIObject("Background", toggleGo.transform);
            var backgroundRect = backgroundGo.GetComponent<RectTransform>();
            backgroundRect.anchorMin = new Vector2(0f, 0.15f);
            backgroundRect.anchorMax = new Vector2(0.07f, 0.85f);
            backgroundRect.offsetMin = Vector2.zero;
            backgroundRect.offsetMax = Vector2.zero;
            backgroundGo.AddComponent<Image>().color = new Color(0.2f, 0.2f, 0.25f);

            var checkGo = SceneUIBuilder.CreateUIObject("Checkmark", backgroundGo.transform);
            SceneUIBuilder.StretchFullScreen(checkGo.GetComponent<RectTransform>());
            checkGo.AddComponent<Image>().color = new Color(0.3f, 0.85f, 0.45f);

            var labelGo = SceneUIBuilder.CreateUIObject("Label", toggleGo.transform);
            var labelRect = labelGo.GetComponent<RectTransform>();
            labelRect.anchorMin = new Vector2(0.09f, 0f);
            labelRect.anchorMax = new Vector2(1f, 1f);
            labelRect.offsetMin = Vector2.zero;
            labelRect.offsetMax = Vector2.zero;
            var labelText = labelGo.AddComponent<Text>();
            labelText.font = font;
            labelText.fontSize = 22;
            labelText.fontStyle = FontStyle.Bold;
            labelText.alignment = TextAnchor.MiddleLeft;
            labelText.color = Color.white;
            labelText.text = label;

            var toggle = toggleGo.AddComponent<Toggle>();
            toggle.targetGraphic = backgroundGo.GetComponent<Image>();
            toggle.graphic = checkGo.GetComponent<Image>();
            toggle.isOn = true;
            return toggle;
        }

        private static Slider CreateSlider(Transform parent, string name, float anchorY)
        {
            var sliderGo = SceneUIBuilder.CreateUIObject(name, parent);
            var sliderRect = sliderGo.GetComponent<RectTransform>();
            sliderRect.anchorMin = new Vector2(0.1f, anchorY - 0.035f);
            sliderRect.anchorMax = new Vector2(0.9f, anchorY);
            sliderRect.offsetMin = Vector2.zero;
            sliderRect.offsetMax = Vector2.zero;

            var backgroundGo = SceneUIBuilder.CreateUIObject("Background", sliderGo.transform);
            SceneUIBuilder.StretchFullScreen(backgroundGo.GetComponent<RectTransform>());
            backgroundGo.AddComponent<Image>().color = new Color(0.15f, 0.15f, 0.2f);

            var fillAreaGo = SceneUIBuilder.CreateUIObject("Fill Area", sliderGo.transform);
            SceneUIBuilder.StretchFullScreen(fillAreaGo.GetComponent<RectTransform>());
            var fillGo = SceneUIBuilder.CreateUIObject("Fill", fillAreaGo.transform);
            SceneUIBuilder.StretchFullScreen(fillGo.GetComponent<RectTransform>());
            var fillImage = fillGo.AddComponent<Image>();
            fillImage.color = new Color(0.2f, 0.65f, 0.95f);

            var handleAreaGo = SceneUIBuilder.CreateUIObject("Handle Slide Area", sliderGo.transform);
            SceneUIBuilder.StretchFullScreen(handleAreaGo.GetComponent<RectTransform>());
            var handleGo = SceneUIBuilder.CreateUIObject("Handle", handleAreaGo.transform);
            var handleRect = handleGo.GetComponent<RectTransform>();
            handleRect.sizeDelta = new Vector2(36f, 36f);
            handleGo.AddComponent<Image>().color = Color.white;

            var slider = sliderGo.AddComponent<Slider>();
            slider.fillRect = fillGo.GetComponent<RectTransform>();
            slider.handleRect = handleGo.GetComponent<RectTransform>();
            slider.targetGraphic = handleGo.GetComponent<Image>();
            slider.minValue = 0.3f;
            slider.maxValue = 0.6f;
            slider.value = 0.4f;
            return slider;
        }

        private static RawImage CreatePreview(Transform parent, string name, Vector2 anchorMin, Vector2 anchorMax)
        {
            var previewGo = SceneUIBuilder.CreateUIObject(name, parent);
            var previewRect = previewGo.GetComponent<RectTransform>();
            previewRect.anchorMin = anchorMin;
            previewRect.anchorMax = anchorMax;
            previewRect.offsetMin = Vector2.zero;
            previewRect.offsetMax = Vector2.zero;
            previewGo.AddComponent<Image>().color = new Color(0.08f, 0.08f, 0.12f, 0.9f);
            return previewGo.AddComponent<RawImage>();
        }
    }
}
#endif
