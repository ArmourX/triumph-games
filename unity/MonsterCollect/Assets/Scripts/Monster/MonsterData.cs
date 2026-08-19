using System;
using MonsterCollect.Appearance;
using UnityEngine;

namespace MonsterCollect.Monster
{
    /// <summary>
    /// Runtime monster record produced deterministically from a scanned QR payload.
    /// </summary>
    [Serializable]
    public class MonsterData
    {
        public string Id;
        public string FullHash;
        public int DexNumber;
        public string Name;
        public MonsterSpecies Species;
        public int Hp;
        public int Attack;
        public int Defense;
        public int Speed;
        public Color PrimaryColor;
        public Color SecondaryColor;
        public MonsterRarity Rarity;
        public string SourceQrContent;
        public string EventVariantTag = string.Empty;
        public string CapturedDuringEventId = string.Empty;
        public string BaseFormHash = string.Empty;
        public int EvolutionStage;
        public string EvolutionPathId = string.Empty;
        public MonsterCustomizationState Customization;
        public MonsterTypeAffinities TypeAffinities;
        public string ParentAId;
        public string ParentBId;
        public bool IsBred;
        public MonsterRaisingState Raising;
        public MonsterAppearanceSelection AppearanceSelection;

        public MonsterAppearanceSelection GetAppearanceSelection()
        {
            if (AppearanceSelection == null || !AppearanceSelection.IsValid)
            {
                AppearanceSelection = MonsterAppearanceResolver.Resolve(this);
            }

            return AppearanceSelection;
        }

        public Color GetDisplayPrimaryColor()
        {
            return MonsterAppearanceColorUtility.ApplyCustomization(PrimaryColor, Customization, primary: true);
        }

        public Color GetDisplaySecondaryColor()
        {
            return MonsterAppearanceColorUtility.ApplyCustomization(SecondaryColor, Customization, primary: false);
        }

        public MonsterTypeAffinities GetTypeAffinities()
        {
            if (TypeAffinities == null || TypeAffinities.IsEmpty())
            {
                return MonsterTypeAffinities.FromDominantSpecies(Species);
            }

            return TypeAffinities;
        }

        public override string ToString()
        {
            return $"{Name} ({Species}, {Rarity}) — HP {Hp} ATK {Attack} DEF {Defense} SPD {Speed}";
        }
    }
}
