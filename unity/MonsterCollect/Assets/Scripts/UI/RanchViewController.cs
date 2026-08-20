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

        public GameObject CollectionScreenRoot
        {
            get
            {
                if (cardContainer == null)
                {
                    return null;
                }

                Transform node = cardContainer;
                while (node != null)
                {
                    if (node.name == "Content")
                    {
                        return node.gameObject;
                    }

                    node = node.parent;
                }

                return null;
            }
        }

        private readonly List<MonsterCardView> cardPool = new List<MonsterCardView>();
        private readonly List<MonsterData> filteredMonsters = new List<MonsterData>();
        private string selectedParentId;
        private bool refreshing;
        private Dropdown rarityFilterDropdown;
        private MonsterRarity? selectedRarityFilter;
        private bool filterBarBuilt;
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

            if (headerText != null)
            {
                UiSkinUtility.StyleTitle(headerText);
            }

            if (countText != null)
            {
                UiSkinUtility.StyleBody(countText);
            }

            if (emptyStateText != null)
            {
                UiSkinUtility.StyleBody(emptyStateText);
            }

            try
            {
                EnsureFilterBar();
            }
            catch (System.Exception exception)
            {
                Debug.LogError($"[RanchView] Filter bar failed: {exception.Message}");
            }

            Refresh();
            HomeHubController.Install(this);
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

            if (rarityFilterDropdown != null)
            {
                rarityFilterDropdown.onValueChanged.RemoveListener(OnRarityFilterChanged);
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
            if (refreshing)
            {
                return;
            }

            refreshing = true;
            try
            {
            raisingPanel?.Refresh();

            IReadOnlyList<MonsterData> monsters = MonsterCollectionService.Monsters;
            filteredMonsters.Clear();
            filteredMonsters.AddRange(RanchCollectionFilter.Apply(monsters, selectedRarityFilter));
            string activeId = MonsterCollectionService.ActiveMonsterId;
            int totalCount = monsters.Count;
            int visibleCount = filteredMonsters.Count;

            if (headerText != null)
            {
                headerText.text = WorldCycleService.GetSummary();
                UiSkinUtility.StyleTitle(headerText);
            }

            if (countText != null)
            {
                if (selectedRarityFilter.HasValue && visibleCount != totalCount)
                {
                    countText.text = $"{visibleCount} shown · {totalCount}/{MonsterCollectionService.MaxRanchSlots}";
                }
                else
                {
                    countText.text = $"{totalCount}/{MonsterCollectionService.MaxRanchSlots}";
                }

                UiSkinUtility.StyleMuted(countText);
            }

            if (emptyStateText != null)
            {
                if (totalCount == 0)
                {
                    emptyStateText.gameObject.SetActive(true);
                    emptyStateText.text = "Scan a QR code to hatch your first QRmon.";
                }
                else if (visibleCount == 0)
                {
                    emptyStateText.gameObject.SetActive(true);
                    emptyStateText.text = $"No {selectedRarityFilter.Value} monsters in your ranch.";
                }
                else
                {
                    emptyStateText.gameObject.SetActive(false);
                }
            }

            EnsureCardPool(visibleCount);

            for (int i = 0; i < cardPool.Count; i++)
            {
                MonsterCardView card = cardPool[i];
                bool active = i < visibleCount;
                card.gameObject.SetActive(active);

                if (active)
                {
                    MonsterData monster = filteredMonsters[i];
                    bool isSelected = !string.IsNullOrEmpty(selectedParentId) && monster.Id == selectedParentId;
                    card.Bind(monster, monster.Id == activeId, isSelected);
                }
                else
                {
                    card.Bind(null, false);
                }
            }
            }
            finally
            {
                refreshing = false;
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

        private void EnsureFilterBar()
        {
            if (filterBarBuilt || cardContainer == null)
            {
                return;
            }

            Transform scrollRoot = cardContainer.parent != null ? cardContainer.parent.parent : null;
            Transform contentRoot = scrollRoot != null ? scrollRoot.parent : null;
            if (contentRoot == null)
            {
                return;
            }

            if (scrollRoot is RectTransform scrollRect)
            {
                if (scrollRect.anchorMax.y > 0.815f)
                {
                    scrollRect.anchorMax = new Vector2(scrollRect.anchorMax.x, 0.815f);
                }
            }

            Font font = MobileGameUiKit.BodyFont;
            if (font == null)
            {
                font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            }

            var filterGo = new GameObject("CollectionFilterBar", typeof(RectTransform), typeof(Image));
            filterGo.transform.SetParent(contentRoot, false);
            var filterRect = filterGo.GetComponent<RectTransform>();
            filterRect.anchorMin = new Vector2(0.58f, 0.815f);
            filterRect.anchorMax = new Vector2(0.99f, 0.885f);
            filterRect.offsetMin = Vector2.zero;
            filterRect.offsetMax = Vector2.zero;

            Image filterBg = filterGo.GetComponent<Image>();
            UiSkinUtility.ApplyModalPanel(filterBg);
            filterBg.color = new Color(1f, 1f, 1f, 0.42f);

            Text rarityLabel = CreateFilterLabel(filterGo.transform, font, "Rarity", new Vector2(0.03f, 0.14f), new Vector2(0.18f, 0.86f));
            UiSkinUtility.StyleMuted(rarityLabel);

            rarityFilterDropdown = CreateRarityDropdown(filterGo.transform, new Vector2(0.19f, 0.12f), new Vector2(0.62f, 0.88f));
            PopulateRarityFilterOptions();
            rarityFilterDropdown.onValueChanged.AddListener(OnRarityFilterChanged);

            Text sortLabel = CreateFilterLabel(filterGo.transform, font, "Level high → low", new Vector2(0.64f, 0.14f), new Vector2(0.97f, 0.86f));
            sortLabel.alignment = TextAnchor.MiddleRight;
            UiSkinUtility.StyleMuted(sortLabel);

            filterBarBuilt = true;
        }

        private static Text CreateFilterLabel(Transform parent, Font font, string text, Vector2 anchorMin, Vector2 anchorMax)
        {
            var go = new GameObject("Label", typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            Text label = go.GetComponent<Text>();
            label.font = font;
            label.fontSize = 20;
            label.fontStyle = FontStyle.Bold;
            label.alignment = TextAnchor.MiddleLeft;
            label.color = Color.white;
            label.text = text;
            label.raycastTarget = false;
            return label;
        }

        private static Dropdown CreateRarityDropdown(Transform parent, Vector2 anchorMin, Vector2 anchorMax)
        {
            GameObject dropdownGo = DefaultControls.CreateDropdown(new DefaultControls.Resources());
            dropdownGo.name = "RarityFilter";
            dropdownGo.transform.SetParent(parent, false);

            RectTransform dropdownRect = dropdownGo.GetComponent<RectTransform>();
            dropdownRect.anchorMin = anchorMin;
            dropdownRect.anchorMax = anchorMax;
            dropdownRect.offsetMin = Vector2.zero;
            dropdownRect.offsetMax = Vector2.zero;

            Dropdown dropdown = dropdownGo.GetComponent<Dropdown>();
            UiSkinUtility.StyleDropdown(dropdown);
            return dropdown;
        }

        private void PopulateRarityFilterOptions()
        {
            if (rarityFilterDropdown == null)
            {
                return;
            }

            var options = new List<string> { "All rarities" };
            options.Add(MonsterRarity.Common.ToString());
            options.Add(MonsterRarity.Uncommon.ToString());
            options.Add(MonsterRarity.Rare.ToString());
            options.Add(MonsterRarity.Epic.ToString());
            options.Add(MonsterRarity.Legendary.ToString());
            rarityFilterDropdown.ClearOptions();
            rarityFilterDropdown.AddOptions(options);
            rarityFilterDropdown.SetValueWithoutNotify(0);
            rarityFilterDropdown.RefreshShownValue();
            UiSkinUtility.StyleDropdown(rarityFilterDropdown);
        }

        private void OnRarityFilterChanged(int optionIndex)
        {
            if (optionIndex <= 0)
            {
                selectedRarityFilter = null;
            }
            else
            {
                selectedRarityFilter = (MonsterRarity)(optionIndex - 1);
            }

            Refresh();
        }
    }
}
