using System;
using UnityEngine;

namespace MonsterCollect.Circuit
{
    public static class RuntimeTournamentCatalogFactory
    {
        public static TournamentCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<TournamentCatalog>();
            catalog.Events = new[]
            {
                Event("ladder_open", "Open Circuit", "Anyone may climb. Fair CPU or async ghosts.",
                    CircuitEventKind.Ladder, rank: 0, level: 1, fee: 8, minRating: 0, maxRating: 1199,
                    winCoins: 10, winPoints: 12),
                Event("ladder_challenger", "Challenger Circuit", "Tougher ghosts. Rank 3 or 1200 rating.",
                    CircuitEventKind.Ladder, rank: 2, level: 5, fee: 18, minRating: 1200, maxRating: 1499,
                    winCoins: 18, winPoints: 18, title: "title_challenger"),
                Event("ladder_elite", "Elite Circuit", "High-stakes ladder. Rank 4 or 1500 rating.",
                    CircuitEventKind.Ladder, rank: 3, level: 10, fee: 30, minRating: 1500, maxRating: 1799,
                    winCoins: 28, winPoints: 24, title: "title_elite"),
                Event("ladder_champion", "Champion Circuit", "The top split. Rank 5 or 1800 rating.",
                    CircuitEventKind.Ladder, rank: 4, level: 14, fee: 45, minRating: 1800, maxRating: 9999,
                    winCoins: 40, winPoints: 32, title: "title_champion", cosmetic: "banner_champion"),

                Event("cup_meadow", "Meadow Invitational", "8-trainer single-elim. Optional first cup.",
                    CircuitEventKind.Cup, rank: 0, level: 1, fee: 20, minRating: 0, maxRating: 9999,
                    rounds: 3, winCoins: 40, winPoints: 50, title: "title_meadow_cup", item: "care_treat",
                    cosmetic: "banner_meadow"),
                Event("cup_ember", "Ember Cup", "Volcanic bracket. Rank 3 or Challenger rating.",
                    CircuitEventKind.Cup, rank: 2, level: 8, fee: 40, minRating: 1100, maxRating: 9999,
                    rounds: 3, winCoins: 70, winPoints: 80, title: "title_ember_cup", item: "power_charm",
                    cosmetic: "banner_ember"),
                Event("cup_legend", "Legend Bracket", "Season showcase. Rank 5 or Elite rating.",
                    CircuitEventKind.Cup, rank: 4, level: 12, fee: 70, minRating: 1400, maxRating: 9999,
                    rounds: 3, winCoins: 120, winPoints: 120, title: "title_legend_cup", item: "lucky_bell",
                    cosmetic: "banner_legend")
            };
            catalog.Titles = new[]
            {
                Title("title_rookie", "Circuit Rookie", "Played your first circuit match.", minPoints: 1),
                Title("title_contender", "Season Contender", "Ten wins this season.", minPoints: 80),
                Title("title_challenger", "Challenger", "Reached Challenger split.", minRating: 1200),
                Title("title_elite", "Elite", "Reached Elite split.", minRating: 1500),
                Title("title_champion", "Circuit Champion", "Reached Champion split.", minRating: 1800),
                Title("title_meadow_cup", "Meadow Cup Winner", "Won the Meadow Invitational."),
                Title("title_ember_cup", "Ember Champion", "Won the Ember Cup."),
                Title("title_legend_cup", "Legend of the Circuit", "Won the Legend Bracket.")
            };
            catalog.CpuTrainers = new[]
            {
                Cpu("cpu_kai", "Ashen Kai", "AI-KAI01", 980),
                Cpu("cpu_rowan", "Tide Rowan", "AI-ROW02", 1040),
                Cpu("cpu_mira", "Mira Vale", "AI-MIR03", 1110),
                Cpu("cpu_juno", "Cinder Juno", "AI-JUN04", 1180),
                Cpu("cpu_peck", "Stone Peck", "AI-PEC05", 1260),
                Cpu("cpu_quill", "Nova Quill", "AI-QUI06", 1340),
                Cpu("cpu_lumen", "Reed Lumen", "AI-LUM07", 1420),
                Cpu("cpu_marrow", "Hex Marrow", "AI-MAR08", 1510),
                Cpu("cpu_pim", "Gale Pim", "AI-PIM09", 1600),
                Cpu("cpu_brant", "Ivy Brant", "AI-BRA10", 1720),
                Cpu("cpu_nori", "Shale Nori", "AI-NOR11", 1840),
                Cpu("cpu_vesper", "Vesper Quinn", "AI-VES12", 1960)
            };
            return catalog;
        }

        private static CircuitEventEntry Event(
            string id,
            string name,
            string desc,
            CircuitEventKind kind,
            int rank,
            int level,
            int fee,
            int minRating,
            int maxRating,
            int rounds = 1,
            int winCoins = 12,
            int winPoints = 15,
            string title = "",
            string item = "",
            string cosmetic = "")
        {
            return new CircuitEventEntry
            {
                eventId = id,
                displayName = name,
                description = desc,
                kind = kind,
                requiredTrainerRankIndex = rank,
                minMonsterLevel = level,
                entryFeeCoins = fee,
                minRating = minRating,
                maxRating = maxRating,
                rounds = rounds,
                winCoins = winCoins,
                lossCoins = Math.Max(1, fee / 8),
                winPoints = winPoints,
                titleRewardId = title,
                itemRewardId = item,
                cosmeticRewardId = cosmetic
            };
        }

        private static CircuitTitleEntry Title(
            string id,
            string name,
            string desc,
            int minRating = 0,
            int minPoints = 0,
            int cups = 0)
        {
            return new CircuitTitleEntry
            {
                titleId = id,
                displayName = name,
                description = desc,
                minRating = minRating,
                minCareerPoints = minPoints,
                minCupWins = cups
            };
        }

        private static CircuitTrainerEntry Cpu(string id, string name, string code, int rating)
        {
            return new CircuitTrainerEntry
            {
                trainerId = id,
                displayName = name,
                friendCode = code,
                baseRating = rating
            };
        }
    }
}
