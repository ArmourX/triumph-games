using MonsterCollect.Monster;
using UnityEngine.UI;

namespace MonsterCollect.Appearance
{
    /// <summary>One-liner portrait binding for existing RawImage UI slots.</summary>
    public static class MonsterPortraitUiHelper
    {
        public static MonsterPortraitDisplay EnsureDisplay(RawImage target)
        {
            if (target == null)
            {
                return null;
            }

            MonsterPortraitDisplay display = target.GetComponent<MonsterPortraitDisplay>();
            if (display == null)
            {
                display = target.gameObject.AddComponent<MonsterPortraitDisplay>();
            }

            return display;
        }

        public static void Bind(RawImage target, MonsterData data, int size, bool animated = false)
        {
            MonsterPortraitDisplay display = EnsureDisplay(target);
            display?.Bind(data, size, animated);
        }
    }
}
