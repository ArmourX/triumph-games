using System;
using MonsterCollect.Circuit;
using MonsterCollect.Events;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using MonsterCollect.Ranch;
using MonsterCollect.Social;

namespace MonsterCollect.Data{
    /// <summary>JSON-serializable ranch save payload.</summary>
    [Serializable]
    public class MonsterCollectionSaveData
    {
        public MonsterData[] monsters = Array.Empty<MonsterData>();
        public string activeMonsterId;
        public int[] unlockedDexNumbers = Array.Empty<int>();
        public int ranchEssence = MonsterBreedingService.StartingRanchEssence;
        public int breedsToday;
        public string lastBreedDayKey = string.Empty;
        public double lastBreedUtc;
        public int scansToday;
        public string lastScanDayKey = string.Empty;
        public int dailyEnergy = RanchEnergyService.DailyMax;
        public string lastEnergyDayKey = string.Empty;

        public InventoryEntry[] inventory = Array.Empty<InventoryEntry>();
        public RanchProgressionState ranchProgression;
        public ProgressionSaveState progression;
        public SocialSaveState social;
        public EventSaveState events;
        public ExplorationSaveState exploration;
        public TournamentSaveState tournament;
    }
}
