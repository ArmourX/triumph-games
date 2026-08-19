using System;
using MonsterCollect.Core;
using MonsterCollect.Core.Analytics;
using MonsterCollect.Data;
using MonsterCollect.Events;
using MonsterCollect.Monster;
using MonsterCollect.QR;
using MonsterCollect.Sharing;
using MonsterCollect.UI;
using UnityEngine;

namespace MonsterCollect.Monster
{
    /// <summary>
    /// Listens for QR detections, imports shared copies or generates deterministic monsters,
    /// and shows the birth popup.
    /// </summary>
    [DisallowMultipleComponent]
    public class MonsterScanHandler : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private QRScanner qrScanner;
        [SerializeField] private MonsterBornPopup bornPopup;

        [Header("Debug")]
        [SerializeField] private bool logGeneration = true;

        private readonly ScannedHashRegistry registry = new ScannedHashRegistry();
        private bool isProcessingCapture;

        private void Awake()
        {
            ResolveReferences();
        }

        private void Start()
        {
            ResolveReferences();
            SubscribeScanner();
        }

        private void OnEnable()
        {
            SubscribeScanner();
        }

        private void OnDisable()
        {
            if (qrScanner != null)
            {
                qrScanner.OnQrDetected -= HandleQrDetected;
            }
        }

        private void ResolveReferences()
        {
            if (qrScanner == null)
            {
                qrScanner = FindObjectOfType<QRScanner>();
            }

            if (bornPopup == null)
            {
                bornPopup = FindObjectOfType<MonsterBornPopup>(true);
            }
        }

        private void SubscribeScanner()
        {
            if (qrScanner == null)
            {
                return;
            }

            qrScanner.OnQrDetected -= HandleQrDetected;
            qrScanner.OnQrDetected += HandleQrDetected;
        }

        private void HandleQrDetected(string extractedPayload)
        {
            if (isProcessingCapture || string.IsNullOrWhiteSpace(extractedPayload))
            {
                return;
            }

            isProcessingCapture = true;

            try
            {
                ProcessScanPayload(extractedPayload);
            }
            catch (Exception ex)
            {
                Debug.LogError($"[MonsterScanHandler] Capture failed: {ex.Message}\n{ex.StackTrace}");
#if UNITY_EDITOR || DEVELOPMENT_BUILD
                ShowScanFeedback("Capture Failed", ex.Message);
#else
                ShowScanFeedback("Capture Failed", "Something went wrong while saving your monster. Try again.");
#endif
                GameFeedbackService.Instance?.PlayError();
                GameAnalyticsService.TrackScanFailed("exception");
            }
            finally
            {
                isProcessingCapture = false;
            }
        }

        private void ProcessScanPayload(string extractedPayload)
        {
            double utcNow = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            _ = MonsterCollectionService.Count;

            if (!RanchEnergyService.CanAfford(RanchEnergyService.ScanCost, out string energyMessage))
            {
                ShowScanFeedback("Out of Energy", energyMessage);
                GameFeedbackService.Instance?.PlayError();
                GameAnalyticsService.TrackScanFailed("out_of_energy");
                return;
            }

            if (!ScanLimitService.CanScanToday(utcNow, out string limitMessage))
            {
                ShowScanFeedback("Scan Limit", limitMessage);
                GameFeedbackService.Instance?.PlayError();
                GameAnalyticsService.TrackScanFailed("scan_limit");
                return;
            }

            if (MonsterShareCodec.IsSharePayload(extractedPayload))
            {
                HandleSharedMonsterImport(extractedPayload, utcNow);
                return;
            }

            HandleDeterministicCapture(extractedPayload, utcNow);
        }

        private void HandleSharedMonsterImport(string extractedPayload, double utcNow)
        {
            if (!MonsterShareCodec.TryDecode(extractedPayload, out MonsterData monster, out string importHash))
            {
                bornPopup?.ShowMessage("Invalid Share QR", "Could not read this monster share code.");
                GameFeedbackService.Instance?.PlayError();
                GameAnalyticsService.TrackScanFailed("invalid_share");
                return;
            }

            if (!GameSettings.AllowDuplicateScans &&
                (registry.HasBeenScanned(importHash) || MonsterCollectionService.ContainsHash(importHash)))
            {
                if (logGeneration)
                {
                    Debug.Log($"[MonsterScanHandler] Duplicate share import blocked for {importHash.Substring(0, 16)}…");
                }

                bornPopup?.ShowAlreadyScanned(importHash);
                GameFeedbackService.Instance?.PlayError();
                return;
            }

            if (MonsterCollectionService.IsFull)
            {
                bornPopup?.ShowRanchFull();
                GameFeedbackService.Instance?.PlayError();
                return;
            }

            if (!MonsterCollectionService.TryAddMonster(monster, out string errorMessage))
            {
                bornPopup?.ShowMessage("Import Failed", errorMessage);
                GameFeedbackService.Instance?.PlayError();
                return;
            }

            if (!TryFinalizeSuccessfulScan(utcNow, out string finalizeMessage))
            {
                MonsterCollectionService.TryRemoveMonster(monster.Id, out _);
                bornPopup?.ShowMessage("Scan Failed", finalizeMessage);
                GameFeedbackService.Instance?.PlayError();
                return;
            }

            if (!GameSettings.AllowDuplicateScans)
            {
                registry.TryRegister(importHash);
            }

            if (logGeneration)
            {
                Debug.Log($"[MonsterScanHandler] Shared monster imported: {monster}");
            }

            CompleteSuccessfulCapture(monster, "Monster Received!", "A shared monster joined your ranch.", isSharedImport: true, isNewDexEntry: false);
        }

