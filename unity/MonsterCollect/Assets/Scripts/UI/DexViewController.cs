using System.Collections.Generic;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>
    /// Full dex grid (#001–#500). Locked entries appear as ??? but remain clickable.
    /// </summary>
    [DisallowMultipleComponent]
    public class DexViewController : MonoBehaviour
    {
        [SerializeField] private Text headerText;
        [SerializeField] private Text countText;
        [SerializeField] private Text emptyStateText;
        [SerializeField] private Transform cardContainer;
        [SerializeField] private DexEntryCardView cardPrefab;
        [SerializeField] private DexDetailPanel detailPanel;

        private readonly List<DexEntryCardView> cardPool = new List<DexEntryCardView>();

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
            Refresh();
        }

        public void Refresh()
        {
            DexEntry[] allEntries = DexCatalog.GetAllEntries();
            int total = allEntries.Length;
            int discovered = MonsterCollectionService.UnlockedDexCount;

            if (headerText != null)
            {
                headerText.text = "Monster Book";
            }

            if (countText != null)
            {
                int variants = MonsterBookService.VariantCount;
                countText.text =
                    $"{discovered} / {total} species  ·  {variants} variants  ·  {(MonsterBookService.GetCompletionRatio() * 100f):0}%";
            }

            if (emptyStateText != null)
            {
                emptyStateText.gameObject.SetActive(discovered == 0);
                emptyStateText.text = "Tap ??? entries after scanning to reveal monster data.";
            }

            EnsureCardPool(total);

            for (int i = 0; i < cardPool.Count; i++)
            {
                DexEntryCardView card = cardPool[i];
                bool active = i < total;
                card.gameObject.SetActive(active);

                if (active)
                {
                    DexEntry entry = allEntries[i];
                    bool unlocked = MonsterCollectionService.IsDexUnlocked(entry.DexNumber);
                    card.Bind(entry, unlocked);
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
                DexEntryCardView card = Instantiate(cardPrefab, cardContainer);
                card.EntrySelected += OnEntrySelected;
                card.gameObject.SetActive(true);
                cardPool.Add(card);
            }
        }

        private void OnEntrySelected(DexEntry entry, bool isUnlocked)
        {
            if (detailPanel != null)
            {
                detailPanel.Show(entry, isUnlocked);
            }
        }
    }
}
