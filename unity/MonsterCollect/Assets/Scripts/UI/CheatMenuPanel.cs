using MonsterCollect.Core;
using MonsterCollect.Data;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Debug cheat overlay — unlock dex and fill ranch.</summary>
    [DisallowMultipleComponent]
    public class CheatMenuPanel : MonoBehaviour
    {
        [SerializeField] private GameObject rootPanel;
        [SerializeField] private Text messageText;
        [SerializeField] private Button unlockDexButton;
        [SerializeField] private Button fillRanchButton;
        [SerializeField] private Button unlockAllButton;
        [SerializeField] private Button refillEnergyButton;
        [SerializeField] private Button addEssenceButton;
        [SerializeField] private Button closeButton;

        private bool footerBuilt;

        private void Awake()
        {
            if (unlockDexButton != null)
            {
                unlockDexButton.onClick.AddListener(OnUnlockDex);
            }

            if (fillRanchButton != null)
            {
                fillRanchButton.onClick.AddListener(OnFillRanch);
            }

            if (unlockAllButton != null)
            {
                unlockAllButton.onClick.AddListener(OnUnlockAll);
            }

            if (refillEnergyButton != null)
            {
                refillEnergyButton.onClick.AddListener(OnRefillEnergy);
            }

            if (addEssenceButton != null)
            {
                addEssenceButton.onClick.AddListener(OnAddEssence);
            }

            if (closeButton != null)
            {
                closeButton.onClick.AddListener(Hide);
            }

            EnsureActionFooter();
            HideImmediate();
        }

        public void Show()
        {
            KitUi.RestyleExisting(transform);
            EnsureActionFooter();
            SetMessage(string.Empty);

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

        private void EnsureActionFooter()
        {
            if (footerBuilt)
            {
                return;
            }

            Transform card = transform.Find("Card");
            if (card == null && rootPanel != null)
            {
                card = rootPanel.transform.Find("Card");
            }

            if (card == null)
            {
                return;
            }

            HideLegacyButtons();

            var footerGo = new GameObject("CheatActionFooter", typeof(RectTransform), typeof(VerticalLayoutGroup));
            footerGo.transform.SetParent(card, false);
            var footerRect = footerGo.GetComponent<RectTransform>();
            footerRect.anchorMin = new Vector2(0.06f, 0.04f);
            footerRect.anchorMax = new Vector2(0.94f, 0.72f);
            footerRect.offsetMin = Vector2.zero;
            footerRect.offsetMax = Vector2.zero;

            var layout = footerGo.GetComponent<VerticalLayoutGroup>();
            layout.spacing = 10f;
            layout.padding = new RectOffset(0, 0, 6, 6);
            layout.childAlignment = TextAnchor.UpperCenter;
            layout.childControlHeight = true;
            layout.childControlWidth = true;
            layout.childForceExpandHeight = false;
            layout.childForceExpandWidth = true;

            Font font = messageText != null ? messageText.font : MobileGameUiKit.BodyFont;

            CreateButton(footerGo.transform, font, "Unlock All Dex", OnUnlockDex);
            CreateButton(footerGo.transform, font, "Fill Ranch (300)", OnFillRanch);
            CreateButton(footerGo.transform, font, "Unlock All + Fill Ranch", OnUnlockAll);
            CreateButton(footerGo.transform, font, "Refill Energy", OnRefillEnergy);
            CreateButton(footerGo.transform, font, "+999 Essence", OnAddEssence);
            CreateButton(footerGo.transform, font, "Close Cheats", Hide);

            footerGo.transform.SetAsLastSibling();

            if (messageText != null)
            {
                RectTransform messageRect = messageText.rectTransform;
                messageRect.anchorMin = new Vector2(0.08f, 0.74f);
                messageRect.anchorMax = new Vector2(0.92f, 0.84f);
                messageRect.offsetMin = Vector2.zero;
                messageRect.offsetMax = Vector2.zero;
            }

            footerBuilt = true;
        }

        private void HideLegacyButtons()
        {
            SetInactive(unlockDexButton);
            SetInactive(fillRanchButton);
            SetInactive(unlockAllButton);
            SetInactive(refillEnergyButton);
            SetInactive(addEssenceButton);
            SetInactive(closeButton);

            Transform card = transform.Find("Card");
            if (card == null)
            {
                return;
            }

            for (int i = 0; i < card.childCount; i++)
            {
                Transform child = card.GetChild(i);
                if (child.name.EndsWith("Button") || child.name.EndsWith("Hint"))
                {
                    child.gameObject.SetActive(false);
                }
            }
        }

        private static void SetInactive(Button button)
        {
            if (button != null)
            {
                button.gameObject.SetActive(false);
            }
        }

        private static void CreateButton(Transform parent, Font font, string label, UnityEngine.Events.UnityAction action)
        {
            var buttonGo = new GameObject(label + "Button", typeof(RectTransform), typeof(Image), typeof(Button), typeof(LayoutElement));
            buttonGo.transform.SetParent(parent, false);

            var layoutElement = buttonGo.GetComponent<LayoutElement>();
            layoutElement.minHeight = 58f;
            layoutElement.preferredHeight = 58f;

            var image = buttonGo.GetComponent<Image>();
            image.color = new Color(0.55f, 0.2f, 0.75f, 0.98f);

            var button = buttonGo.GetComponent<Button>();
            button.onClick.AddListener(action);

            var labelGo = new GameObject("Label", typeof(RectTransform));
            labelGo.transform.SetParent(buttonGo.transform, false);
            var labelRect = labelGo.GetComponent<RectTransform>();
            labelRect.anchorMin = Vector2.zero;
            labelRect.anchorMax = Vector2.one;
            labelRect.offsetMin = Vector2.zero;
            labelRect.offsetMax = Vector2.zero;

            var labelText = labelGo.AddComponent<Text>();
            labelText.font = font;
            labelText.fontSize = 24;
            labelText.fontStyle = FontStyle.Bold;
            labelText.alignment = TextAnchor.MiddleCenter;
            labelText.color = Color.white;
            labelText.text = label;
            labelText.raycastTarget = false;
        }

        private void OnUnlockDex()
        {
            MonsterCollectionCheatService.UnlockAllDexEntries();
            SetMessage($"Dex fully unlocked ({MonsterCollectionService.UnlockedDexCount}/{MonsterCollectionService.TotalDexEntries}).");
            GameFeedbackService.Instance?.PlayUiTap();
        }

        private void OnFillRanch()
        {
            int count = MonsterCollectionCheatService.FillRanchWithAllDexMonsters();
            SetMessage($"Added {count} monsters to ranch (all dex slots).");
            GameFeedbackService.Instance?.PlayBreeding(transform, Color.cyan);
        }

        private void OnUnlockAll()
        {
            MonsterCollectionCheatService.UnlockEverything();
            SetMessage("Unlocked full dex and filled ranch with all 300 monsters.");
            GameFeedbackService.Instance?.PlayBreeding(transform, Color.magenta);
        }

        private void OnRefillEnergy()
        {
            MonsterCollectionCheatService.RefillDailyEnergy();
            SetMessage("Daily energy refilled.");
            GameFeedbackService.Instance?.PlayUiTap();
        }

        private void OnAddEssence()
        {
            MonsterCollectionCheatService.AddEssence(999);
            SetMessage("Added 999 essence.");
            GameFeedbackService.Instance?.PlayUiTap();
        }

        private void SetMessage(string message)
        {
            if (messageText != null)
            {
                messageText.text = message;
            }
        }
    }
}
