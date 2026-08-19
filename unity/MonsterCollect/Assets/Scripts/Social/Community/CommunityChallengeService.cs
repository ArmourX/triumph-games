using System;
using System.Globalization;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using UnityEngine;

namespace MonsterCollect.Social
{
    /// <summary>Rotating weekly community highlight pulled from shared gallery QRs.</summary>
    public static class CommunityChallengeService
    {
        public static CommunityChallenge Current
        {
            get
            {
                DateTime utc = DateTime.UtcNow;
                int week = CultureInfo.InvariantCulture.Calendar.GetWeekOfYear(
                    utc, CalendarWeekRule.FirstFourDayWeek, DayOfWeek.Monday);
                string weekId = $"{utc.Year}-W{week:00}";
                return FromWeek(weekId, week);
            }
        }

        public static bool Matches(CommunityGalleryEntry entry, CommunityChallenge challenge)
        {
            if (entry == null)
            {
                return false;
            }

            if (!string.IsNullOrEmpty(challenge.ElementFilter) &&
                !string.Equals(entry.element, challenge.ElementFilter, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            return entry.rarity >= challenge.MinRarity;
        }

        public static void RecordSubmission(CommunityGalleryEntry entry)
        {
            if (entry == null)
            {
                return;
            }

            MonsterCollectionService.EnsureSocialLoaded();
            CommunityChallenge challenge = Current;
            SocialSaveState social = MonsterCollectionService.SocialState;

            if (social.lastCommunityChallengeId != challenge.WeekId)
            {
                social.lastCommunityChallengeId = challenge.WeekId;
                social.communityChallengeProgress = 0;
                social.communityChallengeClaimed = false;
            }

            if (Matches(entry, challenge) && entry.ownerFriendCode == SocialProfileService.FriendCode)
            {
                social.communityChallengeProgress = Mathf.Max(social.communityChallengeProgress, 1);
                MonsterCollectionService.SaveSocial();
            }
        }

        public static bool TryClaim(out string message)
        {
            MonsterCollectionService.EnsureSocialLoaded();
            CommunityChallenge challenge = Current;
            SocialSaveState social = MonsterCollectionService.SocialState;

            if (social.lastCommunityChallengeId != challenge.WeekId)
            {
                social.lastCommunityChallengeId = challenge.WeekId;
                social.communityChallengeProgress = 0;
                social.communityChallengeClaimed = false;
            }

            if (social.communityChallengeClaimed)
            {
                message = "Already claimed this week's highlight reward.";
                return false;
            }

            if (social.communityChallengeProgress < 1)
            {
                message = "Share a matching monster to the gallery first.";
                return false;
            }

            TrainerProgressionService.AddCoins(challenge.CoinReward);
            TrainerProgressionService.AddTrainerXp(challenge.XpReward);
            social.communityChallengeClaimed = true;
            MonsterCollectionService.SaveSocial();
            message = $"Claimed +{challenge.CoinReward} coins and +{challenge.XpReward} XP!";
            return true;
        }

        private static CommunityChallenge FromWeek(string weekId, int week)
        {
            return (week % 6) switch
            {
                0 => new CommunityChallenge(weekId, "Fire Showcase", "Share a Fire monster QR this week.", "Fire", 0, 40, 30),
                1 => new CommunityChallenge(weekId, "Tide Parade", "Share a Water monster with friends.", "Water", 0, 40, 30),
                2 => new CommunityChallenge(weekId, "Rare Spotlight", "Post a Rare or better monster.", string.Empty, (int)MonsterRarity.Rare, 55, 40),
                3 => new CommunityChallenge(weekId, "Leaf Festival", "Share a Grass monster QR.", "Grass", 0, 40, 30),
                4 => new CommunityChallenge(weekId, "Legend Watch", "Feature an Epic or Legendary.", string.Empty, (int)MonsterRarity.Epic, 70, 50),
                _ => new CommunityChallenge(weekId, "Trainer Favorites", "Share any favorite monster QR.", string.Empty, 0, 35, 25)
            };
        }
    }
}
