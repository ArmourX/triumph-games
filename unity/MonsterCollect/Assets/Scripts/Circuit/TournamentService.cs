using System;
using System.Collections.Generic;
using MonsterCollect.Battle;
using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using MonsterCollect.Ranch;
using MonsterCollect.Social;
using MonsterCollect.Social.Online;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace MonsterCollect.Circuit
{
    public readonly struct CircuitEnterResult
    {
        public CircuitEnterResult(bool success, string message)
        {
            Success = success;
            Message = message;
        }

        public bool Success { get; }
        public string Message { get; }
    }

    /// <summary>Seasonal ranked ladder and single-elim cups. Optional, offline-first.</summary>
    public static class TournamentService
    {
        public const int MaxParty = 3;
        public const int MaxLogLines = 32;
        public const int SeasonLengthDays = 14;
        public const int DefaultRating = 1000;

        public static TournamentSaveState State
        {
            get
            {
                EnsureReady();
                return MonsterCollectionService.TournamentState;
            }
        }

        public static CircuitRunState Run => State.run ?? new CircuitRunState();

        public static void EnsureReady()
        {
            MonsterCollectionService.EnsureTournamentLoaded();
            TournamentSaveState state = MonsterCollectionService.TournamentState;
            state.run ??= new CircuitRunState();
            state.unlockedTitleIds ??= Array.Empty<string>();
            state.unlockedCosmeticIds ??= Array.Empty<string>();
            state.resultLog ??= Array.Empty<string>();
            RotateSeasonIfNeeded();
        }

        public static string CurrentSeasonId()
        {
            long bucket = DateTimeOffset.UtcNow.ToUnixTimeSeconds() / (SeasonLengthDays * 86400L);
            return "season_" + bucket;
        }

        public static string EquippedTitleLabel()
        {
            EnsureReady();
            CircuitTitleEntry title = CircuitCatalogRegistry.Catalog.FindTitle(State.equippedTitleId);
            if (title != null)
            {
                return title.displayName;
            }

            return "Unranked";
        }

        public static string CurrentDivisionName()
        {
            CircuitEventEntry division = CurrentLadderDivision();
            return division != null ? division.displayName : "Open Circuit";
        }

        public static CircuitEventEntry CurrentLadderDivision()
        {
            EnsureReady();
            CircuitEventEntry[] events = CircuitCatalogRegistry.Catalog.Events;
            CircuitEventEntry best = null;
            if (events == null)
            {
                return null;
            }

            int rating = State.seasonRating;
            for (int i = 0; i < events.Length; i++)
            {
                CircuitEventEntry ev = events[i];
                if (ev == null || ev.kind != CircuitEventKind.Ladder)
                {
                    continue;
                }

                if (rating >= ev.minRating && rating <= ev.maxRating)
                {
                    return ev;
                }

                if (rating >= ev.minRating && (best == null || ev.minRating > best.minRating))
                {
                    best = ev;
                }
            }

            return best;
        }

        public static IReadOnlyList<CircuitEventEntry> GetLadderEvents()
        {
            return FilterKind(CircuitEventKind.Ladder);
        }

        public static IReadOnlyList<CircuitEventEntry> GetCupEvents()
        {
            return FilterKind(CircuitEventKind.Cup);
        }

        public static IReadOnlyList<string> GetLog()
        {
            EnsureReady();
            return State.resultLog ?? Array.Empty<string>();
        }

        public static CircuitEnterResult TryEnter(IReadOnlyList<string> monsterIds, string eventId)
        {
            EnsureReady();
            CircuitRunState run = Run;
            if (run.isActive)
            {
                return new CircuitEnterResult(false, "Finish or forfeit the current run first.");
            }

            CircuitEventEntry ev = CircuitCatalogRegistry.Catalog.FindEvent(eventId);
            if (ev == null)
            {
                return new CircuitEnterResult(false, "Unknown circuit event.");
            }

            if (!MeetsEntry(ev, out string reason))
            {
                return new CircuitEnterResult(false, reason);
            }

            List<MonsterData> party = CollectParty(monsterIds);
            if (party.Count == 0)
            {
                return new CircuitEnterResult(false, "Register 1–3 ranch monsters.");
            }

            int lowest = LowestLevel(party);
            if (lowest < ev.minMonsterLevel)
            {
                return new CircuitEnterResult(false, $"Needs a party at Lv {ev.minMonsterLevel}+.");
            }

            if (ev.entryFeeCoins > 0 && !TrainerProgressionService.TrySpendCoins(ev.entryFeeCoins))
            {
                return new CircuitEnterResult(false, $"Need {ev.entryFeeCoins} coins to enter.");
            }

            var ids = new string[party.Count];
            for (int i = 0; i < party.Count; i++)
            {
                ids[i] = party[i].Id;
            }

            run.isActive = true;
            run.mode = ev.kind == CircuitEventKind.Cup ? "cup" : "ladder";
            run.eventId = ev.eventId;
            run.seasonId = State.seasonId;
            run.partyIds = ids;
            run.roundIndex = 0;
            run.wins = 0;
            run.lastMatchWon = false;
            run.lastResultSummary = string.Empty;
            run.cupSlotNames = Array.Empty<string>();
            run.cupSlotCodes = Array.Empty<string>();
            run.cupSlotEliminated = Array.Empty<int>();
            run.cupPlayerSlot = 0;

            if (ev.kind == CircuitEventKind.Cup)
            {
                BuildCupBracket(run, ev, party[0]);
                QueuePlayerCupMatch(run, ev, party[0]);
                AppendLog($"Entered {ev.displayName}. Bracket of 8 is set.");
                AppendSpectatorRoundPreview(run);
            }
            else
            {
                QueueLadderMatch(run, ev, party[0]);
                AppendLog($"Queued {ev.displayName} vs {run.pendingOpponentName}.");
            }

            UnlockTitle("title_rookie");
            MonsterCollectionService.SaveTournament();
            return new CircuitEnterResult(true, run.hasPendingMatch
                ? $"Ready: {run.pendingOpponentName}."
                : $"Entered {ev.displayName}.");
        }

        public static bool TryLaunchPendingMatch(out string message)
        {
            EnsureReady();
            CircuitRunState run = Run;
            if (!run.isActive || !run.hasPendingMatch)
            {
                message = "No circuit match waiting.";
                return false;
            }

            MonsterData lead = LeadMonster();
            if (lead == null)
            {
                message = "Registered fighter is missing.";
                return false;
            }

            int playerPower = CircuitOpponentFactory.StatPower(lead);
            MonsterData opponent = CircuitOpponentFactory.Create(
                run.pendingOpponentSeed,
                run.pendingOpponentLevel,
                playerPower);
            opponent.Name = run.pendingOpponentName;

            BattleSession.ConfigureCircuitMatch(
                lead.Id,
                opponent,
                run.pendingOpponentName,
                run.pendingOpponentCode,
                run.pendingOpponentSeed,
                run.pendingMatchId);
            SceneManager.LoadScene(GameScenes.Battle);
            message = $"Circuit match vs {run.pendingOpponentName}.";
            return true;
        }

        public static void NotifyBattleFinished(BattleOutcome outcome)
        {
            if (!BattleSession.IsCircuitMatch)
            {
                return;
            }

            EnsureReady();
            CircuitRunState run = Run;
            if (!run.isActive || !run.hasPendingMatch)
            {
                return;
            }

            bool won = outcome == BattleOutcome.PlayerWin;
            ApplyMatchResult(won);
        }

        public static CircuitEnterResult Forfeit()
        {
            EnsureReady();
            CircuitRunState run = Run;
            if (!run.isActive)
            {
                return new CircuitEnterResult(false, "No active run.");
            }

            CircuitEventEntry ev = CircuitCatalogRegistry.Catalog.FindEvent(run.eventId);
            int penalty = Math.Max(8, (ev?.winPoints ?? 12) / 2);
            State.seasonRating = Math.Max(600, State.seasonRating - penalty);
            State.seasonLosses++;
            AppendLog($"Forfeited {ev?.displayName ?? "circuit"}. Rating {State.seasonRating}.");
            ClearRun();
            RefreshTitles();
            MonsterCollectionService.SaveTournament();
            LeaderboardService.RefreshLocalCache();
            return new CircuitEnterResult(true, "Run forfeited.");
        }

        public static bool TryEquipTitle(string titleId, out string message)
        {
            EnsureReady();
            if (!HasTitle(titleId))
            {
                message = "Title not unlocked.";
                return false;
            }

            State.equippedTitleId = titleId;
            MonsterCollectionService.SaveTournament();
            message = "Title equipped.";
            return true;
        }

        public static bool HasCosmetic(string cosmeticId)
        {
            EnsureReady();
            return Contains(State.unlockedCosmeticIds, cosmeticId);
        }

        public static string GetResultLeagueLabel()
        {
            EnsureReady();
            if (Run.isActive)
            {
                CircuitEventEntry ev = CircuitCatalogRegistry.Catalog.FindEvent(Run.eventId);
                if (ev != null)
                {
                    return ev.displayName.ToUpperInvariant();
                }
            }

            return EquippedTitleLabel().ToUpperInvariant();
        }

        private static void ApplyMatchResult(bool won)
        {
            CircuitRunState run = Run;
            CircuitEventEntry ev = CircuitCatalogRegistry.Catalog.FindEvent(run.eventId);
            string opponentName = run.pendingOpponentName;
            int oppRating = run.pendingOpponentRating;
            run.hasPendingMatch = false;

            int ratingDelta = ComputeEloDelta(State.seasonRating, oppRating, won);
            State.seasonRating = Math.Max(600, State.seasonRating + ratingDelta);
            if (won)
            {
                State.seasonWins++;
                run.wins++;
                run.lastMatchWon = true;
                int points = ev != null ? ev.winPoints : 12;
                int coins = ev != null ? ev.winCoins : 8;
                State.careerPoints += points;
                TrainerProgressionService.AddCoins(coins);
                TrainerProgressionService.AddTrainerXp(6 + run.roundIndex * 2);
                ProgressionEventReporter.ReportCircuitWin();
                AppendLog($"Won vs {opponentName} ({FormatRound(run)}). {Signed(ratingDelta)} rating, +{points} RP.");
            }
            else
            {
                State.seasonLosses++;
                run.lastMatchWon = false;
                int coins = ev != null ? ev.lossCoins : 1;
                TrainerProgressionService.AddCoins(coins);
                AppendLog($"Lost vs {opponentName} ({FormatRound(run)}). {Signed(ratingDelta)} rating.");
            }

            run.lastResultSummary = won
                ? $"Beat {opponentName}. Rating {State.seasonRating}."
                : $"Fell to {opponentName}. Rating {State.seasonRating}.";

            if (run.mode == "cup")
            {
                AdvanceCup(run, ev, won);
            }
            else
            {
                ClearRun();
            }

            RefreshTitles();
            MonsterCollectionService.SaveTournament();
            LeaderboardService.RefreshLocalCache();
        }

        private static void AdvanceCup(CircuitRunState run, CircuitEventEntry ev, bool won)
        {
            EliminatePendingOpponent(run, won);
            ResolveOtherCupMatches(run);
            CompactCupBracket(run);

            if (!won)
            {
                AppendLog($"Eliminated from {ev?.displayName ?? "the cup"}.");
                ClearRun();
                return;
            }

            run.roundIndex++;
            MonsterData lead = LeadMonster();
            if (CountAlive(run) <= 1)
            {
                GrantCupVictory(ev);
                ClearRun();
                return;
            }

            QueuePlayerCupMatch(run, ev, lead);
            AppendSpectatorRoundPreview(run);
            MonsterCollectionService.SaveTournament();
        }

        private static void GrantCupVictory(CircuitEventEntry ev)
        {
            State.cupWins++;
            int bonus = ev != null ? ev.winPoints : 40;
            State.careerPoints += bonus;
            if (ev != null)
            {
                TrainerProgressionService.AddCoins(ev.winCoins);
                if (!string.IsNullOrEmpty(ev.titleRewardId))
                {
                    UnlockTitle(ev.titleRewardId);
                    State.equippedTitleId = ev.titleRewardId;
                }

                if (!string.IsNullOrEmpty(ev.cosmeticRewardId))
                {
                    UnlockCosmetic(ev.cosmeticRewardId);
                }

                if (!string.IsNullOrEmpty(ev.itemRewardId))
                {
                    PlayerInventoryService.AddItem(ev.itemRewardId, 1);
                }

                AppendLog($"Champion of {ev.displayName}! +{bonus} RP and unique rewards.");
                Run.lastResultSummary = $"Won {ev.displayName}!";
            }
        }

        private static void QueueLadderMatch(CircuitRunState run, CircuitEventEntry ev, MonsterData lead)
        {
            int seed = MatchSeed(run.seasonId, ev.eventId, State.seasonWins + State.seasonLosses, SocialProfileService.FriendCode);
            CircuitTrainerEntry cpu = PickTrainer(seed, State.seasonRating);
            int level = Math.Max(ev.minMonsterLevel, (lead.Raising?.level ?? 1) + ((seed >> 3) % 3) - 1);
            run.hasPendingMatch = true;
            run.pendingMatchId = $"circuit-{seed:X}";
            run.pendingOpponentName = cpu.displayName;
            run.pendingOpponentCode = cpu.friendCode;
            run.pendingOpponentSeed = seed;
            run.pendingOpponentLevel = Math.Max(1, level);
            run.pendingOpponentRating = cpu.baseRating + ((seed >> 5) % 41) - 20;
        }

        private static void BuildCupBracket(CircuitRunState run, CircuitEventEntry ev, MonsterData lead)
        {
            int seed = MatchSeed(State.seasonId, ev.eventId, State.cupWins, SocialProfileService.FriendCode);
            var rng = new System.Random(seed);
            const int size = 8;
            run.cupSlotNames = new string[size];
            run.cupSlotCodes = new string[size];
            run.cupSlotEliminated = new int[size];
            run.cupPlayerSlot = 0;
            run.cupSlotNames[0] = SocialProfileService.DisplayName;
            run.cupSlotCodes[0] = SocialProfileService.FriendCode;

            var used = new HashSet<string> { "player" };
            for (int i = 1; i < size; i++)
            {
                CircuitTrainerEntry cpu = PickTrainer(seed + i * 17, ev.minRating + i * 20, used);
                used.Add(cpu.trainerId);
                run.cupSlotNames[i] = cpu.displayName;
                run.cupSlotCodes[i] = cpu.friendCode;
            }

            ShuffleTail(run.cupSlotNames, run.cupSlotCodes, rng);
        }

        private static void QueuePlayerCupMatch(CircuitRunState run, CircuitEventEntry ev, MonsterData lead)
        {
            int player = FindPlayerSlot(run);
            int foe = player ^ 1;
            if (foe < 0 || foe >= run.cupSlotNames.Length || run.cupSlotEliminated[foe] != 0)
            {
                run.hasPendingMatch = false;
                return;
            }

            int seed = MatchSeed(run.seasonId, ev.eventId, run.roundIndex, run.cupSlotCodes[foe]);
            int level = Math.Max(ev.minMonsterLevel, (lead?.Raising?.level ?? 1) + run.roundIndex);
            run.hasPendingMatch = true;
            run.pendingMatchId = $"cup-{seed:X}";
            run.pendingOpponentName = run.cupSlotNames[foe];
            run.pendingOpponentCode = run.cupSlotCodes[foe];
            run.pendingOpponentSeed = seed;
            run.pendingOpponentLevel = level;
            run.pendingOpponentRating = ev.minRating + 80 + run.roundIndex * 60;
        }

        private static void EliminatePendingOpponent(CircuitRunState run, bool playerWon)
        {
            int player = FindPlayerSlot(run);
            int foe = player ^ 1;
            if (run.cupSlotEliminated == null || foe < 0 || foe >= run.cupSlotEliminated.Length)
            {
                return;
            }

            if (playerWon)
            {
                run.cupSlotEliminated[foe] = 1;
            }
            else
            {
                run.cupSlotEliminated[player] = 1;
            }
        }

        private static void ResolveOtherCupMatches(CircuitRunState run)
        {
            if (run.cupSlotNames == null)
            {
                return;
            }

            int seed = MatchSeed(run.seasonId, run.eventId, run.roundIndex, "cpu-round");
            var rng = new System.Random(seed);
            for (int i = 0; i < run.cupSlotNames.Length; i += 2)
            {
                int a = i;
                int b = i + 1;
                if (b >= run.cupSlotNames.Length)
                {
                    break;
                }

                if (run.cupSlotEliminated[a] != 0 || run.cupSlotEliminated[b] != 0)
                {
                    continue;
                }

                if (a == FindPlayerSlot(run) || b == FindPlayerSlot(run))
                {
                    continue;
                }

                bool aWins = rng.Next(0, 100) >= 45;
                int loser = aWins ? b : a;
                int winner = aWins ? a : b;
                run.cupSlotEliminated[loser] = 1;
                AppendLog($"Spectate: {run.cupSlotNames[winner]} defeated {run.cupSlotNames[loser]}.");
            }
        }

        private static void CompactCupBracket(CircuitRunState run)
        {
            var names = new List<string>();
            var codes = new List<string>();
            int playerSlot = -1;
            for (int i = 0; i < run.cupSlotNames.Length; i++)
            {
                if (run.cupSlotEliminated[i] != 0)
                {
                    continue;
                }

                if (i == FindPlayerSlot(run))
                {
                    playerSlot = names.Count;
                }

                names.Add(run.cupSlotNames[i]);
                codes.Add(run.cupSlotCodes[i]);
            }

            run.cupSlotNames = names.ToArray();
            run.cupSlotCodes = codes.ToArray();
            run.cupSlotEliminated = new int[names.Count];
            run.cupPlayerSlot = Math.Max(0, playerSlot);
        }

        private static void AppendSpectatorRoundPreview(CircuitRunState run)
        {
            int alive = CountAlive(run);
            string round = alive >= 8 ? "Quarterfinals" : alive >= 4 ? "Semifinals" : "Final";
            AppendLog($"{round} set. Your next fight: {run.pendingOpponentName}.");
        }

        private static void ShuffleTail(string[] names, string[] codes, System.Random rng)
        {
            for (int i = names.Length - 1; i > 1; i--)
            {
                int j = rng.Next(1, i + 1);
                string name = names[i];
                names[i] = names[j];
                names[j] = name;
                string code = codes[i];
                codes[i] = codes[j];
                codes[j] = code;
            }
        }

        private static int FindPlayerSlot(CircuitRunState run)
        {
            if (run.cupSlotCodes == null)
            {
                return 0;
            }

            string code = SocialProfileService.FriendCode;
            for (int i = 0; i < run.cupSlotCodes.Length; i++)
            {
                if (run.cupSlotCodes[i] == code)
                {
                    return i;
                }
            }

            return Mathf.Clamp(run.cupPlayerSlot, 0, Math.Max(0, run.cupSlotCodes.Length - 1));
        }

        private static int CountAlive(CircuitRunState run)
        {
            int n = 0;
            if (run.cupSlotEliminated == null)
            {
                return 0;
            }

            for (int i = 0; i < run.cupSlotEliminated.Length; i++)
            {
                if (run.cupSlotEliminated[i] == 0)
                {
                    n++;
                }
            }

            return n;
        }

        private static bool MeetsEntry(CircuitEventEntry ev, out string reason)
        {
            reason = string.Empty;
            if (TrainerProgressionService.RankIndex < ev.requiredTrainerRankIndex &&
                State.seasonRating < ev.minRating)
            {
                reason = $"Need trainer rank {ev.requiredTrainerRankIndex + 1} or {ev.minRating} rating.";
                return false;
            }

            if (ev.kind == CircuitEventKind.Ladder)
            {
                CircuitEventEntry current = CurrentLadderDivision();
                if (current != null && current.eventId != ev.eventId)
                {
                    reason = $"You are currently in {current.displayName}.";
                    return false;
                }
            }

            return true;
        }

        private static List<MonsterData> CollectParty(IReadOnlyList<string> monsterIds)
        {
            var party = new List<MonsterData>();
            if (monsterIds != null)
            {
                for (int i = 0; i < monsterIds.Count && party.Count < MaxParty; i++)
                {
                    MonsterData monster = MonsterCollectionService.FindById(monsterIds[i]);
                    if (monster == null || ContainsMonster(party, monster.Id))
                    {
                        continue;
                    }

                    MonsterRaisingService.EnsureRaisingState(monster);
                    if (LifespanRetirementService.IsUnavailableForActivities(monster))
                    {
                        continue;
                    }

                    party.Add(monster);
                }
            }

            if (party.Count == 0 && MonsterCollectionService.ActiveMonster != null)
            {
                MonsterData active = MonsterCollectionService.ActiveMonster;
                MonsterRaisingService.EnsureRaisingState(active);
                if (!LifespanRetirementService.IsUnavailableForActivities(active))
                {
                    party.Add(active);
                }
            }

            return party;
        }

        private static MonsterData LeadMonster()
        {
            string[] ids = Run.partyIds ?? Array.Empty<string>();
            for (int i = 0; i < ids.Length; i++)
            {
                MonsterData monster = MonsterCollectionService.FindById(ids[i]);
                if (monster != null)
                {
                    return monster;
                }
            }

            return MonsterCollectionService.ActiveMonster;
        }

        private static int LowestLevel(List<MonsterData> party)
        {
            int lowest = int.MaxValue;
            for (int i = 0; i < party.Count; i++)
            {
                int level = party[i].Raising?.level ?? 1;
                if (level < lowest)
                {
                    lowest = level;
                }
            }

            return lowest == int.MaxValue ? 1 : lowest;
        }

        private static CircuitTrainerEntry PickTrainer(int seed, int aroundRating, HashSet<string> used = null)
        {
            CircuitTrainerEntry[] all = CircuitCatalogRegistry.Catalog.CpuTrainers;
            if (all == null || all.Length == 0)
            {
                return new CircuitTrainerEntry
                {
                    trainerId = "cpu_fallback",
                    displayName = "Circuit Ghost",
                    friendCode = "AI-GHOST",
                    baseRating = aroundRating
                };
            }

            CircuitTrainerEntry best = all[Math.Abs(seed) % all.Length];
            int bestDelta = int.MaxValue;
            for (int i = 0; i < all.Length; i++)
            {
                CircuitTrainerEntry cpu = all[(Math.Abs(seed) + i) % all.Length];
                if (used != null && used.Contains(cpu.trainerId))
                {
                    continue;
                }

                int delta = Math.Abs(cpu.baseRating - aroundRating);
                if (delta < bestDelta)
                {
                    bestDelta = delta;
                    best = cpu;
                }
            }

            return best;
        }

        private static int MatchSeed(string seasonId, string eventId, int salt, string extra)
        {
            unchecked
            {
                int hash = 17;
                hash = hash * 31 + (seasonId ?? string.Empty).GetHashCode();
                hash = hash * 31 + (eventId ?? string.Empty).GetHashCode();
                hash = hash * 31 + salt;
                hash = hash * 31 + (extra ?? string.Empty).GetHashCode();
                return hash == 0 ? 1 : hash;
            }
        }

        private static int ComputeEloDelta(int rating, int opponentRating, bool won)
        {
            float expected = 1f / (1f + Mathf.Pow(10f, (opponentRating - rating) / 400f));
            float score = won ? 1f : 0f;
            return Mathf.RoundToInt(32f * (score - expected));
        }

        private static void RotateSeasonIfNeeded()
        {
            TournamentSaveState state = MonsterCollectionService.TournamentState;
            string current = CurrentSeasonId();
            if (state.seasonId == current)
            {
                return;
            }

            string previous = state.seasonId;
            state.seasonId = current;
            state.seasonStartedUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            if (!string.IsNullOrEmpty(previous))
            {
                int kept = DefaultRating + (state.seasonRating - DefaultRating) / 2;
                state.seasonRating = Math.Max(800, kept);
                state.seasonWins = 0;
                state.seasonLosses = 0;
                AppendLog($"New season {current}. Rating soft-reset to {state.seasonRating}.");
            }
            MonsterCollectionService.SaveTournament();
        }

        private static void RefreshTitles()
        {
            CircuitTitleEntry[] titles = CircuitCatalogRegistry.Catalog.Titles;
            if (titles == null)
            {
                return;
            }

            for (int i = 0; i < titles.Length; i++)
            {
                CircuitTitleEntry title = titles[i];
                if (title == null)
                {
                    continue;
                }

                bool ratingOk = title.minRating <= 0 || State.seasonRating >= title.minRating;
                bool pointsOk = title.minCareerPoints <= 0 || State.careerPoints >= title.minCareerPoints;
                bool cupsOk = title.minCupWins <= 0 || State.cupWins >= title.minCupWins;
                if (ratingOk && pointsOk && cupsOk)
                {
                    UnlockTitle(title.titleId);
                }
            }

            if (string.IsNullOrEmpty(State.equippedTitleId) && State.unlockedTitleIds.Length > 0)
            {
                State.equippedTitleId = State.unlockedTitleIds[0];
            }
        }

        private static void UnlockTitle(string titleId)
        {
            if (string.IsNullOrEmpty(titleId) || HasTitle(titleId))
            {
                return;
            }

            var list = new List<string>(State.unlockedTitleIds ?? Array.Empty<string>()) { titleId };
            State.unlockedTitleIds = list.ToArray();
            CircuitTitleEntry title = CircuitCatalogRegistry.Catalog.FindTitle(titleId);
            AppendLog($"Title unlocked: {title?.displayName ?? titleId}.");
        }

        private static void UnlockCosmetic(string cosmeticId)
        {
            if (string.IsNullOrEmpty(cosmeticId) || HasCosmetic(cosmeticId))
            {
                return;
            }

            var list = new List<string>(State.unlockedCosmeticIds ?? Array.Empty<string>()) { cosmeticId };
            State.unlockedCosmeticIds = list.ToArray();
            AppendLog($"Banner unlocked: {FormatCosmetic(cosmeticId)}.");
        }

        private static bool HasTitle(string titleId)
        {
            return Contains(State.unlockedTitleIds, titleId);
        }

        public static void AppendLog(string line)
        {
            EnsureReady();
            var lines = new List<string>(State.resultLog ?? Array.Empty<string>())
            {
                $"[{DateTime.Now:HH:mm}] {line}"
            };

            if (lines.Count > MaxLogLines)
            {
                lines.RemoveRange(0, lines.Count - MaxLogLines);
            }

            State.resultLog = lines.ToArray();
        }

        private static void ClearRun()
        {
            CircuitRunState run = Run;
            run.isActive = false;
            run.hasPendingMatch = false;
            run.partyIds = Array.Empty<string>();
            run.eventId = string.Empty;
            run.cupSlotNames = Array.Empty<string>();
            run.cupSlotCodes = Array.Empty<string>();
            run.cupSlotEliminated = Array.Empty<int>();
        }

        private static List<CircuitEventEntry> FilterKind(CircuitEventKind kind)
        {
            var list = new List<CircuitEventEntry>();
            CircuitEventEntry[] events = CircuitCatalogRegistry.Catalog.Events;
            if (events == null)
            {
                return list;
            }

            for (int i = 0; i < events.Length; i++)
            {
                if (events[i] != null && events[i].kind == kind)
                {
                    list.Add(events[i]);
                }
            }

            return list;
        }

        private static string FormatRound(CircuitRunState run)
        {
            if (run.mode != "cup")
            {
                return "ladder";
            }

            return run.roundIndex switch
            {
                0 => "QF",
                1 => "SF",
                _ => "Final"
            };
        }

        private static string FormatCosmetic(string id)
        {
            return id.Replace("banner_", string.Empty).Replace("_", " ");
        }

        private static string Signed(int value) => value >= 0 ? $"+{value}" : value.ToString();

        private static bool Contains(string[] ids, string id)
        {
            if (ids == null || string.IsNullOrEmpty(id))
            {
                return false;
            }

            for (int i = 0; i < ids.Length; i++)
            {
                if (ids[i] == id)
                {
                    return true;
                }
            }

            return false;
        }

        private static bool ContainsMonster(List<MonsterData> list, string id)
        {
            for (int i = 0; i < list.Count; i++)
            {
                if (list[i].Id == id)
                {
                    return true;
                }
            }

            return false;
        }
    }
}
