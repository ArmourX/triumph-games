using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using MonsterCollect.Battle;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using MonsterCollect.QR;
using MonsterCollect.Sharing;
using UnityEngine;

namespace MonsterCollect.Social
{
    /// <summary>Local public gallery, friend showcase, likes, and screenshot export.</summary>
    public static class CommunityGalleryService
    {
        public const int MaxPublicPosts = 24;
        public const int MaxShowcase = 6;
        public const int HideAfterReports = 3;

        public static event Action GalleryChanged;

        internal static void NotifyChanged()
        {
            GalleryChanged?.Invoke();
        }

        public static void EnsureReady()
        {
            MonsterCollectionService.EnsureSocialLoaded();
            SocialSaveState social = MonsterCollectionService.SocialState;
            social.gallery ??= Array.Empty<CommunityGalleryEntry>();
            social.reports ??= Array.Empty<CommunityReport>();
            social.likedGalleryIds ??= Array.Empty<string>();
            social.hiddenGalleryIds ??= Array.Empty<string>();
            social.friendShowcaseMonsterIds ??= Array.Empty<string>();
            SeedDemoIfEmpty();
        }

        public static IReadOnlyList<CommunityGalleryEntry> GetVisibleGallery()
        {
            EnsureReady();
            return FilterVisible(MonsterCollectionService.SocialState.gallery)
                .OrderByDescending(e => e.likes)
                .ThenByDescending(e => e.submittedUtc)
                .ToList();
        }

        public static IReadOnlyList<CommunityGalleryEntry> GetFeatured()
        {
            EnsureReady();
            CommunityChallenge challenge = CommunityChallengeService.Current;
            List<CommunityGalleryEntry> matching = FilterVisible(MonsterCollectionService.SocialState.gallery)
                .Where(e => CommunityChallengeService.Matches(e, challenge))
                .OrderByDescending(e => e.likes)
                .ThenByDescending(e => e.submittedUtc)
                .Take(8)
                .ToList();

            if (matching.Count == 0)
            {
                matching = FilterVisible(MonsterCollectionService.SocialState.gallery)
                    .OrderByDescending(e => e.likes)
                    .Take(6)
                    .ToList();
            }

            return matching;
        }

        public static IReadOnlyList<CommunityGalleryEntry> GetFriendShowcase()
        {
            EnsureReady();
            HashSet<string> friendCodes = new HashSet<string>(
                SocialProfileService.Friends.Select(f => f.friendCode),
                StringComparer.OrdinalIgnoreCase)
            {
                SocialProfileService.FriendCode
            };

            return FilterVisible(MonsterCollectionService.SocialState.gallery)
                .Where(e => e.visibility == (int)CommunityVisibility.Friends || friendCodes.Contains(e.ownerFriendCode))
                .Where(e => friendCodes.Contains(e.ownerFriendCode))
                .OrderByDescending(e => e.submittedUtc)
                .ToList();
        }

