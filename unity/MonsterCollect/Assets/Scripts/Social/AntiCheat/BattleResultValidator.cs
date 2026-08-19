using System;
using System.Security.Cryptography;
using System.Text;
using MonsterCollect.Battle;
using MonsterCollect.Monster;

namespace MonsterCollect.Social
{
    /// <summary>Checksum helper for reporting PvP battle outcomes.</summary>
    public static class BattleResultValidator
    {
        public static string ComputeChecksum(
            string hostFriendCode,
            string clientFriendCode,
            string hostMonsterHash,
            string clientMonsterHash,
            BattleOutcome outcome,
            int battleSeed)
        {
            string payload = $"{hostFriendCode}|{clientFriendCode}|{hostMonsterHash}|{clientMonsterHash}|{outcome}|{battleSeed}";
            using SHA256 sha = SHA256.Create();
            byte[] hash = sha.ComputeHash(Encoding.UTF8.GetBytes(payload));
            return BitConverter.ToString(hash).Replace("-", string.Empty).Substring(0, 24).ToLowerInvariant();
        }

        public static bool ValidateOutcome(
            MonsterData playerMonster,
            MonsterData opponentMonster,
            BattleOutcome outcome,
            int expectedSeed,
            string expectedChecksum,
            string localFriendCode,
            string remoteFriendCode,
            bool localWasHost)
        {
            if (playerMonster == null || opponentMonster == null || string.IsNullOrEmpty(expectedChecksum))
            {
                return false;
            }

            string hostCode = localWasHost ? localFriendCode : remoteFriendCode;
            string clientCode = localWasHost ? remoteFriendCode : localFriendCode;
            string hostHash = localWasHost ? playerMonster.FullHash : opponentMonster.FullHash;
            string clientHash = localWasHost ? opponentMonster.FullHash : playerMonster.FullHash;

            string computed = ComputeChecksum(hostCode, clientCode, hostHash, clientHash, outcome, expectedSeed);
            return string.Equals(computed, expectedChecksum, StringComparison.OrdinalIgnoreCase);
        }
    }
}
