using MonsterCollect.Appearance;
using MonsterCollect.Core;
using MonsterCollect.Monster;
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
        private Text titleText;
        private Text messageText;
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
                Canvas canvas = FindObjectOfType<Canvas>();
                if (canvas == null)
                {
                    return;
                }

                var go = new GameObject("MonsterCustomizationPanel", typeof(RectTransform), typeof(MonsterCustomizationPanel));
                go.transform.SetParent(canvas.transform, false);
                panel = go.GetComponent<MonsterCustomizationPanel>();
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
            Font font = MobileGameUiKit.BodyFont;
            rootPanel = gameObject;
            Stretch(GetComponent<RectTransform>());

            var dim = CreateImage("Dim", transform, new Color(0f, 0f, 0f, 0.82f));
            Stretch(dim.rectTransform);

            var card = CreateImage("Card", transform, new Color(0.1f, 0.13f, 0.18f, 0.98f));
            var cardRect = card.rectTransform;
            cardRect.anchorMin = new Vector2(0.12f, 0.15f);
            cardRect.anchorMax = new Vector2(0.88f, 0.85f);
            cardRect.offsetMin = Vector2.zero;
            cardRect.offsetMax = Vector2.zero;

            titleText = CreateText("Title", card.transform, font, 26, FontStyle.Bold, TextAnchor.UpperCenter);
            Anchor(titleText.rectTransform, 0.05f, 0.86f, 0.95f, 0.95f);

            var previewGo = new GameObject("Preview", typeof(RectTransform), typeof(RawImage));
            previewGo.transform.SetParent(card.transform, false);
            Anchor(previewGo.GetComponent<RectTransform>(), 0.08f, 0.45f, 0.35f, 0.82f);
            previewImage = previewGo.GetComponent<RawImage>();

            nameInput = CreateInput("NameInput", card.transform, font, 0.42f, 0.72f, 0.92f, 0.8f);
            saveNameButton = CreateButton("SaveName", card.transform, font, "Save Name", 0.42f, 0.63f, 0.92f, 0.7f);
            saveNameButton.onClick.AddListener(SaveName);

            var primaryLabel = CreateText("PrimaryLabel", card.transform, font, 18, FontStyle.Normal, TextAnchor.MiddleLeft);
            primaryLabel.text = "Primary hue shift";
            Anchor(primaryLabel.rectTransform, 0.42f, 0.54f, 0.92f, 0.6f);
            primaryHueSlider = CreateSlider("PrimaryHue", card.transform, 0.42f, 0.47f, 0.92f, 0.53f, -0.08f, 0.08f);

            var secondaryLabel = CreateText("SecondaryLabel", card.transform, font, 18, FontStyle.Normal, TextAnchor.MiddleLeft);
            secondaryLabel.text = "Secondary hue shift";
            Anchor(secondaryLabel.rectTransform, 0.42f, 0.38f, 0.92f, 0.44f);
            secondaryHueSlider = CreateSlider("SecondaryHue", card.transform, 0.42f, 0.31f, 0.92f, 0.37f, -0.08f, 0.08f);

            saveColorsButton = CreateButton("SaveColors", card.transform, font, "Apply Colors", 0.42f, 0.22f, 0.92f, 0.29f);
            saveColorsButton.onClick.AddListener(SaveColors);

            messageText = CreateText("Message", card.transform, font, 16, FontStyle.Italic, TextAnchor.UpperLeft);
            Anchor(messageText.rectTransform, 0.08f, 0.12f, 0.92f, 0.24f);
            messageText.horizontalOverflow = HorizontalWrapMode.Wrap;

            closeButton = CreateButton("Close", card.transform, font, "Close", 0.35f, 0.04f, 0.65f, 0.1f);
            closeButton.onClick.AddListener(Hide);
        }

        private static InputField CreateInput(string name, Transform parent, Font font, float minX, float minY, float maxX, float maxY)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(InputField));
            go.transform.SetParent(parent, false);
            Anchor(go.GetComponent<RectTransform>(), minX, minY, maxX, maxY);
            go.GetComponent<Image>().color = new Color(0.15f, 0.18f, 0.24f, 1f);

            var textGo = new GameObject("Text", typeof(RectTransform), typeof(Text));
            textGo.transform.SetParent(go.transform, false);
            Stretch(textGo.GetComponent<RectTransform>());
            var text = textGo.GetComponent<Text>();
            text.font = font;
            text.fontSize = 20;
            text.color = Color.white;
            text.supportRichText = false;

            var input = go.GetComponent<InputField>();
            input.textComponent = text;
            return input;
        }

        private static Slider CreateSlider(string name, Transform parent, float minX, float minY, float maxX, float maxY, float min, float max)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Slider));
            go.transform.SetParent(parent, false);
            Anchor(go.GetComponent<RectTransform>(), minX, minY, maxX, maxY);
            var slider = go.GetComponent<Slider>();
            slider.minValue = min;
            slider.maxValue = max;
            slider.value = 0f;

            var bg = CreateImage("Background", go.transform, new Color(0.2f, 0.2f, 0.25f, 1f));
            Stretch(bg.rectTransform);
            var fillArea = new GameObject("Fill Area", typeof(RectTransform));
            fillArea.transform.SetParent(go.transform, false);
            Stretch(fillArea.GetComponent<RectTransform>());
            var fill = CreateImage("Fill", fillArea.transform, new Color(0.3f, 0.55f, 0.85f, 1f));
            Stretch(fill.rectTransform);
            slider.fillRect = fill.rectTransform;

            var handle = CreateImage("Handle", go.transform, Color.white);
            handle.rectTransform.sizeDelta = new Vector2(16f, 16f);
            slider.handleRect = handle.rectTransform;
            slider.targetGraphic = handle;
            return slider;
        }

        private static Image CreateImage(string name, Transform parent, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<Image>();
            image.color = color;
            return image;
        }

        private static Text CreateText(string name, Transform parent, Font font, int size, FontStyle style, TextAnchor anchor)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent, false);
            var text = go.GetComponent<Text>();
            text.font = font;
            text.fontSize = size;
            text.fontStyle = style;
            text.alignment = anchor;
            text.color = Color.white;
            return text;
        }

        private static Button CreateButton(string name, Transform parent, Font font, string label, float minX, float minY, float maxX, float maxY)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            Anchor(go.GetComponent<RectTransform>(), minX, minY, maxX, maxY);
            go.GetComponent<Image>().color = new Color(0.2f, 0.45f, 0.72f, 1f);

            var labelGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            labelGo.transform.SetParent(go.transform, false);
            Stretch(labelGo.GetComponent<RectTransform>());
            var labelText = labelGo.GetComponent<Text>();
            labelText.font = font;
            labelText.fontSize = 18;
            labelText.alignment = TextAnchor.MiddleCenter;
            labelText.color = Color.white;
            labelText.text = label;
            return go.GetComponent<Button>();
        }

        private static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private static void Anchor(RectTransform rect, float minX, float minY, float maxX, float maxY)
        {
            rect.anchorMin = new Vector2(minX, minY);
            rect.anchorMax = new Vector2(maxX, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }
}
