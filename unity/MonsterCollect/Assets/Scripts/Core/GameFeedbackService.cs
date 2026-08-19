using MonsterCollect.UI;
using UnityEngine;

namespace MonsterCollect.Core
{
    /// <summary>
    /// Global feedback for birth, breeding, battle, and errors.
    /// Uses procedural tones until real audio clips are added.
    /// </summary>
    [DisallowMultipleComponent]
    public class GameFeedbackService : MonoBehaviour
    {
        public static GameFeedbackService Instance { get; private set; }

        private AudioSource audioSource;
        private AudioClip birthClip;
        private AudioClip breedClip;
        private AudioClip battleClip;
        private AudioClip errorClip;
        private AudioClip uiClip;
        private AudioClip questClip;

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void EnsureInstance()
        {
            if (Instance != null)
            {
                return;
            }

            var go = new GameObject(nameof(GameFeedbackService));
            go.AddComponent<GameFeedbackService>();
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

            audioSource = gameObject.AddComponent<AudioSource>();
            audioSource.playOnAwake = false;
            audioSource.spatialBlend = 0f;

            birthClip = ProceduralSoundGenerator.CreateTone(880f, 0.12f, 0.22f);
            breedClip = ProceduralSoundGenerator.CreateTone(660f, 0.16f, 0.24f);
            battleClip = ProceduralSoundGenerator.CreateTone(220f, 0.08f, 0.28f);
            errorClip = ProceduralSoundGenerator.CreateTone(140f, 0.18f, 0.2f);
            uiClip = ProceduralSoundGenerator.CreateTone(520f, 0.05f, 0.15f);
            questClip = ProceduralSoundGenerator.CreateTone(740f, 0.1f, 0.18f);
        }

        public void PlayBirth(Transform effectAnchor, Color color)
        {
            PlayClip(birthClip);
            HapticFeedbackService.Success();

            if (ShouldPlayParticles() && effectAnchor != null)
            {
                UiCelebrationEffect.Play(effectAnchor, color, 14);
            }
        }

        public void PlayBreeding(Transform effectAnchor, Color color)
        {
            PlayClip(breedClip);
            HapticFeedbackService.Medium();

            if (ShouldPlayParticles() && effectAnchor != null)
            {
                UiCelebrationEffect.Play(effectAnchor, color, 18);
            }
        }

        public void PlayBattleHit(Transform effectAnchor)
        {
            PlayClip(battleClip);
            HapticFeedbackService.Light();

            if (ShouldPlayParticles() && effectAnchor != null)
            {
                UiCelebrationEffect.Play(effectAnchor, new Color(1f, 0.45f, 0.35f), 8);
            }
        }

        public void PlayQuestComplete()
        {
            PlayClip(questClip);
            HapticFeedbackService.Success();
        }

        public void PlayError()
        {
            PlayClip(errorClip);
            HapticFeedbackService.Error();
        }

        public void PlayUiTap()
        {
            PlayClip(uiClip);
            HapticFeedbackService.Light();
        }

        private static bool ShouldPlayParticles()
        {
            return GameSettings.ParticlesEnabled && !GameSettings.ReducedMotionEnabled;
        }

        private void PlayClip(AudioClip clip)
        {
            if (!GameSettings.SfxEnabled || audioSource == null || clip == null)
            {
                return;
            }

            audioSource.PlayOneShot(clip);
        }
    }
}
