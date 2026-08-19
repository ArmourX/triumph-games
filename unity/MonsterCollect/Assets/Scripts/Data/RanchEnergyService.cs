using System;
using MonsterCollect.Core.RemoteConfig;

namespace MonsterCollect.Data
{
    /// <summary>
    /// Daily ranch energy pool. Players receive <see cref="DailyMax"/> energy per local calendar day;
    /// the pool refills to full at local midnight.
    /// </summary>
    public static class RanchEnergyService
    {
        public const int DailyMax = 200;
        public const int BaseScanCost = 10;
        public const int BaseBreedCost = 50;
        public const int BaseBattleCost = 20;

        public static int ScanCost => RemoteConfigService.GetScanCost(BaseScanCost);
        public static int BreedCost => BaseBreedCost;
        public static int BattleCost => RemoteConfigService.GetBattleCost(BaseBattleCost);
        public static int Current
        {
            get
            {
                EnsureDailyReset();
                return MonsterCollectionService.DailyEnergy;
            }
        }

        public static bool CanAfford(int cost, out string message)
        {
            EnsureDailyReset();

            if (cost <= 0)
            {
                message = null;
                return true;
            }

            if (MonsterCollectionService.DailyEnergy < cost)
            {
                message =
                    $"Not enough daily energy ({MonsterCollectionService.DailyEnergy}/{DailyMax}). " +
                    "Resets at midnight.";
                return false;
            }

            message = null;
            return true;
        }

        public static bool TrySpend(int cost, out string message)
        {
            if (!CanAfford(cost, out message))
            {
                return false;
            }

            MonsterCollectionService.SpendDailyEnergy(cost);
            return true;
        }

        public static void EnsureDailyReset()
        {
            string today = GetLocalDayKey();

            if (MonsterCollectionService.LastEnergyDayKey == today)
            {
                return;
            }

            MonsterCollectionService.ResetDailyEnergy(today);
        }

        public static string GetLocalDayKey()
        {
            return DateTime.Now.ToString("yyyy-MM-dd");
        }
    }
}
