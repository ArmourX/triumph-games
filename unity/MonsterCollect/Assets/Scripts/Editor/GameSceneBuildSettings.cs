#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace MonsterCollect.Editor
{
    /// <summary>Registers all Monster Collect scenes in Build Settings.</summary>
    public static class GameSceneBuildSettings
    {
        private static readonly string[] ScenePaths =
        {
            "Assets/Scenes/QRScanScene.unity",
            "Assets/Scenes/RanchScene.unity",
            "Assets/Scenes/DexScene.unity",
            "Assets/Scenes/BattleScene.unity"
        };

        [MenuItem("Monster Collect/Setup All Scenes")]
        public static void SetupAllScenes()
        {
            MobileGameUiKitSetup.EnsureThemeAsset();
            QrmonAssetSetup.SetupQrmonSprites();
            QRScanSceneSetup.SetupScene();
            RanchSceneSetup.SetupScene();
            DexSceneSetup.SetupScene();
            BattleSceneSetup.SetupScene();
            LandscapeMobileSetup.ApplyPlayerSettings();
            RegisterAllScenes();
            Debug.Log("[GameSceneBuildSettings] All scenes set up, landscape configured, and registered in Build Settings.");
        }

        public static void RegisterAllScenes()
        {
            var scenes = new EditorBuildSettingsScene[ScenePaths.Length];

            for (int i = 0; i < ScenePaths.Length; i++)
            {
                scenes[i] = new EditorBuildSettingsScene(ScenePaths[i], true);
            }

            EditorBuildSettings.scenes = scenes;
        }
    }
}
#endif
