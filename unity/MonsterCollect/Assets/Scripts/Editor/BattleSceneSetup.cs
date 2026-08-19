#if UNITY_EDITOR
using MonsterCollect.Core;
using MonsterCollect.UI;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace MonsterCollect.Editor
{
    public static class BattleSceneSetup
    {
        private const string ScenePath = "Assets/Scenes/BattleScene.unity";

        [MenuItem("Monster Collect/Setup Battle Scene")]
        public static void SetupScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            Font font = SceneUIBuilder.DefaultFont;

            GameObject canvasGo = SceneUIBuilder.CreateCanvas("Canvas");
            Transform uiRoot = SceneUIBuilder.GetCanvasContentRoot(canvasGo);
            SceneUIBuilder.CreateNavigationBar(canvasGo.transform, GameScenes.Battle);
            PolishPanelsSceneBuilder.CreateSettingsPanel(uiRoot, font);

            var contentGo = SceneUIBuilder.CreateUIObject("Content", uiRoot);
            SceneUIBuilder.StretchBelowNavBar(contentGo.GetComponent<RectTransform>());
            var contentBg = contentGo.AddComponent<Image>();
            contentBg.color = new Color(0.12f, 0.28f, 0.16f, 1f);
            SceneUIBuilder.ApplyContentBackground(contentBg);

            MonsterCardView cardPrefab = CreateCardPrefab(canvasGo.transform, font);
            cardPrefab.gameObject.SetActive(false);

            BattleSetupView setupView = CreateSetupView(contentGo.transform, font, cardPrefab);
            BattleHudView hudView = CreateHudView(contentGo.transform, font);
            BattleVsView vsView = BattleVsView.Create(uiRoot);
            BattleResultView resultView = BattleResultView.Create(uiRoot);

            var controllerGo = new GameObject("BattleSceneController");
            var controller = controllerGo.AddComponent<BattleSceneController>();
            var controllerSo = new SerializedObject(controller);
            controllerSo.FindProperty("setupView").objectReferenceValue = setupView;
            controllerSo.FindProperty("vsView").objectReferenceValue = vsView;
            controllerSo.FindProperty("hudView").objectReferenceValue = hudView;
            controllerSo.FindProperty("resultView").objectReferenceValue = resultView;
            controllerSo.ApplyModifiedPropertiesWithoutUndo();

            if (Object.FindObjectOfType<EventSystem>() == null)
            {
                new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
            }

            Camera mainCam = Camera.main;
            if (mainCam != null)
            {
                mainCam.clearFlags = CameraClearFlags.SolidColor;
                mainCam.backgroundColor = new Color(0.1f, 0.1f, 0.14f);
            }

            System.IO.Directory.CreateDirectory("Assets/Scenes");
            EditorSceneManager.SaveScene(scene, ScenePath);
            GameSceneBuildSettings.RegisterAllScenes();

            Debug.Log($"[BattleSceneSetup] Scene saved to {ScenePath}.");
        }

        private static MonsterCardView CreateCardPrefab(Transform parent, Font font)
        {
            var cardGo = SceneUIBuilder.CreateUIObject("BattleCardTemplate", parent);
            cardGo.GetComponent<RectTransform>().sizeDelta = new Vector2(480f, 220f);
            var cardBg = cardGo.AddComponent<Image>();
            cardBg.color = new Color(0.18f, 0.18f, 0.24f, 0.95f);
            var cardView = cardGo.AddComponent<MonsterCardView>();
            var cardButton = cardGo.AddComponent<Button>();
            cardButton.targetGraphic = cardBg;

            var accentGo = SceneUIBuilder.CreateUIObject("Accent", cardGo.transform);
            var accentRect = accentGo.GetComponent<RectTransform>();
            accentRect.anchorMin = new Vector2(0f, 0.88f);
            accentRect.anchorMax = new Vector2(1f, 1f);
            accentRect.offsetMin = Vector2.zero;
            accentRect.offsetMax = Vector2.zero;
            var accentImage = accentGo.AddComponent<Image>();

            var previewGo = SceneUIBuilder.CreateUIObject("Preview", cardGo.transform);
            var previewRect = previewGo.GetComponent<RectTransform>();
            previewRect.anchorMin = new Vector2(0.04f, 0.22f);
            previewRect.anchorMax = new Vector2(0.36f, 0.86f);
            previewRect.offsetMin = Vector2.zero;
            previewRect.offsetMax = Vector2.zero;
            var previewImage = previewGo.AddComponent<RawImage>();

            var nameGo = SceneUIBuilder.CreateUIObject("Name", cardGo.transform);
            var nameRect = nameGo.GetComponent<RectTransform>();
            nameRect.anchorMin = new Vector2(0.38f, 0.62f);
            nameRect.anchorMax = new Vector2(0.96f, 0.82f);
            nameRect.offsetMin = Vector2.zero;
            nameRect.offsetMax = Vector2.zero;
            var nameText = nameGo.AddComponent<Text>();
            nameText.font = font;
            nameText.fontSize = 28;
            nameText.fontStyle = FontStyle.Bold;
            nameText.color = Color.white;

            var metaGo = SceneUIBuilder.CreateUIObject("Meta", cardGo.transform);
            var metaRect = metaGo.GetComponent<RectTransform>();
            metaRect.anchorMin = new Vector2(0.38f, 0.38f);
            metaRect.anchorMax = new Vector2(0.96f, 0.58f);
            metaRect.offsetMin = Vector2.zero;
            metaRect.offsetMax = Vector2.zero;
            var metaText = metaGo.AddComponent<Text>();
            metaText.font = font;
            metaText.fontSize = 20;
            metaText.color = new Color(0.8f, 0.8f, 0.85f);

            var statsGo = SceneUIBuilder.CreateUIObject("Stats", cardGo.transform);
            var statsRect = statsGo.GetComponent<RectTransform>();
            statsRect.anchorMin = new Vector2(0.04f, 0.06f);
            statsRect.anchorMax = new Vector2(0.96f, 0.22f);
            statsRect.offsetMin = Vector2.zero;
            statsRect.offsetMax = Vector2.zero;
            var statsText = statsGo.AddComponent<Text>();
            statsText.font = font;
            statsText.fontSize = 18;
            statsText.color = new Color(0.85f, 0.85f, 0.9f);

            var badgeGo = SceneUIBuilder.CreateUIObject("ActiveBadge", cardGo.transform);
            var badgeRect = badgeGo.GetComponent<RectTransform>();
            badgeRect.anchorMin = new Vector2(0.72f, 0.88f);
            badgeRect.anchorMax = new Vector2(0.98f, 0.98f);
            badgeRect.offsetMin = Vector2.zero;
            badgeRect.offsetMax = Vector2.zero;
            badgeGo.AddComponent<Image>().color = new Color(1f, 0.85f, 0.2f, 0.95f);
            var badgeLabelGo = SceneUIBuilder.CreateUIObject("Label", badgeGo.transform);
            SceneUIBuilder.StretchFullScreen(badgeLabelGo.GetComponent<RectTransform>());
            var badgeText = badgeLabelGo.AddComponent<Text>();
            badgeText.font = font;
            badgeText.fontSize = 16;
            badgeText.fontStyle = FontStyle.Bold;
            badgeText.alignment = TextAnchor.MiddleCenter;
            badgeText.color = Color.black;
            badgeText.text = "PICK";

            var cardSo = new SerializedObject(cardView);
            cardSo.FindProperty("backgroundImage").objectReferenceValue = cardBg;
            cardSo.FindProperty("accentImage").objectReferenceValue = accentImage;
            cardSo.FindProperty("previewImage").objectReferenceValue = previewImage;
            cardSo.FindProperty("nameText").objectReferenceValue = nameText;
            cardSo.FindProperty("metaText").objectReferenceValue = metaText;
            cardSo.FindProperty("statsText").objectReferenceValue = statsText;
            cardSo.FindProperty("activeBadge").objectReferenceValue = badgeGo;
            cardSo.FindProperty("selectButton").objectReferenceValue = cardButton;
            cardSo.ApplyModifiedPropertiesWithoutUndo();

            return cardView;
        }

        private static BattleSetupView CreateSetupView(Transform parent, Font font, MonsterCardView cardPrefab)
        {
            var root = SceneUIBuilder.CreateUIObject("BattleSetup", parent);
            SceneUIBuilder.StretchFullScreen(root.GetComponent<RectTransform>());
            var setup = root.AddComponent<BattleSetupView>();

            var header = SceneUIBuilder.CreateHeader(root.transform, "Choose Your Fighter", 0.9f, 0.97f);

            var emptyGo = SceneUIBuilder.CreateUIObject("Empty", root.transform);
            var emptyRect = emptyGo.GetComponent<RectTransform>();
            emptyRect.anchorMin = new Vector2(0.1f, 0.45f);
            emptyRect.anchorMax = new Vector2(0.9f, 0.55f);
            emptyRect.offsetMin = Vector2.zero;
            emptyRect.offsetMax = Vector2.zero;
            var emptyText = emptyGo.AddComponent<Text>();
            emptyText.font = font;
            emptyText.fontSize = 30;
            emptyText.alignment = TextAnchor.MiddleCenter;
            emptyText.color = new Color(0.65f, 0.65f, 0.7f);
            emptyText.text = "Capture monsters first, then battle!";

            var scrollGo = SceneUIBuilder.CreateUIObject("PickerScroll", root.transform);
            var scrollRect = scrollGo.GetComponent<RectTransform>();
            scrollRect.anchorMin = new Vector2(0.04f, 0.34f);
            scrollRect.anchorMax = new Vector2(0.96f, 0.88f);
            scrollRect.offsetMin = Vector2.zero;
            scrollRect.offsetMax = Vector2.zero;
            var scroll = scrollGo.AddComponent<ScrollRect>();
            scroll.horizontal = false;
            scroll.vertical = true;

            var viewportGo = SceneUIBuilder.CreateUIObject("Viewport", scrollGo.transform);
            SceneUIBuilder.StretchFullScreen(viewportGo.GetComponent<RectTransform>());
            viewportGo.AddComponent<Mask>().showMaskGraphic = false;
            viewportGo.AddComponent<Image>().color = Color.white;
            scroll.viewport = viewportGo.GetComponent<RectTransform>();

            var gridGo = SceneUIBuilder.CreateUIObject("Grid", viewportGo.transform);
            var gridRect = gridGo.GetComponent<RectTransform>();
            gridRect.anchorMin = new Vector2(0f, 1f);
            gridRect.anchorMax = new Vector2(1f, 1f);
            gridRect.pivot = new Vector2(0.5f, 1f);
            var grid = gridGo.AddComponent<GridLayoutGroup>();
            grid.cellSize = new Vector2(480f, 220f);
            grid.spacing = new Vector2(20f, 20f);
            grid.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            grid.constraintCount = 2;
            gridGo.AddComponent<ContentSizeFitter>().verticalFit = ContentSizeFitter.FitMode.PreferredSize;
            scroll.content = gridRect;

            var wildToggleGo = SceneUIBuilder.CreateUIObject("WildToggle", root.transform);
            var wildToggleRect = wildToggleGo.GetComponent<RectTransform>();
            wildToggleRect.anchorMin = new Vector2(0.06f, 0.24f);
            wildToggleRect.anchorMax = new Vector2(0.94f, 0.3f);
            wildToggleRect.offsetMin = Vector2.zero;
            wildToggleRect.offsetMax = Vector2.zero;
            var wildToggle = wildToggleGo.AddComponent<Toggle>();
            wildToggle.isOn = true;
            var wildBg = wildToggleGo.AddComponent<Image>();
            wildBg.color = new Color(0.16f, 0.16f, 0.22f);
            wildToggle.targetGraphic = wildBg;
            var wildLabelGo = SceneUIBuilder.CreateUIObject("Label", wildToggleGo.transform);
            var wildLabelRect = wildLabelGo.GetComponent<RectTransform>();
            wildLabelRect.anchorMin = new Vector2(0.12f, 0f);
            wildLabelRect.anchorMax = new Vector2(1f, 1f);
            wildLabelRect.offsetMin = Vector2.zero;
            wildLabelRect.offsetMax = Vector2.zero;
            var wildLabel = wildLabelGo.AddComponent<Text>();
            wildLabel.font = font;
            wildLabel.text = "Fight Wild Monster";
            wildLabel.fontSize = 26;
            wildLabel.color = Color.white;
            wildLabel.alignment = TextAnchor.MiddleLeft;

            var dropdownGo = SceneUIBuilder.CreateUIObject("OpponentDropdown", root.transform);
            var dropdownRect = dropdownGo.GetComponent<RectTransform>();
            dropdownRect.anchorMin = new Vector2(0.06f, 0.16f);
            dropdownRect.anchorMax = new Vector2(0.94f, 0.22f);
            dropdownRect.offsetMin = Vector2.zero;
            dropdownRect.offsetMax = Vector2.zero;
            var dropdown = dropdownGo.AddComponent<Dropdown>();

            var hintGo = SceneUIBuilder.CreateUIObject("Hint", root.transform);
            var hintRect = hintGo.GetComponent<RectTransform>();
            hintRect.anchorMin = new Vector2(0.06f, 0.1f);
            hintRect.anchorMax = new Vector2(0.94f, 0.15f);
            hintRect.offsetMin = Vector2.zero;
            hintRect.offsetMax = Vector2.zero;
            var hintText = hintGo.AddComponent<Text>();
            hintText.font = font;
            hintText.fontSize = 20;
            hintText.color = new Color(0.7f, 0.7f, 0.75f);
            hintText.alignment = TextAnchor.MiddleCenter;

            Button startButton = SceneUIBuilder.CreatePrimaryButton(
                root.transform, "StartBattleButton", "Start Battle",
                new Vector2(0.2f, 0.03f), new Vector2(0.8f, 0.09f));

            var setupSo = new SerializedObject(setup);
            setupSo.FindProperty("rootPanel").objectReferenceValue = root;
            setupSo.FindProperty("headerText").objectReferenceValue = header;
            setupSo.FindProperty("emptyText").objectReferenceValue = emptyText;
            setupSo.FindProperty("cardContainer").objectReferenceValue = gridGo.transform;
            setupSo.FindProperty("cardPrefab").objectReferenceValue = cardPrefab;
            setupSo.FindProperty("wildOpponentToggle").objectReferenceValue = wildToggle;
            setupSo.FindProperty("ownedOpponentDropdown").objectReferenceValue = dropdown;
            setupSo.FindProperty("startButton").objectReferenceValue = startButton;
            setupSo.FindProperty("hintText").objectReferenceValue = hintText;
            setupSo.ApplyModifiedPropertiesWithoutUndo();

            return setup;
        }

        private static BattleHudView CreateHudView(Transform parent, Font font)
        {
            var root = SceneUIBuilder.CreateUIObject("BattleHud", parent);
            SceneUIBuilder.StretchFullScreen(root.GetComponent<RectTransform>());
            var arenaHud = root.AddComponent<BattleArenaHud>();
            var hud = root.AddComponent<BattleHudView>();
            root.SetActive(false);

            BattleCombatantView opponentView = CreateArenaFighter(
                root.transform, "OpponentFighter",
                new Vector2(0.52f, 0.38f), new Vector2(0.88f, 0.78f));
            BattleCombatantView playerView = CreateArenaFighter(
                root.transform, "PlayerFighter",
                new Vector2(0.08f, 0.18f), new Vector2(0.42f, 0.58f));

            var logGo = SceneUIBuilder.CreateUIObject("BattleLog", root.transform);
            var logRect = logGo.GetComponent<RectTransform>();
            logRect.anchorMin = new Vector2(0.34f, 0.02f);
            logRect.anchorMax = new Vector2(0.56f, 0.08f);
            logRect.offsetMin = Vector2.zero;
            logRect.offsetMax = Vector2.zero;
            logGo.AddComponent<Image>().color = new Color(0.08f, 0.08f, 0.12f, 0.72f);
            var logTextGo = SceneUIBuilder.CreateUIObject("Text", logGo.transform);
            SceneUIBuilder.StretchFullScreen(logTextGo.GetComponent<RectTransform>());
            var logText = logTextGo.AddComponent<Text>();
            logText.font = font;
            logText.fontSize = 18;
            logText.alignment = TextAnchor.MiddleCenter;
            logText.color = Color.white;

            var turnGo = SceneUIBuilder.CreateUIObject("TurnIndicator", root.transform);
            var turnRect = turnGo.GetComponent<RectTransform>();
            turnRect.anchorMin = new Vector2(0.38f, 0.84f);
            turnRect.anchorMax = new Vector2(0.62f, 0.89f);
            turnRect.offsetMin = Vector2.zero;
            turnRect.offsetMax = Vector2.zero;
            var turnText = turnGo.AddComponent<Text>();
            turnText.font = font;
            turnText.fontSize = 20;
            turnText.fontStyle = FontStyle.Bold;
            turnText.alignment = TextAnchor.MiddleCenter;
            turnText.color = new Color(1f, 0.9f, 0.45f);

            var hudSo = new SerializedObject(hud);
            hudSo.FindProperty("rootPanel").objectReferenceValue = root;
            hudSo.FindProperty("arenaHud").objectReferenceValue = arenaHud;
            hudSo.FindProperty("playerView").objectReferenceValue = playerView;
            hudSo.FindProperty("opponentView").objectReferenceValue = opponentView;
            hudSo.FindProperty("logText").objectReferenceValue = logText;
            hudSo.FindProperty("turnIndicatorText").objectReferenceValue = turnText;
            hudSo.ApplyModifiedPropertiesWithoutUndo();

            return hud;
        }

        private static BattleCombatantView CreateArenaFighter(
            Transform parent, string name, Vector2 anchorMin, Vector2 anchorMax)
        {
            var fighterGo = SceneUIBuilder.CreateUIObject(name, parent);
            var fighterRect = fighterGo.GetComponent<RectTransform>();
            fighterRect.anchorMin = anchorMin;
            fighterRect.anchorMax = anchorMax;
            fighterRect.offsetMin = Vector2.zero;
            fighterRect.offsetMax = Vector2.zero;

            var previewGo = SceneUIBuilder.CreateUIObject("Preview", fighterGo.transform);
            SceneUIBuilder.StretchFullScreen(previewGo.GetComponent<RectTransform>());
            var previewImage = previewGo.AddComponent<RawImage>();

            var view = fighterGo.AddComponent<BattleCombatantView>();
            var viewSo = new SerializedObject(view);
            viewSo.FindProperty("previewImage").objectReferenceValue = previewImage;
            viewSo.ApplyModifiedPropertiesWithoutUndo();

            return view;
        }

        private static BattleCombatantView CreateCombatantPanel(
            Transform parent, Font font, string name, float minY, float maxY, bool isPlayer)
        {
            var panelGo = SceneUIBuilder.CreateUIObject(name, parent);
            var panelRect = panelGo.GetComponent<RectTransform>();
            panelRect.anchorMin = new Vector2(0.04f, minY);
            panelRect.anchorMax = new Vector2(0.96f, maxY);
            panelRect.offsetMin = Vector2.zero;
            panelRect.offsetMax = Vector2.zero;
            panelGo.AddComponent<Image>().color = new Color(0.14f, 0.14f, 0.18f, 0.92f);

            var view = panelGo.AddComponent<BattleCombatantView>();

            var previewGo = SceneUIBuilder.CreateUIObject("Preview", panelGo.transform);
            var previewRect = previewGo.GetComponent<RectTransform>();
            previewRect.anchorMin = new Vector2(0.03f, 0.12f);
            previewRect.anchorMax = new Vector2(0.28f, 0.88f);
            previewRect.offsetMin = Vector2.zero;
            previewRect.offsetMax = Vector2.zero;
            var previewImage = previewGo.AddComponent<RawImage>();

            BattleHealthBar healthBar = CreateHealthBar(panelGo.transform, font, 0.3f, 0.98f);

            var metaGo = SceneUIBuilder.CreateUIObject("Meta", panelGo.transform);
            var metaRect = metaGo.GetComponent<RectTransform>();
            metaRect.anchorMin = new Vector2(0.3f, 0.08f);
            metaRect.anchorMax = new Vector2(0.98f, 0.28f);
            metaRect.offsetMin = Vector2.zero;
            metaRect.offsetMax = Vector2.zero;
            var metaText = metaGo.AddComponent<Text>();
            metaText.font = font;
            metaText.fontSize = 20;
            metaText.alignment = TextAnchor.MiddleLeft;
            metaText.color = new Color(0.75f, 0.75f, 0.8f);

            var typeGo = SceneUIBuilder.CreateUIObject("Type", panelGo.transform);
            var typeRect = typeGo.GetComponent<RectTransform>();
            typeRect.anchorMin = new Vector2(0.3f, 0.82f);
            typeRect.anchorMax = new Vector2(0.55f, 0.95f);
            typeRect.offsetMin = Vector2.zero;
            typeRect.offsetMax = Vector2.zero;
            var typeText = typeGo.AddComponent<Text>();
            typeText.font = font;
            typeText.fontSize = 18;
            typeText.fontStyle = FontStyle.Bold;
            typeText.alignment = TextAnchor.MiddleLeft;
            typeText.color = new Color(0.55f, 0.85f, 1f);

            var statusGo = SceneUIBuilder.CreateUIObject("Status", panelGo.transform);
            var statusRect = statusGo.GetComponent<RectTransform>();
            statusRect.anchorMin = new Vector2(0.56f, 0.82f);
            statusRect.anchorMax = new Vector2(0.98f, 0.95f);
            statusRect.offsetMin = Vector2.zero;
            statusRect.offsetMax = Vector2.zero;
            var statusText = statusGo.AddComponent<Text>();
            statusText.font = font;
            statusText.fontSize = 16;
            statusText.alignment = TextAnchor.MiddleRight;
            statusText.color = new Color(1f, 0.75f, 0.55f);

            var viewSo = new SerializedObject(view);
            viewSo.FindProperty("previewImage").objectReferenceValue = previewImage;
            viewSo.FindProperty("healthBar").objectReferenceValue = healthBar;
            viewSo.FindProperty("metaText").objectReferenceValue = metaText;
            viewSo.FindProperty("typeText").objectReferenceValue = typeText;
            viewSo.FindProperty("statusText").objectReferenceValue = statusText;
            viewSo.ApplyModifiedPropertiesWithoutUndo();

            _ = isPlayer;
            return view;
        }

        private static BattleHealthBar CreateHealthBar(Transform parent, Font font, float minX, float maxX)
        {
            var barGo = SceneUIBuilder.CreateUIObject("HealthBar", parent);
            var barRect = barGo.GetComponent<RectTransform>();
            barRect.anchorMin = new Vector2(minX, 0.55f);
            barRect.anchorMax = new Vector2(maxX, 0.82f);
            barRect.offsetMin = Vector2.zero;
            barRect.offsetMax = Vector2.zero;

            var nameGo = SceneUIBuilder.CreateUIObject("Name", barGo.transform);
            var nameRect = nameGo.GetComponent<RectTransform>();
            nameRect.anchorMin = new Vector2(0f, 0.55f);
            nameRect.anchorMax = new Vector2(1f, 1f);
            nameRect.offsetMin = Vector2.zero;
            nameRect.offsetMax = Vector2.zero;
            var nameText = nameGo.AddComponent<Text>();
            nameText.font = font;
            nameText.fontSize = 26;
            nameText.fontStyle = FontStyle.Bold;
            nameText.color = Color.white;
            nameText.alignment = TextAnchor.MiddleLeft;

            var bgGo = SceneUIBuilder.CreateUIObject("BarBg", barGo.transform);
            var bgRect = bgGo.GetComponent<RectTransform>();
            bgRect.anchorMin = new Vector2(0f, 0.15f);
            bgRect.anchorMax = new Vector2(0.82f, 0.5f);
            bgRect.offsetMin = Vector2.zero;
            bgRect.offsetMax = Vector2.zero;
            bgGo.AddComponent<Image>().color = new Color(0.08f, 0.08f, 0.1f);

            var fillGo = SceneUIBuilder.CreateUIObject("Fill", bgGo.transform);
            SceneUIBuilder.StretchFullScreen(fillGo.GetComponent<RectTransform>());
            var fillImage = fillGo.AddComponent<Image>();
            fillImage.color = new Color(0.2f, 0.78f, 0.4f);
            fillImage.type = Image.Type.Filled;
            fillImage.fillMethod = Image.FillMethod.Horizontal;

            var hpGo = SceneUIBuilder.CreateUIObject("HpText", barGo.transform);
            var hpRect = hpGo.GetComponent<RectTransform>();
            hpRect.anchorMin = new Vector2(0.84f, 0.1f);
            hpRect.anchorMax = new Vector2(1f, 0.55f);
            hpRect.offsetMin = Vector2.zero;
            hpRect.offsetMax = Vector2.zero;
            var hpText = hpGo.AddComponent<Text>();
            hpText.font = font;
            hpText.fontSize = 20;
            hpText.alignment = TextAnchor.MiddleRight;
            hpText.color = Color.white;

            var healthBar = barGo.AddComponent<BattleHealthBar>();
            var barSo = new SerializedObject(healthBar);
            barSo.FindProperty("fillImage").objectReferenceValue = fillImage;
            barSo.FindProperty("nameText").objectReferenceValue = nameText;
            barSo.FindProperty("hpText").objectReferenceValue = hpText;
            barSo.ApplyModifiedPropertiesWithoutUndo();

            return healthBar;
        }

        private static Button CreateActionButton(
            Transform parent, Font font, string name, string label, float minX, float maxX)
        {
            var buttonGo = SceneUIBuilder.CreateUIObject(name, parent);
            var buttonRect = buttonGo.GetComponent<RectTransform>();
            buttonRect.anchorMin = new Vector2(minX, 0.06f);
            buttonRect.anchorMax = new Vector2(maxX, 0.22f);
            buttonRect.offsetMin = Vector2.zero;
            buttonRect.offsetMax = Vector2.zero;
            var buttonImage = buttonGo.AddComponent<Image>();
            buttonImage.color = new Color(0.18f, 0.48f, 0.82f, 0.95f);
            var button = buttonGo.AddComponent<Button>();

            var labelGo = SceneUIBuilder.CreateUIObject("Label", buttonGo.transform);
            SceneUIBuilder.StretchFullScreen(labelGo.GetComponent<RectTransform>());
            var labelText = labelGo.AddComponent<Text>();
            labelText.font = font;
            labelText.fontSize = 30;
            labelText.fontStyle = FontStyle.Bold;
            labelText.alignment = TextAnchor.MiddleCenter;
            labelText.color = Color.white;
            labelText.text = label;

            return button;
        }
    }
}
#endif
