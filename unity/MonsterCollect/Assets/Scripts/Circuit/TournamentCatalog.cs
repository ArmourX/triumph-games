using System;
using UnityEngine;

namespace MonsterCollect.Circuit
{
    public enum CircuitEventKind
    {
        Ladder = 0,
        Cup = 1
    }

    [Serializable]
    public class CircuitEventEntry
    {
        public string eventId = "ladder_open";
        public string displayName = "Open Circuit";
        public string description = "Ongoing ranked ladder.";
        public CircuitEventKind kind = CircuitEventKind.Ladder;
        public int requiredTrainerRankIndex;
        public int minMonsterLevel = 1;
        public int entryFeeCoins = 10;
        public int minRating;
        public int maxRating = 9999;
        public int rounds = 1;
        public int winCoins = 12;
        public int lossCoins = 2;
        public int winPoints = 15;
        public string titleRewardId = string.Empty;
        public string cosmeticRewardId = string.Empty;
        public string itemRewardId = string.Empty;
    }

    [Serializable]
    public class CircuitTitleEntry
    {
        public string titleId = "title_rookie";
        public string displayName = "Circuit Rookie";
        public string description = "Enter the ranked circuit.";
        public int minRating;
        public int minCareerPoints;
        public int minCupWins;
    }

    [Serializable]
    public class CircuitTrainerEntry
    {
        public string trainerId = "cpu_kai";
        public string displayName = "Ashen Kai";
        public string friendCode = "AI-KAI01";
        public int baseRating = 1000;
    }

    [CreateAssetMenu(fileName = "TournamentCatalog", menuName = "Monster Collect/Tournament Catalog")]
    public class TournamentCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Circuit/TournamentCatalog";

        public CircuitEventEntry[] Events = Array.Empty<CircuitEventEntry>();
        public CircuitTitleEntry[] Titles = Array.Empty<CircuitTitleEntry>();
        public CircuitTrainerEntry[] CpuTrainers = Array.Empty<CircuitTrainerEntry>();

        public CircuitEventEntry FindEvent(string eventId)
        {
            if (string.IsNullOrEmpty(eventId) || Events == null)
            {
                return null;
            }

            for (int i = 0; i < Events.Length; i++)
            {
                if (Events[i] != null && Events[i].eventId == eventId)
                {
                    return Events[i];
                }
            }

            return null;
        }

        public CircuitTitleEntry FindTitle(string titleId)
        {
            if (string.IsNullOrEmpty(titleId) || Titles == null)
            {
                return null;
            }

            for (int i = 0; i < Titles.Length; i++)
            {
                if (Titles[i] != null && Titles[i].titleId == titleId)
                {
                    return Titles[i];
                }
            }

            return null;
        }
    }
}
