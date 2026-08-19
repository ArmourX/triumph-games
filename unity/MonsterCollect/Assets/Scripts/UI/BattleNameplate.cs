using MonsterCollect.Battle;
using MonsterCollect.Monster;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Compact fighter banner: name, stars, level, and HP bar.</summary>
    [DisallowMultipleComponent]
    public class BattleNameplate : MonoBehaviour
    {
        [SerializeField] private Image bannerImage;
        [SerializeField] private Text nameText;
        [SerializeField] private Text starsText;
        [SerializeField] private Text levelText;
        [SerializeField] private BattleHealthBar healthBar;

        public BattleHealthBar HealthBar => healthBar;

        public void WireReferences(Image banner, Text name, Text stars, Text level, BattleHealthBar bar)
        {
            bannerImage = banner;
            nameText = name;
            starsText = stars;
            levelText = level;
            healthBar = bar;
        }

        public void Set(BattleCombatant combatant)
        {
            if (combatant == null)
            {
                return;
            }

            if (nameText != null)
            {
                nameText.text = combatant.DisplayName;
            }

            if (levelText != null)
            {
                levelText.text = $"LV. {combatant.Level}";
            }

            if (starsText != null)
            {
                int stars = GetStarCount(combatant);
                starsText.text = new string('★', stars);
            }

            healthBar?.Set(combatant.DisplayName, combatant.CurrentHp, combatant.MaxHp);
        }

        private static int GetStarCount(BattleCombatant combatant)
        {
            if (combatant.SourceData != null)
            {
                return Mathf.Clamp((int)combatant.SourceData.Rarity + 1, 1, 5);
            }

            return Mathf.Clamp((combatant.Level + 1) / 2, 1, 5);
        }
    }
}
