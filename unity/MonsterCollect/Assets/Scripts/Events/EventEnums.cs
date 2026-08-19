namespace MonsterCollect.Events
{
    public enum EventModifierType
    {
        BattleRewardMultiplier = 0,
        TrainerXpMultiplier = 1,
        ScanLimitBonus = 2,
        ScanEnergyCostMultiplier = 3,
        BonusRarityPercent = 4,
        BreedingEssenceDiscount = 5,
        ExclusiveItemDropChance = 6
    }

    public enum EventScheduleKind
    {
        FixedUtc = 0,
        LocalDateRange = 1,
        RecurringAnnual = 2,
        AlwaysActive = 3
    }
}
