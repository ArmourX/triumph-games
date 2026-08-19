using System;
using System.Collections.Generic;
using System.Text;
using MonsterCollect.Circuit;
using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Social.Online;
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
        private Text titleText;
        private Text bodyText;
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
                Canvas canvas = FindObjectOfType<Canvas>();
                if (canvas == null)
                {
                    return;
                }

                var go = new GameObject("TournamentHubPanel", typeof(RectTransform), typeof(TournamentHubPanel));
                Transform parent = LandscapePlayFrame.FindContentRoot(canvas) ?? canvas.transform;
                go.transform.SetParent(parent, false);
                panel = go.GetComponent<TournamentHubPanel>();
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
            Font font = MobileGameUiKit.BodyFont;
            Stretch(GetComponent<RectTransform>() ?? gameObject.AddComponent<RectTransform>());

            var dim = CreateImage("Dim", transform, new Color(0f, 0f, 0f, 0.72f));
            Stretch(dim.rectTransform);

            var card = CreateImage("Card", transform, new Color(0.12f, 0.1f, 0.18f, 0.97f));
            card.rectTransform.anchorMin = new Vector2(0.18f, 0.06f);
            card.rectTransform.anchorMax = new Vector2(0.82f, 0.94f);
            card.rectTransform.offsetMin = Vector2.zero;
            card.rectTransform.offsetMax = Vector2.zero;

            titleText = CreateText("Title", transform, font, 32, FontStyle.Bold, TextAnchor.MiddleCenter);
            titleText.rectTransform.anchorMin = new Vector2(0.18f, 0.84f);
            titleText.rectTransform.anchorMax = new Vector2(0.82f, 0.94f);

            var bodyScrollGo = new GameObject("BodyScroll", typeof(RectTransform), typeof(Image), typeof(Mask), typeof(ScrollRect));
            bodyScrollGo.transform.SetParent(transform, false);
            var bodyScrollRect = bodyScrollGo.GetComponent<RectTransform>();
            bodyScrollRect.anchorMin = new Vector2(0.18f, 0.62f);
            bodyScrollRect.anchorMax = new Vector2(0.82f, 0.83f);
            bodyScrollRect.offsetMin = Vector2.zero;
            bodyScrollRect.offsetMax = Vector2.zero;
            bodyScrollGo.GetComponent<Image>().color = new Color(0.08f, 0.06f, 0.14f, 0.55f);
            bodyScrollGo.GetComponent<Mask>().showMaskGraphic = true;

            bodyText = CreateText("Body", bodyScrollGo.transform, font, 18, FontStyle.Normal, TextAnchor.UpperCenter);
            bodyText.horizontalOverflow = HorizontalWrapMode.Wrap;
            bodyText.verticalOverflow = VerticalWrapMode.Overflow;
            bodyText.rectTransform.anchorMin = new Vector2(0f, 1f);
            bodyText.rectTransform.anchorMax = new Vector2(1f, 1f);
            bodyText.rectTransform.pivot = new Vector2(0.5f, 1f);
            bodyText.rectTransform.offsetMin = new Vector2(12f, 0f);
            bodyText.rectTransform.offsetMax = new Vector2(-12f, -8f);
            var bodyFitter = bodyText.gameObject.AddComponent<ContentSizeFitter>();
            bodyFitter.horizontalFit = ContentSizeFitter.FitMode.Unconstrained;
            bodyFitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;
            var bodyScroll = bodyScrollGo.GetComponent<ScrollRect>();
            bodyScroll.content = bodyText.rectTransform;
            bodyScroll.horizontal = false;
            bodyScroll.vertical = true;
            bodyScroll.movementType = ScrollRect.MovementType.Clamped;

            var viewportGo = new GameObject("ButtonViewport", typeof(RectTransform), typeof(Image), typeof(Mask), typeof(ScrollRect));
            viewportGo.transform.SetParent(transform, false);
            var viewportRect = viewportGo.GetComponent<RectTransform>();
            viewportRect.anchorMin = new Vector2(0.28f, 0.10f);
            viewportRect.anchorMax = new Vector2(0.72f, 0.60f);
            viewportRect.offsetMin = Vector2.zero;
            viewportRect.offsetMax = Vector2.zero;
            viewportGo.GetComponent<Image>().color = new Color(0.1f, 0.08f, 0.16f, 0.4f);
            viewportGo.GetComponent<Mask>().showMaskGraphic = false;

            var columnGo = new GameObject("ButtonColumn", typeof(RectTransform), typeof(VerticalLayoutGroup), typeof(ContentSizeFitter));
            columnGo.transform.SetParent(viewportGo.transform, false);
            buttonColumn = columnGo.GetComponent<RectTransform>();
            buttonColumn.anchorMin = new Vector2(0f, 1f);
            buttonColumn.anchorMax = new Vector2(1f, 1f);
            buttonColumn.pivot = new Vector2(0.5f, 1f);
            buttonColumn.offsetMin = Vector2.zero;
            buttonColumn.offsetMax = Vector2.zero;

            var layout = columnGo.GetComponent<VerticalLayoutGroup>();
            layout.spacing = 10f;
            layout.childAlignment = TextAnchor.MiddleCenter;
            layout.childControlHeight = true;
            layout.childControlWidth = true;
            layout.childForceExpandHeight = false;
            layout.childForceExpandWidth = true;
            layout.padding = new RectOffset(10, 10, 10, 10);

            var fitter = columnGo.GetComponent<ContentSizeFitter>();
            fitter.horizontalFit = ContentSizeFitter.FitMode.Unconstrained;
            fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

            var buttonScroll = viewportGo.GetComponent<ScrollRect>();
            buttonScroll.content = buttonColumn;
            buttonScroll.viewport = viewportRect;
            buttonScroll.horizontal = false;
            buttonScroll.vertical = true;
            buttonScroll.movementType = ScrollRect.MovementType.Clamped;
            buttonScroll.scrollSensitivity = 24f;
        }

        private void AddCenterButton(string label, Action onClick)
        {
            var go = new GameObject(label, typeof(RectTransform), typeof(Image), typeof(Button), typeof(LayoutElement));
            go.transform.SetParent(buttonColumn, false);
            go.GetComponent<Image>().color = new Color(0.38f, 0.22f, 0.55f, 1f);
            go.GetComponent<LayoutElement>().preferredHeight = 56f;
            go.GetComponent<LayoutElement>().minHeight = 52f;

            var textGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            textGo.transform.SetParent(go.transform, false);
            Stretch(textGo.GetComponent<RectTransform>());
            var text = textGo.GetComponent<Text>();
            text.font = MobileGameUiKit.BodyFont;
            text.fontSize = 20;
            text.fontStyle = FontStyle.Bold;
            text.alignment = TextAnchor.MiddleCenter;
            text.color = Color.white;
            text.text = label;

            Button button = go.GetComponent<Button>();
            button.onClick.AddListener(() => onClick());
            buttons.Add(button);
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

        private static Image CreateImage(string name, Transform parent, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<Image>();
            image.color = color;
            return image;
        }

        private static Text CreateText(string name, Transform parent, Font font, int size, FontStyle style, TextAnchor align)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent, false);
            var text = go.GetComponent<Text>();
            text.font = font;
            text.fontSize = size;
            text.fontStyle = style;
            text.alignment = align;
            text.color = Color.white;
            var rect = go.GetComponent<RectTransform>();
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            return text;
        }

        private static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }
}
