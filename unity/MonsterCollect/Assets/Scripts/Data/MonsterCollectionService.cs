using System;
using System.Collections.Generic;
using System.IO;
using MonsterCollect.Circuit;
using MonsterCollect.Core;
using MonsterCollect.Events;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using MonsterCollect.Ranch;
using MonsterCollect.Social;
using UnityEngine;

namespace MonsterCollect.Data
{
    /// <summary>
    /// Persistent ranch storage backed by JSON at <see cref="Application.persistentDataPath"/>.
    /// </summary>
    public static class MonsterCollectionService
    {
        public const int BaseMaxMonsters = 20;
        public const int MaxMonsters = BaseMaxMonsters;

        private const string SaveFileName = "monster_ranch.json";

        private static MonsterCollectionSaveData saveData;
        private static bool isLoaded;
        private static bool notifyingCollectionChanged;
        private static bool saving;

        public static event Action CollectionChanged;

        public static int Count
        {
            get
            {
                EnsureLoaded();
                return saveData.monsters.Length;
            }
        }

        public static bool IsFull
        {
            get
            {
                EnsureLoaded();
                return saveData.monsters.Length >= MaxRanchSlots;
            }
        }

        public static int MaxRanchSlots
        {
            get
            {
                EnsureProgressionLoaded();
                return TrainerProgressionService.GetMaxRanchSlots();
            }
        }

        public static IReadOnlyList<MonsterData> Monsters
        {
            get
            {
                EnsureLoaded();
                return saveData.monsters;
            }
        }

        public static MonsterData ActiveMonster
        {
            get
            {
                EnsureLoaded();

                if (string.IsNullOrEmpty(saveData.activeMonsterId))
                {
                    return null;
                }

                return FindById(saveData.activeMonsterId);
            }
        }

        public static string ActiveMonsterId
        {
            get
            {
                EnsureLoaded();
                return saveData.activeMonsterId;
            }
        }

        public static int UnlockedDexCount
        {
            get
            {
                EnsureLoaded();
                return saveData.unlockedDexNumbers?.Length ?? 0;
            }
        }

        public static int RanchEssence
        {
            get
            {
                EnsureLoaded();
                return saveData.ranchEssence;
            }
        }

        public static int BreedsToday
        {
            get
            {
                EnsureLoaded();
                return saveData.breedsToday;
            }
        }

        public static string LastBreedDayKey
        {
            get
            {
                EnsureLoaded();
                return saveData.lastBreedDayKey ?? string.Empty;
            }
        }

        public static double LastBreedUtc
        {
            get
            {
                EnsureLoaded();
                return saveData.lastBreedUtc;
            }
        }

        public static int ScansToday
        {
            get
            {
                EnsureLoaded();
                return saveData.scansToday;
            }
        }

        public static string LastScanDayKey
        {
            get
            {
                EnsureLoaded();
                return saveData.lastScanDayKey ?? string.Empty;
            }
        }

        public static int DailyEnergy
        {
            get
            {
                EnsureLoaded();
                return saveData.dailyEnergy;
            }
        }

        public static string LastEnergyDayKey
        {
            get
            {
                EnsureLoaded();
                return saveData.lastEnergyDayKey ?? string.Empty;
            }
        }

        public static RanchProgressionState RanchProgression
        {
            get
            {
                EnsureLoaded();
                EnsureRanchProgression();
                return saveData.ranchProgression;
            }
        }

        public static ProgressionSaveState Progression
        {
            get
            {
                EnsureProgressionLoaded();
                return saveData.progression;
            }
        }

        public static SocialSaveState SocialState
        {
            get
            {
                EnsureSocialLoaded();
                return saveData.social;
            }
        }

        public static EventSaveState EventState
        {
            get
            {
                EnsureEventsLoaded();
                return saveData.events;
            }
        }

        public static ExplorationSaveState ExplorationState
        {
            get
            {
                EnsureExplorationLoaded();
                return saveData.exploration;
            }
        }

