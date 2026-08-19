#if UNITY_EDITOR
using MonsterCollect.UI;
using UnityEditor;
using UnityEngine;

namespace MonsterCollect.Editor
{
    /// <summary>Builds the Resources theme asset from the imported 300Mind UI kit.</summary>
    public static class MobileGameUiKitSetup
    {
        private const string ThemeAssetPath = "Assets/Resources/UI/MobileGameUiKitTheme.asset";
        private const string Atlas1Path = "Assets/300Mind/2D Game UI Kit/Sprites/UI-pack_Sprite_1.png";
        private const string Atlas2Path = "Assets/300Mind/2D Game UI Kit/Sprites/UI-pack_Sprite_2.png";
        private const string TitleFontPath = "Assets/300Mind/2D Game UI Kit/Fonts/GROBOLD.ttf";
        private const string BodyFontPath = "Assets/300Mind/2D Game UI Kit/Fonts/Oswald-Bold.ttf";
        private const string LabelFontPath = "Assets/300Mind/2D Game UI Kit/Fonts/Oswald-Medium.ttf";

        public static void EnsureThemeAsset()
        {
            EnsureThemeAsset(force: false);
        }

        [MenuItem("Monster Collect/Setup UI Kit Theme")]
        public static void SetupThemeMenu()
        {
            EnsureThemeAsset(force: true);
            EditorUtility.DisplayDialog(
                "UI Kit Theme",
                "Mobile Game UI Kit theme created at Resources/UI/MobileGameUiKitTheme.asset.\n\nRun Setup All Scenes to refresh scene UI.",
                "OK");
        }

        [InitializeOnLoadMethod]
        private static void AutoEnsureTheme()
        {
            EditorApplication.delayCall += () => EnsureThemeAsset(force: false);
        }

        private static void EnsureThemeAsset(bool force)
        {
            if (EditorApplication.isPlayingOrWillChangePlaymode)
            {
                return;
            }

            if (!AssetDatabase.IsValidFolder("Assets/Resources"))
            {
                AssetDatabase.CreateFolder("Assets", "Resources");
            }

            if (!AssetDatabase.IsValidFolder("Assets/Resources/UI"))
            {
                AssetDatabase.CreateFolder("Assets/Resources", "UI");
            }

            MobileGameUiKitTheme theme = AssetDatabase.LoadAssetAtPath<MobileGameUiKitTheme>(ThemeAssetPath);
            if (theme == null)
            {
                theme = ScriptableObject.CreateInstance<MobileGameUiKitTheme>();
                AssetDatabase.CreateAsset(theme, ThemeAssetPath);
            }
            else if (!force && theme.IsComplete)
            {
                return;
            }

            theme.sceneBackground = LoadSprite(Atlas2Path, "UI-pack_Sprite_2_2");
            theme.panelModal = LoadSprite(Atlas2Path, "UI-pack_Sprite_2_4");
            theme.navBarBackground = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_35");
            theme.buttonPrimary = LoadSprite(Atlas2Path, "UI-pack_Sprite_2_9");
            theme.buttonSecondary = LoadSprite(Atlas2Path, "UI-pack_Sprite_2_10");
            theme.buttonTab = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_36");
            theme.buttonTabActive = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_37");
            theme.headerBar = LoadSprite(Atlas2Path, "UI-pack_Sprite_2_16");
            theme.titleFont = AssetDatabase.LoadAssetAtPath<Font>(TitleFontPath);
            theme.bodyFont = AssetDatabase.LoadAssetAtPath<Font>(BodyFontPath);
            theme.labelFont = AssetDatabase.LoadAssetAtPath<Font>(LabelFontPath);

            EditorUtility.SetDirty(theme);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
        }

        private static Sprite LoadSprite(string atlasPath, string spriteName)
        {
            Object[] assets = AssetDatabase.LoadAllAssetsAtPath(atlasPath);
            for (int i = 0; i < assets.Length; i++)
            {
                if (assets[i] is Sprite sprite && sprite.name == spriteName)
                {
                    return sprite;
                }
            }

            Debug.LogWarning($"MobileGameUiKitSetup: sprite '{spriteName}' not found in {atlasPath}");
            return null;
        }
    }
}
#endif
