using System.Collections.Generic;
using System.Text;
using MonsterCollect.Appearance;
using MonsterCollect.Battle;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using MonsterCollect.Ranch;
using UnityEditor;
using UnityEngine;

namespace MonsterCollect.Editor
{
    /// <summary>Cross-catalog ID validation for content authors.</summary>
    public static class ContentValidationUtility
    {
        public static string ValidateAll()
        {
            var issues = new List<string>();
            ValidateMoveReferences(issues);
            ValidateItemReferences(issues);
            ValidateSpeciesMoveReferences(issues);
            ValidatePartCatalog(issues);

            if (issues.Count == 0)
            {
                return "All content references look good.";
            }

            var builder = new StringBuilder();
            builder.AppendLine($"Found {issues.Count} issue(s):");
            for (int i = 0; i < issues.Count; i++)
            {
                builder.AppendLine($"• {issues[i]}");
            }

            return builder.ToString();
        }

        private static void ValidateMoveReferences(List<string> issues)
        {
            BattleMoveCatalog moveCatalog = AssetDatabase.LoadAssetAtPath<BattleMoveCatalog>("Assets/Resources/Battle/BattleMoveCatalog.asset");
            if (moveCatalog?.Moves == null)
            {
                issues.Add("Battle move catalog missing at Assets/Resources/Battle/BattleMoveCatalog.asset");
                return;
            }

            var moveIds = new HashSet<string> { AttackMove.MoveId, DefendMove.MoveId, SpecialMove.MoveId };
            for (int i = 0; i < moveCatalog.Moves.Length; i++)
            {
                BattleMoveDefinition move = moveCatalog.Moves[i];
                if (move != null && !string.IsNullOrEmpty(move.MoveId))
                {
                    moveIds.Add(move.MoveId);
                }
            }

            ValidateQuestItemAndMoveIds(moveIds, issues);
        }

        private static void ValidateItemReferences(List<string> issues)
        {
            RanchItemCatalog itemCatalog = AssetDatabase.LoadAssetAtPath<RanchItemCatalog>("Assets/Resources/Ranch/RanchItemCatalog.asset");
            if (itemCatalog?.Items == null)
            {
                issues.Add("Ranch item catalog missing at Assets/Resources/Ranch/RanchItemCatalog.asset");
                return;
            }

            var itemIds = new HashSet<string>();
            for (int i = 0; i < itemCatalog.Items.Length; i++)
            {
                RanchItemDefinition item = itemCatalog.Items[i];
                if (item != null && !string.IsNullOrEmpty(item.ItemId))
                {
                    itemIds.Add(item.ItemId);
                }
            }

            QuestCatalog questCatalog = AssetDatabase.LoadAssetAtPath<QuestCatalog>("Assets/Resources/Progression/QuestCatalog.asset");
            if (questCatalog?.Quests != null)
            {
                for (int i = 0; i < questCatalog.Quests.Length; i++)
                {
                    QuestDefinition quest = questCatalog.Quests[i];
                    if (quest != null && !string.IsNullOrEmpty(quest.ItemRewardId) && !itemIds.Contains(quest.ItemRewardId))
                    {
                        issues.Add($"Quest '{quest.QuestId}' references unknown item '{quest.ItemRewardId}'");
                    }
                }
            }

            ShopCatalog shopCatalog = AssetDatabase.LoadAssetAtPath<ShopCatalog>("Assets/Resources/Progression/ShopCatalog.asset");
            if (shopCatalog?.Offers != null)
            {
                for (int i = 0; i < shopCatalog.Offers.Length; i++)
                {
                    ShopOfferDefinition offer = shopCatalog.Offers[i];
                    if (offer != null && !string.IsNullOrEmpty(offer.ItemId) && !itemIds.Contains(offer.ItemId))
                    {
                        issues.Add($"Shop offer '{offer.OfferId}' references unknown item '{offer.ItemId}'");
                    }
                }
            }
        }

        private static void ValidateSpeciesMoveReferences(List<string> issues)
        {
            SpeciesCatalog speciesCatalog = AssetDatabase.LoadAssetAtPath<SpeciesCatalog>("Assets/Resources/Monster/SpeciesCatalog.asset");
            BattleMoveCatalog moveCatalog = AssetDatabase.LoadAssetAtPath<BattleMoveCatalog>("Assets/Resources/Battle/BattleMoveCatalog.asset");
            if (speciesCatalog?.Species == null || moveCatalog?.Moves == null)
            {
                return;
            }

            var moveIds = new HashSet<string>();
            for (int i = 0; i < moveCatalog.Moves.Length; i++)
            {
                BattleMoveDefinition move = moveCatalog.Moves[i];
                if (move != null)
                {
                    moveIds.Add(move.MoveId);
                }
            }

            for (int i = 0; i < speciesCatalog.Species.Length; i++)
            {
                SpeciesDefinition def = speciesCatalog.Species[i];
                if (def == null)
                {
                    continue;
                }

                if (!string.IsNullOrEmpty(def.PrimaryMoveId) && !moveIds.Contains(def.PrimaryMoveId))
                {
                    issues.Add($"Species '{def.Species}' primary move '{def.PrimaryMoveId}' not in move catalog");
                }

                if (!string.IsNullOrEmpty(def.SecondaryMoveId) && !moveIds.Contains(def.SecondaryMoveId))
                {
                    issues.Add($"Species '{def.Species}' secondary move '{def.SecondaryMoveId}' not in move catalog");
                }
            }
        }

        private static void ValidatePartCatalog(List<string> issues)
        {
            MonsterPartCatalog catalog = AssetDatabase.LoadAssetAtPath<MonsterPartCatalog>("Assets/Resources/MonsterAppearance/MonsterPartCatalog.asset");
            if (catalog?.Variants == null)
            {
                issues.Add("Part catalog missing at Assets/Resources/MonsterAppearance/MonsterPartCatalog.asset");
                return;
            }

            var ids = new HashSet<string>();
            for (int i = 0; i < catalog.Variants.Length; i++)
            {
                MonsterPartVariantDefinition variant = catalog.Variants[i];
                if (variant == null || string.IsNullOrEmpty(variant.VariantId))
                {
                    issues.Add("Part catalog contains a null or empty variant id");
                    continue;
                }

                if (!ids.Add(variant.VariantId))
                {
                    issues.Add($"Duplicate part variant id '{variant.VariantId}'");
                }
            }
        }

        private static void ValidateQuestItemAndMoveIds(HashSet<string> moveIds, List<string> issues)
        {
            QuestCatalog questCatalog = AssetDatabase.LoadAssetAtPath<QuestCatalog>("Assets/Resources/Progression/QuestCatalog.asset");
            if (questCatalog?.Quests == null)
            {
                return;
            }

            for (int i = 0; i < questCatalog.Quests.Length; i++)
            {
                QuestDefinition quest = questCatalog.Quests[i];
                if (quest == null || quest.Objective != QuestObjectiveType.WinWithElement)
                {
                    continue;
                }

                if (string.IsNullOrEmpty(quest.ObjectiveParameter))
                {
                    issues.Add($"Quest '{quest.QuestId}' WinWithElement missing element parameter");
                }
            }
        }
    }
}
