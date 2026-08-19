using UnityEngine;

namespace MonsterCollect.Progression
{
    [CreateAssetMenu(fileName = "ShopOffer", menuName = "Monster Collect/Shop Offer")]
    public class ShopOfferDefinition : ScriptableObject
    {
        public string OfferId = "shop_apple_pack";
        public string DisplayName = "Apple Pack";
        [TextArea] public string Description = "5 crisp apples.";
        public string ItemId = "apple";
        public int ItemQuantity = 5;
        public int CoinPrice;
        public int EssencePrice;
        public int RequiredTrainerRank;
        public bool IsRanchUpgrade;
        public int RanchSlotBonus;
    }

    [CreateAssetMenu(fileName = "ShopCatalog", menuName = "Monster Collect/Shop Catalog")]
    public class ShopCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Progression/ShopCatalog";

        public ShopOfferDefinition[] Offers = System.Array.Empty<ShopOfferDefinition>();

        public ShopOfferDefinition FindById(string offerId)
        {
            if (string.IsNullOrEmpty(offerId) || Offers == null)
            {
                return null;
            }

            for (int i = 0; i < Offers.Length; i++)
            {
                ShopOfferDefinition offer = Offers[i];
                if (offer != null && offer.OfferId == offerId)
                {
                    return offer;
                }
            }

            return null;
        }
    }
}
