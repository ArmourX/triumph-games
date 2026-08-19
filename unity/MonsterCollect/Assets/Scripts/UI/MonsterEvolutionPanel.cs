using System.Collections.Generic;
using System.Text;
using MonsterCollect.Appearance;
using MonsterCollect.Core;
using MonsterCollect.Monster;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Evolution path picker with before/after preview and confirmation.</summary>
    [DisallowMultipleComponent]
    public class MonsterEvolutionPanel : MonoBehaviour
    {
        public static MonsterEvolutionPanel Instance { get; private set; }

        private bool uiBuilt;
        private GameObject rootPanel;
        private RawImage beforeImage;
        private RawImage afterImage;
        private Text titleText;
        private Text pathText;
        private Text statsText;
        private Text messageText;
        private Button prevPathButton;
        private Button nextPathButton;
        private Button confirmButton;
        private Button closeButton;

        private MonsterData boundMonster;
        private List<EvolutionEligibility> paths = new List<EvolutionEligibility>();
        private int selectedPathIndex;

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

        public static void Show(MonsterData monster)
        {
            if (monster == null)
            {
                return;
            }

            MonsterEvolutionPanel panel = Instance ?? FindObjectOfType<MonsterEvolutionPanel>(true);
            if (panel == null)
            {
                Canvas canvas = FindObjectOfType<Canvas>();
                if (canvas == null)
                {
                    return;
                }

                var go = new GameObject("MonsterEvolutionPanel", typeof(RectTransform), typeof(MonsterEvolutionPanel));
                go.transform.SetParent(canvas.transform, false);
                panel = go.GetComponent<MonsterEvolutionPanel>();
            }

            panel.Open(monster);
        }

        private void Open(MonsterData monster)
        {
            boundMonster = monster;
            MonsterEvolutionService.EnsureIdentityFields(monster);
            paths = new List<EvolutionEligibility>(MonsterEvolutionService.GetEligiblePaths(monster));
            selectedPathIndex = 0;
            for (int i = 0; i < paths.Count; i++)
            {
                if (paths[i].IsEligible)
                {
                    selectedPathIndex = i;
                    break;
                }
            }

            Refresh();
            rootPanel.SetActive(true);
            gameObject.SetActive(true);
        }

        private void Hide()
        {
            rootPanel?.SetActive(false);
        }

        private void HideImmediate() => Hide();

        private void Refresh()
        {
            if (boundMonster == null)
            {
                return;
            }

            titleText.text = $"Evolve {boundMonster.GetDisplayName()}";
            MonsterPortraitUiHelper.Bind(beforeImage, boundMonster, 220, animated: true);

            if (paths.Count == 0)
            {
                pathText.text = "No evolution paths available.";
                statsText.text = string.Empty;
                afterImage.texture = null;
                confirmButton.interactable = false;
                return;
            }

            selectedPathIndex = Mathf.Clamp(selectedPathIndex, 0, paths.Count - 1);
            EvolutionEligibility entry = paths[selectedPathIndex];
            EvolutionPathEntry path = entry.Path;
            pathText.text = $"{path.displayName}\n{path.description}\n\n{(entry.IsEligible ? "Ready!" : entry.Reason)}";

            MonsterData preview = MonsterEvolutionService.GeneratePreview(boundMonster, path.pathId);
            if (preview != null)
            {
                MonsterPortraitUiHelper.Bind(afterImage, preview, 220, animated: true);
                statsText.text = BuildStatComparison(boundMonster, preview, path);
            }
            else
            {
                statsText.text = "Preview unavailable.";
            }

            confirmButton.interactable = entry.IsEligible;
            prevPathButton.interactable = paths.Count > 1;
            nextPathButton.interactable = paths.Count > 1;
            messageText.text = $"Stage {boundMonster.EvolutionStage} → {path.toStage}";
        }

        private static string BuildStatComparison(MonsterData before, MonsterData after, EvolutionPathEntry path)
        {
            var builder = new StringBuilder();
            builder.AppendLine("Stat changes");
            builder.Append("HP ").Append(before.Hp).Append(" → ").AppendLine(after.Hp.ToString());
            builder.Append("ATK ").Append(before.Attack).Append(" → ").AppendLine(after.Attack.ToString());
            builder.Append("DEF ").Append(before.Defense).Append(" → ").AppendLine(after.Defense.ToString());
            builder.Append("SPD ").Append(before.Speed).Append(" → ").AppendLine(after.Speed.ToString());
            if (path.unlockMoveIds != null && path.unlockMoveIds.Length > 0)
            {
                builder.Append("Moves: ").Append(string.Join(", ", path.unlockMoveIds));
            }

            return builder.ToString();
        }

        private void CyclePath(int delta)
        {
            if (paths.Count == 0)
            {
                return;
            }

            selectedPathIndex = (selectedPathIndex + delta + paths.Count) % paths.Count;
            Refresh();
            GameFeedbackService.Instance?.PlayUiTap();
        }

        private void ConfirmEvolve()
        {
            if (boundMonster == null || paths.Count == 0)
            {
                return;
            }

            EvolutionPathEntry path = paths[selectedPathIndex].Path;
            if (MonsterEvolutionService.TryEvolve(boundMonster, path.pathId, out string message))
            {
                messageText.text = message;
                MonsterAppearanceCompositor.ClearCache();
                GameFeedbackService.Instance?.PlayQuestComplete();
                Refresh();
                return;
            }

            messageText.text = message;
            GameFeedbackService.Instance?.PlayError();
        }

        private void EnsureUi()
        {
            if (uiBuilt)
            {
                return;
            }

            uiBuilt = true;
            Font font = MobileGameUiKit.BodyFont;
            rootPanel = gameObject;
            Stretch(GetComponent<RectTransform>());

            var dim = CreateImage("Dim", transform, new Color(0f, 0f, 0f, 0.82f));
            Stretch(dim.rectTransform);

            var card = CreateImage("Card", transform, new Color(0.1f, 0.13f, 0.18f, 0.98f));
            var cardRect = card.rectTransform;
            cardRect.anchorMin = new Vector2(0.06f, 0.08f);
            cardRect.anchorMax = new Vector2(0.94f, 0.92f);
            cardRect.offsetMin = Vector2.zero;
            cardRect.offsetMax = Vector2.zero;

            titleText = CreateText("Title", card.transform, font, 28, FontStyle.Bold, TextAnchor.UpperCenter);
            Anchor(titleText.rectTransform, 0.05f, 0.88f, 0.95f, 0.97f);

            beforeImage = CreatePortrait("Before", card.transform, 0.08f, 0.52f, 0.28f, 0.84f);
            afterImage = CreatePortrait("After", card.transform, 0.36f, 0.52f, 0.56f, 0.84f);

            pathText = CreateText("Path", card.transform, font, 18, FontStyle.Normal, TextAnchor.UpperLeft);
            Anchor(pathText.rectTransform, 0.58f, 0.52f, 0.95f, 0.84f);
            pathText.horizontalOverflow = HorizontalWrapMode.Wrap;

            statsText = CreateText("Stats", card.transform, font, 17, FontStyle.Normal, TextAnchor.UpperLeft);
            Anchor(statsText.rectTransform, 0.08f, 0.24f, 0.95f, 0.5f);
            statsText.horizontalOverflow = HorizontalWrapMode.Wrap;

            messageText = CreateText("Message", card.transform, font, 18, FontStyle.Italic, TextAnchor.MiddleCenter);
            Anchor(messageText.rectTransform, 0.08f, 0.16f, 0.95f, 0.23f);

            prevPathButton = CreateButton("Prev", card.transform, font, "◀ Path", 0.08f, 0.08f, 0.24f, 0.14f);
            prevPathButton.onClick.AddListener(() => CyclePath(-1));
            nextPathButton = CreateButton("Next", card.transform, font, "Path ▶", 0.26f, 0.08f, 0.42f, 0.14f);
            nextPathButton.onClick.AddListener(() => CyclePath(1));
            confirmButton = CreateButton("Confirm", card.transform, font, "Evolve!", 0.44f, 0.08f, 0.68f, 0.14f);
            confirmButton.onClick.AddListener(ConfirmEvolve);
            closeButton = CreateButton("Close", card.transform, font, "Close", 0.72f, 0.08f, 0.92f, 0.14f);
            closeButton.onClick.AddListener(Hide);
        }

        private static RawImage CreatePortrait(string name, Transform parent, float minX, float minY, float maxX, float maxY)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(RawImage));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(minX, minY);
            rect.anchorMax = new Vector2(maxX, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            return go.GetComponent<RawImage>();
        }

        private static Image CreateImage(string name, Transform parent, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            var image = go.GetComponent<Image>();
            image.color = color;
            return image;
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
            go.GetComponent<Image>().color = new Color(0.2f, 0.45f, 0.72f, 1f);

            var labelGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            labelGo.transform.SetParent(go.transform, false);
            Stretch(labelGo.GetComponent<RectTransform>());
            var labelText = labelGo.GetComponent<Text>();
            labelText.font = font;
            labelText.fontSize = 18;
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

        private static void Anchor(RectTransform rect, float minX, float minY, float maxX, float maxY)
        {
            rect.anchorMin = new Vector2(minX, minY);
            rect.anchorMax = new Vector2(maxX, maxY);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }
}
