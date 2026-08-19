using System;

namespace MonsterCollect.Monster
{
    /// <summary>
    /// Master list of 500 discoverable monsters. Entries are generated deterministically at runtime.
    /// </summary>
    public static class DexCatalog
    {
        public const int TotalEntries = 500;

        private static DexEntry[] entries;
        private static bool isInitialized;

        public static void EnsureInitialized()
        {
            if (isInitialized)
            {
                return;
            }

            isInitialized = true;
            entries = new DexEntry[TotalEntries];

            for (int i = 0; i < TotalEntries; i++)
            {
                entries[i] = BuildEntry(i + 1);
            }
        }

        public static DexEntry GetEntry(int dexNumber)
        {
            EnsureInitialized();

            if (dexNumber < 1 || dexNumber > TotalEntries)
            {
                return null;
            }

            return entries[dexNumber - 1];
        }

        public static DexEntry[] GetAllEntries()
        {
            EnsureInitialized();
            return entries;
        }

        public static int ResolveDexNumberFromHash(byte[] hash)
        {
            int seed = MonsterProceduralTraits.SeedFromHashBytes(hash);
            int index = MonsterProceduralTraits.PositiveMod(seed, TotalEntries);
            return index + 1;
        }

        public static int ResolveDexNumberFromHashHex(string fullHashHex)
        {
            if (string.IsNullOrEmpty(fullHashHex) || fullHashHex.Length < 8)
            {
                return 1;
            }

            try
            {
                var bytes = new byte[4];
                for (int i = 0; i < 4; i++)
                {
                    bytes[i] = Convert.ToByte(fullHashHex.Substring(i * 2, 2), 16);
                }

                return ResolveDexNumberFromHash(bytes);
            }
            catch
            {
                return 1;
            }
        }

        private static DexEntry BuildEntry(int dexNumber)
        {
            var rng = new System.Random(MonsterProceduralTraits.SeedFromInt(dexNumber * 7919));

            return new DexEntry
            {
                DexNumber = dexNumber,
                Name = MonsterProceduralTraits.GenerateName(rng),
                Species = MonsterProceduralTraits.PickSpecies(rng),
                Rarity = MonsterProceduralTraits.PickRarity(rng),
                PrimaryColor = MonsterProceduralTraits.ColorFromSeed(rng),
                SecondaryColor = MonsterProceduralTraits.ColorFromSeed(rng),
                BaseHp = MonsterProceduralTraits.NextInt(rng, 50, 200),
                BaseAttack = MonsterProceduralTraits.NextInt(rng, 10, 100),
                BaseDefense = MonsterProceduralTraits.NextInt(rng, 10, 100),
                BaseSpeed = MonsterProceduralTraits.NextInt(rng, 5, 80)
            };
        }
    }
}
