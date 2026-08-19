#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEngine;

namespace MonsterCollect.Editor
{
    /// <summary>Release checklist: versioning, icons, splash, crash API, Android SDK.</summary>
    public static class ReleaseBuildSetup
    {
        private const string BrandingFolder = "Assets/Branding";
        private const string IconPath = BrandingFolder + "/AppIcon.png";

        [MenuItem("Monster Collect/Prepare Release Build")]
        public static void PrepareReleaseBuild()
        {
            MobileBuildSetup.PrepareMobileBuild();
            ApplyReleasePlayerSettings();
            EnsureBrandingAssets();
            AssignIconsIfPresent();

            Debug.Log("[ReleaseBuildSetup] Release build settings applied. Assign keystore in Player Settings before store upload.");
        }

        public static void ApplyReleasePlayerSettings()
        {
            PlayerSettings.bundleVersion = "1.0.0";
            PlayerSettings.Android.bundleVersionCode = 1;
            PlayerSettings.iOS.buildNumber = "1";
            PlayerSettings.companyName = "Triumph Games";
            PlayerSettings.productName = "Monster Collect";

            PlayerSettings.enableCrashReportAPI = true;

            PlayerSettings.Android.targetSdkVersion = AndroidSdkVersions.AndroidApiLevel34;
            PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel25;

            PlayerSettings.SplashScreen.show = true;
            PlayerSettings.SplashScreen.showUnityLogo = false;
            PlayerSettings.SplashScreen.backgroundColor = new Color(0.07f, 0.1f, 0.16f);

            PlayerSettings.statusBarHidden = true;
        }

        private static void EnsureBrandingAssets()
        {
            if (!AssetDatabase.IsValidFolder(BrandingFolder))
            {
                AssetDatabase.CreateFolder("Assets", "Branding");
            }

            if (!File.Exists(IconPath))
            {
                var texture = new Texture2D(512, 512, TextureFormat.RGBA32, false);
                var pixels = new Color32[512 * 512];

                for (int y = 0; y < 512; y++)
                {
                    for (int x = 0; x < 512; x++)
                    {
                        float dx = (x - 256f) / 256f;
                        float dy = (y - 256f) / 256f;
                        float dist = Mathf.Sqrt(dx * dx + dy * dy);
                        byte alpha = dist <= 0.85f ? (byte)255 : (byte)0;
                        pixels[y * 512 + x] = new Color32(45, 120, 190, alpha);
                    }
                }

                texture.SetPixels32(pixels);
                texture.Apply();
                File.WriteAllBytes(IconPath, texture.EncodeToPNG());
                Object.DestroyImmediate(texture);
                AssetDatabase.ImportAsset(IconPath);
                Debug.Log($"[ReleaseBuildSetup] Created placeholder icon at {IconPath}");
            }
        }

        private static void AssignIconsIfPresent()
        {
            Texture2D icon = AssetDatabase.LoadAssetAtPath<Texture2D>(IconPath);
            if (icon == null)
            {
                return;
            }

            var icons = new Texture2D[] { icon };
            PlayerSettings.SetIconsForTargetGroup(BuildTargetGroup.Unknown, icons);
            PlayerSettings.SetIconsForTargetGroup(BuildTargetGroup.Android, icons);
            PlayerSettings.SetIconsForTargetGroup(BuildTargetGroup.iOS, icons);
        }
    }
}
#endif
