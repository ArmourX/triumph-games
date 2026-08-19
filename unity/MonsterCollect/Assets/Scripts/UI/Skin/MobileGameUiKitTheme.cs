using UnityEngine;

namespace MonsterCollect.UI
{
    /// <summary>Sprite and font references from the 300Mind 2D Mobile Game UI Kit.</summary>
    [CreateAssetMenu(fileName = "MobileGameUiKitTheme", menuName = "Monster Collect/Mobile Game UI Kit Theme")]
    public class MobileGameUiKitTheme : ScriptableObject
    {
        public const string DefaultResourcePath = "UI/MobileGameUiKitTheme";

        [Header("Backgrounds")]
        public Sprite sceneBackground;
        public Sprite panelModal;
        public Sprite navBarBackground;

        [Header("Buttons")]
        public Sprite buttonPrimary;
        public Sprite buttonSecondary;
        public Sprite buttonTab;
        public Sprite buttonTabActive;
        public Sprite headerBar;

        [Header("Typography")]
        public Font titleFont;
        public Font bodyFont;
        public Font labelFont;

        [Header("Text Colors")]
        public Color titleColor = new Color(1f, 0.98f, 0.92f, 1f);
        public Color bodyColor = new Color(0.95f, 0.97f, 1f, 1f);
        public Color mutedColor = new Color(0.78f, 0.84f, 0.92f, 1f);
        public Color buttonLabelColor = Color.white;

        public bool IsComplete =>
            sceneBackground != null &&
            panelModal != null &&
            buttonPrimary != null &&
            bodyFont != null;
    }
}
