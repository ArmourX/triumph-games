using System;
using System.Collections.Generic;
using System.Text;
using MonsterCollect.Circuit;
using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Social.Online;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Optional ranked circuit hub: ladder, cups, titles, and results log.</summary>
    [DisallowMultipleComponent]
    public class TournamentHubPanel : MonoBehaviour
    {
        public static TournamentHubPanel Instance { get; private set; }
        private static bool showOnNextRanch;

        private enum Screen { Home, Ladder, Cups, Party, Log, Titles, Boards }

        private Screen screen = Screen.Home;
        private bool uiBuilt;
        private GameObject rootPanel;
        private TMP_Text titleText;
        private TMP_Text bodyText;
        private RectTransform buttonColumn;
        private readonly List<Button> buttons = new List<Button>();
        private readonly List<string> partyIds = new List<string>();
        private int monsterCursor;
        private int titleCursor;
        private string status = string.Empty;

        public static void RequestShowOnNextRanch() => showOnNextRanch = true;

        public static bool ConsumeShowOnLoad()
        {
            bool show = showOnNextRanch;
            showOnNextRanch = false;
            return show;
        }

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
            TournamentHubPanel panel = Instance ?? FindObjectOfType<TournamentHubPanel>(true);
            if (panel == null)
            {
                panel = KitUi.EnsureOverlay<TournamentHubPanel>("TournamentHubPanel");
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
            TournamentService.EnsureReady();
            screen = Screen.Home;
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
            ClearButtons();
            TournamentService.EnsureReady();

            if (titleText != null)
            {
                titleText.text = "Circuit";
            }

            var sb = new StringBuilder();
            switch (screen)
            {
                case Screen.Ladder:
                    BuildLadder(sb);
                    break;
                case Screen.Cups:
                    BuildCups(sb);
                    break;
                case Screen.Party:
                    BuildParty(sb);
                    break;
                case Screen.Log:
                    BuildLog(sb);
                    break;
                case Screen.Titles:
                    BuildTitles(sb);
                    break;
                case Screen.Boards:
                    BuildBoards(sb);
                    break;
                default:
                    BuildHome(sb);
                    break;
            }

            if (bodyText != null)
            {
                bodyText.text = sb.ToString();
            }
        }

        private void BuildHome(StringBuilder sb)
        {
            TournamentSaveState state = TournamentService.State;
            CircuitRunState run = TournamentService.Run;

            sb.AppendLine($"{TournamentService.CurrentSeasonId()}  ·  {TournamentService.CurrentDivisionName()}");
            sb.AppendLine($"Title: {TournamentService.EquippedTitleLabel()}");
            sb.AppendLine($"Rating {state.seasonRating}  ·  RP {state.careerPoints}  ·  {state.seasonWins}W/{state.seasonLosses}L");
            sb.AppendLine($"Party: {FormatParty()}");
            sb.AppendLine();
            if (run.isActive)
            {
                sb.AppendLine(run.hasPendingMatch
                    ? $"Pending: {run.pendingOpponentName} ({run.mode})"
                    : run.lastResultSummary);
            }
            else if (!string.IsNullOrEmpty(run.lastResultSummary))
            {
                sb.AppendLine(run.lastResultSummary);
            }
            else
            {
                sb.AppendLine("Optional ranked play. Cups are single-elim; ladder is ongoing.");
            }

            if (!string.IsNullOrEmpty(status))
            {
                sb.AppendLine();
                sb.AppendLine(status);
            }

            if (run.hasPendingMatch)
            {
                AddCenterButton("Fight Next Match", FightNext);
            }

            AddCenterButton("Ranked Ladder", () => { screen = Screen.Ladder; Refresh(); });
            AddCenterButton("Cups / Brackets", () => { screen = Screen.Cups; Refresh(); });
            AddCenterButton("Pick Party (1–3)", () => { screen = Screen.Party; Refresh(); });
            if (run.isActive)
            {
                AddCenterButton("Forfeit Run", () =>
                {
                    CircuitEnterResult result = TournamentService.Forfeit();
                    status = result.Message;
                    Refresh();
                });
            }

            AddCenterButton("Results Log", () => { screen = Screen.Log; Refresh(); });
            AddCenterButton("Titles", () => { screen = Screen.Titles; Refresh(); });
            AddCenterButton("Leaderboard", () => { screen = Screen.Boards; Refresh(); });
            AddCenterButton("Close", Hide);
        }

        private void BuildLadder(StringBuilder sb)
        {
            sb.AppendLine("Ongoing ladder. One match per entry. Rating uses Elo.");
            sb.AppendLine($"Your split: {TournamentService.CurrentDivisionName()}");
            sb.AppendLine();
            IReadOnlyList<CircuitEventEntry> events = TournamentService.GetLadderEvents();
            for (int i = 0; i < events.Count; i++)
            {
                CircuitEventEntry ev = events[i];
                sb.AppendLine($"{ev.displayName}  ·  fee {ev.entryFeeCoins}c  ·  Lv {ev.minMonsterLevel}+");
                sb.AppendLine($"   {ev.description}");
            }

            CircuitEventEntry current = TournamentService.CurrentLadderDivision();
            if (current != null)
            {
                AddCenterButton($"Enter {current.displayName}", () => EnterEvent(current.eventId));
            }

            AddCenterButton("Back", () => { screen = Screen.Home; Refresh(); });
        }

        private void BuildCups(StringBuilder sb)
        {
            sb.AppendLine("Single-elimination brackets of 8. Other matches resolve as a spectator log.");
            sb.AppendLine();
            IReadOnlyList<CircuitEventEntry> events = TournamentService.GetCupEvents();
            for (int i = 0; i < events.Count; i++)
            {
                CircuitEventEntry ev = events[i];
                sb.AppendLine($"{ev.displayName}  ·  {ev.entryFeeCoins}c  ·  Rank {ev.requiredTrainerRankIndex + 1}+ or {ev.minRating} rt");
                sb.AppendLine($"   {ev.description}");
                int index = i;
                AddCenterButton($"Enter {ev.displayName}", () => EnterEvent(events[index].eventId));
            }

            AddCenterButton("Back", () => { screen = Screen.Home; Refresh(); });
        }

        private void BuildParty(StringBuilder sb)
        {
            IReadOnlyList<MonsterData> monsters = MonsterCollectionService.Monsters;
            sb.AppendLine("Lead monster fights. Bench is registered only.");
            sb.AppendLine($"Selected: {FormatParty()}");
            sb.AppendLine();
            if (monsters.Count == 0)
            {
                sb.AppendLine("Capture monsters first.");
            }
            else
            {
                monsterCursor = Mathf.Clamp(monsterCursor, 0, monsters.Count - 1);
                MonsterData current = monsters[monsterCursor];
                bool inParty = partyIds.Contains(current.Id);
                sb.AppendLine($"{current.GetDisplayName()}  Lv {current.Raising?.level ?? 1} {(inParty ? "(registered)" : "")}");
            }

            AddCenterButton("Prev Monster", () =>
            {
                monsterCursor = Math.Max(0, monsterCursor - 1);
                Refresh();
            });
            AddCenterButton("Next Monster", () =>
            {
                monsterCursor = Math.Min(monsters.Count - 1, monsterCursor + 1);
                Refresh();
            });
            AddCenterButton("Add / Remove", ToggleCurrentMonster);
            AddCenterButton("Clear Party", () =>
            {
                partyIds.Clear();
                Refresh();
            });
            AddCenterButton("Back", () => { screen = Screen.Home; Refresh(); });
        }

        private void BuildLog(StringBuilder sb)
        {
            sb.AppendLine("Spectator / results log");
            sb.AppendLine();
            IReadOnlyList<string> lines = TournamentService.GetLog();
            if (lines.Count == 0)
            {
                sb.AppendLine("No circuit matches yet.");
            }
            else
            {
                for (int i = 0; i < lines.Count; i++)
                {
                    sb.AppendLine(lines[i]);
                }
            }

            AddCenterButton("Back", () => { screen = Screen.Home; Refresh(); });
        }

        private void BuildTitles(StringBuilder sb)
        {
            CircuitTitleEntry[] titles = CircuitCatalogRegistry.Catalog.Titles;
            TournamentSaveState state = TournamentService.State;
            sb.AppendLine("Unique titles from rating, RP, and cup wins.");
            sb.AppendLine($"Equipped: {TournamentService.EquippedTitleLabel()}");
            sb.AppendLine();
            if (titles != null)
            {
                for (int i = 0; i < titles.Length; i++)
                {
                    bool owned = Contains(state.unlockedTitleIds, titles[i].titleId);
                    sb.AppendLine($"{(owned ? "★" : "○")} {titles[i].displayName}");
                    sb.AppendLine($"   {titles[i].description}");
                }

                titleCursor = Mathf.Clamp(titleCursor, 0, Math.Max(0, titles.Length - 1));
            }

            AddCenterButton("Prev Title", () =>
            {
                titleCursor = Math.Max(0, titleCursor - 1);
                Refresh();
            });
            AddCenterButton("Next Title", () =>
            {
                CircuitTitleEntry[] all = CircuitCatalogRegistry.Catalog.Titles;
                titleCursor = Math.Min((all?.Length ?? 1) - 1, titleCursor + 1);
                Refresh();
            });
            AddCenterButton("Equip Selected", EquipSelectedTitle);
            AddCenterButton("Back", () => { screen = Screen.Home; Refresh(); });
        }

        private void BuildBoards(StringBuilder sb)
        {
            LeaderboardService.RefreshLocalCache();
            sb.AppendLine("Circuit ranking points");
            sb.AppendLine();
            IReadOnlyList<LeaderboardRow> rows = LeaderboardService.GetLeaderboard(LeaderboardCategories.CircuitPoints);
            for (int i = 0; i < rows.Count; i++)
            {
                string you = rows[i].IsLocalPlayer ? " (you)" : string.Empty;
                sb.AppendLine($"{i + 1}. {rows[i].DisplayName}{you} — {rows[i].Score} RP");
            }

            AddCenterButton("Back", () => { screen = Screen.Home; Refresh(); });
        }

        private void EnterEvent(string eventId)
        {
            if (partyIds.Count == 0 && MonsterCollectionService.ActiveMonster != null)
            {
                partyIds.Add(MonsterCollectionService.ActiveMonster.Id);
            }

            CircuitEnterResult result = TournamentService.TryEnter(partyIds, eventId);
            status = result.Message;
            screen = Screen.Home;
            GameFeedbackService.Instance?.PlayUiTap();
            Refresh();
        }

        private void FightNext()
        {
            if (!TournamentService.TryLaunchPendingMatch(out status))
            {
                Refresh();
            }
        }

        private void EquipSelectedTitle()
        {
            CircuitTitleEntry[] titles = CircuitCatalogRegistry.Catalog.Titles;
            if (titles == null || titles.Length == 0)
            {
                return;
            }

            titleCursor = Mathf.Clamp(titleCursor, 0, titles.Length - 1);
            TournamentService.TryEquipTitle(titles[titleCursor].titleId, out status);
            Refresh();
        }

        private void ToggleCurrentMonster()
        {
            IReadOnlyList<MonsterData> monsters = MonsterCollectionService.Monsters;
            if (monsters.Count == 0)
            {
                return;
            }

            monsterCursor = Mathf.Clamp(monsterCursor, 0, monsters.Count - 1);
            string id = monsters[monsterCursor].Id;
            if (partyIds.Contains(id))
            {
                partyIds.Remove(id);
            }
            else if (partyIds.Count < TournamentService.MaxParty)
            {
                partyIds.Add(id);
            }
            else
            {
                status = "Party is full (3).";
            }

            Refresh();
        }

        private string FormatParty()
        {
            if (partyIds.Count == 0)
            {
                return MonsterCollectionService.ActiveMonster != null
                    ? MonsterCollectionService.ActiveMonster.GetDisplayName() + " (active)"
                    : "(empty)";
            }

            var names = new List<string>();
            for (int i = 0; i < partyIds.Count; i++)
            {
                MonsterData monster = MonsterCollectionService.FindById(partyIds[i]);
                names.Add(monster != null ? monster.GetDisplayName() : "?");
            }

            return string.Join(", ", names);
        }

        private static bool Contains(string[] ids, string id)
        {
            if (ids == null)
            {
                return false;
            }

            for (int i = 0; i < ids.Length; i++)
            {
                if (ids[i] == id)
                {
                    return true;
                }
            }

            return false;
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
            Image card = KitUi.Card(transform, 0.16f, 0.06f, 0.84f, 0.94f);

            titleText = KitUi.Label(card.transform, "Title", "Circuit", 34, TextAlignmentOptions.Center, title: true);
            KitUi.Anchor(titleText.rectTransform, 0.06f, 0.88f, 0.94f, 0.98f);

            bodyText = KitUi.ScrollLabel(card.transform, 0.06f, 0.58f, 0.94f, 0.86f, TextAlignmentOptions.Top);
            buttonColumn = KitUi.ButtonColumn(card.transform, 0.18f, 0.06f, 0.82f, 0.56f);
        }

        private void AddCenterButton(string label, Action onClick)
        {
            buttons.Add(KitUi.ColumnButton(buttonColumn, label, onClick));
        }

        private void ClearButtons()
        {
            for (int i = 0; i < buttons.Count; i++)
            {
                if (buttons[i] != null)
                {
                    Destroy(buttons[i].gameObject);
                }
            }

            buttons.Clear();
        }
    }
}
