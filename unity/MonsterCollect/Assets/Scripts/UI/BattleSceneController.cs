using MonsterCollect.Battle;
using MonsterCollect.Circuit;
using MonsterCollect.Core;
using MonsterCollect.Core.Analytics;
using MonsterCollect.Data;
using MonsterCollect.Events;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using MonsterCollect.Social;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace MonsterCollect.UI
{
    /// <summary>Battle scene phase controller: setup → VS → fight → result.</summary>
    [DisallowMultipleComponent]
    public class BattleSceneController : MonoBehaviour
    {
        [SerializeField] private BattleSetupView setupView;
        [SerializeField] private BattleVsView vsView;
        [SerializeField] private BattleHudView hudView;
        [SerializeField] private BattleResultView resultView;

        private readonly BattleManager battleManager = new BattleManager();
        private MonsterData playerMonsterData;
        private BattleCombatant pendingPlayer;
        private BattleCombatant pendingOpponent;
        private string pendingPlayerId;
        private BattleOpponentMode pendingMode;
        private bool battleRunning;
        private bool vsCancelRefundsEnergy;

        private void Awake()
        {
            EnsureViews();

            if (setupView != null)
            {
                setupView.SetupConfirmed += OnSetupConfirmed;
            }

            if (vsView != null)
            {
                vsView.Ready += OnVsReady;
                vsView.Cancelled += OnVsCancelled;
            }

            if (hudView != null)
            {
                hudView.MoveRequested += OnMoveRequested;
            }

            if (resultView != null)
            {
                resultView.ContinueRequested += OnResultContinue;
            }

            battleManager.StateChanged += OnBattleStateChanged;
            battleManager.BattleFinished += OnBattleFinished;
        }

        private void OnDestroy()
        {
            if (setupView != null)
            {
                setupView.SetupConfirmed -= OnSetupConfirmed;
            }

            if (vsView != null)
            {
                vsView.Ready -= OnVsReady;
                vsView.Cancelled -= OnVsCancelled;
            }

            if (hudView != null)
            {
                hudView.MoveRequested -= OnMoveRequested;
            }

            if (resultView != null)
            {
                resultView.ContinueRequested -= OnResultContinue;
            }

            battleManager.StateChanged -= OnBattleStateChanged;
            battleManager.BattleFinished -= OnBattleFinished;
        }

        private void Start()
        {
            EnsureViews();

            if (BattleSession.HasValidSetup && BattleSession.IsPlayerVsPlayer)
            {
                StartFromSession(true);
                return;
            }

            if (BattleSession.HasValidSetup &&
                BattleSession.OpponentMode == BattleOpponentMode.ExplorationWild)
            {
                StartFromSession(false);
                return;
            }

            ShowSetup();
        }

        private void EnsureViews()
        {
            Canvas canvas = FindObjectOfType<Canvas>();
            Transform overlayRoot = LandscapePlayFrame.FindContentRoot(canvas);
            if (overlayRoot == null && canvas != null)
            {
                overlayRoot = canvas.transform;
            }

            if (vsView == null && overlayRoot != null)
            {
                vsView = BattleVsView.Create(overlayRoot);
            }

            if (resultView == null && overlayRoot != null)
            {
                resultView = BattleResultView.Create(overlayRoot);
            }

            resultView?.EnsureLayout();
            vsView?.EnsureLayout();
        }

        private void StartFromSession(bool connecting)
        {
            playerMonsterData = MonsterCollectionService.FindById(BattleSession.PlayerMonsterId);
            MonsterData opponentData = ResolveOpponent(BattleSession.OpponentMode, BattleSession.OpponentMonsterId);

            if (playerMonsterData == null || opponentData == null)
            {
                ShowSetup();
                return;
            }

            setupView?.Hide();
            vsCancelRefundsEnergy = false;
            BeginVsIntro(
                CloneForBattle(playerMonsterData),
                CloneForBattle(opponentData),
                BattleSession.PlayerMonsterId,
                BattleSession.OpponentMode,
                connecting);
        }

        private void ShowSetup()
        {
            battleRunning = false;
            pendingPlayer = null;
            pendingOpponent = null;
            vsView?.Hide();
            resultView?.Hide();
            hudView?.Hide();
            BattleFocusLayout.SetBattleFocus(false);
            setupView?.Show();
        }

        private void OnSetupConfirmed(string playerId, BattleOpponentMode mode, string opponentId)
        {
            if (!RanchEnergyService.TrySpend(RanchEnergyService.BattleCost, out string energyMessage))
            {
                setupView?.ShowHint(energyMessage);
                GameFeedbackService.Instance?.PlayError();
                return;
            }

            playerMonsterData = MonsterCollectionService.FindById(playerId);
            if (playerMonsterData == null)
            {
                MonsterCollectionService.RefundDailyEnergy(RanchEnergyService.BattleCost);
                return;
            }

            MonsterData opponentData = ResolveOpponent(mode, opponentId);
            if (opponentData == null)
            {
                MonsterCollectionService.RefundDailyEnergy(RanchEnergyService.BattleCost);
                return;
            }

            setupView?.Hide();
            vsCancelRefundsEnergy = true;
            BeginVsIntro(CloneForBattle(playerMonsterData), CloneForBattle(opponentData), playerId, mode, false);
        }

        private void BeginVsIntro(
            MonsterData playerData,
            MonsterData opponentData,
            string playerId,
            BattleOpponentMode mode,
            bool connecting)
        {
            pendingPlayer = BattleCombatant.FromMonster(playerData, true);
            pendingOpponent = BattleCombatant.FromMonster(opponentData, false);
            pendingPlayerId = playerId;
            pendingMode = mode;
            hudView?.Hide();
            resultView?.Hide();
            vsView?.Show(pendingPlayer, pendingOpponent, connecting);
        }

        private void OnVsReady()
        {
            if (pendingPlayer == null || pendingOpponent == null)
            {
                ShowSetup();
                return;
            }

            battleManager.StartBattle(pendingPlayer, pendingOpponent);
            hudView?.Show();
            hudView?.Bind(battleManager.Context);
            hudView?.Refresh(battleManager);
            battleRunning = true;
            TrackBattleStarted(pendingPlayerId, pendingMode);
        }

        private void OnVsCancelled()
        {
            if (vsCancelRefundsEnergy)
            {
                MonsterCollectionService.RefundDailyEnergy(RanchEnergyService.BattleCost);
            }

            bool returnToRanch = BattleSession.OpponentMode == BattleOpponentMode.ExplorationWild;
            if (returnToRanch)
            {
                BattleSession.Clear();
                SceneManager.LoadScene(GameScenes.Ranch);
                return;
            }

            ShowSetup();
        }

        private static MonsterData ResolveOpponent(BattleOpponentMode mode, string opponentId)
        {
            if (mode == BattleOpponentMode.RemoteSnapshot || mode == BattleOpponentMode.LocalPvP)
            {
                return BattleSession.RemoteOpponentSnapshot;
            }

            if (mode == BattleOpponentMode.OwnedTest)
            {
                return MonsterCollectionService.FindById(opponentId);
            }

            if (mode == BattleOpponentMode.ExplorationWild)
            {
                return BattleSession.WildOpponentSnapshot;
            }

            return WildMonsterFactory.CreateWild();
        }

        private static MonsterData CloneForBattle(MonsterData source)
        {
            string json = JsonUtility.ToJson(source);
            return JsonUtility.FromJson<MonsterData>(json);
        }

        private void OnMoveRequested(string moveId)
        {
            if (!battleRunning)
            {
                return;
            }

            StartCoroutine(battleManager.ExecutePlayerMove(moveId));
        }

        private void OnBattleStateChanged()
        {
            hudView?.Refresh(battleManager);

            if (battleManager != null &&
                !string.IsNullOrEmpty(battleManager.LastMessage) &&
                battleManager.LastMessage.IndexOf("damage", System.StringComparison.OrdinalIgnoreCase) >= 0)
            {
                bool playerAttacked = battleManager.LastMessage.IndexOf(
                    battleManager.Context?.Player?.DisplayName ?? string.Empty,
                    System.StringComparison.OrdinalIgnoreCase) >= 0;
                hudView?.PlayAttackAnimation(playerAttacked);

                GameFeedbackService.Instance?.PlayBattleHit(hudView != null ? hudView.transform : transform);
            }
        }

        private void OnBattleFinished(BattleOutcome outcome, BattleRewardResult? reward)
        {
            battleRunning = false;
            int opponentLevel = battleManager.Context?.Opponent?.Level ?? 1;
            int trainerXp = 0;
            int coinsGained = 0;
            if (outcome == BattleOutcome.PlayerWin)
            {
                trainerXp = Mathf.RoundToInt((8 + opponentLevel * 2) * EventManager.GetTrainerXpMultiplier());
                coinsGained = 4 + opponentLevel;
            }

            BattleRewardResult appliedReward = ApplyRewards(outcome);
            hudView?.Hide();
            resultView?.Show(
                outcome,
                appliedReward,
                battleManager.Context?.Player,
                battleManager.Context?.Opponent,
                trainerXp,
                coinsGained);

            GameAnalyticsService.TrackBattleEnd(outcome, BattleSession.IsPlayerVsPlayer, opponentLevel);
        }

        private BattleRewardResult ApplyRewards(BattleOutcome outcome)
        {
            if (playerMonsterData == null)
            {
                return default;
            }

            bool won = outcome == BattleOutcome.PlayerWin;
            int opponentLevel = battleManager.Context?.Opponent?.Level ?? 1;
            BattleRewardResult reward = BattleRewardService.ApplyOutcome(playerMonsterData, won, opponentLevel);
            MonsterRaisingService.ConsumeBattleBonuses(playerMonsterData);
            MonsterCollectionService.UpdateMonster(playerMonsterData);

            if (won)
            {
                EventManager.RecordBattleWin();
                ProgressionEventReporter.ReportBattleWon(playerMonsterData);
                int trainerXp = Mathf.RoundToInt((8 + opponentLevel * 2) * EventManager.GetTrainerXpMultiplier());
                TrainerProgressionService.AddTrainerXp(trainerXp);
                TrainerProgressionService.AddCoins(4 + opponentLevel);
            }

            if (BattleSession.IsPlayerVsPlayer)
            {
                MonsterData opponentData = BattleSession.RemoteOpponentSnapshot;
                SocialBattleCoordinator.ReportLocalBattleResult(outcome, playerMonsterData, opponentData, BattleSession.IsRankedMatch);
            }

            TournamentService.NotifyBattleFinished(outcome);

            if (reward.EssenceGained > 0)
            {
                MonsterCollectionService.AddEssence(reward.EssenceGained);
            }

            return reward;
        }

        private static void TrackBattleStarted(string playerMonsterId, BattleOpponentMode mode)
        {
            GameAnalyticsService.TrackBattleStart(
                playerMonsterId,
                mode,
                BattleSession.IsPlayerVsPlayer);
        }

        private void OnResultContinue()
        {
            bool returnToRanch = BattleSession.OpponentMode == BattleOpponentMode.ExplorationWild
                || BattleSession.IsCircuitMatch;
            if (BattleSession.IsCircuitMatch)
            {
                TournamentHubPanel.RequestShowOnNextRanch();
            }

            BattleSession.Clear();

            if (returnToRanch)
            {
                SceneManager.LoadScene(GameScenes.Ranch);
                return;
            }

            ShowSetup();
        }
    }
}
