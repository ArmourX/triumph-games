using System;

using MonsterCollect.Core.RemoteConfig;

namespace MonsterCollect.Data
{
    /// <summary>
    /// Soft anti-spam guard for QR captures (deterministic and shared imports).
    /// </summary>
    public static class ScanLimitService
    {
        public const int DefaultMaxScansPerDay = 15;

        public static int MaxScansPerDay => RemoteConfigService.MaxScansPerDay;

        public static bool CanScanToday(double utcNowSeconds, out string message)
        {
            EnsureDayReset(utcNowSeconds);

            if (MonsterCollectionService.ScansToday >= MaxScansPerDay)
            {
                message = $"Daily scan limit reached ({MaxScansPerDay}/day). Try again tomorrow.";
                return false;
            }

            message = null;
            return true;
        }

        public static bool TryConsumeScan(double utcNowSeconds, out string message)
        {
            if (!CanScanToday(utcNowSeconds, out message))
            {
                return false;
            }

            MonsterCollectionService.RecordScan(utcNowSeconds);
            return true;
        }

        /// <summary>Reverses a scan count when energy spend fails after the limit was consumed.</summary>
        public static void RefundScan()
        {
            MonsterCollectionService.RefundLastScan();
        }

        /// <summary>Clears today's scan counter (used when resetting scan history in settings).</summary>
        public static void ResetTodayScanCount(double utcNowSeconds)
        {
            string today = DateTimeOffset.FromUnixTimeSeconds((long)utcNowSeconds).UtcDateTime.ToString("yyyy-MM-dd");
            MonsterCollectionService.ResetDailyScanCounters(today);
        }

        private static void EnsureDayReset(double utcNowSeconds)
        {
            string today = DateTimeOffset.FromUnixTimeSeconds((long)utcNowSeconds).UtcDateTime.ToString("yyyy-MM-dd");

            if (MonsterCollectionService.LastScanDayKey == today)
            {
                return;
            }

            MonsterCollectionService.ResetDailyScanCounters(today);
        }
    }
}
