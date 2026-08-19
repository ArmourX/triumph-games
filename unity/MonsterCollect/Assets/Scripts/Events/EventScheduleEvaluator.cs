using System;
using System.Globalization;
using MonsterCollect.Social;
using UnityEngine;

namespace MonsterCollect.Events
{
    public static class EventScheduleEvaluator
    {
        public static bool IsActive(SeasonalEventDefinition definition, long nowUtcSeconds)
        {
            if (definition == null)
            {
                return false;
            }

            return definition.ScheduleKind switch
            {
                EventScheduleKind.AlwaysActive => true,
                EventScheduleKind.FixedUtc => IsWithinUtc(definition.StartUtc, definition.EndUtc, nowUtcSeconds),
                EventScheduleKind.LocalDateRange => IsWithinLocalDates(definition.LocalStartDate, definition.LocalEndDate, nowUtcSeconds),
                EventScheduleKind.RecurringAnnual => IsWithinAnnual(definition, nowUtcSeconds),
                _ => false
            };
        }

        public static long GetEndUtcSeconds(SeasonalEventDefinition definition, long nowUtcSeconds)
        {
            if (definition == null)
            {
                return 0;
            }

            switch (definition.ScheduleKind)
            {
                case EventScheduleKind.FixedUtc:
                    return definition.EndUtc;

                case EventScheduleKind.LocalDateRange:
                    if (TryParseLocalDate(definition.LocalEndDate, out DateTime endLocal))
                    {
                        DateTime endOfDay = endLocal.Date.AddDays(1).AddSeconds(-1);
                        return new DateTimeOffset(endOfDay).ToUnixTimeSeconds();
                    }

                    return definition.EndUtc;

                case EventScheduleKind.RecurringAnnual:
                {
                    DateTime nowLocal = DateTimeOffset.FromUnixTimeSeconds(nowUtcSeconds).LocalDateTime;
                    var endLocalAnnual = new DateTime(nowLocal.Year, definition.AnnualEndMonth, definition.AnnualEndDay, 23, 59, 59);
                    if (endLocalAnnual < nowLocal &&
                        definition.AnnualEndMonth < definition.AnnualStartMonth)
                    {
                        endLocalAnnual = endLocalAnnual.AddYears(1);
                    }

                    return new DateTimeOffset(endLocalAnnual).ToUnixTimeSeconds();
                }

                case EventScheduleKind.AlwaysActive:
                    return 0;

                default:
                    return 0;
            }
        }

        private static bool IsWithinUtc(long startUtc, long endUtc, long nowUtc)
        {
            if (startUtc > 0 && nowUtc < startUtc)
            {
                return false;
            }

            return endUtc <= 0 || nowUtc <= endUtc;
        }

        private static bool IsWithinLocalDates(string startDate, string endDate, long nowUtc)
        {
            if (!TryParseLocalDate(startDate, out DateTime start) ||
                !TryParseLocalDate(endDate, out DateTime end))
            {
                return false;
            }

            DateTime nowLocal = DateTimeOffset.FromUnixTimeSeconds(nowUtc).LocalDateTime.Date;
            return nowLocal >= start.Date && nowLocal <= end.Date;
        }

        private static bool IsWithinAnnual(SeasonalEventDefinition definition, long nowUtc)
        {
            DateTime nowLocal = DateTimeOffset.FromUnixTimeSeconds(nowUtc).LocalDateTime;
            var start = new DateTime(nowLocal.Year, definition.AnnualStartMonth, definition.AnnualStartDay);
            var end = new DateTime(nowLocal.Year, definition.AnnualEndMonth, definition.AnnualEndDay, 23, 59, 59);

            if (end < start)
            {
                if (nowLocal.Month >= definition.AnnualStartMonth)
                {
                    end = end.AddYears(1);
                }
                else
                {
                    start = start.AddYears(-1);
                }
            }

            return nowLocal >= start && nowLocal <= end;
        }

        private static bool TryParseLocalDate(string value, out DateTime date)
        {
            date = default;
            if (string.IsNullOrWhiteSpace(value))
            {
                return false;
            }

            return DateTime.TryParseExact(value.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture,
                DateTimeStyles.None, out date);
        }

        public static long GetNowUtcSeconds(bool preferUtcWhenOnline)
        {
            if (preferUtcWhenOnline)
            {
                EventOnlineTimeService.TrySyncFromServer();
            }

            return EventOnlineTimeService.GetUtcNow(preferUtcWhenOnline && SocialOnlineConfig.IsOnlineEnabled);
        }
    }
}
