using MonsterCollect.Appearance;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.QR;
using MonsterCollect.Sharing;
using MonsterCollect.Social;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Displays a shareable QR code for an owned monster snapshot.</summary>
    [DisallowMultipleComponent]
    public class MonsterSharePanel : MonoBehaviour
    {
        [SerializeField] private GameObject rootPanel;
        [SerializeField] private RawImage qrImage;
        [SerializeField] private RawImage previewImage;
        [SerializeField] private Text titleText;
        [SerializeField] private Text detailsText;
        [SerializeField] private Text payloadText;
        [SerializeField] private Button closeButton;
        [SerializeField] private Button copyButton;
        [SerializeField] private Button publishButton;
        [SerializeField] private Button showcaseButton;
        [SerializeField] private Button saveImageButton;

        private Texture2D qrTexture;
        private string activePayload;
        private MonsterData boundMonster;

        private void Awake()
        {
            if (closeButton != null)
            {
                closeButton.onClick.AddListener(Hide);
            }

            EnsureCopyButton();
            EnsureCommunityButtons();
            HideImmediate();
        }

        private void EnsureCopyButton()
        {
            if (copyButton != null)
            {
                copyButton.onClick.AddListener(CopyPayloadToClipboard);
                return;
            }

            copyButton = GetComponentInChildren<Button>(true);
            if (copyButton != null && closeButton != null && copyButton == closeButton)
            {
                copyButton = null;
            }

            if (copyButton == null && rootPanel != null)
            {
                Transform parent = rootPanel.transform.Find("Card") ?? rootPanel.transform;
                var go = new GameObject("CopyButton", typeof(RectTransform), typeof(Image), typeof(Button));
                go.transform.SetParent(parent, false);
                var rect = go.GetComponent<RectTransform>();
                rect.anchorMin = new Vector2(0.72f, 0.08f);
                rect.anchorMax = new Vector2(0.94f, 0.16f);
                rect.offsetMin = Vector2.zero;
                rect.offsetMax = Vector2.zero;
                go.GetComponent<Image>().color = new Color(0.22f, 0.45f, 0.65f, 1f);

                Font font = MobileGameUiKit.BodyFont;
                var labelGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
                labelGo.transform.SetParent(go.transform, false);
                var labelRect = labelGo.GetComponent<RectTransform>();
                labelRect.anchorMin = Vector2.zero;
                labelRect.anchorMax = Vector2.one;
                labelRect.offsetMin = Vector2.zero;
                labelRect.offsetMax = Vector2.zero;
                var label = labelGo.GetComponent<Text>();
                label.font = font;
                label.fontSize = 20;
                label.alignment = TextAnchor.MiddleCenter;
                label.color = Color.white;
                label.text = "Copy Code";

                copyButton = go.GetComponent<Button>();
            }

            copyButton?.onClick.AddListener(CopyPayloadToClipboard);
        }

        private void EnsureCommunityButtons()
        {
            publishButton = EnsureExtraButton(publishButton, "PublishButton", "Publish", 0.08f, 0.08f, 0.36f, 0.14f, PublishToGallery);
            showcaseButton = EnsureExtraButton(showcaseButton, "ShowcaseButton", "Showcase", 0.38f, 0.08f, 0.60f, 0.14f, PublishToShowcase);
            saveImageButton = EnsureExtraButton(saveImageButton, "SaveImageButton", "Save PNG", 0.08f, 0.02f, 0.36f, 0.07f, SavePngCard);
        }

        private Button EnsureExtraButton(Button existing, string name, string label, float minX, float minY, float maxX, float maxY, UnityEngine.Events.UnityAction action)
        {
            if (existing != null)
            {
                existing.onClick.RemoveListener(action);
                existing.onClick.AddListener(action);
                return existing;
            }

            Transform parent = rootPanel != null ? rootPanel.transform : transform;
            Transform card = parent.Find("Card");
            if (card != null)
            {
                parent = card;
            }
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(minX, minY);
            rect.anchorMax = new Vector2(maxX, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            go.GetComponent<Image>().color = new Color(0.18f, 0.42f, 0.72f, 1f);

            Font font = MobileGameUiKit.BodyFont;
            var labelGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            labelGo.transform.SetParent(go.transform, false);
            var labelRect = labelGo.GetComponent<RectTransform>();
            labelRect.anchorMin = Vector2.zero;
            labelRect.anchorMax = Vector2.one;
            labelRect.offsetMin = Vector2.zero;
            labelRect.offsetMax = Vector2.zero;
            var labelText = labelGo.AddComponent<Text>();
            labelText.font = font;
            labelText.fontSize = 18;
            labelText.alignment = TextAnchor.MiddleCenter;
            labelText.color = Color.white;
            labelText.text = label;

            Button button = go.GetComponent<Button>();
            button.onClick.AddListener(action);
            return button;
        }

        private void PublishToGallery()
        {
            if (!CommunityGalleryService.TryPublish(boundMonster, CommunityVisibility.Public, true, out string message))
            {
                SetStatus(message);
                return;
            }

            SetStatus(message);
        }

        private void PublishToShowcase()
        {
            if (!CommunityGalleryService.TryPublish(boundMonster, CommunityVisibility.Friends, true, out string message))
            {
                SetStatus(message);
                return;
            }

            SetStatus(message);
        }

        private void SavePngCard()
        {
            if (boundMonster == null || string.IsNullOrEmpty(activePayload))
            {
                return;
            }

            string path = CommunityGalleryService.SaveShareCard(boundMonster, activePayload);
            SetStatus(string.IsNullOrEmpty(path) ? "Could not save PNG." : $"Saved share card:\n{path}");
        }

        private void SetStatus(string message)
        {
            if (detailsText != null)
            {
                detailsText.text = message;
            }
        }

        private void OnDestroy()
        {
            ReleaseQrTexture();
        }

        public void Show(MonsterData monster)
        {
            if (monster == null)
            {
                return;
            }

            ReleaseQrTexture();
            boundMonster = monster;
            activePayload = MonsterShareCodec.Encode(monster);
            qrTexture = QRCodeGenerator.GenerateTexture(activePayload, 420, 2);
            MonsterPortraitUiHelper.Bind(previewImage, monster, 180, animated: false);

            if (qrImage != null)
            {
                qrImage.texture = qrTexture;
            }

            if (titleText != null)
            {
                titleText.text = "Share Monster";
            }

            MonsterCollectionService.EnsureSocialLoaded();

            if (detailsText != null)
            {
                detailsText.text =
                    $"{monster.Name} · #{monster.DexNumber:D3} · Lv {monster.Raising?.level ?? 1}\n" +
                    $"Your friend code: {SocialProfileService.FriendCode}\n" +
                    "Friends scan this QR to receive an exact copy.\n" +
                    "Publish to the gallery or friend showcase, or save a PNG.";
            }

            if (payloadText != null)
            {
                payloadText.text = TruncatePayload(activePayload);
            }

            if (rootPanel != null)
            {
                rootPanel.SetActive(true);
            }

            gameObject.SetActive(true);
        }

        public void Hide()
        {
            if (rootPanel != null)
            {
                rootPanel.SetActive(false);
            }
        }

        private void HideImmediate()
        {
            Hide();
        }

        private void CopyPayloadToClipboard()
        {
            if (string.IsNullOrEmpty(activePayload))
            {
                return;
            }

            GUIUtility.systemCopyBuffer = activePayload;

            if (detailsText != null)
            {
                detailsText.text = "Share code copied to clipboard!";
            }
        }

        private static string TruncatePayload(string payload)
        {
            if (string.IsNullOrEmpty(payload) || payload.Length <= 48)
            {
                return payload;
            }

            return payload.Substring(0, 24) + "…" + payload.Substring(payload.Length - 16);
        }

        private void ReleaseQrTexture()
        {
            if (qrTexture != null)
            {
                if (qrImage != null && qrImage.texture == qrTexture)
                {
                    qrImage.texture = null;
                }

                Destroy(qrTexture);
                qrTexture = null;
            }

            activePayload = null;
        }
    }
}
