using System;
using System.Collections.Generic;
using System.Linq;
using MonsterCollect.Data;

namespace MonsterCollect.Social
{
    public static class SocialProfileService
    {
        public static event Action ProfileChanged;

        public static string FriendCode
        {
            get
            {
                EnsureReady();
                return MonsterCollectionService.SocialState.friendCode;
            }
        }

        public static string DisplayName
        {
            get
            {
                EnsureReady();
                return MonsterCollectionService.SocialState.displayName;
            }
            set
            {
                EnsureReady();
                MonsterCollectionService.SocialState.displayName = string.IsNullOrWhiteSpace(value)
                    ? "Trainer"
                    : value.Trim().Substring(0, Math.Min(24, value.Trim().Length));
                MonsterCollectionService.SaveSocial();
                ProfileChanged?.Invoke();
            }
        }

        public static void EnsureReady()
        {
            MonsterCollectionService.EnsureSocialLoaded();
        }

        public static string GetShareOwnerTag()
        {
            EnsureReady();
            return FriendCode;
        }

        public static IReadOnlyList<FriendEntry> Friends
        {
            get
            {
                EnsureReady();
                return MonsterCollectionService.SocialState.friends ?? Array.Empty<FriendEntry>();
            }
        }

        public static IReadOnlyList<PendingTradeOffer> PendingTrades
        {
            get
            {
                EnsureReady();
                return MonsterCollectionService.SocialState.pendingTrades ?? Array.Empty<PendingTradeOffer>();
            }
        }

        public static bool TryAddFriend(string friendCode, string displayName, out string error)
        {
            EnsureReady();
            error = null;
            friendCode = FriendCodeService.Normalize(friendCode);

            if (!FriendCodeService.IsValidFormat(friendCode))
            {
                error = "Invalid friend code format (use MC-XXXXXX).";
                return false;
            }

            if (friendCode == FriendCode)
            {
                error = "You cannot add yourself.";
                return false;
            }

            var friends = new List<FriendEntry>(Friends);
            if (friends.Any(f => f.friendCode == friendCode))
            {
                error = "Friend already on your list.";
                return false;
            }

            friends.Add(new FriendEntry
            {
                friendCode = friendCode,
                displayName = string.IsNullOrWhiteSpace(displayName) ? friendCode : displayName.Trim(),
                addedUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
            });

            MonsterCollectionService.SocialState.friends = friends.ToArray();
            MonsterCollectionService.SaveSocial();
            ProfileChanged?.Invoke();
            return true;
        }

        public static bool TryRemoveFriend(string friendCode)
        {
            EnsureReady();
            friendCode = FriendCodeService.Normalize(friendCode);
            var friends = new List<FriendEntry>(Friends);
            int removed = friends.RemoveAll(f => f.friendCode == friendCode);

            if (removed <= 0)
            {
                return false;
            }

            MonsterCollectionService.SocialState.friends = friends.ToArray();
            MonsterCollectionService.SaveSocial();
            ProfileChanged?.Invoke();
            return true;
        }

        public static PendingTradeOffer AddPendingTrade(PendingTradeOffer offer)
        {
            EnsureReady();
            var list = new List<PendingTradeOffer>(PendingTrades);

            if (string.IsNullOrEmpty(offer.offerId))
            {
                offer.offerId = Guid.NewGuid().ToString("N").Substring(0, 12);
            }

            offer.createdUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            list.Add(offer);
            MonsterCollectionService.SocialState.pendingTrades = list.ToArray();
            MonsterCollectionService.SaveSocial();
            ProfileChanged?.Invoke();
            return offer;
        }

        public static bool TryRemovePendingTrade(string offerId)
        {
            EnsureReady();
            var list = new List<PendingTradeOffer>(PendingTrades);
            int removed = list.RemoveAll(o => o.offerId == offerId);

            if (removed <= 0)
            {
                return false;
            }

            MonsterCollectionService.SocialState.pendingTrades = list.ToArray();
            MonsterCollectionService.SaveSocial();
            ProfileChanged?.Invoke();
            return true;
        }

        public static void RecordCasualResult(bool won)
        {
            EnsureReady();
            if (won)
            {
                MonsterCollectionService.SocialState.casualWins++;
            }
            else
            {
                MonsterCollectionService.SocialState.casualLosses++;
            }

            MonsterCollectionService.SaveSocial();
            ProfileChanged?.Invoke();
        }

        public static void RecordRankedResult(bool won)
        {
            EnsureReady();
            if (won)
            {
                MonsterCollectionService.SocialState.rankedWins++;
            }
            else
            {
                MonsterCollectionService.SocialState.rankedLosses++;
            }

            MonsterCollectionService.SaveSocial();
            ProfileChanged?.Invoke();
        }

        internal static void EnsureFriendCodeAssigned()
        {
            EnsureReady();
            if (!string.IsNullOrEmpty(MonsterCollectionService.SocialState.friendCode))
            {
                return;
            }

            MonsterCollectionService.SocialState.friendCode = FriendCodeService.Generate();
            MonsterCollectionService.SaveSocial();
        }
    }
}
