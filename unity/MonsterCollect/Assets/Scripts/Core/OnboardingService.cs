namespace MonsterCollect.Core
{
    public static class OnboardingService
    {
        public static bool ShouldShowTutorial => !GameSettings.TutorialCompleted;

        public static void MarkTutorialComplete()
        {
            GameSettings.TutorialCompleted = true;
        }

        public static void ResetTutorial()
        {
            GameSettings.TutorialCompleted = false;
        }
    }
}
