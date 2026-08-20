using System;
using System.Collections;
using MonsterCollect.Core;
using UnityEngine;
using UnityEngine.UI;
using ZXing;
using ZXing.Common;
using static ZXing.RGBLuminanceSource;

namespace MonsterCollect.QR
{
    /// <summary>
    /// Full-screen camera preview with throttled QR scanning via ZXing.Net.
    ///
    /// Attach to a GameObject in the QR scan scene and wire UI references in the Inspector:
    /// - Preview RawImage (full screen)
    /// - Scan toggle Button
    /// - Result Text (temporary feedback)
    /// </summary>
    [DisallowMultipleComponent]
    public class QRScanner : MonoBehaviour
    {
        [Header("UI References")]
        [Tooltip("Full-screen RawImage that displays the live camera feed.")]
        [SerializeField] private RawImage previewImage;

        [Tooltip("Button that starts / stops the camera and scanning loop.")]
        [SerializeField] private Button scanButton;

        [Tooltip("Legacy UI Text used to show the last decoded payload briefly.")]
        [SerializeField] private Text resultText;

        [Header("Scan Settings")]
        [Tooltip("Seconds between decode attempts (0.3–0.5 recommended on mobile).")]
        [SerializeField] private float scanIntervalSeconds = 0.4f;

        [Tooltip("Seconds to keep the result label visible before clearing it.")]
        [SerializeField] private float resultDisplayDurationSeconds = 3f;

        [Tooltip("Preferred rear camera on phones; front camera on desktop fallback.")]
        [SerializeField] private bool preferRearCamera = true;

        [Tooltip("Downscale factor for decode buffer (1 = full res, 2 = half). Higher = faster.")]
        [SerializeField] private int decodeDownscale = 2;

        [Header("Debug")]
        [SerializeField] private bool logRawAndExtracted = true;

        private WebCamTexture webCamTexture;
        private IBarcodeReaderGeneric barcodeReader;
        private bool isScanning;
        private bool isDecoding;
        private float nextScanTime;
        private Coroutine resultClearCoroutine;
        private string lastReportedPayload;
        private byte[] rgbaByteBuffer;
        private float nextInvalidFeedbackTime;
        private Coroutine decodeCoroutine;
        private int failedDecodePasses;

        private const int MaxCameraWidth = 1280;
        private const int MaxCameraHeight = 720;

        /// <summary>True while the camera preview and scan loop are active.</summary>
        public bool IsScanning => isScanning;

        /// <summary>Most recently extracted (deterministic) payload, or null.</summary>
        public string LastExtractedPayload { get; private set; }

        /// <summary>Raised when a new valid QR payload is extracted.</summary>
        public event Action<string> OnQrDetected;

        private void Awake()
        {
            barcodeReader = new BarcodeReaderGeneric
            {
                AutoRotate = true,
                TryInverted = true,
                Options = new DecodingOptions
                {
                    PossibleFormats = new[] { BarcodeFormat.QR_CODE },
                    TryHarder = true
                }
            };

            ConfigurePreviewForInput();

            if (scanButton != null)
            {
                scanButton.onClick.AddListener(ToggleScanning);
                scanButton.transform.SetAsLastSibling();
                UpdateScanButtonLabel();
            }

            SetResultText(string.Empty);
            ApplyScanInterval(GameSettings.ScanIntervalSeconds);

#if UNITY_EDITOR
            decodeDownscale = 1;
#endif
        }

        private void Start()
        {
            if (UsesBrowserPhotoCapture())
            {
                SetResultText("Tap Scan to photograph a QR code.");
                return;
            }

            if (RequiresUserGestureToOpenCamera())
            {
                SetResultText("Tap Scan to open the camera.");
                return;
            }

            if (!isScanning)
            {
                StartScanning();
            }
        }

        private void OnDisable()
        {
            StopScanningInternal();
        }

