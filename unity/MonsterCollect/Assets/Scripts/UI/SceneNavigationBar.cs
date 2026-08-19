using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Progression;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>
    /// Landscape chrome: left scene rail plus top HUD currencies.
    /// </summary>
    [DisallowMultipleComponent]
    public class SceneNavigationBar : MonoBehaviour
    {
        [SerializeField] private Button scanButton;
        [SerializeField] private Button ranchButton;
        [SerializeField] private Button dexButton;
        [SerializeField] private Button battleButton;
        [SerializeField] private Button settingsButton;
        [SerializeField] private Button goalsButton;
        [SerializeField] private Button adventureButton;
        [SerializeField] private Image scanHighlight;
        [SerializeField] private Image ranchHighlight;
        [SerializeField] private Image dexHighlight;
        [SerializeField] private Image battleHighlight;
        [SerializeField] private Text trainerText;
        [SerializeField] private Text energyText;
        [SerializeField] private Text coinsText;

        [SerializeField] private string activeSceneName;

        private float nextHudRefresh;

        private void Awake()
        {
            if (string.IsNullOrEmpty(activeSceneName))
            {
                activeSceneName = SceneManager.GetActiveScene().name;
            }

            Bind(scanButton, () => NavigateTo(GameScenes.Scan));
            Bind(ranchButton, () => NavigateTo(GameScenes.Ranch));
            Bind(dexButton, () => NavigateTo(GameScenes.Dex));
            Bind(battleButton, () => NavigateTo(GameScenes.Battle));
            Bind(settingsButton, OpenSettings);
            Bind(goalsButton, ProgressionHubPanel.ShowPanel);
            Bind(adventureButton, AdventureHubPanel.ShowPanel);

            RefreshHighlights();
            RefreshHud();
        }

        private void Update()
        {
            if (Time.unscaledTime < nextHudRefresh)
            {
                return;
            }

            nextHudRefresh = Time.unscaledTime + 0.5f;
            RefreshHud();
        }

        private void OnDestroy()
        {
            Unbind(scanButton);
            Unbind(ranchButton);
            Unbind(dexButton);
            Unbind(battleButton);
            Unbind(settingsButton);
            Unbind(goalsButton);
            Unbind(adventureButton);
        }

        private void OpenSettings()
        {
            SettingsPanel panel = SettingsPanel.Instance ?? FindObjectOfType<SettingsPanel>(true);
            panel?.Show();
            GameFeedbackService.Instance?.PlayUiTap();
        }

        private void NavigateTo(string sceneName)
        {
            if (SceneManager.GetActiveScene().name == sceneName)
            {
                return;
            }

            SceneManager.LoadScene(sceneName);
        }

        private void RefreshHighlights()
        {
            SetHighlight(scanHighlight, activeSceneName == GameScenes.Scan);
            SetHighlight(ranchHighlight, activeSceneName == GameScenes.Ranch);
            SetHighlight(dexHighlight, activeSceneName == GameScenes.Dex);
            SetHighlight(battleHighlight, activeSceneName == GameScenes.Battle);
        }

        private void RefreshHud()
        {
            if (trainerText != null)
            {
                trainerText.text = $"Lv {TrainerProgressionService.RankIndex + 1}";
            }

            if (energyText != null)
            {
                energyText.text = $"⚡ {RanchEnergyService.Current}";
            }

            if (coinsText != null)
            {
                coinsText.text = $"🪙 {TrainerProgressionService.RanchCoins}";
            }
        }

        private static void Bind(Button button, UnityEngine.Events.UnityAction action)
        {
            if (button != null)
            {
                button.onClick.AddListener(action);
            }
        }

        private static void Unbind(Button button)
        {
            if (button != null)
            {
                button.onClick.RemoveAllListeners();
            }
        }

        private static void SetHighlight(Image highlight, bool active)
        {
            if (highlight != null)
            {
                highlight.enabled = active;
            }
        }
    }
}
