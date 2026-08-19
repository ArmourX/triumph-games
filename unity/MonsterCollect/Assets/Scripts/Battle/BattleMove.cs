namespace MonsterCollect.Battle
{
    /// <summary>Base class for battle actions — extend for typed moves later.</summary>
    public abstract class BattleMove
    {
        public string Id { get; }
        public string DisplayName { get; }

        protected BattleMove(string id, string displayName)
        {
            Id = id;
            DisplayName = displayName;
        }

        public abstract BattleMoveResult Execute(BattleContext context, BattleCombatant user);
    }
}