        private static bool RequiresUserGestureToOpenCamera()
        {
#if UNITY_WEBGL
            return !UsesBrowserPhotoCapture();
#else
            return false;
#endif
        }

        private static bool UsesBrowserPhotoCapture()
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            return Application.isMobilePlatform;
#else
            return false;
#endif
        }

        private void ConfigurePreviewForInput()
        {
            if (previewImage == null)
            {
                return;
            }

            // Full-screen preview must not steal taps from the Scan/Stop button.
            previewImage.raycastTarget = false;
        }

        /// <summary>Applies user scan pacing from settings.</summary>
        public void ApplyScanInterval(float intervalSeconds)
        {
            scanIntervalSeconds = Mathf.Clamp(intervalSeconds, GameSettings.MinScanInterval, GameSettings.MaxScanInterval);
        }

        private void OnDestroy()
        {
            StopScanningInternal();

            if (scanButton != null)
            {
                scanButton.onClick.RemoveListener(ToggleScanning);
            }
        }

        /// <summary>Public API: start camera + scanning (requests permission if needed).</summary>
        public void StartScanning()
        {
            if (isScanning)
            {
                return;
            }

            if (UsesBrowserPhotoCapture())
            {
                BeginBrowserPhotoCapture();
                return;
            }

            StartCoroutine(StartScanningRoutine());
        }

        /// <summary>Called from WebGL jslib after the user takes a photo or the browser decodes a QR.</summary>
        public void OnWebPhotoCaptured(string payloadOrDataUrl)
        {
            if (QRImageDecoder.TryDecodeDataUrl(payloadOrDataUrl, out string rawText))
            {
                HandleDecodeResult(rawText);
            }
            else
            {
                SetResultText("Could not read that QR. Try a clearer, closer photo.");
                GameFeedbackService.Instance?.PlayError();
            }

            isScanning = false;
            UpdateScanButtonLabel();
        }

        /// <summary>Called from WebGL jslib when photo capture fails or is cancelled.</summary>
        public void OnWebPhotoFailed(string message)
        {
            isScanning = false;
            UpdateScanButtonLabel();

            if (string.IsNullOrWhiteSpace(message) || message.Contains("No photo"))
            {
                SetResultText("Tap Scan to photograph a QR code.");
                return;
            }

            SetResultText(message);
            GameFeedbackService.Instance?.PlayError();
        }

        private void BeginBrowserPhotoCapture()
        {
            isScanning = true;
            UpdateScanButtonLabel();
            SetResultText("Opening camera…");
            WebGlQrBridge.OpenPhotoCapture(gameObject.name, nameof(OnWebPhotoCaptured), nameof(OnWebPhotoFailed));
        }

        /// <summary>Public API: stop camera and clear preview.</summary>
        public void StopScanning()
        {
            StopScanningInternal();
            UpdateScanButtonLabel();
        }

        /// <summary>Stops the camera after a successful capture so the birth popup stays readable.</summary>
        public void PauseAfterSuccessfulScan()
        {
            StopScanningInternal();
            UpdateScanButtonLabel();
            SetResultText("Monster captured! Tap Scan to scan another.");
        }

        /// <summary>Shows a persistent status line on the scan scene (used for energy/limit errors).</summary>
        public void ShowStatusMessage(string message)
        {
            SetResultText(message);
        }

        /// <summary>Public API: toggle scan on/off (bound to Scan button).</summary>
        public void ToggleScanning()
        {
            if (UsesBrowserPhotoCapture())
            {
                if (!isScanning)
                {
                    StartScanning();
                }

                return;
            }

            if (isScanning)
            {
                StopScanning();
            }
            else
            {
                StartScanning();
            }
        }

