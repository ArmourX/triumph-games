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
    /// <summary>Overlay for inventory, errantry, facilities, and ranch customization.</summary>
    [DisallowMultipleComponent]
    public class RanchSystemsPanel : MonoBehaviour
    {
        public static RanchSystemsPanel Instance { get; private set; }

        private enum Tab
        {
            Explore,
            Inventory,
            Craft,
            Errantry,
            Facilities,
            Customize
        }

        [SerializeField] private GameObject rootPanel;
        [SerializeField] private Text titleText;
        [SerializeField] private Text bodyText;
        [SerializeField] private Text footerText;
        [SerializeField] private Button closeButton;

        private Tab currentTab = Tab.Explore;
        private bool uiBuilt;
        private readonly List<Button> tabButtons = new List<Button>();
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
            RanchSystemsPanel panel = Instance ?? FindObjectOfType<RanchSystemsPanel>(true);
            if (panel == null)
            {
                var canvas = FindObjectOfType<Canvas>();
                if (canvas == null)
                {
                    return;
                }

                var go = new GameObject("RanchSystemsPanel", typeof(RectTransform), typeof(RanchSystemsPanel));
                Transform parent = LandscapePlayFrame.FindContentRoot(canvas) ?? canvas.transform;
                go.transform.SetParent(parent, false);
                panel = go.GetComponent<RanchSystemsPanel>();
            }

            panel.Show();
        }

        public void Show()
        {
            EnsureUi();
            PlayerInventoryService.GrantStarterPackIfNeeded();
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

            var dim = CreateImageChild("Dim", transform);
            UiSkinUtility.ApplyDimOverlay(dim);
            Stretch(dim.rectTransform);

            var card = CreateImageChild("Card", transform);
            UiSkinUtility.ApplyModalPanel(card);
            var cardRect = card.rectTransform;
            cardRect.anchorMin = new Vector2(0.04f, 0.06f);
            cardRect.anchorMax = new Vector2(0.96f, 0.94f);
            cardRect.offsetMin = Vector2.zero;
            cardRect.offsetMax = Vector2.zero;

            if (rootPanel == null)
            {
                rootPanel = gameObject;
            }

            var rect = GetComponent<RectTransform>() ?? gameObject.AddComponent<RectTransform>();
            Stretch(rect);

            titleText = CreateText("Title", card.transform, 34, FontStyle.Bold, TextAnchor.UpperCenter, title: true);
            StretchTop(titleText.rectTransform, 0.88f, 0.98f);

            bodyText = CreateText("Body", card.transform, 22, FontStyle.Normal, TextAnchor.UpperLeft);
            bodyText.rectTransform.anchorMin = new Vector2(0.05f, 0.28f);
            bodyText.rectTransform.anchorMax = new Vector2(0.95f, 0.86f);
            bodyText.rectTransform.offsetMin = Vector2.zero;
            bodyText.rectTransform.offsetMax = Vector2.zero;
            bodyText.horizontalOverflow = HorizontalWrapMode.Wrap;
            bodyText.verticalOverflow = VerticalWrapMode.Overflow;

            footerText = CreateText("Footer", card.transform, 20, FontStyle.Italic, TextAnchor.LowerLeft);
            StretchBottom(footerText.rectTransform, 0.02f, 0.12f);
            UiSkinUtility.StyleMuted(footerText);

            var tabRow = CreateRow("Tabs", card.transform);
            tabRow.anchorMin = new Vector2(0.04f, 0.14f);
            tabRow.anchorMax = new Vector2(0.96f, 0.24f);
            tabRow.offsetMin = Vector2.zero;
            tabRow.offsetMax = Vector2.zero;

            AddTab(tabRow, "Explore", Tab.Explore, 0f, 0.165f);
            AddTab(tabRow, "Items", Tab.Inventory, 0.17f, 0.335f);
            AddTab(tabRow, "Craft", Tab.Craft, 0.34f, 0.505f);
            AddTab(tabRow, "Errantry", Tab.Errantry, 0.51f, 0.675f);
            AddTab(tabRow, "Facilities", Tab.Facilities, 0.68f, 0.845f);
            AddTab(tabRow, "Decorate", Tab.Customize, 0.85f, 1f);

            var actionRow = CreateRow("Actions", card.transform);
            actionRow.anchorMin = new Vector2(0.04f, 0.24f);
            actionRow.anchorMax = new Vector2(0.96f, 0.28f);
            actionRow.offsetMin = Vector2.zero;
            actionRow.offsetMax = Vector2.zero;

            closeButton = CreateButton("Close", card.transform, "Close", Hide, 0.82f, 0.98f, 0.02f, 0.12f, secondary: true);
        }

        private void AddTab(RectTransform parent, string label, Tab tab, float minX, float maxX)
        {
            var btn = CreateButton(label, parent, label, () => SelectTab(tab), minX, maxX, 0f, 1f, secondary: false);
            tabButtons.Add(btn);
            var image = btn.GetComponent<Image>();
            if (image != null)
            {
                UiSkinUtility.ApplyTabButton(image, currentTab == tab);
            }
        }

        private void SelectTab(Tab tab)
        {
            currentTab = tab;
            Refresh();
        }

        public void Refresh()
        {
            EnsureUi();
            ClearActionButtons();

            if (titleText != null)
            {
                titleText.text = currentTab switch
                {
                    Tab.Explore => "Ranch Exploration",
                    Tab.Inventory => "Ranch Inventory",
                    Tab.Craft => "Crafting Workshop",
                    Tab.Errantry => "Errantry / Adventures",
                    Tab.Facilities => "Training Facilities",
                    Tab.Customize => "Ranch Customization",
                    _ => "Ranch Systems"
                };
            }

            switch (currentTab)
            {
                case Tab.Explore:
                    RefreshExplore();
                    break;
                case Tab.Inventory:
                    RefreshInventory();
                    break;
                case Tab.Craft:
                    RefreshCraft();
                    break;
                case Tab.Errantry:
                    RefreshErrantry();
                    break;
                case Tab.Facilities:
                    RefreshFacilities();
                    break;
                case Tab.Customize:
                    RefreshCustomize();
                    break;
            }
        }

        private void RefreshExplore()
        {
            MonsterCollectionService.EnsureExplorationLoaded();
            MonsterData active = MonsterCollectionService.ActiveMonster;
            var builder = new StringBuilder();

            builder.AppendLine(WorldCycleService.GetSummary());
            builder.AppendLine($"Training x{WorldCycleService.GetTrainingSuccessMultiplier():0.##} · Rewards x{WorldCycleService.GetExplorationRewardMultiplier():0.##} · Wild x{WorldCycleService.GetWildEncounterMultiplier():0.##}");
            builder.AppendLine($"Rank: {TrainerProgressionService.CurrentRank?.DisplayName ?? "Novice"}");
            builder.AppendLine();

            IReadOnlyList<RanchBiomeEntry> biomes = RanchBiomeService.GetUnlockedBiomes();
            builder.AppendLine($"Unlocked areas ({biomes.Count}):");
            for (int i = 0; i < biomes.Count; i++)
            {
                RanchBiomeEntry biome = biomes[i];
                builder.AppendLine($"• {biome.displayName}");
            }

            builder.AppendLine();
            builder.AppendLine("Zones:");
            IReadOnlyList<ExplorationZoneEntry> zones = RanchBiomeService.GetAvailableZones();
            if (zones.Count == 0)
            {
                builder.AppendLine("No zones available — rank up to unlock biomes.");
            }
            else
            {
                for (int i = 0; i < zones.Count; i++)
                {
                    ExplorationZoneEntry zone = zones[i];
                    builder.AppendLine($"• {zone.displayName} — Lv{zone.minMonsterLevel}+, {zone.durationHours:0.##}h");
                    builder.AppendLine($"  {zone.description}");
                }
            }

            if (active?.Raising != null && active.Raising.isOnExploration)
            {
                double utc = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                builder.AppendLine();
                builder.AppendLine($"Status: {active.GetDisplayName()} is exploring.");
                builder.AppendLine(ErrantryService.FormatRemainingTime(
                    ExplorationService.GetRemainingSeconds(active, utc)));
            }

            if (ExplorationService.HasPendingWildBattle)
            {
                builder.AppendLine();
                builder.AppendLine("⚠ Wild monster waiting — fight for bonus rewards!");
            }

            bodyText.text = builder.ToString();
            footerText.text = active != null
                ? MonsterRaisingService.GetCareStatusMessage(active)
                : "Set an active monster to explore.";

            var actionRow = transform.Find("Card/Actions");
            if (actionRow == null)
            {
                return;
            }

            CreateActionButton(actionRow, "Adventure Hub", AdventureHubPanel.ShowPanel, 0.25f, 0.75f);

            if (ExplorationService.HasPendingWildBattle)
            {
                CreateActionButton(actionRow, "Wild Fight!", LaunchWildBattle, 0f, 0.48f);
            }

            if (active == null)
            {
                return;
            }

            if (active.Raising.isOnExploration)
            {
                CreateActionButton(actionRow, "Check Return", () => CheckExplorationReturn(active), 0.52f, 0.98f);
                return;
            }

            if (LifespanRetirementService.IsUnavailableForActivities(active))
            {
                return;
            }

            int shown = ExplorationService.HasPendingWildBattle ? 1 : 0;
            for (int i = 0; i < zones.Count && shown < 4; i++)
            {
                ExplorationZoneEntry zone = zones[i];
                string zoneId = zone.zoneId;
                string label = zone.displayName.Split(' ')[0];
                float width = ExplorationService.HasPendingWildBattle ? 0.16f : 0.24f;
                float min = shown * width + (ExplorationService.HasPendingWildBattle ? 0.52f : 0f);
                float max = min + width - 0.02f;
                CreateActionButton(actionRow, label, () => StartExploration(active, zoneId), min, max);
                shown++;
            }
        }

        private void StartExploration(MonsterData monster, string zoneId)
        {
            double utc = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            ExplorationStartResult result = ExplorationService.TryStart(monster, zoneId, utc);
            footerText.text = result.Message;
            footerText.color = result.Success
                ? new Color(0.7f, 0.95f, 0.75f)
                : new Color(0.95f, 0.55f, 0.55f);

            if (result.Success)
            {
                MonsterCollectionService.UpdateMonster(monster);
            }

            Refresh();
        }

        private void CheckExplorationReturn(MonsterData monster)
        {
            double utc = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            ExplorationReturnResult result = ExplorationService.ProcessReturn(monster, utc);
            if (result.Returned)
            {
                footerText.text = result.Message;
                footerText.color = new Color(0.7f, 0.95f, 0.75f);
            }
            else
            {
                double remaining = ExplorationService.GetRemainingSeconds(monster, utc);
                footerText.text = remaining > 0d
                    ? ErrantryService.FormatRemainingTime(remaining)
                    : "Still exploring…";
            }

            MonsterCollectionService.UpdateMonster(monster);
            Refresh();
        }

        private void LaunchWildBattle()
        {
            if (!ExplorationService.TryLaunchPendingWildBattle(out string message))
            {
                footerText.text = message;
                footerText.color = new Color(0.95f, 0.55f, 0.55f);
                Refresh();
            }
        }

        private void RefreshCraft()
        {
            var builder = new StringBuilder();
            builder.AppendLine($"Essence: {MonsterCollectionService.RanchEssence}");
            builder.AppendLine($"Rank: {TrainerProgressionService.CurrentRank?.DisplayName ?? "Novice"}");
            builder.AppendLine();
            builder.AppendLine("Gather materials from exploration, then craft food and items.");
            builder.AppendLine();

            CraftingRecipeEntry[] recipes = RanchCatalogRegistry.Crafting.Recipes;
            if (recipes == null || recipes.Length == 0)
            {
                builder.AppendLine("No recipes available.");
            }
            else
            {
                int rank = TrainerProgressionService.RankIndex;
                for (int i = 0; i < recipes.Length; i++)
                {
                    CraftingRecipeEntry recipe = recipes[i];
                    if (recipe == null)
                    {
                        continue;
                    }

                    bool unlocked = recipe.requiredTrainerRankIndex <= rank;
                    builder.AppendLine($"{recipe.displayName} {(unlocked ? "" : "🔒")}");
                    builder.AppendLine($"  → {FormatItemName(recipe.outputItemId)}");

                    if (recipe.essenceCost > 0)
                    {
                        builder.AppendLine($"  Cost: {recipe.essenceCost} essence");
                    }

                    if (recipe.ingredients != null && recipe.ingredients.Length > 0)
                    {
                        var parts = new List<string>();
                        for (int j = 0; j < recipe.ingredients.Length; j++)
                        {
                            CraftingIngredientEntry ing = recipe.ingredients[j];
                            if (ing == null || string.IsNullOrEmpty(ing.itemId))
                            {
                                continue;
                            }

                            int owned = PlayerInventoryService.GetQuantity(ing.itemId);
                            parts.Add($"{FormatItemName(ing.itemId)} {owned}/{ing.quantity}");
                        }

                        builder.AppendLine($"  Needs: {string.Join(", ", parts)}");
                    }

                    builder.AppendLine();
                }
            }

            bodyText.text = builder.ToString();
            footerText.text = "Crafted items feed into raising, battles, and ranch decor.";

            var actionRow = transform.Find("Card/Actions");
            if (actionRow == null || recipes == null)
            {
                return;
            }

            int rankIndex = TrainerProgressionService.RankIndex;
            int shown = 0;

            for (int i = 0; i < recipes.Length && shown < 4; i++)
            {
                CraftingRecipeEntry recipe = recipes[i];
                if (recipe == null || recipe.requiredTrainerRankIndex > rankIndex)
                {
                    continue;
                }

                string recipeId = recipe.recipeId;
                string label = recipe.displayName.Split(' ')[0];
                float min = shown * 0.25f;
                CreateActionButton(actionRow, label, () => CraftRecipe(recipeId), min, min + 0.24f);
                shown++;
            }
        }

        private static string FormatItemName(string itemId)
        {
            RanchItemDefinition def = PlayerInventoryService.GetDefinition(itemId);
            return def != null ? def.DisplayName : itemId.Replace("mat_", "");
        }

        private void CraftRecipe(string recipeId)
        {
            bool success = CraftingService.TryCraft(recipeId, out string message);
            footerText.text = message;
            footerText.color = success
                ? new Color(0.7f, 0.95f, 0.75f)
                : new Color(0.95f, 0.55f, 0.55f);
            Refresh();
        }

        private void RefreshInventory()
        {
            MonsterData active = MonsterCollectionService.ActiveMonster;
            var builder = new StringBuilder();
            builder.AppendLine($"Care Points: {RanchProgressionService.CarePoints}");
            builder.AppendLine();

            IReadOnlyList<InventoryEntry> entries = PlayerInventoryService.Entries;
            if (entries.Count == 0)
            {
                builder.AppendLine("No items yet. Explore zones, win battles, or send monsters on errantry.");
            }
            else
            {
                for (int i = 0; i < entries.Count; i++)
                {
                    InventoryEntry entry = entries[i];
                    RanchItemDefinition def = PlayerInventoryService.GetDefinition(entry.itemId);
                    string name = def != null ? def.DisplayName : entry.itemId;
                    builder.AppendLine($"• {name} x{entry.quantity}");
                }
            }

            if (active != null)
            {
                builder.AppendLine();
                builder.AppendLine($"Use on active: {active.Name}");
            }
            else
            {
                builder.AppendLine();
                builder.AppendLine("Set an active monster to use items.");
            }

            bodyText.text = builder.ToString();
            footerText.text = active != null
                ? MonsterPersonalityService.GetDescription(MonsterPersonalityService.Resolve(active))
                : string.Empty;

            if (active == null)
            {
                return;
            }

            var actionRow = transform.Find("Card/Actions");
            if (actionRow == null)
            {
                return;
            }


            int shown = 0;
            for (int i = 0; i < entries.Count && shown < 4; i++)
            {
                InventoryEntry entry = entries[i];
                if (entry.quantity <= 0)
                {
                    continue;
                }

                string itemId = entry.itemId;
                RanchItemDefinition def = PlayerInventoryService.GetDefinition(itemId);
                string label = def != null ? def.DisplayName : itemId;
                float min = shown * 0.25f;
                float max = min + 0.24f;
                CreateActionButton(actionRow, label, () => UseItem(itemId), min, max);
                shown++;
            }
        }

        private void UseItem(string itemId)
        {
            MonsterData active = MonsterCollectionService.ActiveMonster;
            if (active == null)
            {
                footerText.text = "Set an active monster first.";
                return;
            }

            double utc = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            ItemUseResult result = RanchItemUseService.TryUseOnMonster(itemId, active, utc);
            footerText.text = result.Message;
            footerText.color = result.Success
                ? new Color(0.7f, 0.95f, 0.75f)
                : new Color(0.95f, 0.55f, 0.55f);

            if (result.Success)
            {
                MonsterCollectionService.UpdateMonster(active);
            }

            Refresh();
        }

        private void RefreshErrantry()
        {
            MonsterData active = MonsterCollectionService.ActiveMonster;
            var builder = new StringBuilder();
            builder.AppendLine($"Time multiplier: x{GameSettings.ErrantryTimeMultiplier:0.##} (dev setting)");
            builder.AppendLine();

            ErrantryMissionDefinition[] missions = RanchCatalogRegistry.Errantry.Missions;
            if (missions != null)
            {
                for (int i = 0; i < missions.Length; i++)
                {
                    ErrantryMissionDefinition mission = missions[i];
                    if (mission == null)
                    {
                        continue;
                    }

                    builder.AppendLine($"{mission.DisplayName} — Lv{mission.MinLevel}+, {mission.DurationHours}h");
                    builder.AppendLine($"  {mission.Description}");
                }
            }

            if (active?.Raising != null && active.Raising.isOnErrantry)
            {
                double utc = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                builder.AppendLine();
                builder.AppendLine($"Status: {active.Name} is away.");
                builder.AppendLine(ErrantryService.FormatRemainingTime(
                    ErrantryService.GetRemainingSeconds(active, utc)));
            }

            bodyText.text = builder.ToString();
            footerText.text = active != null ? MonsterRaisingService.GetCareStatusMessage(active) : "Set active monster.";

            var actionRow = transform.Find("Card/Actions");
            if (actionRow == null || active == null)
            {
                return;
            }

            if (active.Raising.isOnErrantry)
            {
                CreateActionButton(actionRow, "Check Return", () => CheckErrantryReturn(active), 0f, 0.48f);
            }
            else if (!LifespanRetirementService.IsRetired(active))
            {
                if (missions != null)
                {
                    for (int i = 0; i < missions.Length && i < 3; i++)
                    {
                        ErrantryMissionDefinition mission = missions[i];
                        if (mission == null)
                        {
                            continue;
                        }

                        string missionId = mission.MissionId;
                        float min = i * 0.33f;
                        CreateActionButton(actionRow, mission.DisplayName.Split(' ')[0], () => StartErrantry(active, missionId), min, min + 0.31f);
                    }
                }
            }

            CreateActionButton(actionRow, "Retire", () => RetireMonster(active), 0.66f, 0.98f);
        }

        private void StartErrantry(MonsterData monster, string missionId)
        {
            double utc = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            ErrantryStartResult result = ErrantryService.TryStart(monster, missionId, utc);
            footerText.text = result.Message;
            if (result.Success)
            {
                MonsterCollectionService.UpdateMonster(monster);
            }

            Refresh();
        }

        private void CheckErrantryReturn(MonsterData monster)
        {
            double utc = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            MonsterRaisingService.SimulateElapsedTime(monster, utc);
            ErrantryReturnResult result = ErrantryService.ProcessReturn(monster, utc);
            footerText.text = result.Returned ? result.Message : "Still away…";
            MonsterCollectionService.UpdateMonster(monster);
            Refresh();
        }

        private void RetireMonster(MonsterData monster)
        {
            RetirementResult result = LifespanRetirementService.TryVoluntaryRetire(monster);
            if (!result.Success && monster.Raising.lifespan <= LifespanRetirementService.MinLifespanToRetireVoluntarily)
            {
                result = LifespanRetirementService.TryRetire(monster);
            }

            footerText.text = result.Message;
            if (result.Success)
            {
                MonsterCollectionService.UpdateMonster(monster);
            }

            Refresh();
        }

        private void RefreshFacilities()
        {
            var builder = new StringBuilder();
            builder.AppendLine($"Care Points: {RanchProgressionService.CarePoints}");
            builder.AppendLine($"Battle Wins: {RanchProgressionService.GetTotalBattleWins()}");
            builder.AppendLine();

            RanchFacilityDefinition[] facilities = RanchCatalogRegistry.Facilities.Facilities;
            MonsterData active = MonsterCollectionService.ActiveMonster;

            if (facilities != null)
            {
                for (int i = 0; i < facilities.Length; i++)
                {
                    RanchFacilityDefinition facility = facilities[i];
                    if (facility == null)
                    {
                        continue;
                    }

                    bool unlocked = RanchProgressionService.IsFacilityUnlocked(facility.FacilityId);
                    builder.AppendLine($"{facility.DisplayName} {(unlocked ? "✓" : "🔒")}");
                    builder.AppendLine($"  {facility.Description}");
                    if (!unlocked)
                    {
                        builder.AppendLine($"  Unlock: {facility.RequiredCarePoints} care pts, {facility.RequiredDexUnlocks} dex, {facility.RequiredBattleWins} wins");
                    }
                    else if (active?.Raising != null)
                    {
                        int uses = RanchFacilityService.GetUsesToday(active.Raising, facility.Kind);
                        builder.AppendLine($"  Uses today: {uses}/{facility.MaxUsesPerDay}");
                    }

                    builder.AppendLine();
                }
            }

            bodyText.text = builder.ToString();
            footerText.text = active != null ? $"Active: {active.Name}" : "Set active monster.";

            var actionRow = transform.Find("Card/Actions");
            if (actionRow == null || active == null)
            {
                return;
            }

            if (facilities == null)
            {
                return;
            }

            for (int i = 0; i < facilities.Length && i < 3; i++)
            {
                RanchFacilityDefinition facility = facilities[i];
                if (facility == null || !RanchProgressionService.IsFacilityUnlocked(facility.FacilityId))
                {
                    continue;
                }

                string facilityId = facility.FacilityId;
                float min = i * 0.33f;
                CreateActionButton(actionRow, facility.DisplayName.Split(' ')[0], () => UseFacility(active, facilityId), min, min + 0.31f);
            }
        }

        private void UseFacility(MonsterData monster, string facilityId)
        {
            double utc = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            FacilityUseResult result = RanchFacilityService.TryUse(facilityId, monster, utc);
            footerText.text = result.Message;
            if (result.Success)
            {
                MonsterCollectionService.UpdateMonster(monster);
            }

            Refresh();
        }

        private void RefreshCustomize()
        {
            RanchProgressionState state = RanchProgressionService.State;
            var builder = new StringBuilder();
            CustomizationBonuses bonuses = RanchCustomizationService.GetBonuses();

            builder.AppendLine($"Background: {state.selectedBackgroundId}");
            builder.AppendLine($"Decorations: {(state.placedDecorationIds?.Length ?? 0)}/{RuntimeRanchCustomizationCatalogFactory.MaxDecorations}");
            builder.AppendLine($"Bonuses — Training +{bonuses.TrainingSuccessBonus:P0}, Mood decay -{bonuses.MoodDecayReduction:P0}");
            builder.AppendLine();

            RanchCustomizationCatalog catalog = RanchCatalogRegistry.Customization;

            builder.AppendLine("Backgrounds:");
            if (catalog.Backgrounds != null)
            {
                for (int i = 0; i < catalog.Backgrounds.Length; i++)
                {
                    RanchBackgroundDefinition bg = catalog.Backgrounds[i];
                    if (bg == null)
                    {
                        continue;
                    }

                    builder.AppendLine($"• {bg.DisplayName} ({bg.UnlockCarePoints} pts)");
                }
            }

            builder.AppendLine();
            builder.AppendLine("Decorations:");
            if (catalog.Decorations != null)
            {
                for (int i = 0; i < catalog.Decorations.Length; i++)
                {
                    RanchDecorationDefinition deco = catalog.Decorations[i];
                    if (deco == null)
                    {
                        continue;
                    }

                    builder.AppendLine($"• {deco.DisplayName} — {deco.EssenceCost} essence, {deco.UnlockCarePoints} pts");
                }
            }

            bodyText.text = builder.ToString();
            footerText.text = $"Essence: {MonsterCollectionService.RanchEssence}";

            var actionRow = transform.Find("Card/Actions");
            if (actionRow == null)
            {
                return;
            }

            CreateActionButton(actionRow, "Highlands", () => SelectBg("bg_highlands"), 0f, 0.32f);
            CreateActionButton(actionRow, "Shrine", () => SelectBg("bg_shrine"), 0.34f, 0.66f);
            CreateActionButton(actionRow, "Fountain", () => PlaceDeco("deco_fountain"), 0.68f, 0.98f);
        }

        private void SelectBg(string id)
        {
            footerText.text = RanchCustomizationService.TrySelectBackground(id)
                ? $"Background set to {id}."
                : "Background locked — earn more care points.";
            Refresh();
        }

        private void PlaceDeco(string id)
        {
            footerText.text = RanchCustomizationService.TryPlaceDecoration(id)
                ? $"Placed {id}."
                : "Could not place — check essence, care points, or slot limit.";
            Refresh();
        }

        private void ClearActionButtons()
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

        private void CreateActionButton(Transform parent, string label, Action onClick, float minX, float maxX)
        {
            Button btn = CreateButton(label, parent, label, onClick, minX, maxX, 0f, 1f);
            actionButtons.Add(btn);
        }

        private static RectTransform CreateRow(string name, Transform parent)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            return go.GetComponent<RectTransform>();
        }

        private static T CreateChild<T>(string name, Transform parent) where T : Component
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);

            if (typeof(T) == typeof(RectTransform))
            {
                return go.GetComponent<RectTransform>() as T;
            }

            return go.AddComponent<T>();
        }

        private static UnityEngine.UI.Image CreateImageChild(string name, Transform parent)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(UnityEngine.UI.Image));
            go.transform.SetParent(parent, false);
            return go.GetComponent<UnityEngine.UI.Image>();
        }

        private static Text CreateText(
            string name,
            Transform parent,
            int size,
            FontStyle style,
            TextAnchor anchor,
            bool title = false)
        {
            Text text = UiSkinUtility.CreateText(parent, name, size, style, anchor, title);
            return text;
        }

        private static Button CreateButton(
            string name,
            Transform parent,
            string label,
            Action onClick,
            float anchorMinX,
            float anchorMaxX,
            float anchorMinY,
            float anchorMaxY,
            bool secondary = false)
        {
            return UiSkinUtility.CreateButton(
                parent,
                name,
                label,
                onClick,
                anchorMinX,
                anchorMaxX,
                anchorMinY,
                anchorMaxY,
                secondary);
        }

        private static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private static void StretchTop(RectTransform rect, float minY, float maxY)
        {
            rect.anchorMin = new Vector2(0.05f, minY);
            rect.anchorMax = new Vector2(0.95f, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private static void StretchBottom(RectTransform rect, float minY, float maxY)
        {
            rect.anchorMin = new Vector2(0.05f, minY);
            rect.anchorMax = new Vector2(0.95f, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }
}
