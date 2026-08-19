using System;

namespace MonsterCollect.Monster
{
    /// <summary>Care / neglect flags derived from raising meters.</summary>
    [Flags]
    public enum MonsterCareCondition
    {
        None = 0,
        Tired = 1 << 0,
        Weak = 1 << 1,
        Neglected = 1 << 2,
        Exhausted = 1 << 3,
        Injured = 1 << 4,
        Retired = 1 << 5,
        OnErrantry = 1 << 6,
        Aging = 1 << 7
    }
}
