using System;
using MonsterCollect.Data;

namespace MonsterCollect.Ranch
{
    /// <summary>Ranch-wide progression — care points, facility unlocks.</summary>
    public static class RanchProgressionService
    {
        public static RanchProgressionState State => MonsterCollectionService.RanchProgression;

        public static int CarePoints => State.carePoints;

        public static void AddCarePoints(int amount)
        {
            if (amount <= 0)
            {
                return;
            }

            MonsterCollectionService.AddCarePoints(amount);
            RefreshFacilityUnlocks();
        }

        public static bool IsFacilityUnlocked(string facilityId)
        {
            if (string.IsNullOrEmpty(facilityId) || State.unlockedFacilityIds == null)
            {
                return false;
            }

            for (int i = 0; i < State.unlockedFacilityIds.Length; i++)
            {
                if (State.unlockedFacilityIds[i] == facilityId)
                {
                    return true;
                }
            }

            return false;
        }

        public static void RefreshFacilityUnlocks()
        {
            RanchFacilityDefinition[] facilities = RanchCatalogRegistry.Facilities.Facilities;
            if (facilities == null)
            {
                return;
            }

            int totalWins = MonsterCollectionService.GetTotalBattleWins();
            int dexCount = MonsterCollectionService.UnlockedDexCount;

            for (int i = 0; i < facilities.Length; i++)
            {
                RanchFacilityDefinition facility = facilities[i];
                if (facility == null || IsFacilityUnlocked(facility.FacilityId))
                {
                    continue;
                }

                if (State.carePoints >= facility.RequiredCarePoints &&
                    dexCount >= facility.RequiredDexUnlocks &&
                    totalWins >= facility.RequiredBattleWins)
                {
                    MonsterCollectionService.UnlockFacility(facility.FacilityId);
                }
            }
        }

        public static int GetTotalBattleWins()
        {
            return MonsterCollectionService.GetTotalBattleWins();
        }
    }
}
