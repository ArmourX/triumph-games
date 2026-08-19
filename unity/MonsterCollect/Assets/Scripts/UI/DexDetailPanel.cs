using MonsterCollect.Appearance;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Detail overlay — full stats when unlocked, ??? when locked.</summary>
    [DisallowMultipleComponent]
    public class DexDetailPanel : MonoBehaviour
    {
        [SerializeField] private GameObject rootPanel;
        [SerializeField] private RawImage previewImage;
        [SerializeField] private Text numberText;
        [SerializeField] private Text nameText;
        [SerializeField] private Text metaText;
        [SerializeField] private Text statsText;
        [SerializeField] private Button closeButton;

        private void Awake()
        {
            if (closeButton != null)
            {
                closeButton.onClick.AddListener(Hide);
            }

            HideImmediate();
        }

        private void OnDestroy()
        {
            if (closeButton != null)
            {
                closeButton.onClick.RemoveListener(Hide);
            }
        }

        public void Show(DexEntry entry, bool isUnlocked)
        {
            if (entry == null)
            {
                return;
            }

            if (numberText != null)
            {
                numberText.text = $"#{entry.FormattedNumber}";
            }

            if (isUnlocked)
            {
                ShowUnlocked(entry);
            }
            else
            {
                ShowLocked();
            }

            if (rootPanel != null)
            {
                rootPanel.SetActive(true);
            }

            gameObject.SetActive(true);
        }

        private void ShowUnlocked(DexEntry entry)
        {
            MonsterData preview = entry.ToPreviewMonster();

            if (previewImage != null)
            {
                previewImage.color = Color.white;
            }

            MonsterPortraitUiHelper.Bind(previewImage, preview, 256, animated: true);

            if (nameText != null)
            {
                nameText.text = entry.Name;
            }

            if (metaText != null)
            {
                metaText.text = $"{entry.Species} · {entry.Rarity}";
            }

            if (statsText != null)
            {
                statsText.text =
                    $"Base Stats\n" +
                    $"HP  {entry.BaseHp}\n" +
                    $"ATK {entry.BaseAttack}\n" +
                    $"DEF {entry.BaseDefense}\n" +
                    $"SPD {entry.BaseSpeed}\n\n" +
                    MonsterBookService.BuildEvolutionFormSummary(entry.DexNumber);
            }
        }

        private void ShowLocked()
        {
            if (previewImage != null)
            {
                previewImage.texture = null;
                previewImage.color = new Color(0.1f, 0.1f, 0.12f, 1f);
            }

            if (nameText != null)
            {
                nameText.text = "???";
            }

            if (metaText != null)
            {
                metaText.text = "Unknown";
            }

            if (statsText != null)
            {
                statsText.text =
                    "This monster has not been discovered yet.\n\n" +
                    "Scan a QR code that maps to this dex entry to reveal its stats.";
            }
        }

        public void Hide()
        {
            if (rootPanel != null)
            {
                rootPanel.SetActive(false);
            }
        }

        private void HideImmediate()
        {
            Hide();
        }
    }
}
