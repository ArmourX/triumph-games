using UnityEngine;

namespace MonsterCollect.UI
{
    /// <summary>Runtime accessor for the imported 2D Mobile Game UI Kit theme.</summary>
    public static class MobileGameUiKit
    {
        private static MobileGameUiKitTheme theme;
        private static Font fallbackFont;

        public static MobileGameUiKitTheme Theme
        {
            get
            {
                if (theme == null)
                {
                    theme = Resources.Load<MobileGameUiKitTheme>(MobileGameUiKitTheme.DefaultResourcePath);
                }

                return theme;
            }
        }

        public static bool IsAvailable => Theme != null && Theme.IsComplete;

        public static Font TitleFont => Theme?.titleFont ?? BodyFont;

        public static Font BodyFont
        {
            get
            {
                if (Theme?.bodyFont != null)
                {
                    return Theme.bodyFont;
                }

                if (fallbackFont == null)
                {
                    fallbackFont = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
                    if (fallbackFont == null)
                    {
                        fallbackFont = Resources.GetBuiltinResource<Font>("Arial.ttf");
                    }
                }

                return fallbackFont;
            }
        }

        public static Font LabelFont => Theme?.labelFont ?? BodyFont;
    }
}
