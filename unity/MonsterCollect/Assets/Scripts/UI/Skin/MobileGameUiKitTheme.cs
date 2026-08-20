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

        [Header("Home Hub Panels")]
        public Sprite homeSunsetBackground;
        public Sprite profileBar;
        public Sprite currencyPill;
        public Sprite sidePanelLeft;
        public Sprite sidePanelRight;
        public Sprite horizontalPanel;
        public Sprite slotPanel;
        public Sprite platformPedestal;

        [Header("Home Hub Controls")]
        public Sprite buttonAdventure;
        public Sprite progressTrack;
        public Sprite progressFill;
        public Sprite notificationBadge;
        public Sprite avatarFrame;
        public Sprite levelBadgeSprite;
        public Sprite iconChest;

        [Header("Home Hub Icons")]
        public Sprite iconGift;
        public Sprite iconShop;
        public Sprite iconMonsters;
        public Sprite iconFriends;
        public Sprite iconSettings;
        public Sprite iconCalendar;
        public Sprite iconLightning;
        public Sprite iconShard;
        public Sprite iconCoin;
        public Sprite iconGem;
        public Sprite iconTicket;

        [Header("Text Colors")]
        public Color titleColor = new Color(1f, 0.98f, 0.92f, 1f);
        public Color bodyColor = new Color(0.95f, 0.97f, 1f, 1f);
        public Color mutedColor = new Color(0.78f, 0.84f, 0.92f, 1f);
        public Color buttonLabelColor = Color.white;

        public bool IsComplete =>
            sceneBackground != null &&
            panelModal != null &&
            buttonPrimary != null &&
            bodyFont != null &&
            currencyPill != null;
    }
}
