using System;
using System.Collections.Generic;
using System.Text;
using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using MonsterCollect.Ranch;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Centered adventure hub: map, party, logs, encounters, and story.</summary>
    [DisallowMultipleComponent]
    public class AdventureHubPanel : MonoBehaviour
    {
        public static AdventureHubPanel Instance { get; private set; }

        private enum Screen { Home, Map, Party, Log, Story }

        private Screen screen = Screen.Home;
        private bool uiBuilt;
        private GameObject rootPanel;
        private Text titleText;
        private Text bodyText;
        private RectTransform buttonColumn;
        private readonly List<Button> buttons = new List<Button>();
        private readonly List<string> partyIds = new List<string>();
        private int regionIndex;
        private int monsterCursor;
        private string status = string.Empty;

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
            AdventureHubPanel panel = Instance ?? FindObjectOfType<AdventureHubPanel>(true);
            if (panel == null)
            {
                Canvas canvas = FindObjectOfType<Canvas>();
                if (canvas == null)
                {
                    return;
                }

                var go = new GameObject("AdventureHubPanel", typeof(RectTransform), typeof(AdventureHubPanel));
                Transform parent = LandscapePlayFrame.FindContentRoot(canvas) ?? canvas.transform;
                go.transform.SetParent(parent, false);
                panel = go.GetComponent<AdventureHubPanel>();
            }

            panel.Show();
        }

        public void Show()
        {
            EnsureUi();
            AdventureService.EnsureReady();
            AdventureService.ProcessDue(Now());
            RanchBiomeService.RefreshUnlocksFromTrainerRank();
            RanchBiomeService.RefreshUnlocksFromStory();
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
            double utc = Now();
            AdventureService.ProcessDue(utc);

            if (titleText != null)
            {
                titleText.text = "Adventure";
            }

            var sb = new StringBuilder();
            switch (screen)
            {
                case Screen.Map:
                    BuildMap(sb);
                    break;
                case Screen.Party:
                    BuildParty(sb);
                    break;
                case Screen.Log:
                    BuildLog(sb);
                    break;
                case Screen.Story:
                    BuildStory(sb);
                    break;
                default:
                    BuildHome(sb, utc);
                    break;
            }

            if (bodyText != null)
            {
                bodyText.text = sb.ToString();
            }
        }

        private void BuildHome(StringBuilder sb, double utc)
        {
            AdventurePartyState party = AdventureService.Party;
            AdventureStoryBeat beat = AdventureStoryService.CurrentBeat();
            ExplorationZoneEntry zone = SelectedZone();

            sb.AppendLine(beat.Title);
            sb.AppendLine(beat.Body);
            sb.AppendLine();
            if (zone != null)
            {
                sb.AppendLine($"Region: {zone.displayName}  ·  Rec. Lv {zone.recommendedLevel}  ·  {zone.preferredElement}");
                sb.AppendLine($"{zone.durationHours:0.##}h  ·  wild {zone.wildEncounterChance * 100f:0}%");
            }

            sb.AppendLine($"Party: {FormatParty()}");
            if (party.isActive)
            {
                sb.AppendLine(ErrantryService.FormatRemainingTime(AdventureService.GetRemainingSeconds(utc)));
            }
            else if (!string.IsNullOrEmpty(party.lastResultSummary))
            {
                sb.AppendLine(party.lastResultSummary);
            }

            if (party.hasPendingEncounter || AdventureService.Party.hasPendingEncounter)
            {
                sb.AppendLine("Wild encounter waiting!");
            }

            if (!string.IsNullOrEmpty(status))
            {
                sb.AppendLine();
                sb.AppendLine(status);
            }

            AddCenterButton("Map / Regions", () => { screen = Screen.Map; Refresh(); });
            AddCenterButton("Pick Party (1–3)", () => { screen = Screen.Party; Refresh(); });
            AddCenterButton("Depart", Depart);
            AddCenterButton("Check Progress", CheckProgress);
            if (AdventureService.Party.hasPendingEncounter)
            {
                AddCenterButton("Auto Fight", AutoFight);
                AddCenterButton("Control Fight", ControlFight);
            }

            AddCenterButton("Log", () => { screen = Screen.Log; Refresh(); });
            AddCenterButton("Story", () => { screen = Screen.Story; Refresh(); });
            AddCenterButton("Ranch Tools", () =>
            {
                Hide();
                RanchSystemsPanel.ShowPanel();
            });
            AddCenterButton("Close", Hide);
        }

        private void BuildMap(StringBuilder sb)
        {
            IReadOnlyList<ExplorationZoneEntry> zones = RanchBiomeService.GetAvailableZones();
            RanchBiomeEntry[] biomes = RanchCatalogRegistry.Biomes.Biomes;
            sb.AppendLine("Unlock regions by trainer rank or the story thread.");
            sb.AppendLine();
            if (biomes != null)
            {
                for (int i = 0; i < biomes.Length; i++)
                {
                    RanchBiomeEntry biome = biomes[i];
                    bool open = RanchBiomeService.IsBiomeUnlocked(biome.biomeId);
                    sb.AppendLine($"{(open ? "●" : "○")} {biome.displayName}  Lv {biome.recommendedLevel}+  {biome.preferredElement}");
                    sb.AppendLine($"   {biome.description}");
                }
            }

            if (zones.Count == 0)
            {
                sb.AppendLine("No routes open yet.");
            }
            else
            {
                regionIndex = Mathf.Clamp(regionIndex, 0, zones.Count - 1);
                sb.AppendLine();
                sb.AppendLine($"Selected: {zones[regionIndex].displayName}");
            }

            for (int i = 0; i < zones.Count; i++)
            {
                int index = i;
                ExplorationZoneEntry zone = zones[i];
                string mark = index == regionIndex ? "► " : "";
                AddCenterButton($"{mark}{zone.displayName}  Lv {zone.recommendedLevel}", () =>
                {
                    regionIndex = index;
                    screen = Screen.Home;
                    status = $"Ready for {zone.displayName}.";
                    Refresh();
                });
            }

            AddCenterButton("Back", () => { screen = Screen.Home; Refresh(); });
        }

        private void BuildParty(StringBuilder sb)
        {
            IReadOnlyList<MonsterData> monsters = MonsterCollectionService.Monsters;
            sb.AppendLine("Tap to add or remove. Max 3.");
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
                sb.AppendLine($"{current.GetDisplayName()}  Lv {current.Raising?.level ?? 1} {(inParty ? "(in party)" : "")}");
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
            sb.AppendLine("Adventure log (saved offline)");
            sb.AppendLine();
            IReadOnlyList<string> lines = AdventureService.GetLog();
            if (lines.Count == 0)
            {
                sb.AppendLine("No trips recorded yet.");
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

        private void BuildStory(StringBuilder sb)
        {
            IReadOnlyList<AdventureStoryBeat> beats = AdventureStoryService.AllBeats;
            for (int i = 0; i < beats.Count; i++)
            {
                bool done = AdventureStoryService.IsBeatComplete(beats[i].Id);
                sb.AppendLine($"{(done ? "✓" : "•")} {beats[i].Title}");
                sb.AppendLine($"   {beats[i].Body}");
                sb.AppendLine();
            }

            AddCenterButton("Back", () => { screen = Screen.Home; Refresh(); });
        }

        private void Depart()
        {
            ExplorationZoneEntry zone = SelectedZone();
            if (zone == null)
            {
                status = "Pick a region first.";
                Refresh();
                return;
            }

            if (partyIds.Count == 0 && MonsterCollectionService.ActiveMonster != null)
            {
                partyIds.Add(MonsterCollectionService.ActiveMonster.Id);
            }

            AdventureDepartResult result = AdventureService.TryDepart(partyIds, zone.zoneId, Now());
            status = result.Message;
            GameFeedbackService.Instance?.PlayUiTap();
            Refresh();
        }

        private void CheckProgress()
        {
            status = AdventureService.CheckStatus(Now());
            Refresh();
        }

        private void AutoFight()
        {
            AdventureService.TryAutoResolveEncounter(out status);
            Refresh();
        }

        private void ControlFight()
        {
            if (!AdventureService.TryLaunchEncounterBattle(out status))
            {
                Refresh();
            }
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
            else if (partyIds.Count < AdventureService.MaxParty)
            {
                partyIds.Add(id);
            }
            else
            {
                status = "Party is full (3).";
            }

            Refresh();
        }

        private ExplorationZoneEntry SelectedZone()
        {
            IReadOnlyList<ExplorationZoneEntry> zones = RanchBiomeService.GetAvailableZones();
            if (zones.Count == 0)
            {
                return null;
            }

            regionIndex = Mathf.Clamp(regionIndex, 0, zones.Count - 1);
            return zones[regionIndex];
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

        private static double Now() => DateTimeOffset.UtcNow.ToUnixTimeSeconds();

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

            var card = CreateImage("Card", transform, new Color(0.1f, 0.16f, 0.14f, 0.97f));
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
            bodyScrollGo.GetComponent<Image>().color = new Color(0.06f, 0.1f, 0.09f, 0.55f);
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
            viewportGo.GetComponent<Image>().color = new Color(0.08f, 0.14f, 0.12f, 0.4f);
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
            go.GetComponent<Image>().color = new Color(0.18f, 0.42f, 0.38f, 1f);
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
