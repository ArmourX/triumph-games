using System;
using System.Collections;
using UnityEngine;

#if UNITY_ANDROID
using UnityEngine.Android;
#endif

namespace MonsterCollect.QR
{
    /// <summary>
    /// Requests and tracks camera permission on Android and iOS before WebCamTexture starts.
    /// On Editor/Standalone, permission checks always succeed.
    /// </summary>
    public static class CameraPermissionHandler
    {
        /// <summary>Fired once when camera access is granted.</summary>
        public static event Action PermissionGranted;

        /// <summary>Fired when the user denies camera access.</summary>
        public static event Action PermissionDenied;

        /// <summary>
        /// Returns true when the app may open a WebCamTexture on this platform.
        /// </summary>
        public static bool HasCameraPermission()
        {
#if UNITY_ANDROID
            return Permission.HasUserAuthorizedPermission(Permission.Camera);
#elif UNITY_IOS
            return Application.HasUserAuthorization(UserAuthorization.WebCam);
#else
            // Editor / desktop: no runtime permission dialog.
            return true;
#endif
        }

        /// <summary>
        /// Starts an async permission flow. The callback receives true on grant, false on deny.
        /// </summary>
        public static void RequestCameraPermission(Action<bool> onComplete)
        {
            if (HasCameraPermission())
            {
                onComplete?.Invoke(true);
                PermissionGranted?.Invoke();
                return;
            }

#if UNITY_ANDROID
            var callbacks = new PermissionCallbacks();
            callbacks.PermissionGranted += _ => Complete(true, onComplete);
            callbacks.PermissionDenied += _ => Complete(false, onComplete);
            callbacks.PermissionDeniedAndDontAskAgain += _ => Complete(false, onComplete);
            Permission.RequestUserPermission(Permission.Camera, callbacks);
#elif UNITY_IOS
            // Coroutine host required on iOS; caller should use RequestCameraPermissionCoroutine.
            Debug.LogWarning("[CameraPermissionHandler] On iOS, use RequestCameraPermissionCoroutine.");
            onComplete?.Invoke(false);
#else
            onComplete?.Invoke(true);
            PermissionGranted?.Invoke();
#endif
        }

        /// <summary>
        /// iOS-friendly permission request that yields until Application.HasUserAuthorization resolves.
        /// </summary>
        public static IEnumerator RequestCameraPermissionCoroutine(Action<bool> onComplete)
        {
            if (HasCameraPermission())
            {
                Complete(true, onComplete);
                yield break;
            }

#if UNITY_IOS
            yield return Application.RequestUserAuthorization(UserAuthorization.WebCam);
            Complete(Application.HasUserAuthorization(UserAuthorization.WebCam), onComplete);
#elif UNITY_ANDROID
            bool finished = false;
            bool granted = false;

            RequestCameraPermission(result =>
            {
                granted = result;
                finished = true;
            });

            while (!finished)
            {
                yield return null;
            }

            if (granted)
            {
                Complete(true, onComplete);
            }
            else
            {
                Complete(false, onComplete);
            }
#else
            Complete(true, onComplete);
#endif
        }

        private static void Complete(bool granted, Action<bool> onComplete)
        {
            if (granted)
            {
                Debug.Log("[CameraPermissionHandler] Camera permission granted.");
                PermissionGranted?.Invoke();
            }
            else
            {
                Debug.LogWarning("[CameraPermissionHandler] Camera permission denied.");
                PermissionDenied?.Invoke();
            }

            onComplete?.Invoke(granted);
        }
    }
}
