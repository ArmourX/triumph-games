using System.IO;
using MonsterCollect.Monster;
using UnityEditor;
using UnityEngine;

namespace MonsterCollect.Editor
{
    public static class SpeciesCatalogGenerator
    {
        private const string ResourceFolder = "Assets/Resources/Monster";
        private const string SpeciesFolder = ResourceFolder + "/Species";
        private const string CatalogPath = ResourceFolder + "/SpeciesCatalog.asset";
        private const string TypeComboPath = ResourceFolder + "/TypeCombinationCatalog.asset";

        [MenuItem("Monster Collect/Generate Default Species Catalogs")]
        public static void Generate()
        {
            EnsureFolder(ResourceFolder);
            EnsureFolder(SpeciesFolder);

            SpeciesCatalog runtime = RuntimeSpeciesCatalogFactory.Create();
            var savedSpecies = new SpeciesDefinition[runtime.Species.Length];

            for (int i = 0; i < runtime.Species.Length; i++)
            {
                SpeciesDefinition source = runtime.Species[i];
                string path = $"{SpeciesFolder}/{source.Species}.asset";
                SpeciesDefinition asset = AssetDatabase.LoadAssetAtPath<SpeciesDefinition>(path);
                if (asset == null)
                {
                    asset = ScriptableObject.CreateInstance<SpeciesDefinition>();
                    AssetDatabase.CreateAsset(asset, path);
                }

                asset.Species = source.Species;
                asset.DisplayName = source.DisplayName;
                asset.PrimaryElement = source.PrimaryElement;
                asset.PrimaryMoveId = source.PrimaryMoveId;
                asset.SecondaryMoveId = source.SecondaryMoveId;
                asset.DefaultAffinities = source.DefaultAffinities;
                EditorUtility.SetDirty(asset);
                savedSpecies[i] = asset;
            }

            SpeciesCatalog catalog = AssetDatabase.LoadAssetAtPath<SpeciesCatalog>(CatalogPath);
            if (catalog == null)
            {
                catalog = ScriptableObject.CreateInstance<SpeciesCatalog>();
                AssetDatabase.CreateAsset(catalog, CatalogPath);
            }

            catalog.Species = savedSpecies;
            EditorUtility.SetDirty(catalog);

            TypeCombinationCatalog comboRuntime = RuntimeSpeciesCatalogFactory.CreateTypeCombinations();
            TypeCombinationCatalog comboCatalog = AssetDatabase.LoadAssetAtPath<TypeCombinationCatalog>(TypeComboPath);
            if (comboCatalog == null)
            {
                comboCatalog = ScriptableObject.CreateInstance<TypeCombinationCatalog>();
                AssetDatabase.CreateAsset(comboCatalog, TypeComboPath);
            }

            var savedCombos = new TypeCombinationDefinition[comboRuntime.Combinations.Length];
            for (int i = 0; i < comboRuntime.Combinations.Length; i++)
            {
                TypeCombinationDefinition source = comboRuntime.Combinations[i];
                string comboPath = $"{ResourceFolder}/Combinations/{source.CombinationId}.asset";
                EnsureFolder($"{ResourceFolder}/Combinations");

                TypeCombinationDefinition asset = AssetDatabase.LoadAssetAtPath<TypeCombinationDefinition>(comboPath);
                if (asset == null)
                {
                    asset = ScriptableObject.CreateInstance<TypeCombinationDefinition>();
                    AssetDatabase.CreateAsset(asset, comboPath);
                }

                asset.CombinationId = source.CombinationId;
                asset.ParentA = source.ParentA;
                asset.ParentB = source.ParentB;
                asset.PreferredOffspring = source.PreferredOffspring;
                asset.OffspringWeight = source.OffspringWeight;
                asset.BonusElement = source.BonusElement;
                EditorUtility.SetDirty(asset);
                savedCombos[i] = asset;
            }

            comboCatalog.Combinations = savedCombos;
            EditorUtility.SetDirty(comboCatalog);

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log($"Species catalogs generated: {savedSpecies.Length} species, {comboCatalog.Combinations.Length} type combinations.");
        }

        private static void EnsureFolder(string path)
        {
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
        }
    }
}
