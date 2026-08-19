using System;
using MonsterCollect.Appearance;
using UnityEngine;

namespace MonsterCollect.Monster
{
    [Serializable]
    public class EvolutionPartOverrideEntry
    {
        public MonsterPartSlot slot = MonsterPartSlot.Body;
        public string variantId = string.Empty;
        public bool pickFromEvolvedHash = true;
    }

    [Serializable]
    public class EvolutionPathEntry
    {
        public string pathId = "beast_level_15";
        public string displayName = "Awakening";
        public string description = "Grows stronger through battle experience.";
        public bool matchAnySpecies;
        public MonsterSpecies speciesFilter = MonsterSpecies.Beast;
        public int fromStage;
        public int toStage = 1;
        public EvolutionTriggerKind triggerKind = EvolutionTriggerKind.Level;
        public int requiredLevel = 15;
        public string requiredItemId = string.Empty;
        public string requiredTrainingFocus = string.Empty;
        public int requiredTrainingCount = 20;
        public MonsterSpecies requiredParentSpeciesA = MonsterSpecies.Beast;
        public MonsterSpecies requiredParentSpeciesB = MonsterSpecies.Dragon;
        public bool changeSpecies;
        public MonsterSpecies evolvedSpecies = MonsterSpecies.Beast;
        public float statMultiplier = 1.15f;
        public int bonusHp = 8;
        public int bonusAttack = 4;
        public int bonusDefense = 4;
        public int bonusSpeed = 3;
        public string[] unlockMoveIds = Array.Empty<string>();
        public EvolutionPartOverrideEntry[] appearanceOverrides = Array.Empty<EvolutionPartOverrideEntry>();
        public string evolvedNameSuffix = "Prime";
        public int evolvedDexOffset;
    }

    [CreateAssetMenu(fileName = "EvolutionCatalog", menuName = "Monster Collect/Evolution Catalog")]
    public class EvolutionCatalog : ScriptableObject
    {
        public const string DefaultResourcePath = "Monster/EvolutionCatalog";

        public EvolutionPathEntry[] Paths = Array.Empty<EvolutionPathEntry>();

        public EvolutionPathEntry FindById(string pathId)
        {
            if (string.IsNullOrEmpty(pathId) || Paths == null)
            {
                return null;
            }

            for (int i = 0; i < Paths.Length; i++)
            {
                EvolutionPathEntry path = Paths[i];
                if (path != null && path.pathId == pathId)
                {
                    return path;
                }
            }

            return null;
        }
    }
}
