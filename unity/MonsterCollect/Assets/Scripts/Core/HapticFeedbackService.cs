using UnityEngine;

namespace MonsterCollect.Core
{
    public static class HapticFeedbackService
    {
        public static void Light()
        {
            Pulse(15);
        }

        public static void Medium()
        {
            Pulse(35);
        }

        public static void Success()
        {
            Pulse(25);
        }

        public static void Error()
        {
            Pulse(45);
        }

        private static void Pulse(int milliseconds)
        {
            if (!GameSettings.HapticsEnabled)
            {
                return;
            }

#if UNITY_ANDROID || UNITY_IOS
            if (milliseconds > 0)
            {
                Handheld.Vibrate();
            }
#else
            _ = milliseconds;
#endif
        }
    }
}
