using System;
using System.Security.Cryptography;
using System.Text;

namespace MonsterCollect.Social
{
    /// <summary>HMAC integrity tag for share payloads (deter casual tampering).</summary>
    public static class MonsterShareIntegrity
    {
        private const string SignatureSuffix = ":SIG:";
        private const string GlobalShareSecret = "MonsterCollect-Share-v2-Global";

        public static string AppendSignature(string payloadWithoutSig)
        {
            if (string.IsNullOrEmpty(payloadWithoutSig))
            {
                return payloadWithoutSig;
            }

            string sig = ComputeTag(payloadWithoutSig, GlobalShareSecret);
            return payloadWithoutSig + SignatureSuffix + sig;
        }

        public static bool VerifyPayload(string payload)
        {
            if (string.IsNullOrEmpty(payload))
            {
                return false;
            }

            int idx = payload.LastIndexOf(SignatureSuffix, StringComparison.Ordinal);
            if (idx < 0)
            {
                // Legacy unsigned shares remain allowed offline-first.
                return true;
            }

            string body = payload.Substring(0, idx);
            string sig = payload.Substring(idx + SignatureSuffix.Length);
            return SlowEquals(sig, ComputeTag(body, GlobalShareSecret));
        }

        public static string StripSignature(string payload)
        {
            if (string.IsNullOrEmpty(payload))
            {
                return payload;
            }

            int idx = payload.LastIndexOf(SignatureSuffix, StringComparison.Ordinal);
            return idx >= 0 ? payload.Substring(0, idx) : payload;
        }

        private static string ComputeTag(string body, string secret)
        {
            byte[] key = Encoding.UTF8.GetBytes(secret);
            using HMACSHA256 hmac = new HMACSHA256(key);
            byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(body));
            return Convert.ToBase64String(hash).Substring(0, 16);
        }

        private static bool SlowEquals(string a, string b)
        {
            if (a == null || b == null || a.Length != b.Length)
            {
                return false;
            }

            int diff = 0;
            for (int i = 0; i < a.Length; i++)
            {
                diff |= a[i] ^ b[i];
            }

            return diff == 0;
        }
    }
}
