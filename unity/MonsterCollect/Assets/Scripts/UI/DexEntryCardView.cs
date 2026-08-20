using System;
using MonsterCollect.Appearance;
using MonsterCollect.Monster;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Single dex slot — unlocked entries show data, locked entries show ???.</summary>
    [DisallowMultipleComponent]
    public class DexEntryCardView : MonoBehaviour
    {
        private static readonly Color LockedBackground = new Color(0.14f, 0.14f, 0.17f, 0.95f);
        private static readonly Color LockedAccent = new Color(0.22f, 0.22f, 0.26f, 1f);
        private static readonly Color LockedPreview = new Color(0.1f, 0.1f, 0.12f, 1f);

        [SerializeField] private Image backgroundImage;
        [SerializeField] private Image accentImage;
        [SerializeField] private RawImage previewImage;
        [SerializeField] private Text numberText;
        [SerializeField] private Text nameText;
        [SerializeField] private Text metaText;
        [SerializeField] private Button selectButton;

        private DexEntry boundEntry;
        private bool isUnlocked;

        public event Action<DexEntry, bool> EntrySelected;

        private void Awake()
        {
            if (selectButton != null)
            {
                selectButton.onClick.AddListener(OnSelectClicked);
            }
        }

        private void OnDestroy()
        {
            if (selectButton != null)
            {
                selectButton.onClick.RemoveListener(OnSelectClicked);
            }
        }

        public void Bind(DexEntry entry, bool unlocked)
        {
            boundEntry = entry;
            isUnlocked = unlocked;

            if (numberText != null)
            {
                numberText.text = $"#{entry.FormattedNumber}";
            }

            if (unlocked)
            {
                if (backgroundImage != null)
                {
                    UiSkinUtility.ApplyModalPanel(backgroundImage);
                }

                BindUnlocked(entry);
            }
            else
            {
                BindLocked();
            }
        }

        private void BindLocked()
        {
            if (backgroundImage != null)
            {
                UiSkinUtility.ApplyModalPanel(backgroundImage);
                backgroundImage.color = LockedBackground;
            }

            if (accentImage != null)
            {
                accentImage.color = LockedAccent;
            }

            if (previewImage != null)
            {
                previewImage.texture = null;
                previewImage.color = LockedPreview;
            }

            if (nameText != null)
            {
                nameText.text = "???";
            }

            if (metaText != null)
            {
                metaText.text = "???";
            }
        }

        private void BindUnlocked(DexEntry entry)
        {
            if (backgroundImage != null)
            {
                UiSkinUtility.ApplyModalPanel(backgroundImage);
                backgroundImage.color = new Color(entry.PrimaryColor.r, entry.PrimaryColor.g, entry.PrimaryColor.b, 0.55f);
            }

            if (accentImage != null)
            {
                accentImage.color = entry.SecondaryColor;
            }

            MonsterData preview = entry.ToPreviewMonster();

            if (previewImage != null)
            {
                previewImage.color = Color.white;
            }

            MonsterPortraitUiHelper.Bind(previewImage, preview, 128, animated: false);

            if (nameText != null)
            {
                nameText.text = entry.Name;
            }

            if (metaText != null)
            {
                metaText.text = $"{entry.Species} · {entry.Rarity}";
            }
        }

        private void OnSelectClicked()
        {
            if (boundEntry != null)
            {
                EntrySelected?.Invoke(boundEntry, isUnlocked);
            }
        }
    }
}
