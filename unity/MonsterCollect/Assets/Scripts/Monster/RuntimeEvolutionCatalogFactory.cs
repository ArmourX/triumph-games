using System;
using MonsterCollect.Appearance;
using UnityEngine;

namespace MonsterCollect.Monster
{
    public static class RuntimeEvolutionCatalogFactory
    {
        public static EvolutionCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<EvolutionCatalog>();
            catalog.Paths = BuildPaths();
            return catalog;
        }

        private static EvolutionPathEntry[] BuildPaths()
        {
            var paths = new System.Collections.Generic.List<EvolutionPathEntry>();

            foreach (MonsterSpecies species in Enum.GetValues(typeof(MonsterSpecies)))
            {
                paths.Add(LevelPath(species, 15, 1, "Awakening", 1.12f, suffix: "Awakened"));
                paths.Add(LevelPath(species, 30, 2, "Ascension", 1.2f, suffix: "Ascended"));
            }

            paths.Add(ItemPath("beast_power_evolve", MonsterSpecies.Beast, "power_charm", "Fury Form", "Furious"));
            paths.Add(ItemPath("dragon_power_evolve", MonsterSpecies.Dragon, "power_charm", "Drake Form", "Drake"));
            paths.Add(ItemPath("spirit_bell_evolve", MonsterSpecies.Spirit, "lucky_bell", "Oracle Form", "Oracle"));
            paths.Add(ItemPath("slime_treat_evolve", MonsterSpecies.Slime, "care_treat", "Royal Form", "Royal"));

            paths.Add(TrainingPath("beast_strength_evolve", MonsterSpecies.Beast, "strength", 25, "Titan Form", "Titan"));
            paths.Add(TrainingPath("insect_agility_evolve", MonsterSpecies.Insect, "agility", 25, "Swift Form", "Swift"));
            paths.Add(TrainingPath("elemental_int_evolve", MonsterSpecies.Elemental, "intelligence", 25, "Arcane Form", "Arcane"));
            paths.Add(TrainingPath("aquatic_def_evolve", MonsterSpecies.Aquatic, "defense", 25, "Bulwark Form", "Bulwark"));

            paths.Add(ParentComboPath("fusion_beast_dragon", MonsterSpecies.Beast, MonsterSpecies.Dragon, MonsterSpecies.Dragon, "Hybrid Form", "Hybrid"));
            paths.Add(ParentComboPath("fusion_slime_aquatic", MonsterSpecies.Slime, MonsterSpecies.Aquatic, MonsterSpecies.Aquatic, "Tide Form", "Tidal"));
            paths.Add(ParentComboPath("fusion_spirit_undead", MonsterSpecies.Spirit, MonsterSpecies.Undead, MonsterSpecies.Undead, "Shade Form", "Shade"));
            paths.Add(ParentComboPath("fusion_insect_elemental", MonsterSpecies.Insect, MonsterSpecies.Elemental, MonsterSpecies.Elemental, "Storm Form", "Storm"));

            return paths.ToArray();
        }

        private static EvolutionPathEntry LevelPath(
            MonsterSpecies species,
            int level,
            int toStage,
            string displayName,
            float multiplier,
            string suffix)
        {
            string speciesKey = species.ToString().ToLowerInvariant();
            return new EvolutionPathEntry
            {
                pathId = $"{speciesKey}_level_{level}",
                displayName = displayName,
                description = $"Reach level {level} to evolve.",
                speciesFilter = species,
                fromStage = toStage - 1,
                toStage = toStage,
                triggerKind = EvolutionTriggerKind.Level,
                requiredLevel = level,
                statMultiplier = multiplier,
                bonusHp = 6 + toStage * 4,
                bonusAttack = 3 + toStage * 2,
                bonusDefense = 3 + toStage * 2,
                bonusSpeed = 2 + toStage,
                unlockMoveIds = toStage >= 2
                    ? new[] { "power_surge", "war_cry" }
                    : new[] { "gale_strike" },
                evolvedNameSuffix = suffix,
                appearanceOverrides = new[]
                {
                    new EvolutionPartOverrideEntry { slot = MonsterPartSlot.Body, pickFromEvolvedHash = true },
                    new EvolutionPartOverrideEntry { slot = MonsterPartSlot.Head, pickFromEvolvedHash = true },
                    new EvolutionPartOverrideEntry { slot = MonsterPartSlot.PatternOverlay, pickFromEvolvedHash = true }
                }
            };
        }

