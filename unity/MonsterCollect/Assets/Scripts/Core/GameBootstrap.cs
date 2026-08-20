using MonsterCollect.Core.Analytics;
using MonsterCollect.Core.RemoteConfig;
using MonsterCollect.Events;
using MonsterCollect.Ranch;
using MonsterCollect.UI;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace MonsterCollect.Core
{
    /// <summary>Initializes offline-first services before the first scene loads.</summary>
    public static class GameBootstrap
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        private static void Initialize()
        {
            Application.targetFrameRate = 60;
            AudioListener.volume = 0f;
            AudioListener.pause = true;
            RemoteConfigService.Initialize();
            EventManager.Initialize();
            RanchBiomeService.RefreshUnlocksFromTrainerRank();
            GameAnalyticsService.Initialize();
            GameAnalyticsService.RegisterSink(new FileAnalyticsSink());
            CrashReportingService.Initialize();
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void AfterSceneLoad()
        {
            AccessibilityService.ApplyTextScale();
            EventBannerPanel.EnsureVisible();

            if (SceneManager.GetActiveScene().name == GameScenes.Ranch && OnboardingService.ShouldShowTutorial)
            {
                TutorialPanel.ShowPanel();
            }
        }
    }
}
