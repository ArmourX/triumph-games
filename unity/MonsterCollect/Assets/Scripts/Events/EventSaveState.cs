using System;

namespace MonsterCollect.Events
{
    [Serializable]
    public class EventQuestProgressEntry
    {
        public string questId = string.Empty;
        public int current;
        public bool completed;
        public bool rewardClaimed;
    }

    [Serializable]
    public class EventProgressEntry
    {
        public string eventId = string.Empty;
        public int scans;
        public int battlesWon;
        public int qrBonusTriggers;
        public EventQuestProgressEntry[] questProgress = Array.Empty<EventQuestProgressEntry>();
        public long firstParticipationUtc;
        public long lastActivityUtc;
    }

    [Serializable]
    public class EventSaveState
    {
        public EventProgressEntry[] eventProgress = Array.Empty<EventProgressEntry>();
        public string[] dismissedBannerEventIds = Array.Empty<string>();

        public static EventSaveState CreateDefault()
        {
            return new EventSaveState
            {
                eventProgress = Array.Empty<EventProgressEntry>(),
                dismissedBannerEventIds = Array.Empty<string>()
            };
        }
    }
}
