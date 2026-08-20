using MonsterCollect.Core;
using TMPro;
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
        private TMP_Text titleText;
        private TMP_Text bodyText;
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
                panel = KitUi.EnsureOverlay<TutorialPanel>("TutorialPanel");
                if (panel == null)
                {
                    return;
                }
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
                TMP_Text label = nextButton.GetComponentInChildren<TMP_Text>();
                if (label != null)
                {
                    label.text = stepIndex >= Titles.Length - 1 ? "GOT IT!" : "NEXT";
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
            KitUi.Stretch(GetComponent<RectTransform>() ?? gameObject.AddComponent<RectTransform>());
            TmpFonts.PrepareCanvas(GetComponentInParent<Canvas>());

            KitUi.Dim(transform);
            Image card = KitUi.Card(transform, 0.12f, 0.16f, 0.88f, 0.84f);

            titleText = KitUi.Label(card.transform, "Title", Titles[0], 34, TextAlignmentOptions.Center, title: true);
            KitUi.AnchorTop(titleText.rectTransform, 0.78f, 0.95f);

            bodyText = KitUi.Label(card.transform, "Body", Bodies[0], 24, TextAlignmentOptions.TopLeft);
            KitUi.Anchor(bodyText.rectTransform, 0.08f, 0.28f, 0.92f, 0.75f);
            bodyText.enableWordWrapping = true;

            nextButton = KitUi.Button(card.transform, "Next", "NEXT", 0.52f, 0.08f, 0.92f, 0.18f, Advance);
            skipButton = KitUi.Button(card.transform, "Skip", "SKIP", 0.08f, 0.08f, 0.48f, 0.18f, Complete, secondary: true);
        }
    }
}
