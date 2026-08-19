using MonsterCollect.Battle;
using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Sharing;
using MonsterCollect.Social.Local;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace MonsterCollect.Social
{
    /// <summary>Coordinates LAN PvP invites and battle scene hand-off.</summary>
    public static class SocialBattleCoordinator
    {
        public static LanEnvelope PendingInvite { get; private set; }
        public static NearbyPeer PendingPeer { get; private set; }
        public static string PendingInviteRemoteEndpoint { get; private set; }

        public static event System.Action<LanEnvelope, NearbyPeer> IncomingBattleInvite;

        public static void HandleLanMessage(LanEnvelope envelope, string remoteEndpoint)
        {
            if (envelope == null)
            {
                return;
            }

            switch (envelope.t)
            {
                case LanMessageTypes.BattleInvite:
                    PendingInvite = envelope;
                    PendingInviteRemoteEndpoint = remoteEndpoint;
                    PendingPeer = ResolvePeer(envelope, remoteEndpoint);
                    IncomingBattleInvite?.Invoke(envelope, PendingPeer);
                    break;

                case LanMessageTypes.BattleAccept:
                    if (!MonsterShareCodec.TryDecode(envelope.payload, out MonsterData opponent, out _))
                    {
                        return;
                    }

                    string playerMonsterId = SocialHubState.SelectedBattleMonsterId;
                    if (string.IsNullOrEmpty(playerMonsterId))
                    {
                        playerMonsterId = MonsterCollectionService.ActiveMonsterId;
                    }

                    BattleSession.ConfigureRemotePvP(
                        playerMonsterId,
                        opponent,
                        envelope.name,
                        envelope.code,
                        envelope.seed,
                        ranked: false,
                        inviteId: envelope.inviteId);

                    SceneManager.LoadScene(GameScenes.Battle);
                    break;

                case LanMessageTypes.BattleResult:
                    Debug.Log($"[SocialBattle] Remote result {envelope.outcome} (checksum {envelope.checksum})");
                    break;

                case LanMessageTypes.TradeOffer:
                    TradeService.CreateIncomingOffer(
                        envelope.code,
                        envelope.name,
                        envelope.payload,
                        envelope.wantPayload);
                    break;

                case LanMessageTypes.TradeAccept:
                    Debug.Log($"[SocialBattle] Trade accepted: {envelope.offerId}");
                    break;
            }
        }

        public static void SendNearbyBattleInvite(NearbyPeer peer, MonsterData playerMonster)
        {
            if (playerMonster == null)
            {
                return;
            }

            SocialHubState.SelectedBattleMonsterId = playerMonster.Id;
            string payload = MonsterShareCodec.Encode(playerMonster);
            LocalMultiplayerService.SendBattleInvite(peer, payload);
        }

        public static bool TryAcceptPendingInvite(MonsterData playerMonster, out string error)
        {
            error = null;

            if (PendingInvite == null || playerMonster == null)
            {
                error = "No pending battle invite.";
                return false;
            }

            if (!MonsterShareCodec.TryDecode(PendingInvite.payload, out MonsterData opponent, out _))
            {
                error = "Invalid opponent share data.";
                return false;
            }

            string payload = MonsterShareCodec.Encode(playerMonster);
            LocalMultiplayerService.SendBattleAccept(PendingPeer, PendingInvite.inviteId, payload, PendingInvite.seed);

            BattleSession.ConfigureRemotePvP(
                playerMonster.Id,
                opponent,
                PendingInvite.name,
                PendingInvite.code,
                PendingInvite.seed,
                ranked: false,
                inviteId: PendingInvite.inviteId);

            PendingInvite = null;
            SceneManager.LoadScene(GameScenes.Battle);
            return true;
        }

        public static void ReportLocalBattleResult(
            BattleOutcome outcome,
            MonsterData playerMonster,
            MonsterData opponentMonster,
            bool ranked)
        {
            if (playerMonster == null || opponentMonster == null)
            {
                return;
            }

            if (!string.IsNullOrEmpty(BattleSession.InviteId))
            {
                string checksum = BattleResultValidator.ComputeChecksum(
                    SocialProfileService.FriendCode,
                    BattleSession.RemoteFriendCode,
                    playerMonster.FullHash,
                    opponentMonster.FullHash,
                    outcome,
                    BattleSession.BattleSeed);

                if (PendingPeer.Address != null)
                {
                    LocalMultiplayerService.SendBattleResult(
                        PendingPeer,
                        BattleSession.InviteId,
                        outcome == BattleOutcome.PlayerWin ? "win" : "loss",
                        checksum,
                        BattleSession.BattleSeed);
                }
            }

            if (ranked)
            {
                SocialProfileService.RecordRankedResult(outcome == BattleOutcome.PlayerWin);
            }
            else if (!string.IsNullOrEmpty(BattleSession.InviteId))
            {
                SocialProfileService.RecordCasualResult(outcome == BattleOutcome.PlayerWin);
            }
        }

        private static NearbyPeer ResolvePeer(LanEnvelope envelope, string remoteEndpoint)
        {
            foreach (NearbyPeer peer in LocalMultiplayerService.GetNearbyPeers())
            {
                if (peer.FriendCode == envelope.code)
                {
                    return peer;
                }
            }

            string address = remoteEndpoint;
            int port = LanProtocol.DefaultSessionPort;
            int colon = remoteEndpoint != null ? remoteEndpoint.LastIndexOf(':') : -1;

            if (colon > 0)
            {
                address = remoteEndpoint.Substring(0, colon);
            }

            return new NearbyPeer(envelope.name, envelope.code, address, port, 0);
        }
    }

    /// <summary>Transient UI selections for the social hub.</summary>
    public static class SocialHubState
    {
        public static string SelectedBattleMonsterId { get; set; }
        public static string SelectedTradeMonsterId { get; set; }
    }
}
