using System;
using System.Collections.Generic;
using MonsterCollect.Monster;
using UnityEngine;

namespace MonsterCollect.Data
{
    /// <summary>Debug cheats for unlocking dex entries and filling the ranch.</summary>
    public static class MonsterCollectionCheatService
    {
        private const string CheatQrPrefix = "CHEAT:MONSTER:";

        public static int UnlockAllDexEntries()
        {
            var allNumbers = new int[DexCatalog.TotalEntries];
            for (int i = 0; i < allNumbers.Length; i++)
            {
                allNumbers[i] = i + 1;
            }

            int previous = MonsterCollectionService.UnlockedDexCount;
            MonsterCollectionService.CheatSetUnlockedDexNumbers(allNumbers);
            return DexCatalog.TotalEntries - previous;
        }

        public static int FillRanchWithAllDexMonsters()
        {
            MonsterCollectionService.EnsureLoadedForCheats();
            var monsters = new List<MonsterData>(DexCatalog.TotalEntries);

            for (int dexNumber = 1; dexNumber <= DexCatalog.TotalEntries; dexNumber++)
            {
                monsters.Add(CreateCheatMonster(dexNumber));
            }

            MonsterCollectionService.CheatReplaceMonsters(monsters);
            UnlockAllDexEntries();
            return monsters.Count;
        }

        public static void UnlockEverything()
        {
            FillRanchWithAllDexMonsters();
        }

        public static void RefillDailyEnergy()
        {
            MonsterCollectionService.CheatSetDailyEnergy(RanchEnergyService.DailyMax);
        }

        public static void AddEssence(int amount = 999)
        {
            MonsterCollectionService.AddEssence(amount);
        }

        internal static MonsterData CreateCheatMonster(int dexNumber)
        {
            DexEntry entry = DexCatalog.GetEntry(dexNumber);
            if (entry == null)
            {
                throw new InvalidOperationException($"Missing dex entry #{dexNumber}.");
            }

            string qrContent = $"{CheatQrPrefix}{dexNumber:D3}";
            string fullHash = MonsterGenerator.ComputeHashHex(qrContent);
            string id = fullHash.Substring(0, Math.Min(16, fullHash.Length));

            return new MonsterData
            {
                Id = id,
                FullHash = fullHash,
                DexNumber = dexNumber,
                Name = entry.Name,
                Species = entry.Species,
                Hp = entry.BaseHp,
                Attack = entry.BaseAttack,
                Defense = entry.BaseDefense,
                Speed = entry.BaseSpeed,
                PrimaryColor = entry.PrimaryColor,
                SecondaryColor = entry.SecondaryColor,
                Rarity = entry.Rarity,
                SourceQrContent = qrContent,
                TypeAffinities = MonsterTypeAffinities.FromDominantSpecies(entry.Species),
                IsBred = false,
                Raising = MonsterRaisingState.CreateDefault()
            };
        }
    }
}
