#if UNITY_EDITOR
using MonsterCollect.UI;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.Editor
{
    /// <summary>Adds fusion / breeding UI to an open ranch scene.</summary>
    public static class BreedingSystemSceneSetup
    {
        [MenuItem("Monster Collect/Add Breeding System To Ranch Scene")]
        public static void AddToOpenScene()
        {
            Canvas canvas = Object.FindObjectOfType<Canvas>();
            if (canvas == null)
            {
                Debug.LogError("[BreedingSystemSceneSetup] No Canvas found.");
                return;
            }

            Transform uiRoot = SceneUIBuilder.GetCanvasContentRoot(canvas.gameObject);
            Transform content = uiRoot.Find("Content") ?? uiRoot;

            MonsterBreedingPanel breedingPanel = Object.FindObjectOfType<MonsterBreedingPanel>(true);
            if (breedingPanel == null)
            {
                breedingPanel = BreedingPanelSceneBuilder.Create(uiRoot, SceneUIBuilder.DefaultFont);
            }

            Button openBreedingButton = null;
            Transform breedButtonTransform = content.Find("BreedButton");
            if (breedButtonTransform != null)
            {
                openBreedingButton = breedButtonTransform.GetComponent<Button>();
            }
            else
            {
                openBreedingButton = SceneUIBuilder.CreatePrimaryButton(content, "BreedButton", "Fusion",
                    new Vector2(0.38f, 0.925f), new Vector2(0.52f, 0.975f));
                var breedButtonImage = openBreedingButton.GetComponent<Image>();
                if (breedButtonImage != null)
                {
                    breedButtonImage.color = new Color(0.55f, 0.22f, 0.72f, 0.95f);
                }
            }

            RanchViewController ranch = Object.FindObjectOfType<RanchViewController>();
            if (ranch != null)
            {
                var ranchSo = new SerializedObject(ranch);
                ranchSo.FindProperty("breedingPanel").objectReferenceValue = breedingPanel;
                ranchSo.FindProperty("openBreedingButton").objectReferenceValue = openBreedingButton;
                ranchSo.ApplyModifiedPropertiesWithoutUndo();
            }

            EditorSceneManager.MarkSceneDirty(EditorSceneManager.GetActiveScene());
            Debug.Log("[BreedingSystemSceneSetup] Breeding system added to ranch scene.");
        }
    }
}
#endif
