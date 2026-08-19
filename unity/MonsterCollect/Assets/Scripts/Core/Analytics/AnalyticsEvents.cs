namespace MonsterCollect.Core.Analytics
{
    /// <summary>Stable event names for analytics sinks and future SDK wiring.</summary>
    public static class AnalyticsEvents
    {
        public const string ScanSuccess = "scan_success";
        public const string ScanFailed = "scan_failed";
        public const string BattleStart = "battle_start";
        public const string BattleEnd = "battle_end";
        public const string BreedingComplete = "breeding_complete";
        public const string QuestCompleted = "quest_completed";
        public const string QuestClaimed = "quest_claimed";
        public const string MonsterCaptured = "monster_captured";
    }
}
