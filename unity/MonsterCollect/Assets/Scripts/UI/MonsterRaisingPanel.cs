using System;
using MonsterCollect.Appearance;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Ranch;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>
    /// Care and training UI for the active ranch monster.
    /// </summary>
    [DisallowMultipleComponent]
    public class MonsterRaisingPanel : MonoBehaviour
    {
        [Header("Header")]
        [SerializeField] private GameObject contentRoot;
        [SerializeField] private GameObject emptyRoot;
        [SerializeField] private Text monsterNameText;
        [SerializeField] private Text statusText;
        [SerializeField] private RawImage previewImage;

        [Header("Meters")]
        [SerializeField] private CareMeterBar hungerMeter;
        [SerializeField] private CareMeterBar energyMeter;
        [SerializeField] private CareMeterBar moodMeter;
        [SerializeField] private CareMeterBar lifespanMeter;

        [Header("Stats")]
        [SerializeField] private Text attackText;
        [SerializeField] private Text speedText;
        [SerializeField] private Text trainingLimitsText;

        [Header("Actions")]
        [SerializeField] private Button feedButton;
        [SerializeField] private Button restButton;
        [SerializeField] private Button strengthButton;
        [SerializeField] private Button agilityButton;

        [Header("Feedback")]
        [SerializeField] private Text actionMessageText;
        [SerializeField] private StatChangeFeedback statFeedback;
        [SerializeField] private Text fatigueText;

        private MonsterData boundMonster;
        private Button ranchSystemsButton;
        private bool ranchButtonBuilt;

        public event Action RaisingChanged;

        private void Awake()
        {
            EnsureRanchSystemsButton();

            if (feedButton != null)
            {
                feedButton.onClick.AddListener(() => PerformAction(MonsterRaisingService.TryFeed));
            }

            if (restButton != null)
            {
                restButton.onClick.AddListener(() => PerformAction(MonsterRaisingService.TryRest));
            }

            if (strengthButton != null)
            {
                strengthButton.onClick.AddListener(() => PerformAction(MonsterRaisingService.TryStrengthTraining));
            }

            if (agilityButton != null)
            {
                agilityButton.onClick.AddListener(() => PerformAction(MonsterRaisingService.TryAgilityTraining));
            }
        }

        public void Refresh()
        {
            boundMonster = MonsterCollectionService.ActiveMonster;
            bool hasActive = boundMonster != null;

            if (contentRoot != null)
            {
                contentRoot.SetActive(hasActive);
            }

            if (emptyRoot != null)
            {
                emptyRoot.SetActive(!hasActive);
            }

            if (!hasActive)
            {
                return;
            }

            MonsterRaisingService.EnsureRaisingState(boundMonster);
            MonsterRaisingState state = boundMonster.Raising;

            MonsterPortraitUiHelper.Bind(previewImage, boundMonster, 128, animated: false);

            if (monsterNameText != null)
            {
                monsterNameText.text = boundMonster.Name;
            }

            if (statusText != null)
            {
                statusText.text = MonsterRaisingService.GetCareStatusMessage(boundMonster);
                statusText.color = GetStatusColor(state.GetCareConditions());
            }

            hungerMeter?.Set("Hunger", state.hunger);
            energyMeter?.Set("Energy", state.energy);
            moodMeter?.Set("Mood", state.mood);
            lifespanMeter?.Set("Life", state.lifespan);

            if (attackText != null)
            {
                int effective = MonsterRaisingService.GetEffectiveAttack(boundMonster);
                attackText.text = effective != boundMonster.Attack
                    ? $"ATK {boundMonster.Attack} ({effective})"
                    : $"ATK {boundMonster.Attack}";
            }

            if (speedText != null)
            {
                int effective = MonsterRaisingService.GetEffectiveSpeed(boundMonster);
                speedText.text = effective != boundMonster.Speed
                    ? $"SPD {boundMonster.Speed} ({effective})"
                    : $"SPD {boundMonster.Speed}";
            }

            if (trainingLimitsText != null)
            {
                trainingLimitsText.text =
                    $"Str {state.strengthTrainingsToday}/{MonsterRaisingService.MaxStrengthTrainingsPerDay}  " +
                    $"Agi {state.agilityTrainingsToday}/{MonsterRaisingService.MaxAgilityTrainingsPerDay}  " +
                    $"Int {state.intelligenceTrainingsToday}/{MonsterRaisingService.MaxIntelligenceTrainingsPerDay}  " +
                    $"Def {state.defenseTrainingsToday}/{MonsterRaisingService.MaxDefenseTrainingsPerDay}";
            }

            if (fatigueText != null)
            {
                fatigueText.text = $"Fatigue {state.fatigue:0}";
            }

            RefreshActionButtons();
            ClearActionMessage();
        }

        private void PerformAction(Func<MonsterData, double, RaisingActionResult> action)
        {
            if (boundMonster == null)
            {
                return;
            }

            double utcNow = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            RaisingActionResult result = action(boundMonster, utcNow);

            if (result.Success)
            {
                MonsterCollectionService.UpdateMonster(boundMonster);
                Refresh();
                RaisingChanged?.Invoke();

                if (result.AttackDelta > 0)
                {
                    statFeedback?.Show($"+{result.AttackDelta} ATK", new Color(1f, 0.85f, 0.3f));
                    PunchStatText(attackText);
                }
                else if (result.SpeedDelta > 0)
                {
                    statFeedback?.Show($"+{result.SpeedDelta} SPD", new Color(0.45f, 0.85f, 1f));
                    PunchStatText(speedText);
                }
                else if (result.DefenseDelta > 0)
                {
                    statFeedback?.Show($"+{result.DefenseDelta} DEF", new Color(0.75f, 0.85f, 0.55f));
                }
                else if (result.HpDelta > 0)
                {
                    statFeedback?.Show($"+{result.HpDelta} HP", new Color(0.55f, 0.95f, 0.65f));
                }
            }

            ShowActionMessage(result.Message, result.Success);
        }

        private void RefreshActionButtons()
        {
            if (boundMonster == null)
            {
                return;
            }

            double utcNow = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            MonsterRaisingState state = boundMonster.Raising;

            if (feedButton != null)
            {
                feedButton.interactable = state.feedsToday < MonsterRaisingService.MaxFeedsPerDay;
            }

            if (restButton != null)
            {
                restButton.interactable = state.restsToday < MonsterRaisingService.MaxRestsPerDay;
            }

            if (strengthButton != null)
            {
                strengthButton.interactable =
                    state.strengthTrainingsToday < MonsterRaisingService.MaxStrengthTrainingsPerDay &&
                    MonsterRaisingService.GetTrainingCooldownRemaining(boundMonster, true, utcNow) <= 0d;
            }

            if (agilityButton != null)
            {
                agilityButton.interactable =
                    state.agilityTrainingsToday < MonsterRaisingService.MaxAgilityTrainingsPerDay &&
                    MonsterRaisingService.GetTrainingCooldownRemaining(boundMonster, false, utcNow) <= 0d;
            }
        }

        private void ShowActionMessage(string message, bool success)
        {
            if (actionMessageText == null)
            {
                return;
            }

            actionMessageText.text = message;
            actionMessageText.color = success
                ? new Color(0.7f, 0.95f, 0.75f)
                : new Color(0.95f, 0.55f, 0.55f);
        }

        private void ClearActionMessage()
        {
            if (actionMessageText != null)
            {
                actionMessageText.text = string.Empty;
            }
        }

        private static Color GetStatusColor(MonsterCareCondition conditions)
        {
            if ((conditions & MonsterCareCondition.Neglected) != 0)
            {
                return new Color(0.95f, 0.35f, 0.35f);
            }

            if ((conditions & MonsterCareCondition.Aging) != 0)
            {
                return new Color(0.85f, 0.65f, 0.95f);
            }

            if ((conditions & MonsterCareCondition.Retired) != 0)
            {
                return new Color(0.7f, 0.7f, 0.75f);
            }

            if (conditions != MonsterCareCondition.None)
            {
                return new Color(0.95f, 0.75f, 0.25f);
            }

            return new Color(0.65f, 0.9f, 0.7f);
        }

        private Coroutine punchRoutine;

        private void PunchStatText(Text target)
        {
            if (target == null)
            {
                return;
            }

            if (punchRoutine != null)
            {
                StopCoroutine(punchRoutine);
            }

            punchRoutine = StartCoroutine(PunchRoutine(target));
        }

        private System.Collections.IEnumerator PunchRoutine(Text target)
        {
            Transform t = target.transform;
            Vector3 original = t.localScale;
            t.localScale = original * 1.2f;

            float elapsed = 0f;
            const float duration = 0.25f;

            while (elapsed < duration)
            {
                elapsed += Time.unscaledDeltaTime;
                t.localScale = Vector3.Lerp(original * 1.2f, original, elapsed / duration);
                yield return null;
            }

            t.localScale = original;
            punchRoutine = null;
        }

        private void EnsureRanchSystemsButton()
        {
            if (ranchButtonBuilt)
            {
                return;
            }

            ranchButtonBuilt = true;
            Transform parent = transform;
            Font font = MobileGameUiKit.BodyFont;

            var go = new GameObject("RanchSystemsButton", typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(0.72f, 0.02f);
            rect.anchorMax = new Vector2(0.98f, 0.08f);
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            go.GetComponent<Image>().color = new Color(0.25f, 0.42f, 0.62f, 1f);

            var labelGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            labelGo.transform.SetParent(go.transform, false);
            var labelRect = labelGo.GetComponent<RectTransform>();
            labelRect.anchorMin = Vector2.zero;
            labelRect.anchorMax = Vector2.one;
            labelRect.offsetMin = Vector2.zero;
            labelRect.offsetMax = Vector2.zero;
            var label = labelGo.GetComponent<Text>();
            label.font = font;
            label.fontSize = 22;
            label.alignment = TextAnchor.MiddleCenter;
            label.color = Color.white;
            label.text = "Ranch Hub";

            ranchSystemsButton = go.GetComponent<Button>();
            ranchSystemsButton.onClick.AddListener(() => RanchSystemsPanel.ShowPanel());
        }
    }
}
