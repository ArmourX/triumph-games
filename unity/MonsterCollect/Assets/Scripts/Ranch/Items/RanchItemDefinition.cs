using UnityEngine;

namespace MonsterCollect.Ranch
{
    /// <summary>Food, medicine, charms, and training consumables.</summary>
    [CreateAssetMenu(fileName = "RanchItem", menuName = "Monster Collect/Ranch Item")]
    public class RanchItemDefinition : ScriptableObject
    {
        public string ItemId = "apple";
        public string DisplayName = "Apple";
        [TextArea] public string Description = "Restores hunger.";
        public RanchItemCategory Category = RanchItemCategory.Food;

        [Header("Care meters")]
        public float HungerDelta;
        public float EnergyDelta;
        public float MoodDelta;
        public float LifespanDelta;
        public float FatigueDelta;

        [Header("Permanent stat boosts (training items)")]
        public int HpDelta;
        public int AttackDelta;
        public int DefenseDelta;
        public int SpeedDelta;

        [Header("Training / battle")]
        [Range(0f, 1f)] public float TrainingSuccessBonus;
        [Range(0f, 0.3f)] public float BattleDamageBonus;

        [Header("Economy")]
        public int EssenceCost;
    }
}
