using System;

namespace MonsterCollect.Social.Local
{
    [Serializable]
    public class LanEnvelope
    {
        public string t;
        public string name;
        public string code;
        public int port;
        public string offerId;
        public string inviteId;
        public string payload;
        public string wantPayload;
        public string outcome;
        public string checksum;
        public int seed;
        public string message;
    }

    public static class LanMessageTypes
    {
        public const string Hello = "hello";
        public const string TradeOffer = "trade_offer";
        public const string TradeAccept = "trade_accept";
        public const string BattleInvite = "battle_invite";
        public const string BattleAccept = "battle_accept";
        public const string BattleResult = "battle_result";
        public const string Ack = "ack";
        public const string Error = "error";
    }

    public static class LanProtocol
    {
        public const int DiscoveryPort = 47777;
        public const int DefaultSessionPort = 47778;

        public static string Serialize(LanEnvelope envelope)
        {
            return UnityEngine.JsonUtility.ToJson(envelope);
        }

        public static bool TryDeserialize(string json, out LanEnvelope envelope)
        {
            envelope = null;

            if (string.IsNullOrWhiteSpace(json))
            {
                return false;
            }

            try
            {
                envelope = UnityEngine.JsonUtility.FromJson<LanEnvelope>(json);
                return envelope != null && !string.IsNullOrEmpty(envelope.t);
            }
            catch
            {
                return false;
            }
        }
    }
}
