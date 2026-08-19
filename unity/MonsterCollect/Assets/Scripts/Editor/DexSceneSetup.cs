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
    /// <summary>Builds the monster dex / catalog scene.</summary>
    public static class DexSceneSetup
    {
        private const string ScenePath = "Assets/Scenes/DexScene.unity";

        [MenuItem("Monster Collect/Setup Dex Scene")]
        public static void SetupScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            Font font = SceneUIBuilder.DefaultFont;

            GameObject canvasGo = SceneUIBuilder.CreateCanvas("Canvas");
            Transform uiRoot = SceneUIBuilder.GetCanvasContentRoot(canvasGo);
            SceneUIBuilder.CreateNavigationBar(canvasGo.transform, GameScenes.Dex);
            PolishPanelsSceneBuilder.CreateSettingsPanel(uiRoot, font);

            var contentGo = SceneUIBuilder.CreateUIObject("Content", uiRoot);
            SceneUIBuilder.StretchBelowNavBar(contentGo.GetComponent<RectTransform>());
            var contentBg = contentGo.AddComponent<Image>();
            contentBg.color = Color.white;
            SceneUIBuilder.ApplyContentBackground(contentBg);

            Text headerText = SceneUIBuilder.CreateHeader(contentGo.transform, "Monster Dex", 0.90f, 0.98f);

            var countGo = SceneUIBuilder.CreateUIObject("CountText", contentGo.transform);
            var countRect = countGo.GetComponent<RectTransform>();
            countRect.anchorMin = new Vector2(0.50f, 0.90f);
            countRect.anchorMax = new Vector2(0.98f, 0.98f);
            countRect.offsetMin = Vector2.zero;
            countRect.offsetMax = Vector2.zero;
            var countText = countGo.AddComponent<Text>();
            countText.font = font;
            countText.fontSize = 30;
            countText.alignment = TextAnchor.MiddleRight;
            countText.color = new Color(0.75f, 0.75f, 0.8f);
            countText.text = "0 / 300 discovered";

            var emptyGo = SceneUIBuilder.CreateUIObject("EmptyState", contentGo.transform);
            var emptyRect = emptyGo.GetComponent<RectTransform>();
            emptyRect.anchorMin = new Vector2(0.1f, 0.4f);
            emptyRect.anchorMax = new Vector2(0.9f, 0.6f);
            emptyRect.offsetMin = Vector2.zero;
            emptyRect.offsetMax = Vector2.zero;
            var emptyText = emptyGo.AddComponent<Text>();
            emptyText.font = font;
            emptyText.fontSize = 34;
            emptyText.alignment = TextAnchor.MiddleCenter;
            emptyText.color = new Color(0.65f, 0.65f, 0.7f);
            emptyText.text = "No monsters discovered yet.\nScan QR codes to fill your dex!";

            var scrollGo = SceneUIBuilder.CreateUIObject("DexScroll", contentGo.transform);
            var scrollRect = scrollGo.GetComponent<RectTransform>();
            scrollRect.anchorMin = new Vector2(0.01f, 0.02f);
            scrollRect.anchorMax = new Vector2(0.99f, 0.88f);
            scrollRect.offsetMin = Vector2.zero;
            scrollRect.offsetMax = Vector2.zero;

            scrollGo.AddComponent<Image>().color = new Color(0.08f, 0.08f, 0.11f, 0.5f);
            var scroll = scrollGo.AddComponent<ScrollRect>();
            scroll.horizontal = false;
            scroll.vertical = true;

            var viewportGo = SceneUIBuilder.CreateUIObject("Viewport", scrollGo.transform);
            SceneUIBuilder.StretchFullScreen(viewportGo.GetComponent<RectTransform>());
            viewportGo.AddComponent<Mask>().showMaskGraphic = false;
            viewportGo.AddComponent<Image>().color = Color.white;
            scroll.viewport = viewportGo.GetComponent<RectTransform>();

            var gridContentGo = SceneUIBuilder.CreateUIObject("GridContent", viewportGo.transform);
            var gridRect = gridContentGo.GetComponent<RectTransform>();
            gridRect.anchorMin = new Vector2(0f, 1f);
            gridRect.anchorMax = new Vector2(1f, 1f);
            gridRect.pivot = new Vector2(0.5f, 1f);

            var gridLayout = gridContentGo.AddComponent<GridLayoutGroup>();
            gridLayout.cellSize = new Vector2(280f, 160f);
            gridLayout.spacing = new Vector2(12f, 12f);
            gridLayout.padding = new RectOffset(8, 8, 8, 8);
            gridLayout.constraint = GridLayoutGroup.Constraint.FixedColumnCount;
            gridLayout.constraintCount = 3;
            gridContentGo.AddComponent<AdaptiveGridLayout>();
            var dexGridSo = new SerializedObject(gridContentGo.GetComponent<AdaptiveGridLayout>());
            dexGridSo.FindProperty("maxColumns").intValue = 4;
            dexGridSo.FindProperty("minCellWidth").floatValue = 220f;
            dexGridSo.FindProperty("cellAspect").floatValue = 1.7f;
            dexGridSo.ApplyModifiedPropertiesWithoutUndo();

            gridContentGo.AddComponent<ContentSizeFitter>().verticalFit = ContentSizeFitter.FitMode.PreferredSize;
            scroll.content = gridRect;

            DexEntryCardView cardPrefab = CreateDexCardPrefab(canvasGo.transform, font);
            cardPrefab.gameObject.SetActive(false);

            DexDetailPanel detailPanel = CreateDexDetailPanel(uiRoot, font);

            var controllerGo = new GameObject("DexViewController");
            var controller = controllerGo.AddComponent<DexViewController>();
            var controllerSo = new SerializedObject(controller);
            controllerSo.FindProperty("headerText").objectReferenceValue = headerText;
            controllerSo.FindProperty("countText").objectReferenceValue = countText;
            controllerSo.FindProperty("emptyStateText").objectReferenceValue = emptyText;
            controllerSo.FindProperty("cardContainer").objectReferenceValue = gridContentGo.transform;
            controllerSo.FindProperty("cardPrefab").objectReferenceValue = cardPrefab;
            controllerSo.FindProperty("detailPanel").objectReferenceValue = detailPanel;
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

            Debug.Log($"[DexSceneSetup] Scene saved to {ScenePath}.");
        }

        private static DexEntryCardView CreateDexCardPrefab(Transform parent, Font font)
        {
            var cardGo = SceneUIBuilder.CreateUIObject("DexCardTemplate", parent);
            cardGo.GetComponent<RectTransform>().sizeDelta = new Vector2(480f, 260f);

            var cardBg = cardGo.AddComponent<Image>();
            cardBg.color = new Color(0.18f, 0.18f, 0.24f, 0.95f);
            var cardView = cardGo.AddComponent<DexEntryCardView>();
            var cardButton = cardGo.AddComponent<Button>();
            cardButton.targetGraphic = cardBg;

            var accentGo = SceneUIBuilder.CreateUIObject("Accent", cardGo.transform);
            var accentRect = accentGo.GetComponent<RectTransform>();
            accentRect.anchorMin = new Vector2(0f, 0.88f);
            accentRect.anchorMax = new Vector2(1f, 1f);
            accentRect.offsetMin = Vector2.zero;
            accentRect.offsetMax = Vector2.zero;
            var accentImage = accentGo.AddComponent<Image>();

            var numberGo = SceneUIBuilder.CreateUIObject("Number", cardGo.transform);
            var numberRect = numberGo.GetComponent<RectTransform>();
            numberRect.anchorMin = new Vector2(0.04f, 0.82f);
            numberRect.anchorMax = new Vector2(0.35f, 0.96f);
            numberRect.offsetMin = Vector2.zero;
            numberRect.offsetMax = Vector2.zero;
            var numberText = numberGo.AddComponent<Text>();
            numberText.font = font;
            numberText.fontSize = 26;
            numberText.fontStyle = FontStyle.Bold;
            numberText.alignment = TextAnchor.MiddleLeft;
            numberText.color = new Color(1f, 0.85f, 0.35f);

            var previewGo = SceneUIBuilder.CreateUIObject("Preview", cardGo.transform);
            var previewRect = previewGo.GetComponent<RectTransform>();
            previewRect.anchorMin = new Vector2(0.04f, 0.22f);
            previewRect.anchorMax = new Vector2(0.36f, 0.8f);
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
            nameText.fontSize = 30;
            nameText.fontStyle = FontStyle.Bold;
            nameText.alignment = TextAnchor.MiddleLeft;
            nameText.color = Color.white;

            var metaGo = SceneUIBuilder.CreateUIObject("Meta", cardGo.transform);
            var metaRect = metaGo.GetComponent<RectTransform>();
            metaRect.anchorMin = new Vector2(0.38f, 0.38f);
            metaRect.anchorMax = new Vector2(0.96f, 0.58f);
            metaRect.offsetMin = Vector2.zero;
            metaRect.offsetMax = Vector2.zero;
            var metaText = metaGo.AddComponent<Text>();
            metaText.font = font;
            metaText.fontSize = 22;
            metaText.alignment = TextAnchor.MiddleLeft;
            metaText.color = new Color(0.8f, 0.8f, 0.85f);

            var cardSo = new SerializedObject(cardView);
            cardSo.FindProperty("backgroundImage").objectReferenceValue = cardBg;
            cardSo.FindProperty("accentImage").objectReferenceValue = accentImage;
            cardSo.FindProperty("previewImage").objectReferenceValue = previewImage;
            cardSo.FindProperty("numberText").objectReferenceValue = numberText;
            cardSo.FindProperty("nameText").objectReferenceValue = nameText;
            cardSo.FindProperty("metaText").objectReferenceValue = metaText;
            cardSo.FindProperty("selectButton").objectReferenceValue = cardButton;
            cardSo.ApplyModifiedPropertiesWithoutUndo();

            return cardView;
        }

        private static DexDetailPanel CreateDexDetailPanel(Transform canvasTransform, Font font)
        {
            var panelRoot = SceneUIBuilder.CreateUIObject("DexDetailPanel", canvasTransform);
            SceneUIBuilder.StretchFullScreen(panelRoot.GetComponent<RectTransform>());
            var detailPanel = panelRoot.AddComponent<DexDetailPanel>();

            var backdropGo = SceneUIBuilder.CreateUIObject("Backdrop", panelRoot.transform);
            SceneUIBuilder.StretchFullScreen(backdropGo.GetComponent<RectTransform>());
            backdropGo.AddComponent<Image>().color = new Color(0f, 0f, 0f, 0.75f);

            var cardGo = SceneUIBuilder.CreateUIObject("Card", panelRoot.transform);
            var cardRect = cardGo.GetComponent<RectTransform>();
            cardRect.anchorMin = new Vector2(0.07f, 0.18f);
            cardRect.anchorMax = new Vector2(0.93f, 0.82f);
            cardRect.offsetMin = Vector2.zero;
            cardRect.offsetMax = Vector2.zero;
            cardGo.AddComponent<Image>().color = new Color(0.12f, 0.12f, 0.16f, 0.98f);

            var numberGo = SceneUIBuilder.CreateUIObject("Number", cardGo.transform);
            var numberRect = numberGo.GetComponent<RectTransform>();
            numberRect.anchorMin = new Vector2(0.08f, 0.88f);
            numberRect.anchorMax = new Vector2(0.92f, 0.96f);
            numberRect.offsetMin = Vector2.zero;
            numberRect.offsetMax = Vector2.zero;
            var numberText = numberGo.AddComponent<Text>();
            numberText.font = font;
            numberText.fontSize = 36;
            numberText.fontStyle = FontStyle.Bold;
            numberText.alignment = TextAnchor.MiddleCenter;
            numberText.color = new Color(1f, 0.85f, 0.35f);

            var previewGo = SceneUIBuilder.CreateUIObject("Preview", cardGo.transform);
            var previewRect = previewGo.GetComponent<RectTransform>();
            previewRect.anchorMin = new Vector2(0.15f, 0.42f);
            previewRect.anchorMax = new Vector2(0.85f, 0.86f);
            previewRect.offsetMin = Vector2.zero;
            previewRect.offsetMax = Vector2.zero;
            var previewImage = previewGo.AddComponent<RawImage>();

            var nameGo = SceneUIBuilder.CreateUIObject("Name", cardGo.transform);
            var nameRect = nameGo.GetComponent<RectTransform>();
            nameRect.anchorMin = new Vector2(0.08f, 0.32f);
            nameRect.anchorMax = new Vector2(0.92f, 0.4f);
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
            metaRect.anchorMin = new Vector2(0.08f, 0.26f);
            metaRect.anchorMax = new Vector2(0.92f, 0.32f);
            metaRect.offsetMin = Vector2.zero;
            metaRect.offsetMax = Vector2.zero;
            var metaText = metaGo.AddComponent<Text>();
            metaText.font = font;
            metaText.fontSize = 26;
            metaText.alignment = TextAnchor.MiddleCenter;
            metaText.color = new Color(0.8f, 0.8f, 0.85f);

            var statsGo = SceneUIBuilder.CreateUIObject("Stats", cardGo.transform);
            var statsRect = statsGo.GetComponent<RectTransform>();
            statsRect.anchorMin = new Vector2(0.15f, 0.12f);
            statsRect.anchorMax = new Vector2(0.85f, 0.24f);
            statsRect.offsetMin = Vector2.zero;
            statsRect.offsetMax = Vector2.zero;
            var statsText = statsGo.AddComponent<Text>();
            statsText.font = font;
            statsText.fontSize = 24;
            statsText.alignment = TextAnchor.MiddleCenter;
            statsText.color = Color.white;

            Button closeButton = SceneUIBuilder.CreatePrimaryButton(
                cardGo.transform,
                "CloseButton",
                "Close",
                new Vector2(0.3f, 0.03f),
                new Vector2(0.7f, 0.1f));

            var panelSo = new SerializedObject(detailPanel);
            panelSo.FindProperty("rootPanel").objectReferenceValue = panelRoot;
            panelSo.FindProperty("previewImage").objectReferenceValue = previewImage;
            panelSo.FindProperty("numberText").objectReferenceValue = numberText;
            panelSo.FindProperty("nameText").objectReferenceValue = nameText;
            panelSo.FindProperty("metaText").objectReferenceValue = metaText;
            panelSo.FindProperty("statsText").objectReferenceValue = statsText;
            panelSo.FindProperty("closeButton").objectReferenceValue = closeButton;
            panelSo.ApplyModifiedPropertiesWithoutUndo();

            panelRoot.SetActive(false);
            return detailPanel;
        }
    }
}
#endif
