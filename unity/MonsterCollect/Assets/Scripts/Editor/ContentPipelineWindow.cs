using MonsterCollect.Appearance;
using MonsterCollect.Battle;
using MonsterCollect.Events;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using MonsterCollect.Ranch;
using UnityEditor;
using UnityEngine;

namespace MonsterCollect.Editor
{
    /// <summary>
    /// Central hub for designers to generate catalogs, create assets, and validate IDs.
    /// Open via Monster Collect → Content Pipeline Window.
    /// </summary>
    public class ContentPipelineWindow : EditorWindow
    {
        private int selectedTab;
        private readonly string[] tabLabels = { "Overview", "Parts", "Moves", "Items", "Species", "Config" };
        private Vector2 scroll;
        private string validationResult = string.Empty;

        [MenuItem("Monster Collect/Content Pipeline Window")]
        public static void Open()
        {
            GetWindow<ContentPipelineWindow>("Content Pipeline");
        }

        private void OnGUI()
        {
            selectedTab = GUILayout.Toolbar(selectedTab, tabLabels);
            scroll = EditorGUILayout.BeginScrollView(scroll);

            switch (selectedTab)
            {
                case 0: DrawOverview(); break;
                case 1: DrawParts(); break;
                case 2: DrawMoves(); break;
                case 3: DrawItems(); break;
                case 4: DrawSpecies(); break;
                case 5: DrawConfig(); break;
            }

            EditorGUILayout.EndScrollView();
        }

        private void DrawOverview()
        {
            EditorGUILayout.LabelField("Content Pipeline", EditorStyles.boldLabel);
            EditorGUILayout.HelpBox(
                "All gameplay content loads from ScriptableObjects under Assets/Resources/.\n" +
                "Runtime factories provide fallback defaults when assets are missing.\n\n" +
                "Workflow: Generate defaults → edit assets → Validate All → Play.",
                MessageType.Info);

            if (GUILayout.Button("Generate ALL Default Catalogs"))
            {
                MonsterPartCatalogGenerator.GenerateDefaultCatalog();
                BattleMoveCatalogGenerator.Generate();
                RanchContentCatalogGenerator.Generate();
                ProgressionCatalogGenerator.Generate();
                SpeciesCatalogGenerator.Generate();
                SeasonalEventCatalogGenerator.GenerateCatalog();
                EvolutionCatalogGenerator.Generate();
                validationResult = "All default catalogs regenerated.";
            }

            if (GUILayout.Button("Validate All Content References"))
            {
                validationResult = ContentValidationUtility.ValidateAll();
            }

            if (!string.IsNullOrEmpty(validationResult))
            {
                EditorGUILayout.Space();
                EditorGUILayout.LabelField("Result", EditorStyles.boldLabel);
                EditorGUILayout.TextArea(validationResult, GUILayout.MinHeight(120));
            }
        }

        private void DrawParts()
        {
            EditorGUILayout.LabelField("Body Parts / Visual Variants", EditorStyles.boldLabel);
            EditorGUILayout.HelpBox(
                "Create Monster Collect → Part Variant assets, then add them to MonsterPartCatalog.\n" +
                "VariantId must be unique. Use Shape for procedural art or SpriteOverride for hand-made sprites.",
                MessageType.None);

            if (GUILayout.Button("Generate Default Part Catalog"))
            {
                MonsterPartCatalogGenerator.GenerateDefaultCatalog();
            }

            if (GUILayout.Button("Create New Part Variant Asset"))
            {
                CreateAsset<MonsterPartVariantDefinition>("Assets/Resources/MonsterAppearance/Variants/NewPartVariant.asset");
            }

            DrawSelectButton<MonsterPartCatalog>("Assets/Resources/MonsterAppearance/MonsterPartCatalog.asset");
        }

        private void DrawMoves()
        {
            EditorGUILayout.LabelField("Battle Moves", EditorStyles.boldLabel);
            EditorGUILayout.HelpBox(
                "Moves live in Assets/Resources/Battle/Moves/ and are listed in BattleMoveCatalog.\n" +
                "MoveId is referenced by species definitions and learned-move rewards.",
                MessageType.None);

            if (GUILayout.Button("Generate Default Move Catalog"))
            {
                BattleMoveCatalogGenerator.Generate();
            }

            if (GUILayout.Button("Create New Move Asset"))
            {
                CreateAsset<BattleMoveDefinition>("Assets/Resources/Battle/Moves/new_move.asset");
            }

            DrawSelectButton<BattleMoveCatalog>("Assets/Resources/Battle/BattleMoveCatalog.asset");
        }

        private void DrawItems()
        {
            EditorGUILayout.LabelField("Ranch Items", EditorStyles.boldLabel);
            EditorGUILayout.HelpBox(
                "Items are referenced by quests, shop offers, and inventory drops.\n" +
                "ItemId must match across RanchItemCatalog, quests, and shop.",
                MessageType.None);

            if (GUILayout.Button("Generate Default Ranch Content (items, facilities, errantry)"))
            {
                RanchContentCatalogGenerator.Generate();
            }

            if (GUILayout.Button("Create New Ranch Item"))
            {
                CreateAsset<RanchItemDefinition>("Assets/Resources/Ranch/Items/new_item.asset");
            }

            DrawSelectButton<RanchItemCatalog>("Assets/Resources/Ranch/RanchItemCatalog.asset");
        }

