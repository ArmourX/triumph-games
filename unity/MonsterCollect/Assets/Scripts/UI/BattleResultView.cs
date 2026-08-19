using MonsterCollect.Appearance;
using MonsterCollect.Battle;
using MonsterCollect.Circuit;
using MonsterCollect.Core;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Cinematic victory / defeat overlay with rewards and match summary.</summary>
    [DisallowMultipleComponent]
    public class BattleResultView : MonoBehaviour
    {
        [SerializeField] private GameObject rootPanel;
        [SerializeField] private Text leagueText;
        [SerializeField] private Text titleText;
        [SerializeField] private Text xpGainText;
        [SerializeField] private Text playerStatsText;
        [SerializeField] private Text opponentStatsText;
        [SerializeField] private Text rewardXpText;
        [SerializeField] private Text rewardCoinsText;
        [SerializeField] private Text rewardEssenceText;
        [SerializeField] private Text starsText;
        [SerializeField] private Text detailsText;
        [SerializeField] private RawImage playerPortrait;
        [SerializeField] private Button continueButton;
        [SerializeField] private Image backdrop;
        [SerializeField] private RectTransform confettiRoot;

        private MonsterPortraitDisplay playerDisplay;
        private bool layoutBuilt;
        private bool showing;
        private float confettiTime;

        public event System.Action ContinueRequested;

        public static BattleResultView Create(Transform parent)
        {
            var go = new GameObject("BattleResult", typeof(RectTransform));
            go.transform.SetParent(parent, false);
            BattleOverlayUi.Stretch(go.GetComponent<RectTransform>());
            var view = go.AddComponent<BattleResultView>();
            view.rootPanel = go;
            view.EnsureLayout();
            go.SetActive(false);
            return view;
        }

        private void Awake()
        {
            EnsureLayout();
            if (continueButton != null)
            {
                continueButton.onClick.RemoveListener(OnContinue);
                continueButton.onClick.AddListener(OnContinue);
            }

            if (!showing)
            {
                Hide();
            }
        }

        public void Show(BattleOutcome outcome, BattleRewardResult? reward)
        {
            Show(outcome, reward, null, null, 0, 0);
        }

        public void Show(
            BattleOutcome outcome,
            BattleRewardResult? reward,
            BattleCombatant player,
            BattleCombatant opponent,
            int trainerXp,
            int coinsGained)
        {
            EnsureLayout();
            showing = true;
            BattleFocusLayout.SetBattleFocus(true);

            bool won = outcome == BattleOutcome.PlayerWin;
            if (backdrop != null)
            {
                backdrop.color = won
                    ? new Color(0.08f, 0.05f, 0.22f, 0.94f)
                    : new Color(0.12f, 0.04f, 0.08f, 0.94f);
            }

            if (leagueText != null)
            {
                if (BattleSession.IsCircuitMatch)
                {
                    leagueText.text = TournamentService.GetResultLeagueLabel();
                }
                else if (BattleSession.IsRankedMatch)
                {
                    leagueText.text = "RANKED QUEUE";
                }
                else
                {
                    leagueText.text = "QRMON LEAGUE";
                }
            }

            if (titleText != null)
            {
                titleText.text = won ? "VICTORY!" : "DEFEAT";
                titleText.color = won
                    ? new Color(1f, 0.88f, 0.28f)
                    : new Color(0.95f, 0.42f, 0.42f);
            }

            int shownXp = trainerXp;
            if (shownXp <= 0 && reward.HasValue)
            {
                shownXp = reward.Value.ExperienceGained;
            }

            if (xpGainText != null)
            {
                xpGainText.text = shownXp > 0 ? $"+{shownXp}" : string.Empty;
                xpGainText.gameObject.SetActive(won && shownXp > 0);
            }

            if (playerStatsText != null)
            {
                playerStatsText.text = player != null
                    ? $"{player.DisplayName}\n★ {player.Level}   HP {player.CurrentHp}/{player.MaxHp}"
                    : string.Empty;
            }

            if (opponentStatsText != null)
            {
                opponentStatsText.text = opponent != null
                    ? $"{opponent.DisplayName}\n★ {opponent.Level}   HP {opponent.CurrentHp}/{opponent.MaxHp}"
                    : string.Empty;
            }

            BattleRewardResult r = reward ?? default;
            if (rewardXpText != null)
            {
                rewardXpText.text = r.ExperienceGained.ToString();
            }

            if (rewardCoinsText != null)
            {
                rewardCoinsText.text = Mathf.Max(0, coinsGained).ToString();
            }

            if (rewardEssenceText != null)
            {
                rewardEssenceText.text = r.EssenceGained.ToString();
            }

            if (starsText != null)
            {
                int stars = won ? Mathf.Clamp(3 + (player != null && player.CurrentHp > player.MaxHp / 2 ? 2 : 1), 1, 5) : 1;
                starsText.text = new string('★', stars) + new string('☆', 5 - stars);
            }

            if (detailsText != null)
            {
                detailsText.text = won
                    ? (r.LevelsGained > 0 ? $"Level up! Now Lv.{r.NewLevel}" : string.Empty)
                    : "Keep training and try again.";
            }

            if (playerDisplay == null && playerPortrait != null)
            {
                playerDisplay = playerPortrait.GetComponent<MonsterPortraitDisplay>()
                    ?? playerPortrait.gameObject.AddComponent<MonsterPortraitDisplay>();
            }

            playerDisplay?.Bind(player?.SourceData, 240, animated: true);
            SpawnConfetti(won);

            if (rootPanel != null)
            {
                rootPanel.SetActive(true);
            }

            gameObject.SetActive(true);
            transform.SetAsLastSibling();
            GameFeedbackService.Instance?.PlayBirth(transform, won ? new Color(1f, 0.85f, 0.3f) : new Color(0.8f, 0.3f, 0.3f));
        }

        public void Hide()
        {
            showing = false;
            if (rootPanel != null)
            {
                rootPanel.SetActive(false);
            }
            else
            {
                gameObject.SetActive(false);
            }
        }

        private void Update()
        {
            if (confettiRoot == null || !gameObject.activeInHierarchy)
            {
                return;
            }

            confettiTime += Time.unscaledDeltaTime;
            for (int i = 0; i < confettiRoot.childCount; i++)
            {
                var rect = confettiRoot.GetChild(i) as RectTransform;
                if (rect == null)
                {
                    continue;
                }

                rect.anchoredPosition += new Vector2((i % 2 == 0 ? -18f : 22f) * Time.unscaledDeltaTime, -90f * Time.unscaledDeltaTime);
                rect.Rotate(0f, 0f, 80f * Time.unscaledDeltaTime);
                if (rect.anchoredPosition.y < -540f)
                {
                    rect.anchoredPosition = new Vector2(Random.Range(-900f, 900f), 520f);
                }
            }
        }

        private void OnContinue()
        {
            GameFeedbackService.Instance?.PlayUiTap();
            Hide();
            ContinueRequested?.Invoke();
        }

        private void SpawnConfetti(bool won)
        {
            if (confettiRoot == null)
            {
                return;
            }

            for (int i = confettiRoot.childCount - 1; i >= 0; i--)
            {
                Destroy(confettiRoot.GetChild(i).gameObject);
            }

            if (!won || GameSettings.ReducedMotionEnabled || !GameSettings.ParticlesEnabled)
            {
                return;
            }

            Color[] colors =
            {
                new Color(1f, 0.85f, 0.2f),
                new Color(0.7f, 0.35f, 1f),
                new Color(1f, 1f, 1f),
                new Color(0.3f, 0.75f, 1f)
            };

            for (int i = 0; i < 18; i++)
            {
                var piece = BattleOverlayUi.CreateImage($"Confetti{i}", confettiRoot,
                    new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), colors[i % colors.Length]);
                piece.raycastTarget = false;
                var rect = piece.rectTransform;
                rect.sizeDelta = new Vector2(Random.Range(10f, 18f), Random.Range(18f, 32f));
                rect.anchoredPosition = new Vector2(Random.Range(-860f, 860f), Random.Range(80f, 520f));
            }
        }

        public void EnsureLayout()
        {
            if (layoutBuilt)
            {
                return;
            }

            Transform card = transform.Find("Card");
            if (card != null)
            {
                card.gameObject.SetActive(false);
            }

            Font font = MobileGameUiKit.TitleFont != null ? MobileGameUiKit.TitleFont : MobileGameUiKit.BodyFont;
            Font body = MobileGameUiKit.BodyFont;
            Transform root = transform;
            rootPanel ??= gameObject;

            backdrop = BattleOverlayUi.CreateImage("Backdrop", root, Vector2.zero, Vector2.one,
                new Color(0.08f, 0.05f, 0.22f, 0.94f));
            backdrop.raycastTarget = true;

            confettiRoot = BattleOverlayUi.CreateRect("Confetti", root, Vector2.zero, Vector2.one);

            leagueText = BattleOverlayUi.CreateText("League", root, body, 20, FontStyle.Bold, TextAnchor.MiddleLeft,
                new Vector2(0.04f, 0.88f), new Vector2(0.4f, 0.94f), new Color(0.9f, 0.92f, 1f));
            leagueText.text = "QRMON LEAGUE";

            titleText = BattleOverlayUi.CreateText("Title", root, font, 72, FontStyle.Bold, TextAnchor.MiddleLeft,
                new Vector2(0.04f, 0.72f), new Vector2(0.52f, 0.88f), new Color(1f, 0.88f, 0.28f));
            titleText.text = "VICTORY!";
            titleText.resizeTextForBestFit = true;
            titleText.resizeTextMinSize = 36;
            titleText.resizeTextMaxSize = 78;

            var xpChip = BattleOverlayUi.CreateImage("XpChip", root,
                new Vector2(0.04f, 0.64f), new Vector2(0.18f, 0.72f),
                new Color(0.42f, 0.22f, 0.82f, 0.95f));
            xpGainText = BattleOverlayUi.CreateText("XpGain", xpChip.transform, body, 26, FontStyle.Bold,
                TextAnchor.MiddleCenter, Vector2.zero, Vector2.one, Color.white);

            playerPortrait = BattleOverlayUi.CreateRaw("HeroPortrait", root,
                new Vector2(0.08f, 0.18f), new Vector2(0.42f, 0.66f));

            var rewards = BattleOverlayUi.CreateImage("RewardsPanel", root,
                new Vector2(0.58f, 0.28f), new Vector2(0.96f, 0.78f),
                new Color(0.12f, 0.28f, 0.55f, 0.72f));
            BattleOverlayUi.CreateText("RewardsTitle", rewards.transform, body, 26, FontStyle.Bold, TextAnchor.MiddleLeft,
                new Vector2(0.06f, 0.82f), new Vector2(0.94f, 0.96f), Color.white).text = "REWARDS:";

            rewardXpText = CreateRewardPedestal(rewards.transform, body, "XP", 0.08f, 0.34f);
            rewardCoinsText = CreateRewardPedestal(rewards.transform, body, "COINS", 0.38f, 0.64f);
            rewardEssenceText = CreateRewardPedestal(rewards.transform, body, "ESSENCE", 0.68f, 0.94f);

            starsText = BattleOverlayUi.CreateText("Stars", rewards.transform, body, 28, FontStyle.Bold,
                TextAnchor.MiddleCenter, new Vector2(0.08f, 0.06f), new Vector2(0.92f, 0.2f),
                new Color(1f, 0.85f, 0.2f));

            playerStatsText = BattleOverlayUi.CreateText("PlayerStats", root, body, 20, FontStyle.Bold,
                TextAnchor.UpperLeft, new Vector2(0.04f, 0.06f), new Vector2(0.36f, 0.18f), Color.white);
            opponentStatsText = BattleOverlayUi.CreateText("OpponentStats", root, body, 20, FontStyle.Bold,
                TextAnchor.UpperLeft, new Vector2(0.38f, 0.06f), new Vector2(0.7f, 0.18f), Color.white);
            detailsText = BattleOverlayUi.CreateText("Details", root, body, 18, FontStyle.Italic,
                TextAnchor.MiddleLeft, new Vector2(0.04f, 0.18f), new Vector2(0.5f, 0.24f),
                new Color(0.85f, 0.88f, 1f));

            continueButton = BattleOverlayUi.CreateButton("NextButton", root, body, "NEXT",
                new Vector2(0.72f, 0.04f), new Vector2(0.96f, 0.14f),
                new Color(0.18f, 0.48f, 0.95f, 1f), OnContinue);

            layoutBuilt = true;
        }

        private static Text CreateRewardPedestal(Transform parent, Font font, string label, float minX, float maxX)
        {
            var pedestal = BattleOverlayUi.CreateImage(label, parent,
                new Vector2(minX, 0.28f), new Vector2(maxX, 0.8f),
                new Color(0.08f, 0.14f, 0.28f, 0.85f));
            BattleOverlayUi.CreateText("Label", pedestal.transform, font, 14, FontStyle.Bold, TextAnchor.LowerCenter,
                new Vector2(0.04f, 0.02f), new Vector2(0.96f, 0.28f), new Color(0.8f, 0.85f, 1f)).text = label;
            return BattleOverlayUi.CreateText("Value", pedestal.transform, font, 28, FontStyle.Bold, TextAnchor.MiddleCenter,
                new Vector2(0.04f, 0.32f), new Vector2(0.96f, 0.92f), Color.white);
        }
    }
}
