#if UNITY_EDITOR
using System.Collections.Generic;
using System.IO;
using MonsterCollect.Ranch;
using UnityEditor;
using UnityEngine;

namespace MonsterCollect.Editor
{
    public static class RanchContentCatalogGenerator
    {
        private const string ResourceFolder = "Assets/Resources/Ranch";

        [MenuItem("Monster Collect/Generate Default Ranch Content Catalogs")]
        public static void Generate()
        {
            EnsureFolder(ResourceFolder);

            SaveItemCatalog();
            SaveFacilityCatalog();
            SaveErrantryCatalog();
            SaveCustomizationCatalog();

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("Ranch content catalogs generated under Assets/Resources/Ranch/");
        }

        private static void SaveItemCatalog()
        {
            RanchItemCatalog runtime = RuntimeRanchItemCatalogFactory.Create();
            SaveCatalog(runtime, ResourceFolder + "/RanchItemCatalog.asset", runtime.Items);
        }

        private static void SaveFacilityCatalog()
        {
            RanchFacilityCatalog runtime = RuntimeRanchFacilityCatalogFactory.Create();
            var catalog = GetOrCreate<RanchFacilityCatalog>(ResourceFolder + "/RanchFacilityCatalog.asset");
            catalog.Facilities = runtime.Facilities;
            EditorUtility.SetDirty(catalog);
        }

        private static void SaveErrantryCatalog()
        {
            ErrantryMissionCatalog runtime = RuntimeErrantryMissionCatalogFactory.Create();
            var catalog = GetOrCreate<ErrantryMissionCatalog>(ResourceFolder + "/ErrantryMissionCatalog.asset");
            catalog.Missions = runtime.Missions;
            EditorUtility.SetDirty(catalog);
        }

        private static void SaveCustomizationCatalog()
        {
            RanchCustomizationCatalog runtime = RuntimeRanchCustomizationCatalogFactory.Create();
            var catalog = GetOrCreate<RanchCustomizationCatalog>(ResourceFolder + "/RanchCustomizationCatalog.asset");
            catalog.Backgrounds = runtime.Backgrounds;
            catalog.Decorations = runtime.Decorations;
            EditorUtility.SetDirty(catalog);
        }

        private static void SaveCatalog(RanchItemCatalog runtime, string path, RanchItemDefinition[] items)
        {
            EnsureFolder(Path.GetDirectoryName(path)?.Replace('\\', '/'));
            var catalog = GetOrCreate<RanchItemCatalog>(path);

            var saved = new List<RanchItemDefinition>();
            string itemsFolder = ResourceFolder + "/Items";
            EnsureFolder(itemsFolder);

            for (int i = 0; i < items.Length; i++)
            {
                RanchItemDefinition source = items[i];
                if (source == null)
                {
                    continue;
                }

                string assetPath = $"{itemsFolder}/{source.ItemId}.asset";
                RanchItemDefinition asset = AssetDatabase.LoadAssetAtPath<RanchItemDefinition>(assetPath);
                if (asset == null)
                {
                    asset = ScriptableObject.CreateInstance<RanchItemDefinition>();
                    AssetDatabase.CreateAsset(asset, assetPath);
                }

                CopyItem(source, asset);
                EditorUtility.SetDirty(asset);
                saved.Add(asset);
            }

            catalog.Items = saved.ToArray();
            EditorUtility.SetDirty(catalog);
        }

        private static void CopyItem(RanchItemDefinition from, RanchItemDefinition to)
        {
            to.ItemId = from.ItemId;
            to.DisplayName = from.DisplayName;
            to.Description = from.Description;
            to.Category = from.Category;
            to.HungerDelta = from.HungerDelta;
            to.EnergyDelta = from.EnergyDelta;
            to.MoodDelta = from.MoodDelta;
            to.LifespanDelta = from.LifespanDelta;
            to.FatigueDelta = from.FatigueDelta;
            to.HpDelta = from.HpDelta;
            to.AttackDelta = from.AttackDelta;
            to.DefenseDelta = from.DefenseDelta;
            to.SpeedDelta = from.SpeedDelta;
            to.TrainingSuccessBonus = from.TrainingSuccessBonus;
            to.BattleDamageBonus = from.BattleDamageBonus;
            to.EssenceCost = from.EssenceCost;
        }

        private static T GetOrCreate<T>(string path) where T : ScriptableObject
        {
            T asset = AssetDatabase.LoadAssetAtPath<T>(path);
            if (asset != null)
            {
                return asset;
            }

            asset = ScriptableObject.CreateInstance<T>();
            AssetDatabase.CreateAsset(asset, path);
            return asset;
        }

        private static void EnsureFolder(string path)
        {
            if (string.IsNullOrEmpty(path))
            {
                return;
            }

            if (!AssetDatabase.IsValidFolder(path))
            {
                string parent = Path.GetDirectoryName(path)?.Replace('\\', '/');
                string name = Path.GetFileName(path);
                if (!string.IsNullOrEmpty(parent))
                {
                    EnsureFolder(parent);
                }

                AssetDatabase.CreateFolder(parent ?? "Assets", name);
            }
        }
    }
}
#endif
