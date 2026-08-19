using MonsterCollect.Battle;
using MonsterCollect.Data;
using MonsterCollect.Progression;
using MonsterCollect.Social;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Landscape battle arena chrome: top match bar, nameplates, energy, and arena backdrop.</summary>
    [DisallowMultipleComponent]
    public class BattleArenaHud : MonoBehaviour
    {
        private const int TeamPipCount = 6;
        private const int MaxEnergy = 5;

        [SerializeField] private Image arenaBackground;
        [SerializeField] private Image arenaRing;
        [SerializeField] private Text playerTrainerNameText;
        [SerializeField] private Text opponentTrainerNameText;
        [SerializeField] private Text playerRankText;
        [SerializeField] private Text opponentRankText;
        [SerializeField] private Text timerText;
        [SerializeField] private Text opponentIntentText;
        [SerializeField] private Text energyValueText;
        [SerializeField] private Image[] energySegments;
        [SerializeField] private Image[] playerTeamPips;
        [SerializeField] private Image[] opponentTeamPips;
        [SerializeField] private RectTransform actionBarRoot;
        [SerializeField] private RectTransform skillButtonRoot;
        [SerializeField] private BattleNameplate playerNameplate;
        [SerializeField] private BattleNameplate opponentNameplate;

        private float battleStartTime;
        private bool layoutBuilt;

        public RectTransform SkillButtonRoot => skillButtonRoot;
        public BattleNameplate PlayerNameplate => playerNameplate;
        public BattleNameplate OpponentNameplate => opponentNameplate;

        private void Awake()
        {
            EnsureLayout();
        }

        public void EnsureLayout()
        {
            if (layoutBuilt)
            {
                return;
            }

            Font font = MobileGameUiKit.BodyFont;
            Transform root = transform;

            if (arenaBackground == null)
            {
                arenaBackground = CreateStretchImage(root, "ArenaBackground", new Color(0.18f, 0.42f, 0.22f, 1f));
                arenaBackground.transform.SetAsFirstSibling();
            }

            if (arenaRing == null)
            {
                arenaRing = CreateAnchoredImage(root, "ArenaRing",
                    new Vector2(0.22f, 0.18f), new Vector2(0.78f, 0.72f),
                    new Color(0.45f, 0.32f, 0.18f, 0.55f));
            }

            if (playerNameplate == null)
            {
                playerNameplate = CreateNameplate(root, font, "PlayerNameplate",
                    new Vector2(0.03f, 0.04f), new Vector2(0.34f, 0.16f), TextAnchor.MiddleLeft);
            }

            if (opponentNameplate == null)
            {
                opponentNameplate = CreateNameplate(root, font, "OpponentNameplate",
                    new Vector2(0.66f, 0.82f), new Vector2(0.97f, 0.94f), TextAnchor.MiddleRight);
            }

            EnsureTopMatchBar(root, font);
            EnsureActionBar(root, font);
            EnsureOpponentIntent(root, font);
            layoutBuilt = true;
        }

        public void OnBattleStarted()
        {
            battleStartTime = Time.unscaledTime;
            RefreshEnergy(MaxEnergy);
        }

        public void RefreshMatchBar(BattleContext context)
        {
            EnsureLayout();

            if (playerTrainerNameText != null)
            {
                playerTrainerNameText.text = SocialProfileService.DisplayName;
            }

            if (opponentTrainerNameText != null)
            {
                string opponentName = BattleSession.RemoteTrainerName;
                if (string.IsNullOrEmpty(opponentName))
                {
                    opponentName = context?.Opponent?.DisplayName ?? "Wild";
                }

                opponentTrainerNameText.text = opponentName;
            }

            if (playerRankText != null)
            {
                playerRankText.text = (TrainerProgressionService.RankIndex + 1).ToString();
            }

            if (opponentRankText != null)
            {
                int opponentLevel = context?.Opponent?.Level ?? 1;
                opponentRankText.text = Mathf.Max(1, opponentLevel / 2).ToString();
            }

            RefreshTeamPips(playerTeamPips, true);
            RefreshTeamPips(opponentTeamPips, false);
        }

        public void RefreshTimer()
        {
            if (timerText == null)
            {
                return;
            }

            int elapsed = Mathf.Max(0, Mathf.FloorToInt(Time.unscaledTime - battleStartTime));
            int minutes = elapsed / 60;
            int seconds = elapsed % 60;
            timerText.text = $"{minutes}:{seconds:00}";
        }

        public void SetOpponentIntent(string moveLabel)
        {
            if (opponentIntentText == null)
            {
                return;
            }

            opponentIntentText.text = string.IsNullOrEmpty(moveLabel) ? string.Empty : moveLabel;
        }

        public void RefreshEnergy(int currentEnergy)
        {
            currentEnergy = Mathf.Clamp(currentEnergy, 0, MaxEnergy);

            if (energyValueText != null)
            {
                energyValueText.text = currentEnergy.ToString();
            }

            if (energySegments == null)
            {
                return;
            }

            for (int i = 0; i < energySegments.Length; i++)
            {
                if (energySegments[i] == null)
                {
                    continue;
                }

                energySegments[i].color = i < currentEnergy
                    ? new Color(0.2f, 0.55f, 0.95f, 1f)
                    : new Color(0.12f, 0.18f, 0.28f, 0.85f);
            }
        }

        private void Update()
        {
            if (timerText != null && gameObject.activeInHierarchy)
            {
                RefreshTimer();
            }
        }

        private void EnsureTopMatchBar(Transform root, Font font)
        {
            if (timerText != null)
            {
                return;
            }

            var barGo = new GameObject("TopMatchBar", typeof(RectTransform), typeof(Image));
            barGo.transform.SetParent(root, false);
            var barRect = barGo.GetComponent<RectTransform>();
            barRect.anchorMin = new Vector2(0.18f, 0.90f);
            barRect.anchorMax = new Vector2(0.82f, 0.985f);
            barRect.offsetMin = Vector2.zero;
            barRect.offsetMax = Vector2.zero;
            barGo.GetComponent<Image>().color = new Color(0.08f, 0.1f, 0.14f, 0.88f);

            playerTrainerNameText = CreateAnchoredText(barGo.transform, font, "PlayerName", 20, FontStyle.Bold,
                new Vector2(0.12f, 0.58f), new Vector2(0.42f, 0.92f), TextAnchor.MiddleLeft);
            opponentTrainerNameText = CreateAnchoredText(barGo.transform, font, "OpponentName", 20, FontStyle.Bold,
                new Vector2(0.58f, 0.58f), new Vector2(0.88f, 0.92f), TextAnchor.MiddleRight);
            playerRankText = CreateAnchoredText(barGo.transform, font, "PlayerRank", 18, FontStyle.Bold,
                new Vector2(0.04f, 0.58f), new Vector2(0.11f, 0.92f), TextAnchor.MiddleCenter);
            opponentRankText = CreateAnchoredText(barGo.transform, font, "OpponentRank", 18, FontStyle.Bold,
                new Vector2(0.89f, 0.58f), new Vector2(0.96f, 0.92f), TextAnchor.MiddleCenter);
            timerText = CreateAnchoredText(barGo.transform, font, "Timer", 24, FontStyle.Bold,
                new Vector2(0.42f, 0.58f), new Vector2(0.58f, 0.92f), TextAnchor.MiddleCenter);
            timerText.color = new Color(0.95f, 0.95f, 0.98f);

            playerTeamPips = CreateTeamPipRow(barGo.transform, "PlayerTeamPips", 0.12f, 0.42f, 0.08f, 0.22f);
            opponentTeamPips = CreateTeamPipRow(barGo.transform, "OpponentTeamPips", 0.58f, 0.88f, 0.08f, 0.22f);
        }

        private void EnsureActionBar(Transform root, Font font)
        {
            if (actionBarRoot != null)
            {
                return;
            }

            var actionGo = new GameObject("ActionBar", typeof(RectTransform));
            actionGo.transform.SetParent(root, false);
            actionBarRoot = actionGo.GetComponent<RectTransform>();
            actionBarRoot.anchorMin = new Vector2(0.58f, 0.03f);
            actionBarRoot.anchorMax = new Vector2(0.98f, 0.28f);
            actionBarRoot.offsetMin = Vector2.zero;
            actionBarRoot.offsetMax = Vector2.zero;

            var energyGo = new GameObject("EnergyBar", typeof(RectTransform), typeof(Image));
            energyGo.transform.SetParent(actionBarRoot, false);
            var energyRect = energyGo.GetComponent<RectTransform>();
            energyRect.anchorMin = new Vector2(0.04f, 0.78f);
            energyRect.anchorMax = new Vector2(0.88f, 0.96f);
            energyRect.offsetMin = Vector2.zero;
            energyRect.offsetMax = Vector2.zero;
            energyGo.GetComponent<Image>().color = new Color(0.1f, 0.14f, 0.22f, 0.95f);

            var energyBadgeGo = new GameObject("EnergyBadge", typeof(RectTransform), typeof(Image));
            energyBadgeGo.transform.SetParent(energyGo.transform, false);
            var badgeRect = energyBadgeGo.GetComponent<RectTransform>();
            badgeRect.anchorMin = new Vector2(0f, 0.1f);
            badgeRect.anchorMax = new Vector2(0.12f, 0.9f);
            badgeRect.offsetMin = Vector2.zero;
            badgeRect.offsetMax = Vector2.zero;
            energyBadgeGo.GetComponent<Image>().color = new Color(0.15f, 0.45f, 0.92f, 1f);
            energyValueText = CreateAnchoredText(energyBadgeGo.transform, font, "Value", 20, FontStyle.Bold,
                Vector2.zero, Vector2.one, TextAnchor.MiddleCenter);

            energySegments = new Image[MaxEnergy];
            for (int i = 0; i < MaxEnergy; i++)
            {
                var segmentGo = new GameObject($"Segment{i + 1}", typeof(RectTransform), typeof(Image));
                segmentGo.transform.SetParent(energyGo.transform, false);
                var segmentRect = segmentGo.GetComponent<RectTransform>();
                float minX = 0.14f + i * 0.138f;
                segmentRect.anchorMin = new Vector2(minX, 0.18f);
                segmentRect.anchorMax = new Vector2(minX + 0.12f, 0.82f);
                segmentRect.offsetMin = Vector2.zero;
                segmentRect.offsetMax = Vector2.zero;
                energySegments[i] = segmentGo.GetComponent<Image>();
                energySegments[i].color = new Color(0.2f, 0.55f, 0.95f, 1f);
            }

            var skillsGo = new GameObject("SkillButtons", typeof(RectTransform));
            skillsGo.transform.SetParent(actionBarRoot, false);
            skillButtonRoot = skillsGo.GetComponent<RectTransform>();
            skillButtonRoot.anchorMin = new Vector2(0.02f, 0.04f);
            skillButtonRoot.anchorMax = new Vector2(0.88f, 0.74f);
            skillButtonRoot.offsetMin = Vector2.zero;
            skillButtonRoot.offsetMax = Vector2.zero;
        }

        private void EnsureOpponentIntent(Transform root, Font font)
        {
            if (opponentIntentText != null)
            {
                return;
            }

            var intentGo = new GameObject("OpponentIntent", typeof(RectTransform), typeof(Image));
            intentGo.transform.SetParent(root, false);
            var intentRect = intentGo.GetComponent<RectTransform>();
            intentRect.anchorMin = new Vector2(0.66f, 0.76f);
            intentRect.anchorMax = new Vector2(0.88f, 0.81f);
            intentRect.offsetMin = Vector2.zero;
            intentRect.offsetMax = Vector2.zero;
            intentGo.GetComponent<Image>().color = new Color(0.1f, 0.12f, 0.16f, 0.82f);
            opponentIntentText = CreateAnchoredText(intentGo.transform, font, "Label", 18, FontStyle.Bold,
                new Vector2(0.06f, 0.1f), new Vector2(0.94f, 0.9f), TextAnchor.MiddleLeft);
            opponentIntentText.color = new Color(0.92f, 0.92f, 0.96f);
        }

        private static BattleNameplate CreateNameplate(
            Transform parent,
            Font font,
            string name,
            Vector2 anchorMin,
            Vector2 anchorMax,
            TextAnchor nameAlign)
        {
            var rootGo = new GameObject(name, typeof(RectTransform));
            rootGo.transform.SetParent(parent, false);
            var rootRect = rootGo.GetComponent<RectTransform>();
            rootRect.anchorMin = anchorMin;
            rootRect.anchorMax = anchorMax;
            rootRect.offsetMin = Vector2.zero;
            rootRect.offsetMax = Vector2.zero;

            var bannerGo = new GameObject("Banner", typeof(RectTransform), typeof(Image));
            bannerGo.transform.SetParent(rootGo.transform, false);
            var bannerRect = bannerGo.GetComponent<RectTransform>();
            bannerRect.anchorMin = new Vector2(0f, 0.52f);
            bannerRect.anchorMax = new Vector2(1f, 1f);
            bannerRect.offsetMin = Vector2.zero;
            bannerRect.offsetMax = Vector2.zero;
            var bannerImage = bannerGo.GetComponent<Image>();
            bannerImage.color = new Color(0.92f, 0.78f, 0.18f, 0.98f);

            var nameText = CreateAnchoredText(bannerGo.transform, font, "Name", 22, FontStyle.Bold,
                new Vector2(0.04f, 0.08f), new Vector2(0.58f, 0.92f), nameAlign);
            nameText.color = new Color(0.12f, 0.1f, 0.05f);

            var starsText = CreateAnchoredText(bannerGo.transform, font, "Stars", 18, FontStyle.Bold,
                new Vector2(0.58f, 0.1f), new Vector2(0.78f, 0.9f), TextAnchor.MiddleCenter);
            starsText.color = new Color(0.95f, 0.85f, 0.15f);

            var levelText = CreateAnchoredText(bannerGo.transform, font, "Level", 18, FontStyle.Bold,
                new Vector2(0.78f, 0.1f), new Vector2(0.96f, 0.9f), TextAnchor.MiddleRight);
            levelText.color = new Color(0.12f, 0.1f, 0.05f);

            var healthGo = new GameObject("HealthBar", typeof(RectTransform));
            healthGo.transform.SetParent(rootGo.transform, false);
            var healthRect = healthGo.GetComponent<RectTransform>();
            healthRect.anchorMin = new Vector2(0f, 0f);
            healthRect.anchorMax = new Vector2(1f, 0.5f);
            healthRect.offsetMin = Vector2.zero;
            healthRect.offsetMax = Vector2.zero;

            var hpNameGo = new GameObject("HpName", typeof(RectTransform), typeof(Text));
            hpNameGo.transform.SetParent(healthGo.transform, false);
            hpNameGo.SetActive(false);

            var bgGo = new GameObject("BarBg", typeof(RectTransform), typeof(Image));
            bgGo.transform.SetParent(healthGo.transform, false);
            var bgRect = bgGo.GetComponent<RectTransform>();
            bgRect.anchorMin = new Vector2(0f, 0.2f);
            bgRect.anchorMax = new Vector2(1f, 0.85f);
            bgRect.offsetMin = Vector2.zero;
            bgRect.offsetMax = Vector2.zero;
            bgGo.GetComponent<Image>().color = new Color(0.08f, 0.08f, 0.1f, 0.95f);

            var fillGo = new GameObject("Fill", typeof(RectTransform), typeof(Image));
            fillGo.transform.SetParent(bgGo.transform, false);
            Stretch(fillGo.GetComponent<RectTransform>());
            var fillImage = fillGo.GetComponent<Image>();
            fillImage.color = new Color(0.2f, 0.78f, 0.4f);
            fillImage.type = Image.Type.Filled;
            fillImage.fillMethod = Image.FillMethod.Horizontal;

            var hpText = CreateAnchoredText(healthGo.transform, font, "HpText", 18, FontStyle.Bold,
                new Vector2(0.02f, 0.05f), new Vector2(0.98f, 0.95f), TextAnchor.MiddleCenter);

            var healthBar = healthGo.AddComponent<BattleHealthBar>();
            healthBar.WireReferences(fillImage, hpNameGo.GetComponent<Text>(), hpText);

            var plate = rootGo.AddComponent<BattleNameplate>();
            plate.WireReferences(bannerImage, nameText, starsText, levelText, healthBar);

            return plate;
        }

        private static Image[] CreateTeamPipRow(Transform parent, string name, float minX, float maxX, float minY, float maxY)
        {
            var rowGo = new GameObject(name, typeof(RectTransform));
            rowGo.transform.SetParent(parent, false);
            var rowRect = rowGo.GetComponent<RectTransform>();
            rowRect.anchorMin = new Vector2(minX, minY);
            rowRect.anchorMax = new Vector2(maxX, maxY);
            rowRect.offsetMin = Vector2.zero;
            rowRect.offsetMax = Vector2.zero;

            var pips = new Image[TeamPipCount];
            for (int i = 0; i < TeamPipCount; i++)
            {
                var pipGo = new GameObject($"Pip{i + 1}", typeof(RectTransform), typeof(Image));
                pipGo.transform.SetParent(rowGo.transform, false);
                var pipRect = pipGo.GetComponent<RectTransform>();
                float slot = i / (float)TeamPipCount;
                pipRect.anchorMin = new Vector2(slot + 0.01f, 0.05f);
                pipRect.anchorMax = new Vector2(slot + (1f / TeamPipCount) - 0.01f, 0.95f);
                pipRect.offsetMin = Vector2.zero;
                pipRect.offsetMax = Vector2.zero;
                pips[i] = pipGo.GetComponent<Image>();
                pips[i].color = new Color(0.25f, 0.28f, 0.34f, 0.9f);
            }

            return pips;
        }

        private static void RefreshTeamPips(Image[] pips, bool isPlayer)
        {
            if (pips == null)
            {
                return;
            }

            int owned = isPlayer ? MonsterCollectionService.Count : 1;
            for (int i = 0; i < pips.Length; i++)
            {
                if (pips[i] == null)
                {
                    continue;
                }

                bool filled = i < Mathf.Min(owned, TeamPipCount);
                pips[i].color = filled
                    ? new Color(0.2f, 0.55f, 0.95f, 1f)
                    : new Color(0.25f, 0.28f, 0.34f, 0.55f);
            }
        }

        private static Image CreateStretchImage(Transform parent, string name, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            Stretch(go.GetComponent<RectTransform>());
            var image = go.GetComponent<Image>();
            image.color = color;
            image.raycastTarget = false;
            return image;
        }

        private static Image CreateAnchoredImage(Transform parent, string name, Vector2 min, Vector2 max, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Image));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = min;
            rect.anchorMax = max;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            var image = go.GetComponent<Image>();
            image.color = color;
            image.raycastTarget = false;
            return image;
        }

        private static Text CreateAnchoredText(
            Transform parent,
            Font font,
            string name,
            int size,
            FontStyle style,
            Vector2 min,
            Vector2 max,
            TextAnchor align)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent, false);
            var rect = go.GetComponent<RectTransform>();
            rect.anchorMin = min;
            rect.anchorMax = max;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            var text = go.GetComponent<Text>();
            text.font = font;
            text.fontSize = size;
            text.fontStyle = style;
            text.alignment = align;
            text.color = Color.white;
            text.supportRichText = false;
            return text;
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
