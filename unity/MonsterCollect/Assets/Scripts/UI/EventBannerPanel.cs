using System.Collections.Generic;
using System.Text;
using MonsterCollect.Core;
using MonsterCollect.Events;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Top-of-screen seasonal event banner with countdown and quest panel.</summary>
    [DisallowMultipleComponent]
    public class EventBannerPanel : MonoBehaviour
    {
        public static EventBannerPanel Instance { get; private set; }

        private bool uiBuilt;
        private GameObject bannerRoot;
        private GameObject detailRoot;
        private Image bannerBackground;
        private Text bannerTitleText;
        private Text bannerTimerText;
        private Text detailTitleText;
        private Text detailBodyText;
        private Text detailQuestText;
        private Button bannerOpenButton;
        private Button bannerDismissButton;
        private Button detailCloseButton;
        private Button claimButton;
        private string selectedEventId;
        private string selectedQuestId;
        private float refreshTimer;

        private void Awake()
        {
            Instance = this;
            EnsureUi();
            HideAll();
            EventManager.ActiveEventsChanged += RefreshBanner;
        }

        private void OnDestroy()
        {
            EventManager.ActiveEventsChanged -= RefreshBanner;
            if (Instance == this)
            {
                Instance = null;
            }
        }

        private void Update()
        {
            refreshTimer += Time.unscaledDeltaTime;
            if (refreshTimer >= 1f)
            {
                refreshTimer = 0f;
                RefreshBanner();
            }
        }

        public static void EnsureVisible()
        {
            EventManager.Initialize();
            EventBannerPanel panel = Instance ?? FindObjectOfType<EventBannerPanel>(true);
            if (panel == null)
            {
                Canvas canvas = FindObjectOfType<Canvas>();
                if (canvas == null)
                {
                    return;
                }

                Transform parent = LandscapePlayFrame.FindContentRoot(canvas) ?? canvas.transform;
                var go = new GameObject("EventBannerPanel", typeof(RectTransform), typeof(EventBannerPanel));
                go.transform.SetParent(parent, false);
                panel = go.GetComponent<EventBannerPanel>();
            }

            panel.RefreshBanner();
        }

        private void RefreshBanner()
        {
            EnsureUi();
            SeasonalEventDefinition primary = EventManager.GetPrimaryBannerEvent();
            if (primary == null || EventManager.IsBannerDismissed(primary.EventId))
            {
                bannerRoot?.SetActive(false);
                return;
            }

            bannerRoot.SetActive(true);
            bannerBackground.color = primary.BannerColor;
            bannerTitleText.text = $"🎉 {primary.DisplayName}";
            bannerTimerText.text = EventManager.FormatCountdown(EventManager.GetRemainingSeconds(primary.EventId));
            selectedEventId = primary.EventId;
        }

        private void ShowDetail()
        {
            SeasonalEventDefinition def = EventManager.GetPrimaryBannerEvent();
            if (def == null)
            {
                return;
            }

            selectedEventId = def.EventId;
            detailTitleText.text = def.DisplayName;
            detailBodyText.text = def.Description;
            detailQuestText.text = BuildQuestSummary(def.EventId);
            detailRoot.SetActive(true);
            GameFeedbackService.Instance?.PlayUiTap();
        }

        private void HideDetail()
        {
            detailRoot?.SetActive(false);
            selectedQuestId = null;
        }

        private void HideAll()
        {
            bannerRoot?.SetActive(false);
            detailRoot?.SetActive(false);
        }

        private void DismissBanner()
        {
            if (!string.IsNullOrEmpty(selectedEventId))
            {
                EventManager.DismissBanner(selectedEventId);
            }

            bannerRoot?.SetActive(false);
            HideDetail();
        }

        private void TryClaimSelectedQuest()
        {
            if (string.IsNullOrEmpty(selectedEventId) || string.IsNullOrEmpty(selectedQuestId))
            {
                PickFirstClaimableQuest();
            }

            if (string.IsNullOrEmpty(selectedQuestId))
            {
                return;
            }

            if (EventManager.TryClaimEventQuest(selectedEventId, selectedQuestId, out string message))
            {
                GameFeedbackService.Instance?.PlayQuestComplete();
                detailQuestText.text = BuildQuestSummary(selectedEventId) + "\n\n" + message;
                selectedQuestId = null;
            }
            else
            {
                detailQuestText.text = BuildQuestSummary(selectedEventId) + "\n\n" + message;
            }
        }

        private void PickFirstClaimableQuest()
        {
            IReadOnlyList<EventQuestEntry> quests = EventManager.GetQuestsForEvent(selectedEventId);
            for (int i = 0; i < quests.Count; i++)
            {
                EventQuestProgressEntry progress = EventManager.GetQuestProgress(selectedEventId, quests[i].questId);
                if (progress != null && progress.completed && !progress.rewardClaimed)
                {
                    selectedQuestId = quests[i].questId;
                    return;
                }
            }
        }

        private static string BuildQuestSummary(string eventId)
        {
            IReadOnlyList<EventQuestEntry> quests = EventManager.GetQuestsForEvent(eventId);
            if (quests == null || quests.Count == 0)
            {
                return "No special quests for this event.";
            }

            var builder = new StringBuilder();
            builder.AppendLine("Event quests:");
            for (int i = 0; i < quests.Count; i++)
            {
                EventQuestEntry quest = quests[i];
                EventQuestProgressEntry progress = EventManager.GetQuestProgress(eventId, quest.questId);
                int current = progress?.current ?? 0;
                bool done = progress?.completed ?? false;
                bool claimed = progress?.rewardClaimed ?? false;
                string status = claimed ? "✓ Claimed" : done ? "★ Ready" : $"{current}/{quest.targetCount}";
                builder.Append("• ").Append(quest.displayName).Append(" — ").Append(status);
                if (!string.IsNullOrWhiteSpace(quest.description))
                {
                    builder.Append("\n  ").Append(quest.description);
                }

                builder.Append('\n');
            }

            builder.Append("\nTap Claim Reward when a quest shows ★ Ready.");
            return builder.ToString();
        }

        private void EnsureUi()
        {
            if (uiBuilt)
            {
                return;
            }

            uiBuilt = true;
            Font font = MobileGameUiKit.BodyFont;
            var rootRect = GetComponent<RectTransform>() ?? gameObject.AddComponent<RectTransform>();
            Stretch(rootRect);

            bannerRoot = new GameObject("Banner", typeof(RectTransform), typeof(Image), typeof(Button));
            bannerRoot.transform.SetParent(transform, false);
            var bannerRect = bannerRoot.GetComponent<RectTransform>();
            bannerRect.anchorMin = new Vector2(0.14f, 0.86f);
            bannerRect.anchorMax = new Vector2(0.70f, 0.935f);
            bannerRect.offsetMin = Vector2.zero;
            bannerRect.offsetMax = Vector2.zero;
            bannerBackground = bannerRoot.GetComponent<Image>();
            UiSkinUtility.ApplyPrimaryButton(bannerBackground);
            bannerBackground.color = new Color(0.85f, 1f, 0.9f, 1f);
            bannerOpenButton = bannerRoot.GetComponent<Button>();
            bannerOpenButton.onClick.AddListener(ShowDetail);

            bannerTitleText = CreateText("BannerTitle", bannerRoot.transform, font, 22, FontStyle.Bold, TextAnchor.MiddleLeft);
            bannerTitleText.rectTransform.anchorMin = new Vector2(0.02f, 0.1f);
            bannerTitleText.rectTransform.anchorMax = new Vector2(0.62f, 0.9f);

            bannerTimerText = CreateText("BannerTimer", bannerRoot.transform, font, 20, FontStyle.Normal, TextAnchor.MiddleRight);
            bannerTimerText.rectTransform.anchorMin = new Vector2(0.62f, 0.1f);
            bannerTimerText.rectTransform.anchorMax = new Vector2(0.84f, 0.9f);

            bannerDismissButton = CreateButton("Dismiss", bannerRoot.transform, font, "×", 0.86f, 0.15f, 0.98f, 0.85f);
            bannerDismissButton.onClick.AddListener(DismissBanner);

            detailRoot = CreateImage("Detail", transform, new Color(0f, 0f, 0f, 0.75f)).gameObject;
            UiSkinUtility.ApplyDimOverlay(detailRoot.GetComponent<Image>());
            Stretch(detailRoot.GetComponent<RectTransform>());

            var card = CreateImage("DetailCard", detailRoot.transform, new Color(0.1f, 0.14f, 0.2f, 0.98f));
            UiSkinUtility.ApplyModalPanel(card);
            var cardRect = card.rectTransform;
            cardRect.anchorMin = new Vector2(0.18f, 0.12f);
            cardRect.anchorMax = new Vector2(0.82f, 0.88f);
            cardRect.offsetMin = Vector2.zero;
            cardRect.offsetMax = Vector2.zero;

            detailTitleText = CreateText("DetailTitle", card.transform, font, 30, FontStyle.Bold, TextAnchor.UpperCenter);
            AnchorTop(detailTitleText.rectTransform, 0.82f, 0.95f);

            detailBodyText = CreateText("DetailBody", card.transform, font, 20, FontStyle.Normal, TextAnchor.UpperLeft);
            detailBodyText.rectTransform.anchorMin = new Vector2(0.06f, 0.58f);
            detailBodyText.rectTransform.anchorMax = new Vector2(0.94f, 0.8f);
            detailBodyText.horizontalOverflow = HorizontalWrapMode.Wrap;

            detailQuestText = CreateText("DetailQuests", card.transform, font, 18, FontStyle.Normal, TextAnchor.UpperLeft);
            detailQuestText.rectTransform.anchorMin = new Vector2(0.06f, 0.2f);
            detailQuestText.rectTransform.anchorMax = new Vector2(0.94f, 0.56f);
            detailQuestText.horizontalOverflow = HorizontalWrapMode.Wrap;
            detailQuestText.verticalOverflow = VerticalWrapMode.Overflow;

            claimButton = CreateButton("Claim", card.transform, font, "Claim Reward", 0.08f, 0.08f, 0.48f, 0.16f);
            claimButton.onClick.AddListener(TryClaimSelectedQuest);

            detailCloseButton = CreateButton("Close", card.transform, font, "Close", 0.52f, 0.08f, 0.92f, 0.16f);
            detailCloseButton.onClick.AddListener(HideDetail);

            detailRoot.SetActive(false);
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
            labelText.fontSize = 20;
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
