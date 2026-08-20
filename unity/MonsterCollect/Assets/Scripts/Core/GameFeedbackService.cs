using MonsterCollect.UI;
using UnityEngine;

namespace MonsterCollect.Core
{
    /// <summary>Global feedback for birth, breeding, battle, and errors (haptics + particles only).</summary>
    [DisallowMultipleComponent]
    public class GameFeedbackService : MonoBehaviour
    {
        public static GameFeedbackService Instance { get; private set; }

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
        }

        public void PlayBirth(Transform effectAnchor, Color color)
        {
            HapticFeedbackService.Success();

            if (ShouldPlayParticles() && effectAnchor != null)
            {
                UiCelebrationEffect.Play(effectAnchor, color, 14);
            }
        }

        public void PlayBreeding(Transform effectAnchor, Color color)
        {
            HapticFeedbackService.Medium();

            if (ShouldPlayParticles() && effectAnchor != null)
            {
                UiCelebrationEffect.Play(effectAnchor, color, 18);
            }
        }

        public void PlayBattleHit(Transform effectAnchor)
        {
            HapticFeedbackService.Light();

            if (ShouldPlayParticles() && effectAnchor != null)
            {
                UiCelebrationEffect.Play(effectAnchor, new Color(1f, 0.45f, 0.35f), 8);
            }
        }

        public void PlayQuestComplete()
        {
            HapticFeedbackService.Success();
        }

        public void PlayError()
        {
            HapticFeedbackService.Error();
        }

        public void PlayUiTap()
        {
            HapticFeedbackService.Light();
        }

        private static bool ShouldPlayParticles()
        {
            return GameSettings.ParticlesEnabled && !GameSettings.ReducedMotionEnabled;
        }
    }
}
