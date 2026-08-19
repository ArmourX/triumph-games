using System;

namespace MonsterCollect.Social
{
    public enum CommunityVisibility
    {
        Public = 0,
        Friends = 1,
        Hidden = 2
    }

    public enum CommunityReportReason
    {
        InappropriateName = 0,
        OffensiveContent = 1,
        Spam = 2,
        Other = 3
    }

    [Serializable]
    public class CommunityGalleryEntry
    {
        public string entryId = string.Empty;
        public string ownerFriendCode = string.Empty;
        public string ownerDisplayName = string.Empty;
        public string monsterName = string.Empty;
        public int dexNumber;
        public int rarity;
        public string element = string.Empty;
        public string sourceHash = string.Empty;
        public string sharePayload = string.Empty;
        public string screenshotPath = string.Empty;
        public int likes;
        public long submittedUtc;
        public int visibility;
        public string challengeWeekId = string.Empty;
        public bool isDemo;
    }

    [Serializable]
    public class CommunityReport
    {
        public string reportId = string.Empty;
        public string galleryEntryId = string.Empty;
        public string reporterFriendCode = string.Empty;
        public int reason;
        public string notes = string.Empty;
        public long createdUtc;
    }

    public readonly struct CommunityChallenge
    {
        public string WeekId { get; }
        public string Title { get; }
        public string Description { get; }
        public string ElementFilter { get; }
        public int MinRarity { get; }
        public int CoinReward { get; }
        public int XpReward { get; }

        public CommunityChallenge(
            string weekId,
            string title,
            string description,
            string elementFilter,
            int minRarity,
            int coinReward,
            int xpReward)
        {
            WeekId = weekId;
            Title = title;
            Description = description;
            ElementFilter = elementFilter;
            MinRarity = minRarity;
            CoinReward = coinReward;
            XpReward = xpReward;
        }
    }
}
