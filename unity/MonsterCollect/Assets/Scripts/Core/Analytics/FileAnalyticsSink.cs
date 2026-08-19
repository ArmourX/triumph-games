using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEngine;

namespace MonsterCollect.Core.Analytics
{
    /// <summary>Persists analytics events locally for soft-launch review (no network required).</summary>
    public sealed class FileAnalyticsSink : IAnalyticsSink
    {
        private const string LogFileName = "analytics_log.jsonl";
        private static readonly object Gate = new object();

        public void TrackEvent(string eventName, IReadOnlyDictionary<string, object> parameters = null)
        {
            if (string.IsNullOrEmpty(eventName))
            {
                return;
            }

            try
            {
                string path = Path.Combine(Application.persistentDataPath, LogFileName);
                var builder = new StringBuilder();
                builder.Append("{\"t\":\"").Append(DateTimeOffset.UtcNow.ToString("o")).Append("\",\"e\":\"").Append(Escape(eventName)).Append("\"");

                if (parameters != null)
                {
                    foreach (KeyValuePair<string, object> pair in parameters)
                    {
                        builder.Append(",\"").Append(Escape(pair.Key)).Append("\":\"").Append(Escape(pair.Value?.ToString() ?? string.Empty)).Append("\"");
                    }
                }

                builder.Append("}\n");

                lock (Gate)
                {
                    File.AppendAllText(path, builder.ToString());
                }
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[FileAnalyticsSink] Failed to write event: {ex.Message}");
            }
        }

        private static string Escape(string value)
        {
            return string.IsNullOrEmpty(value) ? string.Empty : value.Replace("\\", "\\\\").Replace("\"", "\\\"");
        }
    }
}
