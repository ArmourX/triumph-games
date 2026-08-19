#if UNITY_EDITOR
using MonsterCollect.UI;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.Editor
{
    /// <summary>Adds raising panel to an open ranch scene.</summary>
    public static class RaisingSystemSceneSetup
    {
        [MenuItem("Monster Collect/Add Raising System To Ranch Scene")]
        public static void AddToOpenScene()
        {
            Canvas canvas = Object.FindObjectOfType<Canvas>();
            if (canvas == null)
            {
                Debug.LogError("[RaisingSystemSceneSetup] No Canvas found.");
                return;
            }

            Transform content = canvas.transform.Find("Content");
            if (content == null)
            {
                Debug.LogError("[RaisingSystemSceneSetup] Content object not found under Canvas.");
                return;
            }

            MonsterRaisingPanel existing = Object.FindObjectOfType<MonsterRaisingPanel>(true);
            MonsterRaisingPanel raisingPanel = existing ?? RaisingPanelSceneBuilder.Create(content, SceneUIBuilder.DefaultFont);

            MonsterRaisingController controller = Object.FindObjectOfType<MonsterRaisingController>();
            if (controller == null)
            {
                var go = new GameObject("MonsterRaisingController");
                controller = go.AddComponent<MonsterRaisingController>();
            }

            var controllerSo = new SerializedObject(controller);
            controllerSo.FindProperty("raisingPanel").objectReferenceValue = raisingPanel;
            controllerSo.ApplyModifiedPropertiesWithoutUndo();

            RanchViewController ranch = Object.FindObjectOfType<RanchViewController>();
            if (ranch != null)
            {
                var ranchSo = new SerializedObject(ranch);
                ranchSo.FindProperty("raisingPanel").objectReferenceValue = raisingPanel;
                ranchSo.ApplyModifiedPropertiesWithoutUndo();
            }

            Transform scroll = content.Find("MonsterScroll");
            if (scroll is RectTransform scrollRect)
            {
                scrollRect.anchorMax = new Vector2(0.96f, 0.46f);
            }

            EditorSceneManager.MarkSceneDirty(EditorSceneManager.GetActiveScene());
            Debug.Log("[RaisingSystemSceneSetup] Raising system added to ranch scene.");
        }
    }
}
#endif
