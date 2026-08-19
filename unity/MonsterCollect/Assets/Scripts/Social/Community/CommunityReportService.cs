using System;
using System.Collections.Generic;
using System.Linq;
using MonsterCollect.Data;
using UnityEngine;

namespace MonsterCollect.Social
{
    /// <summary>Simple local reporting for shared gallery posts.</summary>
    public static class CommunityReportService
    {
        public static bool TryReport(string galleryEntryId, CommunityReportReason reason, string notes, out string message)
        {
            message = string.Empty;
            CommunityGalleryService.EnsureReady();

            if (string.IsNullOrEmpty(galleryEntryId))
            {
                message = "Pick a post to report.";
                return false;
            }

            SocialSaveState social = MonsterCollectionService.SocialState;
            CommunityGalleryEntry entry = social.gallery.FirstOrDefault(e => e.entryId == galleryEntryId);
            if (entry == null)
            {
                message = "Post not found.";
                return false;
            }

            if (entry.ownerFriendCode == SocialProfileService.FriendCode)
            {
                message = "You cannot report your own post. Hide it instead.";
                return false;
            }

            bool already = social.reports.Any(r =>
                r.galleryEntryId == galleryEntryId &&
                r.reporterFriendCode == SocialProfileService.FriendCode);
            if (already)
            {
                HideLocally(galleryEntryId);
                message = "Already reported. Hidden from your feed.";
                return true;
            }

            var report = new CommunityReport
            {
                reportId = Guid.NewGuid().ToString("N").Substring(0, 12),
                galleryEntryId = galleryEntryId,
                reporterFriendCode = SocialProfileService.FriendCode,
                reason = (int)reason,
                notes = Truncate(notes),
                createdUtc = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
            };

            social.reports = social.reports.Concat(new[] { report }).ToArray();
            HideLocally(galleryEntryId);

            int count = social.reports.Count(r => r.galleryEntryId == galleryEntryId);
            if (count >= CommunityGalleryService.HideAfterReports && !entry.isDemo)
            {
                entry.visibility = (int)CommunityVisibility.Hidden;
            }

            MonsterCollectionService.SaveSocial();
            CommunityGalleryService.NotifyChanged();
            message = "Thanks. That post is hidden on this device.";
            return true;
        }

        public static string FormatReason(CommunityReportReason reason)
        {
            return reason switch
            {
                CommunityReportReason.InappropriateName => "Inappropriate name",
                CommunityReportReason.OffensiveContent => "Offensive content",
                CommunityReportReason.Spam => "Spam",
                _ => "Other"
            };
        }

        private static void HideLocally(string galleryEntryId)
        {
            SocialSaveState social = MonsterCollectionService.SocialState;
            var hidden = new List<string>(social.hiddenGalleryIds ?? Array.Empty<string>());
            if (!hidden.Contains(galleryEntryId))
            {
                hidden.Add(galleryEntryId);
            }

            social.hiddenGalleryIds = hidden.ToArray();
        }

        private static string Truncate(string notes)
        {
            if (string.IsNullOrWhiteSpace(notes))
            {
                return string.Empty;
            }

            notes = notes.Trim();
            return notes.Length <= 80 ? notes : notes.Substring(0, 80);
        }
    }
}
