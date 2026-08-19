using System.Collections.Generic;

namespace MonsterCollect.Core.Analytics
{
    public interface IAnalyticsSink
    {
        void TrackEvent(string eventName, IReadOnlyDictionary<string, object> parameters = null);
    }
}