        public static TournamentSaveState TournamentState
        {
            get
            {
                EnsureTournamentLoaded();
                return saveData.tournament;
            }
        }

        public static int TotalDexEntries => DexCatalog.TotalEntries;

        public static bool IsDexUnlocked(int dexNumber)
        {
            EnsureLoaded();
            return IndexOfUnlockedDex(dexNumber) >= 0;
        }

        public static List<DexEntry> GetUnlockedDexEntries()
        {
            EnsureLoaded();
            var result = new List<DexEntry>();

            if (saveData.unlockedDexNumbers == null)
            {
                return result;
            }

            Array.Sort(saveData.unlockedDexNumbers);

            foreach (int dexNumber in saveData.unlockedDexNumbers)
            {
                DexEntry entry = DexCatalog.GetEntry(dexNumber);
                if (entry != null)
                {
                    result.Add(entry);
                }
            }

            return result;
        }

        public static bool UnlockDex(int dexNumber, bool notify = true)
        {
            EnsureLoaded();

            if (dexNumber < 1 || dexNumber > DexCatalog.TotalEntries)
            {
                return false;
            }

            if (IsDexUnlocked(dexNumber))
            {
                return false;
            }

            var list = new List<int>(saveData.unlockedDexNumbers ?? Array.Empty<int>()) { dexNumber };
            list.Sort();
            saveData.unlockedDexNumbers = list.ToArray();
            SaveInternal();

            if (notify)
            {
                NotifyCollectionChanged();
            }

            return true;
        }

        public static bool ContainsHash(string fullHash)
        {
            EnsureLoaded();

            if (string.IsNullOrEmpty(fullHash))
            {
                return false;
            }

            foreach (MonsterData monster in saveData.monsters)
            {
                if (monster.FullHash == fullHash)
                {
                    return true;
                }
            }

            return false;
        }

        public static bool TryAddMonster(MonsterData monster, out string errorMessage)
        {
            EnsureLoaded();
            errorMessage = null;

            if (monster == null)
            {
                errorMessage = "Invalid monster data.";
                return false;
            }

            if (!GameSettings.AllowDuplicateScans && ContainsHash(monster.FullHash))
            {
                errorMessage = "This monster is already in your ranch.";
                return false;
            }

            EnsureUniqueInstanceId(monster);

            if (IsFull)
            {
                errorMessage = $"Ranch is full ({MaxRanchSlots}/{MaxRanchSlots}). Release space to scan new monsters.";
                return false;
            }

            var list = new List<MonsterData>(saveData.monsters) { monster };
            saveData.monsters = list.ToArray();

            MonsterRaisingService.EnsureRaisingState(monster);

            if (monster.DexNumber <= 0)
            {
                monster.DexNumber = DexCatalog.ResolveDexNumberFromHashHex(monster.FullHash);
            }

            bool isNewDex = UnlockDex(monster.DexNumber, notify: false);

            if (string.IsNullOrEmpty(saveData.activeMonsterId))
            {
                saveData.activeMonsterId = monster.Id;
            }

            SaveInternal();

            try
            {
                ProgressionEventReporter.ReportMonsterCaptured(monster, isNewDex);
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[MonsterCollectionService] Post-capture progression update failed: {ex.Message}");
            }

            NotifyCollectionChanged();
            return true;
        }

        public static bool TrySpendEssence(int amount)
        {
            EnsureLoaded();

            if (amount <= 0 || saveData.ranchEssence < amount)
            {
                return false;
            }

            saveData.ranchEssence -= amount;
            SaveInternal();
            NotifyCollectionChanged();
            return true;
        }

        public static void AddEssence(int amount)
        {
            EnsureLoaded();

            if (amount <= 0)
            {
                return;
            }

            saveData.ranchEssence += amount;
            SaveInternal();
            NotifyCollectionChanged();
        }

        public static void RecordBreeding(double utcNowSeconds)
        {
            EnsureLoaded();
            saveData.breedsToday++;
            saveData.lastBreedUtc = utcNowSeconds;
            SaveInternal();
            NotifyCollectionChanged();
        }

