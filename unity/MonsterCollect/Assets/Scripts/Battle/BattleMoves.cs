using System;

namespace MonsterCollect.Battle
{
    public sealed class AttackMove : BattleMove
    {
        public const string MoveId = "attack";

        public AttackMove() : base(MoveId, "Attack")
        {
        }

        public override BattleMoveResult Execute(BattleContext context, BattleCombatant user)
        {
            BattleCombatant target = context.GetOpponentOf(user);
            string effectivenessLabel;
            int damage = BattleDamageCalculator.CalculateDamage(
                user,
                target,
                40,
                user.Element,
                1f,
                out effectivenessLabel);
            target.TakeDamage(damage);
            context.RefreshOutcome();

            string message = $"{user.DisplayName} used Attack for {damage} damage!";
            if (!string.IsNullOrEmpty(effectivenessLabel))
            {
                message += " " + effectivenessLabel;
            }

            return BattleMoveResult.Ok(message, damage, effectivenessLabel);
        }
    }

    public sealed class DefendMove : BattleMove
    {
        public const string MoveId = "defend";

        public DefendMove() : base(MoveId, "Defend")
        {
        }

        public override BattleMoveResult Execute(BattleContext context, BattleCombatant user)
        {
            user.IsDefending = true;
            BattleStatusProcessor.ApplyStatStage(user, StatusEffectType.DefenseUp);
            return BattleMoveResult.Ok($"{user.DisplayName} is defending!");
        }
    }

    public sealed class SpecialMove : BattleMove
    {
        public const string MoveId = "special";

        public SpecialMove() : base(MoveId, "Special")
        {
        }

        public override BattleMoveResult Execute(BattleContext context, BattleCombatant user)
        {
            if (user.SpecialUsed)
            {
                return BattleMoveResult.Fail($"{user.DisplayName} already used Special!");
            }

            user.SpecialUsed = true;
            BattleCombatant target = context.GetOpponentOf(user);
            string effectivenessLabel;
            int damage = BattleDamageCalculator.CalculateDamage(
                user,
                target,
                60,
                user.Element,
                1.5f,
                out effectivenessLabel);
            target.TakeDamage(damage);
            context.RefreshOutcome();

            string message = $"{user.DisplayName} used Special for {damage} damage!";
            if (!string.IsNullOrEmpty(effectivenessLabel))
            {
                message += " " + effectivenessLabel;
            }

            return BattleMoveResult.Ok(message, damage, effectivenessLabel);
        }
    }

    public static class BattleDamageCalculator
    {
        public static int CalculatePhysicalDamage(BattleCombatant attacker, BattleCombatant defender, float multiplier)
        {
            string _;
            return CalculateDamage(attacker, defender, (int)(40 * multiplier), attacker.Element, 1f, out _);
        }

        public static int CalculateDamage(
            BattleCombatant attacker,
            BattleCombatant defender,
            int power,
            BattleElement moveElement,
            float multiplier,
            out string effectivenessLabel)
        {
            float typeMultiplier = BattleTypeChart.GetMultiplier(moveElement, defender.Element);
            effectivenessLabel = BattleTypeChart.GetEffectivenessLabel(typeMultiplier);

            float personalityMultiplier = attacker.GetPlayerDamageMultiplier();
            float attackStat = attacker.GetEffectiveAttack();
            float defenseStat = defender.GetEffectiveDefense() * 0.5f;
            float raw = (attackStat * power / 50f) * multiplier * typeMultiplier * personalityMultiplier - defenseStat;
            int damage = (int)Math.Max(1, Math.Round(raw));

            if (defender.IsDefending)
            {
                damage = Math.Max(1, damage / 2);
            }

            if (defender.HasStatus(StatusEffectType.Burn))
            {
                damage = Math.Max(1, (int)(damage * 0.85f));
            }

            return damage;
        }
    }
}
