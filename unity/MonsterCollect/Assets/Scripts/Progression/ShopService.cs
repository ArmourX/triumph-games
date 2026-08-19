using MonsterCollect.Data;
using MonsterCollect.Ranch;

namespace MonsterCollect.Progression
{
    public readonly struct ShopPurchaseResult
    {
        public bool Success { get; }
        public string Message { get; }

        public ShopPurchaseResult(bool success, string message)
        {
            Success = success;
            Message = message;
        }
    }

    /// <summary>Ranch coin shop for items and slot upgrades.</summary>
    public static class ShopService
    {
        public static ShopPurchaseResult TryPurchase(string offerId)
        {
            ShopOfferDefinition offer = ProgressionCatalogRegistry.Shop.FindById(offerId);
            if (offer == null)
            {
                return new ShopPurchaseResult(false, "Unknown offer.");
            }

            if (TrainerProgressionService.RankIndex < offer.RequiredTrainerRank)
            {
                return new ShopPurchaseResult(false, "Trainer rank too low.");
            }

            if (offer.CoinPrice > 0 && TrainerProgressionService.RanchCoins < offer.CoinPrice)
            {
                return new ShopPurchaseResult(false, "Not enough ranch coins.");
            }

            if (offer.EssencePrice > 0 && MonsterCollectionService.RanchEssence < offer.EssencePrice)
            {
                return new ShopPurchaseResult(false, "Not enough essence.");
            }

            if (offer.IsRanchUpgrade && offer.RanchSlotBonus <= 0)
            {
                return new ShopPurchaseResult(false, "Invalid upgrade.");
            }

            if (offer.CoinPrice > 0 && !TrainerProgressionService.TrySpendCoins(offer.CoinPrice))
            {
                return new ShopPurchaseResult(false, "Could not spend coins.");
            }

            if (offer.EssencePrice > 0 && !MonsterCollectionService.TrySpendEssence(offer.EssencePrice))
            {
                return new ShopPurchaseResult(false, "Could not spend essence.");
            }

            if (offer.IsRanchUpgrade)
            {
                TrainerProgressionService.AddBonusRanchSlots(offer.RanchSlotBonus);
            }
            else if (!string.IsNullOrEmpty(offer.ItemId) && offer.ItemQuantity > 0)
            {
                PlayerInventoryService.AddItem(offer.ItemId, offer.ItemQuantity);
            }

            MonsterCollectionService.NotifyCollectionChanged();
            return new ShopPurchaseResult(true, $"Purchased {offer.DisplayName}.");
        }
    }
}
