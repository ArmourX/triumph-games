using System;

namespace MonsterCollect.Events
{
    [Serializable]
    public class EventModifierEntry
    {
        public EventModifierType modifierType = EventModifierType.BattleRewardMultiplier;
        public float value = 1f;
        public string stringValue = string.Empty;
    }

    [Serializable]
    public class EventQuestEntry
    {
        public string questId = "event_scan_5";
        public string displayName = "Event Scout";
        public string description = "Scan 5 codes during the event.";
        public int objectiveType;
        public int targetCount = 5;
        public string objectiveParameter = string.Empty;
        public int coinReward = 50;
        public int trainerXpReward = 25;
        public int essenceReward;
        public string itemRewardId = string.Empty;
        public int itemRewardQuantity = 1;
    }

    [Serializable]
    public class EventQrRuleEntry
    {
        public string ruleId = "keyword_spring";
        /// <summary>keyword, url_host, url_path, prefix, category</summary>
        public string matchKind = "keyword";
        public string matchValue = "spring";
        public bool caseInsensitive = true;
        public float bonusMultiplier = 1f;
        public string variantTag = string.Empty;
        public string bonusRarity = string.Empty;
    }
}
