using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using MonsterCollect.Appearance;
using MonsterCollect.Data;
using MonsterCollect.Progression;
using MonsterCollect.Ranch;
using UnityEngine;

namespace MonsterCollect.Monster
{
    public readonly struct EvolutionEligibility
    {
        public EvolutionEligibility(EvolutionPathEntry path, bool isEligible, string reason)
        {
            Path = path;
            IsEligible = isEligible;
            Reason = reason ?? string.Empty;
        }

        public EvolutionPathEntry Path { get; }
        public bool IsEligible { get; }
        public string Reason { get; }
    }

    public static class MonsterEvolutionService
    {
        public static EvolutionCatalog Catalog => GameContentRegistry.Evolution;

        public static string GetBaseFormHash(MonsterData monster)
        {
            if (monster == null)
            {
                return string.Empty;
            }

            return string.IsNullOrEmpty(monster.BaseFormHash) ? monster.FullHash : monster.BaseFormHash;
        }

        public static string GetBreedingIdentityHash(MonsterData monster)
        {
            return GetBaseFormHash(monster);
        }

        public static byte[] GetAppearanceHashBytes(MonsterData monster)
        {
            if (monster == null || monster.EvolutionStage <= 0)
            {
                return MonsterHashUtility.GetHashBytes(monster);
            }

            return ComputeEvolutionHashBytes(monster, monster.EvolutionPathId, monster.EvolutionStage);
        }

        public static byte[] ComputeEvolutionHashBytes(MonsterData monster, string pathId, int stage)
        {
            string baseHash = GetBaseFormHash(monster);
            string payload = $"evolve|{baseHash}|{pathId}|{stage}";
            using SHA256 sha = SHA256.Create();
            return sha.ComputeHash(Encoding.UTF8.GetBytes(payload));
        }

        public static IReadOnlyList<EvolutionEligibility> GetEligiblePaths(MonsterData monster)
        {
            var results = new List<EvolutionEligibility>();
            if (monster == null || Catalog?.Paths == null)
            {
                return results;
            }

            MonsterRaisingService.EnsureRaisingState(monster);
            for (int i = 0; i < Catalog.Paths.Length; i++)
            {
                EvolutionPathEntry path = Catalog.Paths[i];
                if (path == null)
                {
                    continue;
                }

                bool eligible = IsPathEligible(monster, path, out string reason);
                results.Add(new EvolutionEligibility(path, eligible, reason));
            }

            return results;
        }

        public static EvolutionPathEntry GetNextRecommendedPath(MonsterData monster)
        {
            IReadOnlyList<EvolutionEligibility> paths = GetEligiblePaths(monster);
            for (int i = 0; i < paths.Count; i++)
            {
                if (paths[i].IsEligible)
                {
                    return paths[i].Path;
                }
            }

            return null;
        }

        public static MonsterData GeneratePreview(MonsterData monster, string pathId)
        {
            if (monster == null)
            {
                return null;
            }

            EvolutionPathEntry path = Catalog.FindById(pathId);
            if (path == null)
            {
                return null;
            }

            MonsterData preview = CloneMonster(monster);
            ApplyEvolution(preview, path, persist: false);
            return preview;
        }

        public static bool TryEvolve(MonsterData monster, string pathId, out string message)
        {
            message = string.Empty;
            if (monster == null)
            {
                message = "Invalid monster.";
                return false;
            }

            EvolutionPathEntry path = Catalog.FindById(pathId);
            if (path == null)
            {
                message = "Unknown evolution path.";
                return false;
            }

            if (!IsPathEligible(monster, path, out message))
            {
                return false;
            }

            if (path.triggerKind == EvolutionTriggerKind.Item &&
                !string.IsNullOrEmpty(path.requiredItemId) &&
                !MonsterCollectionService.TryRemoveInventoryItem(path.requiredItemId, 1))
            {
                message = $"Need {path.requiredItemId.Replace('_', ' ')} in inventory.";
                return false;
            }

            ApplyEvolution(monster, path, persist: true);
            MonsterCollectionService.UpdateMonster(monster);
            ProgressionEventReporter.ReportMonsterEvolved(monster, path);
            message = $"{monster.GetDisplayName()} evolved into {path.displayName}!";
            return true;
        }

        public static void EnsureIdentityFields(MonsterData monster)
        {
            if (monster == null)
            {
                return;
            }

            if (string.IsNullOrEmpty(monster.BaseFormHash))
            {
                monster.BaseFormHash = monster.FullHash;
            }

            if (monster.Customization == null)
            {
                monster.Customization = MonsterCustomizationState.CreateDefault();
            }

            MonsterRaisingService.EnsureRaisingState(monster);
        }

