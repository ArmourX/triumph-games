using UnityEngine;

namespace MonsterCollect.Ranch
{
    public enum RanchFacilityKind
    {
        Gym = 0,
        Spa = 1,
        Library = 2
    }

    /// <summary>Unlockable ranch training station.</summary>
    [CreateAssetMenu(fileName = "RanchFacility", menuName = "Monster Collect/Ranch Facility")]
    public class RanchFacilityDefinition : ScriptableObject
    {
        public string FacilityId = "facility_gym";
        public string DisplayName = "Gym";
        [TextArea] public string Description = "Strength and defense drills.";
        public RanchFacilityKind Kind = RanchFacilityKind.Gym;

        [Header("Unlock requirements")]
        public int RequiredCarePoints;
        public int RequiredDexUnlocks;
        public int RequiredBattleWins;

        [Header("Daily use")]
        public int MaxUsesPerDay = 2;
        public float EnergyCost = 20f;
        public float HungerCost = 10f;
        public float FatigueCost = 15f;

        [Header("Training outcomes")]
        public int AttackGain;
        public int DefenseGain;
        public int SpeedGain;
        public float MoodGain = 5f;
        public float LifespanRestore;
        public float FatigueRelief;
        [Range(0f, 1f)] public float MoveLearnChance;
        public string MoveToTeach = "war_cry";
    }
}
