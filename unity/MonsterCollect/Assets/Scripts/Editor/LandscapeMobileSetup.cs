#if UNITY_EDITOR
using MonsterCollect.UI;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.Editor
{
    /// <summary>Locks landscape orientation and tunes UI scaling for mobile.</summary>
    public static class LandscapeMobileSetup
    {
        /// <summary>Balance width/height matching so the Game view letterboxes cleanly.</summary>
        private const float LandscapeMatchHeight = 0.5f;

        [MenuItem("Monster Collect/Configure Landscape (Mobile)")]
        public static void ConfigureLandscape()
        {
            ApplyPlayerSettings();
            ApplyCanvasScalersInOpenScene();
            EnsureSafeAreaInOpenScene();
            ApplyCanvasScalersInAllScenes();
            AssetDatabase.SaveAssets();

            Debug.Log("[LandscapeMobileSetup] Landscape mode configured (1920x1080, locked landscape, height-match UI).");
        }

        [InitializeOnLoadMethod]
        private static void RegisterOrientationCheck()
        {
            EditorApplication.delayCall += WarnIfNotLandscapeLocked;
        }

        private static void WarnIfNotLandscapeLocked()
        {
            if (EditorApplication.isCompiling || EditorApplication.isUpdating)
            {
                return;
            }

            if (EditorUserBuildSettings.activeBuildTarget != BuildTarget.Android)
            {
                return;
            }

            UIOrientation orientation = PlayerSettings.defaultInterfaceOrientation;
            if (orientation != UIOrientation.LandscapeLeft && orientation != UIOrientation.LandscapeRight)
            {
                Debug.LogWarning(
                    "[LandscapeMobileSetup] Android build is not locked to landscape. " +
                    "Run Monster Collect → Configure Landscape (Mobile).");
            }
        }

        public static void ApplyPlayerSettings()
        {
            PlayerSettings.defaultInterfaceOrientation = UIOrientation.LandscapeLeft;
            PlayerSettings.useAnimatedAutorotation = false;

            PlayerSettings.allowedAutorotateToPortrait = false;
            PlayerSettings.allowedAutorotateToPortraitUpsideDown = false;
            PlayerSettings.allowedAutorotateToLandscapeLeft = true;
            PlayerSettings.allowedAutorotateToLandscapeRight = true;

            PlayerSettings.defaultScreenWidth = 1920;
            PlayerSettings.defaultScreenHeight = 1080;

            PlayerSettings.Android.defaultWindowWidth = 1920;
            PlayerSettings.Android.defaultWindowHeight = 1080;
            PlayerSettings.Android.minimumWindowWidth = 1280;
            PlayerSettings.Android.minimumWindowHeight = 720;

            PlayerSettings.Android.startInFullscreen = true;
            PlayerSettings.Android.renderOutsideSafeArea = true;
            PlayerSettings.Android.maxAspectRatio = 2.4f;
        }

        private static void ApplyCanvasScalersInOpenScene()
        {
            foreach (CanvasScaler scaler in Object.FindObjectsOfType<CanvasScaler>(true))
            {
                ApplyLandscapeScaler(scaler);
            }
        }

        private static void ApplyCanvasScalersInAllScenes()
        {
            string[] sceneGuids = AssetDatabase.FindAssets("t:Scene", new[] { "Assets/Scenes" });

            foreach (string guid in sceneGuids)
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                var scene = UnityEditor.SceneManagement.EditorSceneManager.OpenScene(
                    path,
                    UnityEditor.SceneManagement.OpenSceneMode.Single);

                ApplyCanvasScalersInOpenScene();
                EnsureSafeAreaInOpenScene();
                UnityEditor.SceneManagement.EditorSceneManager.SaveScene(scene);
            }
        }

        private static void ApplyLandscapeScaler(CanvasScaler scaler)
        {
            if (scaler == null)
            {
                return;
            }

            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = SceneUIBuilder.ReferenceResolution;
            scaler.screenMatchMode = CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
            scaler.matchWidthOrHeight = 0.5f;

            EditorUtility.SetDirty(scaler);
        }

        private static void EnsureSafeAreaInOpenScene()
        {
            foreach (Canvas canvas in Object.FindObjectsOfType<Canvas>(true))
            {
                if (canvas.renderMode != RenderMode.ScreenSpaceOverlay &&
                    canvas.renderMode != RenderMode.ScreenSpaceCamera)
                {
                    continue;
                }

                Transform root = canvas.transform;
                if (root.Find("PlayFrame") != null || root.Find("SafeArea") != null)
                {
                    continue;
                }

                var safeAreaGo = new GameObject("SafeArea", typeof(RectTransform));
                safeAreaGo.transform.SetParent(root, false);
                SceneUIBuilder.StretchFullScreen(safeAreaGo.GetComponent<RectTransform>());
                safeAreaGo.AddComponent<SafeAreaLayout>();

                var children = new List<Transform>();
                for (int i = 0; i < root.childCount; i++)
                {
                    Transform child = root.GetChild(i);
                    if (child != safeAreaGo.transform)
                    {
                        children.Add(child);
                    }
                }

                foreach (Transform child in children)
                {
                    child.SetParent(safeAreaGo.transform, false);
                }

                EditorUtility.SetDirty(canvas.gameObject);
            }
        }
    }
}
#endif