        public static void ResetDailyBreedingCounters(string dayKey)
        {
            EnsureLoaded();
            saveData.lastBreedDayKey = dayKey;
            saveData.breedsToday = 0;
            SaveInternal();
        }

        public static void RecordScan(double utcNowSeconds)
        {
            EnsureLoaded();
            saveData.scansToday++;
            SaveInternal();
        }

        public static void RefundLastScan()
        {
            EnsureLoaded();
            if (saveData.scansToday <= 0)
            {
                return;
            }

            saveData.scansToday--;
            SaveInternal();
        }

        public static void ResetDailyScanCounters(string dayKey)
        {
            EnsureLoaded();
            saveData.lastScanDayKey = dayKey;
            saveData.scansToday = 0;
            SaveInternal();
        }

        public static void ResetDailyEnergy(string dayKey)
        {
            EnsureLoaded();
            saveData.lastEnergyDayKey = dayKey;
            saveData.dailyEnergy = RanchEnergyService.DailyMax;
            SaveInternal();
            NotifyCollectionChanged();
        }

        public static bool SpendDailyEnergy(int amount)
        {
            EnsureLoaded();

            if (amount <= 0 || saveData.dailyEnergy < amount)
            {
                return false;
            }

            saveData.dailyEnergy -= amount;
            SaveInternal();
            NotifyCollectionChanged();
            return true;
        }

        public static void RefundDailyEnergy(int amount)
        {
            EnsureLoaded();

            if (amount <= 0)
            {
                return;
            }

            saveData.dailyEnergy = Mathf.Min(RanchEnergyService.DailyMax, saveData.dailyEnergy + amount);
            SaveInternal();
            NotifyCollectionChanged();
        }

        public static bool TryRemoveMonster(string monsterId, out string errorMessage)
        {
            EnsureLoaded();
            errorMessage = null;

            if (string.IsNullOrEmpty(monsterId))
            {
                errorMessage = "Invalid monster.";
                return false;
            }

            var list = new List<MonsterData>(saveData.monsters);
            int index = list.FindIndex(m => m.Id == monsterId);

            if (index < 0)
            {
                errorMessage = "Monster not found.";
                return false;
            }

            list.RemoveAt(index);
            saveData.monsters = list.ToArray();

            if (saveData.activeMonsterId == monsterId)
            {
                saveData.activeMonsterId = saveData.monsters.Length > 0 ? saveData.monsters[0].Id : string.Empty;
            }

            SaveInternal();
            NotifyCollectionChanged();
            return true;
        }

        public static bool SetActiveMonster(string monsterId)
        {
            EnsureLoaded();

            if (string.IsNullOrEmpty(monsterId) || FindById(monsterId) == null)
            {
                return false;
            }

            if (saveData.activeMonsterId == monsterId)
            {
                return true;
            }

            saveData.activeMonsterId = monsterId;
            SaveInternal();
            NotifyCollectionChanged();
            return true;
        }

        public static MonsterData FindById(string monsterId)
        {
            EnsureLoaded();

            if (string.IsNullOrEmpty(monsterId))
            {
                return null;
            }

            foreach (MonsterData monster in saveData.monsters)
            {
                if (monster.Id == monsterId)
                {
                    MonsterRaisingService.EnsureRaisingState(monster);
                    MonsterEvolutionService.EnsureIdentityFields(monster);
                    return monster;
                }
            }

            return null;
        }

        /// <summary>Assigns a ranch-unique Id when duplicate captures are allowed.</summary>
        public static void EnsureUniqueInstanceId(MonsterData monster)
        {
            if (!GameSettings.AllowDuplicateScans || monster == null)
            {
                return;
            }

            EnsureLoaded();

            if (FindById(monster.Id) == null)
            {
                return;
            }

            string prefix = string.IsNullOrEmpty(monster.FullHash)
                ? monster.Id
                : monster.FullHash.Substring(0, Mathf.Min(8, monster.FullHash.Length));

            for (int attempt = 1; attempt < 10_000; attempt++)
            {
                string candidate = $"{prefix}{attempt:x4}";
                if (FindById(candidate) == null)
                {
                    monster.Id = candidate;
                    return;
                }
            }

            monster.Id = $"{prefix}{DateTime.UtcNow.Ticks:x}";
        }

