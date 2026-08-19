using System;
using MonsterCollect.Battle;
using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Sharing;
using UnityEngine;

namespace MonsterCollect.Social.Online
{
    public readonly struct MatchmakingTicket
    {
        public string TicketId { get; }
        public bool IsRanked { get; }
        public string PlayerMonsterId { get; }

        public MatchmakingTicket(string ticketId, bool isRanked, string playerMonsterId)
        {
            TicketId = ticketId;
            IsRanked = isRanked;
            PlayerMonsterId = playerMonsterId;
        }
    }

    public readonly struct MatchmakingResult
    {
        public bool Success { get; }
        public MonsterData OpponentSnapshot { get; }
        public string OpponentName { get; }
        public string OpponentFriendCode { get; }
        public int BattleSeed { get; }
        public string Message { get; }

        public MatchmakingResult(
            bool success,
            MonsterData opponentSnapshot,
            string opponentName,
            string opponentFriendCode,
            int battleSeed,
            string message = null)
        {
            Success = success;
            OpponentSnapshot = opponentSnapshot;
            OpponentName = opponentName;
            OpponentFriendCode = opponentFriendCode;
            BattleSeed = battleSeed;
            Message = message;
        }
    }

    /// <summary>Offline-first matchmaking — local wild snapshot when cloud unavailable.</summary>
    public static class MatchmakingService
    {
        private static MatchmakingTicket activeTicket;

        public static bool IsSearching => activeTicket.TicketId != null;

        public static MatchmakingTicket BeginSearch(string playerMonsterId, bool ranked)
        {
            activeTicket = new MatchmakingTicket(Guid.NewGuid().ToString("N").Substring(0, 8), ranked, playerMonsterId);
            return activeTicket;
        }

        public static void CancelSearch()
        {
            activeTicket = default;
        }

        public static MatchmakingResult TryResolve(MatchmakingTicket ticket)
        {
            if (ticket.TicketId == null || ticket.PlayerMonsterId == null)
            {
                return new MatchmakingResult(false, null, null, null, 0, "Invalid ticket.");
            }

            MonsterData player = MonsterCollectionService.FindById(ticket.PlayerMonsterId);
            if (player == null)
            {
                return new MatchmakingResult(false, null, null, null, 0, "Monster not found.");
            }

            if (SocialOnlineConfig.IsOnlineEnabled)
            {
                Debug.Log("[Matchmaking] Online queue stub — using local sparring partner.");
            }

            MonsterData opponent = WildMonsterFactory.CreateWild();
            opponent.Name = ticket.IsRanked ? "Ranked Sparring Partner" : "Casual Sparring Partner";

            int seed = UnityEngine.Random.Range(1, int.MaxValue);
            activeTicket = default;

            return new MatchmakingResult(
                true,
                opponent,
                opponent.Name,
                "AI-LOCAL",
                seed,
                ticket.IsRanked ? "Ranked sparring match ready." : "Casual sparring match ready.");
        }

        public static void LaunchMatch(MatchmakingResult result, string playerMonsterId, bool ranked)
        {
            if (!result.Success || result.OpponentSnapshot == null)
            {
                return;
            }

            BattleSession.ConfigureRemotePvP(
                playerMonsterId,
                result.OpponentSnapshot,
                result.OpponentName,
                result.OpponentFriendCode,
                result.BattleSeed,
                ranked,
                inviteId: ranked ? "ranked-local" : "casual-local");

            UnityEngine.SceneManagement.SceneManager.LoadScene(GameScenes.Battle);
        }
    }
}
