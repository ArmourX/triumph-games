using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Simple labeled fill bar for care meters (0–100).</summary>
    [DisallowMultipleComponent]
    public class CareMeterBar : MonoBehaviour
    {
        [SerializeField] private Image fillImage;
        [SerializeField] private Text labelText;
        [SerializeField] private Text valueText;
        [SerializeField] private Color healthyColor = new Color(0.2f, 0.78f, 0.4f);
        [SerializeField] private Color warningColor = new Color(0.95f, 0.75f, 0.15f);
        [SerializeField] private Color criticalColor = new Color(0.92f, 0.28f, 0.28f);

        public void Set(string label, float value)
        {
            float clamped = Mathf.Clamp(value, 0f, 100f);

            if (labelText != null)
            {
                labelText.text = label;
            }

            if (valueText != null)
            {
                valueText.text = $"{Mathf.RoundToInt(clamped)}";
            }

            if (fillImage != null)
            {
                fillImage.fillAmount = clamped / 100f;
                fillImage.color = clamped < 20f ? criticalColor : clamped < 40f ? warningColor : healthyColor;
            }
        }
    }
}
