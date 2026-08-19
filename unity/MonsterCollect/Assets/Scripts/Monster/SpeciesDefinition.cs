using MonsterCollect.Battle;
using UnityEngine;

namespace MonsterCollect.Monster
{
    /// <summary>Authorable species metadata — moves, element, default affinities.</summary>
    [CreateAssetMenu(fileName = "SpeciesDefinition", menuName = "Monster Collect/Species Definition")]
    public class SpeciesDefinition : ScriptableObject
    {
        public MonsterSpecies Species = MonsterSpecies.Beast;
        public string DisplayName = "Beast";
        public BattleElement PrimaryElement = BattleElement.Earth;
        public string PrimaryMoveId = "earth_slam";
        public string SecondaryMoveId = "war_cry";
        public float[] DefaultAffinities = new float[8];
    }
}
