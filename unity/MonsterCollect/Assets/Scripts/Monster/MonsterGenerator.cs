using System;
using System.Security.Cryptography;
using System.Text;
using UnityEngine;

namespace MonsterCollect.Monster
{
    /// <summary>
    /// Deterministic monster factory: same QR content always yields the same <see cref="MonsterData"/>.
    /// Each capture maps to one of <see cref="DexCatalog.TotalEntries"/> dex slots.
    /// </summary>
    public static class MonsterGenerator
    {
        private const int IdLength = 16;

        /// <summary>
        /// Builds a monster from the canonical QR payload string.
        /// </summary>
        public static MonsterData Generate(string qrContent)
        {
            if (string.IsNullOrEmpty(qrContent))
            {
                throw new ArgumentException("QR content must be non-empty.", nameof(qrContent));
            }

            byte[] hash = ComputeSha256(qrContent);
            string fullHash = BytesToHex(hash);
            string id = fullHash.Substring(0, IdLength);
            int dexNumber = DexCatalog.ResolveDexNumberFromHash(hash);
            DexEntry entry = DexCatalog.GetEntry(dexNumber);

            var rng = new System.Random(MonsterProceduralTraits.SeedFromHashBytes(hash));

            return new MonsterData
            {
                Id = id,
                FullHash = fullHash,
                DexNumber = dexNumber,
                Name = entry.Name,
                Species = entry.Species,
                Hp = ApplyVariance(entry.BaseHp, rng, 10),
                Attack = ApplyVariance(entry.BaseAttack, rng, 8),
                Defense = ApplyVariance(entry.BaseDefense, rng, 8),
                Speed = ApplyVariance(entry.BaseSpeed, rng, 6),
                PrimaryColor = entry.PrimaryColor,
                SecondaryColor = entry.SecondaryColor,
                Rarity = entry.Rarity,
                SourceQrContent = qrContent,
                TypeAffinities = MonsterTypeAffinities.FromDominantSpecies(entry.Species),
                IsBred = false,
                BaseFormHash = fullHash,
                Raising = MonsterRaisingState.CreateDefault()
            };
        }

        /// <summary>SHA-256 hex digest of UTF-8 content (used for deduplication).</summary>
        public static string ComputeHashHex(string content)
        {
            return BytesToHex(ComputeSha256(content));
        }

        private static int ApplyVariance(int baseValue, System.Random rng, int variance)
        {
            return Mathf.Clamp(baseValue + rng.Next(-variance, variance + 1), 1, 999);
        }

        private static byte[] ComputeSha256(string content)
        {
            using SHA256 sha = SHA256.Create();
            return sha.ComputeHash(Encoding.UTF8.GetBytes(content));
        }

        private static string BytesToHex(byte[] bytes)
        {
            var builder = new StringBuilder(bytes.Length * 2);

            foreach (byte b in bytes)
            {
                builder.Append(b.ToString("x2"));
            }

            return builder.ToString();
        }
    }
}
