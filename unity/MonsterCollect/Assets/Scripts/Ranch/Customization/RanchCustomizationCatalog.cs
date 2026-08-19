using UnityEngine;

namespace MonsterCollect.Ranch
{
    [CreateAssetMenu(fileName = "RanchBackground", menuName = "Monster Collect/Ranch Background")]
    public class RanchBackgroundDefinition : ScriptableObject
    {
        public string BackgroundId = "bg_meadow";
        public string DisplayName = "Meadow";
        [TextArea] public string Description = "Calm pastures.";
        public int UnlockCarePoints;
        public float MoodDecayReduction;
        public float TrainingSuccessBonus;
    }

    [CreateAssetMenu(fileName = "RanchDecoration", menuName = "Monster Collect/Ranch Decoration")]
    public class RanchDecorationDefinition : ScriptableObject
    {
        public string DecorationId = "deco_fountain";
        public string DisplayName = "Fountain";
        [TextArea] public string Description = "Boosts mood recovery.";
        public int UnlockCarePoints;
        public int EssenceCost;
        public float MoodBonus;
        public float LifespanBonusPerDay;
        public float TrainingSuccessBonus;
        public float ErrantryRewardBonus;
    }

    [CreateAssetMenu(fileName = "RanchCustomizationCatalog", menuName = "Monster Collect/Ranch Customization Catalog")]
    public class RanchCustomizationCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Ranch/RanchCustomizationCatalog";

        public RanchBackgroundDefinition[] Backgrounds = System.Array.Empty<RanchBackgroundDefinition>();
        public RanchDecorationDefinition[] Decorations = System.Array.Empty<RanchDecorationDefinition>();

        public RanchBackgroundDefinition FindBackground(string id)
        {
            if (Backgrounds == null)
            {
                return null;
            }

            for (int i = 0; i < Backgrounds.Length; i++)
            {
                if (Backgrounds[i] != null && Backgrounds[i].BackgroundId == id)
                {
                    return Backgrounds[i];
                }
            }

            return null;
        }

        public RanchDecorationDefinition FindDecoration(string id)
        {
            if (Decorations == null)
            {
                return null;
            }

            for (int i = 0; i < Decorations.Length; i++)
            {
                if (Decorations[i] != null && Decorations[i].DecorationId == id)
                {
                    return Decorations[i];
                }
            }

            return null;
        }
    }
}
