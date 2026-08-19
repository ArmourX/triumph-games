using MonsterCollect.Monster;
using UnityEditor;
using UnityEngine;

namespace MonsterCollect.Editor
{
    public static class EvolutionCatalogGenerator
    {
        private const string CatalogPath = "Assets/Resources/Monster/EvolutionCatalog.asset";

        [MenuItem("Monster Collect/Generate Default Evolution Catalog")]
        public static void Generate()
        {
            EnsureFolder("Assets/Resources/Monster");
            EvolutionCatalog runtime = RuntimeEvolutionCatalogFactory.Create();
            EvolutionCatalog catalog = AssetDatabase.LoadAssetAtPath<EvolutionCatalog>(CatalogPath);
            if (catalog == null)
            {
                catalog = ScriptableObject.CreateInstance<EvolutionCatalog>();
                AssetDatabase.CreateAsset(catalog, CatalogPath);
            }

            catalog.Paths = runtime.Paths;
            EditorUtility.SetDirty(catalog);
            AssetDatabase.SaveAssets();
            Debug.Log($"[EvolutionCatalogGenerator] Wrote {catalog.Paths.Length} evolution paths.");
        }

        private static void EnsureFolder(string path)
        {
            if (!AssetDatabase.IsValidFolder(path))
            {
                string parent = System.IO.Path.GetDirectoryName(path)?.Replace('\\', '/');
                string leaf = System.IO.Path.GetFileName(path);
                if (!string.IsNullOrEmpty(parent) && !AssetDatabase.IsValidFolder(parent))
                {
                    EnsureFolder(parent);
                }

                AssetDatabase.CreateFolder(parent, leaf);
            }
        }
    }
}
