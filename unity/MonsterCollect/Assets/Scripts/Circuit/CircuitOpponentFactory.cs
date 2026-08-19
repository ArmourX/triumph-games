using System;
using MonsterCollect.Battle;
using MonsterCollect.Monster;
using UnityEngine;

namespace MonsterCollect.Circuit
{
    /// <summary>Deterministic, power-matched circuit opponents from a seed.</summary>
    public static class CircuitOpponentFactory
    {
        public static MonsterData Create(int seed, int targetLevel, int playerPower)
        {
            MonsterData opponent = WildMonsterFactory.CreateWild(seed, Math.Max(1, targetLevel));
            int power = StatPower(opponent);
            float variance = 0.90f + (Math.Abs(seed) % 21) / 100f;
            float target = Math.Max(8, playerPower) * variance;
            float scale = power <= 0 ? 1f : target / power;
            scale = Mathf.Clamp(scale, 0.82f, 1.18f);

            opponent.Hp = ScaleStat(opponent.Hp, scale);
            opponent.Attack = ScaleStat(opponent.Attack, scale);
            opponent.Defense = ScaleStat(opponent.Defense, scale);
            opponent.Speed = ScaleStat(opponent.Speed, scale);
            return opponent;
        }

        public static int StatPower(MonsterData monster)
        {
            if (monster == null)
            {
                return 0;
            }

            return monster.Hp + monster.Attack + monster.Defense + monster.Speed;
        }

        private static int ScaleStat(int value, float scale)
        {
            return Math.Max(1, (int)Math.Round(value * scale));
        }
    }
}
