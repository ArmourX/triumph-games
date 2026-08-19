using System;
using System.Collections.Generic;
using System.IO;
using MonsterCollect.Battle;
using UnityEditor;
using UnityEngine;

namespace MonsterCollect.Editor
{
    public static class BattleMoveCatalogGenerator
    {
        private const string ResourceFolder = "Assets/Resources/Battle";
        private const string MovesFolder = ResourceFolder + "/Moves";
        private const string CatalogPath = ResourceFolder + "/BattleMoveCatalog.asset";

        [MenuItem("Monster Collect/Generate Default Battle Move Catalog")]
        public static void Generate()
        {
            EnsureFolder(ResourceFolder);
            EnsureFolder(MovesFolder);

            var moves = new List<BattleMoveDefinition>
            {
                Save("flame_burst", "Flame Burst", BattleElement.Fire, 55, StatusEffectType.Burn, withStatus: true),
                Save("water_pulse", "Water Pulse", BattleElement.Water, 50),
                Save("vine_whip", "Vine Whip", BattleElement.Grass, 45),
                Save("thunder_bolt", "Thunder Bolt", BattleElement.Electric, 60),
                Save("earth_slam", "Earth Slam", BattleElement.Earth, 50),
                Save("gale_strike", "Gale Strike", BattleElement.Wind, 0, StatusEffectType.SpeedUp, statOnly: true),
                Save("shadow_hex", "Shadow Hex", BattleElement.Shadow, 40, StatusEffectType.Poison, withStatus: true),
                Save("radiant_beam", "Radiant Beam", BattleElement.Light, 55),
                Save("sleep_dust", "Sleep Dust", BattleElement.Grass, 0, StatusEffectType.Sleep, statusOnly: true),
                Save("iron_guard", "Iron Guard", BattleElement.Earth, 0, StatusEffectType.DefenseUp, statOnly: true),
                Save("war_cry", "War Cry", BattleElement.Earth, 0, StatusEffectType.AttackUp, statOnly: true),
                Save("tailwind", "Tailwind", BattleElement.Wind, 0, StatusEffectType.SpeedUp, statOnly: true),
                Save("curse", "Curse", BattleElement.Shadow, 0, StatusEffectType.AttackDown, statOnly: true),
                Save("power_surge", "Power Surge", BattleElement.Electric, 70, oneUse: true)
            };

            BattleMoveCatalog catalog = AssetDatabase.LoadAssetAtPath<BattleMoveCatalog>(CatalogPath);
            if (catalog == null)
            {
                catalog = ScriptableObject.CreateInstance<BattleMoveCatalog>();
                AssetDatabase.CreateAsset(catalog, CatalogPath);
            }

            catalog.Moves = moves.ToArray();
            EditorUtility.SetDirty(catalog);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log($"Battle move catalog generated with {moves.Count} moves.");
        }

        private static BattleMoveDefinition Save(
            string id,
            string name,
            BattleElement element,
            int power,
            StatusEffectType status = StatusEffectType.Poison,
            bool withStatus = false,
            bool statusOnly = false,
            bool statOnly = false,
            bool oneUse = false)
        {
            string path = $"{MovesFolder}/{id}.asset";
            BattleMoveDefinition def = AssetDatabase.LoadAssetAtPath<BattleMoveDefinition>(path);
            if (def == null)
            {
                def = ScriptableObject.CreateInstance<BattleMoveDefinition>();
                AssetDatabase.CreateAsset(def, path);
            }

            def.MoveId = id;
            def.DisplayName = name;
            def.Element = element;
            def.Power = power;
            def.Accuracy = statusOnly ? 85 : 95;
            def.Category = power > 0 ? MoveCategory.Special : MoveCategory.Status;
            def.HasStatusEffect = statusOnly || withStatus;
            def.AppliesStatus = status;
            def.StatusDuration = status == StatusEffectType.Sleep ? 2 : 3;
            def.AppliesStatChange = statOnly;
            def.StatChange = status;
            def.OneUsePerBattle = oneUse;
            def.DamageMultiplier = oneUse ? 1.5f : 1f;
            EditorUtility.SetDirty(def);
            return def;
        }

        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path))
            {
                return;
            }

            string parent = Path.GetDirectoryName(path)?.Replace('\\', '/');
            string folderName = Path.GetFileName(path);
            if (!string.IsNullOrEmpty(parent) && !AssetDatabase.IsValidFolder(parent))
            {
                EnsureFolder(parent);
            }

            AssetDatabase.CreateFolder(parent, folderName);
        }
    }
}
