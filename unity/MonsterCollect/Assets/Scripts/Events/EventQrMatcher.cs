using System;
using MonsterCollect.Monster;
using MonsterCollect.QR;

namespace MonsterCollect.Events
{
    public readonly struct EventQrMatchResult
    {
        public EventQrMatchResult(string eventId, string ruleId, float bonusMultiplier, string variantTag, MonsterRarity? bonusRarity)
        {
            EventId = eventId;
            RuleId = ruleId;
            BonusMultiplier = bonusMultiplier;
            VariantTag = variantTag;
            BonusRarity = bonusRarity;
        }

        public string EventId { get; }
        public string RuleId { get; }
        public float BonusMultiplier { get; }
        public string VariantTag { get; }
        public MonsterRarity? BonusRarity { get; }
        public bool HasMatch => !string.IsNullOrEmpty(EventId);
    }

    public static class EventQrMatcher
    {
        public static bool TryMatch(SeasonalEventDefinition definition, string extractedPayload, out EventQrMatchResult result)
        {
            result = default;
            if (definition == null || definition.QrRules == null || definition.QrRules.Length == 0 ||
                string.IsNullOrEmpty(extractedPayload))
            {
                return false;
            }

            string category = QRResultExtractor.GetCategory(extractedPayload);
            string lowerPayload = extractedPayload.ToLowerInvariant();
            string lowerCategory = category?.ToLowerInvariant() ?? string.Empty;

            for (int i = 0; i < definition.QrRules.Length; i++)
            {
                EventQrRuleEntry rule = definition.QrRules[i];
                if (rule == null || string.IsNullOrWhiteSpace(rule.matchValue))
                {
                    continue;
                }

                if (!MatchesRule(rule, extractedPayload, lowerPayload, category, lowerCategory))
                {
                    continue;
                }

                MonsterRarity? rarity = null;
                if (!string.IsNullOrWhiteSpace(rule.bonusRarity) &&
                    Enum.TryParse(rule.bonusRarity, true, out MonsterRarity parsed))
                {
                    rarity = parsed;
                }

                result = new EventQrMatchResult(
                    definition.EventId,
                    rule.ruleId,
                    Math.Max(1f, rule.bonusMultiplier),
                    string.IsNullOrWhiteSpace(rule.variantTag) ? definition.DefaultVariantTag : rule.variantTag,
                    rarity);
                return true;
            }

            return false;
        }

        private static bool MatchesRule(
            EventQrRuleEntry rule,
            string payload,
            string lowerPayload,
            string category,
            string lowerCategory)
        {
            string kind = rule.matchKind?.Trim().ToLowerInvariant() ?? "keyword";
            string value = rule.matchValue.Trim();
            StringComparison comparison = rule.caseInsensitive
                ? StringComparison.OrdinalIgnoreCase
                : StringComparison.Ordinal;

            switch (kind)
            {
                case "keyword":
                    return lowerPayload.Contains(rule.caseInsensitive ? value.ToLowerInvariant() : value);

                case "category":
                    return !string.IsNullOrEmpty(category) &&
                           string.Equals(category, value, comparison);

                case "prefix":
                    return payload.StartsWith(value, comparison);

                case "url_host":
                    return TryParseHost(payload, out string host) &&
                           string.Equals(host, value, comparison);

                case "url_path":
                    return payload.IndexOf(value, comparison) >= 0 &&
                           (payload.StartsWith("http", StringComparison.OrdinalIgnoreCase) ||
                            payload.Contains("://", StringComparison.Ordinal));

                default:
                    return lowerPayload.Contains(value.ToLowerInvariant());
            }
        }

        private static bool TryParseHost(string payload, out string host)
        {
            host = string.Empty;
            if (!payload.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            try
            {
                Uri uri = new Uri(payload);
                host = uri.Host;
                return !string.IsNullOrEmpty(host);
            }
            catch
            {
                return false;
            }
        }
    }
}
