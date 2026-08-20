using MonsterCollect.Core;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Blocks play in portrait and asks the player to rotate to landscape.</summary>
    [DisallowMultipleComponent]
    public class LandscapeRequiredOverlay : MonoBehaviour
    {
        private const int OverlaySortOrder = 40000;

        private GameObject overlayRoot;
        private bool showingPortraitGate;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void EnsureOverlay()
        {
            if (FindObjectOfType<LandscapeRequiredOverlay>() != null)
            {
                return;
            }

            var go = new GameObject(nameof(LandscapeRequiredOverlay));
            go.AddComponent<LandscapeRequiredOverlay>();
        }

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            BuildOverlay();
            LandscapeOrientationEnforcer.Apply();
            RefreshVisibility();
        }

        private void Update()
        {
            RefreshVisibility();
        }

        private void RefreshVisibility()
        {
            bool portrait = IsPortrait();
            if (portrait == showingPortraitGate)
            {
                return;
            }

            showingPortraitGate = portrait;
            overlayRoot?.SetActive(portrait);

            if (!portrait)
            {
                LandscapeOrientationEnforcer.Apply();
            }
        }

        private static bool IsPortrait()
        {
            return Screen.height > Screen.width;
        }

        private void BuildOverlay()
        {
            var canvasGo = new GameObject(
                "LandscapeGateCanvas",
                typeof(Canvas),
                typeof(CanvasScaler),
                typeof(GraphicRaycaster));
            canvasGo.transform.SetParent(transform, false);

            var canvas = canvasGo.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = OverlaySortOrder;

            var scaler = canvasGo.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1080, 1920);
            scaler.matchWidthOrHeight = 0.5f;

            overlayRoot = new GameObject("Overlay", typeof(RectTransform));
            overlayRoot.transform.SetParent(canvasGo.transform, false);
            StretchFullScreen(overlayRoot.GetComponent<RectTransform>());

            var background = overlayRoot.AddComponent<Image>();
            background.color = new Color(0.04f, 0.07f, 0.12f, 0.98f);
            background.raycastTarget = true;

            Font font = MobileGameUiKit.BodyFont;

            var iconGo = CreateChild(overlayRoot.transform, "RotateIcon");
            var iconRect = iconGo.GetComponent<RectTransform>();
            iconRect.anchorMin = new Vector2(0.5f, 0.58f);
            iconRect.anchorMax = new Vector2(0.5f, 0.58f);
            iconRect.sizeDelta = new Vector2(220f, 220f);
            var iconText = iconGo.AddComponent<Text>();
            iconText.font = font;
            iconText.fontSize = 120;
            iconText.alignment = TextAnchor.MiddleCenter;
            iconText.color = new Color(0.55f, 0.95f, 0.75f);
            iconText.text = "↻";

            var titleGo = CreateChild(overlayRoot.transform, "Title");
            var titleRect = titleGo.GetComponent<RectTransform>();
            titleRect.anchorMin = new Vector2(0.08f, 0.42f);
            titleRect.anchorMax = new Vector2(0.92f, 0.52f);
            titleRect.offsetMin = Vector2.zero;
            titleRect.offsetMax = Vector2.zero;
            var titleText = titleGo.AddComponent<Text>();
            titleText.font = MobileGameUiKit.TitleFont;
            titleText.fontSize = 44;
            titleText.fontStyle = FontStyle.Bold;
            titleText.alignment = TextAnchor.MiddleCenter;
            titleText.color = Color.white;
            titleText.text = "Rotate Your Device";

            var bodyGo = CreateChild(overlayRoot.transform, "Body");
            var bodyRect = bodyGo.GetComponent<RectTransform>();
            bodyRect.anchorMin = new Vector2(0.1f, 0.24f);
            bodyRect.anchorMax = new Vector2(0.9f, 0.4f);
            bodyRect.offsetMin = Vector2.zero;
            bodyRect.offsetMax = Vector2.zero;
            var bodyText = bodyGo.AddComponent<Text>();
            bodyText.font = font;
            bodyText.fontSize = 28;
            bodyText.alignment = TextAnchor.MiddleCenter;
            bodyText.color = new Color(0.82f, 0.86f, 0.92f);
            bodyText.text = "Monster Collect is landscape only.\nTurn your phone sideways to continue.";

            overlayRoot.SetActive(false);
            showingPortraitGate = false;
        }

        private static GameObject CreateChild(Transform parent, string name)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            return go;
        }

        private static void StretchFullScreen(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }
}
