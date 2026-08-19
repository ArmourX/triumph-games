using System;

namespace MonsterCollect.Ranch
{
    /// <summary>Persisted ranch upgrades, unlocks, and decoration layout.</summary>
    [Serializable]
    public class RanchProgressionState
    {
        public string[] unlockedFacilityIds = Array.Empty<string>();
        public string selectedBackgroundId = "bg_meadow";
        public string[] placedDecorationIds = Array.Empty<string>();
        public int carePoints;
        public bool starterItemsGranted;

        public static RanchProgressionState CreateDefault()
        {
            return new RanchProgressionState
            {
                unlockedFacilityIds = new[] { "facility_gym" },
                selectedBackgroundId = "bg_meadow",
                placedDecorationIds = Array.Empty<string>(),
                carePoints = 0,
                starterItemsGranted = false
            };
        }
    }
}
