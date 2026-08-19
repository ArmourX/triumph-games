using UnityEngine;

namespace MonsterCollect.Ranch
{
    /// <summary>Timed expedition — real-time hours with risk and rewards.</summary>
    [CreateAssetMenu(fileName = "ErrantryMission", menuName = "Monster Collect/Errantry Mission")]
    public class ErrantryMissionDefinition : ScriptableObject
    {
        public string MissionId = "forest_scout";
        public string DisplayName = "Forest Scout";
        [TextArea] public string Description = "A short scouting trip.";
        public int MinLevel = 1;

        [Header("Duration (real hours, scaled by GameSettings.ErrantryTimeMultiplier)")]
        public float DurationHours = 1f;

        [Header("Rewards")]
        public int MinEssence;
        public int MaxEssence;
        public int MinCarePoints;
        public int MaxCarePoints;
        public string[] PossibleItemIds = System.Array.Empty<string>();
        [Range(0f, 1f)] public float ItemDropChance = 0.35f;
        [Range(0f, 1f)] public float MoveLearnChance = 0.15f;
        public string MoveToLearn = "tailwind";

        [Header("Risk")]
        [Range(0f, 1f)] public float InjuryChance = 0.2f;
        public float EnergyDrainOnReturn = 25f;
        public float MoodPenaltyOnInjury = 20f;
    }
}
