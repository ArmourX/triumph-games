using System;
using MonsterCollect.Data;
using UnityEngine;

namespace MonsterCollect.UI
{
    /// <summary>
    /// Ticks active-monster care simulation and refreshes the raising panel.
    /// </summary>
    [DisallowMultipleComponent]
    public class MonsterRaisingController : MonoBehaviour
    {
        [SerializeField] private MonsterRaisingPanel raisingPanel;
        [SerializeField] private float tickIntervalSeconds = 30f;

        private float nextTickTime;

        private void OnEnable()
        {
            MonsterCollectionService.CollectionChanged += OnCollectionChanged;

            if (raisingPanel != null)
            {
                raisingPanel.RaisingChanged += OnRaisingChanged;
            }

            SimulateAndRefresh();
            nextTickTime = Time.unscaledTime + tickIntervalSeconds;
        }

        private void OnDisable()
        {
            MonsterCollectionService.CollectionChanged -= OnCollectionChanged;

            if (raisingPanel != null)
            {
                raisingPanel.RaisingChanged -= OnRaisingChanged;
            }
        }

        private void Update()
        {
            if (Time.unscaledTime < nextTickTime)
            {
                return;
            }

            nextTickTime = Time.unscaledTime + tickIntervalSeconds;
            SimulateAndRefresh();
        }

        private void OnCollectionChanged()
        {
            // Collection was already updated elsewhere — only refresh UI, do not simulate/save again.
            raisingPanel?.Refresh();
        }

        private void OnRaisingChanged()
        {
            // Panel already refreshed itself; nothing extra needed for now.
        }

        private void SimulateAndRefresh()
        {
            double utcNow = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            MonsterCollectionService.SimulateActiveMonster(utcNow);
            raisingPanel?.Refresh();
        }
    }
}
