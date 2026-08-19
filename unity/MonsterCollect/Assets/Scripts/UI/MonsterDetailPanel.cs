using System;
using MonsterCollect.Appearance;
using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Ranch;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>
    /// Full-screen detail overlay for a single ranch monster.
    /// </summary>
    [DisallowMultipleComponent]
    public class MonsterDetailPanel : MonoBehaviour
    {
        [SerializeField] private GameObject rootPanel;
        [SerializeField] private RawImage previewImage;
        [SerializeField] private Text nameText;
        [SerializeField] private Text metaText;
        [SerializeField] private Text statsText;
        [SerializeField] private Text idText;
        [SerializeField] private GameObject activeIndicator;
        [SerializeField] private Button setActiveButton;
        [SerializeField] private Button shareButton;
        [SerializeField] private Button releaseButton;
        [SerializeField] private Button closeButton;

        [SerializeField] private MonsterSharePanel sharePanel;

        private MonsterData boundMonster;
        private Button evolveButton;
        private Button customizeButton;
        private bool extraButtonsBuilt;

        public event Action CollectionChanged;

        private void Awake()
        {
            if (setActiveButton != null)
            {
                setActiveButton.onClick.AddListener(OnSetActiveClicked);
            }

            if (closeButton != null)
            {
                closeButton.onClick.AddListener(Hide);
            }

            if (shareButton != null)
            {
                shareButton.onClick.AddListener(OnShareClicked);
            }

            if (releaseButton != null)
            {
                releaseButton.onClick.AddListener(OnReleaseClicked);
            }

            HideImmediate();
        }

        private void OnDestroy()
        {
            if (setActiveButton != null)
            {
                setActiveButton.onClick.RemoveListener(OnSetActiveClicked);
            }

            if (closeButton != null)
            {
                closeButton.onClick.RemoveListener(Hide);
            }

            if (shareButton != null)
            {
                shareButton.onClick.RemoveListener(OnShareClicked);
            }

            if (releaseButton != null)
            {
                releaseButton.onClick.RemoveListener(OnReleaseClicked);
            }
        }

        public void Show(MonsterData monster)
        {
            if (monster == null)
            {
                return;
            }

            boundMonster = monster;
            MonsterEvolutionService.EnsureIdentityFields(monster);
            MonsterRaisingService.EnsureRaisingState(monster);
            EnsureExtraButtons();
            MonsterPortraitUiHelper.Bind(previewImage, monster, 256, animated: true);

            if (nameText != null)
            {
                nameText.text = monster.GetDisplayName();
            }

            if (metaText != null)
            {
                string fusionTag = monster.IsBred ? " · Fusion" : string.Empty;
                string stageTag = monster.EvolutionStage > 0 ? $" · {monster.GetEvolutionLabel()}" : string.Empty;
                metaText.text = $"{monster.Species} · {monster.Rarity}{fusionTag}{stageTag}\n{monster.GetTypeAffinities().FormatTopAffinities(2)}";
            }

            if (statsText != null)
            {
                bool isActive = monster.Id == MonsterCollectionService.ActiveMonsterId;
                int atk = isActive ? MonsterRaisingService.GetEffectiveAttack(monster) : monster.Attack;
                int spd = isActive ? MonsterRaisingService.GetEffectiveSpeed(monster) : monster.Speed;

                statsText.text =
                    $"HP  {monster.Hp}\n" +
                    $"ATK {atk}\n" +
                    $"DEF {monster.Defense}\n" +
                    $"SPD {spd}";

                if (isActive && monster.Raising != null)
                {
                    MonsterPersonality personality = MonsterPersonalityService.Resolve(monster);
                    statsText.text +=
                        $"\n\nLv {monster.Raising.level}  ·  {MonsterPersonalityService.GetDisplayName(personality)}" +
                        $"\nLife {monster.Raising.lifespan:0}  ·  Fatigue {monster.Raising.fatigue:0}" +
                        $"\n{MonsterRaisingService.GetCareStatusMessage(monster)}";

                    if (monster.Raising.isRetired)
                    {
                        statsText.text += $"\nBreeding bonus: +{(int)(monster.Raising.retirementBreedingBonus * 100)}%";
                    }
                }
            }

            if (idText != null)
            {
                idText.text = $"ID: {monster.Id}";
            }

            RefreshActiveState();
            if (evolveButton != null)
            {
                evolveButton.gameObject.SetActive(MonsterEvolutionService.GetEligiblePaths(monster).Count > 0);
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

        private void OnSetActiveClicked()
        {
            if (boundMonster == null)
            {
                return;
            }

            if (MonsterCollectionService.SetActiveMonster(boundMonster.Id))
            {
                RefreshActiveState();
                CollectionChanged?.Invoke();
            }
        }

        private void OnShareClicked()
        {
            if (boundMonster == null)
            {
                return;
            }

            sharePanel?.Show(boundMonster);
            GameFeedbackService.Instance?.PlayUiTap();
        }

        private void OnReleaseClicked()
        {
            if (boundMonster == null)
            {
                return;
            }

            if (MonsterCollectionService.TryRemoveMonster(boundMonster.Id, out string errorMessage))
            {
                CollectionChanged?.Invoke();
                Hide();
                GameFeedbackService.Instance?.PlayUiTap();
                return;
            }

            if (idText != null)
            {
                idText.text = errorMessage;
            }

            GameFeedbackService.Instance?.PlayError();
        }

        private void EnsureExtraButtons()
        {
            if (extraButtonsBuilt || releaseButton == null)
            {
                return;
            }

            extraButtonsBuilt = true;
            Font font = MobileGameUiKit.BodyFont;
            Transform parent = releaseButton.transform.parent;
            RectTransform releaseRect = releaseButton.GetComponent<RectTransform>();

            evolveButton = CreateInlineButton(parent, font, "Evolve", releaseRect, -140f);
            evolveButton.onClick.AddListener(() =>
            {
                if (boundMonster != null)
                {
                    MonsterEvolutionPanel.Show(boundMonster);
                }
            });

            customizeButton = CreateInlineButton(parent, font, "Style", releaseRect, -280f);
            customizeButton.onClick.AddListener(() =>
            {
                if (boundMonster != null)
                {
                    MonsterCustomizationPanel.Show(boundMonster);
                }
            });
        }

        private static Button CreateInlineButton(Transform parent, Font font, string label, RectTransform reference, float xOffset)
        {
            var go = new GameObject(label + "Button", typeof(RectTransform), typeof(Image), typeof(Button));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = reference.anchorMin;
            rect.anchorMax = reference.anchorMax;
            rect.pivot = reference.pivot;
            rect.sizeDelta = reference.sizeDelta;
            rect.anchoredPosition = reference.anchoredPosition + new Vector2(xOffset, 0f);
            go.GetComponent<Image>().color = new Color(0.22f, 0.48f, 0.72f, 1f);

            var textGo = new GameObject("Label", typeof(RectTransform), typeof(Text));
            textGo.transform.SetParent(go.transform, false);
            var textRect = textGo.GetComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.offsetMin = Vector2.zero;
            textRect.offsetMax = Vector2.zero;
            var text = textGo.GetComponent<Text>();
            text.font = font;
            text.fontSize = 18;
            text.alignment = TextAnchor.MiddleCenter;
            text.color = Color.white;
            text.text = label;
            return go.GetComponent<Button>();
        }

        private void RefreshActiveState()
        {
            bool isActive = boundMonster != null &&
                            boundMonster.Id == MonsterCollectionService.ActiveMonsterId;

            if (activeIndicator != null)
            {
                activeIndicator.SetActive(isActive);
            }

            if (setActiveButton != null)
            {
                setActiveButton.interactable = !isActive;
                Text label = setActiveButton.GetComponentInChildren<Text>();
                if (label != null)
                {
                    label.text = isActive ? "Active" : "Set Active";
                }
            }
        }
    }
}
