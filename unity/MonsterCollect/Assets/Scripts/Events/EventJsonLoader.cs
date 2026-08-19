using System;
using UnityEngine;

namespace MonsterCollect.Events
{
    [Serializable]
    public class EventJsonEntry
    {
        public string eventId = "spring_festival";
        public string displayName = "Spring Festival";
        public string description = "Bonus scans and rare finds!";
        public int priority = 10;
        public string bannerColorHex = "#339959";
        public int scheduleKind;
        public long startUtc;
        public long endUtc;
        public string localStartDate = "2026-03-01";
        public string localEndDate = "2026-03-14";
        public int annualStartMonth = 3;
        public int annualStartDay = 1;
        public int annualEndMonth = 3;
        public int annualEndDay = 14;
        public bool preferUtcWhenOnline;
        public EventModifierEntry[] modifiers = Array.Empty<EventModifierEntry>();
        public EventQrRuleEntry[] qrRules = Array.Empty<EventQrRuleEntry>();
        public EventQuestEntry[] eventQuests = Array.Empty<EventQuestEntry>();
        public string[] exclusiveMoveIds = Array.Empty<string>();
        public string[] exclusiveItemIds = Array.Empty<string>();
        public string defaultVariantTag = string.Empty;
    }

    [Serializable]
    public class EventCatalogJson
    {
        public string version = "1";
        public EventJsonEntry[] events = Array.Empty<EventJsonEntry>();
    }

    public static class EventJsonLoader
    {
        public static SeasonalEventDefinition ToDefinition(EventJsonEntry entry)
        {
            if (entry == null || string.IsNullOrWhiteSpace(entry.eventId))
            {
                return null;
            }

            var def = ScriptableObject.CreateInstance<SeasonalEventDefinition>();
            def.EventId = entry.eventId.Trim();
            def.DisplayName = string.IsNullOrWhiteSpace(entry.displayName) ? entry.eventId : entry.displayName;
            def.Description = entry.description ?? string.Empty;
            def.Priority = entry.priority;
            def.BannerColor = ParseColor(entry.bannerColorHex, new Color(0.2f, 0.55f, 0.35f));
            def.ScheduleKind = (EventScheduleKind)Mathf.Clamp(entry.scheduleKind, 0, (int)EventScheduleKind.AlwaysActive);
            def.StartUtc = entry.startUtc;
            def.EndUtc = entry.endUtc;
            def.LocalStartDate = entry.localStartDate ?? string.Empty;
            def.LocalEndDate = entry.localEndDate ?? string.Empty;
            def.AnnualStartMonth = entry.annualStartMonth;
            def.AnnualStartDay = entry.annualStartDay;
            def.AnnualEndMonth = entry.annualEndMonth;
            def.AnnualEndDay = entry.annualEndDay;
            def.PreferUtcWhenOnline = entry.preferUtcWhenOnline;
            def.Modifiers = entry.modifiers ?? Array.Empty<EventModifierEntry>();
            def.QrRules = entry.qrRules ?? Array.Empty<EventQrRuleEntry>();
            def.EventQuests = entry.eventQuests ?? Array.Empty<EventQuestEntry>();
            def.ExclusiveMoveIds = entry.exclusiveMoveIds ?? Array.Empty<string>();
            def.ExclusiveItemIds = entry.exclusiveItemIds ?? Array.Empty<string>();
            def.DefaultVariantTag = entry.defaultVariantTag ?? string.Empty;
            return def;
        }

        public static EventJsonEntry FromDefinition(SeasonalEventDefinition def)
        {
            if (def == null)
            {
                return null;
            }

            return new EventJsonEntry
            {
                eventId = def.EventId,
                displayName = def.DisplayName,
                description = def.Description,
                priority = def.Priority,
                bannerColorHex = "#" + ColorUtility.ToHtmlStringRGB(def.BannerColor),
                scheduleKind = (int)def.ScheduleKind,
                startUtc = def.StartUtc,
                endUtc = def.EndUtc,
                localStartDate = def.LocalStartDate,
                localEndDate = def.LocalEndDate,
                annualStartMonth = def.AnnualStartMonth,
                annualStartDay = def.AnnualStartDay,
                annualEndMonth = def.AnnualEndMonth,
                annualEndDay = def.AnnualEndDay,
                preferUtcWhenOnline = def.PreferUtcWhenOnline,
                modifiers = def.Modifiers ?? Array.Empty<EventModifierEntry>(),
                qrRules = def.QrRules ?? Array.Empty<EventQrRuleEntry>(),
                eventQuests = def.EventQuests ?? Array.Empty<EventQuestEntry>(),
                exclusiveMoveIds = def.ExclusiveMoveIds ?? Array.Empty<string>(),
                exclusiveItemIds = def.ExclusiveItemIds ?? Array.Empty<string>(),
                defaultVariantTag = def.DefaultVariantTag
            };
        }

        private static Color ParseColor(string hex, Color fallback)
        {
            if (string.IsNullOrWhiteSpace(hex))
            {
                return fallback;
            }

            string value = hex.Trim();
            if (!value.StartsWith("#", StringComparison.Ordinal))
            {
                value = "#" + value;
            }

            return ColorUtility.TryParseHtmlString(value, out Color parsed) ? parsed : fallback;
        }
    }
}
