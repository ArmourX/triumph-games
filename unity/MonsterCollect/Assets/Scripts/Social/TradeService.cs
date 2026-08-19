using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Sharing;

namespace MonsterCollect.Social
{
    public static class TradeService
    {
        public static bool TryImportSharePayload(string payload, out MonsterData monster, out string error)
        {
            monster = null;
            error = null;

            if (string.IsNullOrEmpty(payload))
            {
                error = "Empty trade payload.";
                return false;
            }

            if (!MonsterShareCodec.TryDecode(payload, out monster, out _))
            {
                error = "Trade monster failed validation.";
                return false;
            }

            if (MonsterCollectionService.IsFull)
            {
                error = "Ranch is full.";
                return false;
            }

            if (!MonsterCollectionService.TryAddMonster(monster, out error))
            {
                return false;
            }

            return true;
        }

        public static PendingTradeOffer CreateOutgoingOffer(string monsterSharePayload, string requestedSharePayload = null)
        {
            return SocialProfileService.AddPendingTrade(new PendingTradeOffer
            {
                fromFriendCode = SocialProfileService.FriendCode,
                fromDisplayName = SocialProfileService.DisplayName,
                monsterSharePayload = monsterSharePayload,
                requestedSharePayload = requestedSharePayload ?? string.Empty,
                isIncoming = false,
                isOnlineMailbox = false
            });
        }

        public static PendingTradeOffer CreateIncomingOffer(
            string fromFriendCode,
            string fromDisplayName,
            string monsterSharePayload,
            string requestedSharePayload,
            bool isOnlineMailbox = false)
        {
            return SocialProfileService.AddPendingTrade(new PendingTradeOffer
            {
                fromFriendCode = fromFriendCode,
                fromDisplayName = fromDisplayName,
                monsterSharePayload = monsterSharePayload,
                requestedSharePayload = requestedSharePayload ?? string.Empty,
                isIncoming = true,
                isOnlineMailbox = isOnlineMailbox
            });
        }

        public static bool TryAcceptTrade(PendingTradeOffer offer, string counterOfferPayload, out string error)
        {
            error = null;

            if (offer == null)
            {
                error = "Missing trade offer.";
                return false;
            }

            if (!TryImportSharePayload(offer.monsterSharePayload, out _, out error))
            {
                return false;
            }

            if (!string.IsNullOrEmpty(offer.requestedSharePayload) &&
                !string.IsNullOrEmpty(counterOfferPayload))
            {
                if (!TryImportSharePayload(counterOfferPayload, out _, out error))
                {
                    return false;
                }
            }

            offer.accepted = true;
            SocialProfileService.TryRemovePendingTrade(offer.offerId);
            return true;
        }
    }
}
