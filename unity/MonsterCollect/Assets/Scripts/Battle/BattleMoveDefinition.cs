using UnityEngine;

namespace MonsterCollect.Battle
{
    /// <summary>Data-driven battle move definition. Author in the inspector or via catalog generator.</summary>
    [CreateAssetMenu(fileName = "BattleMove", menuName = "Monster Collect/Battle Move")]
    public class BattleMoveDefinition : ScriptableObject
    {
        public string MoveId = "custom_move";
        public string DisplayName = "Custom Move";
        public BattleElement Element = BattleElement.Earth;
        public MoveCategory Category = MoveCategory.Physical;
        [Range(0, 200)] public int Power = 40;
        [Range(1, 100)] public int Accuracy = 100;
        public StatusEffectType AppliesStatus = StatusEffectType.Poison;
        public bool HasStatusEffect;
        [Range(1, 5)] public int StatusDuration = 3;
        public bool AppliesStatChange;
        public StatusEffectType StatChange = StatusEffectType.AttackUp;
        public bool IsDefendMove;
        public bool OneUsePerBattle;
        [Range(0f, 3f)] public float DamageMultiplier = 1f;
    }
}