        private static void ApplyEvolution(MonsterData monster, EvolutionPathEntry path, bool persist)
        {
            EnsureIdentityFields(monster);

            monster.EvolutionStage = path.toStage;
            monster.EvolutionPathId = path.pathId;

            if (path.changeSpecies)
            {
                monster.Species = path.evolvedSpecies;
            }

            ApplyStatGrowth(monster, path);

            if (path.evolvedDexOffset != 0)
            {
                monster.DexNumber = Mathf.Clamp(monster.DexNumber + path.evolvedDexOffset, 1, DexCatalog.TotalEntries);
            }

            if (monster.Customization == null || !monster.Customization.HasCustomName)
            {
                string baseName = StripEvolutionSuffix(monster.Name);
                monster.Name = string.IsNullOrEmpty(path.evolvedNameSuffix)
                    ? baseName
                    : $"{baseName} {path.evolvedNameSuffix}";
            }

            monster.AppearanceSelection = BuildEvolvedAppearance(monster, path);
            MergeUnlockedMoves(monster, path.unlockMoveIds);

            if (persist)
            {
                MonsterBookService.RecordEvolutionDiscovery(monster);
            }
        }

        public static MonsterAppearanceSelection BuildEvolvedAppearance(MonsterData monster, EvolutionPathEntry path)
        {
            byte[] hash = ComputeEvolutionHashBytes(monster, path.pathId, path.toStage);
            MonsterPartCatalog partCatalog = MonsterAppearanceResolver.Catalog;
            var selection = new MonsterAppearanceSelection();

            selection.SetVariantId(MonsterPartSlot.Body, PickVariant(partCatalog, MonsterPartSlot.Body, hash[0]));
            selection.SetVariantId(MonsterPartSlot.Head, PickVariant(partCatalog, MonsterPartSlot.Head, hash[1]));
            selection.SetVariantId(MonsterPartSlot.ArmsLegs, PickVariant(partCatalog, MonsterPartSlot.ArmsLegs, hash[2]));
            selection.SetVariantId(MonsterPartSlot.Tail, PickVariant(partCatalog, MonsterPartSlot.Tail, hash[3]));
            selection.SetVariantId(MonsterPartSlot.Eyes, PickVariant(partCatalog, MonsterPartSlot.Eyes, hash[4]));
            selection.SetVariantId(MonsterPartSlot.PatternOverlay, PickVariant(partCatalog, MonsterPartSlot.PatternOverlay, hash[5]));
            selection.SetVariantId(MonsterPartSlot.Accessory, PickVariant(partCatalog, MonsterPartSlot.Accessory, hash[6]));

            ApplyAppearanceOverrides(selection, path, hash, partCatalog);
            ApplyCustomizationAccessory(monster, selection);
            return selection;
        }

        private static void ApplyAppearanceOverrides(
            MonsterAppearanceSelection selection,
            EvolutionPathEntry path,
            byte[] hash,
            MonsterPartCatalog catalog)
        {
            if (path?.appearanceOverrides == null)
            {
                return;
            }

            for (int i = 0; i < path.appearanceOverrides.Length; i++)
            {
                EvolutionPartOverrideEntry entry = path.appearanceOverrides[i];
                if (entry == null)
                {
                    continue;
                }

                if (!string.IsNullOrEmpty(entry.variantId))
                {
                    selection.SetVariantId(entry.slot, entry.variantId);
                    continue;
                }

                if (entry.pickFromEvolvedHash)
                {
                    int byteIndex = SlotToHashIndex(entry.slot);
                    selection.SetVariantId(entry.slot, PickVariant(catalog, entry.slot, hash[byteIndex]));
                }
            }
        }

        private static void ApplyCustomizationAccessory(MonsterData monster, MonsterAppearanceSelection selection)
        {
            if (monster?.Customization == null ||
                string.IsNullOrEmpty(monster.Customization.equippedAccessoryVariantId))
            {
                return;
            }

            selection.SetVariantId(MonsterPartSlot.Accessory, monster.Customization.equippedAccessoryVariantId);
        }

        private static int SlotToHashIndex(MonsterPartSlot slot)
        {
            return slot switch
            {
                MonsterPartSlot.Body => 0,
                MonsterPartSlot.Head => 1,
                MonsterPartSlot.ArmsLegs => 2,
                MonsterPartSlot.Tail => 3,
                MonsterPartSlot.Eyes => 4,
                MonsterPartSlot.PatternOverlay => 5,
                MonsterPartSlot.Accessory => 6,
                _ => 0
            };
        }

        private static string PickVariant(MonsterPartCatalog catalog, MonsterPartSlot slot, byte hashByte)
        {
            var variants = catalog.GetVariantsForSlot(slot);
            if (variants == null || variants.Count == 0)
            {
                return null;
            }

            int index = hashByte % variants.Count;
            return variants[index]?.VariantId;
        }

