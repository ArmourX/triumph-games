using System;
using System.Collections.Generic;

namespace MonsterCollect.Battle
{
    /// <summary>Enemy move selection using type matchups, HP, and status.</summary>
    public static class BattleAi
    {
        public static string ChooseMoveId(BattleContext context, BattleCombatant enemy)
        {
            if (enemy == null || context == null)
            {
                return AttackMove.MoveId;
            }

            BattleCombatant player = context.GetOpponentOf(enemy);
            var rng = new Random(context.GetBattleSeed() + enemy.CurrentHp + player.CurrentHp);
            IReadOnlyList<BattleMove> moves = BattleMoveRegistry.GetMovesForCombatant(enemy);

            if (moves.Count == 0)
            {
                return AttackMove.MoveId;
            }

            if (enemy.HpPercent < 0.25f && HasMove(moves, DefendMove.MoveId) && rng.Next(100) < 55)
            {
                return DefendMove.MoveId;
            }

            string bestMoveId = AttackMove.MoveId;
            float bestScore = float.MinValue;

            for (int i = 0; i < moves.Count; i++)
            {
                BattleMove move = moves[i];
                float score = ScoreMove(context, enemy, player, move, rng);
                if (score > bestScore)
                {
                    bestScore = score;
                    bestMoveId = move.Id;
                }
            }

            return bestMoveId;
        }

        private static float ScoreMove(
            BattleContext context,
            BattleCombatant enemy,
            BattleCombatant player,
            BattleMove move,
            Random rng)
        {
            float score = rng.Next(0, 8);

            if (move.Id == DefendMove.MoveId)
            {
                return enemy.HpPercent < 0.35f ? 40f + score : 5f;
            }

            if (move is DataDrivenBattleMove dataMove)
            {
                BattleMoveDefinition def = dataMove.Definition;
                if (def.OneUsePerBattle && enemy.UsedOneTimeMoves.Contains(def.MoveId))
                {
                    return float.MinValue;
                }

                float typeMultiplier = BattleTypeChart.GetMultiplier(def.Element, player.Element);
                score += typeMultiplier * 25f;

                if (def.Power > 0)
                {
                    score += def.Power * 0.4f;
                    if (player.HpPercent < 0.3f)
                    {
                        score += 15f;
                    }
                }

                if (def.HasStatusEffect && !player.HasStatus(def.AppliesStatus))
                {
                    score += 12f;
                }

                if (def.AppliesStatChange)
                {
                    score += 8f;
                }

                return score;
            }

            if (move.Id == SpecialMove.MoveId)
            {
                if (enemy.SpecialUsed)
                {
                    return float.MinValue;
                }

                score += BattleTypeChart.GetMultiplier(enemy.Element, player.Element) * 20f;
                return score + 18f;
            }

            if (move.Id == AttackMove.MoveId)
            {
                score += BattleTypeChart.GetMultiplier(enemy.Element, player.Element) * 15f;
                return score + 10f;
            }

            return score;
        }

        private static bool HasMove(IReadOnlyList<BattleMove> moves, string moveId)
        {
            for (int i = 0; i < moves.Count; i++)
            {
                if (moves[i].Id == moveId)
                {
                    return true;
                }
            }

            return false;
        }
    }
}
