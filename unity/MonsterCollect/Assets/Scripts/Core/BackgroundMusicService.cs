using UnityEngine;
using UnityEngine.SceneManagement;

namespace MonsterCollect.Core
{
    /// <summary>Placeholder background music — swap clip for shipped assets later.</summary>
    [DisallowMultipleComponent]
    public class BackgroundMusicService : MonoBehaviour
    {
        public static BackgroundMusicService Instance { get; private set; }

        private AudioSource musicSource;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void EnsureInstance()
        {
            if (Instance != null)
            {
                return;
            }

            var go = new GameObject(nameof(BackgroundMusicService));
            go.AddComponent<BackgroundMusicService>();
        }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            musicSource = gameObject.AddComponent<AudioSource>();
            musicSource.loop = true;
            musicSource.playOnAwake = false;
            musicSource.spatialBlend = 0f;
            musicSource.volume = 0.35f;

            AudioClip loop = ProceduralSoundGenerator.CreateAmbientLoop();
            musicSource.clip = loop;

            SceneManager.sceneLoaded += OnSceneLoaded;
            RefreshPlayback();
        }

        private void OnDestroy()
        {
            SceneManager.sceneLoaded -= OnSceneLoaded;

            if (Instance == this)
            {
                Instance = null;
            }
        }

        private void OnSceneLoaded(Scene scene, LoadSceneMode mode)
        {
            RefreshPlayback();
        }

        public void RefreshPlayback()
        {
            if (musicSource == null)
            {
                return;
            }

            bool shouldPlay = GameSettings.MusicEnabled;
            musicSource.mute = !shouldPlay;

            if (shouldPlay && !musicSource.isPlaying && musicSource.clip != null)
            {
                musicSource.Play();
            }
            else if (!shouldPlay && musicSource.isPlaying)
            {
                musicSource.Pause();
            }
        }
    }
}