        private IEnumerator StartScanningRoutine()
        {
            bool permissionGranted = false;
            yield return CameraPermissionHandler.RequestCameraPermissionCoroutine(granted => permissionGranted = granted);

            if (!permissionGranted)
            {
                SetResultText("Camera permission required. Check browser or app settings.");
                yield break;
            }

            // WebGL/mobile: device list stays empty until permission resolves; give the browser a frame.
            yield return null;
            yield return null;

            if (!TryStartWebCam())
            {
                SetResultText(RequiresUserGestureToOpenCamera()
                    ? "No camera found. Tap Scan again after allowing camera access."
                    : "No camera found.");
                yield break;
            }

            float timeoutSeconds = GetCameraStartupTimeoutSeconds();
            bool cameraReady = false;
            yield return WaitForCameraReady(timeoutSeconds, ready => cameraReady = ready);

            if (!cameraReady)
            {
                // WebGL browsers often lose the user-gesture chain after the permission dialog.
                StopScanningInternal();
                yield return new WaitForSeconds(0.35f);

                if (!TryStartWebCam())
                {
                    SetResultText("Camera failed to start. Tap Scan again.");
                    yield break;
                }

                cameraReady = false;
                yield return WaitForCameraReady(timeoutSeconds, ready => cameraReady = ready);
                if (!cameraReady)
                {
                    SetResultText("Camera failed to start. Tap Scan again.");
                    StopScanningInternal();
                    yield break;
                }
            }

            isScanning = true;
            nextScanTime = Time.unscaledTime;
            lastReportedPayload = null;
            UpdateScanButtonLabel();
            SetResultText("Scanning…");
        }

        private bool TryStartWebCam()
        {
            if (webCamTexture != null)
            {
                if (webCamTexture.isPlaying)
                {
                    webCamTexture.Stop();
                }

                Destroy(webCamTexture);
                webCamTexture = null;
            }

            int requestWidth;
            int requestHeight;
            GetRequestedCameraResolution(out requestWidth, out requestHeight);
            const int requestedFps = 15;

            WebCamDevice[] devices = WebCamTexture.devices;
            if (devices != null && devices.Length > 0)
            {
                string deviceName = SelectCameraDevice(devices);
                webCamTexture = new WebCamTexture(deviceName, requestWidth, requestHeight, requestedFps);
                Debug.Log($"[QRScanner] Opening camera device: {deviceName} ({requestWidth}x{requestHeight})");
            }
            else
            {
                // WebGL often lists zero devices until the default stream is opened.
                webCamTexture = new WebCamTexture(requestWidth, requestHeight, requestedFps);
                Debug.Log($"[QRScanner] Opening default camera ({requestWidth}x{requestHeight})");
            }

            webCamTexture.Play();

            if (previewImage != null)
            {
                previewImage.texture = webCamTexture;
            }

            return webCamTexture.isPlaying;
        }

        private static void GetRequestedCameraResolution(out int width, out int height)
        {
#if UNITY_WEBGL
            width = 640;
            height = 480;
#else
            width = Mathf.Clamp(Mathf.Min(Screen.width, MaxCameraWidth), 320, MaxCameraWidth);
            height = Mathf.Clamp(Mathf.Min(Screen.height, MaxCameraHeight), 240, MaxCameraHeight);
#endif
        }

        private static float GetCameraStartupTimeoutSeconds()
        {
#if UNITY_WEBGL
            return Application.isMobilePlatform ? 15f : 8f;
#else
            return Application.isMobilePlatform ? 8f : 3f;
#endif
        }

        private IEnumerator WaitForCameraReady(float timeoutSeconds, Action<bool> onComplete)
        {
            float deadline = Time.unscaledTime + timeoutSeconds;
            while (Time.unscaledTime < deadline)
            {
                if (webCamTexture != null &&
                    webCamTexture.isPlaying &&
                    webCamTexture.width > 16 &&
                    webCamTexture.height > 16)
                {
                    onComplete?.Invoke(true);
                    yield break;
                }

                if (webCamTexture != null && !webCamTexture.isPlaying)
                {
                    webCamTexture.Play();
                }

                yield return null;
            }

            onComplete?.Invoke(false);
        }