        public static bool UpdateMonster(MonsterData updatedMonster, bool notify = true)
        {
            EnsureLoaded();

            if (updatedMonster == null || string.IsNullOrEmpty(updatedMonster.Id))
            {
                return false;
            }

            for (int i = 0; i < saveData.monsters.Length; i++)
            {
                if (saveData.monsters[i].Id != updatedMonster.Id)
                {
                    continue;
                }

                MonsterRaisingService.EnsureRaisingState(updatedMonster);
                saveData.monsters[i] = updatedMonster;
                SaveInternal();

                if (notify)
                {
                    NotifyCollectionChanged();
                }

                return true;
            }

            return false;
        }

        /// <summary>
        /// Advances care meters for the active monster and saves without re-entering UI refresh loops.
        /// </summary>
        public static bool SimulateActiveMonster(double utcNowSeconds)
        {
            MonsterData active = ActiveMonster;

            AdventureService.ProcessDue(utcNowSeconds);
            if (active == null)
            {
                return false;
            }

            double previousTimestamp = active.Raising?.lastSimulatedUtc ?? utcNowSeconds;
            MonsterRaisingService.SimulateElapsedTime(active, utcNowSeconds);

            if (active.Raising != null && Math.Abs(active.Raising.lastSimulatedUtc - previousTimestamp) < 0.001d)
            {
                return false;
            }

            return UpdateMonster(active, notify: false);
        }

        public static void ClearAll()
        {
            saveData = new MonsterCollectionSaveData();
            isLoaded = true;
            SaveInternal();
            NotifyCollectionChanged();
        }

        internal static void EnsureLoadedForCheats()
        {
            EnsureLoaded();
        }

        internal static void CheatReplaceMonsters(List<MonsterData> monsters)
        {
            EnsureLoaded();
            saveData.monsters = monsters?.ToArray() ?? Array.Empty<MonsterData>();

            foreach (MonsterData monster in saveData.monsters)
            {
                MonsterRaisingService.EnsureRaisingState(monster);
            }

            saveData.activeMonsterId = saveData.monsters.Length > 0 ? saveData.monsters[0].Id : string.Empty;
            SaveInternal();
            NotifyCollectionChanged();
        }

        internal static void CheatSetDailyEnergy(int amount)
        {
            EnsureLoaded();
            saveData.dailyEnergy = Mathf.Clamp(amount, 0, RanchEnergyService.DailyMax);
            saveData.lastEnergyDayKey = RanchEnergyService.GetLocalDayKey();
            SaveInternal();
            NotifyCollectionChanged();
        }

        internal static void CheatSetUnlockedDexNumbers(int[] dexNumbers)
        {
            EnsureLoaded();
            saveData.unlockedDexNumbers = dexNumbers ?? Array.Empty<int>();
            SaveInternal();
            NotifyCollectionChanged();
        }

        internal static void NotifyCollectionChanged()
        {
            if (notifyingCollectionChanged)
            {
                return;
            }

            notifyingCollectionChanged = true;
            try
            {
                Action handlers = CollectionChanged;
                handlers?.Invoke();
            }
            finally
            {
                notifyingCollectionChanged = false;
            }
        }

        public static void EnsureRanchSystemsLoaded()
        {
            EnsureLoaded();
            EnsureRanchProgression();
            EnsureInventory();
            EnsureProgressionLoaded();
        }

