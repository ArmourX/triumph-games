using System.Collections.Generic;
using System.Text;
using UnityEngine;

namespace MonsterCollect.Core.Analytics
{
    /// <summary>Default sink — logs events to the Unity console during development.</summary>
    public sealed class DebugLogAnalyticsSink : IAnalyticsSink
    {
        public void TrackEvent(string eventName, IReadOnlyDictionary<string, object> parameters = null)
        {
            if (string.IsNullOrEmpty(eventName))
            {
                return;
            }

            if (parameters == null || parameters.Count == 0)
            {
                Debug.Log($"[Analytics] {eventName}");
                return;
            }

            var builder = new StringBuilder(eventName);
            builder.Append(" {");

            bool first = true;
            foreach (KeyValuePair<string, object> pair in parameters)
            {
                if (!first)
                {
                    builder.Append(", ");
                }

                builder.Append(pair.Key).Append('=').Append(pair.Value);
                first = false;
            }

            builder.Append('}');
            Debug.Log($"[Analytics] {builder}");
        }
    }
}
