using UnityEngine;
using UnityEngine.SceneManagement;

namespace MonsterCollect.Core
{
    /// <summary>Background music is disabled for this build.</summary>
    [DisallowMultipleComponent]
    public class BackgroundMusicService : MonoBehaviour
    {
        public static BackgroundMusicService Instance { get; private set; }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void EnsureInstance()
        {
            // Audio removed — do not spawn a music player.
        }

        public void RefreshPlayback()
        {
            if (Instance == null)
            {
                return;
            }

            SceneManager.sceneLoaded -= OnSceneLoaded;
        }

        private void OnSceneLoaded(Scene scene, LoadSceneMode mode)
        {
        }
    }
}
