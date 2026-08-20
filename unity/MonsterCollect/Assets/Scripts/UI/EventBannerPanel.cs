using System.Collections.Generic;
using System.Text;
using MonsterCollect.Core;
using MonsterCollect.Events;
using TMPro;
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
        private TMP_Text bannerTitleText;
        private TMP_Text bannerTimerText;
        private TMP_Text detailTitleText;
        private TMP_Text detailBodyText;
        private TMP_Text detailQuestText;
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
                panel = KitUi.EnsureOverlay<EventBannerPanel>("EventBannerPanel");
                if (panel == null)
                {
                    return;
                }
            }

            panel.RefreshBanner();
        }

        public static void ShowEventDetail()
        {
            EnsureVisible();
            Instance?.ShowDetail();
        }

        private void RefreshBanner()
        {
            EnsureUi();
            if (HomeHubController.IsHomeVisible)
            {
                bannerRoot?.SetActive(false);
                return;
            }

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
            EnsureUi();
            SeasonalEventDefinition def = EventManager.GetPrimaryBannerEvent();
            if (def == null)
            {
                selectedEventId = string.Empty;
                detailTitleText.text = "Events";
                detailBodyText.text = "No limited event is running right now. Check back later for seasonal rewards and quests.";
                detailQuestText.text = "Use Adventure and Quick-Play to keep progressing while you wait.";
                detailRoot.SetActive(true);
                GameFeedbackService.Instance?.PlayUiTap();
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
            KitUi.Stretch(GetComponent<RectTransform>() ?? gameObject.AddComponent<RectTransform>());
            TmpFonts.PrepareCanvas(GetComponentInParent<Canvas>());

            bannerRoot = new GameObject("Banner", typeof(RectTransform), typeof(Image), typeof(Button));
            bannerRoot.transform.SetParent(transform, false);
            KitUi.Anchor(bannerRoot.GetComponent<RectTransform>(), 0.14f, 0.86f, 0.70f, 0.935f);
            bannerBackground = bannerRoot.GetComponent<Image>();
            UiSkinUtility.ApplyPrimaryButton(bannerBackground);
            bannerOpenButton = bannerRoot.GetComponent<Button>();
            bannerOpenButton.targetGraphic = bannerBackground;
            bannerOpenButton.onClick.AddListener(ShowDetail);

            bannerTitleText = KitUi.Label(bannerRoot.transform, "BannerTitle", "Event", 22, TextAlignmentOptions.Left, title: true);
            KitUi.Anchor(bannerTitleText.rectTransform, 0.04f, 0.1f, 0.62f, 0.9f);

            bannerTimerText = KitUi.Label(bannerRoot.transform, "BannerTimer", string.Empty, 20, TextAlignmentOptions.Right);
            KitUi.Anchor(bannerTimerText.rectTransform, 0.62f, 0.1f, 0.84f, 0.9f);

            bannerDismissButton = KitUi.Button(bannerRoot.transform, "Dismiss", "×", 0.86f, 0.15f, 0.98f, 0.85f, DismissBanner, secondary: true);

            Image dim = KitUi.Dim(transform);
            detailRoot = dim.gameObject;
            detailRoot.name = "Detail";

            Image card = KitUi.Card(detailRoot.transform, 0.18f, 0.12f, 0.82f, 0.88f);
            card.gameObject.name = "DetailCard";

            detailTitleText = KitUi.Label(card.transform, "DetailTitle", "Events", 32, TextAlignmentOptions.Center, title: true);
            KitUi.AnchorTop(detailTitleText.rectTransform, 0.82f, 0.95f);

            detailBodyText = KitUi.Label(card.transform, "DetailBody", string.Empty, 20, TextAlignmentOptions.TopLeft);
            KitUi.Anchor(detailBodyText.rectTransform, 0.06f, 0.58f, 0.94f, 0.8f);
            detailBodyText.enableWordWrapping = true;

            detailQuestText = KitUi.Label(card.transform, "DetailQuests", string.Empty, 18, TextAlignmentOptions.TopLeft);
            KitUi.Anchor(detailQuestText.rectTransform, 0.06f, 0.2f, 0.94f, 0.56f);
            detailQuestText.enableWordWrapping = true;

            claimButton = KitUi.Button(card.transform, "Claim", "CLAIM REWARD", 0.08f, 0.08f, 0.48f, 0.16f, TryClaimSelectedQuest);
            detailCloseButton = KitUi.Button(card.transform, "Close", "CLOSE", 0.52f, 0.08f, 0.92f, 0.16f, HideDetail, secondary: true);

            detailRoot.SetActive(false);
        }
    }
}