        private string SelectCameraDevice(WebCamDevice[] devices)
        {
            bool wantRear = preferRearCamera;

            for (int i = 0; i < devices.Length; i++)
            {
                if (devices[i].isFrontFacing != wantRear)
                {
                    return devices[i].name;
                }
            }

            return devices[0].name;
        }

        private void Update()
        {
            if (!isScanning || webCamTexture == null || !webCamTexture.isPlaying)
            {
                return;
            }

            // Wait until the camera has produced at least one frame.
            if (webCamTexture.width <= 16)
            {
                return;
            }

            ApplyPreviewRotationAndMirroring();

            if (isDecoding || decodeCoroutine != null || Time.unscaledTime < nextScanTime)
            {
                return;
            }

            if (!webCamTexture.didUpdateThisFrame)
            {
                return;
            }

            nextScanTime = Time.unscaledTime + scanIntervalSeconds;
            decodeCoroutine = StartCoroutine(DecodeFrameCoroutine());
        }

        /// <summary>
        /// Corrects RawImage UV rect for mobile camera rotation and front-camera mirroring.
        /// </summary>
        private void ApplyPreviewRotationAndMirroring()
        {
            if (previewImage == null)
            {
                return;
            }

            previewImage.rectTransform.localEulerAngles = new Vector3(0f, 0f, -webCamTexture.videoRotationAngle);

            float aspect = (float)webCamTexture.width / webCamTexture.height;
            previewImage.rectTransform.localScale = new Vector3(
                webCamTexture.videoVerticallyMirrored ? -1f : 1f,
                1f,
                1f);

            // Stretch to fill parent (full-screen preview).
            previewImage.uvRect = new Rect(0f, 0f, 1f, 1f);
            _ = aspect; // Reserved for future letterboxing if needed.
        }

        private IEnumerator DecodeFrameCoroutine()
        {
            isDecoding = true;
            yield return null;

            string rawText = null;
            int[] scales = failedDecodePasses >= 3
                ? new[] { 1, 2 }
                : new[] { Mathf.Max(1, decodeDownscale), 1 };

            for (int i = 0; i < scales.Length && string.IsNullOrEmpty(rawText); i++)
            {
                rawText = TryDecodeCurrentFrame(scales[i]);
            }

            isDecoding = false;
            decodeCoroutine = null;

            if (string.IsNullOrEmpty(rawText))
            {
                failedDecodePasses++;
            }
            else
            {
                failedDecodePasses = 0;
            }

            HandleDecodeResult(rawText);
        }

        private string TryDecodeCurrentFrame(int downscale)
        {
            if (webCamTexture == null || !webCamTexture.isPlaying || webCamTexture.width <= 16)
            {
                return null;
            }

            int sourceWidth = webCamTexture.width;
            int sourceHeight = webCamTexture.height;
            Color32[] sourcePixels = webCamTexture.GetPixels32();
            if (sourcePixels == null || sourcePixels.Length != sourceWidth * sourceHeight)
            {
                return null;
            }

            Color32[] oriented = OrientCameraPixels(
                sourcePixels,
                sourceWidth,
                sourceHeight,
                webCamTexture.videoRotationAngle,
                webCamTexture.videoVerticallyMirrored,
                out int orientedWidth,
                out int orientedHeight);

            int scale = Mathf.Max(1, downscale);
            int width = orientedWidth / scale;
            int height = orientedHeight / scale;
            if (width <= 0 || height <= 0)
            {
                return null;
            }

            Color32[] framePixels = scale <= 1
                ? oriented
                : CopyDownscaledPixels(oriented, orientedWidth, orientedHeight, width, height);

            try
            {
                byte[] rgba = Color32ToRgbaBytes(framePixels, ref rgbaByteBuffer);
                Result result = barcodeReader.Decode(rgba, width, height, BitmapFormat.RGBA32);
                return result?.Text;
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[QRScanner] Decode error: {ex.Message}");
                return null;
            }
        }

