using System;
using System.Collections.Generic;
using MonsterCollect.Battle;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Active battle HUD with arena layout, dynamic skill buttons, and turn indicator.</summary>
    [DisallowMultipleComponent]
    public class BattleHudView : MonoBehaviour
    {
        private const int SkillSlotCount = 4;
        private const int MaxEnergy = 5;

        [SerializeField] private GameObject rootPanel;
        [SerializeField] private BattleArenaHud arenaHud;
        [SerializeField] private BattleCombatantView playerView;
        [SerializeField] private BattleCombatantView opponentView;
        [SerializeField] private Text logText;
        [SerializeField] private Text turnIndicatorText;
        [SerializeField] private RectTransform moveButtonRoot;
        [SerializeField] private Button attackButton;
        [SerializeField] private Button defendButton;
        [SerializeField] private Button specialButton;
        [SerializeField] private Button utilityDefendButton;
        [SerializeField] private Button utilitySpecialButton;

        private readonly List<Button> dynamicMoveButtons = new List<Button>();
        private BattleManager boundManager;
        private int currentEnergy = MaxEnergy;
        private string lastOpponentMoveLabel = string.Empty;

        public event Action<string> MoveRequested;

        private void Awake()
        {
            arenaHud ??= GetComponent<BattleArenaHud>();
            if (arenaHud == null)
            {
                arenaHud = gameObject.AddComponent<BattleArenaHud>();
            }

            arenaHud.EnsureLayout();
            EnsureMoveButtonRoot();
            EnsureUtilityButtons();
            HideLegacyButtons();
            HideLegacyCombatantPanels();
        }

        private void HideChromeBackdrop()
        {
            Transform root = rootPanel != null ? rootPanel.transform : transform;
            Image rootImage = root.GetComponent<Image>();
            if (rootImage != null)
            {
                rootImage.color = Color.clear;
                rootImage.raycastTarget = false;
            }

            Transform log = root.Find("BattleLog");
            if (log != null && log.TryGetComponent(out Image logImage))
            {
                logImage.color = new Color(0.04f, 0.05f, 0.08f, 0.55f);
            }
        }

        private void HideLegacyCombatantPanels()
        {
            Transform root = rootPanel != null ? rootPanel.transform : transform;
            Transform playerPanel = root.Find("PlayerPanel");
            Transform opponentPanel = root.Find("OpponentPanel");
            if (playerPanel != null)
            {
                playerPanel.gameObject.SetActive(false);
            }

            if (opponentPanel != null)
            {
                opponentPanel.gameObject.SetActive(false);
            }
        }

        public void Show()
        {
            arenaHud?.EnsureLayout();
            BattleFocusLayout.SetBattleFocus(true);
            HideChromeBackdrop();

            if (rootPanel != null)
            {
                rootPanel.SetActive(true);
            }
        }

        public void Hide()
        {
            if (rootPanel != null)
            {
                rootPanel.SetActive(false);
            }
        }

        public void Bind(BattleContext context)
        {
            currentEnergy = MaxEnergy;
            lastOpponentMoveLabel = string.Empty;
            arenaHud?.OnBattleStarted();
            arenaHud?.RefreshMatchBar(context);
            arenaHud?.RefreshEnergy(currentEnergy);
            arenaHud?.SetOpponentIntent(string.Empty);

            playerView?.Bind(context.Player);
            opponentView?.Bind(context.Opponent);
            arenaHud?.PlayerNameplate?.Set(context.Player);
            arenaHud?.OpponentNameplate?.Set(context.Opponent);
            SetLog(string.Empty);
            RebuildMoveButtons(context?.Player);
        }

        public void Refresh(BattleManager manager)
        {
            boundManager = manager;

            if (manager?.Context == null)
            {
                return;
            }

            playerView?.Refresh(manager.Context.Player);
            opponentView?.Refresh(manager.Context.Opponent);
            arenaHud?.PlayerNameplate?.Set(manager.Context.Player);
            arenaHud?.OpponentNameplate?.Set(manager.Context.Opponent);

            if (logText != null)
            {
                logText.text = manager.LastMessage;
            }

            if (turnIndicatorText != null)
            {
                turnIndicatorText.text = manager.TurnIndicator;
            }

            UpdateOpponentIntent(manager);
            bool canAct = manager.IsWaitingForPlayerInput && !manager.IsBusy;

            if (canAct)
            {
                currentEnergy = MaxEnergy;
                arenaHud?.RefreshEnergy(currentEnergy);
            }

            SetDynamicButtonsInteractable(canAct);
            SetUtilityButtonsInteractable(canAct);

            if (utilitySpecialButton != null && manager.Context.Player != null)
            {
                utilitySpecialButton.interactable = canAct && !manager.Context.Player.SpecialUsed;
            }
        }

        public void PlayAttackAnimation(bool playerAttacked)
        {
            if (playerAttacked)
            {
                playerView?.PlayAttack();
            }
            else
            {
                opponentView?.PlayAttack();
            }
        }

        private void UpdateOpponentIntent(BattleManager manager)
        {
            if (arenaHud == null)
            {
                return;
            }

            if (manager.TurnIndicator == "Enemy turn" && !string.IsNullOrEmpty(manager.LastMessage))
            {
                lastOpponentMoveLabel = ExtractMoveLabel(manager.LastMessage);
            }

            if (manager.TurnIndicator == "Your turn" && !string.IsNullOrEmpty(lastOpponentMoveLabel))
            {
                arenaHud.SetOpponentIntent(lastOpponentMoveLabel);
            }
        }

        private static string ExtractMoveLabel(string message)
        {
            const string usedToken = " used ";
            int usedIndex = message.IndexOf(usedToken, StringComparison.OrdinalIgnoreCase);
            if (usedIndex < 0)
            {
                return string.Empty;
            }

            int start = usedIndex + usedToken.Length;
            int end = message.IndexOf(" for ", start, StringComparison.OrdinalIgnoreCase);
            if (end < 0)
            {
                end = message.IndexOf('!', start);
            }

            if (end < 0)
            {
                end = message.Length;
            }

            return message.Substring(start, end - start).Trim();
        }

        private void RebuildMoveButtons(BattleCombatant player)
        {
            ClearDynamicButtons();

            if (player == null)
            {
                return;
            }

            EnsureMoveButtonRoot();
            IReadOnlyList<BattleMove> moves = BattleMoveRegistry.GetMovesForCombatant(player);
            Font font = logText != null ? logText.font : MobileGameUiKit.BodyFont;

            for (int i = 0; i < SkillSlotCount; i++)
            {
                if (i < moves.Count)
                {
                    BattleMove move = moves[i];
                    Button button = CreateSkillButton(move, font, i);
                    dynamicMoveButtons.Add(button);
                }
                else if (i == SkillSlotCount - 1)
                {
                    dynamicMoveButtons.Add(CreateLockedSkillButton(font, i, "Evo Lvl. 5"));
                }
                else
                {
                    dynamicMoveButtons.Add(CreateLockedSkillButton(font, i, "Locked"));
                }
            }
        }

        private Button CreateSkillButton(BattleMove move, Font font, int slotIndex)
        {
            var go = new GameObject($"Skill_{move.Id}", typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(moveButtonRoot, false);
            LayoutSkillSlot(go.GetComponent<RectTransform>(), slotIndex);

            var image = go.GetComponent<Image>();
            image.color = GetMoveColor(move);

            var labelGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            labelGo.transform.SetParent(go.transform, false);
            Stretch(labelGo.GetComponent<RectTransform>());
            var label = labelGo.GetComponent<Text>();
            label.font = font;
            label.fontSize = 16;
            label.fontStyle = FontStyle.Bold;
            label.alignment = TextAnchor.UpperCenter;
            label.color = Color.white;
            label.text = move.DisplayName;

            int cost = GetMoveCost(move);
            CreateCostBadge(go.transform, font, cost);

            Button button = go.GetComponent<Button>();
            string moveId = move.Id;
            button.onClick.AddListener(() =>
            {
                if (cost > currentEnergy)
                {
                    return;
                }

                currentEnergy = Mathf.Max(0, currentEnergy - cost);
                arenaHud?.RefreshEnergy(currentEnergy);
                MoveRequested?.Invoke(moveId);
            });

            return button;
        }

        private Button CreateLockedSkillButton(Font font, int slotIndex, string labelText)
        {
            var go = new GameObject($"SkillLocked_{slotIndex}", typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(moveButtonRoot, false);
            LayoutSkillSlot(go.GetComponent<RectTransform>(), slotIndex);
            go.GetComponent<Image>().color = new Color(0.14f, 0.16f, 0.2f, 0.92f);

            var labelGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            labelGo.transform.SetParent(go.transform, false);
            Stretch(labelGo.GetComponent<RectTransform>());
            var label = labelGo.GetComponent<Text>();
            label.font = font;
            label.fontSize = 14;
            label.alignment = TextAnchor.MiddleCenter;
            label.color = new Color(0.55f, 0.58f, 0.65f);
            label.text = labelText;

            Button button = go.GetComponent<Button>();
            button.interactable = false;
            return button;
        }

        private static void LayoutSkillSlot(RectTransform rect, int slotIndex)
        {
            float width = 0.23f;
            float gap = 0.015f;
            float minX = slotIndex * (width + gap) + 0.01f;
            rect.anchorMin = new Vector2(minX, 0.04f);
            rect.anchorMax = new Vector2(minX + width, 0.96f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private static void CreateCostBadge(Transform parent, Font font, int cost)
        {
            var badgeGo = new GameObject("Cost", typeof(RectTransform), typeof(Image));
            badgeGo.transform.SetParent(parent, false);
            var badgeRect = badgeGo.GetComponent<RectTransform>();
            badgeRect.anchorMin = new Vector2(0.34f, 0.02f);
            badgeRect.anchorMax = new Vector2(0.66f, 0.22f);
            badgeRect.offsetMin = Vector2.zero;
            badgeRect.offsetMax = Vector2.zero;
            badgeGo.GetComponent<Image>().color = new Color(0.15f, 0.45f, 0.92f, 1f);

            var textGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            textGo.transform.SetParent(badgeGo.transform, false);
            Stretch(textGo.GetComponent<RectTransform>());
            var text = textGo.GetComponent<Text>();
            text.font = font;
            text.fontSize = 16;
            text.fontStyle = FontStyle.Bold;
            text.alignment = TextAnchor.MiddleCenter;
            text.color = Color.white;
            text.text = cost.ToString();
        }

        private static int GetMoveCost(BattleMove move)
        {
            if (move is DataDrivenBattleMove dataMove)
            {
                if (dataMove.Definition.IsDefendMove)
                {
                    return 0;
                }

                if (dataMove.Definition.OneUsePerBattle)
                {
                    return 3;
                }

                return Mathf.Clamp(Mathf.CeilToInt(dataMove.Definition.Power / 25f), 1, 3);
            }

            if (move.Id == DefendMove.MoveId)
            {
                return 0;
            }

            if (move.Id == SpecialMove.MoveId)
            {
                return 3;
            }

            return 1;
        }

        private static Color GetMoveColor(BattleMove move)
        {
            if (move is DataDrivenBattleMove dataMove)
            {
                return dataMove.Definition.Element switch
                {
                    BattleElement.Fire => new Color(0.92f, 0.45f, 0.18f, 0.98f),
                    BattleElement.Water => new Color(0.22f, 0.55f, 0.92f, 0.98f),
                    BattleElement.Grass => new Color(0.22f, 0.72f, 0.35f, 0.98f),
                    BattleElement.Electric => new Color(0.85f, 0.78f, 0.18f, 0.98f),
                    _ => new Color(0.35f, 0.42f, 0.55f, 0.98f)
                };
            }

            if (move.Id == DefendMove.MoveId)
            {
                return new Color(0.28f, 0.55f, 0.35f, 0.98f);
            }

            if (move.Id == SpecialMove.MoveId)
            {
                return new Color(0.72f, 0.28f, 0.82f, 0.98f);
            }

            return new Color(0.92f, 0.45f, 0.18f, 0.98f);
        }

        private void EnsureMoveButtonRoot()
        {
            if (moveButtonRoot != null)
            {
                return;
            }

            arenaHud?.EnsureLayout();
            if (arenaHud?.SkillButtonRoot != null)
            {
                moveButtonRoot = arenaHud.SkillButtonRoot;
            }
        }

        private void EnsureUtilityButtons()
        {
            if (utilityDefendButton != null || arenaHud == null)
            {
                return;
            }

            arenaHud.EnsureLayout();
            Transform actionBar = arenaHud.transform.Find("ActionBar");
            if (actionBar == null)
            {
                return;
            }

            Font font = logText != null ? logText.font : MobileGameUiKit.BodyFont;
            utilityDefendButton = CreateUtilityButton(actionBar, font, "UtilityDefend", "⇄",
                new Vector2(0.90f, 0.52f), new Vector2(0.98f, 0.74f), () => MoveRequested?.Invoke(DefendMove.MoveId));
            utilitySpecialButton = CreateUtilityButton(actionBar, font, "UtilitySpecial", "✦",
                new Vector2(0.90f, 0.26f), new Vector2(0.98f, 0.48f), () => MoveRequested?.Invoke(SpecialMove.MoveId));
        }

        private static Button CreateUtilityButton(
            Transform parent,
            Font font,
            string name,
            string label,
            Vector2 anchorMin,
            Vector2 anchorMax,
            Action onClick)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            go.GetComponent<Image>().color = new Color(0.08f, 0.09f, 0.12f, 0.62f);

            var textGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            textGo.transform.SetParent(go.transform, false);
            Stretch(textGo.GetComponent<RectTransform>());
            var text = textGo.GetComponent<Text>();
            text.font = font;
            text.fontSize = 24;
            text.alignment = TextAnchor.MiddleCenter;
            text.color = Color.white;
            text.text = label;

            Button button = go.GetComponent<Button>();
            button.onClick.AddListener(() => onClick());
            return button;
        }

        private void ClearDynamicButtons()
        {
            for (int i = 0; i < dynamicMoveButtons.Count; i++)
            {
                if (dynamicMoveButtons[i] != null)
                {
                    Destroy(dynamicMoveButtons[i].gameObject);
                }
            }

            dynamicMoveButtons.Clear();
        }

        private void HideLegacyButtons()
        {
            SetLegacyButtonsVisible(false);
        }

        private void SetLegacyButtonsVisible(bool visible)
        {
            if (attackButton != null)
            {
                attackButton.gameObject.SetActive(visible);
            }

            if (defendButton != null)
            {
                defendButton.gameObject.SetActive(visible);
            }

            if (specialButton != null)
            {
                specialButton.gameObject.SetActive(visible);
            }
        }

        private void SetDynamicButtonsInteractable(bool interactable)
        {
            for (int i = 0; i < dynamicMoveButtons.Count; i++)
            {
                Button button = dynamicMoveButtons[i];
                if (button == null || button.name.Contains("Locked"))
                {
                    continue;
                }

                button.interactable = interactable;
            }
        }

        private void SetUtilityButtonsInteractable(bool interactable)
        {
            if (utilityDefendButton != null)
            {
                utilityDefendButton.interactable = interactable;
            }

            if (utilitySpecialButton != null)
            {
                utilitySpecialButton.interactable = interactable;
            }
        }

        private void SetLog(string message)
        {
            if (logText != null)
            {
                logText.text = message;
            }
        }

        private static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }
    }
}
