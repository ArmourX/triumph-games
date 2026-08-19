using System.Collections.Generic;
using MonsterCollect.Monster;

namespace MonsterCollect.Events
{
    public readonly struct EventModifierSnapshot
    {
        public float BattleRewardMultiplier { get; }
        public float TrainerXpMultiplier { get; }
        public int ScanLimitBonus { get; }
        public float ScanEnergyCostMultiplier { get; }
        public float BonusCommonPercent { get; }
        public float BonusUncommonPercent { get; }
        public float BonusRarePercent { get; }
        public float BonusEpicPercent { get; }
        public float BonusLegendaryPercent { get; }
        public int BreedingEssenceDiscount { get; }
        public float ExclusiveItemDropChance { get; }
        public HashSet<string> ExclusiveMoveIds { get; }
        public HashSet<string> ExclusiveItemIds { get; }

        public EventModifierSnapshot(
            float battleRewardMultiplier,
            float trainerXpMultiplier,
            int scanLimitBonus,
            float scanEnergyCostMultiplier,
            float bonusCommonPercent,
            float bonusUncommonPercent,
            float bonusRarePercent,
            float bonusEpicPercent,
            float bonusLegendaryPercent,
            int breedingEssenceDiscount,
            float exclusiveItemDropChance,
            HashSet<string> exclusiveMoveIds,
            HashSet<string> exclusiveItemIds)
        {
            BattleRewardMultiplier = battleRewardMultiplier;
            TrainerXpMultiplier = trainerXpMultiplier;
            ScanLimitBonus = scanLimitBonus;
            ScanEnergyCostMultiplier = scanEnergyCostMultiplier;
            BonusCommonPercent = bonusCommonPercent;
            BonusUncommonPercent = bonusUncommonPercent;
            BonusRarePercent = bonusRarePercent;
            BonusEpicPercent = bonusEpicPercent;
            BonusLegendaryPercent = bonusLegendaryPercent;
            BreedingEssenceDiscount = breedingEssenceDiscount;
            ExclusiveItemDropChance = exclusiveItemDropChance;
            ExclusiveMoveIds = exclusiveMoveIds ?? new HashSet<string>();
            ExclusiveItemIds = exclusiveItemIds ?? new HashSet<string>();
        }

        public static EventModifierSnapshot Identity => new EventModifierSnapshot(
            1f,
            1f,
            0,
            1f,
            0f,
            0f,
            0f,
            0f,
            0f,
            0,
            0f,
            new HashSet<string>(),
            new HashSet<string>());

        public float GetRarityBoost(MonsterRarity rarity)
        {
            return rarity switch
            {
                MonsterRarity.Common => BonusCommonPercent,
                MonsterRarity.Uncommon => BonusUncommonPercent,
                MonsterRarity.Rare => BonusRarePercent,
                MonsterRarity.Epic => BonusEpicPercent,
                MonsterRarity.Legendary => BonusLegendaryPercent,
                _ => 0f
            };
        }
    }

    public static class EventModifierAggregator
    {
        public static EventModifierSnapshot Combine(IReadOnlyList<SeasonalEventDefinition> activeEvents)
        {
            if (activeEvents == null || activeEvents.Count == 0)
            {
                return EventModifierSnapshot.Identity;
            }

            float battleMul = 1f;
            float xpMul = 1f;
            float energyMul = 1f;
            int scanBonus = 0;
            int essenceDiscount = 0;
            float itemDrop = 0f;
            float common = 0f;
            float uncommon = 0f;
            float rare = 0f;
            float epic = 0f;
            float legendary = 0f;

            var exclusiveMoves = new HashSet<string>();
            var exclusiveItems = new HashSet<string>();

            for (int e = 0; e < activeEvents.Count; e++)
            {
                SeasonalEventDefinition def = activeEvents[e];
                if (def == null)
                {
                    continue;
                }

                MergeExclusiveIds(exclusiveMoves, def.ExclusiveMoveIds);
                MergeExclusiveIds(exclusiveItems, def.ExclusiveItemIds);

                if (def.Modifiers == null)
                {
                    continue;
                }

                for (int i = 0; i < def.Modifiers.Length; i++)
                {
                    EventModifierEntry mod = def.Modifiers[i];
                    if (mod == null)
                    {
                        continue;
                    }

                    switch (mod.modifierType)
                    {
                        case EventModifierType.BattleRewardMultiplier:
                            battleMul *= mod.value > 0f ? mod.value : 1f;
                            break;
                        case EventModifierType.TrainerXpMultiplier:
                            xpMul *= mod.value > 0f ? mod.value : 1f;
                            break;
                        case EventModifierType.ScanLimitBonus:
                            scanBonus += (int)mod.value;
                            break;
                        case EventModifierType.ScanEnergyCostMultiplier:
                            energyMul *= mod.value > 0f ? mod.value : 1f;
                            break;
                        case EventModifierType.BonusRarityPercent:
                            ApplyRarityBonus(mod.stringValue, mod.value, ref common, ref uncommon, ref rare, ref epic, ref legendary);
                            break;
                        case EventModifierType.BreedingEssenceDiscount:
                            essenceDiscount += (int)mod.value;
                            break;
                        case EventModifierType.ExclusiveItemDropChance:
                            itemDrop += mod.value;
                            break;
                    }
                }
            }

            return new EventModifierSnapshot(
                battleMul,
                xpMul,
                scanBonus,
                energyMul,
                common,
                uncommon,
                rare,
                epic,
                legendary,
                essenceDiscount,
                itemDrop,
                exclusiveMoves,
                exclusiveItems);
        }

        private static void ApplyRarityBonus(
            string rarityName,
            float value,
            ref float common,
            ref float uncommon,
            ref float rare,
            ref float epic,
            ref float legendary)
        {
            if (string.IsNullOrWhiteSpace(rarityName))
            {
                rare += value;
                return;
            }

            switch (rarityName.Trim().ToLowerInvariant())
            {
                case "common":
                    common += value;
                    break;
                case "uncommon":
                    uncommon += value;
                    break;
                case "rare":
                    rare += value;
                    break;
                case "epic":
                    epic += value;
                    break;
                case "legendary":
                    legendary += value;
                    break;
                default:
                    rare += value;
                    break;
            }
        }

        private static void MergeExclusiveIds(HashSet<string> target, string[] ids)
        {
            if (target == null || ids == null)
            {
                return;
            }

            for (int i = 0; i < ids.Length; i++)
            {
                if (!string.IsNullOrWhiteSpace(ids[i]))
                {
                    target.Add(ids[i]);
                }
            }
        }
    }
}
