using UnityEngine;

namespace MonsterCollect.Battle
{
    /// <summary>Registry of all battle move ScriptableObject definitions.</summary>
    [CreateAssetMenu(fileName = "BattleMoveCatalog", menuName = "Monster Collect/Battle Move Catalog")]
    public class BattleMoveCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Battle/BattleMoveCatalog";

        public BattleMoveDefinition[] Moves = System.Array.Empty<BattleMoveDefinition>();

        public BattleMoveDefinition FindById(string moveId)
        {
            if (string.IsNullOrEmpty(moveId) || Moves == null)
            {
                return null;
            }

            for (int i = 0; i < Moves.Length; i++)
            {
                BattleMoveDefinition move = Moves[i];
                if (move != null && move.MoveId == moveId)
                {
                    return move;
                }
            }

            return null;
        }
    }
}
