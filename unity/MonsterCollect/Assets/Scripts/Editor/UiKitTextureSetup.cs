#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

namespace MonsterCollect.Editor
{
    /// <summary>Configures UI kit atlases for crisp rendering in game and WebGL builds.</summary>
    public static class UiKitTextureSetup
    {
        private static readonly string[] UiAtlasPaths =
        {
            "Assets/300Mind/2D Game UI Kit/Sprites/UI-pack_Sprite_1.png",
            "Assets/300Mind/2D Game UI Kit/Sprites/UI-pack_Sprite_2.png"
        };

        [MenuItem("Monster Collect/Polish UI Sharpness")]
        public static void PolishUiSharpnessMenu()
        {
            ConfigureUiAtlases();
            LandscapeMobileSetup.ConfigureLandscape();
            MobileGameUiKitSetup.EnsureThemeAsset();
            EditorUtility.DisplayDialog(
                "UI Sharpness",
                "UI textures reimported with crisp settings and landscape canvas scaling updated.\n\nRestart Play Mode to see the changes.",
                "OK");
        }

        public static void ConfigureUiAtlases()
        {
            for (int i = 0; i < UiAtlasPaths.Length; i++)
            {
                ConfigureAtlas(UiAtlasPaths[i]);
            }

            AssetDatabase.SaveAssets();
        }

        private static void ConfigureAtlas(string assetPath)
        {
            var importer = AssetImporter.GetAtPath(assetPath) as TextureImporter;
            if (importer == null)
            {
                Debug.LogWarning($"[UiKitTextureSetup] Missing atlas at {assetPath}");
                return;
            }

            importer.textureType = TextureImporterType.Sprite;
            importer.spriteImportMode = SpriteImportMode.Multiple;
            importer.mipmapEnabled = false;
            importer.filterMode = FilterMode.Bilinear;
            importer.alphaIsTransparency = true;
            importer.spritePixelsToUnits = 100f;
            importer.maxTextureSize = 4096;
            importer.textureCompression = TextureImporterCompression.Uncompressed;

            ConfigurePlatform(importer, "Standalone", TextureImporterCompression.Uncompressed);
            ConfigurePlatform(importer, "WebGL", TextureImporterCompression.CompressedHQ);
            ConfigurePlatform(importer, "Android", TextureImporterCompression.CompressedHQ);
            ConfigurePlatform(importer, "iPhone", TextureImporterCompression.CompressedHQ);

            importer.SaveAndReimport();
        }

        private static void ConfigurePlatform(
            TextureImporter importer,
            string platform,
            TextureImporterCompression compression)
        {
            TextureImporterPlatformSettings settings = importer.GetPlatformTextureSettings(platform);
            settings.overridden = true;
            settings.maxTextureSize = 4096;
            settings.textureCompression = compression;
            settings.compressionQuality = 100;
            settings.crunchedCompression = false;
            importer.SetPlatformTextureSettings(settings);
        }
    }
}
#endif
