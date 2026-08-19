using System;
using System.Collections.Generic;
using MonsterCollect.Data;
using MonsterCollect.Progression;

namespace MonsterCollect.Ranch
{
    public static class RanchBiomeService
    {
        public static IReadOnlyList<RanchBiomeEntry> GetUnlockedBiomes()
        {
            RefreshUnlocksFromTrainerRank();
            RefreshUnlocksFromStory();
            var unlocked = new List<RanchBiomeEntry>();
            ExplorationSaveState state = MonsterCollectionService.ExplorationState;
            RanchBiomeEntry[] all = RanchCatalogRegistry.Biomes.Biomes;
            if (all == null || state?.unlockedBiomeIds == null)
            {
                return unlocked;
            }

            for (int i = 0; i < all.Length; i++)
            {
                RanchBiomeEntry biome = all[i];
                if (biome != null && IsBiomeUnlocked(biome.biomeId))
                {
                    unlocked.Add(biome);
                }
            }

            return unlocked;
        }

        public static bool IsBiomeUnlocked(string biomeId)
        {
            if (string.IsNullOrEmpty(biomeId))
            {
                return false;
            }

            string[] unlocked = MonsterCollectionService.ExplorationState?.unlockedBiomeIds ?? Array.Empty<string>();
            for (int i = 0; i < unlocked.Length; i++)
            {
                if (unlocked[i] == biomeId)
                {
                    return true;
                }
            }

            return false;
        }

        public static void RefreshUnlocksFromTrainerRank()
        {
            MonsterCollectionService.EnsureExplorationLoaded();
            ExplorationSaveState state = MonsterCollectionService.ExplorationState;
            int rank = TrainerProgressionService.RankIndex;
            RanchBiomeEntry[] biomes = RanchCatalogRegistry.Biomes.Biomes;
            if (biomes == null)
            {
                return;
            }

            var list = new List<string>(state.unlockedBiomeIds ?? Array.Empty<string>());
            bool changed = false;

            for (int i = 0; i < biomes.Length; i++)
            {
                RanchBiomeEntry biome = biomes[i];
                if (biome == null || biome.requiredTrainerRankIndex > rank)
                {
                    continue;
                }

                if (!list.Contains(biome.biomeId))
                {
                    list.Add(biome.biomeId);
                    changed = true;
                }
            }

            if (changed)
            {
                state.unlockedBiomeIds = list.ToArray();
                MonsterCollectionService.SaveExploration();
            }
        }

        public static void RefreshUnlocksFromStory()
        {
            MonsterCollectionService.EnsureExplorationLoaded();
            ExplorationSaveState state = MonsterCollectionService.ExplorationState;
            RanchBiomeEntry[] biomes = RanchCatalogRegistry.Biomes.Biomes;
            if (biomes == null)
            {
                return;
            }

            var list = new List<string>(state.unlockedBiomeIds ?? Array.Empty<string>());
            bool changed = false;
            for (int i = 0; i < biomes.Length; i++)
            {
                RanchBiomeEntry biome = biomes[i];
                if (biome == null || string.IsNullOrEmpty(biome.storyUnlockId))
                {
                    continue;
                }

                if (AdventureStoryService.IsBeatComplete(biome.storyUnlockId) && !list.Contains(biome.biomeId))
                {
                    list.Add(biome.biomeId);
                    changed = true;
                }
            }

            if (changed)
            {
                state.unlockedBiomeIds = list.ToArray();
                MonsterCollectionService.SaveExploration();
            }
        }

        public static IReadOnlyList<ExplorationZoneEntry> GetAvailableZones()
        {
            RefreshUnlocksFromTrainerRank();
            RefreshUnlocksFromStory();
            var zones = new List<ExplorationZoneEntry>();
            ExplorationZoneEntry[] all = RanchCatalogRegistry.ExplorationZones.Zones;
            if (all == null)
            {
                return zones;
            }

            int rank = TrainerProgressionService.RankIndex;
            for (int i = 0; i < all.Length; i++)
            {
                ExplorationZoneEntry zone = all[i];
                if (zone == null)
                {
                    continue;
                }

                if (!IsBiomeUnlocked(zone.biomeId))
                {
                    continue;
                }

                if (zone.requiredTrainerRankIndex > rank &&
                    !AdventureStoryService.IsBiomeUnlockedByStory(zone.biomeId))
                {
                    continue;
                }

                zones.Add(zone);
            }

            return zones;
        }
    }
}
