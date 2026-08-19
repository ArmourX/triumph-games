using System;
using MonsterCollect.Monster;
using MonsterCollect.Ranch;

namespace MonsterCollect.Battle
{
    /// <summary>Generates wild opponents for battles.</summary>
    public static class WildMonsterFactory
    {
        public static MonsterData CreateWild(int seed = 0, int level = 0)
        {
            return CreateWildForRegion(seed, level, null);
        }

        public static MonsterData CreateWildForRegion(int seed, int level, string biomeId)
        {
            if (seed == 0)
            {
                seed = Environment.TickCount;
            }

            var rng = new Random(seed);
            string preferred = RanchCatalogRegistry.Biomes.FindById(biomeId)?.preferredElement;
            DexEntry entry = PickEntry(rng, preferred);
            MonsterRaisingState raising = MonsterRaisingState.CreateDefault();
            raising.level = level > 0 ? level : rng.Next(1, 14);

            return new MonsterData
            {
                Id = $"wild-{seed}",
                FullHash = string.Empty,
                DexNumber = entry.DexNumber,
                Name = $"Wild {entry.Name}",
                Species = entry.Species,
                Hp = ApplyVariance(entry.BaseHp, rng, 15),
                Attack = ApplyVariance(entry.BaseAttack, rng, 10),
                Defense = ApplyVariance(entry.BaseDefense, rng, 10),
                Speed = ApplyVariance(entry.BaseSpeed, rng, 8),
                PrimaryColor = entry.PrimaryColor,
                SecondaryColor = entry.SecondaryColor,
                Rarity = entry.Rarity,
                Raising = raising
            };
        }

        private static DexEntry PickEntry(Random rng, string preferredElement)
        {
            int total = DexCatalog.TotalEntries;
            if (string.IsNullOrEmpty(preferredElement))
            {
                return DexCatalog.GetEntry(rng.Next(1, total + 1));
            }

            for (int attempt = 0; attempt < 24; attempt++)
            {
                DexEntry candidate = DexCatalog.GetEntry(rng.Next(1, total + 1));
                BattleElement element = BattleElementUtility.FromSpecies(candidate.Species);
                if (string.Equals(element.ToString(), preferredElement, StringComparison.OrdinalIgnoreCase))
                {
                    return candidate;
                }
            }

            return DexCatalog.GetEntry(rng.Next(1, total + 1));
        }

        private static int ApplyVariance(int baseValue, Random rng, int variance)
        {
            return Math.Max(1, baseValue + rng.Next(-variance, variance + 1));
        }
    }
}
