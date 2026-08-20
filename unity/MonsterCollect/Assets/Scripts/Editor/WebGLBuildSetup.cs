#if UNITY_EDITOR
using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace MonsterCollect.Editor
{
    /// <summary>Builds the Unity game for browser play on Vercel (WebGL).</summary>
    public static class WebGLBuildSetup
    {
        /// <summary>Repo folder served by the qrm Vercel project (triumph-games/qrm).</summary>
        public const string VercelOutputRelative = "../../qrm";

        [MenuItem("Monster Collect/Prepare WebGL Build")]
        public static void PrepareWebGL()
        {
            GameSceneBuildSettings.RegisterAllScenes();
            ApplyWebGLPlayerSettings();
            Debug.Log("[WebGLBuildSetup] WebGL player settings applied. Run Build WebGL for Vercel next.");
        }

        [MenuItem("Monster Collect/Build WebGL for Vercel")]
        public static void BuildForVercel()
        {
            if (!IsWebGLSupported())
            {
                Debug.LogError(
                    "[WebGLBuildSetup] WebGL build support is not installed.\n" +
                    "Unity Hub → Installs → Unity 6000.3.22f1 → Add modules → enable \"WebGL Build Support\" → Apply.\n" +
                    "Restart Unity, then run this menu item again.");
                return;
            }

            PrepareWebGL();

            if (EditorUserBuildSettings.activeBuildTarget != BuildTarget.WebGL)
            {
                if (!EditorUserBuildSettings.SwitchActiveBuildTarget(BuildTargetGroup.WebGL, BuildTarget.WebGL))
                {
                    Debug.LogError("[WebGLBuildSetup] Failed to switch active build target to WebGL.");
                    return;
                }
            }

            string projectRoot = Directory.GetParent(Application.dataPath).FullName;
            string outputDir = Environment.GetEnvironmentVariable("QRM_OUTPUT_DIR");
            if (string.IsNullOrWhiteSpace(outputDir))
            {
                outputDir = Path.GetFullPath(Path.Combine(projectRoot, VercelOutputRelative));
            }

            RemoveLegacyBrowserDemo(outputDir);

            if (!Directory.Exists(outputDir))
            {
                Directory.CreateDirectory(outputDir);
            }

            string[] scenes = EditorBuildSettings.scenes
                .Where(s => s.enabled)
                .Select(s => s.path)
                .ToArray();

            if (scenes.Length == 0)
            {
                Debug.LogError("[WebGLBuildSetup] No scenes in Build Settings.");
                return;
            }

            var options = new BuildPlayerOptions
            {
                scenes = scenes,
                locationPathName = outputDir,
                target = BuildTarget.WebGL,
                options = BuildOptions.None
            };

            BuildReport report = BuildPipeline.BuildPlayer(options);
            BuildSummary summary = report.summary;

            if (summary.result == BuildResult.Succeeded)
            {
                Debug.Log($"[WebGLBuildSetup] WebGL build succeeded → {outputDir} ({summary.totalSize / (1024f * 1024f):0.1} MB). Deploy: cd qrm && npx vercel deploy --prod --yes");
            }
            else
            {
                Debug.LogError($"[WebGLBuildSetup] WebGL build failed: {summary.result}");
            }
        }

        public static void ApplyWebGLPlayerSettings()
        {
            LandscapeMobileSetup.ApplyPlayerSettings();
            PlayerSettings.companyName = "Triumph Games";
            PlayerSettings.productName = "QRM";
            PlayerSettings.WebGL.template = "APPLICATION:Default";
            PlayerSettings.WebGL.memorySize = 512;
            PlayerSettings.WebGL.initialMemorySize = 64;
            PlayerSettings.WebGL.maximumMemorySize = 2048;
            PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Brotli;
            PlayerSettings.WebGL.nameFilesAsHashes = false;
            PlayerSettings.WebGL.decompressionFallback = true;
            PlayerSettings.runInBackground = true;
            PlayerSettings.defaultWebScreenWidth = 1280;
            PlayerSettings.defaultWebScreenHeight = 720;
            PlayerSettings.defaultIsNativeResolution = true;
        }

        private static void RemoveLegacyBrowserDemo(string outputDir)
        {
            foreach (string file in new[] { "app.js", "styles.css" })
            {
                string path = Path.Combine(outputDir, file);
                if (File.Exists(path))
                {
                    File.Delete(path);
                }
            }
        }

        private static bool IsWebGLSupported()
        {
            return BuildPipeline.IsBuildTargetSupported(BuildTargetGroup.WebGL, BuildTarget.WebGL);
        }
    }
}
#endif
