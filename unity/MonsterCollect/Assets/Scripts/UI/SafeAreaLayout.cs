using UnityEngine;

namespace MonsterCollect.UI
{
    /// <summary>
    /// Insets a full-screen rect transform to respect device safe areas (notch, nav bar).
    /// </summary>
    [DisallowMultipleComponent]
    [RequireComponent(typeof(RectTransform))]
    public class SafeAreaLayout : MonoBehaviour
    {
        [SerializeField] private bool applyTop = true;
        [SerializeField] private bool applyBottom = true;
        [SerializeField] private bool applyLeft = true;
        [SerializeField] private bool applyRight = true;

        private RectTransform rectTransform;
        private Rect lastSafeArea;
        private Vector2Int lastScreenSize;
        private ScreenOrientation lastOrientation;

        private void Awake()
        {
            rectTransform = GetComponent<RectTransform>();
            ApplySafeArea();
        }

        private void OnEnable()
        {
            ApplySafeArea();
        }

        private void Update()
        {
            if (Screen.safeArea != lastSafeArea ||
                Screen.width != lastScreenSize.x ||
                Screen.height != lastScreenSize.y ||
                Screen.orientation != lastOrientation)
            {
                ApplySafeArea();
            }
        }

        private void ApplySafeArea()
        {
            if (rectTransform == null)
            {
                return;
            }

            Rect safeArea = Screen.safeArea;
            lastSafeArea = safeArea;
            lastScreenSize = new Vector2Int(Screen.width, Screen.height);
            lastOrientation = Screen.orientation;

            Vector2 anchorMin = safeArea.position;
            Vector2 anchorMax = safeArea.position + safeArea.size;

            if (Screen.width > 0)
            {
                if (applyLeft)
                {
                    anchorMin.x /= Screen.width;
                }
                else
                {
                    anchorMin.x = 0f;
                }

                if (applyRight)
                {
                    anchorMax.x /= Screen.width;
                }
                else
                {
                    anchorMax.x = 1f;
                }
            }

            if (Screen.height > 0)
            {
                if (applyBottom)
                {
                    anchorMin.y /= Screen.height;
                }
                else
                {
                    anchorMin.y = 0f;
                }

                if (applyTop)
                {
                    anchorMax.y /= Screen.height;
                }
                else
                {
                    anchorMax.y = 1f;
                }
            }

            rectTransform.anchorMin = anchorMin;
            rectTransform.anchorMax = anchorMax;
            rectTransform.offsetMin = Vector2.zero;
            rectTransform.offsetMax = Vector2.zero;
        }
    }
}
