using System;
using System.Text;

namespace MonsterCollect.Social
{
    public static class FriendCodeService
    {
        private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        public static string Generate()
        {
            var random = new Random(Environment.TickCount ^ Guid.NewGuid().GetHashCode());
            var builder = new StringBuilder("MC-");

            for (int i = 0; i < 6; i++)
            {
                builder.Append(Alphabet[random.Next(Alphabet.Length)]);
            }

            return builder.ToString();
        }

        public static bool IsValidFormat(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                return false;
            }

            code = code.Trim().ToUpperInvariant();
            if (code.Length != 9 || !code.StartsWith("MC-", StringComparison.Ordinal))
            {
                return false;
            }

            for (int i = 3; i < code.Length; i++)
            {
                if (Alphabet.IndexOf(code[i]) < 0)
                {
                    return false;
                }
            }

            return true;
        }

        public static string Normalize(string code)
        {
            return string.IsNullOrWhiteSpace(code) ? string.Empty : code.Trim().ToUpperInvariant();
        }
    }
}
