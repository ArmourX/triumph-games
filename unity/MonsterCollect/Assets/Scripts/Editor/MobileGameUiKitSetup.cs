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
                "Mobile Game UI Kit theme updated at Resources/UI/MobileGameUiKitTheme.asset.\n\nStop and restart Play Mode on RanchScene to refresh the home hub.",
                "OK");
        }

        [InitializeOnLoadMethod]
        private static void AutoEnsureTheme()
        {
            ScheduleEnsureTheme();
        }

        private static void ScheduleEnsureTheme()
        {
            EditorApplication.delayCall -= EnsureThemeDeferred;
            EditorApplication.delayCall += EnsureThemeDeferred;
        }

        private static void EnsureThemeDeferred()
        {
            if (EditorApplication.isCompiling ||
                EditorApplication.isUpdating ||
                EditorApplication.isPlayingOrWillChangePlaymode)
            {
                ScheduleEnsureTheme();
                return;
            }

            EnsureThemeAsset(force: false);
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

            theme.profileBar = theme.headerBar;
            theme.homeSunsetBackground = LoadSprite(Atlas2Path, "UI-pack_Sprite_2_0");
            theme.currencyPill = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_74");
            theme.sidePanelLeft = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_56");
            theme.sidePanelRight = LoadSprite(Atlas2Path, "UI-pack_Sprite_2_6");
            theme.horizontalPanel = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_44");
            theme.slotPanel = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_57");
            theme.platformPedestal = LoadSprite(Atlas2Path, "UI-pack_Sprite_2_5");
            theme.buttonAdventure = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_21");
            theme.progressTrack = LoadSprite(Atlas2Path, "UI-pack_Sprite_2_3");
            theme.progressFill = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_45");
            theme.notificationBadge = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_32");
            theme.avatarFrame = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_26");
            theme.levelBadgeSprite = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_51");
            theme.iconChest = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_38");
            theme.iconGift = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_12");
            theme.iconShop = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_0");
            theme.iconMonsters = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_10");
            theme.iconFriends = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_11");
            theme.iconSettings = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_4");
            theme.iconCalendar = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_3");
            theme.iconLightning = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_61");
            theme.iconShard = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_77");
            theme.iconCoin = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_78");
            theme.iconGem = LoadSprite(Atlas1Path, "UI-pack_Sprite_1_79");
            theme.iconTicket = LoadSprite(Atlas2Path, "UI-pack_Sprite_2_8");

            EditorUtility.SetDirty(theme);
            AssetDatabase.SaveAssets();
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
