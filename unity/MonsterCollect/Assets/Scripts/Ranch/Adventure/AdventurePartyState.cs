using System;

namespace MonsterCollect.Ranch
{
    [Serializable]
    public class AdventurePartyState
    {
        public bool isActive;
        public string[] monsterIds = Array.Empty<string>();
        public string zoneId = string.Empty;
        public string biomeId = string.Empty;
        public double startedUtc;
        public double endsUtc;
        public bool hasPendingEncounter;
        public int pendingOpponentLevel = 1;
        public int pendingEncounterSeed;
        public string pendingPlayerMonsterId = string.Empty;
        public bool lastTripResolved;
        public string lastResultSummary = string.Empty;
        public int lastTrainingPoints;
        public int lastEssence;
        public bool lastInjured;
        public bool lastBlessing;
    }
}
