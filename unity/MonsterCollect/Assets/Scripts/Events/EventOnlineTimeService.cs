namespace MonsterCollect.Events
{
    /// <summary>Optional server time sync for event schedules when online endpoints are configured.</summary>
    public static class EventOnlineTimeService
    {
        private static long? cachedUtcSeconds;
        private static double cachedAtRealtime;

        public static bool HasSyncedTime => cachedUtcSeconds.HasValue;

        /// <summary>Future hook: fetch server UTC from API. Returns false when offline.</summary>
        public static bool TrySyncFromServer()
        {
            if (!Social.SocialOnlineConfig.IsOnlineEnabled)
            {
                return false;
            }

            // Stub — replace with HTTP time endpoint when live ops is wired up.
            return false;
        }

        public static long GetUtcNow(bool preferOnline)
        {
            if (preferOnline && cachedUtcSeconds.HasValue)
            {
                double elapsed = UnityEngine.Time.realtimeSinceStartupAsDouble - cachedAtRealtime;
                return cachedUtcSeconds.Value + (long)elapsed;
            }

            return System.DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        }

        public static void ApplyServerUtc(long utcSeconds)
        {
            cachedUtcSeconds = utcSeconds;
            cachedAtRealtime = UnityEngine.Time.realtimeSinceStartupAsDouble;
        }
    }
}
