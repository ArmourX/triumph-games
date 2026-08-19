using System;

namespace MonsterCollect.Social
{
    [Serializable]
    public class FriendEntry
    {
        public string friendCode = string.Empty;
        public string displayName = string.Empty;
        public long addedUtc;
    }

    [Serializable]
    public class PendingTradeOffer
    {
        public string offerId = string.Empty;
        public string fromFriendCode = string.Empty;
        public string fromDisplayName = string.Empty;
        public string monsterSharePayload = string.Empty;
        public string requestedSharePayload = string.Empty;
        public bool isIncoming = true;
        public bool isOnlineMailbox;
        public double createdUtc;
        public bool accepted;
    }

    [Serializable]
    public class LeaderboardCacheEntry
    {
        public string entryId = string.Empty;
        public string displayName = string.Empty;
        public string friendCode = string.Empty;
        public int score;
        public string category = string.Empty;
        public long updatedUtc;
    }

    [Serializable]
    public class SocialSaveState
    {
        public string friendCode = string.Empty;
        public string displayName = "Trainer";
        public FriendEntry[] friends = Array.Empty<FriendEntry>();
        public PendingTradeOffer[] pendingTrades = Array.Empty<PendingTradeOffer>();
        public LeaderboardCacheEntry[] leaderboardCache = Array.Empty<LeaderboardCacheEntry>();
        public int casualWins;
        public int casualLosses;
        public int rankedWins;
        public int rankedLosses;
        public string lastOnlineSyncUtc = string.Empty;
        public CommunityGalleryEntry[] gallery = Array.Empty<CommunityGalleryEntry>();
        public CommunityReport[] reports = Array.Empty<CommunityReport>();
        public string[] likedGalleryIds = Array.Empty<string>();
        public string[] hiddenGalleryIds = Array.Empty<string>();
        public string[] friendShowcaseMonsterIds = Array.Empty<string>();
        public string lastCommunityChallengeId = string.Empty;
        public int communityChallengeProgress;
        public bool communityChallengeClaimed;

        public static SocialSaveState CreateDefault()
        {
            return new SocialSaveState
            {
                displayName = "Trainer",
                friends = Array.Empty<FriendEntry>(),
                pendingTrades = Array.Empty<PendingTradeOffer>(),
                leaderboardCache = Array.Empty<LeaderboardCacheEntry>(),
                gallery = Array.Empty<CommunityGalleryEntry>(),
                reports = Array.Empty<CommunityReport>(),
                likedGalleryIds = Array.Empty<string>(),
                hiddenGalleryIds = Array.Empty<string>(),
                friendShowcaseMonsterIds = Array.Empty<string>()
            };
        }
    }
}
