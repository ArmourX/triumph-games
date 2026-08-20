using MonsterCollect.Appearance;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>
    /// Modal popup shown when a new monster is born from a QR scan.
    /// </summary>
    [DisallowMultipleComponent]
    public class MonsterBornPopup : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject rootPanel;
        [SerializeField] private Text titleText;
        [SerializeField] private Text detailsText;
        [SerializeField] private RawImage previewImage;
        [SerializeField] private Button dismissButton;

        private bool dismissWired;

        private void Awake()
        {
            WireDismissButton();
        }

        private void WireDismissButton()
        {
            if (dismissWired || dismissButton == null)
            {
                return;
            }

            dismissButton.onClick.AddListener(Hide);
            dismissWired = true;
        }

        private void OnDestroy()
        {
            if (dismissButton != null)
            {
                dismissButton.onClick.RemoveListener(Hide);
            }
        }

        public void Show(MonsterData monster, string title = "Monster Born!", string subtitle = null)
        {
            if (monster == null)
            {
                return;
            }

            WireDismissButton();
            KitUi.RestyleExisting(transform);

            if (!gameObject.activeSelf)
            {
                gameObject.SetActive(true);
            }

            MonsterPortraitUiHelper.Bind(previewImage, monster, 256, animated: false);

            if (titleText != null)
            {
                titleText.text = title;
            }

            if (detailsText != null)
            {
                string intro = string.IsNullOrEmpty(subtitle) ? string.Empty : subtitle + "\n\n";
                detailsText.text =
                    intro +
                    $"<b>{monster.Name}</b>  <color=#FFD966>#{monster.DexNumber:D3}</color>\n" +
                    $"{monster.Species} · {monster.Rarity}\n" +
                    $"ID: {monster.Id}\n\n" +
                    $"HP {monster.Hp}  ATK {monster.Attack}\n" +
                    $"DEF {monster.Defense}  SPD {monster.Speed}";
            }

            if (rootPanel != null)
            {
                rootPanel.SetActive(true);
            }
        }

        public void Show(MonsterData monster)
        {
            Show(monster, "Monster Born!", null);
        }

        public void ShowAlreadyScanned(string hashId)
        {
            if (previewImage != null)
            {
                previewImage.texture = null;
            }

            ShowMessage(
                "Already Scanned",
                "You already captured a monster from this QR code.\n\n" +
                $"ID: {hashId.Substring(0, Mathf.Min(16, hashId.Length))}");
        }

        public void ShowRanchFull()
        {
            if (previewImage != null)
            {
                previewImage.texture = null;
            }

            ShowMessage(
                "Ranch Full",
                $"Your ranch is full ({MonsterCollectionService.MaxMonsters}/{MonsterCollectionService.MaxMonsters}).\n\n" +
                "Visit the Ranch to manage your monsters, then scan again.");
        }

        public void ShowMessage(string title, string body)
        {
            if (titleText != null)
            {
                titleText.text = title;
            }

            if (detailsText != null)
            {
                detailsText.text = body;
            }

            if (rootPanel != null)
            {
                rootPanel.SetActive(true);
            }

            if (!gameObject.activeSelf)
            {
                gameObject.SetActive(true);
            }
        }

        public void Hide()
        {
            if (rootPanel != null)
            {
                rootPanel.SetActive(false);
            }
        }
    }
}
