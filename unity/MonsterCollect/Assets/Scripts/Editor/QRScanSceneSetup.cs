#if UNITY_EDITOR
using MonsterCollect.Core;
using MonsterCollect.Monster;
using MonsterCollect.QR;
using MonsterCollect.UI;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace MonsterCollect.Editor
{
    /// <summary>
    /// Menu item to (re)build the QR scan demo scene with wired UI references.
    /// Run once after opening the project: Monster Collect → Setup QR Scan Scene
    /// </summary>
    public static class QRScanSceneSetup
    {
        private const string ScenePath = "Assets/Scenes/QRScanScene.unity";

        [MenuItem("Monster Collect/Setup QR Scan Scene")]
        public static void SetupScene()
        {
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            Font font = SceneUIBuilder.DefaultFont;

            GameObject canvasGo = SceneUIBuilder.CreateCanvas("Canvas");
            Transform uiRoot = SceneUIBuilder.GetCanvasContentRoot(canvasGo);
            SceneUIBuilder.CreateNavigationBar(canvasGo.transform, GameScenes.Scan);
            PolishPanelsSceneBuilder.CreateSettingsPanel(uiRoot, font);

            // Content area below nav bar
            var contentGo = SceneUIBuilder.CreateUIObject("Content", uiRoot);
            SceneUIBuilder.StretchBelowNavBar(contentGo.GetComponent<RectTransform>());

            // Full-screen camera preview
            var previewGo = SceneUIBuilder.CreateUIObject("CameraPreview", contentGo.transform);
            SceneUIBuilder.StretchFullScreen(previewGo.GetComponent<RectTransform>());
            var previewImage = previewGo.AddComponent<RawImage>();
            previewImage.color = Color.white;
            previewImage.raycastTarget = false;

            // Result label (top of content)
            var resultGo = SceneUIBuilder.CreateUIObject("ResultText", contentGo.transform);
            var resultRect = resultGo.GetComponent<RectTransform>();
            resultRect.anchorMin = new Vector2(0.04f, 0.86f);
            resultRect.anchorMax = new Vector2(0.96f, 0.96f);
            resultRect.offsetMin = Vector2.zero;
            resultRect.offsetMax = Vector2.zero;
            var resultText = resultGo.AddComponent<Text>();
            resultText.font = font;
            resultText.fontSize = 36;
            resultText.alignment = TextAnchor.MiddleCenter;
            resultText.color = Color.white;
            resultText.text = "Tap Scan to start";
            resultGo.AddComponent<Outline>().effectColor = Color.black;

            // Scan button (bottom) — after preview/result so it stays on top for input
            var scanButton = SceneUIBuilder.CreatePrimaryButton(
                contentGo.transform,
                "ScanButton",
                "Scan",
                new Vector2(0.32f, 0.03f),
                new Vector2(0.68f, 0.13f));
            scanButton.transform.SetAsLastSibling();

            // --- Monster Born popup (hidden by default) ---
            MonsterBornPopup bornPopup = CreateMonsterBornPopupPublic(uiRoot);

            // --- QR Scanner controller ---
            var scannerGo = new GameObject("QRScanner");
            var scanner = scannerGo.AddComponent<QRScanner>();

            // Wire private serialized fields via SerializedObject
            var so = new SerializedObject(scanner);
            so.FindProperty("previewImage").objectReferenceValue = previewImage;
            so.FindProperty("scanButton").objectReferenceValue = scanButton;
            so.FindProperty("resultText").objectReferenceValue = resultText;
            so.FindProperty("scanIntervalSeconds").floatValue = 0.4f;
            so.ApplyModifiedPropertiesWithoutUndo();

            // --- Monster scan handler (QR → deterministic monster) ---
            var handlerGo = new GameObject("MonsterScanHandler");
            var handler = handlerGo.AddComponent<MonsterScanHandler>();
            var handlerSo = new SerializedObject(handler);
            handlerSo.FindProperty("qrScanner").objectReferenceValue = scanner;
            handlerSo.FindProperty("bornPopup").objectReferenceValue = bornPopup;
            handlerSo.ApplyModifiedPropertiesWithoutUndo();

            // EventSystem (required for UI button) — lives in the scene; no DontDestroyOnLoad in editor.
            if (Object.FindObjectOfType<EventSystem>() == null)
            {
                new GameObject("EventSystem", typeof(EventSystem), typeof(StandaloneInputModule));
            }

            // Disable default main camera — UI-only demo scene
            var mainCam = Camera.main;
            if (mainCam != null)
            {
                mainCam.clearFlags = CameraClearFlags.SolidColor;
                mainCam.backgroundColor = Color.black;
            }

            System.IO.Directory.CreateDirectory("Assets/Scenes");
            EditorSceneManager.SaveScene(scene, ScenePath);
            GameSceneBuildSettings.RegisterAllScenes();

            Debug.Log($"[QRScanSceneSetup] Scene saved to {ScenePath} and added to Build Settings.");
        }

        private static MonsterBornPopup CreateMonsterBornPopup(Transform canvasTransform)
        {
            return CreateMonsterBornPopupPublic(canvasTransform);
        }

        public static MonsterBornPopup CreateMonsterBornPopupPublic(Transform canvasTransform)
        {
            Font font = SceneUIBuilder.DefaultFont;

            var popupRoot = SceneUIBuilder.CreateUIObject("MonsterBornPopup", canvasTransform);
            SceneUIBuilder.StretchFullScreen(popupRoot.GetComponent<RectTransform>());
            var bornPopup = popupRoot.AddComponent<MonsterBornPopup>();

            // Dimmed backdrop
            var backdropGo = SceneUIBuilder.CreateUIObject("Backdrop", popupRoot.transform);
            SceneUIBuilder.StretchFullScreen(backdropGo.GetComponent<RectTransform>());
            var backdropImage = backdropGo.AddComponent<Image>();
            backdropImage.color = new Color(0f, 0f, 0f, 0.72f);
            backdropImage.raycastTarget = true;

            // Center card
            var cardGo = SceneUIBuilder.CreateUIObject("Card", popupRoot.transform);
            var cardRect = cardGo.GetComponent<RectTransform>();
            cardRect.anchorMin = new Vector2(0.22f, 0.16f);
            cardRect.anchorMax = new Vector2(0.78f, 0.84f);
            cardRect.offsetMin = Vector2.zero;
            cardRect.offsetMax = Vector2.zero;
            var cardImage = cardGo.AddComponent<Image>();
            cardImage.color = new Color(0.12f, 0.12f, 0.16f, 0.98f);

            // Title
            var titleGo = SceneUIBuilder.CreateUIObject("Title", cardGo.transform);
            var titleRect = titleGo.GetComponent<RectTransform>();
            titleRect.anchorMin = new Vector2(0.05f, 0.82f);
            titleRect.anchorMax = new Vector2(0.95f, 0.96f);
            titleRect.offsetMin = Vector2.zero;
            titleRect.offsetMax = Vector2.zero;
            var titleText = titleGo.AddComponent<Text>();
            titleText.font = font;
            titleText.fontSize = 48;
            titleText.fontStyle = FontStyle.Bold;
            titleText.alignment = TextAnchor.MiddleCenter;
            titleText.color = new Color(1f, 0.92f, 0.45f);
            titleText.text = "Monster Born!";

            // Preview image
            var previewGo = SceneUIBuilder.CreateUIObject("Preview", cardGo.transform);
            var previewRect = previewGo.GetComponent<RectTransform>();
            previewRect.anchorMin = new Vector2(0.28f, 0.48f);
            previewRect.anchorMax = new Vector2(0.72f, 0.8f);
            previewRect.offsetMin = Vector2.zero;
            previewRect.offsetMax = Vector2.zero;
            var previewImage = previewGo.AddComponent<RawImage>();
            previewImage.color = Color.white;

            // Details text
            var detailsGo = SceneUIBuilder.CreateUIObject("Details", cardGo.transform);
            var detailsRect = detailsGo.GetComponent<RectTransform>();
            detailsRect.anchorMin = new Vector2(0.06f, 0.18f);
            detailsRect.anchorMax = new Vector2(0.94f, 0.46f);
            detailsRect.offsetMin = Vector2.zero;
            detailsRect.offsetMax = Vector2.zero;
            var detailsText = detailsGo.AddComponent<Text>();
            detailsText.font = font;
            detailsText.fontSize = 30;
            detailsText.alignment = TextAnchor.UpperCenter;
            detailsText.color = Color.white;
            detailsText.supportRichText = true;
            detailsText.text = string.Empty;

            // Dismiss button
            var dismissButton = SceneUIBuilder.CreatePrimaryButton(
                cardGo.transform,
                "DismissButton",
                "Continue",
                new Vector2(0.2f, 0.04f),
                new Vector2(0.8f, 0.14f));

            var popupSo = new SerializedObject(bornPopup);
            popupSo.FindProperty("rootPanel").objectReferenceValue = popupRoot;
            popupSo.FindProperty("titleText").objectReferenceValue = titleText;
            popupSo.FindProperty("detailsText").objectReferenceValue = detailsText;
            popupSo.FindProperty("previewImage").objectReferenceValue = previewImage;
            popupSo.FindProperty("dismissButton").objectReferenceValue = dismissButton;
            popupSo.ApplyModifiedPropertiesWithoutUndo();

            popupRoot.SetActive(false);
            return bornPopup;
        }
    }
}
#endif
