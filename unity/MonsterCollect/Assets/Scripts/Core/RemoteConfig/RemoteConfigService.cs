using System;
using System.IO;
using MonsterCollect.Events;
using MonsterCollect.Monster;
using UnityEngine;

namespace MonsterCollect.Core.RemoteConfig
{
    /// <summary>
    /// Offline-first tunables loaded from Resources JSON, with optional override file in persistentDataPath.
    /// Replace LoadFromUrl stub later for live ops without an app update.
    /// </summary>
    public static class RemoteConfigService
    {
        public const string ResourcesPath = "Config/remote_config";
        public const string OverrideFileName = "remote_config_override.json";

        private static RemoteConfigData activeConfig;
        private static bool initialized;

        public static RemoteConfigData Active => activeConfig ?? CreateDefault();

        public static void Initialize()
        {
            if (initialized)
            {
                return;
            }

            initialized = true;
            activeConfig = LoadMergedConfig();
        }

        public static void Reload()
        {
            initialized = true;
            activeConfig = LoadMergedConfig();
        }

        /// <summary>Future hook — download JSON from CDN and write to persistentDataPath.</summary>
        public static bool TryApplyDownloadedJson(string json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return false;
            }

            try
            {
                var parsed = JsonUtility.FromJson<RemoteConfigData>(json);
                if (parsed == null)
                {
                    return false;
                }

                string path = Path.Combine(Application.persistentDataPath, OverrideFileName);
                File.WriteAllText(path, json);
                Reload();
                return true;
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[RemoteConfig] Failed to apply downloaded JSON: {ex.Message}");
                return false;
            }
        }

        public static float BattleRewardMultiplier
        {
            get
            {
                EventManager.Initialize();
                return GetLegacyEventMultiplier() * Active.battleRewardMultiplier * EventManager.GetBattleRewardMultiplier();
            }
        }

        public static int GetScanCost(int baseCost)
        {
            EventManager.Initialize();
            float multiplier = Active.scanEnergyCostMultiplier * EventManager.GetScanEnergyCostMultiplier();
            return Mathf.Max(1, Mathf.RoundToInt(baseCost * multiplier));
        }

        public static int GetBattleCost(int baseCost)
        {
            return Mathf.Max(1, Mathf.RoundToInt(baseCost * Active.battleEnergyCostMultiplier));
        }

        public static int MaxScansPerDay
        {
            get
            {
                EventManager.Initialize();
                return Mathf.Max(1, Active.maxScansPerDay + EventManager.GetScanLimitBonus());
            }
        }

        public static MonsterRarity PickRarity(System.Random rng)
        {
            Initialize();
            int roll = rng.Next(100);
            RarityWeightEntry[] weights = Active.rarityWeights ?? RemoteConfigData.DefaultRarityWeights();

            for (int i = 0; i < weights.Length; i++)
            {
                RarityWeightEntry entry = weights[i];
                if (entry == null)
                {
                    continue;
                }

                int threshold = entry.cumulativePercent + GetBonusRarityBoost(entry.rarity);
                if (roll < threshold && Enum.TryParse(entry.rarity, out MonsterRarity rarity))
                {
                    return rarity;
                }
            }

            return MonsterRarity.Common;
        }

        private static float GetLegacyEventMultiplier()
        {
            LimitedTimeEventEntry active = GetActiveEvent();
            return active != null ? active.battleRewardMultiplier : 1f;
        }

        public static LimitedTimeEventEntry GetActiveEvent()
        {
            Initialize();
            if (Active.activeEvents == null || Active.activeEvents.Length == 0)
            {
                return null;
            }

            long now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            for (int i = 0; i < Active.activeEvents.Length; i++)
            {
                LimitedTimeEventEntry entry = Active.activeEvents[i];
                if (entry == null)
                {
                    continue;
                }

                if (entry.startUtc <= now && (entry.endUtc <= 0 || now <= entry.endUtc))
                {
                    return entry;
                }
            }

            return null;
        }

        private static int GetBonusRarityBoost(string rarity)
        {
            EventManager.Initialize();
            int eventBoost = EventManager.GetBonusRarityPercent(
                Enum.TryParse(rarity, out MonsterRarity parsed) ? parsed : MonsterRarity.Common);

            LimitedTimeEventEntry active = GetActiveEvent();
            if (active == null || string.IsNullOrEmpty(active.bonusRarity))
            {
                return eventBoost;
            }

            int legacyBoost = string.Equals(active.bonusRarity, rarity, StringComparison.OrdinalIgnoreCase)
                ? active.bonusRarityPercentBoost
                : 0;
            return eventBoost + legacyBoost;
        }

        private static RemoteConfigData LoadMergedConfig()
        {
            RemoteConfigData config = CreateDefault();

            TextAsset bundled = Resources.Load<TextAsset>(ResourcesPath);
            if (bundled != null)
            {
                TryMergeJson(bundled.text, config);
            }

            string overridePath = Path.Combine(Application.persistentDataPath, OverrideFileName);
            if (File.Exists(overridePath))
            {
                TryMergeJson(File.ReadAllText(overridePath), config);
            }

            return config;
        }

        private static void TryMergeJson(string json, RemoteConfigData target)
        {
            try
            {
                RemoteConfigData parsed = JsonUtility.FromJson<RemoteConfigData>(json);
                if (parsed == null)
                {
                    return;
                }

                if (parsed.rarityWeights != null && parsed.rarityWeights.Length > 0)
                {
                    target.rarityWeights = parsed.rarityWeights;
                }

                target.battleRewardMultiplier = parsed.battleRewardMultiplier;
                target.scanEnergyCostMultiplier = parsed.scanEnergyCostMultiplier;
                target.battleEnergyCostMultiplier = parsed.battleEnergyCostMultiplier;
                target.maxScansPerDay = parsed.maxScansPerDay;

                if (parsed.activeEvents != null)
                {
                    target.activeEvents = parsed.activeEvents;
                }

                target.version = parsed.version;
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[RemoteConfig] Parse error: {ex.Message}");
            }
        }

        private static RemoteConfigData CreateDefault()
        {
            return new RemoteConfigData();
        }
    }
}
