using UnityEngine;

namespace MonsterCollect.Ranch
{
    [CreateAssetMenu(fileName = "ErrantryMissionCatalog", menuName = "Monster Collect/Errantry Mission Catalog")]
    public class ErrantryMissionCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Ranch/ErrantryMissionCatalog";

        public ErrantryMissionDefinition[] Missions = System.Array.Empty<ErrantryMissionDefinition>();

        public ErrantryMissionDefinition FindById(string missionId)
        {
            if (string.IsNullOrEmpty(missionId) || Missions == null)
            {
                return null;
            }

            for (int i = 0; i < Missions.Length; i++)
            {
                ErrantryMissionDefinition mission = Missions[i];
                if (mission != null && mission.MissionId == missionId)
                {
                    return mission;
                }
            }

            return null;
        }
    }
}
