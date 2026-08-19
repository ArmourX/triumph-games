namespace MonsterCollect.Battle
{
    public readonly struct BattleMoveResult
    {
        public bool Success { get; }
        public string Message { get; }
        public int DamageDealt { get; }
        public string EffectivenessLabel { get; }

        public BattleMoveResult(bool success, string message, int damageDealt = 0, string effectivenessLabel = null)
        {
            Success = success;
            Message = message;
            DamageDealt = damageDealt;
            EffectivenessLabel = effectivenessLabel;
        }

        public static BattleMoveResult Fail(string message) => new BattleMoveResult(false, message);
        public static BattleMoveResult Ok(string message, int damage = 0, string effectivenessLabel = null) =>
            new BattleMoveResult(true, message, damage, effectivenessLabel);
    }
}
