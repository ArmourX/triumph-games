using System;
using System.Collections;

namespace MonsterCollect.Battle
{
    /// <summary>
    /// Turn-based battle orchestrator. Raises events for UI binding.
    /// </summary>
    public class BattleManager
    {
        public const float TurnDelaySeconds = 0.35f;

        public BattleContext Context { get; private set; }
        public bool IsWaitingForPlayerInput { get; private set; }
        public bool IsBusy { get; private set; }
        public string LastMessage { get; private set; } = string.Empty;
        public string TurnIndicator { get; private set; } = string.Empty;

        public event Action StateChanged;
        public event Action<BattleOutcome, BattleRewardResult?> BattleFinished;

        public void StartBattle(BattleCombatant player, BattleCombatant opponent)
        {
            Context = new BattleContext(player, opponent);
            IsWaitingForPlayerInput = true;
            IsBusy = false;
            Context.TurnNumber = 1;
            LastMessage = $"Battle start! {player.DisplayName} vs {opponent.DisplayName}";
            TurnIndicator = "Your turn";
            NotifyStateChanged();
        }

        public IEnumerator ExecutePlayerMove(string moveId)
        {
            if (!IsWaitingForPlayerInput || IsBusy || Context == null)
            {
                yield break;
            }

            yield return ExecuteTurnCoroutine(Context.Player, moveId);

            if (Context.Outcome != BattleOutcome.InProgress)
            {
                yield break;
            }

            TurnIndicator = "Enemy turn";
            NotifyStateChanged();
            yield return Wait(TurnDelaySeconds * 0.5f);

            string enemyMoveId = BattleAi.ChooseMoveId(Context, Context.Opponent);
            yield return ExecuteTurnCoroutine(Context.Opponent, enemyMoveId);

            if (Context.Outcome == BattleOutcome.InProgress)
            {
                Context.TurnNumber++;
                TurnIndicator = "Your turn";
            }
        }

        private IEnumerator ExecuteTurnCoroutine(BattleCombatant user, string moveId)
        {
            IsBusy = true;
            IsWaitingForPlayerInput = false;
            NotifyStateChanged();

            if (BattleStatusProcessor.ProcessTurnStart(user, out string statusMessage))
            {
                LastMessage = statusMessage;
                Context.RefreshOutcome();
                NotifyStateChanged();

                if (Context.Outcome != BattleOutcome.InProgress)
                {
                    FinishBattle();
                    yield break;
                }

                if (!user.CanAct())
                {
                    yield return Wait(TurnDelaySeconds);
                    FinishTurnSetup(user);
                    yield break;
                }
            }
            else if (!string.IsNullOrEmpty(statusMessage))
            {
                LastMessage = statusMessage;
                Context.RefreshOutcome();
                NotifyStateChanged();

                if (Context.Outcome != BattleOutcome.InProgress)
                {
                    FinishBattle();
                    yield break;
                }
            }

            if (!user.CanAct())
            {
                LastMessage = $"{user.DisplayName} can't move!";
                yield return Wait(TurnDelaySeconds);
                FinishTurnSetup(user);
                yield break;
            }

            BattleMove move = BattleMoveRegistry.Get(moveId);
            if (move == null)
            {
                LastMessage = "Unknown move.";
                FinishTurnSetup(user);
                yield break;
            }

            BattleMoveResult result = move.Execute(Context, user);
            LastMessage = result.Message;
            NotifyStateChanged();

            BattleCombatant opponent = Context.GetOpponentOf(user);
            opponent.ClearTurnFlags();

            if (Context.Outcome != BattleOutcome.InProgress)
            {
                FinishBattle();
                yield break;
            }

            yield return Wait(TurnDelaySeconds);
            FinishTurnSetup(user);
        }

        private void FinishTurnSetup(BattleCombatant user)
        {
            IsBusy = false;

            if (Context.Outcome != BattleOutcome.InProgress)
            {
                IsWaitingForPlayerInput = false;
            }
            else
            {
                IsWaitingForPlayerInput = true;
            }

            NotifyStateChanged();
        }

        private void FinishBattle()
        {
            IsBusy = false;
            IsWaitingForPlayerInput = false;
            TurnIndicator = Context.Outcome == BattleOutcome.PlayerWin ? "Victory!" : "Defeat";
            NotifyStateChanged();
            BattleFinished?.Invoke(Context.Outcome, null);
        }

        private static IEnumerator Wait(float seconds)
        {
            float elapsed = 0f;
            while (elapsed < seconds)
            {
                elapsed += UnityEngine.Time.unscaledDeltaTime;
                yield return null;
            }
        }

        private void NotifyStateChanged()
        {
            StateChanged?.Invoke();
        }
    }
}
