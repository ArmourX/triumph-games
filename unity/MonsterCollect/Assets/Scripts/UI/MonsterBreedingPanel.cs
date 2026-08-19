using System;
using MonsterCollect.Appearance;
using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>
    /// Fusion lab overlay — pick two parents, preview the child, and breed.
    /// </summary>
    [DisallowMultipleComponent]
    public class MonsterBreedingPanel : MonoBehaviour
    {
        [SerializeField] private GameObject rootPanel;
        [SerializeField] private RawImage parentAPreview;
        [SerializeField] private RawImage parentBPreview;
        [SerializeField] private RawImage offspringPreview;
        [SerializeField] private Text parentANameText;
        [SerializeField] private Text parentBNameText;
        [SerializeField] private Text offspringNameText;
        [SerializeField] private Text offspringStatsText;
        [SerializeField] private Text affinityText;
        [SerializeField] private Text costText;
        [SerializeField] private Text messageText;
        [SerializeField] private Button pickParentAButton;
        [SerializeField] private Button pickParentBButton;
        [SerializeField] private Button breedButton;
        [SerializeField] private Button closeButton;

        private MonsterData parentA;
        private MonsterData parentB;
        private int selectingSlot = -1;

        public event Action<int> ParentSelectionRequested;
        public event Action BreedingCompleted;

        public bool IsSelectingParent => selectingSlot >= 0;
        public int SelectingSlot => selectingSlot;

        private void Awake()
        {
            if (pickParentAButton != null)
            {
                pickParentAButton.onClick.AddListener(() => BeginParentSelection(0));
            }

            if (pickParentBButton != null)
            {
                pickParentBButton.onClick.AddListener(() => BeginParentSelection(1));
            }

            if (breedButton != null)
            {
                breedButton.onClick.AddListener(OnBreedClicked);
            }

            if (closeButton != null)
            {
                closeButton.onClick.AddListener(Hide);
            }

            HideImmediate();
        }

        public void Show()
        {
            if (rootPanel != null)
            {
                rootPanel.SetActive(true);
            }

            selectingSlot = -1;
            Refresh();
        }

        public void Hide()
        {
            selectingSlot = -1;

            if (rootPanel != null)
            {
                rootPanel.SetActive(false);
            }

            ClearMessage();
        }

        public void HideImmediate()
        {
            selectingSlot = -1;

            if (rootPanel != null)
            {
                rootPanel.SetActive(false);
            }
        }

        public void BeginParentSelection(int slot)
        {
            selectingSlot = slot;
            ShowMessage(slot == 0 ? "Tap a ranch monster for Parent A." : "Tap a ranch monster for Parent B.", true);
            ParentSelectionRequested?.Invoke(slot);
        }

        public void CancelParentSelection()
        {
            selectingSlot = -1;
            ClearMessage();
            RefreshActionState();
        }

        public bool TryAssignParent(MonsterData monster)
        {
            if (monster == null || selectingSlot < 0)
            {
                return false;
            }

            if (selectingSlot == 0)
            {
                parentA = monster;
            }
            else
            {
                parentB = monster;
            }

            selectingSlot = -1;
            Refresh();
            ClearMessage();
            return true;
        }

        public void Refresh()
        {
            RefreshParentSlot(parentA, parentAPreview, parentANameText);
            RefreshParentSlot(parentB, parentBPreview, parentBNameText);
            RefreshPreview();
            RefreshCostText();
            RefreshActionState();
        }

        private void RefreshParentSlot(
            MonsterData monster,
            RawImage image,
            Text nameText)
        {
            if (monster == null)
            {
                if (image != null)
                {
                    image.texture = null;
                }

                if (nameText != null)
                {
                    nameText.text = "—";
                }

                return;
            }

            MonsterPortraitUiHelper.Bind(image, monster, 128, animated: false);

            if (nameText != null)
            {
                nameText.text = monster.Name;
            }
        }

        private void RefreshPreview()
        {
            if (parentA == null || parentB == null || parentA.Id == parentB.Id)
            {
                if (offspringPreview != null)
                {
                    offspringPreview.texture = null;
                }

                if (offspringNameText != null)
                {
                    offspringNameText.text = "Fusion Preview";
                }

                if (offspringStatsText != null)
                {
                    offspringStatsText.text = "Select two different parents.";
                }

                if (affinityText != null)
                {
                    affinityText.text = string.Empty;
                }

                return;
            }

            MonsterData preview = MonsterBreedingService.GeneratePreview(parentA, parentB);
            MonsterPortraitUiHelper.Bind(offspringPreview, preview, 160, animated: true);

            if (offspringNameText != null)
            {
                offspringNameText.text = preview.Name;
            }

            if (offspringStatsText != null)
            {
                offspringStatsText.text =
                    $"HP {preview.Hp}  ATK {preview.Attack}\nDEF {preview.Defense}  SPD {preview.Speed}\n" +
                    $"{preview.Species} · {preview.Rarity}";
            }

            if (affinityText != null)
            {
                affinityText.text = preview.GetTypeAffinities().FormatTopAffinities();
            }
        }

        private void RefreshCostText()
        {
            if (costText == null)
            {
                return;
            }

            double utcNow = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            double cooldown = MonsterBreedingService.GetBreedingCooldownRemaining(utcNow);
            string cooldownLine = cooldown > 0d
                ? $"Cooldown: {Math.Ceiling(cooldown / 60d)}m"
                : "Cooldown: ready";

            costText.text =
                $"Daily energy: {RanchEnergyService.Current}/{RanchEnergyService.DailyMax} (resets midnight)\n" +
                $"Essence: {MonsterCollectionService.RanchEssence} (cost {MonsterBreedingService.EssenceCost})\n" +
                $"Fusion costs {RanchEnergyService.BreedCost} daily energy + {MonsterBreedingService.EssenceCost} essence\n" +
                $"Parents each spend {MonsterBreedingService.ParentEnergyCost:0} care energy\n" +
                $"Breeds today: {MonsterCollectionService.BreedsToday}/{MonsterBreedingService.MaxBreedsPerDay}\n" +
                cooldownLine;
        }

        private void RefreshActionState()
        {
            bool canBreed = parentA != null &&
                            parentB != null &&
                            parentA.Id != parentB.Id &&
                            selectingSlot < 0;

            if (breedButton != null)
            {
                breedButton.interactable = canBreed;
            }
        }

        private void OnBreedClicked()
        {
            if (parentA == null || parentB == null)
            {
                ShowMessage("Select two parents first.", false);
                return;
            }

            double utcNow = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            BreedingActionResult result = MonsterBreedingService.TryBreed(parentA, parentB, utcNow);
            ShowMessage(result.Message, result.Success);

            if (result.Success)
            {
                parentA = MonsterCollectionService.FindById(parentA.Id);
                parentB = MonsterCollectionService.FindById(parentB.Id);
                Refresh();
                BreedingCompleted?.Invoke();
                GameFeedbackService.Instance?.PlayBreeding(
                    offspringPreview != null ? offspringPreview.transform : transform,
                    result.Offspring.PrimaryColor);
            }
            else
            {
                RefreshCostText();
                RefreshActionState();
            }
        }

        private void ShowMessage(string message, bool success)
        {
            if (messageText == null)
            {
                return;
            }

            messageText.text = message;
            messageText.color = success
                ? new Color(0.75f, 0.95f, 0.8f)
                : new Color(0.95f, 0.55f, 0.55f);
        }

        private void ClearMessage()
        {
            if (messageText != null)
            {
                messageText.text = string.Empty;
            }
        }
    }
}
