using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>HP bar showing current / max values.</summary>
    [DisallowMultipleComponent]
    public class BattleHealthBar : MonoBehaviour
    {
        [SerializeField] private Image fillImage;
        [SerializeField] private Text nameText;
        [SerializeField] private Text hpText;
        [SerializeField] private Color healthyColor = new Color(0.2f, 0.78f, 0.4f);
        [SerializeField] private Color lowColor = new Color(0.92f, 0.28f, 0.28f);

        public void WireReferences(Image fill, Text name, Text hp)
        {
            fillImage = fill;
            nameText = name;
            hpText = hp;
        }

        public void Set(string displayName, int currentHp, int maxHp)
        {
            if (nameText != null)
            {
                nameText.text = displayName;
            }

            if (hpText != null)
            {
                hpText.text = $"{Mathf.Max(0, currentHp)} / {maxHp}";
            }

            if (fillImage != null)
            {
                float percent = maxHp > 0 ? (float)currentHp / maxHp : 0f;
                fillImage.fillAmount = Mathf.Clamp01(percent);
                fillImage.color = percent < 0.25f ? lowColor : healthyColor;
            }
        }
    }
}
