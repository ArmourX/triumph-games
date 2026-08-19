using UnityEngine;

namespace MonsterCollect.Ranch
{
    public static class RuntimeCraftingRecipeCatalogFactory
    {
        public static CraftingRecipeCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<CraftingRecipeCatalog>();
            catalog.Recipes = new[]
            {
                Recipe("craft_berry_stew", "Berry Stew", "hearty_stew", 0,
                    Ing("mat_berries", 2), Ing("mat_herbs", 1)),
                Recipe("craft_herbal_tonic", "Herbal Brew", "herbal_tonic", 1,
                    Ing("mat_herbs", 2), Ing("mat_mushroom", 1)),
                Recipe("craft_vitality_soup", "Forest Feast", "vitality_soup", 1,
                    Ing("mat_berries", 2), Ing("mat_mushroom", 1), Ing("mat_reeds", 1)),
                Recipe("craft_care_basket", "Shell Care Basket", "care_treat", 2, essence: 10,
                    Ing("mat_shell", 2), Ing("mat_reeds", 1)),
                Recipe("craft_power_tablet", "Stone Training Tablet", "iron_tablet", 2, essence: 15,
                    Ing("mat_stone", 3), Ing("mat_resin", 1)),
                Recipe("craft_lucky_charm", "Relic Charm", "lucky_bell", 3, essence: 25,
                    Ing("mat_relic", 2), Ing("mat_crystal", 1)),
                Recipe("craft_speed_seed", "Crystal Speed Seed", "speed_seed", 3, essence: 20,
                    Ing("mat_crystal", 2), Ing("mat_resin", 1)),
                Recipe("craft_energy_drink", "Reed Energy Drink", "energy_drink", 0,
                    Ing("mat_reeds", 2), Ing("mat_berries", 1))
            };
            return catalog;
        }

        private static CraftingIngredientEntry Ing(string id, int qty)
        {
            return new CraftingIngredientEntry { itemId = id, quantity = qty };
        }

        private static CraftingRecipeEntry Recipe(
            string id,
            string name,
            string output,
            int rank,
            params CraftingIngredientEntry[] ingredients)
        {
            return Recipe(id, name, output, rank, 0, ingredients);
        }

        private static CraftingRecipeEntry Recipe(
            string id,
            string name,
            string output,
            int rank,
            int essence,
            params CraftingIngredientEntry[] ingredients)
        {
            return new CraftingRecipeEntry
            {
                recipeId = id,
                displayName = name,
                description = $"Craft {output}.",
                outputItemId = output,
                outputQuantity = 1,
                requiredTrainerRankIndex = rank,
                essenceCost = essence,
                ingredients = ingredients
            };
        }
    }
}
