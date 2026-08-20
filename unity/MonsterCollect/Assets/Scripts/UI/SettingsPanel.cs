using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.QR;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Basic settings overlay — audio, particles, scan pacing, and maintenance.</summary>
    [DisallowMultipleComponent]
    public class SettingsPanel : MonoBehaviour
    {
        public static SettingsPanel Instance { get; private set; }

        private const float FooterMinY = 0.02f;
        private const float FooterMaxY = 0.30f;

        [SerializeField] private GameObject rootPanel;
        [SerializeField] private Toggle sfxToggle;
        [SerializeField] private Toggle particlesToggle;
        [SerializeField] private Slider scanIntervalSlider;
        [SerializeField] private Text scanIntervalLabel;
        [SerializeField] private Text statsText;
        [SerializeField] private Button clearScanHistoryButton;
        [SerializeField] private Button openCheatsButton;
        [SerializeField] private Button closeButton;

        private MonsterScanHandler scanHandler;
        private CheatMenuPanel cheatMenuPanel;
        private RectTransform cardRect;
        private bool footerBuilt;
        private bool topCloseBuilt;
        private bool accessibilityBuilt;
        private Slider textScaleSlider;
        private Toggle musicToggle;
        private Toggle hapticsToggle;
        private Toggle colorblindToggle;
        private Toggle reducedMotionToggle;

        private void Awake()
        {
            Instance = this;

            if (sfxToggle != null)
            {
                sfxToggle.onValueChanged.AddListener(value => GameSettings.SfxEnabled = value);
            }

            if (particlesToggle != null)
            {
                particlesToggle.onValueChanged.AddListener(value => GameSettings.ParticlesEnabled = value);
            }

            if (scanIntervalSlider != null)
            {
                scanIntervalSlider.onValueChanged.AddListener(OnScanIntervalChanged);
            }

            if (clearScanHistoryButton != null)
            {
                clearScanHistoryButton.onClick.AddListener(ClearScanHistory);
            }

            if (openCheatsButton != null)
            {
                openCheatsButton.onClick.AddListener(OpenCheats);
            }

            if (closeButton != null)
            {
                closeButton.onClick.AddListener(Hide);
            }

            cheatMenuPanel = FindObjectOfType<CheatMenuPanel>(true);
            scanHandler = FindObjectOfType<MonsterScanHandler>();
            EnsureTopCloseButton();
            EnsureActionFooter();
            HideImmediate();
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        public static void ShowPanel()
        {
            SettingsPanel panel = Instance ?? FindObjectOfType<SettingsPanel>(true);
            if (panel == null)
            {
                return;
            }

            panel.Show();
        }

        public void Show()
        {
            KitUi.RestyleExisting(transform);
            EnsureTopCloseButton();
            EnsureActionFooter();
            EnsureAccessibilitySection();
            ApplyDescriptiveLabels();
            Refresh();

            if (rootPanel != null)
            {
                rootPanel.SetActive(true);
            }

            gameObject.SetActive(true);
        }

        public void Hide()
        {
            if (rootPanel != null && rootPanel != gameObject)
            {
                rootPanel.SetActive(false);
            }
            else
            {
                gameObject.SetActive(false);
            }
        }

        private void HideImmediate()
        {
            Hide();
        }

        public void Refresh()
        {
            if (sfxToggle != null)
            {
                sfxToggle.isOn = GameSettings.SfxEnabled;
            }

            if (particlesToggle != null)
            {
                particlesToggle.isOn = GameSettings.ParticlesEnabled;
            }

            if (musicToggle != null)
            {
                musicToggle.isOn = GameSettings.MusicEnabled;
            }

            if (hapticsToggle != null)
            {
                hapticsToggle.isOn = GameSettings.HapticsEnabled;
            }

            if (colorblindToggle != null)
            {
                colorblindToggle.isOn = GameSettings.ColorblindIndicatorsEnabled;
            }

            if (reducedMotionToggle != null)
            {
                reducedMotionToggle.isOn = GameSettings.ReducedMotionEnabled;
            }

            if (textScaleSlider != null)
            {
                textScaleSlider.minValue = GameSettings.MinTextScale;
                textScaleSlider.maxValue = GameSettings.MaxTextScale;
                textScaleSlider.value = GameSettings.TextScale;
            }

            if (scanIntervalSlider != null)
            {
                scanIntervalSlider.minValue = GameSettings.MinScanInterval;
                scanIntervalSlider.maxValue = GameSettings.MaxScanInterval;
                scanIntervalSlider.value = GameSettings.ScanIntervalSeconds;
            }

            UpdateScanIntervalLabel(GameSettings.ScanIntervalSeconds);

            if (statsText != null)
            {
                statsText.raycastTarget = false;
                statsText.supportRichText = true;
                statsText.text =
                    "<b>Ranch</b>\n" +
                    $"Monsters owned: {MonsterCollectionService.Count} / {MonsterCollectionService.MaxRanchSlots}\n" +
                    $"Essence (breeding currency): {MonsterCollectionService.RanchEssence}\n" +
                    $"Dex discovered: {MonsterCollectionService.UnlockedDexCount} / {MonsterCollectionService.TotalDexEntries}\n\n" +
                    "<b>Connection</b>\n" +
                    (Application.internetReachability == NetworkReachability.NotReachable
                        ? "Offline — all core features work locally.\n\n"
                        : "Online — optional social sync available.\n\n") +
                    "<b>Daily limits</b> (reset at local midnight)\n" +
                    $"Energy remaining: {RanchEnergyService.Current} / {RanchEnergyService.DailyMax}\n" +
                    $"Scans used today: {MonsterCollectionService.ScansToday} / {ScanLimitService.MaxScansPerDay}\n\n" +
                    "<b>Action costs (energy)</b>\n" +
                    $"Scan a QR: {RanchEnergyService.ScanCost}\n" +
                    $"Start a battle: {RanchEnergyService.BattleCost}\n" +
                    $"Breed monsters: {RanchEnergyService.BreedCost}";
            }
        }

        private void EnsureActionFooter()
        {
            if (footerBuilt)
            {
                return;
            }

            cardRect = FindCardRect();
            if (cardRect == null)
            {
                return;
            }

            HideLegacyActionButtons();

            var footerGo = new GameObject("ActionFooter", typeof(RectTransform), typeof(VerticalLayoutGroup));
            footerGo.transform.SetParent(cardRect, false);
            var footerRect = footerGo.GetComponent<RectTransform>();
            footerRect.anchorMin = new Vector2(0.05f, FooterMinY);
            footerRect.anchorMax = new Vector2(0.95f, FooterMaxY);
            footerRect.offsetMin = Vector2.zero;
            footerRect.offsetMax = Vector2.zero;

            var layout = footerGo.GetComponent<VerticalLayoutGroup>();
            layout.spacing = 10f;
            layout.padding = new RectOffset(0, 0, 4, 4);
            layout.childAlignment = TextAnchor.MiddleCenter;
            layout.childControlHeight = true;
            layout.childControlWidth = true;
            layout.childForceExpandHeight = true;
            layout.childForceExpandWidth = true;

            CreateFooterButton(footerGo.transform, "Clear Scan History", "Lets you scan the same QR codes again today.", ClearScanHistory);

            if (GameSettings.ShowDebugTools)
            {
                CreateFooterButton(footerGo.transform, "Debug Cheats", "Unlock dex entries and fill your ranch.", OpenCheats);
            }

            CreateFooterButton(footerGo.transform, "Replay Tutorial", "Show the first-time walkthrough again.", ReplayTutorial);
            CreateFooterButton(footerGo.transform, "Credits", "View game credits and version info.", () => CreditsPanel.ShowPanel());

            footerGo.transform.SetAsLastSibling();
            ClipContentAboveFooter();
            footerBuilt = true;
        }

        private void EnsureAccessibilitySection()
        {
            if (accessibilityBuilt || cardRect == null)
            {
                return;
            }

            accessibilityBuilt = true;
            Font font = statsText != null ? statsText.font : MobileGameUiKit.BodyFont;

            var section = new GameObject("AccessibilitySection", typeof(RectTransform));
            section.transform.SetParent(cardRect, false);
            var sectionRect = section.GetComponent<RectTransform>();
            sectionRect.anchorMin = new Vector2(0.05f, FooterMaxY + 0.02f);
            sectionRect.anchorMax = new Vector2(0.95f, FooterMaxY + 0.22f);
            sectionRect.offsetMin = Vector2.zero;
            sectionRect.offsetMax = Vector2.zero;

            var header = CreateInlineText(section.transform, font, "Accessibility", 22, FontStyle.Bold, new Vector2(0f, 0.78f), new Vector2(1f, 1f));

            musicToggle = CreateInlineToggle(section.transform, font, "Background music", 0.52f, 0.78f, 1f, 0.96f,
                GameSettings.MusicEnabled, value =>
                {
                    GameSettings.MusicEnabled = value;
                    BackgroundMusicService.Instance?.RefreshPlayback();
                });

            hapticsToggle = CreateInlineToggle(section.transform, font, "Haptic feedback", 0f, 0.78f, 0.48f, 0.96f,
                GameSettings.HapticsEnabled, value => GameSettings.HapticsEnabled = value);

            colorblindToggle = CreateInlineToggle(section.transform, font, "Element symbols (colorblind)", 0f, 0.4f, 0.48f, 0.58f,
                GameSettings.ColorblindIndicatorsEnabled, value => GameSettings.ColorblindIndicatorsEnabled = value);

            reducedMotionToggle = CreateInlineToggle(section.transform, font, "Reduced motion", 0.52f, 0.4f, 1f, 0.58f,
                GameSettings.ReducedMotionEnabled, value => GameSettings.ReducedMotionEnabled = value);

            textScaleSlider = CreateInlineSlider(section.transform, font, "Text size", 0f, 0.02f, 1f, 0.36f,
                GameSettings.MinTextScale, GameSettings.MaxTextScale, GameSettings.TextScale,
                value => GameSettings.TextScale = value);

            _ = header;
        }

        private static Text CreateInlineText(Transform parent, Font font, string label, int size, FontStyle style, Vector2 anchorMin, Vector2 anchorMax)
        {
            var go = new GameObject(label + "Label", typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            var text = go.GetComponent<Text>();
            text.font = font;
            text.fontSize = size;
            text.fontStyle = style;
            text.color = Color.white;
            text.text = label;
            return text;
        }

        private static Toggle CreateInlineToggle(Transform parent, Font font, string label, float minX, float minY, float maxX, float maxY, bool value, UnityEngine.Events.UnityAction<bool> onChanged)
        {
            var go = new GameObject(label + "Toggle", typeof(RectTransform), typeof(Toggle));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(minX, minY);
            rect.anchorMax = new Vector2(maxX, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            var bg = new GameObject("Background", typeof(RectTransform), typeof(Image));
            bg.transform.SetParent(go.transform, false);
            Stretch(bg.GetComponent<RectTransform>());
            bg.GetComponent<Image>().color = new Color(0.2f, 0.24f, 0.32f, 1f);

            var check = new GameObject("Checkmark", typeof(RectTransform), typeof(Image));
            check.transform.SetParent(bg.transform, false);
            Stretch(check.GetComponent<RectTransform>());
            check.GetComponent<Image>().color = new Color(0.35f, 0.75f, 1f, 1f);

            var labelGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            labelGo.transform.SetParent(go.transform, false);
            var labelRect = labelGo.GetComponent<RectTransform>();
            labelRect.anchorMin = new Vector2(0.08f, 0f);
            labelRect.anchorMax = new Vector2(0.92f, 1f);
            labelRect.offsetMin = Vector2.zero;
            labelRect.offsetMax = Vector2.zero;
            var labelText = labelGo.GetComponent<Text>();
            labelText.font = font;
            labelText.fontSize = 18;
            labelText.color = Color.white;
            labelText.text = label;

            Toggle toggle = go.GetComponent<Toggle>();
            toggle.targetGraphic = bg.GetComponent<Image>();
            toggle.graphic = check.GetComponent<Image>();
            toggle.isOn = value;
            toggle.onValueChanged.AddListener(onChanged);
            return toggle;
        }

        private static Slider CreateInlineSlider(Transform parent, Font font, string label, float minX, float minY, float maxX, float maxY, float min, float max, float value, UnityEngine.Events.UnityAction<float> onChanged)
        {
            var go = new GameObject(label + "Slider", typeof(RectTransform), typeof(Slider));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(minX, minY);
            rect.anchorMax = new Vector2(maxX, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            var caption = CreateInlineText(go.transform, font, label, 18, FontStyle.Normal, new Vector2(0f, 0.55f), new Vector2(1f, 1f));

            var slider = go.GetComponent<Slider>();
            slider.minValue = min;
            slider.maxValue = max;
            slider.value = value;
            slider.onValueChanged.AddListener(onChanged);
            _ = caption;
            return slider;
        }

        private static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private void ReplayTutorial()
        {
            OnboardingService.ResetTutorial();
            TutorialPanel.ShowPanel();
            GameFeedbackService.Instance?.PlayUiTap();
        }

        private RectTransform FindCardRect()
        {
            Transform card = transform.Find("Card");
            if (card == null && rootPanel != null)
            {
                card = rootPanel.transform.Find("Card");
            }

            return card != null ? card.GetComponent<RectTransform>() : null;
        }

        private void EnsureTopCloseButton()
        {
            if (topCloseBuilt)
            {
                return;
            }

            cardRect ??= FindCardRect();
            if (cardRect == null)
            {
                return;
            }

            Transform card = cardRect.transform;
            if (card.Find("TopCloseButton") is Transform existingTop &&
                existingTop.TryGetComponent(out Button existingButton))
            {
                WireCloseButton(existingButton);
                topCloseBuilt = true;
                return;
            }

            if (closeButton != null)
            {
                var closeRect = closeButton.GetComponent<RectTransform>();
                if (closeRect != null && closeRect.anchorMin.y >= 0.85f)
                {
                    WireCloseButton(closeButton);
                    topCloseBuilt = true;
                    return;
                }
            }

            SetInactiveChild(card, "CloseButton");
            SetInactive(closeButton);

            Font font = statsText != null ? statsText.font : MobileGameUiKit.BodyFont;

            var buttonGo = new GameObject("TopCloseButton", typeof(RectTransform), typeof(Image), typeof(Button));
            buttonGo.transform.SetParent(card, false);

            var buttonRect = buttonGo.GetComponent<RectTransform>();
            buttonRect.anchorMin = new Vector2(0.90f, 0.91f);
            buttonRect.anchorMax = new Vector2(0.98f, 0.98f);
            buttonRect.offsetMin = Vector2.zero;
            buttonRect.offsetMax = Vector2.zero;

            var image = buttonGo.GetComponent<Image>();
            image.color = new Color(0.22f, 0.35f, 0.55f, 0.98f);

            var labelGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            labelGo.transform.SetParent(buttonGo.transform, false);
            Stretch(labelGo.GetComponent<RectTransform>());
            var label = labelGo.GetComponent<Text>();
            label.font = font;
            label.fontSize = 34;
            label.fontStyle = FontStyle.Bold;
            label.alignment = TextAnchor.MiddleCenter;
            label.color = Color.white;
            label.text = "×";

            WireCloseButton(buttonGo.GetComponent<Button>());
            buttonGo.transform.SetAsLastSibling();
            topCloseBuilt = true;
        }

        private void WireCloseButton(Button button)
        {
            closeButton = button;
            closeButton.onClick.RemoveListener(Hide);
            closeButton.onClick.AddListener(Hide);
        }

        private void HideLegacyActionButtons()
        {
            SetInactive(clearScanHistoryButton);
            SetInactive(openCheatsButton);

            Transform card = cardRect != null ? cardRect.transform : null;
            if (card == null)
            {
                return;
            }

            SetInactiveChild(card, "ClearScanHistoryButton");
            SetInactiveChild(card, "OpenCheatsButton");
            SetInactiveChild(card, "CloseButton");
            SetInactiveChild(card, "ClearScanHint");
            SetInactiveChild(card, "ActionsHeader");

            if (closeButton != null &&
                closeButton.GetComponent<RectTransform>() is RectTransform closeRect &&
                closeRect.anchorMin.y < 0.85f)
            {
                SetInactive(closeButton);
            }
        }

        private static void SetInactive(Button button)
        {
            if (button != null)
            {
                button.gameObject.SetActive(false);
            }
        }

        private static void SetInactiveChild(Transform parent, string childName)
        {
            Transform child = parent.Find(childName);
            if (child != null)
            {
                child.gameObject.SetActive(false);
            }
        }

        private void ClipContentAboveFooter()
        {
            for (int i = 0; i < cardRect.childCount; i++)
            {
                Transform child = cardRect.GetChild(i);
                if (child.name == "ActionFooter")
                {
                    continue;
                }

                if (!child.TryGetComponent(out RectTransform rect))
                {
                    continue;
                }

                if (rect.anchorMax.y > FooterMaxY + 0.01f)
                {
                    continue;
                }

                if (rect.anchorMin.y >= FooterMaxY)
                {
                    child.gameObject.SetActive(false);
                }
            }
        }

        private void CreateFooterButton(Transform parent, string label, string subtitle, UnityEngine.Events.UnityAction action)
        {
            var buttonGo = new GameObject(label + "Button", typeof(RectTransform), typeof(Image), typeof(Button), typeof(LayoutElement));
            buttonGo.transform.SetParent(parent, false);

            var layoutElement = buttonGo.GetComponent<LayoutElement>();
            layoutElement.minHeight = string.IsNullOrEmpty(subtitle) ? 56f : 72f;
            layoutElement.preferredHeight = layoutElement.minHeight;

            var image = buttonGo.GetComponent<Image>();
            image.color = new Color(0.15f, 0.55f, 0.95f, 0.98f);

            var button = buttonGo.GetComponent<Button>();
            button.onClick.AddListener(action);

            Font font = statsText != null ? statsText.font : MobileGameUiKit.BodyFont;

            var labelGo = new GameObject("Label", typeof(RectTransform));
            labelGo.transform.SetParent(buttonGo.transform, false);
            var labelRect = labelGo.GetComponent<RectTransform>();
            labelRect.anchorMin = Vector2.zero;
            labelRect.anchorMax = Vector2.one;
            labelRect.offsetMin = new Vector2(8f, string.IsNullOrEmpty(subtitle) ? 4f : 18f);
            labelRect.offsetMax = new Vector2(-8f, -4f);

            var labelText = labelGo.AddComponent<Text>();
            labelText.font = font;
            labelText.fontSize = string.IsNullOrEmpty(subtitle) ? 26 : 24;
            labelText.fontStyle = FontStyle.Bold;
            labelText.alignment = TextAnchor.MiddleCenter;
            labelText.color = Color.white;
            labelText.text = string.IsNullOrEmpty(subtitle) ? label : label + "\n<size=16>" + subtitle + "</size>";
            labelText.supportRichText = true;
            labelText.raycastTarget = false;
        }

        private void ApplyDescriptiveLabels()
        {
            SetToggleLabel(sfxToggle, "Sound effects");
            SetToggleLabel(particlesToggle, "Celebration particles");

            Transform root = rootPanel != null ? rootPanel.transform : transform;
            SetChildText(root, "AudioHeader", "Audio & Feedback");
            SetChildText(root, "SfxHint", "Play tones for button taps, scans, battles, and results.");
            SetChildText(root, "ParticlesHint", "Show sparkles when monsters are born, bred, or hit in battle.");
            SetChildText(root, "ScannerHeader", "QR Scanner");
            SetChildText(root, "ScanHint", "How often the camera looks for QR codes. Lower = faster, more battery use.");
            SetChildText(root, "ProgressHeader", "Your Progress");
        }

        private static void SetToggleLabel(Toggle toggle, string label)
        {
            if (toggle == null)
            {
                return;
            }

            Text labelText = toggle.GetComponentInChildren<Text>();
            if (labelText != null)
            {
                labelText.text = label;
            }
        }

        private static void SetChildText(Transform root, string childName, string value)
        {
            if (root == null)
            {
                return;
            }

            Transform card = root.Find("Card");
            Transform target = card != null ? card.Find(childName) : root.Find(childName);
            if (target != null && target.TryGetComponent(out Text text))
            {
                text.text = value;
            }
        }

        private void OnScanIntervalChanged(float value)
        {
            GameSettings.ScanIntervalSeconds = value;
            UpdateScanIntervalLabel(value);
            FindObjectOfType<QRScanner>()?.ApplyScanInterval(value);
        }

        private void UpdateScanIntervalLabel(float value)
        {
            if (scanIntervalLabel != null)
            {
                scanIntervalLabel.text = $"Scan interval: {value:0.00}s (camera check rate)";
            }
        }

        private void ClearScanHistory()
        {
            scanHandler ??= FindObjectOfType<MonsterScanHandler>();
            scanHandler?.ClearScanHistory();
            GameFeedbackService.Instance?.PlayUiTap();
            Refresh();
        }

        private void OpenCheats()
        {
            cheatMenuPanel ??= FindObjectOfType<CheatMenuPanel>(true);

            if (cheatMenuPanel == null)
            {
                Debug.LogWarning("[SettingsPanel] CheatMenuPanel not found in scene.");
                return;
            }

            cheatMenuPanel.Show();
            GameFeedbackService.Instance?.PlayUiTap();
        }
    }
}
