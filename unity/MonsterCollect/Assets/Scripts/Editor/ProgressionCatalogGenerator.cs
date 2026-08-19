#if UNITY_EDITOR
using System.IO;
using MonsterCollect.Progression;
using UnityEditor;
using UnityEngine;

namespace MonsterCollect.Editor
{
    public static class ProgressionCatalogGenerator
    {
        private const string ResourceFolder = "Assets/Resources/Progression";

        [MenuItem("Monster Collect/Generate Default Progression Catalogs")]
        public static void Generate()
        {
            EnsureFolder(ResourceFolder);

            SaveCatalog(ResourceFolder + "/QuestCatalog.asset", RuntimeQuestCatalogFactory.Create());
            SaveCatalog(ResourceFolder + "/TrainerRankCatalog.asset", RuntimeTrainerRankCatalogFactory.Create());
            SaveCatalog(ResourceFolder + "/ShopCatalog.asset", RuntimeShopCatalogFactory.Create());
            SaveCatalog(ResourceFolder + "/MonsterBookRewardCatalog.asset", RuntimeMonsterBookRewardCatalogFactory.Create());

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("Progression catalogs generated under Assets/Resources/Progression/");
        }

        private static void SaveCatalog<T>(string path, T runtimeInstance) where T : ScriptableObject
        {
            T asset = AssetDatabase.LoadAssetAtPath<T>(path);
            if (asset == null)
            {
                asset = ScriptableObject.CreateInstance<T>();
                AssetDatabase.CreateAsset(asset, path);
            }

            EditorUtility.CopySerialized(runtimeInstance, asset);
            EditorUtility.SetDirty(asset);
            Object.DestroyImmediate(runtimeInstance);
        }

        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path))
            {
                return;
            }

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
#endif
