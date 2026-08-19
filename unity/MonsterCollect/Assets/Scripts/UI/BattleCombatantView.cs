using MonsterCollect.Appearance;
using MonsterCollect.Battle;
using MonsterCollect.Monster;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Fighter portrait + HP bar + type/status for battle screen.</summary>
    [DisallowMultipleComponent]
    public class BattleCombatantView : MonoBehaviour
    {
        [SerializeField] private RawImage previewImage;
        [SerializeField] private BattleHealthBar healthBar;
        [SerializeField] private Text metaText;
        [SerializeField] private Text statusText;
        [SerializeField] private Text typeText;

        private MonsterPortraitDisplay portraitDisplay;

        private void Awake()
        {
            EnsurePortraitDisplay();
        }

        public void Bind(BattleCombatant combatant)
        {
            if (combatant?.SourceData == null)
            {
                gameObject.SetActive(false);
                return;
            }

            gameObject.SetActive(true);
            EnsurePortraitDisplay();
            portraitDisplay.Bind(combatant.SourceData, 160, animated: true);
            Refresh(combatant);
        }

        public void Refresh(BattleCombatant combatant)
        {
            RefreshHp(combatant);

            if (combatant == null)
            {
                return;
            }

            if (metaText != null)
            {
                metaText.text = $"Lv.{combatant.Level}  ATK {combatant.GetEffectiveAttack()}  DEF {combatant.GetEffectiveDefense()}  SPD {combatant.GetEffectiveSpeed()}";
            }

            if (typeText != null)
            {
                typeText.text = BattleElementUtility.GetShortName(combatant.Element);
            }

            if (statusText != null)
            {
                string status = combatant.GetStatusSummary();
                statusText.text = string.IsNullOrEmpty(status) ? string.Empty : status;
            }
        }

        public void RefreshHp(BattleCombatant combatant)
        {
            if (combatant == null)
            {
                return;
            }

            if (healthBar != null)
            {
                healthBar.Set(combatant.DisplayName, combatant.CurrentHp, combatant.MaxHp);
            }
        }

        public void PlayAttack()
        {
            EnsurePortraitDisplay();
            portraitDisplay?.PlayAttack();
        }

        private void EnsurePortraitDisplay()
        {
            if (portraitDisplay == null && previewImage != null)
            {
                portraitDisplay = previewImage.GetComponent<MonsterPortraitDisplay>();
                if (portraitDisplay == null)
                {
                    portraitDisplay = previewImage.gameObject.AddComponent<MonsterPortraitDisplay>();
                }
            }
        }
    }
}
