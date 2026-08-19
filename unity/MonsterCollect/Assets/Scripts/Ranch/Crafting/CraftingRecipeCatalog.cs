using System;
using UnityEngine;

namespace MonsterCollect.Ranch
{
    [Serializable]
    public class CraftingIngredientEntry
    {
        public string itemId = "mat_berries";
        public int quantity = 1;
    }

    [Serializable]
    public class CraftingRecipeEntry
    {
        public string recipeId = "craft_berry_stew";
        public string displayName = "Berry Stew";
        public string description = "Cook gathered berries into hearty food.";
        public string outputItemId = "hearty_stew";
        public int outputQuantity = 1;
        public CraftingIngredientEntry[] ingredients = Array.Empty<CraftingIngredientEntry>();
        public int essenceCost;
        public int requiredTrainerRankIndex;
    }

    [CreateAssetMenu(fileName = "CraftingRecipeCatalog", menuName = "Monster Collect/Crafting Recipe Catalog")]
    public class CraftingRecipeCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Ranch/CraftingRecipeCatalog";

        public CraftingRecipeEntry[] Recipes = Array.Empty<CraftingRecipeEntry>();

        public CraftingRecipeEntry FindById(string recipeId)
        {
            if (string.IsNullOrEmpty(recipeId) || Recipes == null)
            {
                return null;
            }

            for (int i = 0; i < Recipes.Length; i++)
            {
                CraftingRecipeEntry recipe = Recipes[i];
                if (recipe != null && recipe.recipeId == recipeId)
                {
                    return recipe;
                }
            }

            return null;
        }
    }
}
