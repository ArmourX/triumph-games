using MonsterCollect.Appearance;
using MonsterCollect.Core;
using MonsterCollect.Monster;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Rename, color shift, and accessory customization without changing base hash.</summary>
    [DisallowMultipleComponent]
    public class MonsterCustomizationPanel : MonoBehaviour
    {
        public static MonsterCustomizationPanel Instance { get; private set; }

        private bool uiBuilt;
        private GameObject rootPanel;
        private RawImage previewImage;
        private TMP_Text titleText;
        private TMP_Text messageText;
        private InputField nameInput;
        private Slider primaryHueSlider;
        private Slider secondaryHueSlider;
        private Button saveNameButton;
        private Button saveColorsButton;
        private Button closeButton;
        private MonsterData boundMonster;

        private void Awake()
        {
            Instance = this;
            EnsureUi();
            HideImmediate();
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        public static void Show(MonsterData monster)
        {
            if (monster == null)
            {
                return;
            }

            MonsterCustomizationPanel panel = Instance ?? FindObjectOfType<MonsterCustomizationPanel>(true);
            if (panel == null)
            {
                panel = KitUi.EnsureOverlay<MonsterCustomizationPanel>("MonsterCustomizationPanel");
                if (panel == null)
                {
                    return;
                }
            }

            panel.Open(monster);
        }

        private void Open(MonsterData monster)
        {
            boundMonster = monster;
            MonsterEvolutionService.EnsureIdentityFields(monster);
            titleText.text = $"Customize {monster.GetDisplayName()}";
            nameInput.text = monster.GetDisplayName();
            primaryHueSlider.value = monster.Customization?.primaryHueShift ?? 0f;
            secondaryHueSlider.value = monster.Customization?.secondaryHueShift ?? 0f;
            messageText.text = $"Rename costs {MonsterCustomizationService.RenameCoinCost} coins. Color shifts are cosmetic only.";
            RefreshPortrait();
            rootPanel.SetActive(true);
            gameObject.SetActive(true);
        }

        private void Hide()
        {
            rootPanel?.SetActive(false);
        }

        private void HideImmediate() => Hide();

        private void SaveName()
        {
            if (boundMonster == null)
            {
                return;
            }

            if (MonsterCustomizationService.TryRename(boundMonster, nameInput.text, out string message))
            {
                messageText.text = message;
                titleText.text = $"Customize {boundMonster.GetDisplayName()}";
                GameFeedbackService.Instance?.PlayUiTap();
                return;
            }

            messageText.text = message;
            GameFeedbackService.Instance?.PlayError();
        }

        private void SaveColors()
        {
            if (boundMonster == null)
            {
                return;
            }

            if (MonsterCustomizationService.TryApplyColorShift(
                    boundMonster,
                    primaryHueSlider.value,
                    secondaryHueSlider.value,
                    0f,
                    0f,
                    out string message))
            {
                messageText.text = message;
                RefreshPortrait();
                GameFeedbackService.Instance?.PlayUiTap();
                return;
            }

            messageText.text = message;
            GameFeedbackService.Instance?.PlayError();
        }

        private void RefreshPortrait()
        {
            MonsterPortraitUiHelper.Bind(previewImage, boundMonster, 220, animated: true);
        }

        private void EnsureUi()
        {
            if (uiBuilt)
            {
                return;
            }

            uiBuilt = true;
            rootPanel = gameObject;
            KitUi.Stretch(GetComponent<RectTransform>() ?? gameObject.AddComponent<RectTransform>());
            TmpFonts.PrepareCanvas(GetComponentInParent<Canvas>());

            KitUi.Dim(transform);
            Image card = KitUi.Card(transform, 0.12f, 0.12f, 0.88f, 0.88f);

            titleText = KitUi.Label(card.transform, "Title", "Customize", 28, TextAlignmentOptions.Center, title: true);
            KitUi.Anchor(titleText.rectTransform, 0.05f, 0.86f, 0.95f, 0.95f);

            var previewGo = new GameObject("Preview", typeof(RectTransform), typeof(RawImage));
            previewGo.transform.SetParent(card.transform, false);
            KitUi.Anchor(previewGo.GetComponent<RectTransform>(), 0.08f, 0.45f, 0.35f, 0.82f);
            previewImage = previewGo.GetComponent<RawImage>();

            nameInput = KitUi.LegacyInput(card.transform, "NameInput", "Monster name", 0.42f, 0.72f, 0.92f, 0.8f);
            saveNameButton = KitUi.Button(card.transform, "SaveName", "SAVE NAME", 0.42f, 0.63f, 0.92f, 0.7f, SaveName);

            TMP_Text primaryLabel = KitUi.Label(card.transform, "PrimaryLabel", "Primary hue shift", 18, TextAlignmentOptions.Left);
            KitUi.Anchor(primaryLabel.rectTransform, 0.42f, 0.54f, 0.92f, 0.6f);
            primaryHueSlider = CreateSlider("PrimaryHue", card.transform, 0.42f, 0.47f, 0.92f, 0.53f, -0.08f, 0.08f);

            TMP_Text secondaryLabel = KitUi.Label(card.transform, "SecondaryLabel", "Secondary hue shift", 18, TextAlignmentOptions.Left);
            KitUi.Anchor(secondaryLabel.rectTransform, 0.42f, 0.38f, 0.92f, 0.44f);
            secondaryHueSlider = CreateSlider("SecondaryHue", card.transform, 0.42f, 0.31f, 0.92f, 0.37f, -0.08f, 0.08f);

            saveColorsButton = KitUi.Button(card.transform, "SaveColors", "APPLY COLORS", 0.42f, 0.22f, 0.92f, 0.29f, SaveColors);

            messageText = KitUi.Label(card.transform, "Message", string.Empty, 16, TextAlignmentOptions.TopLeft);
            KitUi.Anchor(messageText.rectTransform, 0.08f, 0.12f, 0.92f, 0.24f);
            messageText.enableWordWrapping = true;

            closeButton = KitUi.Button(card.transform, "Close", "CLOSE", 0.35f, 0.04f, 0.65f, 0.1f, Hide, secondary: true);
        }

        private static Slider CreateSlider(string name, Transform parent, float minX, float minY, float maxX, float maxY, float min, float max)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Slider));
            go.transform.SetParent(parent, false);
            KitUi.Anchor(go.GetComponent<RectTransform>(), minX, minY, maxX, maxY);
            var slider = go.GetComponent<Slider>();
            slider.minValue = min;
            slider.maxValue = max;
            slider.value = 0f;

            var bg = KitUi.Solid(go.transform, "Background", new Color(0.12f, 0.16f, 0.24f, 1f));
            KitUi.Stretch(bg.rectTransform);
            var fillArea = new GameObject("Fill Area", typeof(RectTransform));
            fillArea.transform.SetParent(go.transform, false);
            KitUi.Stretch(fillArea.GetComponent<RectTransform>());
            var fill = KitUi.Solid(fillArea.transform, "Fill", new Color(0.28f, 0.86f, 1f, 1f));
            KitUi.Stretch(fill.rectTransform);
            slider.fillRect = fill.rectTransform;

            var handle = KitUi.Solid(go.transform, "Handle", Color.white);
            handle.rectTransform.sizeDelta = new Vector2(16f, 16f);
            slider.handleRect = handle.rectTransform;
            slider.targetGraphic = handle;
            return slider;
        }
    }
}