        private void DrawSpecies()
        {
            EditorGUILayout.LabelField("Species & Type Combinations", EditorStyles.boldLabel);
            EditorGUILayout.HelpBox(
                "SpeciesDefinition maps species → primary/secondary moves and default affinities.\n" +
                "TypeCombinationDefinition tunes cross-species breeding outcomes.",
                MessageType.None);

            if (GUILayout.Button("Generate Default Species Catalogs"))
            {
                SpeciesCatalogGenerator.Generate();
            }

            if (GUILayout.Button("Create New Species Definition"))
            {
                CreateAsset<SpeciesDefinition>("Assets/Resources/Monster/Species/NewSpecies.asset");
            }

            if (GUILayout.Button("Create New Type Combination"))
            {
                CreateAsset<TypeCombinationDefinition>("Assets/Resources/Monster/NewTypeCombination.asset");
            }

            DrawSelectButton<SpeciesCatalog>("Assets/Resources/Monster/SpeciesCatalog.asset");
            DrawSelectButton<TypeCombinationCatalog>("Assets/Resources/Monster/TypeCombinationCatalog.asset");
        }

        private void DrawConfig()
        {
            EditorGUILayout.LabelField("Remote Config & Live Ops", EditorStyles.boldLabel);
            EditorGUILayout.HelpBox(
                "Bundled defaults: Assets/Resources/Config/remote_config.json\n" +
                "Runtime override: {persistentDataPath}/remote_config_override.json\n\n" +
                "Tune rarity weights, energy costs, battle rewards, and limited-time events without code changes.",
                MessageType.None);

            DrawSelectButton<TextAsset>("Assets/Resources/Config/remote_config.json");

            if (GUILayout.Button("Reload Remote Config (Play Mode)"))
            {
                if (Application.isPlaying)
                {
                    MonsterCollect.Core.RemoteConfig.RemoteConfigService.Reload();
                    validationResult = "Remote config reloaded in play mode.";
                }
                else
                {
                    validationResult = "Enter Play Mode to reload runtime config.";
                }
            }

            EditorGUILayout.Space();
            EditorGUILayout.LabelField("Seasonal Events", EditorStyles.boldLabel);
            EditorGUILayout.HelpBox(
                "Author events as ScriptableObjects or JSON.\n" +
                "Bundled: Assets/Resources/Config/events.json\n" +
                "Runtime override: {persistentDataPath}/events_override.json\n" +
                "Schedule kinds: FixedUtc, LocalDateRange, RecurringAnnual, AlwaysActive.",
                MessageType.None);

            if (GUILayout.Button("Generate Default Seasonal Event Catalog"))
            {
                SeasonalEventCatalogGenerator.GenerateCatalog();
                validationResult = "Seasonal event catalog generated under Assets/Resources/Events/.";
            }

            if (GUILayout.Button("Export Seasonal Events JSON"))
            {
                SeasonalEventCatalogGenerator.ExportJson();
                validationResult = "Exported events to Assets/Resources/Config/events.json";
            }

            if (GUILayout.Button("Create New Seasonal Event Asset"))
            {
                CreateAsset<SeasonalEventDefinition>("Assets/Resources/Events/NewSeasonalEvent.asset");
            }

            DrawSelectButton<SeasonalEventCatalog>("Assets/Resources/Events/SeasonalEventCatalog.asset");
            DrawSelectButton<TextAsset>("Assets/Resources/Config/events.json");

            if (GUILayout.Button("Reload Events (Play Mode)"))
            {
                if (Application.isPlaying)
                {
                    EventManager.Reload();
                    validationResult = "EventManager reloaded in play mode.";
                }
                else
                {
                    validationResult = "Enter Play Mode to reload events.";
                }
            }
        }

        private static void CreateAsset<T>(string path) where T : ScriptableObject
        {
            EnsureParentFolder(path);
            T asset = ScriptableObject.CreateInstance<T>();
            AssetDatabase.CreateAsset(asset, AssetDatabase.GenerateUniqueAssetPath(path));
            AssetDatabase.SaveAssets();
            Selection.activeObject = asset;
            EditorGUIUtility.PingObject(asset);
        }

        private static void DrawSelectButton<T>(string path) where T : Object
        {
            T asset = AssetDatabase.LoadAssetAtPath<T>(path);
            EditorGUILayout.BeginHorizontal();
            EditorGUILayout.LabelField(path, EditorStyles.miniLabel);
            GUI.enabled = asset != null;
            if (GUILayout.Button("Select", GUILayout.Width(70)))
            {
                Selection.activeObject = asset;
                EditorGUIUtility.PingObject(asset);
            }

            GUI.enabled = true;
            EditorGUILayout.EndHorizontal();
        }

        private static void EnsureParentFolder(string assetPath)
        {
            string directory = System.IO.Path.GetDirectoryName(assetPath);
            if (!string.IsNullOrEmpty(directory) && !AssetDatabase.IsValidFolder(directory))
            {
                System.IO.Directory.CreateDirectory(directory);
                AssetDatabase.Refresh();
            }
        }
    }
}
