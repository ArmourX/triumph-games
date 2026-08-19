using MonsterCollect.Battle;
using UnityEngine;

namespace MonsterCollect.Monster
{
    /// <summary>Cross-species affinity blend presets for breeding and content tuning.</summary>
    [CreateAssetMenu(fileName = "TypeCombination", menuName = "Monster Collect/Type Combination")]
    public class TypeCombinationDefinition : ScriptableObject
    {
        public string CombinationId = "beast_dragon";
        public MonsterSpecies ParentA = MonsterSpecies.Beast;
        public MonsterSpecies ParentB = MonsterSpecies.Dragon;
        public MonsterSpecies PreferredOffspring = MonsterSpecies.Dragon;
        [Range(0f, 1f)] public float OffspringWeight = 0.55f;
        public BattleElement BonusElement = BattleElement.Fire;
    }
}
