using MonsterCollect.Core;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>First-time player walkthrough shown on the scan scene.</summary>
    [DisallowMultipleComponent]
    public class TutorialPanel : MonoBehaviour
    {
        public static TutorialPanel Instance { get; private set; }

        private int stepIndex;
        private bool uiBuilt;
        private GameObject rootPanel;
        private Text titleText;
        private Text bodyText;
        private Button nextButton;
        private Button skipButton;

        private static readonly string[] Titles =
        {
            "Welcome to Monster Collect!",
            "Scan QR Codes",
            "Raise on Your Ranch",
            "Battle & Breed",
            "Share with Friends"
        };

        private static readonly string[] Bodies =
        {
            "Collect monsters by scanning QR codes, train them on your ranch, and battle other trainers.",
            "Tap Scan and point your camera at any QR code. Each code creates a unique monster for your ranch.",
            "Feed and train monsters to boost stats. Use Ranch Hub for items, errantry, and facilities.",
            "Battle wild monsters for rewards, breed two monsters for fusion offspring, and climb trainer ranks in Goals.",
            "Share monster QR codes with friends using your friend code (MC-XXXXXX). Publish favorites to the Community gallery, join the weekly featured challenge, and report anything that doesn't belong."
        };

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

        public static void ShowPanel()
        {
            TutorialPanel panel = Instance ?? FindObjectOfType<TutorialPanel>(true);
            if (panel == null)
            {
                Canvas canvas = FindObjectOfType<Canvas>();
                if (canvas == null)
                {
                    return;
                }

                var go = new GameObject("TutorialPanel", typeof(RectTransform), typeof(TutorialPanel));
                Transform parent = LandscapePlayFrame.FindContentRoot(canvas) ?? canvas.transform;
                go.transform.SetParent(parent, false);
                panel = go.GetComponent<TutorialPanel>();
            }

            panel.Show();
        }

        public void Show()
        {
            EnsureUi();
            stepIndex = 0;
            RefreshStep();
            rootPanel?.SetActive(true);
            gameObject.SetActive(true);
        }

        public void Hide()
        {
            rootPanel?.SetActive(false);
        }

        private void HideImmediate() => Hide();

        private void Advance()
        {
            stepIndex++;
            if (stepIndex >= Titles.Length)
            {
                Complete();
                return;
            }

            RefreshStep();
            GameFeedbackService.Instance?.PlayUiTap();
        }

        private void Complete()
        {
            OnboardingService.MarkTutorialComplete();
            Hide();
            GameFeedbackService.Instance?.PlayQuestComplete();
        }

        private void RefreshStep()
        {
            if (titleText != null)
            {
                titleText.text = Titles[stepIndex];
            }

            if (bodyText != null)
            {
                bodyText.text = Bodies[stepIndex];
            }

            if (nextButton != null)
            {
                Text label = nextButton.GetComponentInChildren<Text>();
                if (label != null)
                {
                    label.text = stepIndex >= Titles.Length - 1 ? "Got it!" : "Next";
                }
            }
        }

        private void EnsureUi()
        {
            if (uiBuilt)
            {
                return;
            }

            uiBuilt = true;
            rootPanel = gameObject;
            Font font = MobileGameUiKit.BodyFont;
            var rect = GetComponent<RectTransform>() ?? gameObject.AddComponent<RectTransform>();
            Stretch(rect);

            var dim = CreateImage("Dim", transform, new Color(0f, 0f, 0f, 0.78f));
            Stretch(dim.rectTransform);

            var card = CreateImage("Card", transform, new Color(0.1f, 0.14f, 0.2f, 0.98f));
            var cardRect = card.rectTransform;
            cardRect.anchorMin = new Vector2(0.08f, 0.18f);
            cardRect.anchorMax = new Vector2(0.92f, 0.82f);
            cardRect.offsetMin = Vector2.zero;
            cardRect.offsetMax = Vector2.zero;

            titleText = CreateText("Title", card.transform, font, 32, FontStyle.Bold, TextAnchor.UpperCenter);
            AnchorTop(titleText.rectTransform, 0.78f, 0.95f);

            bodyText = CreateText("Body", card.transform, font, 24, FontStyle.Normal, TextAnchor.UpperLeft);
            bodyText.rectTransform.anchorMin = new Vector2(0.08f, 0.28f);
            bodyText.rectTransform.anchorMax = new Vector2(0.92f, 0.75f);
            bodyText.rectTransform.offsetMin = Vector2.zero;
            bodyText.rectTransform.offsetMax = Vector2.zero;
            bodyText.horizontalOverflow = HorizontalWrapMode.Wrap;
            bodyText.verticalOverflow = VerticalWrapMode.Overflow;

            nextButton = CreateButton("Next", card.transform, font, "Next", 0.52f, 0.08f, 0.92f, 0.18f);
            nextButton.onClick.AddListener(Advance);

            skipButton = CreateButton("Skip", card.transform, font, "Skip", 0.08f, 0.08f, 0.48f, 0.18f);
            skipButton.onClick.AddListener(Complete);
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
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(minX, minY);
            rect.anchorMax = new Vector2(maxX, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            go.GetComponent<Image>().color = new Color(0.2f, 0.45f, 0.72f, 1f);

            var labelGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            labelGo.transform.SetParent(go.transform, false);
            Stretch(labelGo.GetComponent<RectTransform>());
            var labelText = labelGo.GetComponent<Text>();
            labelText.font = font;
            labelText.fontSize = 24;
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

        private static void AnchorTop(RectTransform rect, float minY, float maxY)
        {
            rect.anchorMin = new Vector2(0.05f, minY);
            rect.anchorMax = new Vector2(0.95f, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }
}