        private void HandleDeterministicCapture(string extractedPayload, double utcNow)
        {
            string fullHash = MonsterGenerator.ComputeHashHex(extractedPayload);

            if (!GameSettings.AllowDuplicateScans &&
                (registry.HasBeenScanned(fullHash) || MonsterCollectionService.ContainsHash(fullHash)))
            {
                if (logGeneration)
                {
                    Debug.Log($"[MonsterScanHandler] Duplicate scan blocked for hash {fullHash.Substring(0, 16)}…");
                }

                bornPopup?.ShowAlreadyScanned(fullHash);
                GameFeedbackService.Instance?.PlayError();
                return;
            }

            if (MonsterCollectionService.IsFull)
            {
                if (logGeneration)
                {
                    Debug.Log("[MonsterScanHandler] Ranch full — scan rejected.");
                }

                bornPopup?.ShowRanchFull();
                GameFeedbackService.Instance?.PlayError();
                return;
            }

            MonsterData monster = MonsterGenerator.Generate(extractedPayload);
            bool isNewDex = !MonsterCollectionService.IsDexUnlocked(monster.DexNumber);

            if (!MonsterCollectionService.TryAddMonster(monster, out string errorMessage))
            {
                if (MonsterCollectionService.IsFull)
                {
                    bornPopup?.ShowRanchFull();
                }
                else
                {
                    bornPopup?.ShowMessage("Capture Failed", errorMessage);
                }

                GameFeedbackService.Instance?.PlayError();
                return;
            }

            if (!TryFinalizeSuccessfulScan(utcNow, out string finalizeMessage))
            {
                MonsterCollectionService.TryRemoveMonster(monster.Id, out _);
                bornPopup?.ShowMessage("Scan Failed", finalizeMessage);
                GameFeedbackService.Instance?.PlayError();
                return;
            }

            if (!GameSettings.AllowDuplicateScans)
            {
                registry.TryRegister(fullHash);
            }

            if (logGeneration)
            {
                Debug.Log($"[MonsterScanHandler] Monster born: {monster}");
            }

            CompleteSuccessfulCapture(monster, "Monster Born!", null, isSharedImport: false, isNewDexEntry: isNewDex, extractedPayload);
        }

        private void CompleteSuccessfulCapture(
            MonsterData monster,
            string title,
            string subtitle,
            bool isSharedImport,
            bool isNewDexEntry,
            string extractedPayload = null)
        {
            try
            {
                bornPopup?.Show(monster, title, subtitle);
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[MonsterScanHandler] Birth popup failed: {ex.Message}");
                bornPopup?.ShowMessage(title, $"{monster.Name} (#{monster.DexNumber:D3}) joined your ranch!");
            }

            qrScanner?.ShowStatusMessage($"Captured {monster.Name} (#{monster.DexNumber:D3})!");
            qrScanner?.PauseAfterSuccessfulScan();

            try
            {
                GameFeedbackService.Instance?.PlayBirth(bornPopup != null ? bornPopup.transform : transform, monster.PrimaryColor);
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[MonsterScanHandler] Birth feedback failed: {ex.Message}");
            }

            try
            {
                if (!isSharedImport && !string.IsNullOrEmpty(extractedPayload))
                {
                    EventManager.ApplyScanCapture(monster, extractedPayload);
                }
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[MonsterScanHandler] Event capture hook failed: {ex.Message}");
            }

            try
            {
                GameAnalyticsService.TrackScanSuccess(monster, isSharedImport, isNewDexEntry);
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[MonsterScanHandler] Analytics failed: {ex.Message}");
            }
        }

        /// <summary>Debug helper — clears local scan history.</summary>
        public void ClearScanHistory()
        {
            registry.ClearAll();
            ScanLimitService.ResetTodayScanCount(DateTimeOffset.UtcNow.ToUnixTimeSeconds());
            Debug.Log("[MonsterScanHandler] Scan history and daily scan counter cleared.");
        }

        private void ShowScanFeedback(string title, string message)
        {
            bornPopup?.ShowMessage(title, message);

            if (qrScanner != null)
            {
                qrScanner.ShowStatusMessage($"{title}: {message}");
            }
        }

        private static bool TryFinalizeSuccessfulScan(double utcNow, out string message)
        {
            if (!ScanLimitService.TryConsumeScan(utcNow, out message))
            {
                return false;
            }

            if (!RanchEnergyService.TrySpend(RanchEnergyService.ScanCost, out message))
            {
                ScanLimitService.RefundScan();
                return false;
            }

            message = null;
            return true;
        }
    }
}
