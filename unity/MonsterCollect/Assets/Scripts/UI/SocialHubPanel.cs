using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using MonsterCollect.Circuit;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Sharing;
using MonsterCollect.Social;
using MonsterCollect.Social.Local;
using MonsterCollect.Social.Online;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Friends, nearby LAN play, trades, matchmaking, and leaderboards.</summary>
    [DisallowMultipleComponent]
    public class SocialHubPanel : MonoBehaviour
    {
        public static SocialHubPanel Instance { get; private set; }

        private enum Tab { Nearby, Friends, Trades, Pvp, Leaderboards }

        private Tab currentTab = Tab.Nearby;
        private bool uiBuilt;
        private GameObject rootPanel;
        private TMP_Text titleText;
        private TMP_Text bodyText;
        private TMP_Text footerText;
        private Button closeButton;
        private InputField friendCodeInput;
        private readonly List<Button> actionButtons = new List<Button>();
        private string statusMessage = string.Empty;
        private int selectedPeerIndex;
        private int selectedMonsterIndex;
        private string leaderboardCategory;

        private void Awake()
        {
            Instance = this;
            EnsureUi();
            closeButton?.onClick.AddListener(Hide);
            HideImmediate();

            LocalMultiplayerService.MessageReceived += OnLanMessage;
            LocalMultiplayerService.PeersChanged += Refresh;
            LocalMultiplayerService.StatusChanged += OnLanStatus;
            SocialBattleCoordinator.IncomingBattleInvite += OnIncomingBattleInvite;
            SocialProfileService.ProfileChanged += Refresh;
        }

        private void OnDestroy()
        {
            LocalMultiplayerService.MessageReceived -= OnLanMessage;
            LocalMultiplayerService.PeersChanged -= Refresh;
            LocalMultiplayerService.StatusChanged -= OnLanStatus;
            SocialBattleCoordinator.IncomingBattleInvite -= OnIncomingBattleInvite;
            SocialProfileService.ProfileChanged -= Refresh;

            if (Instance == this)
            {
                Instance = null;
            }
        }

        public static void ShowPanel()
        {
            Show(Tab.Nearby);
        }

        public static void ShowFriends()
        {
            Show(Tab.Friends);
        }

        private static void Show(Tab tab)
        {
            SocialHubPanel panel = Instance ?? FindObjectOfType<SocialHubPanel>(true);
            if (panel == null)
            {
                Canvas canvas = KitUi.ResolveGameCanvas();
                if (canvas == null)
                {
                    return;
                }

                var go = new GameObject("SocialHubPanel", typeof(RectTransform), typeof(SocialHubPanel));
                go.transform.SetParent(KitUi.OverlayParent(canvas), false);
                panel = go.GetComponent<SocialHubPanel>();
            }

            panel.currentTab = tab;
            panel.Show();
        }

        public void Show()
        {
            EnsureUi();
            MonsterCollectionService.EnsureSocialLoaded();
            LeaderboardService.RefreshLocalCache();
            LeaderboardService.SeedDemoEntriesIfEmpty();

            if (!LocalMultiplayerService.IsRunning)
            {
                LocalMultiplayerService.Start();
            }

            Refresh();
            if (friendCodeInput != null)
            {
                friendCodeInput.gameObject.SetActive(currentTab == Tab.Friends || currentTab == Tab.Trades);
            }

            rootPanel?.SetActive(true);
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

        private void OnLanMessage(LanEnvelope envelope, string remoteEndpoint)
        {
            SocialBattleCoordinator.HandleLanMessage(envelope, remoteEndpoint);
            Refresh();
        }

        private void OnLanStatus(string message)
        {
            statusMessage = message;
            Refresh();
        }

        private void OnIncomingBattleInvite(LanEnvelope invite, NearbyPeer peer)
        {
            statusMessage = $"Battle invite from {invite.name}! Select a monster and tap Accept Battle.";
            Refresh();
        }

        private void Refresh()
        {
            EnsureUi();
            ClearActionButtons();

            if (titleText != null)
            {
                titleText.text = "Social & Multiplayer";
            }

            if (footerText != null)
            {
                var social = MonsterCollectionService.SocialState;
                footerText.text =
                    $"Code: {SocialProfileService.FriendCode}  ·  {SocialProfileService.DisplayName}  ·  {TournamentService.EquippedTitleLabel()}\n" +
                    $"Casual {social.casualWins}W/{social.casualLosses}L  ·  Ranked {social.rankedWins}W/{social.rankedLosses}L\n" +
                    statusMessage;
            }

            var sb = new StringBuilder();

            switch (currentTab)
            {
                case Tab.Nearby:
                    BuildNearbyTab(sb);
                    break;
                case Tab.Friends:
                    BuildFriendsTab(sb);
                    break;
                case Tab.Trades:
                    BuildTradesTab(sb);
                    break;
                case Tab.Pvp:
                    BuildPvpTab(sb);
                    break;
                case Tab.Leaderboards:
                    BuildLeaderboardsTab(sb);
                    break;
            }

            if (bodyText != null)
            {
                bodyText.text = sb.ToString();
            }
        }

        private void BuildNearbyTab(StringBuilder sb)
        {
            sb.AppendLine("Nearby trainers (same Wi-Fi):");
            IReadOnlyList<NearbyPeer> peers = LocalMultiplayerService.GetNearbyPeers();

            if (peers.Count == 0)
            {
                sb.AppendLine("No peers found yet. Keep this open on two devices.");
            }
            else
            {
                for (int i = 0; i < peers.Count; i++)
                {
                    NearbyPeer peer = peers[i];
                    string marker = i == selectedPeerIndex ? "▶ " : "  ";
                    sb.AppendLine($"{marker}{peer.DisplayName} ({peer.FriendCode}) @ {peer.Address}");
                }
            }

            sb.AppendLine();
            sb.AppendLine("Your battle/trade monster:");
            AppendMonsterChoices(sb);

            AddAction("Prev Peer", () => { selectedPeerIndex = Math.Max(0, selectedPeerIndex - 1); Refresh(); });
            AddAction("Next Peer", () =>
            {
                selectedPeerIndex = Math.Min(Math.Max(0, LocalMultiplayerService.GetNearbyPeers().Count - 1), selectedPeerIndex + 1);
                Refresh();
            });
            AddAction("Battle", SendNearbyBattle);
            AddAction("Trade", SendNearbyTrade);
            AddAction("Accept Battle", AcceptIncomingBattle);
        }

        private void BuildFriendsTab(StringBuilder sb)
        {
            sb.AppendLine($"Friend code: {SocialProfileService.FriendCode}");
            sb.AppendLine("Share this code for async trades & friend list.");
            sb.AppendLine();

            if (friendCodeInput != null)
            {
                friendCodeInput.gameObject.SetActive(true);
            }

            sb.AppendLine("Friends:");
            foreach (FriendEntry friend in SocialProfileService.Friends)
            {
                sb.AppendLine($"• {friend.displayName} ({friend.friendCode})");
            }

            AddAction("Add Friend", AddFriendFromInput);
            AddAction("Copy Code", () => GUIUtility.systemCopyBuffer = SocialProfileService.FriendCode);
            AddAction("Rename", PromptRename);
            AddAction("Gallery", CommunityGalleryPanel.ShowPanel);
        }

        private void BuildTradesTab(StringBuilder sb)
        {
            if (friendCodeInput != null)
            {
                friendCodeInput.gameObject.SetActive(true);
            }

            sb.AppendLine("Pending trade offers:");
            foreach (PendingTradeOffer offer in SocialProfileService.PendingTrades)
            {
                string dir = offer.isIncoming ? "IN" : "OUT";
                sb.AppendLine($"[{dir}] {offer.fromDisplayName} ({offer.fromFriendCode}) id={offer.offerId}");
            }

            sb.AppendLine();
            AppendMonsterChoices(sb);

            AddAction("Accept Top", AcceptFirstIncomingTrade);
            AddAction("Queue Online", QueueOnlineTrade);
            AddAction("Dismiss Top", DismissFirstTrade);
        }

        private void BuildPvpTab(StringBuilder sb)
        {
            sb.AppendLine("Matchmaking works offline with sparring partners.");
            sb.AppendLine("Configure SocialOnlineConfig.ApiBaseUrl for cloud queues.");
            sb.AppendLine();
            AppendMonsterChoices(sb);

            var social = MonsterCollectionService.SocialState;
            sb.AppendLine($"Casual record: {social.casualWins}W / {social.casualLosses}L");
            sb.AppendLine($"Ranked record: {social.rankedWins}W / {social.rankedLosses}L");
            sb.AppendLine($"Circuit: {TournamentService.CurrentDivisionName()}  {TournamentService.State.seasonRating} rt");

            AddAction("Circuit Hub", () =>
            {
                Hide();
                TournamentHubPanel.ShowPanel();
            });
            AddAction("Casual Queue", () => StartMatchmaking(false));
            AddAction("Ranked Queue", () => StartMatchmaking(true));
        }

        private void BuildLeaderboardsTab(StringBuilder sb)
        {
            string category = string.IsNullOrEmpty(leaderboardCategory)
                ? LeaderboardCategories.TrainerRank
                : leaderboardCategory;
            sb.AppendLine($"Category: {FormatCategory(category)}");
            sb.AppendLine();

            foreach (LeaderboardRow row in LeaderboardService.GetLeaderboard(category))
            {
                string you = row.IsLocalPlayer ? " (you)" : string.Empty;
                sb.AppendLine($"{row.DisplayName}{you} — {row.Score}");
            }

            AddAction("Strongest", () => { leaderboardCategory = LeaderboardCategories.StrongestMonster; Refresh(); });
            AddAction("Scans", () => { leaderboardCategory = LeaderboardCategories.UniqueScans; Refresh(); });
            AddAction("Rank", () => { leaderboardCategory = LeaderboardCategories.TrainerRank; Refresh(); });
            AddAction("Circuit", () => { leaderboardCategory = LeaderboardCategories.CircuitPoints; Refresh(); });
            AddAction("Refresh", () => { LeaderboardService.RefreshLocalCache(); Refresh(); });
        }

        private void AppendMonsterChoices(StringBuilder sb)
        {
            IReadOnlyList<MonsterData> monsters = MonsterCollectionService.Monsters;
            if (monsters.Count == 0)
            {
                sb.AppendLine("No monsters on ranch.");
                selectedMonsterIndex = 0;
                return;
            }

            selectedMonsterIndex = Mathf.Clamp(selectedMonsterIndex, 0, monsters.Count - 1);
            MonsterData selected = monsters[selectedMonsterIndex];
            sb.AppendLine($"▶ {selected.Name} (#{selected.DexNumber:D3})");

            AddAction("Prev Mon", () => { selectedMonsterIndex = Math.Max(0, selectedMonsterIndex - 1); Refresh(); });
            AddAction("Next Mon", () =>
            {
                selectedMonsterIndex = Math.Min(monsters.Count - 1, selectedMonsterIndex + 1);
                Refresh();
            });
        }

        private void SendNearbyBattle()
        {
            IReadOnlyList<NearbyPeer> peers = LocalMultiplayerService.GetNearbyPeers();
            if (peers.Count == 0)
            {
                statusMessage = "No nearby peers.";
                Refresh();
                return;
            }

            MonsterData monster = GetSelectedMonster();
            if (monster == null)
            {
                return;
            }

            NearbyPeer peer = peers[Mathf.Clamp(selectedPeerIndex, 0, peers.Count - 1)];
            SocialBattleCoordinator.SendNearbyBattleInvite(peer, monster);
            statusMessage = $"Battle invite sent to {peer.DisplayName}.";
            Refresh();
        }

        private void SendNearbyTrade()
        {
            IReadOnlyList<NearbyPeer> peers = LocalMultiplayerService.GetNearbyPeers();
            if (peers.Count == 0)
            {
                statusMessage = "No nearby peers.";
                Refresh();
                return;
            }

            MonsterData monster = GetSelectedMonster();
            if (monster == null)
            {
                return;
            }

            NearbyPeer peer = peers[Mathf.Clamp(selectedPeerIndex, 0, peers.Count - 1)];
            LocalMultiplayerService.SendTradeOffer(peer, MonsterShareCodec.Encode(monster));
            statusMessage = $"Trade offer sent to {peer.DisplayName}.";
            Refresh();
        }

        private void AcceptIncomingBattle()
        {
            MonsterData monster = GetSelectedMonster();
            if (monster == null)
            {
                statusMessage = "Select a monster first.";
                Refresh();
                return;
            }

            if (!SocialBattleCoordinator.TryAcceptPendingInvite(monster, out string error))
            {
                statusMessage = error ?? "Could not accept battle.";
                Refresh();
            }
        }

        private void AddFriendFromInput()
        {
            string code = friendCodeInput != null ? friendCodeInput.text : string.Empty;
            if (!SocialProfileService.TryAddFriend(code, code, out string error))
            {
                statusMessage = error;
            }
            else
            {
                statusMessage = "Friend added.";
            }

            Refresh();
        }

        private void PromptRename()
        {
            SocialProfileService.DisplayName = SocialProfileService.DisplayName.StartsWith("Trainer")
                ? "Ranch Hero"
                : SocialProfileService.DisplayName + " Jr.";
            statusMessage = "Display name updated.";
            Refresh();
        }

        private void AcceptFirstIncomingTrade()
        {
            PendingTradeOffer offer = SocialProfileService.PendingTrades.FirstOrDefault(o => o.isIncoming);
            if (offer == null)
            {
                statusMessage = "No incoming trades.";
                Refresh();
                return;
            }

            if (!TradeService.TryAcceptTrade(offer, null, out string error))
            {
                statusMessage = error;
            }
            else
            {
                statusMessage = "Trade accepted — monster added!";
            }

            Refresh();
        }

        private void DismissFirstTrade()
        {
            PendingTradeOffer offer = SocialProfileService.PendingTrades.FirstOrDefault();
            if (offer != null)
            {
                SocialProfileService.TryRemovePendingTrade(offer.offerId);
                statusMessage = "Trade dismissed.";
            }

            Refresh();
        }

        private void QueueOnlineTrade()
        {
            MonsterData monster = GetSelectedMonster();
            if (monster == null)
            {
                return;
            }

            string target = friendCodeInput != null ? friendCodeInput.text : string.Empty;
            AsyncTradeMailboxService.QueueOutgoing(MonsterShareCodec.Encode(monster), target);
            statusMessage = SocialOnlineConfig.IsOnlineEnabled
                ? "Queued online trade (stub)."
                : "Saved offline trade offer locally.";
            Refresh();
        }

        private void StartMatchmaking(bool ranked)
        {
            MonsterData monster = GetSelectedMonster();
            if (monster == null)
            {
                statusMessage = "Select a monster for PvP.";
                Refresh();
                return;
            }

            MatchmakingTicket ticket = MatchmakingService.BeginSearch(monster.Id, ranked);
            MatchmakingResult result = MatchmakingService.TryResolve(ticket);

            if (!result.Success)
            {
                statusMessage = result.Message;
                Refresh();
                return;
            }

            statusMessage = result.Message;
            MatchmakingService.LaunchMatch(result, monster.Id, ranked);
        }

        private MonsterData GetSelectedMonster()
        {
            IReadOnlyList<MonsterData> monsters = MonsterCollectionService.Monsters;
            if (monsters.Count == 0)
            {
                return null;
            }

            selectedMonsterIndex = Mathf.Clamp(selectedMonsterIndex, 0, monsters.Count - 1);
            MonsterData monster = monsters[selectedMonsterIndex];
            SocialHubState.SelectedBattleMonsterId = monster.Id;
            SocialHubState.SelectedTradeMonsterId = monster.Id;
            return monster;
        }

        private static string FormatCategory(string category)
        {
            return category switch
            {
                LeaderboardCategories.StrongestMonster => "Strongest Monster",
                LeaderboardCategories.UniqueScans => "Unique Scans",
                LeaderboardCategories.CircuitPoints => "Circuit Points",
                _ => "Trainer Rank"
            };
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

            titleText = KitUi.Label(card.transform, "Title", "Social", 34, TextAlignmentOptions.Center, title: true);
            KitUi.AnchorTop(titleText.rectTransform, 0.88f, 0.98f);

            bodyText = KitUi.Label(card.transform, "Body", string.Empty, 20, TextAlignmentOptions.TopLeft);
            KitUi.Anchor(bodyText.rectTransform, 0.05f, 0.28f, 0.95f, 0.86f);
            bodyText.enableWordWrapping = true;

            footerText = KitUi.Label(card.transform, "Footer", string.Empty, 18, TextAlignmentOptions.BottomLeft);
            KitUi.Anchor(footerText.rectTransform, 0.04f, 0.02f, 0.52f, 0.12f);

            friendCodeInput = KitUi.LegacyInput(card.transform, "FriendCodeInput", "Friend code MC-XXXXXX", 0.05f, 0.24f, 0.95f, 0.28f);
            friendCodeInput.gameObject.SetActive(false);

            var tabRow = new GameObject("Tabs", typeof(RectTransform)).GetComponent<RectTransform>();
            tabRow.SetParent(card.transform, false);
            KitUi.Anchor(tabRow, 0.04f, 0.14f, 0.96f, 0.22f);

            CreateTab(tabRow, "Nearby", Tab.Nearby, 0f, 0.19f);
            CreateTab(tabRow, "Friends", Tab.Friends, 0.2f, 0.39f);
            CreateTab(tabRow, "Trades", Tab.Trades, 0.4f, 0.59f);
            CreateTab(tabRow, "PvP", Tab.Pvp, 0.6f, 0.79f);
            CreateTab(tabRow, "Boards", Tab.Leaderboards, 0.8f, 1f);

            var actionRowGo = new GameObject("ActionRow", typeof(RectTransform));
            actionRowGo.transform.SetParent(card.transform, false);
            KitUi.Anchor(actionRowGo.GetComponent<RectTransform>(), 0.04f, 0.22f, 0.96f, 0.27f);

            closeButton = KitUi.Button(card.transform, "Close", "CLOSE", 0.78f, 0.02f, 0.96f, 0.11f, Hide, secondary: true);
            KitUi.Button(card.transform, "Community", "COMMUNITY", 0.54f, 0.02f, 0.76f, 0.11f, CommunityGalleryPanel.ShowPanel);
        }

        private void CreateTab(RectTransform row, string label, Tab tab, float minX, float maxX)
        {
            Button button = KitUi.Button(row, label, label.ToUpperInvariant(), minX, 0f, maxX, 1f, null, secondary: true);
            button.onClick.AddListener(() =>
            {
                currentTab = tab;
                if (friendCodeInput != null)
                {
                    friendCodeInput.gameObject.SetActive(tab == Tab.Friends || tab == Tab.Trades);
                }

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
            float width = 0.24f;
            float minX = index * width;
            Button button = KitUi.Button(row, $"Action_{label}", label, minX, 0f, minX + width - 0.01f, 1f, handler);
            actionButtons.Add(button);
        }

        private void ClearActionButtons()
        {
            foreach (Button button in actionButtons)
            {
                if (button != null)
                {
                    Destroy(button.gameObject);
                }
            }

            actionButtons.Clear();
        }
    }
}
