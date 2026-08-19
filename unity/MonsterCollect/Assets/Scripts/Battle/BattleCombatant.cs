using System.Collections.Generic;
using MonsterCollect.Monster;
using MonsterCollect.Ranch;
using UnityEngine;

namespace MonsterCollect.Battle
{
    /// <summary>Runtime fighter state during a battle (does not mutate ranch HP).</summary>
    public class BattleCombatant
    {
        public MonsterData SourceData;
        public string DisplayName;
        public int MaxHp;
        public int CurrentHp;
        public int Attack;
        public int Defense;
        public int Speed;
        public int Level = 1;
        public BattleElement Element;
        public bool IsPlayerSide;
        public bool IsDefending;
        public bool SpecialUsed;
        public bool IsAsleep;
        public int SleepTurnsRemaining;
        public int AttackStage;
        public int DefenseStage;
        public int SpeedStage;
        public Color PrimaryColor;
        public Color SecondaryColor;

        public List<string> MoveIds = new List<string>();
        public List<StatusEffectInstance> Statuses = new List<StatusEffectInstance>();
        public HashSet<string> UsedOneTimeMoves = new HashSet<string>();

        public bool IsFainted => CurrentHp <= 0;
        public float HpPercent => MaxHp > 0 ? (float)CurrentHp / MaxHp : 0f;

        public static BattleCombatant FromMonster(MonsterData monster, bool isPlayerSide)
        {
            MonsterRaisingService.EnsureRaisingState(monster);
            int level = Mathf.Max(1, monster.Raising.level);

            int baseAttack = isPlayerSide
                ? MonsterRaisingService.GetEffectiveAttack(monster)
                : monster.Attack;
            int baseSpeed = isPlayerSide
                ? MonsterRaisingService.GetEffectiveSpeed(monster)
                : monster.Speed;

            int scaledHp = BattleLevelService.ScaleStat(monster.Hp, level);
            int scaledAttack = BattleLevelService.ScaleStat(baseAttack, level);
            int scaledDefense = BattleLevelService.ScaleStat(monster.Defense, level);
            int scaledSpeed = BattleLevelService.ScaleStat(baseSpeed, level);

            var combatant = new BattleCombatant
            {
                SourceData = monster,
                DisplayName = monster.Name,
                MaxHp = scaledHp,
                CurrentHp = scaledHp,
                Attack = scaledAttack,
                Defense = scaledDefense,
                Speed = scaledSpeed,
                Level = level,
                Element = BattleElementUtility.FromMonster(monster),
                IsPlayerSide = isPlayerSide,
                PrimaryColor = monster.PrimaryColor,
                SecondaryColor = monster.SecondaryColor
            };

            combatant.MoveIds.AddRange(BattleMoveSetService.GetMoveIds(monster));
            return combatant;
        }

        public float GetPlayerDamageMultiplier()
        {
            if (SourceData == null || !IsPlayerSide)
            {
                return 1f;
            }

            return MonsterPersonalityService.GetBattleDamageMultiplier(SourceData);
        }

        public int GetEffectiveAttack()
        {
            return Mathf.Max(1, (int)(Attack * BattleStatusProcessor.GetStageMultiplier(AttackStage)));
        }

        public int GetEffectiveDefense()
        {
            return Mathf.Max(1, (int)(Defense * BattleStatusProcessor.GetStageMultiplier(DefenseStage)));
        }

        public int GetEffectiveSpeed()
        {
            return Mathf.Max(1, (int)(Speed * BattleStatusProcessor.GetStageMultiplier(SpeedStage)));
        }

        public bool HasStatus(StatusEffectType type)
        {
            for (int i = 0; i < Statuses.Count; i++)
            {
                if (Statuses[i].Type == type)
                {
                    return true;
                }
            }

            return false;
        }

        public bool CanAct()
        {
            return !IsFainted && !IsAsleep;
        }

        public void ClearTurnFlags()
        {
            IsDefending = false;
        }

        public void TakeDamage(int damage)
        {
            if (damage < 0)
            {
                damage = 0;
            }

            CurrentHp -= damage;

            if (CurrentHp < 0)
            {
                CurrentHp = 0;
            }
        }

        public string GetStatusSummary()
        {
            if (Statuses.Count == 0 && !IsAsleep && AttackStage == 0 && DefenseStage == 0 && SpeedStage == 0)
            {
                return string.Empty;
            }

            var parts = new List<string>();
            if (IsAsleep)
            {
                parts.Add("SLP");
            }

            for (int i = 0; i < Statuses.Count; i++)
            {
                string label = BattleStatusProcessor.GetShortName(Statuses[i].Type);
                if (!parts.Contains(label))
                {
                    parts.Add(label);
                }
            }

            if (AttackStage > 0)
            {
                parts.Add("ATK+");
            }
            else if (AttackStage < 0)
            {
                parts.Add("ATK-");
            }

            if (DefenseStage > 0)
            {
                parts.Add("DEF+");
            }
            else if (DefenseStage < 0)
            {
                parts.Add("DEF-");
            }

            if (SpeedStage > 0)
            {
                parts.Add("SPD+");
            }
            else if (SpeedStage < 0)
            {
                parts.Add("SPD-");
            }

            return string.Join(" ", parts);
        }
    }
}
