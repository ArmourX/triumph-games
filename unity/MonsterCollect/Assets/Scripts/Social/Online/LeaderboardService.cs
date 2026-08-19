using System;
using System.Collections.Generic;
using System.Linq;
using MonsterCollect.Circuit;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using UnityEngine;

namespace MonsterCollect.Social.Online
{
    public static class LeaderboardCategories
    {
        public const string StrongestMonster = "strongest_monster";
        public const string UniqueScans = "unique_scans";
        public const string TrainerRank = "trainer_rank";
        public const string CircuitPoints = "circuit_points";
    }

    public readonly struct LeaderboardRow
    {
        public string DisplayName { get; }
        public string FriendCode { get; }
        public int Score { get; }
        public bool IsLocalPlayer { get; }

        public LeaderboardRow(string displayName, string friendCode, int score, bool isLocalPlayer)
        {
            DisplayName = displayName;
            FriendCode = friendCode;
            Score = score;
            IsLocalPlayer = isLocalPlayer;
        }
    }

    public static class LeaderboardService
    {
        public static IReadOnlyList<LeaderboardRow> GetLeaderboard(string category, int maxRows = 10)
        {
            var rows = new List<LeaderboardRow>();
            rows.Add(BuildLocalRow(category));

            foreach (LeaderboardCacheEntry entry in MonsterCollectionService.SocialState.leaderboardCache ?? Array.Empty<LeaderboardCacheEntry>())
            {
                if (entry.category != category)
                {
                    continue;
                }

                if (!string.IsNullOrEmpty(entry.entryId) && entry.entryId.StartsWith("local-"))
                {
                    continue;
                }

                rows.Add(new LeaderboardRow(entry.displayName, entry.friendCode, entry.score, false));
            }

            return rows
                .OrderByDescending(r => r.Score)
                .ThenBy(r => r.DisplayName)
                .Take(maxRows)
                .ToList();
        }

        public static void RefreshLocalCache()
        {
            MonsterCollectionService.EnsureSocialLoaded();
            var cache = new List<LeaderboardCacheEntry>(
                MonsterCollectionService.SocialState.leaderboardCache ?? Array.Empty<LeaderboardCacheEntry>());

            UpsertLocal(cache, LeaderboardCategories.StrongestMonster, ComputeStrongestMonsterScore());
            UpsertLocal(cache, LeaderboardCategories.UniqueScans, MonsterCollectionService.UnlockedDexCount);
            UpsertLocal(cache, LeaderboardCategories.TrainerRank, TrainerProgressionService.TrainerXp);
            UpsertLocal(cache, LeaderboardCategories.CircuitPoints, TournamentService.State.careerPoints);

            MonsterCollectionService.SocialState.leaderboardCache = cache.ToArray();
            MonsterCollectionService.SaveSocial();
        }

        public static void SeedDemoEntriesIfEmpty()
        {
            MonsterCollectionService.EnsureSocialLoaded();
            var cache = new List<LeaderboardCacheEntry>(
                MonsterCollectionService.SocialState.leaderboardCache ?? Array.Empty<LeaderboardCacheEntry>());
            bool missingCircuit = true;
            for (int i = 0; i < cache.Count; i++)
            {
                if (cache[i] != null && cache[i].category == LeaderboardCategories.CircuitPoints &&
                    cache[i].entryId != null && !cache[i].entryId.StartsWith("local-"))
                {
                    missingCircuit = false;
                    break;
                }
            }

            if (cache.Count == 0)
            {
                cache.AddRange(new[]
                {
                    new LeaderboardCacheEntry
                    {
                        entryId = "demo1", displayName = "Ranch Master", friendCode = "MC-DEMO01",
                        score = 680, category = LeaderboardCategories.StrongestMonster,
                        updatedUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
                    },
                    new LeaderboardCacheEntry
                    {
                        entryId = "demo2", displayName = "Scan Hunter", friendCode = "MC-DEMO02",
                        score = 42, category = LeaderboardCategories.UniqueScans,
                        updatedUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
                    },
                    new LeaderboardCacheEntry
                    {
                        entryId = "demo3", displayName = "Elite Trainer", friendCode = "MC-DEMO03",
                        score = 1200, category = LeaderboardCategories.TrainerRank,
                        updatedUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
                    }
                });
            }

            if (missingCircuit)
            {
                cache.Add(new LeaderboardCacheEntry
                {
                    entryId = "demo4", displayName = "Circuit Ace", friendCode = "MC-DEMO04",
                    score = 240, category = LeaderboardCategories.CircuitPoints,
                    updatedUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
                });
            }

            MonsterCollectionService.SocialState.leaderboardCache = cache.ToArray();
            MonsterCollectionService.SaveSocial();
        }

        public static void SyncIfOnline()
        {
            if (!SocialOnlineConfig.IsOnlineEnabled)
            {
                return;
            }

            RefreshLocalCache();
            Debug.Log("[Leaderboard] Online sync stub — upload local scores when API is configured.");
        }

        private static void UpsertLocal(List<LeaderboardCacheEntry> cache, string category, int score)
        {
            LeaderboardCacheEntry entry = BuildCacheEntry(category, score);
            for (int i = 0; i < cache.Count; i++)
            {
                if (cache[i] != null && cache[i].entryId == entry.entryId)
                {
                    cache[i] = entry;
                    return;
                }
            }

            cache.Add(entry);
        }

        private static LeaderboardRow BuildLocalRow(string category)
        {
            int score = category switch
            {
                LeaderboardCategories.StrongestMonster => ComputeStrongestMonsterScore(),
                LeaderboardCategories.UniqueScans => MonsterCollectionService.UnlockedDexCount,
                LeaderboardCategories.TrainerRank => TrainerProgressionService.TrainerXp,
                LeaderboardCategories.CircuitPoints => TournamentService.State.careerPoints,
                _ => 0
            };

            return new LeaderboardRow(
                SocialProfileService.DisplayName,
                SocialProfileService.FriendCode,
                score,
                true);
        }

        private static LeaderboardCacheEntry BuildCacheEntry(string category, int score)
        {
            return new LeaderboardCacheEntry
            {
                entryId = "local-" + category,
                displayName = SocialProfileService.DisplayName,
                friendCode = SocialProfileService.FriendCode,
                score = score,
                category = category,
                updatedUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
            };
        }

        private static int ComputeStrongestMonsterScore()
        {
            int best = 0;

            foreach (MonsterData monster in MonsterCollectionService.Monsters)
            {
                if (monster == null)
                {
                    continue;
                }

                int total = monster.Hp + monster.Attack + monster.Defense + monster.Speed;
                if (total > best)
                {
                    best = total;
                }
            }

            return best;
        }
    }
}
