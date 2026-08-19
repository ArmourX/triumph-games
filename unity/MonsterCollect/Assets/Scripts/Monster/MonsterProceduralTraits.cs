using System;
using System.Text;
using MonsterCollect.Core.RemoteConfig;
using UnityEngine;

namespace MonsterCollect.Monster
{
    /// <summary>Shared deterministic trait generation for catalog and QR monsters.</summary>
    public static class MonsterProceduralTraits
    {
        internal static readonly string[] Syllables =
        {
            "kor", "vex", "lun", "thar", "zix", "mora", "glen", "pyx",
            "brix", "nava", "quor", "syl", "tarn", "ulm", "vora", "wex",
            "yor", "zep", "axen", "brum", "cira", "dusk", "ember", "frost",
            "gale", "hex", "ivy", "jolt", "kite", "lynx", "myth", "nova"
        };

        public static int SeedFromInt(int value)
        {
            unchecked
            {
                uint x = (uint)value;
                x = ((x >> 16) ^ x) * 0x45d9f3b;
                x = ((x >> 16) ^ x) * 0x45d9f3b;
                x = (x >> 16) ^ x;
                return (int)x;
            }
        }

        public static int SeedFromHashBytes(byte[] hash)
        {
            if (hash == null || hash.Length < 4)
            {
                return 0;
            }

            unchecked
            {
                return (hash[0] << 24) | (hash[1] << 16) | (hash[2] << 8) | hash[3];
            }
        }

        /// <summary>Maps any signed hash seed to a stable positive modulus bucket.</summary>
        public static int PositiveMod(int seed, int modulus)
        {
            if (modulus <= 0)
            {
                return 0;
            }

            unchecked
            {
                uint bucket = (uint)seed % (uint)modulus;
                return (int)bucket;
            }
        }

        public static string GenerateName(System.Random rng)
        {
            int syllableCount = NextInt(rng, 2, 3);
            var builder = new StringBuilder(syllableCount * 4);

            for (int i = 0; i < syllableCount; i++)
            {
                builder.Append(Syllables[rng.Next(Syllables.Length)]);
            }

            string raw = builder.ToString();
            return char.ToUpper(raw[0]) + raw.Substring(1);
        }

        public static MonsterSpecies PickSpecies(System.Random rng)
        {
            var values = (MonsterSpecies[])Enum.GetValues(typeof(MonsterSpecies));
            return values[rng.Next(values.Length)];
        }

        public static MonsterRarity PickRarity(System.Random rng)
        {
            return RemoteConfigService.PickRarity(rng);
        }

        public static Color ColorFromSeed(System.Random rng)
        {
            float r = rng.Next(70, 100) / 100f;
            float g = rng.Next(70, 100) / 100f;
            float b = rng.Next(70, 100) / 100f;
            return new Color(r, g, b, 1f);
        }

        public static Color ColorFromHash(byte[] hash, int offset)
        {
            float r = (hash[offset] / 255f) * 0.7f + 0.3f;
            float g = (hash[offset + 1] / 255f) * 0.7f + 0.3f;
            float b = (hash[offset + 2] / 255f) * 0.7f + 0.3f;
            return new Color(r, g, b, 1f);
        }

        public static int NextInt(System.Random rng, int minInclusive, int maxInclusive)
        {
            return rng.Next(minInclusive, maxInclusive + 1);
        }
    }
}
