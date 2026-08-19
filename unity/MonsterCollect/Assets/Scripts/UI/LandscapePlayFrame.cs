using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>
    /// Letterboxes UI to a 16:9 playable frame so the Game view and device
    /// screens keep the same layout without overflowing.
    /// </summary>
    [DisallowMultipleComponent]
    [RequireComponent(typeof(RectTransform))]
    public class LandscapePlayFrame : MonoBehaviour
    {
        public const float TargetAspect = 16f / 9f;

        [SerializeField] private float targetAspect = TargetAspect;
        [SerializeField] private bool respectSafeArea = true;

        private RectTransform rectTransform;
        private Canvas canvas;
        private Rect lastSafeArea;
        private Vector2 lastParentSize;
        private Vector2Int lastScreenSize;

        public static Transform FindContentRoot(Canvas canvas)
        {
            if (canvas == null)
            {
                return null;
            }

            Transform playFrame = canvas.transform.Find("PlayFrame");
            if (playFrame == null)
            {
                return canvas.transform;
            }

            Transform safeArea = playFrame.Find("SafeArea");
            return safeArea != null ? safeArea : playFrame;
        }

        private void Awake()
        {
            rectTransform = GetComponent<RectTransform>();
            canvas = GetComponentInParent<Canvas>();
            ApplyFrame();
        }

        private void OnEnable()
        {
            ApplyFrame();
        }

        private void LateUpdate()
        {
            RectTransform parent = rectTransform != null ? rectTransform.parent as RectTransform : null;
            Vector2 parentSize = parent != null ? parent.rect.size : Vector2.zero;

            if (Screen.safeArea != lastSafeArea ||
                parentSize != lastParentSize ||
                Screen.width != lastScreenSize.x ||
                Screen.height != lastScreenSize.y)
            {
                ApplyFrame();
            }
        }

        private void ApplyFrame()
        {
            if (rectTransform == null)
            {
                rectTransform = GetComponent<RectTransform>();
            }

            RectTransform parent = rectTransform.parent as RectTransform;
            if (parent == null)
            {
                return;
            }

            lastSafeArea = Screen.safeArea;
            lastParentSize = parent.rect.size;
            lastScreenSize = new Vector2Int(Screen.width, Screen.height);

            float availableW = Mathf.Max(1f, parent.rect.width);
            float availableH = Mathf.Max(1f, parent.rect.height);
            float left = 0f;
            float right = 0f;
            float bottom = 0f;
            float top = 0f;

            if (respectSafeArea && Screen.width > 0 && Screen.height > 0)
            {
                Rect safe = Screen.safeArea;
                left = safe.xMin / Screen.width * availableW;
                right = (1f - safe.xMax / Screen.width) * availableW;
                bottom = safe.yMin / Screen.height * availableH;
                top = (1f - safe.yMax / Screen.height) * availableH;
            }

            float innerW = Mathf.Max(1f, availableW - left - right);
            float innerH = Mathf.Max(1f, availableH - bottom - top);
            float innerAspect = innerW / innerH;
            float aspect = targetAspect > 0.1f ? targetAspect : TargetAspect;

            float width;
            float height;
            if (innerAspect > aspect)
            {
                height = innerH;
                width = height * aspect;
            }
            else
            {
                width = innerW;
                height = width / aspect;
            }

            rectTransform.anchorMin = new Vector2(0.5f, 0.5f);
            rectTransform.anchorMax = new Vector2(0.5f, 0.5f);
            rectTransform.pivot = new Vector2(0.5f, 0.5f);
            rectTransform.sizeDelta = new Vector2(width, height);
            rectTransform.anchoredPosition = new Vector2((left - right) * 0.5f, (bottom - top) * 0.5f);
        }
    }
}
