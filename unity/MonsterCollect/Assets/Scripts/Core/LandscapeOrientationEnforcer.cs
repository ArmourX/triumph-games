using UnityEngine;

namespace MonsterCollect.Core
{
    /// <summary>
    /// Keeps the game in landscape on device (especially Android).
    /// </summary>
    public static class LandscapeOrientationEnforcer
    {
        private static bool applied;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        private static void ApplyOnLaunch()
        {
            Apply();
        }

        public static void Apply()
        {
            if (applied && Screen.width >= Screen.height)
            {
                return;
            }

            Screen.autorotateToPortrait = false;
            Screen.autorotateToPortraitUpsideDown = false;
            Screen.autorotateToLandscapeLeft = true;
            Screen.autorotateToLandscapeRight = true;
            Screen.orientation = ScreenOrientation.LandscapeLeft;

            applied = true;
        }
    }
}
