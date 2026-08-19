#if UNITY_EDITOR
using MonsterCollect.Monster;
using MonsterCollect.QR;
using MonsterCollect.UI;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.Editor
{
    /// <summary>
    /// Adds monster generation + birth popup to an open QR scan scene without rebuilding UI.
    /// </summary>
    public static class MonsterSystemSceneSetup
    {
        [MenuItem("Monster Collect/Add Monster System To Scene")]
        public static void AddToOpenScene()
        {
            QRScanner scanner = Object.FindObjectOfType<QRScanner>();
            if (scanner == null)
            {
                Debug.LogError("[MonsterSystemSceneSetup] No QRScanner found in the open scene.");
                return;
            }

            MonsterScanHandler existingHandler = Object.FindObjectOfType<MonsterScanHandler>();
            if (existingHandler != null)
            {
                Debug.LogWarning("[MonsterSystemSceneSetup] MonsterScanHandler already exists — updating references.");
            }

            Canvas canvas = Object.FindObjectOfType<Canvas>();
            if (canvas == null)
            {
                Debug.LogError("[MonsterSystemSceneSetup] No Canvas found in the open scene.");
                return;
            }

            MonsterBornPopup popup = Object.FindObjectOfType<MonsterBornPopup>(true);
            if (popup == null)
            {
                popup = QRScanSceneSetup.CreateMonsterBornPopupPublic(canvas.transform);
            }

            MonsterScanHandler handler = existingHandler;
            if (handler == null)
            {
                var handlerGo = new GameObject("MonsterScanHandler");
                handler = handlerGo.AddComponent<MonsterScanHandler>();
            }

            var handlerSo = new SerializedObject(handler);
            handlerSo.FindProperty("qrScanner").objectReferenceValue = scanner;
            handlerSo.FindProperty("bornPopup").objectReferenceValue = popup;
            handlerSo.ApplyModifiedPropertiesWithoutUndo();

            EditorSceneManager.MarkSceneDirty(EditorSceneManager.GetActiveScene());
            Debug.Log("[MonsterSystemSceneSetup] Monster system wired to the open scene.");
        }
    }
}
#endif