        public static bool TryPublish(MonsterData monster, CommunityVisibility visibility, bool saveScreenshot, out string message)
        {
            message = string.Empty;
            if (monster == null)
            {
                message = "Pick a monster first.";
                return false;
            }

            EnsureReady();
            ShareValidationResult validation = MonsterShareValidator.Validate(monster);
            if (!validation.IsValid)
            {
                message = validation.Reason ?? "Monster cannot be shared.";
                return false;
            }

            string payload = MonsterShareCodec.Encode(monster);
            SocialSaveState social = MonsterCollectionService.SocialState;
            string entryId = BuildEntryId(monster.FullHash, SocialProfileService.FriendCode);

            CommunityGalleryEntry existing = social.gallery.FirstOrDefault(e => e.entryId == entryId);
            string screenshotPath = saveScreenshot ? SaveShareCard(monster, payload) : existing?.screenshotPath ?? string.Empty;

            if (existing != null)
            {
                existing.visibility = (int)visibility;
                existing.sharePayload = payload;
                existing.monsterName = monster.GetDisplayName();
                existing.screenshotPath = screenshotPath;
                existing.challengeWeekId = CommunityChallengeService.Current.WeekId;
                MonsterCollectionService.SaveSocial();
                GalleryChanged?.Invoke();
                message = visibility == CommunityVisibility.Friends
                    ? "Updated friend showcase."
                    : "Updated public gallery post.";
                CommunityChallengeService.RecordSubmission(existing);
                return true;
            }

            int ownPublicCount = social.gallery.Count(e =>
                e.ownerFriendCode == SocialProfileService.FriendCode &&
                !e.isDemo &&
                e.visibility == (int)CommunityVisibility.Public);

            if (visibility == CommunityVisibility.Public && ownPublicCount >= MaxPublicPosts)
            {
                message = "Gallery is full. Hide an older post first.";
                return false;
            }

            var entry = new CommunityGalleryEntry
            {
                entryId = entryId,
                ownerFriendCode = SocialProfileService.FriendCode,
                ownerDisplayName = SocialProfileService.DisplayName,
                monsterName = monster.GetDisplayName(),
                dexNumber = monster.DexNumber,
                rarity = (int)monster.Rarity,
                element = BattleElementUtility.GetShortName(BattleElementUtility.FromMonster(monster)),
                sourceHash = monster.FullHash ?? string.Empty,
                sharePayload = payload,
                screenshotPath = screenshotPath,
                likes = 0,
                submittedUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                visibility = (int)visibility,
                challengeWeekId = CommunityChallengeService.Current.WeekId
            };

            social.gallery = social.gallery.Concat(new[] { entry }).ToArray();

            if (visibility == CommunityVisibility.Friends)
            {
                UpsertShowcaseId(monster.Id);
            }

            MonsterCollectionService.SaveSocial();
            CommunityChallengeService.RecordSubmission(entry);
            GalleryChanged?.Invoke();
            message = visibility == CommunityVisibility.Friends
                ? "Added to friend showcase."
                : "Posted to the public gallery.";
            return true;
        }

        public static bool TryToggleLike(string entryId, out string message)
        {
            EnsureReady();
            SocialSaveState social = MonsterCollectionService.SocialState;
            CommunityGalleryEntry entry = social.gallery.FirstOrDefault(e => e.entryId == entryId);
            if (entry == null)
            {
                message = "Post not found.";
                return false;
            }

            var liked = new List<string>(social.likedGalleryIds ?? Array.Empty<string>());
            if (liked.Contains(entryId))
            {
                liked.Remove(entryId);
                entry.likes = Mathf.Max(0, entry.likes - 1);
                message = "Like removed.";
            }
            else
            {
                liked.Add(entryId);
                entry.likes++;
                message = "Liked!";
            }

            social.likedGalleryIds = liked.ToArray();
            MonsterCollectionService.SaveSocial();
            GalleryChanged?.Invoke();
            return true;
        }

        public static bool IsLiked(string entryId)
        {
            EnsureReady();
            return MonsterCollectionService.SocialState.likedGalleryIds != null &&
                   MonsterCollectionService.SocialState.likedGalleryIds.Contains(entryId);
        }

        public static bool TryHideOwnPost(string entryId, out string message)
        {
            EnsureReady();
            CommunityGalleryEntry entry = MonsterCollectionService.SocialState.gallery
                .FirstOrDefault(e => e.entryId == entryId);
            if (entry == null || entry.ownerFriendCode != SocialProfileService.FriendCode)
            {
                message = "You can only hide your own posts.";
                return false;
            }

            entry.visibility = (int)CommunityVisibility.Hidden;
            MonsterCollectionService.SaveSocial();
            GalleryChanged?.Invoke();
            message = "Post hidden.";
            return true;
        }

        public static string SaveShareCard(MonsterData monster, string payload)
        {
            try
            {
                string folder = Path.Combine(Application.persistentDataPath, "Shares");
                Directory.CreateDirectory(folder);
                string fileName = $"{SanitizeFileName(monster.Id)}.png";
                string path = Path.Combine(folder, fileName);
                byte[] png = QRCodeGenerator.GeneratePngBytes(payload, 420, 2);
                File.WriteAllBytes(path, png);
                return path;
            }
            catch (Exception)
            {
                return string.Empty;
            }
        }

