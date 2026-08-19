#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

namespace MonsterCollect.Editor
{
    /// <summary>Imports the QRmon creature art for runtime portraits.</summary>
    public static class QrmonAssetSetup
    {
        private const string SourcePath = "Assets/QRmon/QRmon.png";
        private const string ResourcesPath = "Assets/Resources/Creatures/QRmon.png";

        [MenuItem("Monster Collect/Setup QRmon Sprites")]
        public static void SetupQrmonSprites()
        {
            EnsureResourcesCopy();
            ConfigureImporter(ResourcesPath);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("[QrmonAssetSetup] QRmon portrait configured at Resources/Creatures/QRmon.png.");
        }

        [InitializeOnLoadMethod]
        private static void AutoSetupOnLoad()
        {
            EditorApplication.delayCall += () =>
            {
                if (!System.IO.File.Exists(ResourcesPath))
                {
                    SetupQrmonSprites();
                }
            };
        }

        private static void EnsureResourcesCopy()
        {
            if (!AssetDatabase.IsValidFolder("Assets/Resources"))
            {
                AssetDatabase.CreateFolder("Assets", "Resources");
            }

            if (!AssetDatabase.IsValidFolder("Assets/Resources/Creatures"))
            {
                AssetDatabase.CreateFolder("Assets/Resources", "Creatures");
            }

            if (!System.IO.File.Exists(SourcePath))
            {
                Debug.LogWarning($"[QrmonAssetSetup] Missing source art at {SourcePath}");
                return;
            }

            System.IO.File.Copy(SourcePath, ResourcesPath, true);
        }

        private static void ConfigureImporter(string assetPath)
        {
            var importer = AssetImporter.GetAtPath(assetPath) as TextureImporter;
            if (importer == null)
            {
                return;
            }

            importer.textureType = TextureImporterType.Sprite;
            importer.spriteImportMode = SpriteImportMode.Single;
            importer.spritePixelsPerUnit = 256f;
            importer.mipmapEnabled = false;
            importer.alphaIsTransparency = true;
            importer.filterMode = FilterMode.Bilinear;
            importer.isReadable = true;

            EditorUtility.SetDirty(importer);
            importer.SaveAndReimport();
        }
    }
}
#endif
