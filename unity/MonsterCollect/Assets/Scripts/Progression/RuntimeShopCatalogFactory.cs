using UnityEngine;

namespace MonsterCollect.Progression
{
    public static class RuntimeShopCatalogFactory
    {
        public static ShopCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<ShopCatalog>();
            catalog.Offers = new[]
            {
                Offer("shop_apple_pack", "Apple Pack (x5)", "apple", 5, 20),
                Offer("shop_care_treat", "Care Treat (x3)", "care_treat", 3, 35),
                Offer("shop_hearty_stew", "Hearty Stew (x2)", "hearty_stew", 2, 45),
                Offer("shop_herbal_tonic", "Herbal Tonic", "herbal_tonic", 1, 55),
                Offer("shop_power_charm", "Power Charm", "power_charm", 1, 80, rank: 1),
                Offer("shop_speed_seed", "Speed Seed", "speed_seed", 1, 80, rank: 1),
                Offer("shop_lucky_bell", "Lucky Bell", "lucky_bell", 1, 100, rank: 2),
                Offer("shop_longevity", "Longevity Pill", "longevity_pill", 1, 120, rank: 3),
                Upgrade("shop_ranch_expand", "Ranch Expansion (+1 slot)", 150, 1, rank: 2),
                Upgrade("shop_ranch_expand_2", "Ranch Expansion II (+1 slot)", 250, 1, rank: 4)
            };
            return catalog;
        }

        private static ShopOfferDefinition Offer(
            string id, string name, string item, int qty, int coins, int rank = 0)
        {
            var o = ScriptableObject.CreateInstance<ShopOfferDefinition>();
            o.OfferId = id;
            o.DisplayName = name;
            o.Description = name;
            o.ItemId = item;
            o.ItemQuantity = qty;
            o.CoinPrice = coins;
            o.RequiredTrainerRank = rank;
            return o;
        }

        private static ShopOfferDefinition Upgrade(string id, string name, int coins, int slots, int rank)
        {
            var o = ScriptableObject.CreateInstance<ShopOfferDefinition>();
            o.OfferId = id;
            o.DisplayName = name;
            o.Description = "Permanently add a ranch slot.";
            o.CoinPrice = coins;
            o.RequiredTrainerRank = rank;
            o.IsRanchUpgrade = true;
            o.RanchSlotBonus = slots;
            return o;
        }
    }
}
