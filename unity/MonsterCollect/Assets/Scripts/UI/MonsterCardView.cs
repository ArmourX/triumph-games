using System;
using MonsterCollect.Appearance;
using MonsterCollect.Monster;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>
    /// Compact monster card for the ranch grid.
    /// </summary>
    [DisallowMultipleComponent]
    public class MonsterCardView : MonoBehaviour
    {
        [SerializeField] private Image backgroundImage;
        [SerializeField] private Image accentImage;
        [SerializeField] private RawImage previewImage;
        [SerializeField] private Text nameText;
        [SerializeField] private Text metaText;
        [SerializeField] private Text statsText;
        [SerializeField] private GameObject activeBadge;
        [SerializeField] private GameObject selectionHighlight;
        [SerializeField] private Button selectButton;

        private MonsterData boundMonster;
        private MonsterPortraitDisplay portraitDisplay;

        public event Action<MonsterData> CardSelected;

        private void Awake()
        {
            if (selectButton != null)
            {
                selectButton.onClick.AddListener(OnSelectClicked);
            }

            EnsurePortraitDisplay();
        }

        private void OnDestroy()
        {
            if (selectButton != null)
            {
                selectButton.onClick.RemoveListener(OnSelectClicked);
            }
        }

        public void Bind(MonsterData monster, bool isActive, bool isSelected = false)
        {
            boundMonster = monster;

            if (selectionHighlight != null)
            {
                selectionHighlight.SetActive(isSelected);
            }

            if (monster == null)
            {
                gameObject.SetActive(false);
                return;
            }

            gameObject.SetActive(true);

            if (backgroundImage != null)
            {
                backgroundImage.color = new Color(monster.PrimaryColor.r, monster.PrimaryColor.g, monster.PrimaryColor.b, 0.35f);
            }

            if (accentImage != null)
            {
                accentImage.color = monster.SecondaryColor;
            }

            EnsurePortraitDisplay();
            portraitDisplay.Bind(monster, 128, animated: false);

            if (nameText != null)
            {
                nameText.text = monster.Name;
            }

            if (metaText != null)
            {
                string fusionTag = monster.IsBred ? " · Fusion" : string.Empty;
                metaText.text = $"#{monster.DexNumber:D3} · {monster.Species} · {monster.Rarity}{fusionTag}";
            }

            if (statsText != null)
            {
                statsText.text = $"HP {monster.Hp}  ATK {monster.Attack}\nDEF {monster.Defense}  SPD {monster.Speed}";
            }

            if (activeBadge != null)
            {
                activeBadge.SetActive(isActive);
            }
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

        private void OnSelectClicked()
        {
            if (boundMonster != null)
            {
                CardSelected?.Invoke(boundMonster);
            }
        }
    }
}