        private static void ApplyStatGrowth(MonsterData monster, EvolutionPathEntry path)
        {
            float multiplier = Mathf.Max(1f, path.statMultiplier);
            monster.Hp = Mathf.RoundToInt(monster.Hp * multiplier) + path.bonusHp;
            monster.Attack = Mathf.RoundToInt(monster.Attack * multiplier) + path.bonusAttack;
            monster.Defense = Mathf.RoundToInt(monster.Defense * multiplier) + path.bonusDefense;
            monster.Speed = Mathf.RoundToInt(monster.Speed * multiplier) + path.bonusSpeed;
        }

        private static void MergeUnlockedMoves(MonsterData monster, string[] unlockMoveIds)
        {
            if (unlockMoveIds == null || unlockMoveIds.Length == 0)
            {
                return;
            }

            MonsterRaisingService.EnsureRaisingState(monster);
            var list = new List<string>(monster.Raising.learnedMoveIds ?? Array.Empty<string>());
            for (int i = 0; i < unlockMoveIds.Length; i++)
            {
                string moveId = unlockMoveIds[i];
                if (!string.IsNullOrEmpty(moveId) && !list.Contains(moveId))
                {
                    list.Add(moveId);
                }
            }

            monster.Raising.learnedMoveIds = list.ToArray();
        }

        private static bool IsPathEligible(MonsterData monster, EvolutionPathEntry path, out string reason)
        {
            reason = string.Empty;
            EnsureIdentityFields(monster);

            if (monster.EvolutionStage != path.fromStage)
            {
                reason = monster.EvolutionStage >= path.toStage ? "Already evolved." : "Requires prior evolution stage.";
                return false;
            }

            if (!path.matchAnySpecies && path.speciesFilter != monster.Species)
            {
                reason = $"Only {path.speciesFilter} species can use this path.";
                return false;
            }

            switch (path.triggerKind)
            {
                case EvolutionTriggerKind.Level:
                    if (monster.Raising.level < path.requiredLevel)
                    {
                        reason = $"Reach level {path.requiredLevel} (currently {monster.Raising.level}).";
                        return false;
                    }

                    return true;

                case EvolutionTriggerKind.Item:
                    if (string.IsNullOrEmpty(path.requiredItemId))
                    {
                        reason = "Missing item requirement.";
                        return false;
                    }

                    if (!PlayerInventoryService.HasItem(path.requiredItemId, 1))
                    {
                        reason = $"Need {path.requiredItemId.Replace('_', ' ')}.";
                        return false;
                    }

                    return true;

                case EvolutionTriggerKind.TrainingFocus:
                    int count = GetTrainingCount(monster, path.requiredTrainingFocus);
                    if (count < path.requiredTrainingCount)
                    {
                        reason = $"{path.requiredTrainingFocus} training {count}/{path.requiredTrainingCount}.";
                        return false;
                    }

                    return true;

                case EvolutionTriggerKind.ParentCombination:
                    if (!monster.IsBred)
                    {
                        reason = "Must be a fusion-born monster.";
                        return false;
                    }

                    if (!MatchesParentCombination(monster, path))
                    {
                        reason = $"Requires {path.requiredParentSpeciesA} + {path.requiredParentSpeciesB} fusion lineage.";
                        return false;
                    }

                    return true;

                default:
                    reason = "Unsupported trigger.";
                    return false;
            }
        }

        private static bool MatchesParentCombination(MonsterData monster, EvolutionPathEntry path)
        {
            MonsterData parentA = MonsterCollectionService.FindById(monster.ParentAId);
            MonsterData parentB = MonsterCollectionService.FindById(monster.ParentBId);
            if (parentA == null || parentB == null)
            {
                return false;
            }

            bool forward = parentA.Species == path.requiredParentSpeciesA &&
                           parentB.Species == path.requiredParentSpeciesB;
            bool reverse = parentA.Species == path.requiredParentSpeciesB &&
                           parentB.Species == path.requiredParentSpeciesA;
            return forward || reverse;
        }

        private static int GetTrainingCount(MonsterData monster, string focus)
        {
            MonsterRaisingService.EnsureRaisingState(monster);
            MonsterRaisingState state = monster.Raising;
            if (string.IsNullOrEmpty(focus))
            {
                return 0;
            }

            switch (focus.Trim().ToLowerInvariant())
            {
                case "strength":
                    return state.totalStrengthTrainings;
                case "agility":
                    return state.totalAgilityTrainings;
                case "intelligence":
                    return state.totalIntelligenceTrainings;
                case "defense":
                    return state.totalDefenseTrainings;
                default:
                    return 0;
            }
        }

        private static string StripEvolutionSuffix(string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return name;
            }

            int space = name.LastIndexOf(' ');
            if (space <= 0)
            {
                return name;
            }

            return name.Substring(0, space);
        }

        private static MonsterData CloneMonster(MonsterData source)
        {
            string json = JsonUtility.ToJson(source);
            return JsonUtility.FromJson<MonsterData>(json);
        }
    }
}
