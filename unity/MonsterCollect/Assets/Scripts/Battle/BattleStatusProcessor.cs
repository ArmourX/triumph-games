using System;
using System.Text;

namespace MonsterCollect.Battle
{
    /// <summary>Applies and ticks status effects and stat stages during battle.</summary>
    public static class BattleStatusProcessor
    {
        public const int MaxStage = 3;
        public const int MinStage = -3;

        public static bool ProcessTurnStart(BattleCombatant combatant, out string message)
        {
            message = null;
            if (combatant == null || combatant.IsFainted)
            {
                return false;
            }

            var builder = new StringBuilder();

            for (int i = combatant.Statuses.Count - 1; i >= 0; i--)
            {
                StatusEffectInstance status = combatant.Statuses[i];
                if (status.Type == StatusEffectType.Poison || status.Type == StatusEffectType.Burn)
                {
                    int tickDamage = Math.Max(1, combatant.MaxHp / (status.Type == StatusEffectType.Burn ? 16 : 8));
                    combatant.TakeDamage(tickDamage);
                    builder.Append($"{combatant.DisplayName} hurt by {GetShortName(status.Type)} ({tickDamage})! ");
                }

                if (status.IsPersistent && status.RemainingTurns > 0)
                {
                    status.RemainingTurns--;
                    if (status.RemainingTurns <= 0 && status.Type != StatusEffectType.Poison && status.Type != StatusEffectType.Burn)
                    {
                        combatant.Statuses.RemoveAt(i);
                    }
                }
            }

            if (combatant.IsAsleep)
            {
                if (combatant.SleepTurnsRemaining > 0)
                {
                    combatant.SleepTurnsRemaining--;
                    if (combatant.SleepTurnsRemaining <= 0)
                    {
                        combatant.IsAsleep = false;
                        builder.Append($"{combatant.DisplayName} woke up! ");
                    }
                    else
                    {
                        builder.Append($"{combatant.DisplayName} is asleep. ");
                        message = builder.ToString().Trim();
                        return true;
                    }
                }
            }

            message = builder.Length > 0 ? builder.ToString().Trim() : null;
            return false;
        }

        public static bool TryApplyStatus(BattleCombatant target, StatusEffectType type, int duration, int potency = 1)
        {
            if (target == null || target.IsFainted)
            {
                return false;
            }

            if (type == StatusEffectType.Sleep)
            {
                if (target.IsAsleep)
                {
                    return false;
                }

                target.IsAsleep = true;
                target.SleepTurnsRemaining = Math.Max(1, duration);
                target.Statuses.Add(new StatusEffectInstance
                {
                    Type = type,
                    RemainingTurns = duration,
                    Potency = potency
                });
                return true;
            }

            if (type == StatusEffectType.Poison || type == StatusEffectType.Burn)
            {
                if (target.HasStatus(StatusEffectType.Poison) || target.HasStatus(StatusEffectType.Burn))
                {
                    return false;
                }

                target.Statuses.Add(new StatusEffectInstance
                {
                    Type = type,
                    RemainingTurns = -1,
                    Potency = potency
                });
                return true;
            }

            ApplyStatStage(target, type);
            return true;
        }

        public static void ApplyStatStage(BattleCombatant target, StatusEffectType type)
        {
            switch (type)
            {
                case StatusEffectType.AttackUp:
                    target.AttackStage = ClampStage(target.AttackStage + 1);
                    break;
                case StatusEffectType.AttackDown:
                    target.AttackStage = ClampStage(target.AttackStage - 1);
                    break;
                case StatusEffectType.DefenseUp:
                    target.DefenseStage = ClampStage(target.DefenseStage + 1);
                    break;
                case StatusEffectType.DefenseDown:
                    target.DefenseStage = ClampStage(target.DefenseStage - 1);
                    break;
                case StatusEffectType.SpeedUp:
                    target.SpeedStage = ClampStage(target.SpeedStage + 1);
                    break;
                case StatusEffectType.SpeedDown:
                    target.SpeedStage = ClampStage(target.SpeedStage - 1);
                    break;
            }
        }

        public static float GetStageMultiplier(int stage)
        {
            return stage switch
            {
                3 => 1.5f,
                2 => 1.33f,
                1 => 1.15f,
                -1 => 0.85f,
                -2 => 0.67f,
                -3 => 0.5f,
                _ => 1f
            };
        }

        public static string GetShortName(StatusEffectType type)
        {
            return type switch
            {
                StatusEffectType.Poison => "PSN",
                StatusEffectType.Sleep => "SLP",
                StatusEffectType.Burn => "BRN",
                StatusEffectType.AttackUp => "ATK+",
                StatusEffectType.AttackDown => "ATK-",
                StatusEffectType.DefenseUp => "DEF+",
                StatusEffectType.DefenseDown => "DEF-",
                StatusEffectType.SpeedUp => "SPD+",
                StatusEffectType.SpeedDown => "SPD-",
                _ => type.ToString()
            };
        }

        private static int ClampStage(int stage)
        {
            return Math.Max(MinStage, Math.Min(MaxStage, stage));
        }
    }
}
