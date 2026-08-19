using System;
using UnityEngine;

namespace MonsterCollect.Ranch
{
    public enum AdventureEventKind
    {
        Training = 0,
        Loot = 1,
        Fatigue = 2,
        Injury = 3,
        Mood = 4,
        Blessing = 5,
        Wild = 6
    }

    [Serializable]
    public class AdventureEventEntry
    {
        public string eventId = "trail_snack";
        public string displayName = "Trail Snack";
        public string logText = "The party found extra food.";
        public AdventureEventKind kind = AdventureEventKind.Loot;
        public string biomeId = string.Empty;
        public int weight = 10;
        public string itemId = string.Empty;
        public int itemAmount = 1;
        public int trainingPoints;
        public int battleXp;
        public float fatigueDelta;
        public float moodDelta;
        public int injurySeverity;
    }

    [CreateAssetMenu(fileName = "AdventureEventCatalog", menuName = "Monster Collect/Adventure Event Catalog")]
    public class AdventureEventCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Ranch/AdventureEventCatalog";

        public AdventureEventEntry[] Events = Array.Empty<AdventureEventEntry>();
    }
}
