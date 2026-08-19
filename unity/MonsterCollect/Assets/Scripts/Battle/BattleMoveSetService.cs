using System;
using System.Collections.Generic;
using MonsterCollect.Monster;

namespace MonsterCollect.Battle
{
    /// <summary>Assigns 1–4 moves per monster based on species catalog and level.</summary>
    public static class BattleMoveSetService
    {
        public const int MaxMoves = 4;
        public const int SecondaryMoveLevel = 5;
        public const int SpecialMoveLevel = 10;

        public static IReadOnlyList<string> GetMoveIds(MonsterData monster)
        {
            var moves = new List<string>(MaxMoves)
            {
                AttackMove.MoveId,
                DefendMove.MoveId
            };

            if (monster == null)
            {
                return moves;
            }

            MonsterRaisingService.EnsureRaisingState(monster);
            int level = Math.Max(1, monster.Raising.level);
            int stage = Math.Max(0, monster.EvolutionStage);
            SpeciesDefinition speciesDef = GameContentRegistry.Species.Find(monster.Species);

            string typedMove = speciesDef?.PrimaryMoveId;
            if (!string.IsNullOrEmpty(typedMove))
            {
                moves.Add(typedMove);
            }

            if (level >= SecondaryMoveLevel)
            {
                string secondary = speciesDef?.SecondaryMoveId;
                if (!string.IsNullOrEmpty(secondary) && !moves.Contains(secondary))
                {
                    moves.Add(secondary);
                }
            }

            if (level >= SpecialMoveLevel && moves.Count < MaxMoves)
            {
                moves.Add(SpecialMove.MoveId);
            }

            if (stage >= 1 && moves.Count < MaxMoves)
            {
                TryAddEvolutionMove(monster, moves, stage);
            }

            while (moves.Count < MaxMoves && monster.Raising.learnedMoveIds != null)
            {
                for (int i = 0; i < monster.Raising.learnedMoveIds.Length && moves.Count < MaxMoves; i++)
                {
                    string learned = monster.Raising.learnedMoveIds[i];
                    if (!string.IsNullOrEmpty(learned) && !moves.Contains(learned))
                    {
                        moves.Add(learned);
                    }
                }

                break;
            }

            if (moves.Count > MaxMoves)
            {
                if (moves.Contains(SpecialMove.MoveId) && monster.Raising.learnedMoveIds != null &&
                    monster.Raising.learnedMoveIds.Length > 0)
                {
                    moves.Remove(SpecialMove.MoveId);
                }
            }

            while (moves.Count > MaxMoves)
            {
                moves.RemoveAt(moves.Count - 1);
            }

            return moves;
        }

        private static void TryAddEvolutionMove(MonsterData monster, List<string> moves, int stage)
        {
            EvolutionPathEntry path = GameContentRegistry.Evolution.FindById(monster.EvolutionPathId);
            if (path?.unlockMoveIds == null)
            {
                return;
            }

            for (int i = 0; i < path.unlockMoveIds.Length && moves.Count < MaxMoves; i++)
            {
                string moveId = path.unlockMoveIds[i];
                if (!string.IsNullOrEmpty(moveId) && !moves.Contains(moveId))
                {
                    moves.Add(moveId);
                }
            }
        }
    }
}
