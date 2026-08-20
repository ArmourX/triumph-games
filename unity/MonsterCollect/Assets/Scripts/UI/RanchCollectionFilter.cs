using System;
using System.Collections.Generic;
using MonsterCollect.Data;
using MonsterCollect.Monster;

namespace MonsterCollect.UI
{
    /// <summary>Filters and sorts ranch collection monsters for the grid view.</summary>
    public static class RanchCollectionFilter
    {
        public static List<MonsterData> Apply(IReadOnlyList<MonsterData> source, MonsterRarity? rarityFilter)
        {
            if (source == null || source.Count == 0)
            {
                return new List<MonsterData>(0);
            }

            var results = new List<MonsterData>(source.Count);
            for (int i = 0; i < source.Count; i++)
            {
                MonsterData monster = source[i];
                if (monster == null)
                {
                    continue;
                }

                if (rarityFilter.HasValue && monster.Rarity != rarityFilter.Value)
                {
                    continue;
                }

                results.Add(monster);
            }

            results.Sort(CompareLevelHighToLow);
            return results;
        }

        public static int GetLevel(MonsterData monster)
        {
            if (monster?.Raising == null || monster.Raising.level < 1)
            {
                return 1;
            }

            return monster.Raising.level;
        }

        private static int CompareLevelHighToLow(MonsterData a, MonsterData b)
        {
            int levelCompare = GetLevel(b).CompareTo(GetLevel(a));
            if (levelCompare != 0)
            {
                return levelCompare;
            }

            int rarityCompare = ((int)b.Rarity).CompareTo((int)a.Rarity);
            if (rarityCompare != 0)
            {
                return rarityCompare;
            }

            return string.Compare(a?.Name, b?.Name, StringComparison.OrdinalIgnoreCase);
        }
    }
}
