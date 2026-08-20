using UnityEngine;

namespace MonsterCollect.Core
{
    /// <summary>Player-facing toggles persisted via PlayerPrefs.</summary>
    public static class GameSettings
    {
        private const string SfxKey = "MonsterCollect.Settings.Sfx";
        private const string MusicKey = "MonsterCollect.Settings.Music";
        private const string HapticsKey = "MonsterCollect.Settings.Haptics";
        private const string ParticlesKey = "MonsterCollect.Settings.Particles";
        private const string ScanIntervalKey = "MonsterCollect.Settings.ScanInterval";
        private const string TextScaleKey = "MonsterCollect.Settings.TextScale";
        private const string ColorblindKey = "MonsterCollect.Settings.Colorblind";
        private const string ReducedMotionKey = "MonsterCollect.Settings.ReducedMotion";
        private const string TutorialDoneKey = "MonsterCollect.Settings.TutorialDone";

        public const float DefaultScanInterval = 0.4f;
        public const float MinScanInterval = 0.3f;
        public const float MaxScanInterval = 0.6f;

        public const float MinTextScale = 0.85f;
        public const float MaxTextScale = 1.35f;
        public const float DefaultTextScale = 1f;

        /// <summary>When true, the same QR can be scanned again to add another ranch copy.</summary>
        public static bool AllowDuplicateScans { get; set; } = true;

        /// <summary>Accelerates errantry timers (e.g. 60 = 1 hour becomes 1 minute).</summary>
        public static double ErrantryTimeMultiplier { get; set; } = 1d;

        public static bool SfxEnabled
        {
            get => PlayerPrefs.GetInt(SfxKey, 0) == 1;
            set { PlayerPrefs.SetInt(SfxKey, value ? 1 : 0); PlayerPrefs.Save(); }
        }

        public static bool MusicEnabled
        {
            get => PlayerPrefs.GetInt(MusicKey, 0) == 1;
            set { PlayerPrefs.SetInt(MusicKey, value ? 1 : 0); PlayerPrefs.Save(); }
        }

        public static bool HapticsEnabled
        {
            get => PlayerPrefs.GetInt(HapticsKey, 1) == 1;
            set { PlayerPrefs.SetInt(HapticsKey, value ? 1 : 0); PlayerPrefs.Save(); }
        }

        public static bool ParticlesEnabled
        {
            get => PlayerPrefs.GetInt(ParticlesKey, 1) == 1;
            set { PlayerPrefs.SetInt(ParticlesKey, value ? 1 : 0); PlayerPrefs.Save(); }
        }

        public static bool ColorblindIndicatorsEnabled
        {
            get => PlayerPrefs.GetInt(ColorblindKey, 0) == 1;
            set { PlayerPrefs.SetInt(ColorblindKey, value ? 1 : 0); PlayerPrefs.Save(); }
        }

        public static bool ReducedMotionEnabled
        {
            get => PlayerPrefs.GetInt(ReducedMotionKey, 0) == 1;
            set { PlayerPrefs.SetInt(ReducedMotionKey, value ? 1 : 0); PlayerPrefs.Save(); }
        }

        public static bool TutorialCompleted
        {
            get => PlayerPrefs.GetInt(TutorialDoneKey, 0) == 1;
            set { PlayerPrefs.SetInt(TutorialDoneKey, value ? 1 : 0); PlayerPrefs.Save(); }
        }

        public static float ScanIntervalSeconds
        {
            get => Mathf.Clamp(PlayerPrefs.GetFloat(ScanIntervalKey, DefaultScanInterval), MinScanInterval, MaxScanInterval);
            set
            {
                PlayerPrefs.SetFloat(ScanIntervalKey, Mathf.Clamp(value, MinScanInterval, MaxScanInterval));
                PlayerPrefs.Save();
            }
        }

        public static float TextScale
        {
            get => Mathf.Clamp(PlayerPrefs.GetFloat(TextScaleKey, DefaultTextScale), MinTextScale, MaxTextScale);
            set
            {
                PlayerPrefs.SetFloat(TextScaleKey, Mathf.Clamp(value, MinTextScale, MaxTextScale));
                PlayerPrefs.Save();
                AccessibilityService.ApplyTextScale();
            }
        }

        public static bool ShowDebugTools =>
#if UNITY_EDITOR || DEVELOPMENT_BUILD
            true;
#else
            false;
#endif
    }
}
