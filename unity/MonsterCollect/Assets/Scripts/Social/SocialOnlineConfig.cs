namespace MonsterCollect.Social
{
    /// <summary>Optional cloud endpoints. Empty = offline-only stubs.</summary>
    public static class SocialOnlineConfig
    {
        public static string ApiBaseUrl { get; set; } = string.Empty;

        public static bool IsOnlineEnabled =>
            !string.IsNullOrWhiteSpace(ApiBaseUrl);
    }
}
