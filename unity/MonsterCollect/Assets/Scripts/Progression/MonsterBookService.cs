using System;
using System.Collections.Generic;
using MonsterCollect.Battle;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Ranch;

namespace MonsterCollect.Progression
{
    /// <summary>Monster Book — dex entries, variant tracking, completion rewards.</summary>
    public static class MonsterBookService
    {
        public static int DiscoveredDexCount => MonsterCollectionService.UnlockedDexCount;

        public static int TotalDexEntries => DexCatalog.TotalEntries;

        public static int VariantCount
        {
            get
            {
                ProgressionSaveState state = TrainerProgressionService.State;
                return state.discoveredVariantHashes?.Length ?? 0;
            }
        }

        public static float GetCompletionRatio()
        {
            if (TotalDexEntries <= 0)
            {
                return 0f;
            }

            return DiscoveredDexCount / (float)TotalDexEntries;
        }

        public static void RecordMonsterDiscovery(MonsterData monster, bool isNewDexEntry)
        {
            if (monster == null)
            {
                return;
            }

            ProgressionSaveState state = TrainerProgressionService.State;

            if (!string.IsNullOrEmpty(monster.FullHash))
            {
                RegisterVariantHash(state, monster.FullHash);
            }

            if (monster.EvolutionStage > 0)
            {
                RegisterEvolutionForm(state, monster.DexNumber, monster.EvolutionStage);
            }

            MonsterCollectionService.SaveProgression();

            if (isNewDexEntry)
            {
                QuestService.NotifyDexDiscovered(DiscoveredDexCount);
            }
        }

        public static bool IsRewardClaimed(string rewardId)
        {
            string[] claimed = TrainerProgressionService.State.claimedBookRewardIds ?? Array.Empty<string>();
            for (int i = 0; i < claimed.Length; i++)
            {
                if (claimed[i] == rewardId)
                {
                    return true;
                }
            }

            return false;
        }

        public static bool IsRewardAvailable(MonsterBookRewardDefinition reward)
        {
            if (reward == null || IsRewardClaimed(reward.RewardId))
            {
                return false;
            }

            if (reward.RequiredDiscoveredCount > 0 && DiscoveredDexCount < reward.RequiredDiscoveredCount)
            {
                return false;
            }

            return GetCompletionRatio() >= reward.RequiredCompletionRatio;
        }

        public static bool TryClaimReward(string rewardId, out string message)
        {
            MonsterBookRewardDefinition reward = ProgressionCatalogRegistry.BookRewards.FindById(rewardId);
            if (reward == null)
            {
                message = "Unknown reward.";
                return false;
            }

            if (IsRewardClaimed(rewardId))
            {
                message = "Already claimed.";
                return false;
            }

            if (!IsRewardAvailable(reward))
            {
                message = "Requirements not met.";
                return false;
            }

            GrantRewardBundle(reward.CoinReward, reward.EssenceReward, reward.TrainerXpReward,
                reward.ItemRewardId, reward.ItemRewardQuantity);

            var list = new List<string>(TrainerProgressionService.State.claimedBookRewardIds ?? Array.Empty<string>())
            {
                rewardId
            };
            TrainerProgressionService.State.claimedBookRewardIds = list.ToArray();
            MonsterCollectionService.SaveProgression();
            MonsterCollectionService.NotifyCollectionChanged();

            message = $"Claimed {reward.DisplayName}!";
            return true;
        }

        internal static void GrantRewardBundle(int coins, int essence, int trainerXp, string itemId, int itemQty)
        {
            if (coins > 0)
            {
                TrainerProgressionService.AddCoins(coins);
            }

            if (essence > 0)
            {
                MonsterCollectionService.AddEssence(essence);
            }

            if (trainerXp > 0)
            {
                TrainerProgressionService.AddTrainerXp(trainerXp);
            }

            if (!string.IsNullOrEmpty(itemId) && itemQty > 0)
            {
                PlayerInventoryService.AddItem(itemId, itemQty);
            }
        }

        public static void RecordEvolutionDiscovery(MonsterData monster)
        {
            if (monster == null || monster.EvolutionStage <= 0)
            {
                return;
            }

            ProgressionSaveState state = TrainerProgressionService.State;
            RegisterEvolutionForm(state, monster.DexNumber, monster.EvolutionStage);
            RegisterVariantHash(state, BuildEvolutionVariantKey(monster));
            MonsterCollectionService.SaveProgression();
            MonsterCollectionService.NotifyCollectionChanged();
        }

        public static bool IsEvolutionFormDiscovered(int dexNumber, int stage)
        {
            if (stage <= 0)
            {
                return true;
            }

            string key = BuildEvolutionFormKey(dexNumber, stage);
            string[] forms = TrainerProgressionService.State.discoveredEvolutionForms ?? Array.Empty<string>();
            for (int i = 0; i < forms.Length; i++)
            {
                if (forms[i] == key)
                {
                    return true;
                }
            }

            return false;
        }

        public static int GetDiscoveredEvolutionFormCount(int dexNumber)
        {
            string prefix = dexNumber + ":";
            int count = 0;
            string[] forms = TrainerProgressionService.State.discoveredEvolutionForms ?? Array.Empty<string>();
            for (int i = 0; i < forms.Length; i++)
            {
                if (forms[i] != null && forms[i].StartsWith(prefix, StringComparison.Ordinal))
                {
                    count++;
                }
            }

            return count;
        }

        public static string BuildEvolutionFormSummary(int dexNumber)
        {
            int discovered = GetDiscoveredEvolutionFormCount(dexNumber);
            if (discovered <= 0)
            {
                return "Evolved forms: none discovered";
            }

            return $"Evolved forms discovered: {discovered}";
        }

        private static void RegisterEvolutionForm(ProgressionSaveState state, int dexNumber, int stage)
        {
            string key = BuildEvolutionFormKey(dexNumber, stage);
            string[] forms = state.discoveredEvolutionForms ?? Array.Empty<string>();
            for (int i = 0; i < forms.Length; i++)
            {
                if (forms[i] == key)
                {
                    return;
                }
            }

            var list = new List<string>(forms) { key };
            state.discoveredEvolutionForms = list.ToArray();
        }

        private static string BuildEvolutionFormKey(int dexNumber, int stage)
        {
            return $"{dexNumber}:{stage}";
        }

        private static string BuildEvolutionVariantKey(MonsterData monster)
        {
            return $"{monster.FullHash}:e{monster.EvolutionStage}";
        }

        private static void RegisterVariantHash(ProgressionSaveState state, string fullHash)
        {
            string[] hashes = state.discoveredVariantHashes ?? Array.Empty<string>();
            for (int i = 0; i < hashes.Length; i++)
            {
                if (hashes[i] == fullHash)
                {
                    return;
                }
            }

            var list = new List<string>(hashes) { fullHash };
            state.discoveredVariantHashes = list.ToArray();
        }
    }
}