        private static EvolutionPathEntry ItemPath(
            string pathId,
            MonsterSpecies species,
            string itemId,
            string displayName,
            string suffix)
        {
            return new EvolutionPathEntry
            {
                pathId = pathId,
                displayName = displayName,
                description = $"Use a {itemId.Replace('_', ' ')} to evolve.",
                speciesFilter = species,
                fromStage = 0,
                toStage = 1,
                triggerKind = EvolutionTriggerKind.Item,
                requiredItemId = itemId,
                statMultiplier = 1.18f,
                bonusHp = 10,
                bonusAttack = 6,
                bonusDefense = 5,
                bonusSpeed = 4,
                unlockMoveIds = new[] { "war_cry" },
                evolvedNameSuffix = suffix,
                appearanceOverrides = new[]
                {
                    new EvolutionPartOverrideEntry { slot = MonsterPartSlot.Accessory, pickFromEvolvedHash = true },
                    new EvolutionPartOverrideEntry { slot = MonsterPartSlot.PatternOverlay, pickFromEvolvedHash = true }
                }
            };
        }

        private static EvolutionPathEntry TrainingPath(
            string pathId,
            MonsterSpecies species,
            string focus,
            int count,
            string displayName,
            string suffix)
        {
            return new EvolutionPathEntry
            {
                pathId = pathId,
                displayName = displayName,
                description = $"Complete {count} {focus} training sessions.",
                speciesFilter = species,
                fromStage = 0,
                toStage = 1,
                triggerKind = EvolutionTriggerKind.TrainingFocus,
                requiredTrainingFocus = focus,
                requiredTrainingCount = count,
                statMultiplier = 1.16f,
                bonusHp = 8,
                bonusAttack = focus == "strength" ? 8 : 4,
                bonusDefense = focus == "defense" ? 8 : 4,
                bonusSpeed = focus == "agility" ? 8 : 3,
                unlockMoveIds = new[] { "gale_strike" },
                evolvedNameSuffix = suffix
            };
        }

        private static EvolutionPathEntry ParentComboPath(
            string pathId,
            MonsterSpecies parentA,
            MonsterSpecies parentB,
            MonsterSpecies evolvedSpecies,
            string displayName,
            string suffix)
        {
            return new EvolutionPathEntry
            {
                pathId = pathId,
                displayName = displayName,
                description = $"Fusion-born monster from {parentA} + {parentB} lineages.",
                matchAnySpecies = true,
                fromStage = 0,
                toStage = 1,
                triggerKind = EvolutionTriggerKind.ParentCombination,
                requiredParentSpeciesA = parentA,
                requiredParentSpeciesB = parentB,
                changeSpecies = true,
                evolvedSpecies = evolvedSpecies,
                statMultiplier = 1.22f,
                bonusHp = 12,
                bonusAttack = 7,
                bonusDefense = 6,
                bonusSpeed = 5,
                unlockMoveIds = new[] { "radiant_beam" },
                evolvedNameSuffix = suffix,
                appearanceOverrides = new[]
                {
                    new EvolutionPartOverrideEntry { slot = MonsterPartSlot.Tail, pickFromEvolvedHash = true },
                    new EvolutionPartOverrideEntry { slot = MonsterPartSlot.Eyes, pickFromEvolvedHash = true }
                }
            };
        }
    }
}
