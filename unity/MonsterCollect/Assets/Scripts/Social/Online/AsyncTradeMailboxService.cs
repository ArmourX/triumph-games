using System;
using System.Collections.Generic;
using System.Linq;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using UnityEngine;

namespace MonsterCollect.Social.Online
{
    public static class AsyncTradeMailboxService
    {
        public static bool IsOnline => SocialOnlineConfig.IsOnlineEnabled;

        public static IReadOnlyList<PendingTradeOffer> GetMailboxOffers()
        {
            return SocialProfileService.PendingTrades.Where(o => o.isOnlineMailbox).ToList();
        }

        public static PendingTradeOffer QueueOutgoing(string monsterPayload, string targetFriendCode, string requestedPayload = null)
        {
            var offer = TradeService.CreateOutgoingOffer(monsterPayload, requestedPayload);
            offer.isOnlineMailbox = true;
            offer.fromFriendCode = SocialProfileService.FriendCode;
            offer.fromDisplayName = SocialProfileService.DisplayName;

            if (IsOnline)
            {
                Debug.Log($"[AsyncTradeMailbox] Queued online trade to {targetFriendCode} (stub — configure SocialOnlineConfig.ApiBaseUrl).");
            }

            return offer;
        }

        public static void SimulateIncomingFromFriend(string fromFriendCode, string fromName, string payload)
        {
            TradeService.CreateIncomingOffer(fromFriendCode, fromName, payload, string.Empty, isOnlineMailbox: true);
        }

        public static void SyncIfOnline()
        {
            if (!IsOnline)
            {
                return;
            }

            MonsterCollectionService.SocialState.lastOnlineSyncUtc = DateTimeOffset.UtcNow.ToString("o");
            MonsterCollectionService.SaveSocial();
        }
    }
}
