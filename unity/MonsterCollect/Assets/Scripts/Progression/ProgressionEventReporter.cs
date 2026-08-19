using MonsterCollect.Core.Analytics;
using MonsterCollect.Monster;
using MonsterCollect.Ranch;

namespace MonsterCollect.Progression
{
    /// <summary>Central entry point for gameplay events that drive quests, progression, and analytics.</summary>
    public static class ProgressionEventReporter
    {
        public static void ReportMonsterCaptured(MonsterData monster, bool isNewDexEntry)
        {
            MonsterBookService.RecordMonsterDiscovery(monster, isNewDexEntry);
            QuestService.ReportMonsterScanned(monster);
            GameAnalyticsService.Track(AnalyticsEvents.MonsterCaptured, new System.Collections.Generic.Dictionary<string, object>
            {
                { "dex_number", monster?.DexNumber ?? 0 },
                { "new_dex_entry", isNewDexEntry }
            });
        }

        public static void ReportBattleWon(MonsterData playerMonster)
        {
            QuestService.ReportBattleWon(playerMonster);
        }

        public static void ReportCircuitWin()
        {
            QuestService.ReportCircuitWin();
            GameAnalyticsService.Track("circuit_win", new System.Collections.Generic.Dictionary<string, object>
            {
                { "rating", MonsterCollect.Circuit.TournamentService.State.seasonRating },
                { "division", MonsterCollect.Circuit.TournamentService.CurrentDivisionName() }
            });
        }

        public static void ReportMonsterBred(MonsterData offspring)
        {
            QuestService.ReportMonsterBred(offspring);
            GameAnalyticsService.TrackBreedingComplete(offspring);
        }

        public static void ReportMonsterEvolved(MonsterData monster, EvolutionPathEntry path)
        {
            MonsterBookService.RecordEvolutionDiscovery(monster);
            GameAnalyticsService.Track("monster_evolved", new System.Collections.Generic.Dictionary<string, object>
            {
                { "dex_number", monster?.DexNumber ?? 0 },
                { "stage", monster?.EvolutionStage ?? 0 },
                { "path_id", path?.pathId ?? string.Empty }
            });
        }

        public static void ReportFeed()
        {
            QuestService.ReportFeed();
        }

        public static void ReportErrantryComplete()
        {
            QuestService.ReportErrantryComplete();
        }

        public static void ReportExplorationComplete(string zoneId)
        {
            QuestService.ReportExplorationComplete(zoneId);
            GameAnalyticsService.Track("exploration_complete", new System.Collections.Generic.Dictionary<string, object>
            {
                { "zone_id", zoneId ?? string.Empty },
                { "weather", WorldCycleService.CurrentWeather.ToString() },
                { "day_phase", WorldCycleService.CurrentDayPhase.ToString() }
            });
        }

        public static void ReportCraftComplete(string recipeId)
        {
            GameAnalyticsService.Track("craft_complete", new System.Collections.Generic.Dictionary<string, object>
            {
                { "recipe_id", recipeId ?? string.Empty }
            });
        }

        public static void ReportFacilityUsed()
        {
            QuestService.ReportFacilityUsed();
        }

        public static void ReportCoinsSpent(int amount)
        {
            QuestService.ReportCoinsSpent(amount);
        }
    }
}