        private static Color32[] OrientCameraPixels(
            Color32[] source,
            int width,
            int height,
            int rotationAngle,
            bool verticallyMirrored,
            out int orientedWidth,
            out int orientedHeight)
        {
            Color32[] working = verticallyMirrored
                ? MirrorVertical(source, width, height)
                : CopyPixels(source);

            rotationAngle = ((rotationAngle % 360) + 360) % 360;
            switch (rotationAngle)
            {
                case 90:
                    return Rotate90Clockwise(working, width, height, out orientedWidth, out orientedHeight);
                case 180:
                    return Rotate180(working, width, height, out orientedWidth, out orientedHeight);
                case 270:
                    return Rotate90CounterClockwise(working, width, height, out orientedWidth, out orientedHeight);
                default:
                    orientedWidth = width;
                    orientedHeight = height;
                    return working;
            }
        }

        private static Color32[] CopyPixels(Color32[] source)
        {
            var copy = new Color32[source.Length];
            Array.Copy(source, copy, source.Length);
            return copy;
        }

        private static Color32[] MirrorVertical(Color32[] source, int width, int height)
        {
            var mirrored = new Color32[source.Length];
            for (int y = 0; y < height; y++)
            {
                int srcRow = y * width;
                int dstRow = (height - 1 - y) * width;
                Array.Copy(source, srcRow, mirrored, dstRow, width);
            }

            return mirrored;
        }

