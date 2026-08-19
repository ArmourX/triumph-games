using System;
using System.Text;
using System.Text.RegularExpressions;
using MonsterCollect.Sharing;
using UnityEngine;

namespace MonsterCollect.QR
{
    /// <summary>
    /// Normalizes raw QR/barcode text into a deterministic string suitable for
    /// monster ID lookup, URL routing, or other game logic.
    ///
    /// Call <see cref="Extract"/> everywhere you consume scan results so parsing
    /// rules stay centralized when QR payload formats evolve.
    /// </summary>
    public static class QRResultExtractor
    {
        /// <summary>Trimmed, upper-cased monster capture codes (e.g. MONSTER:PIKACHU-001).</summary>
        public const string MonsterPrefix = "MONSTER:";

        /// <summary>Trimmed, lower-cased URL scheme prefix for web deep links.</summary>
        public const string UrlSchemePrefix = "triumph://";

        /// <summary>
        /// Extracts a canonical payload from a raw ZXing decode result.
        /// </summary>
        /// <param name="rawText">Text returned by the barcode reader (may be null/empty).</param>
        /// <returns>Clean string, or null when input is unusable.</returns>
        public static string Extract(string rawText)
        {
            if (string.IsNullOrWhiteSpace(rawText))
            {
                return null;
            }

            // 1. Trim outer whitespace and strip BOM / zero-width characters.
            string normalized = StripInvisibleCharacters(rawText.Trim());

            if (normalized.Length == 0)
            {
                return null;
            }

            // 2. Normalize line endings so multi-line payloads compare consistently.
            normalized = normalized.Replace("\r\n", "\n").Replace('\r', '\n');

            // 3. Collapse accidental double spaces (common on printed cards).
            normalized = Regex.Replace(normalized, @"[ \t]{2,}", " ");

            // 4. Route known payload families through dedicated normalizers.
            if (normalized.StartsWith(MonsterShareCodec.SharePrefix, StringComparison.Ordinal))
            {
                return normalized;
            }

            if (normalized.StartsWith(MonsterPrefix, StringComparison.OrdinalIgnoreCase))
            {
                return NormalizeMonsterCode(normalized);
            }

            if (normalized.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                normalized.StartsWith("https://", StringComparison.OrdinalIgnoreCase) ||
                normalized.StartsWith(UrlSchemePrefix, StringComparison.OrdinalIgnoreCase))
            {
                return NormalizeUrlPayload(normalized);
            }

            // 5. Default: return trimmed text as-is for plain-text QRs.
            return normalized;
        }

        /// <summary>Heuristic QR category for seasonal keyword / category matching.</summary>
        public static string GetCategory(string extractedPayload)
        {
            if (string.IsNullOrWhiteSpace(extractedPayload))
            {
                return string.Empty;
            }

            if (extractedPayload.StartsWith(MonsterShareCodec.SharePrefix, StringComparison.Ordinal))
            {
                return "share";
            }

            if (extractedPayload.StartsWith(MonsterPrefix, StringComparison.OrdinalIgnoreCase))
            {
                return "monster";
            }

            if (extractedPayload.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                extractedPayload.StartsWith("https://", StringComparison.OrdinalIgnoreCase) ||
                extractedPayload.StartsWith(UrlSchemePrefix, StringComparison.OrdinalIgnoreCase))
            {
                return "url";
            }

            string lower = extractedPayload.ToLowerInvariant();
            if (lower.Contains("spring") || lower.Contains("flower") || lower.Contains("garden"))
            {
                return "nature";
            }

            if (lower.Contains("halloween") || lower.Contains("spooky") || lower.Contains("ghost"))
            {
                return "spooky";
            }

            if (lower.Contains("travel") || lower.Contains("safari") || lower.Contains("trip"))
            {
                return "travel";
            }

            return "text";
        }

        /// <summary>
        /// Returns true when the extracted payload is non-empty and passes basic validation.
        /// </summary>
        public static bool IsValid(string extractedPayload)
        {
            return !string.IsNullOrWhiteSpace(extractedPayload);
        }

        /// <summary>
        /// Convenience helper used by <see cref="QRScanner"/> after a successful decode.
        /// </summary>
        public static bool TryExtract(string rawText, out string extractedPayload)
        {
            extractedPayload = Extract(rawText);
            return IsValid(extractedPayload);
        }

        private static string NormalizeMonsterCode(string text)
        {
            // MONSTER:species-id  ->  MONSTER:SPECIES-ID (deterministic casing)
            string body = text.Substring(MonsterPrefix.Length).Trim();
            body = body.ToUpperInvariant();
            return MonsterPrefix.ToUpperInvariant() + body;
        }

        private static string NormalizeUrlPayload(string text)
        {
            // Lower-case scheme + host; preserve path/query casing (URLs are case-sensitive past host).
            if (Uri.TryCreate(text, UriKind.Absolute, out Uri uri))
            {
                var builder = new StringBuilder();
                builder.Append(uri.Scheme.ToLowerInvariant());
                builder.Append("://");
                builder.Append(uri.Host.ToLowerInvariant());

                if (!uri.IsDefaultPort && uri.Port > 0)
                {
                    builder.Append(':').Append(uri.Port);
                }

                builder.Append(uri.PathAndQuery);

                if (!string.IsNullOrEmpty(uri.Fragment))
                {
                    builder.Append(uri.Fragment);
                }

                return builder.ToString();
            }

            return text;
        }

        private static string StripInvisibleCharacters(string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return text;
            }

            var builder = new StringBuilder(text.Length);

            foreach (char c in text)
            {
                // Skip BOM, zero-width, and other non-printing control chars except common whitespace.
                if (char.IsControl(c) && c != '\n' && c != '\t')
                {
                    continue;
                }

                if (c == '\uFEFF' || c == '\u200B' || c == '\u200C' || c == '\u200D')
                {
                    continue;
                }

                builder.Append(c);
            }

            return builder.ToString();
        }
    }
}
