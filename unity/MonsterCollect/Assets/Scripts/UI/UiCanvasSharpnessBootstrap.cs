using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Applies crisp canvas scaling to game UI after each scene load.</summary>
    public static class UiCanvasSharpnessBootstrap
    {
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        private static void ApplyToGameCanvases()
        {
            Canvas[] canvases = Object.FindObjectsOfType<Canvas>(true);
            for (int i = 0; i < canvases.Length; i++)
            {
                Canvas canvas = canvases[i];
                if (canvas == null)
                {
                    continue;
                }

                TmpFonts.PrepareCanvas(canvas);
                if (canvas.transform.Find("PlayFrame") == null)
                {
                    continue;
                }

                CanvasScaler scaler = canvas.GetComponent<CanvasScaler>();
                if (scaler != null)
                {
                    UiSharpnessUtility.ApplyLandscapeCanvasScaler(scaler);
                }
            }
        }
    }
}
