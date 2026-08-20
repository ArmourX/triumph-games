using System;
using System.Runtime.InteropServices;
using UnityEngine;

namespace MonsterCollect.QR
{
    /// <summary>Browser-native QR capture for WebGL (Android/iOS Chrome/Safari).</summary>
    public static class WebGlQrBridge
    {
        public static void OpenPhotoCapture(string gameObjectName, string successMethod, string failureMethod)
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            QRM_OpenPhotoCapture(gameObjectName, successMethod, failureMethod);
#else
            Debug.LogWarning("[WebGlQrBridge] Photo capture is WebGL-only.");
#endif
        }

#if UNITY_WEBGL && !UNITY_EDITOR
        [DllImport("__Internal")]
        private static extern void QRM_OpenPhotoCapture(string gameObjectName, string successMethod, string failureMethod);
#endif
    }
}
