using MonsterCollect.Data;
using MonsterCollect.Progression;
using MonsterCollect.Social;
using UnityEngine;

namespace MonsterCollect.Monster
{
    public static class MonsterCustomizationService
    {
        public const int RenameCoinCost = 25;
        public const float MaxHueShift = 0.08f;
        public const float MaxSaturationShift = 0.12f;

        private static readonly string[] DefaultAccessoryUnlocks =
        {
            "acc_horn",
            "acc_wings",
            "acc_crown",
            "acc_none"
        };

        public static bool TryRename(MonsterData monster, string newName, out string message)
        {
            message = string.Empty;
            if (monster == null)
            {
                message = "Invalid monster.";
                return false;
            }

            newName = newName?.Trim();
            if (string.IsNullOrEmpty(newName) || newName.Length > 24)
            {
                message = "Name must be 1–24 characters.";
                return false;
            }

            MonsterEvolutionService.EnsureIdentityFields(monster);
            if (!TrainerProgressionService.TrySpendCoins(RenameCoinCost))
            {
                message = $"Renaming costs {RenameCoinCost} ranch coins.";
                return false;
            }

            monster.Customization.customDisplayName = newName;
            MonsterCollectionService.UpdateMonster(monster);
            message = "Name updated.";
            return true;
        }

        public static bool TryApplyColorShift(
            MonsterData monster,
            float primaryHue,
            float secondaryHue,
            float primarySaturation,
            float secondarySaturation,
            out string message)
        {
            message = string.Empty;
            if (monster == null)
            {
                message = "Invalid monster.";
                return false;
            }

            MonsterEvolutionService.EnsureIdentityFields(monster);
            monster.Customization.primaryHueShift = Mathf.Clamp(primaryHue, -MaxHueShift, MaxHueShift);
            monster.Customization.secondaryHueShift = Mathf.Clamp(secondaryHue, -MaxHueShift, MaxHueShift);
            monster.Customization.primarySaturationShift = Mathf.Clamp(primarySaturation, -MaxSaturationShift, MaxSaturationShift);
            monster.Customization.secondarySaturationShift = Mathf.Clamp(secondarySaturation, -MaxSaturationShift, MaxSaturationShift);
            monster.AppearanceSelection = null;
            MonsterCollectionService.UpdateMonster(monster);
            MonsterCollect.Appearance.MonsterAppearanceCompositor.ClearCache();
            message = "Colors updated.";
            return true;
        }

        public static bool TryUnlockAccessory(MonsterData monster, string accessoryVariantId, out string message)
        {
            message = string.Empty;
            if (monster == null || string.IsNullOrEmpty(accessoryVariantId))
            {
                message = "Invalid accessory.";
                return false;
            }

            MonsterEvolutionService.EnsureIdentityFields(monster);
            if (HasAccessoryUnlocked(monster, accessoryVariantId))
            {
                message = "Already unlocked.";
                return false;
            }

            var list = new System.Collections.Generic.List<string>(monster.Customization.unlockedAccessoryIds ?? System.Array.Empty<string>())
            {
                accessoryVariantId
            };
            monster.Customization.unlockedAccessoryIds = list.ToArray();
            MonsterCollectionService.UpdateMonster(monster);
            message = "Accessory unlocked.";
            return true;
        }

        public static bool TryEquipAccessory(MonsterData monster, string accessoryVariantId, out string message)
        {
            message = string.Empty;
            if (monster == null)
            {
                message = "Invalid monster.";
                return false;
            }

            MonsterEvolutionService.EnsureIdentityFields(monster);
            if (!string.IsNullOrEmpty(accessoryVariantId) &&
                !HasAccessoryUnlocked(monster, accessoryVariantId) &&
                !CommunityPartModService.IsLoadedMod(accessoryVariantId))
            {
                message = "Accessory not unlocked for this monster.";
                return false;
            }

            monster.Customization.equippedAccessoryVariantId = accessoryVariantId ?? string.Empty;
            monster.AppearanceSelection = null;
            MonsterCollectionService.UpdateMonster(monster);
            MonsterCollect.Appearance.MonsterAppearanceCompositor.ClearCache();
            message = string.IsNullOrEmpty(accessoryVariantId) ? "Accessory removed." : "Accessory equipped.";
            return true;
        }

        public static bool TryUnlockAccessoryFromItem(MonsterData monster, string itemId, out string message)
        {
            string accessoryId = MapItemToAccessory(itemId);
            if (string.IsNullOrEmpty(accessoryId))
            {
                message = "This item cannot unlock accessories.";
                return false;
            }

            if (!MonsterCollectionService.TryRemoveInventoryItem(itemId, 1))
            {
                message = "Item not in inventory.";
                return false;
            }

            return TryUnlockAccessory(monster, accessoryId, out message);
        }

        public static bool HasAccessoryUnlocked(MonsterData monster, string accessoryVariantId)
        {
            if (CommunityPartModService.IsLoadedMod(accessoryVariantId))
            {
                return true;
            }

            if (monster?.Customization?.unlockedAccessoryIds == null)
            {
                return false;
            }

            for (int i = 0; i < monster.Customization.unlockedAccessoryIds.Length; i++)
            {
                if (monster.Customization.unlockedAccessoryIds[i] == accessoryVariantId)
                {
                    return true;
                }
            }

            return false;
        }

        public static string[] GetDefaultAccessoryOptions()
        {
            return DefaultAccessoryUnlocks;
        }

        private static string MapItemToAccessory(string itemId)
        {
            if (string.IsNullOrEmpty(itemId))
            {
                return null;
            }

            return itemId switch
            {
                "power_charm" => "acc_horn",
                "lucky_bell" => "acc_crown",
                "speed_seed" => "acc_wings",
                "care_treat" => "acc_horn",
                _ => null
            };
        }
    }
}
