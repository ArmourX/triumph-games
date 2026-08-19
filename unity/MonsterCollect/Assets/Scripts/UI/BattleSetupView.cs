using System.Collections.Generic;
using MonsterCollect.Battle;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Ranch;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Pre-battle monster and opponent selection.</summary>
    [DisallowMultipleComponent]
    public class BattleSetupView : MonoBehaviour
    {
        [SerializeField] private GameObject rootPanel;
        [SerializeField] private Text headerText;
        [SerializeField] private Text emptyText;
        [SerializeField] private Transform cardContainer;
        [SerializeField] private MonsterCardView cardPrefab;
        [SerializeField] private Toggle wildOpponentToggle;
        [SerializeField] private Dropdown ownedOpponentDropdown;
        [SerializeField] private Button startButton;
        [SerializeField] private Text hintText;

        private readonly List<MonsterCardView> cardPool = new List<MonsterCardView>();
        private string selectedPlayerMonsterId;

        public event System.Action<string, BattleOpponentMode, string> SetupConfirmed;

        private void Awake()
        {
            if (startButton != null)
            {
                startButton.onClick.AddListener(OnStartClicked);
            }

            if (wildOpponentToggle != null)
            {
                wildOpponentToggle.onValueChanged.AddListener(OnWildToggleChanged);
            }
        }

        private void OnEnable()
        {
            Refresh();
        }

        public void Show()
        {
            if (rootPanel != null)
            {
                rootPanel.SetActive(true);
            }

            Refresh();
        }

        public void ShowHint(string message)
        {
            if (hintText != null)
            {
                hintText.text = message;
            }
        }

        public void Hide()
        {
            if (rootPanel != null)
            {
                rootPanel.SetActive(false);
            }
        }

        public void Refresh()
        {
            IReadOnlyList<MonsterData> monsters = MonsterCollectionService.Monsters;
            int count = monsters.Count;

            if (headerText != null)
            {
                headerText.text = "Choose Your Fighter";
            }

            if (emptyText != null)
            {
                emptyText.gameObject.SetActive(count == 0);
            }

            if (count == 0)
            {
                selectedPlayerMonsterId = null;
                UpdateStartButton();
                return;
            }

            if (string.IsNullOrEmpty(selectedPlayerMonsterId))
            {
                selectedPlayerMonsterId = FindFirstBattleReadyMonsterId()
                    ?? MonsterCollectionService.ActiveMonsterId
                    ?? monsters[0].Id;
            }

            EnsureCardPool(count);

            for (int i = 0; i < cardPool.Count; i++)
            {
                MonsterCardView card = cardPool[i];

                if (i < count)
                {
                    MonsterData monster = monsters[i];
                    bool isSelected = monster.Id == selectedPlayerMonsterId;
                    card.Bind(monster, isSelected);
                    card.CardSelected -= OnCardSelected;
                    card.CardSelected += OnCardSelected;
                }
                else
                {
                    card.Bind(null, false);
                    card.CardSelected -= OnCardSelected;
                }
            }

            RefreshOpponentDropdown(monsters);
            UpdateStartButton();
        }

        private void RefreshOpponentDropdown(IReadOnlyList<MonsterData> monsters)
        {
            if (ownedOpponentDropdown == null)
            {
                return;
            }

            ownedOpponentDropdown.ClearOptions();
            var options = new List<string>();

            foreach (MonsterData monster in monsters)
            {
                if (monster.Id == selectedPlayerMonsterId)
                {
                    continue;
                }

                options.Add($"{monster.Name} (#{monster.DexNumber:D3})");
            }

            if (options.Count == 0)
            {
                options.Add("No other monsters");
            }

            ownedOpponentDropdown.AddOptions(options);
            bool useWild = wildOpponentToggle == null || wildOpponentToggle.isOn;
            ownedOpponentDropdown.interactable = !useWild && options.Count > 0 && options[0] != "No other monsters";

            if (hintText != null)
            {
                hintText.text = useWild
                    ? "Opponent: random wild monster"
                    : "Opponent: selected ranch monster (test mode)";
            }
        }

        private void OnCardSelected(MonsterData monster)
        {
            selectedPlayerMonsterId = monster.Id;
            Refresh();
        }

        private void OnWildToggleChanged(bool isWild)
        {
            RefreshOpponentDropdown(MonsterCollectionService.Monsters);
        }

        private void OnStartClicked()
        {
            if (string.IsNullOrEmpty(selectedPlayerMonsterId))
            {
                return;
            }

            bool useWild = wildOpponentToggle == null || wildOpponentToggle.isOn;
            BattleOpponentMode mode = useWild ? BattleOpponentMode.Wild : BattleOpponentMode.OwnedTest;
            string opponentId = null;

            if (!useWild)
            {
                opponentId = ResolveSelectedOpponentId();
                if (string.IsNullOrEmpty(opponentId))
                {
                    return;
                }
            }

            BattleSession.Configure(selectedPlayerMonsterId, mode, opponentId);
            SetupConfirmed?.Invoke(selectedPlayerMonsterId, mode, opponentId);
        }

        private string ResolveSelectedOpponentId()
        {
            int optionIndex = ownedOpponentDropdown != null ? ownedOpponentDropdown.value : 0;
            int index = 0;

            foreach (MonsterData monster in MonsterCollectionService.Monsters)
            {
                if (monster.Id == selectedPlayerMonsterId)
                {
                    continue;
                }

                if (index == optionIndex)
                {
                    return monster.Id;
                }

                index++;
            }

            return null;
        }

        private void EnsureCardPool(int required)
        {
            while (cardPool.Count < required)
            {
                MonsterCardView card = Instantiate(cardPrefab, cardContainer);
                card.gameObject.SetActive(true);
                cardPool.Add(card);
            }
        }

        private void UpdateStartButton()
        {
            if (startButton != null)
            {
                MonsterData selected = MonsterCollectionService.FindById(selectedPlayerMonsterId);
                startButton.interactable = CanEnterBattle(selected);
            }
        }

        private static string FindFirstBattleReadyMonsterId()
        {
            foreach (MonsterData monster in MonsterCollectionService.Monsters)
            {
                if (CanEnterBattle(monster))
                {
                    return monster.Id;
                }
            }

            return null;
        }

        private static bool CanEnterBattle(MonsterData monster)
        {
            if (monster?.Raising == null)
            {
                return false;
            }

            return !monster.Raising.isRetired && !monster.Raising.isOnErrantry;
        }
    }
}
