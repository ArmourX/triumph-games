using System.Collections.Generic;
using MonsterCollect.Battle;
using MonsterCollect.Monster;

namespace MonsterCollect.Core.Analytics
{
    /// <summary>Central analytics facade. Swap sinks for Mixpanel, Firebase, etc.</summary>
    public static class GameAnalyticsService
    {
        private static readonly List<IAnalyticsSink> Sinks = new List<IAnalyticsSink>();
        private static bool initialized;

        public static void Initialize()
        {
            if (initialized)
            {
                return;
            }

            initialized = true;
            Sinks.Add(new DebugLogAnalyticsSink());
        }

        public static void RegisterSink(IAnalyticsSink sink)
        {
            if (sink == null || Sinks.Contains(sink))
            {
                return;
            }

            Sinks.Add(sink);
        }

        public static void Track(string eventName, IReadOnlyDictionary<string, object> parameters = null)
        {
            if (!initialized)
            {
                Initialize();
            }

            for (int i = 0; i < Sinks.Count; i++)
            {
                Sinks[i].TrackEvent(eventName, parameters);
            }
        }

        public static void TrackScanSuccess(MonsterData monster, bool isSharedImport, bool isNewDexEntry)
        {
            Track(AnalyticsEvents.ScanSuccess, new Dictionary<string, object>
            {
                { "dex_number", monster?.DexNumber ?? 0 },
                { "species", monster?.Species.ToString() ?? "unknown" },
                { "rarity", monster?.Rarity.ToString() ?? "unknown" },
                { "shared_import", isSharedImport },
                { "new_dex_entry", isNewDexEntry }
            });
        }

        public static void TrackScanFailed(string reason)
        {
            Track(AnalyticsEvents.ScanFailed, new Dictionary<string, object>
            {
                { "reason", reason ?? "unknown" }
            });
        }

        public static void TrackBattleStart(string playerMonsterId, BattleOpponentMode mode, bool isPvP)
        {
            Track(AnalyticsEvents.BattleStart, new Dictionary<string, object>
            {
                { "player_monster_id", playerMonsterId ?? string.Empty },
                { "opponent_mode", mode.ToString() },
                { "is_pvp", isPvP }
            });
        }

        public static void TrackBattleEnd(BattleOutcome outcome, bool isPvP, int opponentLevel)
        {
            Track(AnalyticsEvents.BattleEnd, new Dictionary<string, object>
            {
                { "outcome", outcome.ToString() },
                { "is_pvp", isPvP },
                { "opponent_level", opponentLevel }
            });
        }

        public static void TrackBreedingComplete(MonsterData offspring)
        {
            Track(AnalyticsEvents.BreedingComplete, new Dictionary<string, object>
            {
                { "offspring_dex", offspring?.DexNumber ?? 0 },
                { "species", offspring?.Species.ToString() ?? "unknown" },
                { "rarity", offspring?.Rarity.ToString() ?? "unknown" }
            });
        }

        public static void TrackQuestCompleted(string questId, string category)
        {
            Track(AnalyticsEvents.QuestCompleted, new Dictionary<string, object>
            {
                { "quest_id", questId ?? string.Empty },
                { "category", category ?? string.Empty }
            });
        }

        public static void TrackQuestClaimed(string questId)
        {
            Track(AnalyticsEvents.QuestClaimed, new Dictionary<string, object>
            {
                { "quest_id", questId ?? string.Empty }
            });
        }
    }
}