        private static void SeedDemoIfEmpty()
        {
            SocialSaveState social = MonsterCollectionService.SocialState;
            if (social.gallery != null && social.gallery.Any(e => e.isDemo))
            {
                return;
            }

            var demos = new List<CommunityGalleryEntry>(social.gallery ?? Array.Empty<CommunityGalleryEntry>());
            string[] names = { "Aero", "Bloom", "Volt", "Ember" };
            for (int i = 0; i < names.Length; i++)
            {
                MonsterData wild = WildMonsterFactory.CreateWild(42000 + i, 8 + i);
                wild.Name = names[i];
                wild.FullHash = $"demo{i:x2}" + new string('0', 56);
                string payload = MonsterShareCodec.Encode(wild, sign: true);
                demos.Add(new CommunityGalleryEntry
                {
                    entryId = $"demo-{i}",
                    ownerFriendCode = $"MC-DEMO{i + 1:00}",
                    ownerDisplayName = i == 0 ? "Ranch Master" : names[i] + " Fan",
                    monsterName = wild.Name,
                    dexNumber = wild.DexNumber,
                    rarity = (int)wild.Rarity,
                    element = BattleElementUtility.GetShortName(BattleElementUtility.FromMonster(wild)),
                    sourceHash = wild.FullHash,
                    sharePayload = payload,
                    likes = 12 - i * 2,
                    submittedUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds() - (i * 3600),
                    visibility = (int)CommunityVisibility.Public,
                    challengeWeekId = CommunityChallengeService.Current.WeekId,
                    isDemo = true
                });
            }

            social.gallery = demos.ToArray();
            MonsterCollectionService.SaveSocial();
        }

        private static IEnumerable<CommunityGalleryEntry> FilterVisible(CommunityGalleryEntry[] gallery)
        {
            HashSet<string> hidden = new HashSet<string>(
                MonsterCollectionService.SocialState.hiddenGalleryIds ?? Array.Empty<string>());
            string me = SocialProfileService.FriendCode;
            HashSet<string> friends = new HashSet<string>(
                SocialProfileService.Friends.Select(f => f.friendCode),
                StringComparer.OrdinalIgnoreCase);

            foreach (CommunityGalleryEntry entry in gallery ?? Array.Empty<CommunityGalleryEntry>())
            {
                if (entry == null || hidden.Contains(entry.entryId))
                {
                    continue;
                }

                var visibility = (CommunityVisibility)entry.visibility;
                if (visibility == CommunityVisibility.Hidden)
                {
                    continue;
                }

                if (visibility == CommunityVisibility.Friends &&
                    entry.ownerFriendCode != me &&
                    !friends.Contains(entry.ownerFriendCode))
                {
                    continue;
                }

                yield return entry;
            }
        }

        private static void UpsertShowcaseId(string monsterId)
        {
            if (string.IsNullOrEmpty(monsterId))
            {
                return;
            }

            SocialSaveState social = MonsterCollectionService.SocialState;
            var ids = new List<string>(social.friendShowcaseMonsterIds ?? Array.Empty<string>());
            if (!ids.Contains(monsterId))
            {
                ids.Insert(0, monsterId);
            }

            if (ids.Count > MaxShowcase)
            {
                ids.RemoveRange(MaxShowcase, ids.Count - MaxShowcase);
            }

            social.friendShowcaseMonsterIds = ids.ToArray();
        }

        private static string BuildEntryId(string hash, string friendCode)
        {
            string seed = (hash ?? "none") + "|" + (friendCode ?? "local");
            return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(seed))
                .Replace("+", string.Empty)
                .Replace("/", string.Empty)
                .Replace("=", string.Empty)
                .Substring(0, 16);
        }

        private static string SanitizeFileName(string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return "monster";
            }

            foreach (char c in Path.GetInvalidFileNameChars())
            {
                value = value.Replace(c, '_');
            }

            return value.Length > 24 ? value.Substring(0, 24) : value;
        }
    }
}