        public static void EnsureProgressionLoaded()
        {
            EnsureLoaded();
            if (saveData.progression == null)
            {
                saveData.progression = ProgressionSaveState.CreateDefault();
            }

            if (saveData.progression.unlockedTrainingTypes == null ||
                saveData.progression.unlockedTrainingTypes.Length == 0)
            {
                saveData.progression.unlockedTrainingTypes = new[] { "strength", "agility" };
            }
        }

        public static void EnsureProgressionReady()
        {
            EnsureProgressionLoaded();
            QuestService.EnsureInitialized();
        }

        public static void SaveProgression()
        {
            EnsureLoaded();
            SaveInternal();
        }

        public static void EnsureSocialLoaded()
        {
            EnsureLoaded();
            if (saveData.social == null)
            {
                saveData.social = SocialSaveState.CreateDefault();
            }

            if (string.IsNullOrEmpty(saveData.social.friendCode))
            {
                saveData.social.friendCode = FriendCodeService.Generate();
                SaveInternal();
            }
        }

        public static void SaveSocial()
        {
            EnsureSocialLoaded();
            SaveInternal();
            NotifyCollectionChanged();
        }

        public static void EnsureEventsLoaded()
        {
            EnsureLoaded();
            if (saveData.events == null)
            {
                saveData.events = EventSaveState.CreateDefault();
                SaveInternal();
            }
        }

        public static void SaveEvents()
        {
            EnsureEventsLoaded();
            SaveInternal();
            NotifyCollectionChanged();
        }

        public static void EnsureExplorationLoaded()
        {
            EnsureLoaded();
            if (saveData.exploration == null)
            {
                saveData.exploration = ExplorationSaveState.CreateDefault();
                SaveInternal();
            }
        }

        public static void SaveExploration()
        {
            EnsureExplorationLoaded();
            SaveInternal();
            NotifyCollectionChanged();
        }

        public static void EnsureTournamentLoaded()
        {
            EnsureLoaded();
            if (saveData.tournament == null)
            {
                saveData.tournament = TournamentSaveState.CreateDefault();
                SaveInternal();
            }
        }

        public static void SaveTournament()
        {
            EnsureTournamentLoaded();
            SaveInternal();
            NotifyCollectionChanged();
        }

        public static IReadOnlyList<InventoryEntry> GetInventorySnapshot()
        {
            EnsureRanchSystemsLoaded();
            return saveData.inventory ?? Array.Empty<InventoryEntry>();
        }

        public static void AddInventoryItem(string itemId, int amount)
        {
            EnsureRanchSystemsLoaded();
            if (string.IsNullOrEmpty(itemId) || amount <= 0)
            {
                return;
            }

            var list = new List<InventoryEntry>(saveData.inventory ?? Array.Empty<InventoryEntry>());
            bool found = false;

            for (int i = 0; i < list.Count; i++)
            {
                if (list[i].itemId == itemId)
                {
                    list[i].quantity += amount;
                    found = true;
                    break;
                }
            }

            if (!found)
            {
                list.Add(new InventoryEntry(itemId, amount));
            }

            saveData.inventory = list.ToArray();
            SaveInternal();
            NotifyCollectionChanged();
        }

        public static bool TryRemoveInventoryItem(string itemId, int amount)
        {
            EnsureRanchSystemsLoaded();
            if (string.IsNullOrEmpty(itemId) || amount <= 0)
            {
                return false;
            }

            var list = new List<InventoryEntry>(saveData.inventory ?? Array.Empty<InventoryEntry>());

            for (int i = 0; i < list.Count; i++)
            {
                if (list[i].itemId != itemId)
                {
                    continue;
                }

                if (list[i].quantity < amount)
                {
                    return false;
                }

                list[i].quantity -= amount;
                if (list[i].quantity <= 0)
                {
                    list.RemoveAt(i);
                }

                saveData.inventory = list.ToArray();
                SaveInternal();
                NotifyCollectionChanged();
                return true;
            }

            return false;
        }

