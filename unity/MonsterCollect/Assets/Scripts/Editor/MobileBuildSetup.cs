#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

namespace MonsterCollect.Editor
{
    /// <summary>One-shot mobile ship checklist for Monster Collect.</summary>
    public static class MobileBuildSetup
    {
        [MenuItem("Monster Collect/Prepare Mobile Build")]
        public static void PrepareMobileBuild()
        {
            UrpMobileSetup.ConfigureUrp();
            LandscapeMobileSetup.ApplyPlayerSettings();
            LandscapeMobileSetup.ConfigureLandscape();
            GameSceneBuildSettings.SetupAllScenes();
            ReleaseBuildSetup.ApplyReleasePlayerSettings();

            Debug.Log("[MobileBuildSetup] Mobile build prepared: URP, landscape, all scenes rebuilt, release settings applied.");
        }
    }
}
#endif
