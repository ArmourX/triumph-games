using System;
using System.Collections;
using MonsterCollect.Appearance;
using MonsterCollect.Battle;
using MonsterCollect.Core;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using MonsterCollect.Social;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Split-screen VS intro shown before a fight starts.</summary>
    [DisallowMultipleComponent]
    public class BattleVsView : MonoBehaviour
    {
        [SerializeField] private GameObject rootPanel;
        [SerializeField] private RawImage playerPortrait;
        [SerializeField] private RawImage opponentPortrait;
        [SerializeField] private GameObject connectingOverlay;
        [SerializeField] private Text playerNameText;
        [SerializeField] private Text opponentNameText;
        [SerializeField] private Text playerRankText;
        [SerializeField] private Text opponentRankText;
        [SerializeField] private Text connectingText;
        [SerializeField] private Button cancelButton;
        [SerializeField] private Image spinner;

        private MonsterPortraitDisplay playerDisplay;
        private MonsterPortraitDisplay opponentDisplay;
        private Coroutine introRoutine;
        private bool layoutBuilt;
        private bool finished;
        private bool showing;

        public event Action Ready;
        public event Action Cancelled;

        public static BattleVsView Create(Transform parent)
        {
            var go = new GameObject("BattleVs", typeof(RectTransform));
            go.transform.SetParent(parent, false);
            BattleOverlayUi.Stretch(go.GetComponent<RectTransform>());
            var view = go.AddComponent<BattleVsView>();
            view.rootPanel = go;
            view.EnsureLayout();
            go.SetActive(false);
            return view;
        }

        private void Awake()
        {
            EnsureLayout();
            if (cancelButton != null)
            {
                cancelButton.onClick.RemoveListener(OnCancelClicked);
                cancelButton.onClick.AddListener(OnCancelClicked);
            }

            if (!showing)
            {
                HideImmediate();
            }
        }

        public void Show(BattleCombatant player, BattleCombatant opponent, bool waitToConnect)
        {
            finished = false;
            showing = true;
            EnsureLayout();
            BattleFocusLayout.SetBattleFocus(true);

            BindPortrait(ref playerDisplay, playerPortrait, player);
            BindPortrait(ref opponentDisplay, opponentPortrait, opponent);

            if (playerNameText != null)
            {
                playerNameText.text = SocialProfileService.DisplayName;
            }

            if (opponentNameText != null)
            {
                string remote = BattleSession.RemoteTrainerName;
                opponentNameText.text = waitToConnect
                    ? "???"
                    : !string.IsNullOrEmpty(remote)
                        ? remote
                        : opponent != null ? opponent.DisplayName : "Wild";
            }

            if (playerRankText != null)
            {
                playerRankText.text = $"★ {TrainerProgressionService.RankIndex + 1}";
            }

            if (opponentRankText != null)
            {
                opponentRankText.text = waitToConnect
                    ? "--"
                    : opponent != null ? $"Lv {opponent.Level}" : "Lv 1";
            }

            SetConnecting(waitToConnect || opponent == null);
            if (opponentPortrait != null)
            {
                opponentPortrait.enabled = !waitToConnect && opponent != null;
            }

            if (rootPanel != null)
            {
                rootPanel.SetActive(true);
            }

            gameObject.SetActive(true);
            transform.SetAsLastSibling();

            if (introRoutine != null)
            {
                StopCoroutine(introRoutine);
            }

            introRoutine = StartCoroutine(IntroSequence(opponent, waitToConnect));
        }

        public void Hide()
        {
            if (introRoutine != null)
            {
                StopCoroutine(introRoutine);
                introRoutine = null;
            }

            HideImmediate();
        }

        private void HideImmediate()
        {
            showing = false;
            if (rootPanel != null)
            {
                rootPanel.SetActive(false);
            }
            else
            {
                gameObject.SetActive(false);
            }
        }

        private IEnumerator IntroSequence(BattleCombatant opponent, bool waitToConnect)
        {
            if (waitToConnect)
            {
                float elapsed = 0f;
                while (elapsed < 1.35f)
                {
                    elapsed += Time.unscaledDeltaTime;
                    if (spinner != null)
                    {
                        spinner.rectTransform.Rotate(0f, 0f, -220f * Time.unscaledDeltaTime);
                    }

                    yield return null;
                }

                RevealOpponent(opponent);
                yield return new WaitForSecondsRealtime(0.85f);
            }
            else
            {
                yield return new WaitForSecondsRealtime(1.65f);
            }

            FinishReady();
        }

        private void RevealOpponent(BattleCombatant opponent)
        {
            SetConnecting(false);
            if (opponentPortrait != null)
            {
                opponentPortrait.enabled = opponent != null;
            }

            if (opponentNameText != null && opponent != null)
            {
                opponentNameText.text = opponent.DisplayName;
            }

            if (opponentRankText != null && opponent != null)
            {
                opponentRankText.text = $"Lv {opponent.Level}";
            }
        }

        private void FinishReady()
        {
            if (finished)
            {
                return;
            }

            finished = true;
            Hide();
            Ready?.Invoke();
        }

        private void OnCancelClicked()
        {
            if (finished)
            {
                return;
            }

            finished = true;
            GameFeedbackService.Instance?.PlayUiTap();
            Hide();
            Cancelled?.Invoke();
        }

        private void SetConnecting(bool connecting)
        {
            if (connectingOverlay != null)
            {
                connectingOverlay.SetActive(connecting);
            }

            if (connectingText != null)
            {
                connectingText.text = connecting ? "CONNECTING..." : string.Empty;
            }
        }

        private static void BindPortrait(ref MonsterPortraitDisplay display, RawImage image, BattleCombatant combatant)
        {
            if (image == null)
            {
                return;
            }

            if (display == null)
            {
                display = image.GetComponent<MonsterPortraitDisplay>();
                if (display == null)
                {
                    display = image.gameObject.AddComponent<MonsterPortraitDisplay>();
                }
            }

            display.Bind(combatant?.SourceData, 220, animated: true);
        }

        public void EnsureLayout()
        {
            if (layoutBuilt)
            {
                return;
            }

            Font font = MobileGameUiKit.BodyFont;
            Transform root = transform;
            rootPanel ??= gameObject;

            BattleOverlayUi.CreateImage("LeftPanel", root,
                new Vector2(0f, 0f), new Vector2(0.52f, 1f),
                new Color(0.04f, 0.12f, 0.28f, 1f)).raycastTarget = false;

            BattleOverlayUi.CreateImage("RightPanel", root,
                new Vector2(0.48f, 0f), new Vector2(1f, 1f),
                new Color(0.28f, 0.06f, 0.08f, 1f)).raycastTarget = false;

            var divider = BattleOverlayUi.CreateImage("Divider", root,
                new Vector2(0.46f, -0.08f), new Vector2(0.54f, 1.08f),
                new Color(0.95f, 0.95f, 1f, 0.92f));
            divider.raycastTarget = false;
            divider.rectTransform.localEulerAngles = new Vector3(0f, 0f, -18f);

            var vsText = BattleOverlayUi.CreateText("VsLabel", root, font, 92, FontStyle.Bold, TextAnchor.MiddleCenter,
                new Vector2(0.38f, 0.38f), new Vector2(0.62f, 0.62f), Color.white);
            vsText.text = "VS";
            vsText.resizeTextForBestFit = true;
            vsText.resizeTextMinSize = 48;
            vsText.resizeTextMaxSize = 110;

            playerPortrait = BattleOverlayUi.CreateRaw("PlayerPortrait", root,
                new Vector2(0.06f, 0.16f), new Vector2(0.42f, 0.84f));
            opponentPortrait = BattleOverlayUi.CreateRaw("OpponentPortrait", root,
                new Vector2(0.58f, 0.16f), new Vector2(0.94f, 0.84f));

            var playerChip = BattleOverlayUi.CreateImage("PlayerChip", root,
                new Vector2(0.03f, 0.86f), new Vector2(0.32f, 0.97f),
                new Color(0.08f, 0.12f, 0.2f, 0.9f));
            playerNameText = BattleOverlayUi.CreateText("Name", playerChip.transform, font, 22, FontStyle.Bold,
                TextAnchor.MiddleLeft, new Vector2(0.08f, 0.42f), new Vector2(0.96f, 0.92f), Color.white);
            playerRankText = BattleOverlayUi.CreateText("Rank", playerChip.transform, font, 18, FontStyle.Bold,
                TextAnchor.MiddleLeft, new Vector2(0.08f, 0.08f), new Vector2(0.96f, 0.48f),
                new Color(0.75f, 0.85f, 1f));

            var opponentChip = BattleOverlayUi.CreateImage("OpponentChip", root,
                new Vector2(0.68f, 0.86f), new Vector2(0.97f, 0.97f),
                new Color(0.2f, 0.08f, 0.1f, 0.9f));
            opponentNameText = BattleOverlayUi.CreateText("Name", opponentChip.transform, font, 22, FontStyle.Bold,
                TextAnchor.MiddleRight, new Vector2(0.04f, 0.42f), new Vector2(0.92f, 0.92f), Color.white);
            opponentRankText = BattleOverlayUi.CreateText("Rank", opponentChip.transform, font, 18, FontStyle.Bold,
                TextAnchor.MiddleRight, new Vector2(0.04f, 0.08f), new Vector2(0.92f, 0.48f),
                new Color(1f, 0.72f, 0.72f));

            connectingOverlay = BattleOverlayUi.CreateImage("ConnectingOverlay", root,
                new Vector2(0.56f, 0.18f), new Vector2(0.96f, 0.82f),
                new Color(0.55f, 0.08f, 0.1f, 0.55f)).gameObject;
            connectingText = BattleOverlayUi.CreateText("Connecting", connectingOverlay.transform, font, 28, FontStyle.Bold,
                TextAnchor.MiddleCenter, new Vector2(0.08f, 0.32f), new Vector2(0.92f, 0.52f), Color.white);
            connectingText.text = "CONNECTING...";
            spinner = BattleOverlayUi.CreateImage("Spinner", connectingOverlay.transform,
                new Vector2(0.38f, 0.54f), new Vector2(0.62f, 0.78f),
                new Color(1f, 1f, 1f, 0.85f));
            spinner.raycastTarget = false;

            cancelButton = BattleOverlayUi.CreateButton("CancelButton", root, font, "CANCEL",
                new Vector2(0.38f, 0.04f), new Vector2(0.62f, 0.12f),
                new Color(0.95f, 0.48f, 0.12f, 1f), OnCancelClicked);

            var skip = BattleOverlayUi.CreateImage("SkipCatcher", root, Vector2.zero, Vector2.one, Color.clear);
            skip.raycastTarget = true;
            var skipButton = skip.gameObject.AddComponent<Button>();
            skipButton.transition = Selectable.Transition.None;
            skipButton.onClick.AddListener(() =>
            {
                if (!finished)
                {
                    FinishReady();
                }
            });
            skip.transform.SetAsLastSibling();
            cancelButton.transform.SetAsLastSibling();

            layoutBuilt = true;
        }
    }
}
