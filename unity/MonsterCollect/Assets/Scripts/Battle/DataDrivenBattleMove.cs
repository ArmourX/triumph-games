using System;
using UnityEngine;

namespace MonsterCollect.Battle
{
    /// <summary>Executes a battle move from a ScriptableObject definition.</summary>
    public sealed class DataDrivenBattleMove : BattleMove
    {
        private readonly BattleMoveDefinition definition;

        public DataDrivenBattleMove(BattleMoveDefinition definition)
            : base(definition.MoveId, definition.DisplayName)
        {
            this.definition = definition;
        }

        public BattleMoveDefinition Definition => definition;

        public override BattleMoveResult Execute(BattleContext context, BattleCombatant user)
        {
            if (definition == null)
            {
                return BattleMoveResult.Fail("Invalid move.");
            }

            if (definition.IsDefendMove)
            {
                user.IsDefending = true;
                return BattleMoveResult.Ok($"{user.DisplayName} is defending!");
            }

            if (definition.OneUsePerBattle && user.UsedOneTimeMoves.Contains(definition.MoveId))
            {
                return BattleMoveResult.Fail($"{user.DisplayName} already used {definition.DisplayName}!");
            }

            BattleCombatant target = context.GetOpponentOf(user);
            var rng = new System.Random(context.GetBattleSeed() + user.CurrentHp + definition.MoveId.GetHashCode());

            if (definition.Power <= 0 && !definition.HasStatusEffect && !definition.AppliesStatChange)
            {
                return BattleMoveResult.Fail($"{definition.DisplayName} has no effect.");
            }

            if (definition.Power > 0 || definition.Category != MoveCategory.Status)
            {
                if (rng.Next(100) >= definition.Accuracy)
                {
                    return BattleMoveResult.Fail($"{user.DisplayName}'s {definition.DisplayName} missed!");
                }
            }
            else if (definition.HasStatusEffect && rng.Next(100) >= definition.Accuracy)
            {
                return BattleMoveResult.Fail($"{user.DisplayName}'s {definition.DisplayName} missed!");
            }

            if (definition.OneUsePerBattle)
            {
                user.UsedOneTimeMoves.Add(definition.MoveId);
            }

            int damage = 0;
            string effectivenessLabel = null;

            if (definition.Power > 0)
            {
                damage = BattleDamageCalculator.CalculateDamage(
                    user,
                    target,
                    definition.Power,
                    definition.Element,
                    definition.DamageMultiplier,
                    out effectivenessLabel);
                target.TakeDamage(damage);
                context.RefreshOutcome();
            }

            if (definition.HasStatusEffect)
            {
                if (BattleStatusProcessor.TryApplyStatus(target, definition.AppliesStatus, definition.StatusDuration))
                {
                    effectivenessLabel = (effectivenessLabel ?? string.Empty) +
                                         $" {target.DisplayName} was afflicted with {definition.AppliesStatus}!";
                }
            }

            if (definition.AppliesStatChange)
            {
                bool buff = definition.StatChange == StatusEffectType.AttackUp ||
                            definition.StatChange == StatusEffectType.DefenseUp ||
                            definition.StatChange == StatusEffectType.SpeedUp;
                BattleStatusProcessor.ApplyStatStage(buff ? user : target, definition.StatChange);
            }

            string message = damage > 0
                ? $"{user.DisplayName} used {definition.DisplayName} for {damage} damage!"
                : $"{user.DisplayName} used {definition.DisplayName}!";

            if (!string.IsNullOrEmpty(effectivenessLabel))
            {
                message += " " + effectivenessLabel.Trim();
            }

            return BattleMoveResult.Ok(message, damage, effectivenessLabel);
        }
    }
}
