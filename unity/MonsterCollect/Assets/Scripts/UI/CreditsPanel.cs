using MonsterCollect.Core;
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
            CreditsPanel panel = Instance ?? FindObjectOfType<CreditsPanel>(true);
            if (panel == null)
            {
                Canvas canvas = FindObjectOfType<Canvas>();
                if (canvas == null)
                {
                    return;
                }

                var go = new GameObject("CreditsPanel", typeof(RectTransform), typeof(CreditsPanel));
                go.transform.SetParent(canvas.transform, false);
                panel = go.GetComponent<CreditsPanel>();
            }

            panel.Show();
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
            Font font = MobileGameUiKit.BodyFont;
            var rect = GetComponent<RectTransform>() ?? gameObject.AddComponent<RectTransform>();
            Stretch(rect);

            var dim = new GameObject("Dim", typeof(RectTransform), typeof(Image));
            dim.transform.SetParent(transform, false);
            dim.GetComponent<Image>().color = new Color(0f, 0f, 0f, 0.82f);
            Stretch(dim.GetComponent<RectTransform>());

            var card = new GameObject("Card", typeof(RectTransform), typeof(Image));
            card.transform.SetParent(transform, false);
            var cardRect = card.GetComponent<RectTransform>();
            cardRect.anchorMin = new Vector2(0.1f, 0.12f);
            cardRect.anchorMax = new Vector2(0.9f, 0.88f);
            cardRect.offsetMin = Vector2.zero;
            cardRect.offsetMax = Vector2.zero;
            card.GetComponent<Image>().color = new Color(0.08f, 0.1f, 0.16f, 0.98f);

            var title = CreateText("Title", card.transform, font, 34, FontStyle.Bold, TextAnchor.UpperCenter);
            AnchorTop(title.rectTransform, 0.82f, 0.95f);
            title.text = "Credits";

            var body = CreateText("Body", card.transform, font, 22, FontStyle.Normal, TextAnchor.UpperLeft);
            body.rectTransform.anchorMin = new Vector2(0.08f, 0.18f);
            body.rectTransform.anchorMax = new Vector2(0.92f, 0.8f);
            body.rectTransform.offsetMin = Vector2.zero;
            body.rectTransform.offsetMax = Vector2.zero;
            body.horizontalOverflow = HorizontalWrapMode.Wrap;
            body.text =
                "Monster Collect\n" +
                "© Triumph Games\n\n" +
                "Game design & engineering: Triumph Games\n" +
                "QR scanning: ZXing.Net (Apache 2.0)\n" +
                "Unity 6 · Universal Render Pipeline\n\n" +
                "Scan real-world QR codes to discover monsters,\n" +
                "raise them on your ranch, battle, breed, and share.\n\n" +
                "Version " + Application.version;

            closeButton = CreateButton("Close", card.transform, font, "Close", 0.3f, 0.06f, 0.7f, 0.14f);
            closeButton.onClick.AddListener(Hide);
        }

        private static Text CreateText(string name, Transform parent, Font font, int size, FontStyle style, TextAnchor anchor)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent, false);
            var text = go.GetComponent<Text>();
            text.font = font;
            text.fontSize = size;
            text.fontStyle = style;
            text.alignment = anchor;
            text.color = Color.white;
            return text;
        }

        private static Button CreateButton(string name, Transform parent, Font font, string label, float minX, float minY, float maxX, float maxY)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(minX, minY);
            rect.anchorMax = new Vector2(maxX, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            go.GetComponent<Image>().color = new Color(0.22f, 0.42f, 0.65f, 1f);

            var labelGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            labelGo.transform.SetParent(go.transform, false);
            Stretch(labelGo.GetComponent<RectTransform>());
            var labelText = labelGo.GetComponent<Text>();
            labelText.font = font;
            labelText.fontSize = 24;
            labelText.alignment = TextAnchor.MiddleCenter;
            labelText.color = Color.white;
            labelText.text = label;

            return go.GetComponent<Button>();
        }

        private static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private static void AnchorTop(RectTransform rect, float minY, float maxY)
        {
            rect.anchorMin = new Vector2(0.05f, minY);
            rect.anchorMax = new Vector2(0.95f, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }
}
