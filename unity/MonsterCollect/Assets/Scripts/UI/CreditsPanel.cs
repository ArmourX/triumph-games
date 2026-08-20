using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>In-game credits and attribution.</summary>
    [DisallowMultipleComponent]
    public class CreditsPanel : MonoBehaviour
    {
        public static CreditsPanel Instance { get; private set; }

        private bool uiBuilt;
        private GameObject rootPanel;
        private Button closeButton;

        private void Awake()
        {
            Instance = this;
            EnsureUi();
            HideImmediate();
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        public static void ShowPanel()
        {
            CreditsPanel panel = Instance ?? FindObjectOfType<CreditsPanel>(true) ??
                                 KitUi.EnsureOverlay<CreditsPanel>("CreditsPanel");
            panel?.Show();
        }

        public void Show()
        {
            EnsureUi();
            rootPanel?.SetActive(true);
            gameObject.SetActive(true);
        }

        public void Hide()
        {
            rootPanel?.SetActive(false);
        }

        private void HideImmediate() => Hide();

        private void EnsureUi()
        {
            if (uiBuilt)
            {
                return;
            }

            uiBuilt = true;
            rootPanel = gameObject;
            KitUi.Stretch(GetComponent<RectTransform>() ?? gameObject.AddComponent<RectTransform>());
            TmpFonts.PrepareCanvas(GetComponentInParent<Canvas>());

            KitUi.Dim(transform);
            Image card = KitUi.Card(transform, 0.12f, 0.12f, 0.88f, 0.88f);

            TMP_Text title = KitUi.Label(card.transform, "Title", "Credits", 34, TextAlignmentOptions.Center, title: true);
            KitUi.AnchorTop(title.rectTransform, 0.82f, 0.95f);

            TMP_Text body = KitUi.Label(card.transform, "Body", string.Empty, 22, TextAlignmentOptions.TopLeft);
            KitUi.Anchor(body.rectTransform, 0.08f, 0.18f, 0.92f, 0.8f);
            body.enableWordWrapping = true;
            body.text =
                "Monster Collect\n" +
                "© Triumph Games\n\n" +
                "Game design & engineering: Triumph Games\n" +
                "QR scanning: ZXing.Net (Apache 2.0)\n" +
                "Unity 6 · Universal Render Pipeline\n\n" +
                "Scan real-world QR codes to discover monsters,\n" +
                "raise them on your ranch, battle, breed, and share.\n\n" +
                "Version " + Application.version;

            closeButton = KitUi.Button(card.transform, "Close", "CLOSE", 0.3f, 0.06f, 0.7f, 0.14f, Hide, secondary: true);
        }
    }
}
