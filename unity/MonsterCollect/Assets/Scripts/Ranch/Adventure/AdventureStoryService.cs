using System;
using System.Collections.Generic;
using MonsterCollect.Data;
using MonsterCollect.Progression;

namespace MonsterCollect.Ranch
{
    public readonly struct AdventureStoryBeat
    {
        public string Id { get; }
        public string Title { get; }
        public string Body { get; }
        public string UnlockBiomeId { get; }

        public AdventureStoryBeat(string id, string title, string body, string unlockBiomeId = null)
        {
            Id = id;
            Title = title;
            Body = body;
            UnlockBiomeId = unlockBiomeId;
        }
    }

    /// <summary>Short errantry-style story that opens the first regions.</summary>
    public static class AdventureStoryService
    {
        private static readonly AdventureStoryBeat[] Beats =
        {
            new AdventureStoryBeat(
                "meadow_welcome",
                "Leave the Meadow",
                "The ranch gates are open. Send one to three monsters on a short forage — they will train while you tend other chores."),
            new AdventureStoryBeat(
                "forest_open",
                "The Forest Path",
                "Tracks lead under the canopy. Grass-leaning wilds wait there. Rank up or finish a meadow trip to unseal the trail.",
                "biome_forest"),
            new AdventureStoryBeat(
                "volcano_open",
                "Ash on the Wind",
                "Cinders drift from the west. Fire wilds and rare stones. Complete a forest trip or reach Ranger rank.",
                "biome_volcano"),
            new AdventureStoryBeat(
                "ocean_open",
                "Tide Calling",
                "The cliffs roar at night. Water wilds and shells. Finish a volcano trip or reach Expert rank.",
                "biome_ocean"),
            new AdventureStoryBeat(
                "ruins_open",
                "Whispers in Stone",
                "Old halls remember trainers. Shadow wilds and relics. Complete an ocean trip or reach Master rank.",
                "biome_ruins")
        };

        public static IReadOnlyList<AdventureStoryBeat> AllBeats => Beats;

        public static AdventureStoryBeat CurrentBeat()
        {
            AdventureService.EnsureReady();
            string[] done = MonsterCollectionService.ExplorationState.completedStoryBeatIds ?? Array.Empty<string>();
            for (int i = 0; i < Beats.Length; i++)
            {
                if (!Contains(done, Beats[i].Id))
                {
                    return Beats[i];
                }
            }

            return Beats[Beats.Length - 1];
        }

        public static bool IsBeatComplete(string beatId)
        {
            AdventureService.EnsureReady();
            return Contains(MonsterCollectionService.ExplorationState.completedStoryBeatIds, beatId);
        }

        public static bool IsBiomeUnlockedByStory(string biomeId)
        {
            if (string.IsNullOrEmpty(biomeId))
            {
                return false;
            }

            RanchBiomeEntry biome = RanchCatalogRegistry.Biomes.FindById(biomeId);
            if (biome == null || string.IsNullOrEmpty(biome.storyUnlockId))
            {
                return false;
            }

            return IsBeatComplete(biome.storyUnlockId);
        }

        public static void OnAdventureComplete(ExplorationZoneEntry zone)
        {
            if (zone == null)
            {
                return;
            }

            if (zone.biomeId == "biome_meadow")
            {
                CompleteBeat("meadow_welcome");
                CompleteBeat("forest_open");
            }
            else if (zone.biomeId == "biome_forest")
            {
                CompleteBeat("forest_open");
                CompleteBeat("volcano_open");
            }
            else if (zone.biomeId == "biome_volcano")
            {
                CompleteBeat("volcano_open");
                CompleteBeat("ocean_open");
            }
            else if (zone.biomeId == "biome_ocean" || zone.biomeId == "biome_coast")
            {
                CompleteBeat("ocean_open");
                CompleteBeat("ruins_open");
            }
            else if (zone.biomeId == "biome_ruins")
            {
                CompleteBeat("ruins_open");
            }

            RanchBiomeService.RefreshUnlocksFromTrainerRank();
            RanchBiomeService.RefreshUnlocksFromStory();
        }

        public static void CompleteBeat(string beatId)
        {
            if (string.IsNullOrEmpty(beatId) || IsBeatComplete(beatId))
            {
                return;
            }

            AdventureService.EnsureReady();
            ExplorationSaveState state = MonsterCollectionService.ExplorationState;
            var list = new List<string>(state.completedStoryBeatIds ?? Array.Empty<string>()) { beatId };
            state.completedStoryBeatIds = list.ToArray();
            AdventureService.AppendLog($"Story: {TitleFor(beatId)}");
            MonsterCollectionService.SaveExploration();
        }

        private static string TitleFor(string beatId)
        {
            for (int i = 0; i < Beats.Length; i++)
            {
                if (Beats[i].Id == beatId)
                {
                    return Beats[i].Title;
                }
            }

            return beatId;
        }

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
    }
}
