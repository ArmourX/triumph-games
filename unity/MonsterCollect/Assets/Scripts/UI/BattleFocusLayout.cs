using UnityEngine;

namespace MonsterCollect.UI
{
    /// <summary>Hides global scene chrome so battle fills the play frame.</summary>
    public static class BattleFocusLayout
    {
        private const float LeftRailWidth = 118f;
        private const float TopHudHeight = 84f;

        public static void SetBattleFocus(bool focused)
        {
            Canvas canvas = Object.FindObjectOfType<Canvas>();
            if (canvas == null)
            {
                return;
            }

            Transform safeArea = LandscapePlayFrame.FindContentRoot(canvas);
            if (safeArea == null)
            {
                return;
            }

            Transform leftRail = safeArea.Find("LeftRail");
            Transform topHud = safeArea.Find("TopHud");
            Transform content = safeArea.Find("Content");

            if (leftRail != null)
            {
                leftRail.gameObject.SetActive(!focused);
            }

            if (topHud != null)
            {
                topHud.gameObject.SetActive(!focused);
            }

            if (content is RectTransform contentRect)
            {
                contentRect.offsetMin = focused
                    ? new Vector2(8f, 8f)
                    : new Vector2(LeftRailWidth, 12f);
                contentRect.offsetMax = focused
                    ? new Vector2(-8f, -8f)
                    : new Vector2(-16f, -TopHudHeight - 8f);
            }
        }
    }
}
