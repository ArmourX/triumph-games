using System;
using MonsterCollect.Data;
using MonsterCollect.Monster;

namespace MonsterCollect.Battle
{
    /// <summary>Transient config used when entering the battle scene.</summary>
    public static class BattleSession
    {
        public static string PlayerMonsterId { get; private set; }
        public static BattleOpponentMode OpponentMode { get; private set; } = BattleOpponentMode.Wild;
        public static string OpponentMonsterId { get; private set; }

        public static MonsterData RemoteOpponentSnapshot { get; private set; }
        public static MonsterData WildOpponentSnapshot { get; private set; }
        public static string RemoteTrainerName { get; private set; }
        public static string RemoteFriendCode { get; private set; }
        public static int BattleSeed { get; private set; }
        public static bool IsRankedMatch { get; private set; }
        public static bool IsCircuitMatch { get; private set; }
        public static string InviteId { get; private set; }

        public static bool IsPlayerVsPlayer =>
            OpponentMode == BattleOpponentMode.RemoteSnapshot ||
            OpponentMode == BattleOpponentMode.LocalPvP;

        public static bool HasValidSetup
        {
            get
            {
                if (string.IsNullOrEmpty(PlayerMonsterId) ||
                    MonsterCollectionService.FindById(PlayerMonsterId) == null)
                {
                    return false;
                }

                if (OpponentMode == BattleOpponentMode.RemoteSnapshot ||
                    OpponentMode == BattleOpponentMode.LocalPvP)
                {
                    return RemoteOpponentSnapshot != null;
                }

                if (OpponentMode == BattleOpponentMode.ExplorationWild)
                {
                    return WildOpponentSnapshot != null;
                }

                return true;
            }
        }

        public static void Configure(string playerMonsterId, BattleOpponentMode mode, string opponentMonsterId = null)
        {
            ClearRemoteState();
            PlayerMonsterId = playerMonsterId;
            OpponentMode = mode;
            OpponentMonsterId = opponentMonsterId;
        }

        public static void ConfigureExplorationWild(string playerMonsterId, MonsterData wildSnapshot)
        {
            ClearRemoteState();
            PlayerMonsterId = playerMonsterId;
            OpponentMode = BattleOpponentMode.ExplorationWild;
            WildOpponentSnapshot = wildSnapshot;
        }

        public static void ConfigureRemotePvP(
            string playerMonsterId,
            MonsterData opponentSnapshot,
            string remoteTrainerName,
            string remoteFriendCode,
            int battleSeed,
            bool ranked,
            string inviteId = null)
        {
            ClearRemoteState();
            PlayerMonsterId = playerMonsterId;
            OpponentMode = BattleOpponentMode.RemoteSnapshot;
            RemoteOpponentSnapshot = opponentSnapshot;
            RemoteTrainerName = remoteTrainerName ?? "Trainer";
            RemoteFriendCode = remoteFriendCode ?? string.Empty;
            BattleSeed = battleSeed;
            IsRankedMatch = ranked;
            IsCircuitMatch = false;
            InviteId = inviteId;
        }

        public static void ConfigureCircuitMatch(
            string playerMonsterId,
            MonsterData opponentSnapshot,
            string opponentName,
            string opponentFriendCode,
            int battleSeed,
            string matchId)
        {
            ConfigureRemotePvP(
                playerMonsterId,
                opponentSnapshot,
                opponentName,
                opponentFriendCode,
                battleSeed,
                ranked: true,
                inviteId: matchId);
            IsCircuitMatch = true;
        }

        public static void Clear()
        {
            PlayerMonsterId = null;
            OpponentMonsterId = null;
            OpponentMode = BattleOpponentMode.Wild;
            ClearRemoteState();
        }

        private static void ClearRemoteState()
        {
            RemoteOpponentSnapshot = null;
            WildOpponentSnapshot = null;
            RemoteTrainerName = null;
            RemoteFriendCode = null;
            BattleSeed = 0;
            IsRankedMatch = false;
            IsCircuitMatch = false;
            InviteId = null;
        }
    }
}
