using System;
using MonsterCollect.Data;

namespace MonsterCollect.Ranch
{
    public readonly struct CustomizationBonuses
    {
        public float MoodDecayReduction { get; }
        public float TrainingSuccessBonus { get; }
        public float LifespanPerDay { get; }
        public float ErrantryRewardBonus { get; }

        public CustomizationBonuses(
            float moodDecayReduction,
            float trainingSuccessBonus,
            float lifespanPerDay,
            float errantryRewardBonus)
        {
            MoodDecayReduction = moodDecayReduction;
            TrainingSuccessBonus = trainingSuccessBonus;
            LifespanPerDay = lifespanPerDay;
            ErrantryRewardBonus = errantryRewardBonus;
        }
    }

    /// <summary>Background and decoration passive bonuses.</summary>
    public static class RanchCustomizationService
    {
        public static CustomizationBonuses GetBonuses()
        {
            RanchProgressionState state = RanchProgressionService.State;
            RanchCustomizationCatalog catalog = RanchCatalogRegistry.Customization;

            float moodDecay = 0f;
            float training = 0f;
            float lifespan = 0f;
            float errantry = 0f;

            RanchBackgroundDefinition bg = catalog.FindBackground(state.selectedBackgroundId);
            if (bg != null)
            {
                moodDecay += bg.MoodDecayReduction;
                training += bg.TrainingSuccessBonus;
            }

            if (state.placedDecorationIds != null)
            {
                for (int i = 0; i < state.placedDecorationIds.Length; i++)
                {
                    RanchDecorationDefinition deco = catalog.FindDecoration(state.placedDecorationIds[i]);
                    if (deco == null)
                    {
                        continue;
                    }

                    training += deco.TrainingSuccessBonus;
                    lifespan += deco.LifespanBonusPerDay;
                    errantry += deco.ErrantryRewardBonus;
                }
            }

            return new CustomizationBonuses(moodDecay, training, lifespan, errantry);
        }

        public static float GetTrainingSuccessBonus() => GetBonuses().TrainingSuccessBonus;
        public static float GetMoodDecayReduction() => GetBonuses().MoodDecayReduction;
        public static float GetErrantryRewardBonus() => GetBonuses().ErrantryRewardBonus;

        public static bool TrySelectBackground(string backgroundId)
        {
            RanchBackgroundDefinition bg = RanchCatalogRegistry.Customization.FindBackground(backgroundId);
            if (bg == null)
            {
                return false;
            }

            if (RanchProgressionService.CarePoints < bg.UnlockCarePoints)
            {
                return false;
            }

            return MonsterCollectionService.SetSelectedBackground(backgroundId);
        }

        public static bool TryPlaceDecoration(string decorationId)
        {
            RanchDecorationDefinition deco = RanchCatalogRegistry.Customization.FindDecoration(decorationId);
            if (deco == null)
            {
                return false;
            }

            if (RanchProgressionService.CarePoints < deco.UnlockCarePoints)
            {
                return false;
            }

            if (MonsterCollectionService.RanchEssence < deco.EssenceCost)
            {
                return false;
            }

            return MonsterCollectionService.TryPlaceDecoration(decorationId, deco.EssenceCost);
        }

        public static bool TryRemoveDecoration(string decorationId)
        {
            return MonsterCollectionService.TryRemoveDecoration(decorationId);
        }
    }
}
