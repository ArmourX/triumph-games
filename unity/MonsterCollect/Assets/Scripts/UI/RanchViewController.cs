using System.Collections.Generic;
using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Ranch;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>
    /// Ranch scene controller — grid of owned monsters with detail overlay.
    /// </summary>
    [DisallowMultipleComponent]
    public class RanchViewController : MonoBehaviour
    {
        [SerializeField] private Text headerText;
        [SerializeField] private Text countText;
        [SerializeField] private Text emptyStateText;
        [SerializeField] private Transform cardContainer;
        [SerializeField] private MonsterCardView cardPrefab;
        [SerializeField] private MonsterDetailPanel detailPanel;
        [SerializeField] private MonsterRaisingPanel raisingPanel;
        [SerializeField] private MonsterBreedingPanel breedingPanel;
        [SerializeField] private Button openBreedingButton;
        [SerializeField] private Button adventureButton;
        [SerializeField] private Button socialButton;
        [SerializeField] private Button scanShortcutButton;

        private readonly List<MonsterCardView> cardPool = new List<MonsterCardView>();
        private string selectedParentId;

        private void OnEnable()
        {
            MonsterCollectionService.CollectionChanged += Refresh;
        }

        private void OnDisable()
        {
            MonsterCollectionService.CollectionChanged -= Refresh;
        }

        private void Start()
        {
            if (detailPanel != null)
            {
                detailPanel.CollectionChanged += Refresh;
            }

            if (breedingPanel != null)
            {
                breedingPanel.ParentSelectionRequested += OnParentSelectionRequested;
                breedingPanel.BreedingCompleted += Refresh;
            }

            if (openBreedingButton != null)
            {
                openBreedingButton.onClick.AddListener(OpenBreedingPanel);
            }

            if (adventureButton != null)
            {
                adventureButton.onClick.AddListener(AdventureHubPanel.ShowPanel);
            }

            if (socialButton != null)
            {
                socialButton.onClick.AddListener(SocialHubPanel.ShowPanel);
            }

            if (scanShortcutButton != null)
            {
                scanShortcutButton.onClick.AddListener(() => UnityEngine.SceneManagement.SceneManager.LoadScene(GameScenes.Scan));
            }

            Refresh();
            if (TournamentHubPanel.ConsumeShowOnLoad())
            {
                TournamentHubPanel.ShowPanel();
            }
        }

        private void OnDestroy()
        {
            if (detailPanel != null)
            {
                detailPanel.CollectionChanged -= Refresh;
            }

            if (breedingPanel != null)
            {
                breedingPanel.ParentSelectionRequested -= OnParentSelectionRequested;
                breedingPanel.BreedingCompleted -= Refresh;
            }

            if (openBreedingButton != null)
            {
                openBreedingButton.onClick.RemoveListener(OpenBreedingPanel);
            }

            if (adventureButton != null)
            {
                adventureButton.onClick.RemoveListener(AdventureHubPanel.ShowPanel);
            }

            if (socialButton != null)
            {
                socialButton.onClick.RemoveListener(SocialHubPanel.ShowPanel);
            }

            if (scanShortcutButton != null)
            {
                scanShortcutButton.onClick.RemoveAllListeners();
            }
        }

        public void OpenBreedingPanel()
        {
            detailPanel?.Hide();
            breedingPanel?.Show();
            selectedParentId = null;
            Refresh();
        }

        private void OnParentSelectionRequested(int slot)
        {
            selectedParentId = null;
            Refresh();
        }

        public void Refresh()
        {
            raisingPanel?.Refresh();

            IReadOnlyList<MonsterData> monsters = MonsterCollectionService.Monsters;
            string activeId = MonsterCollectionService.ActiveMonsterId;
            int count = monsters.Count;

            if (headerText != null)
            {
                headerText.text = WorldCycleService.GetSummary();
                UiSkinUtility.StyleTitle(headerText);
            }

            if (countText != null)
            {
                countText.text = $"{count}/{MonsterCollectionService.MaxRanchSlots}";
                UiSkinUtility.StyleMuted(countText);
            }

            if (emptyStateText != null)
            {
                emptyStateText.gameObject.SetActive(count == 0);
                emptyStateText.text = "Scan a QR code to hatch your first QRmon.";
            }

            EnsureCardPool(count);

            for (int i = 0; i < cardPool.Count; i++)
            {
                MonsterCardView card = cardPool[i];
                bool active = i < count;
                card.gameObject.SetActive(active);

                if (active)
                {
                    MonsterData monster = monsters[i];
                    bool isSelected = !string.IsNullOrEmpty(selectedParentId) && monster.Id == selectedParentId;
                    card.Bind(monster, monster.Id == activeId, isSelected);
                }
                else
                {
                    card.Bind(null, false);
                }
            }
        }

        private void EnsureCardPool(int requiredCount)
        {
            while (cardPool.Count < requiredCount)
            {
                MonsterCardView card = Instantiate(cardPrefab, cardContainer);
                card.CardSelected += OnCardSelected;
                card.gameObject.SetActive(true);
                cardPool.Add(card);
            }
        }

        private void OnCardSelected(MonsterData monster)
        {
            if (breedingPanel != null && breedingPanel.IsSelectingParent)
            {
                if (breedingPanel.TryAssignParent(monster))
                {
                    selectedParentId = monster.Id;
                    Refresh();
                }

                return;
            }

            if (detailPanel != null)
            {
                detailPanel.Show(monster);
            }
        }
    }
}
