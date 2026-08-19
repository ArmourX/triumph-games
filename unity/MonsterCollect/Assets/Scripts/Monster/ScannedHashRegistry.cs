using System.Collections.Generic;
using UnityEngine;

namespace MonsterCollect.Monster
{
    /// <summary>
    /// Tracks which QR hashes this player has already scanned (PlayerPrefs-backed).
    /// </summary>
    public class ScannedHashRegistry
    {
        private const string PlayerPrefsKey = "MonsterCollect.ScannedHashes";

        private readonly HashSet<string> scannedHashes = new HashSet<string>();
        private bool isLoaded;

        public int Count
        {
            get
            {
                EnsureLoaded();
                return scannedHashes.Count;
            }
        }

        public bool HasBeenScanned(string fullHash)
        {
            EnsureLoaded();
            return !string.IsNullOrEmpty(fullHash) && scannedHashes.Contains(fullHash);
        }

        public bool TryRegister(string fullHash)
        {
            EnsureLoaded();

            if (string.IsNullOrEmpty(fullHash) || scannedHashes.Contains(fullHash))
            {
                return false;
            }

            scannedHashes.Add(fullHash);
            Save();
            return true;
        }

        public void ClearAll()
        {
            EnsureLoaded();
            scannedHashes.Clear();
            PlayerPrefs.DeleteKey(PlayerPrefsKey);
            PlayerPrefs.Save();
        }

        private void EnsureLoaded()
        {
            if (isLoaded)
            {
                return;
            }

            isLoaded = true;
            Load();
        }

        private void Load()
        {
            scannedHashes.Clear();

            string stored = PlayerPrefs.GetString(PlayerPrefsKey, string.Empty);
            if (string.IsNullOrEmpty(stored))
            {
                return;
            }

            string[] entries = stored.Split('|');
            foreach (string entry in entries)
            {
                if (!string.IsNullOrEmpty(entry))
                {
                    scannedHashes.Add(entry);
                }
            }
        }

        private void Save()
        {
            string serialized = string.Join("|", scannedHashes);
            PlayerPrefs.SetString(PlayerPrefsKey, serialized);
            PlayerPrefs.Save();
        }
    }
}
