#if UNITY_EDITOR
using MonsterCollect.Editor;

public static class RunLandscapeUiRebuild
{
    public static void Execute()
    {
        GameSceneBuildSettings.SetupAllScenes();
    }
}
#endif
