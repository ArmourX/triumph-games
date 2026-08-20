using System.Collections.Generic;
using System.Text;
using MonsterCollect.Appearance;
using MonsterCollect.Core;
using MonsterCollect.Monster;
using TMPro;
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
        private TMP_Text titleText;
        private TMP_Text pathText;
        private TMP_Text statsText;
        private TMP_Text messageText;
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
                panel = KitUi.EnsureOverlay<MonsterEvolutionPanel>("MonsterEvolutionPanel");
                if (panel == null)
                {
                    return;
                }
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
            rootPanel = gameObject;
            KitUi.Stretch(GetComponent<RectTransform>() ?? gameObject.AddComponent<RectTransform>());
            TmpFonts.PrepareCanvas(GetComponentInParent<Canvas>());

            KitUi.Dim(transform);
            Image card = KitUi.Card(transform, 0.06f, 0.08f, 0.94f, 0.92f);

            titleText = KitUi.Label(card.transform, "Title", "Evolution", 30, TextAlignmentOptions.Center, title: true);
            KitUi.Anchor(titleText.rectTransform, 0.05f, 0.88f, 0.95f, 0.97f);

            beforeImage = CreatePortrait("Before", card.transform, 0.08f, 0.52f, 0.28f, 0.84f);
            afterImage = CreatePortrait("After", card.transform, 0.36f, 0.52f, 0.56f, 0.84f);

            pathText = KitUi.Label(card.transform, "Path", string.Empty, 18, TextAlignmentOptions.TopLeft);
            KitUi.Anchor(pathText.rectTransform, 0.58f, 0.52f, 0.95f, 0.84f);
            pathText.enableWordWrapping = true;

            statsText = KitUi.Label(card.transform, "Stats", string.Empty, 17, TextAlignmentOptions.TopLeft);
            KitUi.Anchor(statsText.rectTransform, 0.08f, 0.24f, 0.95f, 0.5f);
            statsText.enableWordWrapping = true;

            messageText = KitUi.Label(card.transform, "Message", string.Empty, 18, TextAlignmentOptions.Center);
            KitUi.Anchor(messageText.rectTransform, 0.08f, 0.16f, 0.95f, 0.23f);

            prevPathButton = KitUi.Button(card.transform, "Prev", "◀ PATH", 0.08f, 0.08f, 0.24f, 0.14f, () => CyclePath(-1), secondary: true);
            nextPathButton = KitUi.Button(card.transform, "Next", "PATH ▶", 0.26f, 0.08f, 0.42f, 0.14f, () => CyclePath(1), secondary: true);
            confirmButton = KitUi.Button(card.transform, "Confirm", "EVOLVE!", 0.44f, 0.08f, 0.68f, 0.14f, ConfirmEvolve);
            closeButton = KitUi.Button(card.transform, "Close", "CLOSE", 0.72f, 0.08f, 0.92f, 0.14f, Hide, secondary: true);
        }

        private static RawImage CreatePortrait(string name, Transform parent, float minX, float minY, float maxX, float maxY)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(RawImage));
            go.transform.SetParent(parent, false);
            KitUi.Anchor(go.GetComponent<RectTransform>(), minX, minY, maxX, maxY);
            return go.GetComponent<RawImage>();
        }
    }
}