        private static Color32[] Rotate90Clockwise(
            Color32[] source,
            int width,
            int height,
            out int orientedWidth,
            out int orientedHeight)
        {
            orientedWidth = height;
            orientedHeight = width;
            var rotated = new Color32[source.Length];

            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    rotated[x * orientedWidth + (orientedWidth - 1 - y)] = source[y * width + x];
                }
            }

            return rotated;
        }

        private static Color32[] Rotate90CounterClockwise(
            Color32[] source,
            int width,
            int height,
            out int orientedWidth,
            out int orientedHeight)
        {
            orientedWidth = height;
            orientedHeight = width;
            var rotated = new Color32[source.Length];

            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    rotated[(orientedHeight - 1 - x) * orientedWidth + y] = source[y * width + x];
                }
            }

            return rotated;
        }

        private static Color32[] Rotate180(
            Color32[] source,
            int width,
            int height,
            out int orientedWidth,
            out int orientedHeight)
        {
            orientedWidth = width;
            orientedHeight = height;
            var rotated = new Color32[source.Length];
            for (int i = 0; i < source.Length; i++)
            {
                rotated[source.Length - 1 - i] = source[i];
            }

            return rotated;
        }


        private void HandleDecodeResult(string rawText)
        {
            isDecoding = false;

            if (!isScanning || string.IsNullOrEmpty(rawText))
            {
                return;
            }

            if (!QRResultExtractor.TryExtract(rawText, out string extracted))
            {
                ShowInvalidQrFeedback();
                return;
            }

            // Avoid spamming the same QR every scan interval.
            if (extracted == lastReportedPayload)
            {
                return;
            }

            lastReportedPayload = extracted;
            LastExtractedPayload = extracted;

            if (logRawAndExtracted)
            {
                Debug.Log($"[QRScanner] QR detected — raw: \"{rawText}\" | extracted: \"{extracted}\"");
            }
            else
            {
                Debug.Log($"[QRScanner] QR detected: {extracted}");
            }

            SetResultText(extracted);
            OnQrDetected?.Invoke(extracted);
        }

        private void SetResultText(string message)
        {
            if (resultText == null)
            {
                return;
            }

            resultText.text = message ?? string.Empty;

            if (resultClearCoroutine != null)
            {
                StopCoroutine(resultClearCoroutine);
                resultClearCoroutine = null;
            }

            if (!string.IsNullOrEmpty(message) &&
                message != "Scanning…" &&
                !message.StartsWith("Out of Energy", StringComparison.Ordinal) &&
                !message.StartsWith("Scan Limit", StringComparison.Ordinal) &&
                !message.StartsWith("Camera permission", StringComparison.Ordinal) &&
                !message.StartsWith("No camera", StringComparison.Ordinal))
            {
                resultClearCoroutine = StartCoroutine(ClearResultAfterDelay());
            }
        }

        private IEnumerator ClearResultAfterDelay()
        {
            yield return new WaitForSeconds(resultDisplayDurationSeconds);

            if (resultText != null && resultText.text == lastReportedPayload)
            {
                resultText.text = isScanning ? "Scanning…" : string.Empty;
            }

            resultClearCoroutine = null;
        }

        private void StopScanningInternal()
        {
            isScanning = false;
            isDecoding = false;
            failedDecodePasses = 0;
            lastReportedPayload = null;

            if (decodeCoroutine != null)
            {
                StopCoroutine(decodeCoroutine);
                decodeCoroutine = null;
            }

            if (webCamTexture != null)
            {
                if (webCamTexture.isPlaying)
                {
                    webCamTexture.Stop();
                }

                Destroy(webCamTexture);
                webCamTexture = null;
            }

            if (previewImage != null)
            {
                previewImage.texture = null;
            }

            if (resultClearCoroutine != null)
            {
                StopCoroutine(resultClearCoroutine);
                resultClearCoroutine = null;
            }
        }

        private void UpdateScanButtonLabel()
        {
            if (scanButton == null)
            {
                return;
            }

            Text label = scanButton.GetComponentInChildren<Text>();
            if (label != null)
            {
                if (UsesBrowserPhotoCapture())
                {
                    label.text = isScanning ? "Camera…" : "Scan";
                }
                else
                {
                    label.text = isScanning ? "Stop" : "Scan";
                }
            }
        }

        private void ShowInvalidQrFeedback()
        {
            if (Time.unscaledTime < nextInvalidFeedbackTime)
            {
                return;
            }

            nextInvalidFeedbackTime = Time.unscaledTime + 2.5f;
            SetResultText("QR found but not readable — try a clearer code.");
            GameFeedbackService.Instance?.PlayError();
        }

        private Color32[] CopyDownscaledPixels(
            Color32[] source,
            int sourceWidth,
            int sourceHeight,
            int destWidth,
            int destHeight)
        {
            var destination = new Color32[destWidth * destHeight];
            DownscalePixels(source, sourceWidth, sourceHeight, destination, destWidth, destHeight);
            return destination;
        }

        /// <summary>
        /// Flattens Unity Color32[] into the RGBA32 byte layout expected by ZXing.Net 0.16+.
        /// </summary>
        private static byte[] Color32ToRgbaBytes(Color32[] pixels, ref byte[] buffer)
        {
            int required = pixels.Length * 4;
            if (buffer == null || buffer.Length != required)
            {
                buffer = new byte[required];
            }

            for (int i = 0, p = 0; i < pixels.Length; i++, p += 4)
            {
                buffer[p] = pixels[i].r;
                buffer[p + 1] = pixels[i].g;
                buffer[p + 2] = pixels[i].b;
                buffer[p + 3] = pixels[i].a;
            }

            return buffer;
        }

        /// <summary>
        /// Nearest-neighbour downscale into a reusable buffer.
        /// </summary>
        private static void DownscalePixels(
            Color32[] source,
            int sourceWidth,
            int sourceHeight,
            Color32[] destination,
            int destWidth,
            int destHeight)
        {
            float xRatio = (float)sourceWidth / destWidth;
            float yRatio = (float)sourceHeight / destHeight;

            for (int y = 0; y < destHeight; y++)
            {
                int sourceY = Mathf.Min((int)(y * yRatio), sourceHeight - 1);

                for (int x = 0; x < destWidth; x++)
                {
                    int sourceX = Mathf.Min((int)(x * xRatio), sourceWidth - 1);
                    destination[y * destWidth + x] = source[sourceY * sourceWidth + sourceX];
                }
            }
        }
    }
}
