using UnityEngine;

namespace MonsterCollect.Events
{
    /// <summary>Authorable seasonal / limited-time event. Add new events without code changes.</summary>
    [CreateAssetMenu(fileName = "SeasonalEvent", menuName = "Monster Collect/Seasonal Event")]
    public class SeasonalEventDefinition : ScriptableObject
    {
        public string EventId = "spring_festival";
        public string DisplayName = "Spring Festival";
        [TextArea] public string Description = "Bonus scans and rare finds!";
        public int Priority = 10;
        public Color BannerColor = new Color(0.2f, 0.55f, 0.35f, 1f);

        [Header("Schedule")]
        public EventScheduleKind ScheduleKind = EventScheduleKind.LocalDateRange;
        public long StartUtc;
        public long EndUtc;
        public string LocalStartDate = "2026-03-01";
        public string LocalEndDate = "2026-03-14";
        public int AnnualStartMonth = 3;
        public int AnnualStartDay = 1;
        public int AnnualEndMonth = 3;
        public int AnnualEndDay = 14;
        public bool PreferUtcWhenOnline;

        [Header("Modifiers")]
        public EventModifierEntry[] Modifiers = System.Array.Empty<EventModifierEntry>();

        [Header("QR bonuses")]
        public EventQrRuleEntry[] QrRules = System.Array.Empty<EventQrRuleEntry>();

        [Header("Event quests")]
        public EventQuestEntry[] EventQuests = System.Array.Empty<EventQuestEntry>();

        [Header("Exclusive content ids (must exist in catalogs)")]
        public string[] ExclusiveMoveIds = System.Array.Empty<string>();
        public string[] ExclusiveItemIds = System.Array.Empty<string>();
        public string DefaultVariantTag = string.Empty;
    }

    [CreateAssetMenu(fileName = "SeasonalEventCatalog", menuName = "Monster Collect/Seasonal Event Catalog")]
    public class SeasonalEventCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Events/SeasonalEventCatalog";

        public SeasonalEventDefinition[] Events = System.Array.Empty<SeasonalEventDefinition>();

        public SeasonalEventDefinition FindById(string eventId)
        {
            if (string.IsNullOrEmpty(eventId) || Events == null)
            {
                return null;
            }

            for (int i = 0; i < Events.Length; i++)
            {
                SeasonalEventDefinition def = Events[i];
                if (def != null && def.EventId == eventId)
                {
                    return def;
                }
            }

            return null;
        }
    }
}