        public static void GrantStarterInventoryIfNeeded()
        {
            EnsureRanchSystemsLoaded();
            if (saveData.ranchProgression.starterItemsGranted)
            {
                return;
            }

            saveData.ranchProgression.starterItemsGranted = true;
            AddInventoryItem("apple", 5);
            AddInventoryItem("care_treat", 2);
            AddInventoryItem("herbal_tonic", 1);
        }

        public static void AddCarePoints(int amount)
        {
            EnsureRanchSystemsLoaded();
            saveData.ranchProgression.carePoints += amount;
            SaveInternal();
            NotifyCollectionChanged();
        }

        public static void UnlockFacility(string facilityId)
        {
            EnsureRanchSystemsLoaded();
            if (string.IsNullOrEmpty(facilityId))
            {
                return;
            }

            var list = new List<string>(saveData.ranchProgression.unlockedFacilityIds ?? Array.Empty<string>());
            if (list.Contains(facilityId))
            {
                return;
            }

            list.Add(facilityId);
            saveData.ranchProgression.unlockedFacilityIds = list.ToArray();
            SaveInternal();
            NotifyCollectionChanged();
        }

        public static bool SetSelectedBackground(string backgroundId)
        {
            EnsureRanchSystemsLoaded();
            saveData.ranchProgression.selectedBackgroundId = backgroundId;
            SaveInternal();
            NotifyCollectionChanged();
            return true;
        }

        public static bool TryPlaceDecoration(string decorationId, int essenceCost)
        {
            EnsureRanchSystemsLoaded();
            var list = new List<string>(saveData.ranchProgression.placedDecorationIds ?? Array.Empty<string>());

            if (list.Contains(decorationId))
            {
                return false;
            }

            if (list.Count >= RuntimeRanchCustomizationCatalogFactory.MaxDecorations)
            {
                return false;
            }

            if (!TrySpendEssence(essenceCost))
            {
                return false;
            }

            list.Add(decorationId);
            saveData.ranchProgression.placedDecorationIds = list.ToArray();
            SaveInternal();
            NotifyCollectionChanged();
            return true;
        }

        public static bool TryRemoveDecoration(string decorationId)
        {
            EnsureRanchSystemsLoaded();
            var list = new List<string>(saveData.ranchProgression.placedDecorationIds ?? Array.Empty<string>());
            if (!list.Remove(decorationId))
            {
                return false;
            }

            saveData.ranchProgression.placedDecorationIds = list.ToArray();
            SaveInternal();
            NotifyCollectionChanged();
            return true;
        }

        public static int GetTotalBattleWins()
        {
            EnsureLoaded();
            int wins = 0;

            foreach (MonsterData monster in saveData.monsters)
            {
                if (monster?.Raising != null)
                {
                    wins += monster.Raising.battleWins;
                }
            }

            return wins;
        }

        private static void EnsureRanchProgression()
        {
            if (saveData.ranchProgression == null)
            {
                saveData.ranchProgression = RanchProgressionState.CreateDefault();
            }

            if (saveData.ranchProgression.unlockedFacilityIds == null ||
                saveData.ranchProgression.unlockedFacilityIds.Length == 0)
            {
                saveData.ranchProgression.unlockedFacilityIds = new[] { "facility_gym" };
            }

            if (string.IsNullOrEmpty(saveData.ranchProgression.selectedBackgroundId))
            {
                saveData.ranchProgression.selectedBackgroundId = "bg_meadow";
            }

            if (saveData.ranchProgression.placedDecorationIds == null)
            {
                saveData.ranchProgression.placedDecorationIds = Array.Empty<string>();
            }
        }

        private static void EnsureInventory()
        {
            if (saveData.inventory == null)
            {
                saveData.inventory = Array.Empty<InventoryEntry>();
            }
        }

        private static void EnsureLoaded()
        {
            if (isLoaded)
            {
                return;
            }

            isLoaded = true;
            LoadInternal();
        }

