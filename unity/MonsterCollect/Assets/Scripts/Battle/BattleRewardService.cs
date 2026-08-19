using System;
using MonsterCollect.Core.RemoteConfig;
using MonsterCollect.Data;
using MonsterCollect.Events;
using MonsterCollect.Monster;
using MonsterCollect.Ranch;
using UnityEngine;
namespace MonsterCollect.Battle
{
    public readonly struct BattleRewardResult
    {
        public int ExperienceGained { get; }
        public string StatIncreased { get; }
        public int StatIncreaseAmount { get; }
        public bool LeveledUp { get; }
        public int NewLevel { get; }
        public int LevelsGained { get; }
        public int EssenceGained { get; }
        public int TrainingPointsGained { get; }
        public string ItemReward { get; }

        public BattleRewardResult(
            int experienceGained,
            string statIncreased,
            int statIncreaseAmount,
            bool leveledUp,
            int newLevel,
            int levelsGained,
            int essenceGained,
            int trainingPointsGained,
            string itemReward)
        {
            ExperienceGained = experienceGained;
            StatIncreased = statIncreased;
            StatIncreaseAmount = statIncreaseAmount;
            LeveledUp = leveledUp;
            NewLevel = newLevel;
            LevelsGained = levelsGained;
            EssenceGained = essenceGained;
            TrainingPointsGained = trainingPointsGained;
            ItemReward = itemReward;
        }

        public bool HasStatIncrease => !string.IsNullOrEmpty(StatIncreased) && StatIncreaseAmount > 0;
        public bool HasItemReward => !string.IsNullOrEmpty(ItemReward);
    }

    /// <summary>Applies post-battle XP, levels, currency, and stat growth.</summary>
    public static class BattleRewardService
    {
        public const int BaseWinExperience = 15;
        public const int BaseLossExperience = 5;
        public const int ExperiencePerStatBoost = 30;
        public const int BaseWinEssence = 15;

        public static BattleRewardResult ApplyOutcome(MonsterData monster, bool playerWon, int opponentLevel = 1)
        {
            MonsterRaisingService.EnsureRaisingState(monster);
            MonsterRaisingState state = monster.Raising;

            int xp = playerWon
                ? Mathf.RoundToInt((BaseWinExperience + Math.Max(0, opponentLevel - state.level) * 3) * RemoteConfigService.BattleRewardMultiplier)
                : Mathf.RoundToInt(BaseLossExperience * RemoteConfigService.BattleRewardMultiplier);
            state.battleExperience += xp;

            if (playerWon)
            {
                state.battleWins++;
            }
            else
            {
                state.battleLosses++;
            }

            int levelsGained = ApplyLevelUps(monster, state);
            bool didLevelUp = levelsGained > 0;

            string statName = null;
            int statAmount = 0;

            if (playerWon)
            {
                ApplyWinStatGrowth(monster, state, out statName, out statAmount);
            }
            else if (state.battleExperience > 0 && state.battleExperience % ExperiencePerStatBoost == 0)
            {
                ApplyRandomStatGrowth(monster, 1, out statName, out statAmount);
            }

            int essence = playerWon
                ? Mathf.RoundToInt((BaseWinEssence + opponentLevel) * RemoteConfigService.BattleRewardMultiplier)
                : 0;
            int trainingPoints = playerWon && state.level % 3 == 0 ? 1 : 0;
            string item = RollItemReward(playerWon, monster, opponentLevel);

            if (trainingPoints > 0)
            {
                state.trainingPoints += trainingPoints;
            }

            return new BattleRewardResult(
                xp,
                statName,
                statAmount,
                didLevelUp || statAmount > 0,
                state.level,
                levelsGained,
                essence,
                trainingPoints,
                item);
        }

        private static int ApplyLevelUps(MonsterData monster, MonsterRaisingState state)
        {
            int gained = 0;

            while (state.level < BattleLevelService.MaxLevel &&
                   state.battleExperience >= BattleLevelService.GetXpToNextLevel(state.level))
            {
                state.battleExperience -= BattleLevelService.GetXpToNextLevel(state.level);
                state.level++;
                gained++;

                if (state.level % 5 == 0)
                {
                    monster.Hp += 1;
                    monster.Attack += 1;
                    monster.Defense += 1;
                    monster.Speed += 1;
                }
            }

            return gained;
        }

        private static void ApplyWinStatGrowth(
            MonsterData monster,
            MonsterRaisingState state,
            out string statName,
            out int statAmount)
        {
            statAmount = state.battleExperience % ExperiencePerStatBoost == 0 ? 2 : 1;
            ApplyRandomStatGrowth(monster, statAmount, out statName, out statAmount);
        }

        private static bool ApplyRandomStatGrowth(MonsterData monster, int amount, out string statName, out int statAmount)
        {
            statAmount = amount;
            MonsterRaisingService.EnsureRaisingState(monster);
            var rng = new System.Random(
                MonsterProceduralTraits.SeedFromInt(monster.DexNumber + monster.Raising.battleExperience));
            int roll = rng.Next(4);

            switch (roll)
            {
                case 0:
                    monster.Hp += statAmount;
                    statName = "HP";
                    break;
                case 1:
                    monster.Attack += statAmount;
                    statName = "Attack";
                    break;
                case 2:
                    monster.Defense += statAmount;
                    statName = "Defense";
                    break;
                default:
                    monster.Speed += statAmount;
                    statName = "Speed";
                    break;
            }

            return true;
        }

        private static string RollItemReward(bool playerWon, MonsterData monster, int opponentLevel)
        {
            if (!playerWon)
            {
                return null;
            }

            var rng = new System.Random(MonsterProceduralTraits.SeedFromInt(monster.DexNumber + opponentLevel));
            EventManager.Initialize();
            string exclusive = EventManager.RollExclusiveBattleItem(rng);
            if (!string.IsNullOrEmpty(exclusive))
            {
                return GrantItemReward(exclusive);
            }

            if (rng.Next(100) >= 12)
            {
                return null;
            }

            return rng.Next(3) switch
            {
                0 => GrantItemReward("care_treat"),
                1 => GrantItemReward("power_charm"),
                _ => GrantItemReward("speed_seed")
            };
        }

        private static string GrantItemReward(string itemId)
        {
            PlayerInventoryService.AddItem(itemId, 1);
            RanchItemDefinition def = PlayerInventoryService.GetDefinition(itemId);
            return def != null ? def.DisplayName : itemId;
        }
    }
}
