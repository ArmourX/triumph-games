using System.IO;
using MonsterCollect.Events;
using UnityEditor;
using UnityEngine;

namespace MonsterCollect.Editor
{
    public static class SeasonalEventCatalogGenerator
    {
        private const string EventsFolder = "Assets/Resources/Events";
        private const string CatalogPath = EventsFolder + "/SeasonalEventCatalog.asset";
        private const string JsonPath = "Assets/Resources/Config/events.json";

        [MenuItem("Monster Collect/Generate Default Seasonal Event Catalog")]
        public static void GenerateCatalog()
        {
            EnsureFolder(EventsFolder);
            EnsureFolder("Assets/Resources/Config");

            SeasonalEventCatalog runtime = RuntimeSeasonalEventCatalogFactory.Create();
            var savedEvents = new SeasonalEventDefinition[runtime.Events.Length];

            for (int i = 0; i < runtime.Events.Length; i++)
            {
                SeasonalEventDefinition source = runtime.Events[i];
                string path = $"{EventsFolder}/{source.EventId}.asset";
                SeasonalEventDefinition asset = AssetDatabase.LoadAssetAtPath<SeasonalEventDefinition>(path);
                if (asset == null)
                {
                    asset = ScriptableObject.CreateInstance<SeasonalEventDefinition>();
                    AssetDatabase.CreateAsset(asset, path);
                }

                CopyDefinition(source, asset);
                EditorUtility.SetDirty(asset);
                savedEvents[i] = asset;
            }

            SeasonalEventCatalog catalog = AssetDatabase.LoadAssetAtPath<SeasonalEventCatalog>(CatalogPath);
            if (catalog == null)
            {
                catalog = ScriptableObject.CreateInstance<SeasonalEventCatalog>();
                AssetDatabase.CreateAsset(catalog, CatalogPath);
            }

            catalog.Events = savedEvents;
            EditorUtility.SetDirty(catalog);
            AssetDatabase.SaveAssets();
            Debug.Log("[SeasonalEventCatalogGenerator] Wrote SeasonalEventCatalog and event assets.");
        }

        [MenuItem("Monster Collect/Export Seasonal Events JSON")]
        public static void ExportJson()
        {
            EnsureFolder("Assets/Resources/Config");
            SeasonalEventCatalog catalog = AssetDatabase.LoadAssetAtPath<SeasonalEventCatalog>(CatalogPath);
            if (catalog == null || catalog.Events == null || catalog.Events.Length == 0)
            {
                catalog = RuntimeSeasonalEventCatalogFactory.Create();
            }

            var payload = new EventCatalogJson { version = "1" };
            var entries = new EventJsonEntry[catalog.Events.Length];
            for (int i = 0; i < catalog.Events.Length; i++)
            {
                entries[i] = EventJsonLoader.FromDefinition(catalog.Events[i]);
            }

            payload.events = entries;
            string json = JsonUtility.ToJson(payload, true);
            File.WriteAllText(JsonPath, json);
            AssetDatabase.Refresh();
            Debug.Log($"[SeasonalEventCatalogGenerator] Exported {catalog.Events.Length} events to {JsonPath}");
        }

        private static void CopyDefinition(SeasonalEventDefinition source, SeasonalEventDefinition target)
        {
            target.EventId = source.EventId;
            target.DisplayName = source.DisplayName;
            target.Description = source.Description;
            target.Priority = source.Priority;
            target.BannerColor = source.BannerColor;
            target.ScheduleKind = source.ScheduleKind;
            target.StartUtc = source.StartUtc;
            target.EndUtc = source.EndUtc;
            target.LocalStartDate = source.LocalStartDate;
            target.LocalEndDate = source.LocalEndDate;
            target.AnnualStartMonth = source.AnnualStartMonth;
            target.AnnualStartDay = source.AnnualStartDay;
            target.AnnualEndMonth = source.AnnualEndMonth;
            target.AnnualEndDay = source.AnnualEndDay;
            target.PreferUtcWhenOnline = source.PreferUtcWhenOnline;
            target.Modifiers = source.Modifiers;
            target.QrRules = source.QrRules;
            target.EventQuests = source.EventQuests;
            target.ExclusiveMoveIds = source.ExclusiveMoveIds;
            target.ExclusiveItemIds = source.ExclusiveItemIds;
            target.DefaultVariantTag = source.DefaultVariantTag;
        }

        private static void EnsureFolder(string path)
        {
            if (!AssetDatabase.IsValidFolder(path))
            {
                string parent = Path.GetDirectoryName(path)?.Replace('\\', '/');
                string leaf = Path.GetFileName(path);
                if (!string.IsNullOrEmpty(parent) && !AssetDatabase.IsValidFolder(parent))
                {
                    EnsureFolder(parent);
                }

                AssetDatabase.CreateFolder(parent, leaf);
            }
        }
    }
}
