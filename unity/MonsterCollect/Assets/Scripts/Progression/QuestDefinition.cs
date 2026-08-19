using UnityEngine;

namespace MonsterCollect.Progression
{
    [CreateAssetMenu(fileName = "Quest", menuName = "Monster Collect/Quest")]
    public class QuestDefinition : ScriptableObject
    {
        public string QuestId = "daily_win_3";
        public string DisplayName = "Battle Ready";
        [TextArea] public string Description = "Win 3 battles.";
        public QuestCategory Category = QuestCategory.Daily;
        public QuestObjectiveType Objective = QuestObjectiveType.WinBattles;
        public int TargetCount = 3;
        public string ObjectiveParameter = string.Empty;

        [Header("Main quest line order (0 = first)")]
        public int MainQuestOrder;

        [Header("Rewards")]
        public int TrainerXpReward = 25;
        public int CoinReward = 30;
        public int EssenceReward;
        public string ItemRewardId = string.Empty;
        public int ItemRewardQuantity = 1;
    }
}
