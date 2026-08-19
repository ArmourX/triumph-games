using MonsterCollect.Data;
using MonsterCollect.Progression;

namespace MonsterCollect.Ranch
{
    public static class CraftingService
    {
        public static bool TryCraft(string recipeId, out string message)
        {
            message = string.Empty;
            CraftingRecipeEntry recipe = RanchCatalogRegistry.Crafting.FindById(recipeId);
            if (recipe == null)
            {
                message = "Unknown recipe.";
                return false;
            }

            if (recipe.requiredTrainerRankIndex > TrainerProgressionService.RankIndex)
            {
                message = "Trainer rank too low.";
                return false;
            }

            if (recipe.essenceCost > 0 && MonsterCollectionService.RanchEssence < recipe.essenceCost)
            {
                message = $"Need {recipe.essenceCost} essence.";
                return false;
            }

            if (recipe.ingredients != null)
            {
                for (int i = 0; i < recipe.ingredients.Length; i++)
                {
                    CraftingIngredientEntry ing = recipe.ingredients[i];
                    if (ing == null || string.IsNullOrEmpty(ing.itemId))
                    {
                        continue;
                    }

                    if (!PlayerInventoryService.HasItem(ing.itemId, ing.quantity))
                    {
                        message = $"Need {ing.quantity}x {FormatMaterialName(ing.itemId)}.";
                        return false;
                    }
                }
            }

            if (recipe.essenceCost > 0 && !MonsterCollectionService.TrySpendEssence(recipe.essenceCost))
            {
                message = "Not enough essence.";
                return false;
            }

            if (recipe.ingredients != null)
            {
                for (int i = 0; i < recipe.ingredients.Length; i++)
                {
                    CraftingIngredientEntry ing = recipe.ingredients[i];
                    if (ing == null || string.IsNullOrEmpty(ing.itemId))
                    {
                        continue;
                    }

                    MonsterCollectionService.TryRemoveInventoryItem(ing.itemId, ing.quantity);
                }
            }

            int qty = recipe.outputQuantity > 0 ? recipe.outputQuantity : 1;
            PlayerInventoryService.AddItem(recipe.outputItemId, qty);
            ProgressionEventReporter.ReportCraftComplete(recipe.recipeId);
            message = $"Crafted {qty}x {recipe.outputItemId}!";
            return true;
        }

        private static string FormatMaterialName(string itemId)
        {
            RanchItemDefinition def = PlayerInventoryService.GetDefinition(itemId);
            return def != null ? def.DisplayName : itemId.Replace("mat_", "");
        }
    }
}
