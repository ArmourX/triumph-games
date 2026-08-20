using System;
using System.Collections.Generic;
using System.Text;
using MonsterCollect.Battle;
using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Social;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Public gallery, featured weekly challenge, reporting, and sandboxed mods.</summary>
    [DisallowMultipleComponent]
    public class CommunityGalleryPanel : MonoBehaviour
    {
        public static CommunityGalleryPanel Instance { get; private set; }

        private enum Tab { Featured, Gallery, Challenge, Showcase, Report, Mods }

        private Tab currentTab = Tab.Featured;
        private bool uiBuilt;
        private GameObject rootPanel;
        private TMP_Text titleText;
        private TMP_Text bodyText;
        private TMP_Text footerText;
        private Button closeButton;
        private readonly List<Button> actionButtons = new List<Button>();
        private string statusMessage = string.Empty;
        private int selectedIndex;
        private int selectedMonsterIndex;
        private CommunityReportReason reportReason = CommunityReportReason.Spam;
        private IReadOnlyList<CommunityGalleryEntry> visibleEntries = Array.Empty<CommunityGalleryEntry>();

        private void Awake()
        {
            Instance = this;
            EnsureUi();
            closeButton?.onClick.AddListener(Hide);
            CommunityGalleryService.GalleryChanged += Refresh;
            HideImmediate();
        }

        private void OnDestroy()
        {
            CommunityGalleryService.GalleryChanged -= Refresh;
            if (Instance == this)
            {
                Instance = null;
            }
        }

        public static void ShowPanel()
        {
            CommunityGalleryPanel panel = Instance ?? FindObjectOfType<CommunityGalleryPanel>(true);
            if (panel == null)
            {
                panel = KitUi.EnsureOverlay<CommunityGalleryPanel>("CommunityGalleryPanel");
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
            CommunityGalleryService.EnsureReady();
            Refresh();
            rootPanel?.SetActive(true);
            gameObject.SetActive(true);
            transform.SetAsLastSibling();
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

        private void Refresh()
        {
            EnsureUi();
            ClearActionButtons();

            if (titleText != null)
            {
                titleText.text = "Community";
            }

            CommunityChallenge challenge = CommunityChallengeService.Current;
            if (footerText != null)
            {
                footerText.text =
                    $"{SocialProfileService.DisplayName}  ·  {SocialProfileService.FriendCode}\n" +
                    $"This week: {challenge.Title}\n" +
                    statusMessage;
            }

            var sb = new StringBuilder();
            switch (currentTab)
            {
                case Tab.Featured:
                    BuildFeaturedTab(sb);
                    break;
                case Tab.Gallery:
                    BuildGalleryTab(sb);
                    break;
                case Tab.Challenge:
                    BuildChallengeTab(sb);
                    break;
                case Tab.Showcase:
                    BuildShowcaseTab(sb);
                    break;
                case Tab.Report:
                    BuildReportTab(sb);
                    break;
                case Tab.Mods:
                    BuildModsTab(sb);
                    break;
            }

            if (bodyText != null)
            {
                bodyText.text = sb.ToString();
            }
        }

        private void BuildFeaturedTab(StringBuilder sb)
        {
            CommunityChallenge challenge = CommunityChallengeService.Current;
            sb.AppendLine($"Featured · {challenge.Title}");
            sb.AppendLine(challenge.Description);
            sb.AppendLine();
            visibleEntries = CommunityGalleryService.GetFeatured();
            AppendEntries(sb, visibleEntries);
            AddEntryActions(allowReport: true);
        }

        private void BuildGalleryTab(StringBuilder sb)
        {
            sb.AppendLine("Public gallery of shared monster QRs.");
            sb.AppendLine("Publish from Share QR on a ranch monster.");
            sb.AppendLine();
            visibleEntries = CommunityGalleryService.GetVisibleGallery();
            AppendEntries(sb, visibleEntries);
            AddEntryActions(allowReport: true);
            AddAction("Publish Selected", PublishSelectedRanchMonster);
        }

        private void BuildChallengeTab(StringBuilder sb)
        {
            CommunityChallenge challenge = CommunityChallengeService.Current;
            SocialSaveState social = MonsterCollectionService.SocialState;
            sb.AppendLine($"{challenge.Title} ({challenge.WeekId})");
            sb.AppendLine(challenge.Description);
            sb.AppendLine($"Reward: {challenge.CoinReward} coins, {challenge.XpReward} XP");
            sb.AppendLine(social.communityChallengeProgress > 0 ? "Progress: submitted!" : "Progress: not submitted yet");
            sb.AppendLine(social.communityChallengeClaimed ? "Reward claimed." : "Reward available after a matching share.");
            sb.AppendLine();
            AppendMonsterChoices(sb);
            AddAction("Share Match", ShareForChallenge);
            AddAction("Claim", ClaimChallenge);
        }

        private void BuildShowcaseTab(StringBuilder sb)
        {
            sb.AppendLine("Friend showcase — visible to trainers on your friend list.");
            sb.AppendLine();
            visibleEntries = CommunityGalleryService.GetFriendShowcase();
            AppendEntries(sb, visibleEntries);
            AppendMonsterChoices(sb);
            AddAction("Add Showcase", () => PublishSelected(CommunityVisibility.Friends));
            AddAction("Like", LikeSelected);
        }

        private void BuildReportTab(StringBuilder sb)
        {
            sb.AppendLine("Report inappropriate shared content.");
            sb.AppendLine("Reports hide the post on this device. Repeated reports hide it for everyone locally.");
            sb.AppendLine($"Reason: {CommunityReportService.FormatReason(reportReason)}");
            sb.AppendLine();
            visibleEntries = CommunityGalleryService.GetVisibleGallery();
            AppendEntries(sb, visibleEntries);
            AddAction("Name", () => { reportReason = CommunityReportReason.InappropriateName; Refresh(); });
            AddAction("Offense", () => { reportReason = CommunityReportReason.OffensiveContent; Refresh(); });
            AddAction("Spam", () => { reportReason = CommunityReportReason.Spam; Refresh(); });
            AddAction("Report", ReportSelected);
        }

        private void BuildModsTab(StringBuilder sb)
        {
            sb.AppendLine("Sandboxed custom accessories.");
            sb.AppendLine($"Drop JSON (+ optional 128px PNG) in:\n{CommunityPartModService.ModsFolder}");
            sb.AppendLine("Only Accessory mods. No scripts or downloads.");
            sb.AppendLine();

            IReadOnlyList<CommunityPartMod> mods = CommunityPartModService.Mods;
            if (mods.Count == 0)
            {
                sb.AppendLine("No mods loaded yet.");
            }
            else
            {
                for (int i = 0; i < mods.Count; i++)
                {
                    sb.AppendLine($"• {mods[i].displayName} ({mods[i].id})");
                }
            }

            AppendMonsterChoices(sb);
            AddAction("Example Pack", () =>
            {
                string folder = CommunityPartModService.WriteExamplePack();
                statusMessage = $"Wrote example to {folder}";
                Refresh();
            });
            AddAction("Rescan", () =>
            {
                CommunityPartModService.Rescan();
                statusMessage = $"Loaded {CommunityPartModService.Mods.Count} mod(s).";
                Refresh();
            });
            AddAction("Equip", EquipSelectedMod);
        }

        private void AppendEntries(StringBuilder sb, IReadOnlyList<CommunityGalleryEntry> entries)
        {
            if (entries == null || entries.Count == 0)
            {
                sb.AppendLine("Nothing here yet.");
                selectedIndex = 0;
                return;
            }

            selectedIndex = Mathf.Clamp(selectedIndex, 0, entries.Count - 1);
            for (int i = 0; i < entries.Count; i++)
            {
                CommunityGalleryEntry entry = entries[i];
                string marker = i == selectedIndex ? "▶ " : "  ";
                string like = CommunityGalleryService.IsLiked(entry.entryId) ? "♥" : "♡";
                sb.AppendLine($"{marker}{entry.monsterName}  #{entry.dexNumber:D3}  {entry.element}  {like}{entry.likes}");
                sb.AppendLine($"    {entry.ownerDisplayName} ({entry.ownerFriendCode})");
            }
        }

        private void AppendMonsterChoices(StringBuilder sb)
        {
            IReadOnlyList<MonsterData> monsters = MonsterCollectionService.Monsters;
            if (monsters.Count == 0)
            {
                sb.AppendLine("No ranch monsters to share.");
                return;
            }

            selectedMonsterIndex = Mathf.Clamp(selectedMonsterIndex, 0, monsters.Count - 1);
            MonsterData selected = monsters[selectedMonsterIndex];
            sb.AppendLine($"Ranch pick: {selected.GetDisplayName()} (#{selected.DexNumber:D3})");
            AddAction("Prev Mon", () => { selectedMonsterIndex = Math.Max(0, selectedMonsterIndex - 1); Refresh(); });
            AddAction("Next Mon", () =>
            {
                selectedMonsterIndex = Math.Min(monsters.Count - 1, selectedMonsterIndex + 1);
                Refresh();
            });
        }

        private void AddEntryActions(bool allowReport)
        {
            AddAction("Prev", () => { selectedIndex = Math.Max(0, selectedIndex - 1); Refresh(); });
            AddAction("Next", () =>
            {
                selectedIndex = Math.Min(Math.Max(0, visibleEntries.Count - 1), selectedIndex + 1);
                Refresh();
            });
            AddAction("Like", LikeSelected);
            AddAction("Copy QR", CopySelectedPayload);
            AddAction("Add Copy", ImportSelected);
            if (allowReport)
            {
                AddAction("Report", () => { currentTab = Tab.Report; Refresh(); });
            }
        }

        private CommunityGalleryEntry GetSelectedEntry()
        {
            if (visibleEntries == null || visibleEntries.Count == 0)
            {
                return null;
            }

            selectedIndex = Mathf.Clamp(selectedIndex, 0, visibleEntries.Count - 1);
            return visibleEntries[selectedIndex];
        }

        private MonsterData GetSelectedMonster()
        {
            IReadOnlyList<MonsterData> monsters = MonsterCollectionService.Monsters;
            if (monsters.Count == 0)
            {
                return null;
            }

            selectedMonsterIndex = Mathf.Clamp(selectedMonsterIndex, 0, monsters.Count - 1);
            return monsters[selectedMonsterIndex];
        }

        private void LikeSelected()
        {
            CommunityGalleryEntry entry = GetSelectedEntry();
            if (entry == null)
            {
                statusMessage = "No post selected.";
                Refresh();
                return;
            }

            CommunityGalleryService.TryToggleLike(entry.entryId, out statusMessage);
            Refresh();
        }

        private void CopySelectedPayload()
        {
            CommunityGalleryEntry entry = GetSelectedEntry();
            if (entry == null || string.IsNullOrEmpty(entry.sharePayload))
            {
                statusMessage = "No share code on this post.";
                Refresh();
                return;
            }

            GUIUtility.systemCopyBuffer = entry.sharePayload;
            statusMessage = "Share QR payload copied.";
            Refresh();
        }

        private void ImportSelected()
        {
            CommunityGalleryEntry entry = GetSelectedEntry();
            if (entry == null)
            {
                statusMessage = "No post selected.";
                Refresh();
                return;
            }

            if (!TradeService.TryImportSharePayload(entry.sharePayload, out _, out string error))
            {
                statusMessage = error ?? "Could not import.";
            }
            else
            {
                statusMessage = $"Added a copy of {entry.monsterName} to your ranch.";
                GameFeedbackService.Instance?.PlayBirth(transform, Color.white);
            }

            Refresh();
        }

        private void ReportSelected()
        {
            CommunityGalleryEntry entry = GetSelectedEntry();
            if (entry == null)
            {
                statusMessage = "Pick a post first.";
                Refresh();
                return;
            }

            CommunityReportService.TryReport(entry.entryId, reportReason, string.Empty, out statusMessage);
            Refresh();
        }

        private void PublishSelectedRanchMonster()
        {
            PublishSelected(CommunityVisibility.Public);
        }

        private void PublishSelected(CommunityVisibility visibility)
        {
            MonsterData monster = GetSelectedMonster();
            if (!CommunityGalleryService.TryPublish(monster, visibility, true, out statusMessage))
            {
                GameFeedbackService.Instance?.PlayError();
            }

            Refresh();
        }

        private void ShareForChallenge()
        {
            MonsterData monster = GetSelectedMonster();
            if (monster == null)
            {
                statusMessage = "Select a ranch monster.";
                Refresh();
                return;
            }

            var preview = new CommunityGalleryEntry
            {
                element = BattleElementUtility.GetShortName(BattleElementUtility.FromMonster(monster)),
                rarity = (int)monster.Rarity
            };

            if (!CommunityChallengeService.Matches(preview, CommunityChallengeService.Current))
            {
                statusMessage = "That monster does not match this week's theme.";
                Refresh();
                return;
            }

            PublishSelected(CommunityVisibility.Public);
        }

        private void ClaimChallenge()
        {
            CommunityChallengeService.TryClaim(out statusMessage);
            Refresh();
        }

        private void EquipSelectedMod()
        {
            MonsterData monster = GetSelectedMonster();
            IReadOnlyList<CommunityPartMod> mods = CommunityPartModService.Mods;
            if (monster == null || mods.Count == 0)
            {
                statusMessage = "Need a monster and a loaded mod.";
                Refresh();
                return;
            }

            CommunityPartMod mod = mods[Mathf.Clamp(selectedIndex, 0, mods.Count - 1)];
            if (!MonsterCustomizationService.TryEquipAccessory(monster, mod.id, out statusMessage))
            {
                GameFeedbackService.Instance?.PlayError();
            }

            Refresh();
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
            Image card = KitUi.Card(transform);

            titleText = KitUi.Label(card.transform, "Title", "Community", 32, TextAlignmentOptions.Center, title: true);
            KitUi.Anchor(titleText.rectTransform, 0.05f, 0.88f, 0.95f, 0.98f);

            bodyText = KitUi.Label(card.transform, "Body", string.Empty, 18, TextAlignmentOptions.TopLeft);
            KitUi.Anchor(bodyText.rectTransform, 0.05f, 0.34f, 0.95f, 0.86f);
            bodyText.enableWordWrapping = true;

            footerText = KitUi.Label(card.transform, "Footer", string.Empty, 16, TextAlignmentOptions.BottomLeft);
            KitUi.Anchor(footerText.rectTransform, 0.05f, 0.02f, 0.52f, 0.12f);

            var tabRow = new GameObject("Tabs", typeof(RectTransform)).GetComponent<RectTransform>();
            tabRow.SetParent(card.transform, false);
            KitUi.Anchor(tabRow, 0.04f, 0.14f, 0.96f, 0.22f);

            CreateTab(tabRow, "Featured", Tab.Featured, 0f, 0.16f);
            CreateTab(tabRow, "Gallery", Tab.Gallery, 0.17f, 0.33f);
            CreateTab(tabRow, "Weekly", Tab.Challenge, 0.34f, 0.50f);
            CreateTab(tabRow, "Friends", Tab.Showcase, 0.51f, 0.67f);
            CreateTab(tabRow, "Report", Tab.Report, 0.68f, 0.83f);
            CreateTab(tabRow, "Mods", Tab.Mods, 0.84f, 1f);

            var actionRowGo = new GameObject("ActionRow", typeof(RectTransform));
            actionRowGo.transform.SetParent(card.transform, false);
            KitUi.Anchor(actionRowGo.GetComponent<RectTransform>(), 0.04f, 0.22f, 0.96f, 0.33f);

            closeButton = KitUi.Button(card.transform, "Close", "CLOSE", 0.78f, 0.02f, 0.96f, 0.11f, null, secondary: true);
        }

        private void CreateTab(RectTransform row, string label, Tab tab, float minX, float maxX)
        {
            Button button = KitUi.Button(row, label, label.ToUpperInvariant(), minX, 0f, maxX, 1f, null, secondary: true);
            button.onClick.AddListener(() =>
            {
                currentTab = tab;
                selectedIndex = 0;
                Refresh();
            });
        }

        private void AddAction(string label, Action handler)
        {
            Transform row = transform.Find("Card/ActionRow");
            if (row == null)
            {
                return;
            }

            int index = actionButtons.Count;
            int columns = 6;
            int col = index % columns;
            int rowIndex = index / columns;
            if (rowIndex > 1)
            {
                return;
            }

            float width = 1f / columns;
            float minY = rowIndex == 0 ? 0.52f : 0f;
            float maxY = rowIndex == 0 ? 1f : 0.48f;
            Button button = KitUi.Button(row, $"Action_{label}", label, col * width, minY, (col + 1) * width - 0.01f, maxY, handler);
            actionButtons.Add(button);
        }

        private void ClearActionButtons()
        {
            for (int i = 0; i < actionButtons.Count; i++)
            {
                if (actionButtons[i] != null)
                {
                    Destroy(actionButtons[i].gameObject);
                }
            }

            actionButtons.Clear();
        }
    }
}