        private static void LoadInternal()
        {
            string path = GetSavePath();

            if (!File.Exists(path))
            {
                saveData = new MonsterCollectionSaveData();
                InitializeFreshSaveData();
                return;
            }

            try
            {
                string json = File.ReadAllText(path);
                saveData = JsonUtility.FromJson<MonsterCollectionSaveData>(json) ?? new MonsterCollectionSaveData();

                if (saveData.monsters == null)
                {
                    saveData.monsters = Array.Empty<MonsterData>();
                }

                foreach (MonsterData monster in saveData.monsters)
                {
                    MonsterRaisingService.EnsureRaisingState(monster);
                    MonsterEvolutionService.EnsureIdentityFields(monster);

                    if (monster.DexNumber <= 0)
                    {
                        monster.DexNumber = DexCatalog.ResolveDexNumberFromHashHex(monster.FullHash);
                    }

                    UnlockDex(monster.DexNumber, notify: false);
                }

                if (saveData.unlockedDexNumbers == null)
                {
                    saveData.unlockedDexNumbers = Array.Empty<int>();
                }

                if (saveData.ranchEssence <= 0)
                {
                    saveData.ranchEssence = MonsterBreedingService.StartingRanchEssence;
                }

                RanchEnergyService.EnsureDailyReset();

                if (string.IsNullOrEmpty(saveData.lastEnergyDayKey))
                {
                    saveData.dailyEnergy = RanchEnergyService.DailyMax;
                    saveData.lastEnergyDayKey = RanchEnergyService.GetLocalDayKey();
                }

                EnsureRanchProgression();
                EnsureInventory();
                EnsureProgressionReady();
                EnsureSocialLoaded();
                EnsureEventsLoaded();
                EnsureExplorationLoaded();
                EnsureTournamentLoaded();
                GrantStarterInventoryIfNeeded();
                RanchProgressionService.RefreshFacilityUnlocks();
            }
            catch (Exception ex)
            {
                Debug.LogError($"[MonsterCollectionService] Failed to load save: {ex.Message}");
                saveData = new MonsterCollectionSaveData();
            }
        }

        private static void InitializeFreshSaveData()
        {
            if (saveData.monsters == null)
            {
                saveData.monsters = Array.Empty<MonsterData>();
            }

            if (saveData.unlockedDexNumbers == null)
            {
                saveData.unlockedDexNumbers = Array.Empty<int>();
            }

            if (saveData.ranchEssence <= 0)
            {
                saveData.ranchEssence = MonsterBreedingService.StartingRanchEssence;
            }

            if (string.IsNullOrEmpty(saveData.lastEnergyDayKey))
            {
                saveData.dailyEnergy = RanchEnergyService.DailyMax;
                saveData.lastEnergyDayKey = RanchEnergyService.GetLocalDayKey();
            }

            EnsureProgressionLoaded();
            EnsureSocialLoaded();
            EnsureEventsLoaded();
            EnsureExplorationLoaded();
            EnsureTournamentLoaded();
            EnsureRanchProgression();
            EnsureInventory();
        }

        private static void SaveInternal()
        {
            if (saving)
            {
                return;
            }

            saving = true;
            try
            {
                string path = GetSavePath();
                string directory = Path.GetDirectoryName(path);

                if (!string.IsNullOrEmpty(directory))
                {
                    Directory.CreateDirectory(directory);
                }

                string json = JsonUtility.ToJson(saveData, prettyPrint: true);
                File.WriteAllText(path, json);
            }
            catch (Exception ex)
            {
                Debug.LogError($"[MonsterCollectionService] Failed to save: {ex.Message}");
            }
            finally
            {
                saving = false;
            }
        }

        private static string GetSavePath()
        {
            return Path.Combine(Application.persistentDataPath, SaveFileName);
        }

        private static int IndexOfUnlockedDex(int dexNumber)
        {
            if (saveData.unlockedDexNumbers == null)
            {
                return -1;
            }

            for (int i = 0; i < saveData.unlockedDexNumbers.Length; i++)
            {
                if (saveData.unlockedDexNumbers[i] == dexNumber)
                {
                    return i;
                }
            }

            return -1;
        }
    }
}
