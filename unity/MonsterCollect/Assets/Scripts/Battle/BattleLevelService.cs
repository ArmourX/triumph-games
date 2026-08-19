using System;

namespace MonsterCollect.Battle
{
    /// <summary>Level and XP helpers for battle progression.</summary>
    public static class BattleLevelService
    {
        public const int MaxLevel = 50;

        public static int GetXpToNextLevel(int level)
        {
            return 20 + level * 15;
        }

        public static float GetStatMultiplier(int level)
        {
            int safeLevel = level < 1 ? 1 : level;
            return 1f + (safeLevel - 1) * 0.04f;
        }

        public static int ScaleStat(int baseStat, int level)
        {
            return Math.Max(1, (int)Math.Round(baseStat * GetStatMultiplier(level)));
        }
    }
}
