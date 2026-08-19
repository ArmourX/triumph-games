using System.Collections.Generic;
using UnityEngine;

namespace MonsterCollect.Battle
{
    /// <summary>Registry of available battle moves (legacy + data-driven).</summary>
    public static class BattleMoveRegistry
    {
        private static readonly Dictionary<string, BattleMove> MovesById = new Dictionary<string, BattleMove>();
        private static bool initialized;

        public static void EnsureInitialized()
        {
            if (initialized)
            {
                return;
            }

            initialized = true;
            RegisterLegacyMoves();
            RegisterCatalogMoves();
        }

        public static BattleMove Get(string moveId)
        {
            EnsureInitialized();
            return MovesById.TryGetValue(moveId, out BattleMove move) ? move : null;
        }

        public static IReadOnlyList<BattleMove> GetMovesForCombatant(BattleCombatant combatant)
        {
            EnsureInitialized();
            var list = new List<BattleMove>();

            if (combatant?.MoveIds == null)
            {
                return list;
            }

            for (int i = 0; i < combatant.MoveIds.Count; i++)
            {
                BattleMove move = Get(combatant.MoveIds[i]);
                if (move != null)
                {
                    list.Add(move);
                }
            }

            return list;
        }

        private static void RegisterLegacyMoves()
        {
            MovesById[AttackMove.MoveId] = new AttackMove();
            MovesById[DefendMove.MoveId] = new DefendMove();
            MovesById[SpecialMove.MoveId] = new SpecialMove();
        }

        private static void RegisterCatalogMoves()
        {
            BattleMoveCatalog catalog = Resources.Load<BattleMoveCatalog>(BattleMoveCatalog.DefaultResourcePath);
            if (catalog == null)
            {
                catalog = RuntimeBattleMoveCatalogFactory.Create();
            }

            if (catalog.Moves == null)
            {
                return;
            }

            for (int i = 0; i < catalog.Moves.Length; i++)
            {
                BattleMoveDefinition definition = catalog.Moves[i];
                if (definition == null || string.IsNullOrEmpty(definition.MoveId))
                {
                    continue;
                }

                MovesById[definition.MoveId] = new DataDrivenBattleMove(definition);
            }
        }
    }
}
