#if UNITY_EDITOR
using MonsterCollect.Core;
using MonsterCollect.UI;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace MonsterCollect.Editor
{
    /// <summary>Builds the ranch / collection scene.</summary>
    public static class RanchSceneSetup
    {
        private const string ScenePath = "Assets/Scenes/RanchScene.unity";

        [MenuItem("Monster Collect/Setup Ranch Scene")]
        public static void SetupScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            Font font = SceneUIBuilder.DefaultFont;

            GameObject canvasGo = SceneUIBuilder.CreateCanvas("Canvas");
            Transform uiRoot = SceneUIBuilder.GetCanvasContentRoot(canvasGo);
            SceneUIBuilder.CreateNavigationBar(canvasGo.transform, GameScenes.Ranch);

            // Content area below nav bar
            var contentGo = SceneUIBuilder.CreateUIObject("Content", uiRoot);
            SceneUIBuilder.StretchBelowNavBar(contentGo.GetComponent<RectTransform>());
            var contentBg = contentGo.AddComponent<Image>();
            contentBg.color = Color.white;
            SceneUIBuilder.ApplyContentBackground(contentBg);

            Text headerText = SceneUIBuilder.CreateHeader(contentGo.transform, "Home Ranch", 0.90f, 0.98f);

            Button openBreedingButton = SceneUIBuilder.CreatePrimaryButton(contentGo.transform, "BreedButton", "Fusion",
                new Vector2(0.02f, 0.02f), new Vector2(0.20f, 0.12f));

            Button adventureButton = SceneUIBuilder.CreatePrimaryButton(contentGo.transform, "AdventureButton", "Adventure",
                new Vector2(0.22f, 0.02f), new Vector2(0.56f, 0.12f));

            Button socialButton = SceneUIBuilder.CreatePrimaryButton(contentGo.transform, "SocialButton", "Friends",
                new Vector2(0.58f, 0.02f), new Vector2(0.72f, 0.12f));

            Button scanShortcut = SceneUIBuilder.CreatePrimaryButton(contentGo.transform, "ScanShortcut", "Scan QR",
                new Vector2(0.74f, 0.02f), new Vector2(0.98f, 0.12f));

            var countGo = SceneUIBuilder.CreateUIObject("CountText", contentGo.transform);
            var countRect = countGo.GetComponent<RectTransform>();
            countRect.anchorMin = new Vector2(0.74f, 0.90f);
            countRect.anchorMax = new Vector2(0.98f, 0.98f);
            countRect.offsetMin = Vector2.zero;
            countRect.offsetMax = Vector2.zero;
            var countText = countGo.AddComponent<Text>();
            countText.font = font;
            countText.fontSize = 24;
            countText.alignment = TextAnchor.MiddleRight;
            countText.color = new Color(0.75f, 0.75f, 0.8f);
            countText.text = "0/20";

            var emptyGo = SceneUIBuilder.CreateUIObject("EmptyState", contentGo.transform);
            var emptyRect = emptyGo.GetComponent<RectTransform>();
            emptyRect.anchorMin = new Vector2(0.18f, 0.40f);
            emptyRect.anchorMax = new Vector2(0.54f, 0.58f);
            emptyRect.offsetMin = Vector2.zero;
            emptyRect.offsetMax = Vector2.zero;
            var emptyText = emptyGo.AddComponent<Text>();
            emptyText.font = font;
            emptyText.fontSize = 26;
            emptyText.alignment = TextAnchor.MiddleCenter;
            emptyText.color = new Color(0.65f, 0.65f, 0.7f);
            emptyText.text = "Scan a QR code to hatch your first QRmon.";

            MonsterRaisingPanel raisingPanel = RaisingPanelSceneBuilder.Create(contentGo.transform, font);

            var scrollGo = SceneUIBuilder.CreateUIObject("MonsterScroll", contentGo.transform);
            var scrollRect = scrollGo.GetComponent<RectTransform>();
            scrollRect.anchorMin = new Vector2(0.58f, 0.16f);
            scrollRect.anchorMax = new Vector2(0.99f, 0.88f);
            scrollRect.offsetMin = Vector2.zero;
            scrollRect.offsetMax = Vector2.zero;

            var scrollBg = scrollGo.AddComponent<Image>();
            scrollBg.color = new Color(0.08f, 0.08f, 0.11f, 0.5f);
            var scroll = scrollGo.AddComponent<ScrollRect>();
            scroll.horizontal = false;
            scroll.vertical = true;
            scroll.movementType = ScrollRect.MovementType.Clamped;

            var viewportGo = SceneUIBuilder.CreateUIObject("Viewport", scrollGo.transform);
            SceneUIBuilder.StretchFullScreen(viewportGo.GetComponent<RectTransform>());
            viewportGo.AddComponent<Mask>().showMaskGraphic = false;
            var viewportImage = viewportGo.AddComponent<Image>();
            viewportImage.color = Color.white;
            scroll.viewport = viewportGo.GetComponent<RectTransform>();

            var contentRectGo = SceneUIBuilder.CreateUIObject("GridContent", viewportGo.transform);
            var gridRect = contentRectGo.GetComponent<RectTransform>();
            gridRect.anchorMin = new Vector2(0f, 1f);
            gridRect.anchorMax = new Vector2(1f, 1f);
            gridRect.pivot = new Vector2(0.5f, 1f);
            gridRect.anchoredPosition = Vector2.zero;

            var gridLayout = contentRectGo.AddComponent<GridLayoutGroup>();
            gridLayout.cellSize = new Vector2(320f, 168f);
            gridLayout.spacing = new Vector2(12f, 12f);
            gridLayout.padding = new RectOffset(8, 8, 8, 8);
            gridLayout.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            gridLayout.constraintCount = 1;
            gridLayout.childAlignment = TextAnchor.UpperCenter;
            contentRectGo.AddComponent<AdaptiveGridLayout>();
            var ranchGridSo = new SerializedObject(contentRectGo.GetComponent<AdaptiveGridLayout>());
            ranchGridSo.FindProperty("maxColumns").intValue = 2;
            ranchGridSo.FindProperty("minCellWidth").floatValue = 240f;
            ranchGridSo.FindProperty("cellAspect").floatValue = 1.9f;
            ranchGridSo.ApplyModifiedPropertiesWithoutUndo();

            var fitter = contentRectGo.AddComponent<ContentSizeFitter>();
            fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

            scroll.content = gridRect;

            // Card prefab (hidden template — kept outside grid so layout is unaffected)
            MonsterCardView cardPrefab = CreateMonsterCardPrefab(canvasGo.transform, font);
            cardPrefab.gameObject.SetActive(false);

            // Share + settings overlays
            MonsterSharePanel sharePanel = PolishPanelsSceneBuilder.CreateSharePanel(uiRoot, font);
            PolishPanelsSceneBuilder.CreateSettingsPanel(uiRoot, font);

            // Detail panel
            MonsterDetailPanel detailPanel = CreateMonsterDetailPanel(uiRoot, font, sharePanel);

            // Breeding / fusion overlay
            MonsterBreedingPanel breedingPanel = BreedingPanelSceneBuilder.Create(uiRoot, font);

            // Ranch controller
            var controllerGo = new GameObject("RanchViewController");
            var controller = controllerGo.AddComponent<RanchViewController>();
            var controllerSo = new SerializedObject(controller);
            controllerSo.FindProperty("headerText").objectReferenceValue = headerText;
            controllerSo.FindProperty("countText").objectReferenceValue = countText;
            controllerSo.FindProperty("emptyStateText").objectReferenceValue = emptyText;
            controllerSo.FindProperty("cardContainer").objectReferenceValue = contentRectGo.transform;
            controllerSo.FindProperty("cardPrefab").objectReferenceValue = cardPrefab;
            controllerSo.FindProperty("detailPanel").objectReferenceValue = detailPanel;
            controllerSo.FindProperty("raisingPanel").objectReferenceValue = raisingPanel;
            controllerSo.FindProperty("breedingPanel").objectReferenceValue = breedingPanel;
            controllerSo.FindProperty("openBreedingButton").objectReferenceValue = openBreedingButton;
            controllerSo.FindProperty("adventureButton").objectReferenceValue = adventureButton;
            controllerSo.FindProperty("socialButton").objectReferenceValue = socialButton;
            controllerSo.FindProperty("scanShortcutButton").objectReferenceValue = scanShortcut;
            controllerSo.ApplyModifiedPropertiesWithoutUndo();

            // Raising tick controller
            var raisingControllerGo = new GameObject("MonsterRaisingController");
            var raisingController = raisingControllerGo.AddComponent<MonsterRaisingController>();
            var raisingControllerSo = new SerializedObject(raisingController);
            raisingControllerSo.FindProperty("raisingPanel").objectReferenceValue = raisingPanel;
            raisingControllerSo.ApplyModifiedPropertiesWithoutUndo();

            EnsureEventSystem();
            ConfigureMainCamera();

            System.IO.Directory.CreateDirectory("Assets/Scenes");
            EditorSceneManager.SaveScene(scene, ScenePath);
            GameSceneBuildSettings.RegisterAllScenes();

            Debug.Log($"[RanchSceneSetup] Scene saved to {ScenePath}.");
        }

        private static MonsterCardView CreateMonsterCardPrefab(Transform parent, Font font)
        {
            var cardGo = SceneUIBuilder.CreateUIObject("MonsterCardTemplate", parent);
            var cardRect = cardGo.GetComponent<RectTransform>();
            cardRect.sizeDelta = new Vector2(480f, 300f);

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
            previewRect.anchorMin = new Vector2(0.04f, 0.28f);
            previewRect.anchorMax = new Vector2(0.38f, 0.86f);
            previewRect.offsetMin = Vector2.zero;
            previewRect.offsetMax = Vector2.zero;
            var previewImage = previewGo.AddComponent<RawImage>();

            var nameGo = SceneUIBuilder.CreateUIObject("Name", cardGo.transform);
            var nameRect = nameGo.GetComponent<RectTransform>();
            nameRect.anchorMin = new Vector2(0.4f, 0.72f);
            nameRect.anchorMax = new Vector2(0.96f, 0.86f);
            nameRect.offsetMin = Vector2.zero;
            nameRect.offsetMax = Vector2.zero;
            var nameText = nameGo.AddComponent<Text>();
            nameText.font = font;
            nameText.fontSize = 30;
            nameText.fontStyle = FontStyle.Bold;
            nameText.alignment = TextAnchor.MiddleLeft;
            nameText.color = Color.white;

            var metaGo = SceneUIBuilder.CreateUIObject("Meta", cardGo.transform);
            var metaRect = metaGo.GetComponent<RectTransform>();
            metaRect.anchorMin = new Vector2(0.4f, 0.58f);
            metaRect.anchorMax = new Vector2(0.96f, 0.72f);
            metaRect.offsetMin = Vector2.zero;
            metaRect.offsetMax = Vector2.zero;
            var metaText = metaGo.AddComponent<Text>();
            metaText.font = font;
            metaText.fontSize = 24;
            metaText.alignment = TextAnchor.MiddleLeft;
            metaText.color = new Color(0.8f, 0.8f, 0.85f);

            var statsGo = SceneUIBuilder.CreateUIObject("Stats", cardGo.transform);
            var statsRect = statsGo.GetComponent<RectTransform>();
            statsRect.anchorMin = new Vector2(0.04f, 0.06f);
            statsRect.anchorMax = new Vector2(0.96f, 0.26f);
            statsRect.offsetMin = Vector2.zero;
            statsRect.offsetMax = Vector2.zero;
            var statsText = statsGo.AddComponent<Text>();
            statsText.font = font;
            statsText.fontSize = 22;
            statsText.alignment = TextAnchor.MiddleLeft;
            statsText.color = new Color(0.85f, 0.85f, 0.9f);

            var badgeGo = SceneUIBuilder.CreateUIObject("ActiveBadge", cardGo.transform);
            var badgeRect = badgeGo.GetComponent<RectTransform>();
            badgeRect.anchorMin = new Vector2(0.72f, 0.88f);
            badgeRect.anchorMax = new Vector2(0.98f, 0.98f);
            badgeRect.offsetMin = Vector2.zero;
            badgeRect.offsetMax = Vector2.zero;
            var badgeBg = badgeGo.AddComponent<Image>();
            badgeBg.color = new Color(1f, 0.85f, 0.2f, 0.95f);
            var badgeTextGo = SceneUIBuilder.CreateUIObject("Label", badgeGo.transform);
            SceneUIBuilder.StretchFullScreen(badgeTextGo.GetComponent<RectTransform>());
            var badgeText = badgeTextGo.AddComponent<Text>();
            badgeText.font = font;
            badgeText.fontSize = 18;
            badgeText.fontStyle = FontStyle.Bold;
            badgeText.alignment = TextAnchor.MiddleCenter;
            badgeText.color = Color.black;
            badgeText.text = "ACTIVE";

            var selectionGo = SceneUIBuilder.CreateUIObject("SelectionHighlight", cardGo.transform);
            SceneUIBuilder.StretchFullScreen(selectionGo.GetComponent<RectTransform>());
            var selectionImage = selectionGo.AddComponent<Image>();
            selectionImage.color = new Color(0.55f, 0.22f, 0.72f, 0.35f);
            selectionGo.SetActive(false);

            var cardSo = new SerializedObject(cardView);
            cardSo.FindProperty("backgroundImage").objectReferenceValue = cardBg;
            cardSo.FindProperty("accentImage").objectReferenceValue = accentImage;
            cardSo.FindProperty("previewImage").objectReferenceValue = previewImage;
            cardSo.FindProperty("nameText").objectReferenceValue = nameText;
            cardSo.FindProperty("metaText").objectReferenceValue = metaText;
            cardSo.FindProperty("statsText").objectReferenceValue = statsText;
            cardSo.FindProperty("activeBadge").objectReferenceValue = badgeGo;
            cardSo.FindProperty("selectionHighlight").objectReferenceValue = selectionGo;
            cardSo.FindProperty("selectButton").objectReferenceValue = cardButton;
            cardSo.ApplyModifiedPropertiesWithoutUndo();

            return cardView;
        }

        private static MonsterDetailPanel CreateMonsterDetailPanel(Transform canvasTransform, Font font, MonsterSharePanel sharePanel)
        {
            var panelRoot = SceneUIBuilder.CreateUIObject("MonsterDetailPanel", canvasTransform);
            SceneUIBuilder.StretchFullScreen(panelRoot.GetComponent<RectTransform>());
            var detailPanel = panelRoot.AddComponent<MonsterDetailPanel>();

            var backdropGo = SceneUIBuilder.CreateUIObject("Backdrop", panelRoot.transform);
            SceneUIBuilder.StretchFullScreen(backdropGo.GetComponent<RectTransform>());
            var backdropImage = backdropGo.AddComponent<Image>();
            backdropImage.color = new Color(0f, 0f, 0f, 0.75f);

            var cardGo = SceneUIBuilder.CreateUIObject("Card", panelRoot.transform);
            var cardRect = cardGo.GetComponent<RectTransform>();
            cardRect.anchorMin = new Vector2(0.18f, 0.12f);
            cardRect.anchorMax = new Vector2(0.82f, 0.88f);
            cardRect.offsetMin = Vector2.zero;
            cardRect.offsetMax = Vector2.zero;
            cardGo.AddComponent<Image>().color = new Color(0.12f, 0.12f, 0.16f, 0.98f);

            var previewGo = SceneUIBuilder.CreateUIObject("Preview", cardGo.transform);
            var previewRect = previewGo.GetComponent<RectTransform>();
            previewRect.anchorMin = new Vector2(0.1f, 0.45f);
            previewRect.anchorMax = new Vector2(0.9f, 0.88f);
            previewRect.offsetMin = Vector2.zero;
            previewRect.offsetMax = Vector2.zero;
            var previewImage = previewGo.AddComponent<RawImage>();

            var nameGo = SceneUIBuilder.CreateUIObject("Name", cardGo.transform);
            var nameRect = nameGo.GetComponent<RectTransform>();
            nameRect.anchorMin = new Vector2(0.08f, 0.36f);
            nameRect.anchorMax = new Vector2(0.92f, 0.44f);
            nameRect.offsetMin = Vector2.zero;
            nameRect.offsetMax = Vector2.zero;
            var nameText = nameGo.AddComponent<Text>();
            nameText.font = font;
            nameText.fontSize = 40;
            nameText.fontStyle = FontStyle.Bold;
            nameText.alignment = TextAnchor.MiddleCenter;
            nameText.color = Color.white;

            var metaGo = SceneUIBuilder.CreateUIObject("Meta", cardGo.transform);
            var metaRect = metaGo.GetComponent<RectTransform>();
            metaRect.anchorMin = new Vector2(0.08f, 0.3f);
            metaRect.anchorMax = new Vector2(0.92f, 0.36f);
            metaRect.offsetMin = Vector2.zero;
            metaRect.offsetMax = Vector2.zero;
            var metaText = metaGo.AddComponent<Text>();
            metaText.font = font;
            metaText.fontSize = 28;
            metaText.alignment = TextAnchor.MiddleCenter;
            metaText.color = new Color(0.8f, 0.8f, 0.85f);

            var statsGo = SceneUIBuilder.CreateUIObject("Stats", cardGo.transform);
            var statsRect = statsGo.GetComponent<RectTransform>();
            statsRect.anchorMin = new Vector2(0.12f, 0.14f);
            statsRect.anchorMax = new Vector2(0.55f, 0.28f);
            statsRect.offsetMin = Vector2.zero;
            statsRect.offsetMax = Vector2.zero;
            var statsText = statsGo.AddComponent<Text>();
            statsText.font = font;
            statsText.fontSize = 26;
            statsText.alignment = TextAnchor.MiddleLeft;
            statsText.color = Color.white;

            var idGo = SceneUIBuilder.CreateUIObject("Id", cardGo.transform);
            var idRect = idGo.GetComponent<RectTransform>();
            idRect.anchorMin = new Vector2(0.55f, 0.14f);
            idRect.anchorMax = new Vector2(0.92f, 0.22f);
            idRect.offsetMin = Vector2.zero;
            idRect.offsetMax = Vector2.zero;
            var idText = idGo.AddComponent<Text>();
            idText.font = font;
            idText.fontSize = 20;
            idText.alignment = TextAnchor.MiddleRight;
            idText.color = new Color(0.6f, 0.6f, 0.65f);

            var activeGo = SceneUIBuilder.CreateUIObject("ActiveIndicator", cardGo.transform);
            var activeRect = activeGo.GetComponent<RectTransform>();
            activeRect.anchorMin = new Vector2(0.35f, 0.22f);
            activeRect.anchorMax = new Vector2(0.65f, 0.28f);
            activeRect.offsetMin = Vector2.zero;
            activeRect.offsetMax = Vector2.zero;
            var activeText = activeGo.AddComponent<Text>();
            activeText.font = font;
            activeText.fontSize = 24;
            activeText.fontStyle = FontStyle.Bold;
            activeText.alignment = TextAnchor.MiddleCenter;
            activeText.color = new Color(1f, 0.85f, 0.2f);
            activeText.text = "★ Active Monster ★";

            Button setActiveButton = SceneUIBuilder.CreatePrimaryButton(
                cardGo.transform,
                "SetActiveButton",
                "Set Active",
                new Vector2(0.06f, 0.04f),
                new Vector2(0.32f, 0.12f));

            Button shareButton = SceneUIBuilder.CreatePrimaryButton(
                cardGo.transform,
                "ShareButton",
                "Share QR",
                new Vector2(0.34f, 0.04f),
                new Vector2(0.62f, 0.12f));

            Button releaseButton = SceneUIBuilder.CreatePrimaryButton(
                cardGo.transform,
                "ReleaseButton",
                "Release",
                new Vector2(0.64f, 0.04f),
                new Vector2(0.92f, 0.12f));

            var releaseImage = releaseButton.GetComponent<Image>();
            if (releaseImage != null)
            {
                releaseImage.color = new Color(0.75f, 0.25f, 0.25f, 0.95f);
            }

            Button closeButton = SceneUIBuilder.CreatePrimaryButton(
                cardGo.transform,
                "CloseButton",
                "Close",
                new Vector2(0.35f, 0.88f),
                new Vector2(0.65f, 0.95f));

            var panelSo = new SerializedObject(detailPanel);
            panelSo.FindProperty("rootPanel").objectReferenceValue = panelRoot;
            panelSo.FindProperty("previewImage").objectReferenceValue = previewImage;
            panelSo.FindProperty("nameText").objectReferenceValue = nameText;
            panelSo.FindProperty("metaText").objectReferenceValue = metaText;
            panelSo.FindProperty("statsText").objectReferenceValue = statsText;
            panelSo.FindProperty("idText").objectReferenceValue = idText;
            panelSo.FindProperty("activeIndicator").objectReferenceValue = activeGo;
            panelSo.FindProperty("setActiveButton").objectReferenceValue = setActiveButton;
            panelSo.FindProperty("shareButton").objectReferenceValue = shareButton;
            panelSo.FindProperty("releaseButton").objectReferenceValue = releaseButton;
            panelSo.FindProperty("closeButton").objectReferenceValue = closeButton;
            panelSo.FindProperty("sharePanel").objectReferenceValue = sharePanel;
            panelSo.ApplyModifiedPropertiesWithoutUndo();

            panelRoot.SetActive(false);
            return detailPanel;
        }

        private static void EnsureEventSystem()
        {
            if (Object.FindObjectOfType<EventSystem>() == null)
            {
                new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
            }
        }

        private static void ConfigureMainCamera()
        {
            Camera mainCam = Camera.main;
            if (mainCam != null)
            {
                mainCam.clearFlags = CameraClearFlags.SolidColor;
                mainCam.backgroundColor = new Color(0.1f, 0.1f, 0.14f);
            }
        }
    }
}
#endif
