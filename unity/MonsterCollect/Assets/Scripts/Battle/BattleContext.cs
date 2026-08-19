namespace MonsterCollect.Battle
{
    /// <summary>Shared battle state for move execution.</summary>
    public class BattleContext
    {
        public BattleCombatant Player { get; }
        public BattleCombatant Opponent { get; }
        public BattleOutcome Outcome { get; set; } = BattleOutcome.InProgress;
        public int TurnNumber { get; set; }
        public int BattleSeed { get; }

        public BattleContext(BattleCombatant player, BattleCombatant opponent, int battleSeed = 0)
        {
            Player = player;
            Opponent = opponent;
            BattleSeed = battleSeed == 0
                ? (player.DisplayName + opponent.DisplayName).GetHashCode()
                : battleSeed;
        }

        public int GetBattleSeed() => BattleSeed + TurnNumber;

        public BattleCombatant GetCombatant(bool isPlayerSide)
        {
            return isPlayerSide ? Player : Opponent;
        }

        public BattleCombatant GetOpponentOf(BattleCombatant combatant)
        {
            return combatant.IsPlayerSide ? Opponent : Player;
        }

        public void RefreshOutcome()
        {
            if (Player.IsFainted && Opponent.IsFainted)
            {
                Outcome = BattleOutcome.PlayerLoss;
                return;
            }

            if (Opponent.IsFainted)
            {
                Outcome = BattleOutcome.PlayerWin;
                return;
            }

            if (Player.IsFainted)
            {
                Outcome = BattleOutcome.PlayerLoss;
            }
        }
    }
}
