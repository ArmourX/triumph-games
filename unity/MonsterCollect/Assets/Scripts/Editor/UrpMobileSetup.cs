#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace MonsterCollect.Editor
{
    /// <summary>
    /// Creates and repairs URP pipeline assets for mobile.
    /// Menu: Monster Collect → Configure URP (Mobile)
    /// </summary>
    public static class UrpMobileSetup
    {
        private const string SettingsFolder = "Assets/Settings";
        private const string PipelineAssetPath = SettingsFolder + "/Mobile_URP.asset";
        private const string RendererAssetPath = SettingsFolder + "/Mobile_ForwardRenderer.asset";

        [MenuItem("Monster Collect/Configure URP (Mobile)")]
        public static void ConfigureUrp()
        {
            EnsureUrpConfigured(logSuccess: true);
        }

        /// <summary>
        /// Runs once after scripts load to repair a pipeline asset with a missing renderer reference.
        /// </summary>
        [InitializeOnLoadMethod]
        private static void AutoRepairOnLoad()
        {
            EditorApplication.delayCall += TryAutoRepairOnLoad;
        }

        private static void TryAutoRepairOnLoad()
        {
            if (EditorApplication.isCompiling || EditorApplication.isUpdating)
            {
                return;
            }

            if (!AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(PipelineAssetPath))
            {
                return;
            }

            if (!PipelineNeedsRepair())
            {
                return;
            }

            Debug.LogWarning("[UrpMobileSetup] Mobile_URP has no default renderer — repairing automatically.");
            RepairPipelineOnly();
        }

        private static void RepairPipelineOnly()
        {
            if (!AssetDatabase.IsValidFolder(SettingsFolder))
            {
                AssetDatabase.CreateFolder("Assets", "Settings");
            }

            var rendererData = AssetDatabase.LoadAssetAtPath<UniversalRendererData>(RendererAssetPath);
            if (rendererData == null)
            {
                rendererData = ScriptableObject.CreateInstance<UniversalRendererData>();
                AssetDatabase.CreateAsset(rendererData, RendererAssetPath);
            }

            var pipelineAsset = AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(PipelineAssetPath);
            if (pipelineAsset == null)
            {
                pipelineAsset = ScriptableObject.CreateInstance<UniversalRenderPipelineAsset>();
                AssetDatabase.CreateAsset(pipelineAsset, PipelineAssetPath);
            }

            AssignRendererToPipeline(pipelineAsset, rendererData);
            EditorUtility.SetDirty(pipelineAsset);
            EditorUtility.SetDirty(rendererData);
            AssetDatabase.SaveAssets();
        }

        private static bool PipelineNeedsRepair()
        {
            var pipelineAsset = AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(PipelineAssetPath);
            if (pipelineAsset == null)
            {
                return false;
            }

            var pipelineSo = new SerializedObject(pipelineAsset);
            var rendererList = pipelineSo.FindProperty("m_RendererDataList");

            if (rendererList == null || rendererList.arraySize == 0)
            {
                return true;
            }

            return rendererList.GetArrayElementAtIndex(0).objectReferenceValue == null;
        }

        private static void EnsureUrpConfigured(bool logSuccess)
        {
            if (!AssetDatabase.IsValidFolder(SettingsFolder))
            {
                AssetDatabase.CreateFolder("Assets", "Settings");
            }

            var rendererData = AssetDatabase.LoadAssetAtPath<UniversalRendererData>(RendererAssetPath);
            if (rendererData == null)
            {
                rendererData = ScriptableObject.CreateInstance<UniversalRendererData>();
                AssetDatabase.CreateAsset(rendererData, RendererAssetPath);
            }

            var pipelineAsset = AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(PipelineAssetPath);
            if (pipelineAsset == null)
            {
                pipelineAsset = ScriptableObject.CreateInstance<UniversalRenderPipelineAsset>();
                AssetDatabase.CreateAsset(pipelineAsset, PipelineAssetPath);
            }

            AssignRendererToPipeline(pipelineAsset, rendererData);

            GraphicsSettings.defaultRenderPipeline = pipelineAsset;

            // Assign pipeline to every quality level so switching quality never drops URP.
            for (int i = 0; i < QualitySettings.names.Length; i++)
            {
                QualitySettings.SetQualityLevel(i, applyExpensiveChanges: false);
                QualitySettings.renderPipeline = pipelineAsset;
            }

            QualitySettings.SetQualityLevel(Mathf.Clamp(QualitySettings.GetQualityLevel(), 0, QualitySettings.names.Length - 1));

            PlayerSettings.SetScriptingBackend(BuildTargetGroup.Android, ScriptingImplementation.IL2CPP);
            PlayerSettings.SetScriptingBackend(BuildTargetGroup.iOS, ScriptingImplementation.IL2CPP);
            PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel25;
            PlayerSettings.iOS.cameraUsageDescription =
                "Monster Collect uses the camera to scan QR codes on monster cards.";

            GameSceneBuildSettings.RegisterAllScenes();

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            if (logSuccess)
            {
                Debug.Log("[UrpMobileSetup] URP configured for mobile. Default renderer: Mobile_ForwardRenderer.");
            }
        }

        /// <summary>
        /// Forces the forward renderer into the pipeline asset (fixes null m_RendererDataList entries).
        /// </summary>
        private static void AssignRendererToPipeline(
            UniversalRenderPipelineAsset pipelineAsset,
            UniversalRendererData rendererData)
        {
            var pipelineSo = new SerializedObject(pipelineAsset);

            var rendererList = pipelineSo.FindProperty("m_RendererDataList");
            if (rendererList == null)
            {
                Debug.LogError("[UrpMobileSetup] Could not find m_RendererDataList on UniversalRenderPipelineAsset.");
                return;
            }

            rendererList.ClearArray();
            rendererList.InsertArrayElementAtIndex(0);
            rendererList.GetArrayElementAtIndex(0).objectReferenceValue = rendererData;

            var legacyRenderer = pipelineSo.FindProperty("m_RendererData");
            if (legacyRenderer != null)
            {
                legacyRenderer.objectReferenceValue = rendererData;
            }

            var defaultIndex = pipelineSo.FindProperty("m_DefaultRendererIndex");
            if (defaultIndex != null)
            {
                defaultIndex.intValue = 0;
            }

            pipelineSo.ApplyModifiedPropertiesWithoutUndo();
            EditorUtility.SetDirty(pipelineAsset);
        }
    }
}
#endif
