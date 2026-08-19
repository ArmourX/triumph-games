using System;

namespace MonsterCollect.Circuit
{
    [Serializable]
    public class CircuitRunState
    {
        public bool isActive;
        public string mode = "ladder";
        public string eventId = string.Empty;
        public string seasonId = string.Empty;
        public string[] partyIds = Array.Empty<string>();
        public int roundIndex;
        public int wins;
        public bool hasPendingMatch;
        public string pendingMatchId = string.Empty;
        public string pendingOpponentName = string.Empty;
        public string pendingOpponentCode = string.Empty;
        public int pendingOpponentSeed;
        public int pendingOpponentLevel = 1;
        public int pendingOpponentRating = 1000;
        public string[] cupSlotNames = Array.Empty<string>();
        public string[] cupSlotCodes = Array.Empty<string>();
        public int[] cupSlotEliminated = Array.Empty<int>();
        public int cupPlayerSlot;
        public bool lastMatchWon;
        public string lastResultSummary = string.Empty;
    }

    [Serializable]
    public class TournamentSaveState
    {
        public string seasonId = string.Empty;
        public long seasonStartedUtc;
        public int seasonRating = 1000;
        public int careerPoints;
        public int seasonWins;
        public int seasonLosses;
        public int cupWins;
        public string equippedTitleId = string.Empty;
        public string[] unlockedTitleIds = Array.Empty<string>();
        public string[] unlockedCosmeticIds = Array.Empty<string>();
        public string[] resultLog = Array.Empty<string>();
        public CircuitRunState run = new CircuitRunState();

        public static TournamentSaveState CreateDefault()
        {
            return new TournamentSaveState
            {
                seasonRating = 1000,
                unlockedTitleIds = Array.Empty<string>(),
                unlockedCosmeticIds = Array.Empty<string>(),
                resultLog = Array.Empty<string>(),
                run = new CircuitRunState()
            };
        }
    }
}
