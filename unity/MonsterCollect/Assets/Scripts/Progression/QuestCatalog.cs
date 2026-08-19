using UnityEngine;

namespace MonsterCollect.Progression
{
    [CreateAssetMenu(fileName = "QuestCatalog", menuName = "Monster Collect/Quest Catalog")]
    public class QuestCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Progression/QuestCatalog";

        public QuestDefinition[] Quests = System.Array.Empty<QuestDefinition>();

        public QuestDefinition FindById(string questId)
        {
            if (string.IsNullOrEmpty(questId) || Quests == null)
            {
                return null;
            }

            for (int i = 0; i < Quests.Length; i++)
            {
                QuestDefinition quest = Quests[i];
                if (quest != null && quest.QuestId == questId)
                {
                    return quest;
                }
            }

            return null;
        }
    }
}
