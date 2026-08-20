using System;
using System.Collections.Generic;
using System.Text;
using MonsterCollect.Data;
using MonsterCollect.Progression;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Trainer rank, quests, shop, and Monster Book rewards.</summary>
    [DisallowMultipleComponent]
    public class ProgressionHubPanel : MonoBehaviour
    {
        public static ProgressionHubPanel Instance { get; private set; }

        private enum Tab { Rank, Quests, Shop, Book }

        private Tab currentTab = Tab.Quests;
        private bool uiBuilt;
        private GameObject rootPanel;
        private TMP_Text titleText;
        private TMP_Text bodyText;
        private TMP_Text footerText;
        private Button closeButton;
        private readonly List<Button> actionButtons = new List<Button>();

        private void Awake()
        {
            Instance = this;
            EnsureUi();
            if (closeButton != null)
            {
                closeButton.onClick.AddListener(Hide);
            }

            HideImmediate();
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        public static void ShowPanel() => ShowTab(Tab.Quests);

        public static void ShowQuests() => ShowTab(Tab.Quests);

        public static void ShowShop() => ShowTab(Tab.Shop);

        public static void ShowRank() => ShowTab(Tab.Rank);

        public static void ShowBook() => ShowTab(Tab.Book);

        private static void ShowTab(Tab tab)
        {
            ProgressionHubPanel panel = Instance ?? FindObjectOfType<ProgressionHubPanel>(true);
            if (panel == null)
            {
                Canvas canvas = KitUi.ResolveGameCanvas();
                if (canvas == null)
                {
                    return;
                }

                var go = new GameObject("ProgressionHubPanel", typeof(RectTransform), typeof(ProgressionHubPanel));
                go.transform.SetParent(KitUi.OverlayParent(canvas), false);
                panel = go.GetComponent<ProgressionHubPanel>();
            }

            panel.currentTab = tab;
            panel.Show();
        }

        public void Show()
        {
            EnsureUi();
            MonsterCollectionService.EnsureProgressionReady();
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

        private void HideImmediate() => Hide();

        private void EnsureUi()
        {
            if (uiBuilt)
            {
                return;
            }

            uiBuilt = true;
            rootPanel = gameObject;
            var rect = GetComponent<RectTransform>() ?? gameObject.AddComponent<RectTransform>();
            KitUi.Stretch(rect);
            TmpFonts.PrepareCanvas(GetComponentInParent<Canvas>());

            KitUi.Dim(transform);
            Image card = KitUi.Card(transform);

            titleText = KitUi.Label(card.transform, "Title", "Goals", 34, TextAlignmentOptions.Center, title: true);
            KitUi.AnchorTop(titleText.rectTransform, 0.88f, 0.98f);

            bodyText = KitUi.Label(card.transform, "Body", string.Empty, 22, TextAlignmentOptions.TopLeft);
            bodyText.rectTransform.anchorMin = new Vector2(0.05f, 0.28f);
            bodyText.rectTransform.anchorMax = new Vector2(0.95f, 0.86f);
            bodyText.rectTransform.offsetMin = Vector2.zero;
            bodyText.rectTransform.offsetMax = Vector2.zero;
            bodyText.enableWordWrapping = true;

            footerText = KitUi.Label(card.transform, "Footer", string.Empty, 20, TextAlignmentOptions.BottomLeft);
            KitUi.Anchor(footerText.rectTransform, 0.04f, 0.02f, 0.78f, 0.12f);
            UiSkinUtility.StyleTmpBody(footerText);

            var tabRow = new GameObject("Tabs", typeof(RectTransform)).GetComponent<RectTransform>();
            tabRow.SetParent(card.transform, false);
            KitUi.Anchor(tabRow, 0.04f, 0.14f, 0.96f, 0.24f);

            CreateTab(tabRow, "Rank", Tab.Rank, 0f, 0.24f);
            CreateTab(tabRow, "Quests", Tab.Quests, 0.25f, 0.49f);
            CreateTab(tabRow, "Shop", Tab.Shop, 0.5f, 0.74f);
            CreateTab(tabRow, "Book", Tab.Book, 0.75f, 1f);

            var actionRowGo = new GameObject("Actions", typeof(RectTransform));
            actionRowGo.transform.SetParent(card.transform, false);
            KitUi.Anchor(actionRowGo.GetComponent<RectTransform>(), 0.04f, 0.24f, 0.96f, 0.28f);

            closeButton = KitUi.Button(card.transform, "Close", "CLOSE", 0.82f, 0.02f, 0.98f, 0.12f, Hide, secondary: true);
        }

        private void CreateTab(RectTransform parent, string label, Tab tab, float minX, float maxX)
        {
            KitUi.Button(parent, label, label.ToUpperInvariant(), minX, 0f, maxX, 1f, () =>
            {
                currentTab = tab;
                Refresh();
            }, secondary: true);
        }

        public void Refresh()
        {
            ClearActions();
            footerText.text = $"Coins: {TrainerProgressionService.RanchCoins}  ·  Essence: {MonsterCollectionService.RanchEssence}";

            switch (currentTab)
            {
                case Tab.Rank: RefreshRank(); break;
                case Tab.Quests: RefreshQuests(); break;
                case Tab.Shop: RefreshShop(); break;
                case Tab.Book: RefreshBook(); break;
            }
        }

        private void RefreshRank()
        {
            titleText.text = "Trainer Rank";
            TrainerRankDefinition rank = TrainerProgressionService.CurrentRank;
            TrainerRankDefinition next = TrainerProgressionService.NextRank;
            var sb = new StringBuilder();
            sb.AppendLine(rank != null ? rank.DisplayName : "Trainer");
            sb.AppendLine($"XP: {TrainerProgressionService.TrainerXp}");
            sb.AppendLine($"Ranch slots: {MonsterCollectionService.MaxRanchSlots}");
            sb.AppendLine($"Progress: {(TrainerProgressionService.GetRankProgress01() * 100f):0}%");
            if (next != null)
            {
                sb.AppendLine($"Next: {next.DisplayName} at {next.RequiredXp} XP");
            }

            sb.AppendLine();
            sb.AppendLine("Unlocked training:");
            string[] types = TrainerProgressionService.State.unlockedTrainingTypes ?? Array.Empty<string>();
            for (int i = 0; i < types.Length; i++)
            {
                sb.AppendLine($"• {types[i]}");
            }

            bodyText.text = sb.ToString();
        }

        private void RefreshQuests()
        {
            titleText.text = "Quests & Challenges";
            var sb = new StringBuilder();
            AppendQuestSection(sb, "Daily", QuestService.GetActiveQuestIds(QuestCategory.Daily));
            sb.AppendLine();
            AppendQuestSection(sb, "Weekly", QuestService.GetActiveQuestIds(QuestCategory.Weekly));
            sb.AppendLine();
            AppendQuestSection(sb, "Main Story", QuestService.GetActiveQuestIds(QuestCategory.Main));
            bodyText.text = sb.ToString();

            Transform actions = transform.Find("Card/Actions");
            if (actions == null)
            {
                return;
            }

            AddClaimButtons(actions, QuestService.GetActiveQuestIds(QuestCategory.Daily));
            AddClaimButtons(actions, QuestService.GetActiveQuestIds(QuestCategory.Weekly));
            AddClaimButtons(actions, QuestService.GetActiveQuestIds(QuestCategory.Main));
        }

        private void AppendQuestSection(StringBuilder sb, string header, IReadOnlyList<string> ids)
        {
            sb.AppendLine($"== {header} ==");
            if (ids == null || ids.Count == 0)
            {
                sb.AppendLine("(none active)");
                return;
            }

            for (int i = 0; i < ids.Count; i++)
            {
                QuestDefinition def = ProgressionCatalogRegistry.Quests.FindById(ids[i]);
                if (def == null)
                {
                    continue;
                }

                QuestProgressEntry p = QuestService.GetProgress(def.QuestId);
                string status = p.rewardClaimed ? "Claimed" : p.completed ? "Complete!" : "In progress";
                sb.AppendLine($"{def.DisplayName} — {p.current}/{def.TargetCount} ({status})");
                sb.AppendLine($"  {def.Description}");
                sb.AppendLine($"  Reward: +{def.TrainerXpReward} XP, +{def.CoinReward} coins");
            }
        }

        private void AddClaimButtons(Transform actions, IReadOnlyList<string> ids)
        {
            int shown = 0;
            for (int i = 0; i < ids.Count && shown < 3; i++)
            {
                QuestProgressEntry p = QuestService.GetProgress(ids[i]);
                if (!p.completed || p.rewardClaimed)
                {
                    continue;
                }

                string questId = ids[i];
                float min = shown * 0.33f;
                AddAction(actions, "Claim", () => ClaimQuest(questId), min, min + 0.31f);
                shown++;
            }
        }

        private void ClaimQuest(string questId)
        {
            QuestClaimResult result = QuestService.TryClaimReward(questId);
            footerText.text = result.Message;
            Refresh();
        }

        private void RefreshShop()
        {
            titleText.text = "Ranch Shop";
            var sb = new StringBuilder();
            ShopOfferDefinition[] offers = ProgressionCatalogRegistry.Shop.Offers;
            if (offers != null)
            {
                for (int i = 0; i < offers.Length; i++)
                {
                    ShopOfferDefinition offer = offers[i];
                    if (offer == null)
                    {
                        continue;
                    }

                    sb.AppendLine($"{offer.DisplayName} — {offer.CoinPrice} coins (Rank {offer.RequiredTrainerRank}+)");
                }
            }

            bodyText.text = sb.ToString();

            Transform actions = transform.Find("Card/Actions");
            if (actions == null || offers == null)
            {
                return;
            }

            for (int i = 0; i < offers.Length && i < 3; i++)
            {
                ShopOfferDefinition offer = offers[i];
                if (offer == null)
                {
                    continue;
                }

                string id = offer.OfferId;
                float min = i * 0.33f;
                AddAction(actions, offer.DisplayName.Split(' ')[0], () => Buy(id), min, min + 0.31f);
            }
        }

        private void Buy(string offerId)
        {
            ShopPurchaseResult result = ShopService.TryPurchase(offerId);
            footerText.text = result.Message;
            Refresh();
        }

        private void RefreshBook()
        {
            titleText.text = "Monster Book";
            var sb = new StringBuilder();
            sb.AppendLine($"Species: {MonsterBookService.DiscoveredDexCount}/{MonsterBookService.TotalDexEntries}");
            sb.AppendLine($"Variants logged: {MonsterBookService.VariantCount}");
            sb.AppendLine($"Completion: {(MonsterBookService.GetCompletionRatio() * 100f):0.0}%");
            sb.AppendLine();

            MonsterBookRewardDefinition[] rewards = ProgressionCatalogRegistry.BookRewards.Rewards;
            if (rewards != null)
            {
                for (int i = 0; i < rewards.Length; i++)
                {
                    MonsterBookRewardDefinition reward = rewards[i];
                    if (reward == null)
                    {
                        continue;
                    }

                    string state = MonsterBookService.IsRewardClaimed(reward.RewardId)
                        ? "Claimed"
                        : MonsterBookService.IsRewardAvailable(reward)
                            ? "Ready!"
                            : "Locked";
                    sb.AppendLine($"{reward.DisplayName} — {state}");
                    sb.AppendLine($"  Need {(reward.RequiredCompletionRatio * 100f):0}% book ({reward.RequiredDiscoveredCount} entries)");
                }
            }

            bodyText.text = sb.ToString();

            Transform actions = transform.Find("Card/Actions");
            if (actions == null || rewards == null)
            {
                return;
            }

            int shown = 0;
            for (int i = 0; i < rewards.Length && shown < 3; i++)
            {
                MonsterBookRewardDefinition reward = rewards[i];
                if (reward == null || MonsterBookService.IsRewardClaimed(reward.RewardId) ||
                    !MonsterBookService.IsRewardAvailable(reward))
                {
                    continue;
                }

                string rewardId = reward.RewardId;
                float min = shown * 0.33f;
                AddAction(actions, "Claim", () => ClaimBook(rewardId), min, min + 0.31f);
                shown++;
            }
        }

        private void ClaimBook(string rewardId)
        {
            MonsterBookService.TryClaimReward(rewardId, out string message);
            footerText.text = message;
            Refresh();
        }

        private void ClearActions()
        {
            for (int i = actionButtons.Count - 1; i >= 0; i--)
            {
                if (actionButtons[i] != null)
                {
                    Destroy(actionButtons[i].gameObject);
                }
            }

            actionButtons.Clear();
        }

        private void AddAction(Transform parent, string label, Action onClick, float minX, float maxX)
        {
            actionButtons.Add(KitUi.Button(parent, label, label, minX, 0f, maxX, 1f, onClick));
        }
    }
}
