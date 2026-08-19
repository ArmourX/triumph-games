using System;
using UnityEngine;

namespace MonsterCollect.Events
{
    public static class RuntimeSeasonalEventCatalogFactory
    {
        public static SeasonalEventCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<SeasonalEventCatalog>();
            catalog.Events = new[]
            {
                CreateSpringFestival(),
                CreateSummerSafari(),
                CreateHalloweenHaunt()
            };
            return catalog;
        }

        private static SeasonalEventDefinition CreateSpringFestival()
        {
            var def = ScriptableObject.CreateInstance<SeasonalEventDefinition>();
            def.EventId = "spring_festival";
            def.DisplayName = "Spring Festival";
            def.Description = "Extra daily scans, cheaper captures, and blossom variants from nature-themed codes.";
            def.Priority = 20;
            def.BannerColor = new Color(0.25f, 0.62f, 0.42f);
            def.ScheduleKind = EventScheduleKind.RecurringAnnual;
            def.AnnualStartMonth = 3;
            def.AnnualStartDay = 15;
            def.AnnualEndMonth = 4;
            def.AnnualEndDay = 7;
            def.DefaultVariantTag = "Blossom";
            def.Modifiers = new[]
            {
                Mod(EventModifierType.ScanLimitBonus, 5f),
                Mod(EventModifierType.ScanEnergyCostMultiplier, 0.75f),
                Mod(EventModifierType.BonusRarityPercent, 8f, "Rare"),
                Mod(EventModifierType.BattleRewardMultiplier, 1.25f)
            };
            def.QrRules = new[]
            {
                Qr("spring_keyword", "keyword", "spring", variant: "Blossom", mul: 1.5f),
                Qr("nature_category", "category", "nature", variant: "Verdant", mul: 1.25f)
            };
            def.EventQuests = new[]
            {
                Quest("spring_scan_10", "Festival Scout", "Scan 10 codes during Spring Festival.", 1, 10, 60, 40),
                Quest("spring_win_5", "Garden Duelist", "Win 5 battles during the festival.", 2, 5, 80, 55)
            };
            def.ExclusiveItemIds = new[] { "lucky_bell" };
            return def;
        }

        private static SeasonalEventDefinition CreateSummerSafari()
        {
            var def = ScriptableObject.CreateInstance<SeasonalEventDefinition>();
            def.EventId = "summer_safari";
            def.DisplayName = "Summer Safari";
            def.Description = "Double battle rewards and safari variants from travel & URL codes.";
            def.Priority = 15;
            def.BannerColor = new Color(0.95f, 0.55f, 0.2f);
            def.ScheduleKind = EventScheduleKind.RecurringAnnual;
            def.AnnualStartMonth = 7;
            def.AnnualStartDay = 1;
            def.AnnualEndMonth = 7;
            def.AnnualEndDay = 31;
            def.DefaultVariantTag = "Safari";
            def.Modifiers = new[]
            {
                Mod(EventModifierType.BattleRewardMultiplier, 2f),
                Mod(EventModifierType.TrainerXpMultiplier, 1.5f),
                Mod(EventModifierType.ExclusiveItemDropChance, 0.08f)
            };
            def.QrRules = new[]
            {
                Qr("travel_keyword", "keyword", "travel", variant: "Safari", mul: 1.5f),
                Qr("triumph_host", "url_host", "triumph.games", variant: "Trailblazer", mul: 1.35f)
            };
            def.EventQuests = new[]
            {
                Quest("summer_win_8", "Safari Champion", "Win 8 battles during Summer Safari.", 2, 8, 120, 80)
            };
            def.ExclusiveMoveIds = new[] { "quick_strike" };
            return def;
        }

        private static SeasonalEventDefinition CreateHalloweenHaunt()
        {
            var def = ScriptableObject.CreateInstance<SeasonalEventDefinition>();
            def.EventId = "halloween_haunt";
            def.DisplayName = "Halloween Haunt";
            def.Description = "Spooky QR keywords boost Epic finds. Limited-time haunted quests.";
            def.Priority = 25;
            def.BannerColor = new Color(0.55f, 0.25f, 0.75f);
            def.ScheduleKind = EventScheduleKind.RecurringAnnual;
            def.AnnualStartMonth = 10;
            def.AnnualStartDay = 20;
            def.AnnualEndMonth = 11;
            def.AnnualEndDay = 2;
            def.DefaultVariantTag = "Haunted";
            def.Modifiers = new[]
            {
                Mod(EventModifierType.BonusRarityPercent, 10f, "Epic"),
                Mod(EventModifierType.BonusRarityPercent, 4f, "Legendary"),
                Mod(EventModifierType.BreedingEssenceDiscount, 15f)
            };
            def.QrRules = new[]
            {
                Qr("spooky_keyword", "keyword", "spooky", variant: "Haunted", mul: 1.5f, rarity: "Epic"),
                Qr("halloween_keyword", "keyword", "halloween", variant: "Pumpkin", mul: 1.75f, rarity: "Rare")
            };
            def.EventQuests = new[]
            {
                Quest("halloween_scan_7", "Trick-or-Scan", "Scan 7 codes during Halloween Haunt.", 1, 7, 70, 45),
                Quest("halloween_qr_bonus", "QR Bonus Hunter", "Trigger 3 event QR bonuses.", 12, 3, 90, 60)
            };
            return def;
        }

        private static EventModifierEntry Mod(EventModifierType type, float value, string stringValue = "")
        {
            return new EventModifierEntry
            {
                modifierType = type,
                value = value,
                stringValue = stringValue
            };
        }

        private static EventQrRuleEntry Qr(
            string ruleId,
            string kind,
            string value,
            string variant = "",
            float mul = 1f,
            string rarity = "")
        {
            return new EventQrRuleEntry
            {
                ruleId = ruleId,
                matchKind = kind,
                matchValue = value,
                variantTag = variant,
                bonusMultiplier = mul,
                bonusRarity = rarity
            };
        }

        private static EventQuestEntry Quest(
            string id,
            string name,
            string desc,
            int objectiveType,
            int target,
            int coins,
            int xp,
            string item = "",
            int itemQty = 1)
        {
            return new EventQuestEntry
            {
                questId = id,
                displayName = name,
                description = desc,
                objectiveType = objectiveType,
                targetCount = target,
                coinReward = coins,
                trainerXpReward = xp,
                itemRewardId = item,
                itemRewardQuantity = itemQty
            };
        }
    }
}
