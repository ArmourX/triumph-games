namespace MonsterCollect.Battle
{
    /// <summary>Static type effectiveness chart for battle damage.</summary>
    public static class BattleTypeChart
    {
        public const float SuperEffective = 2f;
        public const float NotVeryEffective = 0.5f;
        public const float Neutral = 1f;

        public static float GetMultiplier(BattleElement attackType, BattleElement defendType)
        {
            if (IsSuperEffective(attackType, defendType))
            {
                return SuperEffective;
            }

            if (IsSuperEffective(defendType, attackType))
            {
                return NotVeryEffective;
            }

            return Neutral;
        }

        public static string GetEffectivenessLabel(float multiplier)
        {
            if (multiplier >= SuperEffective)
            {
                return "Super effective!";
            }

            if (multiplier <= NotVeryEffective)
            {
                return "Not very effective…";
            }

            return null;
        }

        private static bool IsSuperEffective(BattleElement attack, BattleElement defend)
        {
            switch (attack)
            {
                case BattleElement.Fire:
                    return defend == BattleElement.Grass || defend == BattleElement.Wind;
                case BattleElement.Water:
                    return defend == BattleElement.Fire || defend == BattleElement.Earth;
                case BattleElement.Grass:
                    return defend == BattleElement.Water || defend == BattleElement.Earth;
                case BattleElement.Electric:
                    return defend == BattleElement.Water || defend == BattleElement.Wind;
                case BattleElement.Earth:
                    return defend == BattleElement.Electric || defend == BattleElement.Fire;
                case BattleElement.Wind:
                    return defend == BattleElement.Grass || defend == BattleElement.Light;
                case BattleElement.Shadow:
                    return defend == BattleElement.Light || defend == BattleElement.Grass;
                case BattleElement.Light:
                    return defend == BattleElement.Shadow || defend == BattleElement.Electric;
                default:
                    return false;
            }
        }
    }
}
