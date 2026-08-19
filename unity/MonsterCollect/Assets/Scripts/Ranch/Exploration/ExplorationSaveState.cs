using System;

namespace MonsterCollect.Ranch
{
    [Serializable]
    public class ExplorationSaveState
    {
        public string[] unlockedBiomeIds = { "biome_meadow" };
        public bool hasPendingWildBattle;
        public string pendingWildBattleZoneId = string.Empty;
        public int pendingWildOpponentLevel = 1;
        public string pendingWildMonsterId = string.Empty;
        public AdventurePartyState party = new AdventurePartyState();
        public string[] completedStoryBeatIds = Array.Empty<string>();
        public string[] adventureLog = Array.Empty<string>();

        public static ExplorationSaveState CreateDefault()
        {
            return new ExplorationSaveState
            {
                unlockedBiomeIds = new[] { "biome_meadow" },
                party = new AdventurePartyState(),
                completedStoryBeatIds = Array.Empty<string>(),
                adventureLog = Array.Empty<string>()
            };
        }
    }
}
