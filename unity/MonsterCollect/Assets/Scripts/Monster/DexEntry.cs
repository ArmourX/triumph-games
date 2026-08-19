using System;
using UnityEngine;

namespace MonsterCollect.Monster
{
    /// <summary>Fixed catalog entry for one dex slot (#001–#500).</summary>
    [Serializable]
    public class DexEntry
    {
        public int DexNumber;
        public string Name;
        public MonsterSpecies Species;
        public MonsterRarity Rarity;
        public Color PrimaryColor;
        public Color SecondaryColor;
        public int BaseHp;
        public int BaseAttack;
        public int BaseDefense;
        public int BaseSpeed;

        public string FormattedNumber => DexNumber.ToString("D3");

        public MonsterData ToPreviewMonster()
        {
            return new MonsterData
            {
                Id = $"dex-{DexNumber:D3}",
                FullHash = BuildDeterministicPreviewHash(DexNumber),
                DexNumber = DexNumber,
                Name = Name,
                Species = Species,
                Hp = BaseHp,
                Attack = BaseAttack,
                Defense = BaseDefense,
                Speed = BaseSpeed,
                PrimaryColor = PrimaryColor,
                SecondaryColor = SecondaryColor,
                Rarity = Rarity
            };
        }

        private static string BuildDeterministicPreviewHash(int dexNumber)
        {
            var chars = new char[64];
            for (int i = 0; i < 32; i++)
            {
                int value = (dexNumber * 7919 + i * 104729) & 0xFF;
                chars[i * 2] = GetHexNibble(value >> 4);
                chars[i * 2 + 1] = GetHexNibble(value & 0xF);
            }

            return new string(chars);
        }

        private static char GetHexNibble(int value)
        {
            return (char)(value < 10 ? '0' + value : 'a' + (value - 10));
        }
    }
}
