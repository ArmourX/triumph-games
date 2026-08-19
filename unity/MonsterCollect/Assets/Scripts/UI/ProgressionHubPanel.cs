using System;
using System.Collections.Generic;
using System.Text;
using MonsterCollect.Data;
using MonsterCollect.Progression;
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
        private Text titleText;
        private Text bodyText;
        private Text footerText;
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

        public static void ShowPanel()
        {
            ProgressionHubPanel panel = Instance ?? FindObjectOfType<ProgressionHubPanel>(true);
            if (panel == null)
            {
                Canvas canvas = FindObjectOfType<Canvas>();
                if (canvas == null)
                {
                    return;
                }

                var go = new GameObject("ProgressionHubPanel", typeof(RectTransform), typeof(ProgressionHubPanel));
                Transform parent = LandscapePlayFrame.FindContentRoot(canvas) ?? canvas.transform;
                go.transform.SetParent(parent, false);
                panel = go.GetComponent<ProgressionHubPanel>();
            }

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
            Font font = MobileGameUiKit.BodyFont;
            var rect = GetComponent<RectTransform>() ?? gameObject.AddComponent<RectTransform>();
            Stretch(rect);

            var dim = CreateImage("Dim", transform, new Color(0f, 0f, 0f, 0.72f));
            UiSkinUtility.ApplyDimOverlay(dim);
            Stretch(dim.rectTransform);

            var card = CreateImage("Card", transform, new Color(0.1f, 0.12f, 0.17f, 0.98f));
            UiSkinUtility.ApplyModalPanel(card);
            var cardRect = card.rectTransform;
            cardRect.anchorMin = new Vector2(0.04f, 0.06f);
            cardRect.anchorMax = new Vector2(0.96f, 0.94f);
            cardRect.offsetMin = Vector2.zero;
            cardRect.offsetMax = Vector2.zero;

            titleText = CreateText("Title", card.transform, font, 30, FontStyle.Bold, TextAnchor.UpperCenter);
            UiSkinUtility.StyleTitle(titleText);
            AnchorTop(titleText.rectTransform, 0.88f, 0.98f);

            bodyText = CreateText("Body", card.transform, font, 21, FontStyle.Normal, TextAnchor.UpperLeft);
            UiSkinUtility.StyleBody(bodyText);
            bodyText.rectTransform.anchorMin = new Vector2(0.05f, 0.28f);
            bodyText.rectTransform.anchorMax = new Vector2(0.95f, 0.86f);
            bodyText.rectTransform.offsetMin = Vector2.zero;
            bodyText.rectTransform.offsetMax = Vector2.zero;
            bodyText.horizontalOverflow = HorizontalWrapMode.Wrap;
            bodyText.verticalOverflow = VerticalWrapMode.Overflow;

            footerText = CreateText("Footer", card.transform, font, 20, FontStyle.Italic, TextAnchor.LowerLeft);
            AnchorBottom(footerText.rectTransform, 0.02f, 0.12f);
            UiSkinUtility.StyleMuted(footerText);

            var tabRow = new GameObject("Tabs", typeof(RectTransform)).GetComponent<RectTransform>();
            tabRow.SetParent(card.transform, false);
            tabRow.anchorMin = new Vector2(0.04f, 0.14f);
            tabRow.anchorMax = new Vector2(0.96f, 0.24f);
            tabRow.offsetMin = Vector2.zero;
            tabRow.offsetMax = Vector2.zero;

            CreateTab(tabRow, font, "Rank", Tab.Rank, 0f, 0.24f);
            CreateTab(tabRow, font, "Quests", Tab.Quests, 0.25f, 0.49f);
            CreateTab(tabRow, font, "Shop", Tab.Shop, 0.5f, 0.74f);
            CreateTab(tabRow, font, "Book", Tab.Book, 0.75f, 1f);

            var actionRowGo = new GameObject("Actions", typeof(RectTransform));
            actionRowGo.transform.SetParent(card.transform, false);
            var actionRect = actionRowGo.GetComponent<RectTransform>();
            actionRect.anchorMin = new Vector2(0.04f, 0.24f);
            actionRect.anchorMax = new Vector2(0.96f, 0.28f);
            actionRect.offsetMin = Vector2.zero;
            actionRect.offsetMax = Vector2.zero;

            closeButton = CreateButton("Close", card.transform, font, "Close", Hide, 0.82f, 0.98f, 0.02f, 0.12f);
        }

        private void CreateTab(RectTransform parent, Font font, string label, Tab tab, float minX, float maxX)
        {
            CreateButton(label, parent, font, label, () => { currentTab = tab; Refresh(); }, minX, maxX, 0f, 1f);
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

            Font font = MobileGameUiKit.BodyFont;
            AddClaimButtons(actions, font, QuestService.GetActiveQuestIds(QuestCategory.Daily));
            AddClaimButtons(actions, font, QuestService.GetActiveQuestIds(QuestCategory.Weekly));
            AddClaimButtons(actions, font, QuestService.GetActiveQuestIds(QuestCategory.Main));
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

        private void AddClaimButtons(Transform actions, Font font, IReadOnlyList<string> ids)
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
                AddAction(actions, font, "Claim", () => ClaimQuest(questId), min, min + 0.31f);
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

            Font font = MobileGameUiKit.BodyFont;
            for (int i = 0; i < offers.Length && i < 3; i++)
            {
                ShopOfferDefinition offer = offers[i];
                if (offer == null)
                {
                    continue;
                }

                string id = offer.OfferId;
                float min = i * 0.33f;
                AddAction(actions, font, offer.DisplayName.Split(' ')[0], () => Buy(id), min, min + 0.31f);
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

            Font font = MobileGameUiKit.BodyFont;
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
                AddAction(actions, font, "Claim", () => ClaimBook(rewardId), min, min + 0.31f);
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

        private void AddAction(Transform parent, Font font, string label, Action onClick, float minX, float maxX)
        {
            actionButtons.Add(CreateButton(label, parent, font, label, onClick, minX, maxX, 0f, 1f));
        }

        private static UnityEngine.UI.Image CreateImage(string name, Transform parent, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(UnityEngine.UI.Image));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<UnityEngine.UI.Image>();
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

        private static Button CreateButton(string name, Transform parent, Font font, string label, Action onClick,
            float minX, float maxX, float minY, float maxY)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(UnityEngine.UI.Image), typeof(Button));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(minX, minY);
            rect.anchorMax = new Vector2(maxX, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            go.GetComponent<UnityEngine.UI.Image>().color = new Color(0.22f, 0.35f, 0.55f, 1f);

            var textGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            textGo.transform.SetParent(go.transform, false);
            Stretch(textGo.GetComponent<RectTransform>());
            var text = textGo.GetComponent<Text>();
            text.font = font;
            text.fontSize = 20;
            text.alignment = TextAnchor.MiddleCenter;
            text.color = Color.white;
            text.text = label;

            var btn = go.GetComponent<Button>();
            btn.onClick.AddListener(() => onClick());
            return btn;
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

        private static void AnchorBottom(RectTransform rect, float minY, float maxY)
        {
            rect.anchorMin = new Vector2(0.05f, minY);
            rect.anchorMax = new Vector2(0.95f, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }
}
