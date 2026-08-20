using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Hides global scene chrome so battle fills the play frame and nav cannot exit mid-fight.</summary>
    public static class BattleFocusLayout
    {
        private const float LeftRailWidth = 118f;
        private const float TopHudHeight = 84f;

        private static Color contentColor = new Color(0.12f, 0.28f, 0.16f, 1f);
        private static bool contentColorStored;

        public static void SetBattleFocus(bool focused)
        {
            Canvas canvas = KitUi.ResolveGameCanvas();
            if (canvas == null)
            {
                return;
            }

            Transform searchRoot = canvas.transform;
            SetNamedActive(searchRoot, "LeftRail", !focused);
            SetNamedActive(searchRoot, "TopHud", !focused);

            Transform safeArea = LandscapePlayFrame.FindContentRoot(canvas);
            Transform content = FindNamed(safeArea != null ? safeArea : searchRoot, "Content");
            if (content is RectTransform contentRect)
            {
                contentRect.offsetMin = focused
                    ? Vector2.zero
                    : new Vector2(LeftRailWidth, 12f);
                contentRect.offsetMax = focused
                    ? Vector2.zero
                    : new Vector2(-16f, -TopHudHeight - 8f);

                Image contentImage = content.GetComponent<Image>();
                if (contentImage != null)
                {
                    if (!contentColorStored)
                    {
                        contentColor = contentImage.color;
                        contentColorStored = true;
                    }

                    contentImage.color = focused ? Color.clear : contentColor;
                    contentImage.raycastTarget = !focused;
                }
            }
        }

        private static void SetNamedActive(Transform root, string objectName, bool active)
        {
            Transform target = FindNamed(root, objectName);
            if (target == null)
            {
                return;
            }

            target.gameObject.SetActive(active);
        }

        private static Transform FindNamed(Transform root, string objectName)
        {
            if (root == null)
            {
                return null;
            }

            if (root.name == objectName)
            {
                return root;
            }

            Transform direct = root.Find(objectName);
            if (direct != null)
            {
                return direct;
            }

            for (int i = 0; i < root.childCount; i++)
            {
                Transform found = FindNamed(root.GetChild(i), objectName);
                if (found != null)
                {
                    return found;
                }
            }

            return null;
        }
    }
}
