using System;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Ranch;

namespace MonsterCollect.Progression
{
    /// <summary>Trainer rank, XP, ranch slot unlocks, and training type gates.</summary>
    public static class TrainerProgressionService
    {
        public static int TrainerXp => State.trainerXp;
        public static int RankIndex => State.trainerRankIndex;
        public static int RanchCoins => State.ranchCoins;

        public static ProgressionSaveState State => MonsterCollectionService.Progression;

        public static TrainerRankDefinition CurrentRank =>
            ProgressionCatalogRegistry.Ranks.GetRank(State.trainerRankIndex);

        public static TrainerRankDefinition NextRank
        {
            get
            {
                TrainerRankCatalog catalog = ProgressionCatalogRegistry.Ranks;
                return catalog.GetRank(State.trainerRankIndex + 1);
            }
        }

        public static int GetMaxRanchSlots()
        {
            return MonsterCollectionService.BaseMaxMonsters + State.bonusRanchSlots + GetRankSlotBonus();
        }

        public static bool IsTrainingUnlocked(string trainingType)
        {
            if (string.IsNullOrEmpty(trainingType))
            {
                return false;
            }

            string[] types = State.unlockedTrainingTypes ?? Array.Empty<string>();
            for (int i = 0; i < types.Length; i++)
            {
                if (types[i] == trainingType)
                {
                    return true;
                }
            }

            return false;
        }

        public static void AddTrainerXp(int amount)
        {
            if (amount <= 0)
            {
                return;
            }

            State.trainerXp += amount;
            RecalculateRank();
            MonsterCollectionService.SaveProgression();
        }

        public static void AddCoins(int amount)
        {
            if (amount <= 0)
            {
                return;
            }

            State.ranchCoins += amount;
            MonsterCollectionService.SaveProgression();
        }

        public static bool TrySpendCoins(int amount)
        {
            if (amount <= 0 || State.ranchCoins < amount)
            {
                return false;
            }

            State.ranchCoins -= amount;
            MonsterCollectionService.SaveProgression();
            ProgressionEventReporter.ReportCoinsSpent(amount);
            return true;
        }

        public static int GetXpToNextRank()
        {
            TrainerRankDefinition next = NextRank;
            if (next == null)
            {
                return 0;
            }

            return Math.Max(0, next.RequiredXp - State.trainerXp);
        }

        public static float GetRankProgress01()
        {
            TrainerRankDefinition current = CurrentRank;
            TrainerRankDefinition next = NextRank;
            if (next == null || current == null)
            {
                return 1f;
            }

            int span = next.RequiredXp - current.RequiredXp;
            if (span <= 0)
            {
                return 1f;
            }

            return Math.Clamp((State.trainerXp - current.RequiredXp) / (float)span, 0f, 1f);
        }

        public static void AddBonusRanchSlots(int amount)
        {
            if (amount <= 0)
            {
                return;
            }

            State.bonusRanchSlots += amount;
            MonsterCollectionService.SaveProgression();
        }

        private static int GetRankSlotBonus()
        {
            TrainerRankDefinition rank = CurrentRank;
            return rank != null ? rank.BonusRanchSlots : 0;
        }

        private static void RecalculateRank()
        {
            int newIndex = ProgressionCatalogRegistry.Ranks.GetRankIndexForXp(State.trainerXp);
            if (newIndex <= State.trainerRankIndex)
            {
                State.trainerRankIndex = newIndex;
                RanchBiomeService.RefreshUnlocksFromTrainerRank();
                return;
            }

            for (int i = State.trainerRankIndex + 1; i <= newIndex; i++)
            {
                ApplyRankUnlock(i);
            }

            State.trainerRankIndex = newIndex;
            QuestService.NotifyRankReached(newIndex);
            RanchBiomeService.RefreshUnlocksFromTrainerRank();
        }

        private static void ApplyRankUnlock(int rankIndex)
        {
            TrainerRankDefinition rank = ProgressionCatalogRegistry.Ranks.GetRank(rankIndex);
            if (rank == null)
            {
                return;
            }

            if (rank.CoinBonusOnRankUp > 0)
            {
                State.ranchCoins += rank.CoinBonusOnRankUp;
            }

            if (rank.UnlockTrainingTypes != null)
            {
                var list = new System.Collections.Generic.List<string>(State.unlockedTrainingTypes ?? Array.Empty<string>());
                for (int i = 0; i < rank.UnlockTrainingTypes.Length; i++)
                {
                    string type = rank.UnlockTrainingTypes[i];
                    if (!string.IsNullOrEmpty(type) && !list.Contains(type))
                    {
                        list.Add(type);
                    }
                }

                State.unlockedTrainingTypes = list.ToArray();
            }
        }
    }
}
