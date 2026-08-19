using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Floating "+2 ATK" style feedback text.</summary>
    [DisallowMultipleComponent]
    public class StatChangeFeedback : MonoBehaviour
    {
        [SerializeField] private Text feedbackText;
        [SerializeField] private float duration = 1.2f;
        [SerializeField] private float riseDistance = 60f;

        private Coroutine activeRoutine;
        private RectTransform rectTransform;
        private Vector2 restPosition;
        private Color restColor;

        private void Awake()
        {
            rectTransform = GetComponent<RectTransform>();

            if (feedbackText != null)
            {
                restColor = feedbackText.color;
            }

            if (rectTransform != null)
            {
                restPosition = rectTransform.anchoredPosition;
            }

            HideImmediate();
        }

        public void Show(string message, Color? color = null)
        {
            if (feedbackText == null || rectTransform == null)
            {
                return;
            }

            if (activeRoutine != null)
            {
                StopCoroutine(activeRoutine);
            }

            feedbackText.text = message;
            feedbackText.color = color ?? new Color(0.4f, 1f, 0.5f);
            gameObject.SetActive(true);
            activeRoutine = StartCoroutine(AnimateRoutine());
        }

        private IEnumerator AnimateRoutine()
        {
            rectTransform.anchoredPosition = restPosition;
            rectTransform.localScale = Vector3.one * 0.85f;

            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.unscaledDeltaTime;
                float t = elapsed / duration;

                rectTransform.anchoredPosition = restPosition + Vector2.up * (riseDistance * t);
                rectTransform.localScale = Vector3.one * Mathf.Lerp(1.1f, 1f, t);

                Color color = feedbackText.color;
                color.a = 1f - t;
                feedbackText.color = color;

                yield return null;
            }

            HideImmediate();
            activeRoutine = null;
        }

        private void HideImmediate()
        {
            if (feedbackText != null)
            {
                Color color = restColor;
                color.a = 0f;
                feedbackText.color = color;
            }

            if (rectTransform != null)
            {
                rectTransform.anchoredPosition = restPosition;
            }

            gameObject.SetActive(false);
        }
    }
}
