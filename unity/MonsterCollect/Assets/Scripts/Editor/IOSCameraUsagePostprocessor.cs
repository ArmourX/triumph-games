#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace MonsterCollect.Editor
{
    /// <summary>
    /// Ensures iOS builds include the camera usage string required for WebCamTexture.
    /// </summary>
    public sealed class IOSCameraUsagePostprocessor : IPostprocessBuildWithReport
    {
        public int callbackOrder => 0;

        private const string CameraUsageKey = "NSCameraUsageDescription";
        private const string CameraUsageText =
            "Monster Collect uses the camera to scan QR codes on monster cards.";

        public void OnPostprocessBuild(BuildReport report)
        {
            if (report.summary.platform != BuildTarget.iOS)
            {
                return;
            }

            string plistPath = System.IO.Path.Combine(report.summary.outputPath, "Info.plist");
            if (!System.IO.File.Exists(plistPath))
            {
                Debug.LogWarning("[IOSCameraUsagePostprocessor] Info.plist not found.");
                return;
            }

            var plist = new UnityEditor.iOS.Xcode.PlistDocument();
            plist.ReadFromFile(plistPath);

            plist.root.SetString(CameraUsageKey, CameraUsageText);
            plist.WriteToFile(plistPath);

            Debug.Log("[IOSCameraUsagePostprocessor] Added NSCameraUsageDescription to Info.plist.");
        }
    }
}
#endif
