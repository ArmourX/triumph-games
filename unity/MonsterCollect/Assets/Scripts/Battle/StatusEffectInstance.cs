namespace MonsterCollect.Battle
{
    /// <summary>Active status on a combatant during battle.</summary>
    public class StatusEffectInstance
    {
        public StatusEffectType Type;
        public int RemainingTurns;
        public int Potency = 1;

        public bool IsPersistent => Type == StatusEffectType.Poison ||
                                    Type == StatusEffectType.Burn ||
                                    Type == StatusEffectType.Sleep;

        public bool IsStatModifier => Type == StatusEffectType.AttackUp ||
                                      Type == StatusEffectType.AttackDown ||
                                      Type == StatusEffectType.DefenseUp ||
                                      Type == StatusEffectType.DefenseDown ||
                                      Type == StatusEffectType.SpeedUp ||
                                      Type == StatusEffectType.SpeedDown;
    }
}
