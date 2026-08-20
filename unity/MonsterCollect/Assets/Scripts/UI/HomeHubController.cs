using System;
using MonsterCollect.Appearance;
using MonsterCollect.Core;
using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Progression;
using MonsterCollect.Social;
using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>
    /// Landscape home menu for RanchScene, styled with the 300Mind mobile UI kit.
    /// </summary>
    [DisallowMultipleComponent]
    public class HomeHubController : MonoBehaviour
    {
        private const int LayoutVersion = 8;

        public static HomeHubController Instance { get; private set; }

        public static bool IsHomeVisible =>
            Instance != null && Instance.homeRoot != null && Instance.homeRoot.activeSelf;

        private RanchViewController ranchController;
        private GameObject homeRoot;
        private GameObject collectionChrome;
        private GameObject legacyTopHud;
        private GameObject legacyLeftRail;
        private GameObject legacyContent;
        private Image playFrameBackground;

        private TMP_Text nameText;
        private TMP_Text levelBadgeText;
        private TMP_Text levelScoreText;
        private Image xpFill;
        private TMP_Text stonesText;
        private TMP_Text coinsText;
        private TMP_Text gemsText;
        private TMP_Text energyText;
        private TMP_Text passProgressText;
        private Image passFill;
        private TMP_Text giftBadgeText;
        private TMP_Text adventureBadgeText;
        private TMP_Text passBadgeText;
        private TMP_Text bigBoxProgressText;
        private Image bigBoxFill;
        private RawImage featuredPortrait;
        private TMP_Text featuredHintText;
        private bool refreshing;
        private float nextRefresh;

        private static MobileGameUiKitTheme Kit => MobileGameUiKit.Theme;

        public static void Install(RanchViewController ranch)
        {
            if (ranch == null)
            {
                return;
            }

            HomeHubController hub = Instance ?? ranch.GetComponent<HomeHubController>();
            if (hub == null)
            {
                hub = ranch.gameObject.AddComponent<HomeHubController>();
            }

            hub.ranchController = ranch;
            hub.BuildIfNeeded();
            hub.ShowHome();
        }

        private void OnEnable()
        {
            MonsterCollectionService.CollectionChanged += Refresh;
        }

        private void OnDisable()
        {
            MonsterCollectionService.CollectionChanged -= Refresh;
        }

        private void Update()
        {
            if (Time.unscaledTime < nextRefresh)
            {
                return;
            }

            nextRefresh = Time.unscaledTime + 0.5f;
            if (IsHomeVisible)
            {
                Refresh();
            }
        }

        public void ShowHome()
        {
            BuildIfNeeded();
            if (homeRoot == null)
            {
                Debug.LogError("[HomeHub] Home UI failed to build. Showing ranch content instead.");
                SetPlayFrameBackgroundVisible(true);
                SetLegacyVisible(true);
                return;
            }

            homeRoot.SetActive(true);
            SetLegacyVisible(false);
            collectionChrome?.SetActive(false);
            Refresh();
        }

        public void ShowCollection()
        {
            BuildIfNeeded();
            if (homeRoot != null)
            {
                homeRoot.SetActive(false);
            }

            SetLegacyVisible(true);
            if (legacyTopHud != null)
            {
                legacyTopHud.SetActive(false);
            }

            if (legacyLeftRail != null)
            {
                legacyLeftRail.SetActive(false);
            }

            collectionChrome?.SetActive(true);
            ranchController?.Refresh();
        }

        private void BuildIfNeeded()
        {
            if (homeRoot != null)
            {
                HomeHubLayoutMarker marker = homeRoot.GetComponent<HomeHubLayoutMarker>();
                if (marker != null && marker.Version == LayoutVersion)
                {
                    return;
                }

                Destroy(homeRoot);
                homeRoot = null;
            }

            Canvas canvas = ResolveGameCanvas();
            if (canvas == null)
            {
                Debug.LogError("[HomeHub] No game Canvas found in RanchScene.");
                return;
            }

            Transform uiRoot = LandscapePlayFrame.FindContentRoot(canvas) ?? canvas.transform;
            TmpFonts.PrepareCanvas(canvas);
            CacheLegacyChrome(uiRoot);

            if (Kit?.currencyPill == null)
            {
                Debug.LogWarning("[HomeHub] UI kit theme sprites are missing. Use Monster Collect > Setup UI Kit Theme, then restart Play Mode.");
            }

            homeRoot = Create("HomeHub", uiRoot);
            Stretch(homeRoot.GetComponent<RectTransform>());

            if (ranchController != null && ranchController.CollectionScreenRoot != null)
            {
                Transform collectionRoot = ranchController.CollectionScreenRoot.transform;
                homeRoot.transform.SetSiblingIndex(collectionRoot.GetSiblingIndex() + 1);
            }

            homeRoot.AddComponent<HomeHubLayoutMarker>().Version = LayoutVersion;
            CachePlayFrameBackground(uiRoot);

            BuildBackground(homeRoot.transform);
            BuildTopBar(homeRoot.transform);
            BuildLeftRail(homeRoot.transform);
            BuildCenterStage(homeRoot.transform);
            BuildBottomBar(homeRoot.transform);
            BuildRightPanel(homeRoot.transform);
            BuildCollectionChrome(uiRoot);
        }

        private Canvas ResolveGameCanvas()
        {
            if (ranchController != null && ranchController.CollectionScreenRoot != null)
            {
                Canvas ranchCanvas = ranchController.CollectionScreenRoot.GetComponentInParent<Canvas>();
                if (ranchCanvas != null)
                {
                    return ranchCanvas;
                }
            }

            Canvas[] canvases = FindObjectsOfType<Canvas>();
            for (int i = 0; i < canvases.Length; i++)
            {
                Canvas candidate = canvases[i];
                if (candidate == null || !candidate.gameObject.activeInHierarchy)
                {
                    continue;
                }

                if (candidate.transform.Find("PlayFrame") != null)
                {
                    return candidate;
                }
            }

            return FindObjectOfType<Canvas>();
        }

        private void CacheLegacyChrome(Transform uiRoot)
        {
            if (ranchController != null && ranchController.CollectionScreenRoot != null)
            {
                legacyContent = ranchController.CollectionScreenRoot;
            }
            else
            {
                Transform content = FindDeep(uiRoot, "Content");
                legacyContent = content != null ? content.gameObject : null;
            }

            Transform hud = FindDeep(uiRoot, "TopHud");
            Transform rail = FindDeep(uiRoot, "LeftRail");
            legacyTopHud = hud != null ? hud.gameObject : null;
            legacyLeftRail = rail != null ? rail.gameObject : null;
        }

        private void CachePlayFrameBackground(Transform uiRoot)
        {
            Transform playFrame = uiRoot != null ? uiRoot.parent : null;
            if (playFrame != null && playFrame.name == "PlayFrame")
            {
                playFrameBackground = playFrame.GetComponent<Image>();
            }
        }

        private void SetPlayFrameBackgroundVisible(bool visible)
        {
            if (playFrameBackground != null)
            {
                playFrameBackground.enabled = visible;
            }
        }

        private void OnDestroy()
        {
            SetPlayFrameBackgroundVisible(true);
            SetLegacyVisible(true);

            if (Instance == this)
            {
                Instance = null;
            }
        }

        private void SetLegacyVisible(bool visible)
        {
            if (legacyTopHud != null)
            {
                legacyTopHud.SetActive(visible);
            }

            if (legacyLeftRail != null)
            {
                legacyLeftRail.SetActive(visible);
            }

            if (legacyContent != null)
            {
                legacyContent.SetActive(visible);
            }
        }

        private void BuildBackground(Transform parent)
        {
            Image sky = CreateImage(parent, "Sky");
            Stretch(sky.rectTransform);
            Sprite sunset = Kit?.homeSunsetBackground ?? Kit?.sceneBackground;
            if (sunset != null)
            {
                UiSharpnessUtility.ApplyCoverBackground(sky, sunset);
            }
            else
            {
                UiSkinUtility.ApplySceneBackground(sky);
                sky.color = new Color(1f, 0.78f, 0.62f, 1f);
            }

            sky.raycastTarget = false;
        }

        private void BuildTopBar(Transform parent)
        {
            Image profileBg = CreateImage(parent, "ProfileBar");
            Anchor(profileBg.rectTransform, 0.012f, 0.885f, 0.295f, 0.985f);
            HomeHubUiFactory.ApplyPanel(profileBg, Kit?.profileBar, 0.92f);
            KitUi.MakeClickable(profileBg.gameObject, OpenRank);

            Image avatarFrame = CreateImage(profileBg.transform, "AvatarFrame");
            Anchor(avatarFrame.rectTransform, 0.02f, 0.10f, 0.24f, 0.90f);
            HomeHubUiFactory.ApplyIcon(avatarFrame, Kit?.avatarFrame);

            Image levelBadge = CreateImage(profileBg.transform, "LevelBadge");
            Anchor(levelBadge.rectTransform, 0.18f, 0.06f, 0.42f, 0.52f);
            HomeHubUiFactory.ApplyIcon(levelBadge, Kit?.levelBadgeSprite);
            levelBadgeText = HomeHubUiFactory.CreateText(levelBadge.transform, "Level", 22, FontStyles.Bold, TextAlignmentOptions.Center);
            UiSkinUtility.StyleTmpButton(levelBadgeText);

            nameText = HomeHubUiFactory.CreateText(profileBg.transform, "Name", 28, FontStyles.Bold, TextAlignmentOptions.Left);
            Anchor(nameText.rectTransform, 0.26f, 0.52f, 0.98f, 0.92f);

            var xpBar = HomeHubUiFactory.CreateProgressBar(profileBg.transform, "XpTrack");
            Anchor(xpBar.track.rectTransform, 0.26f, 0.12f, 0.98f, 0.48f);
            xpFill = xpBar.fill;
            levelScoreText = xpBar.label;

            RectTransform currencies = CreateRect(parent, "Currencies", 0.62f, 0.885f, 0.92f, 0.985f);
            stonesText = HomeHubUiFactory.CreateCurrencyPill(currencies, "Stones", 0f, 0.31f, Kit?.iconShard, "0", OpenShop);
            coinsText = HomeHubUiFactory.CreateCurrencyPill(currencies, "Coins", 0.33f, 0.64f, Kit?.iconCoin, "0", OpenShop);
            gemsText = HomeHubUiFactory.CreateCurrencyPill(currencies, "Gems", 0.66f, 0.99f, Kit?.iconGem, "0", OpenShop);

            Button settings = CreateIconOnlyButton(parent, "Settings", Kit?.iconSettings, 0.935f, 0.895f, 0.985f, 0.985f, OpenSettings);
        }

        private void BuildLeftRail(Transform parent)
        {
            Image railBg = CreateImage(parent, "HomeRail");
            Anchor(railBg.rectTransform, 0.012f, 0.205f, 0.115f, 0.875f);
            HomeHubUiFactory.ApplyPanel(railBg, Kit?.sidePanelLeft, 0.92f);

            Transform rail = railBg.transform;
            HomeHubUiFactory.CreateIconRailButton(rail, "Gift", Kit?.iconGift, "GIFT", 0.74f, 0.96f, OpenGifts, out giftBadgeText);
            HomeHubUiFactory.CreateIconRailButton(rail, "Shop", Kit?.iconShop, "SHOP", 0.52f, 0.74f, OpenShop, out _);
            HomeHubUiFactory.CreateIconRailButton(rail, "Monsters", Kit?.iconMonsters, "MONSTERS", 0.28f, 0.50f, ShowCollection, out _);
            HomeHubUiFactory.CreateIconRailButton(rail, "Friends", Kit?.iconFriends, "FRIENDS", 0.04f, 0.26f, OpenFriends, out _);
        }

        private void BuildCenterStage(Transform parent)
        {
            RectTransform stage = CreateRect(parent, "Stage", 0.12f, 0.205f, 0.805f, 0.875f);

            Image platform = CreateImage(stage, "Platform");
            Anchor(platform.rectTransform, 0.30f, 0.04f, 0.70f, 0.22f);
            HomeHubUiFactory.ApplyIcon(platform, Kit?.platformPedestal);
            platform.raycastTarget = false;

            featuredPortrait = Create("FeaturedMonster", stage).AddComponent<RawImage>();
            featuredPortrait.color = Color.white;
            featuredPortrait.raycastTarget = true;
            Anchor(featuredPortrait.rectTransform, 0.32f, 0.24f, 0.68f, 0.88f);
            var portraitButton = featuredPortrait.gameObject.AddComponent<Button>();
            portraitButton.targetGraphic = featuredPortrait;
            portraitButton.onClick.AddListener(OnFeaturedClicked);

            featuredHintText = HomeHubUiFactory.CreateText(stage, "Hint", 32, FontStyles.Bold, TextAlignmentOptions.Center);
            featuredHintText.text = "Scan a QR to hatch your first QRmon";
            Anchor(featuredHintText.rectTransform, 0.14f, 0.44f, 0.86f, 0.58f);
        }

        private void BuildBottomBar(Transform parent)
        {
            Image passBg = CreateImage(parent, "MonsterPass");
            Anchor(passBg.rectTransform, 0.012f, 0.025f, 0.265f, 0.195f);
            HomeHubUiFactory.ApplyPanel(passBg, Kit?.horizontalPanel, 0.92f);
            KitUi.MakeClickable(passBg.gameObject, OpenGifts);

            Transform pass = passBg.transform;
            if (Kit?.iconTicket != null)
            {
                Image ticket = CreateImage(pass, "TicketIcon");
                Anchor(ticket.rectTransform, 0.04f, 0.58f, 0.16f, 0.92f);
                HomeHubUiFactory.ApplyIcon(ticket, Kit.iconTicket);
            }

            TMP_Text passTitle = HomeHubUiFactory.CreateText(pass, "PassTitle", 24, FontStyles.Bold, TextAlignmentOptions.Left);
            passTitle.text = "MONSTER PASS";
            Anchor(passTitle.rectTransform, 0.16f, 0.62f, 0.78f, 0.94f);

            passBadgeText = HomeHubUiFactory.CreateBadge(pass, "1");
            Anchor(passBadgeText.transform.parent as RectTransform, 0.80f, 0.66f, 0.96f, 0.96f);

            var passBar = HomeHubUiFactory.CreateProgressBar(pass, "PassTrack");
            Anchor(passBar.track.rectTransform, 0.06f, 0.34f, 0.94f, 0.58f);
            passFill = passBar.fill;
            passProgressText = passBar.label;

            Button missions = CreateTextButton(pass, "NewMissions", "NEW MISSIONS", 0.16f, 0.06f, 0.84f, 0.30f, OpenGifts);
            UiSkinUtility.ApplySecondaryButton(missions.GetComponent<Image>());

            RectTransform actions = CreateRect(parent, "MainActions", 0.28f, 0.025f, 0.805f, 0.195f);

            HomeHubUiFactory.CreateSquareModeButton(actions, "QuickPlay", Kit?.iconLightning, "QUICK-PLAY", 0.02f, 0.20f, OpenQuickPlay);

            var adventureGo = new GameObject("Adventure", typeof(RectTransform), typeof(Image), typeof(Button));
            adventureGo.transform.SetParent(actions, false);
            Anchor(adventureGo.GetComponent<RectTransform>(), 0.24f, 0.08f, 0.72f, 1f);
            var adventureImage = adventureGo.GetComponent<Image>();
            if (Kit?.buttonAdventure != null)
            {
                adventureImage.sprite = Kit.buttonAdventure;
                adventureImage.type = Image.Type.Simple;
                adventureImage.color = Color.white;
            }
            else
            {
                UiSkinUtility.ApplyPrimaryButton(adventureImage);
            }

            TMP_Text adventureLabel = HomeHubUiFactory.CreateText(adventureGo.transform, "Label", 44, FontStyles.Bold, TextAlignmentOptions.Center);
            adventureLabel.text = "ADVENTURE";
            UiSkinUtility.StyleTmpButton(adventureLabel);

            var adventureButton = adventureGo.GetComponent<Button>();
            adventureButton.targetGraphic = adventureImage;
            adventureButton.onClick.AddListener(OpenAdventure);

            energyText = HomeHubUiFactory.CreateText(adventureGo.transform, "Energy", 22, FontStyles.Bold, TextAlignmentOptions.Bottom);
            energyText.text = "200 / 200";
            Anchor(energyText.rectTransform, 0.10f, 0.02f, 0.90f, 0.24f);

            adventureBadgeText = HomeHubUiFactory.CreateBadge(adventureGo.transform, "2");
            Anchor(adventureBadgeText.transform.parent as RectTransform, 0.78f, 0.70f, 0.98f, 0.98f);

            HomeHubUiFactory.CreateSquareModeButton(actions, "Event", Kit?.iconCalendar, "EVENT", 0.76f, 0.98f, OpenEvent);
        }

        private void BuildRightPanel(Transform parent)
        {
            Image columnBg = CreateImage(parent, "RewardColumn");
            Anchor(columnBg.rectTransform, 0.815f, 0.025f, 0.988f, 0.875f);
            HomeHubUiFactory.ApplyPanel(columnBg, Kit?.sidePanelRight, 0.92f);

            Transform column = columnBg.transform;

            Button collectAll = CreateTextButton(column, "CollectAll", "COLLECT ALL", 0.08f, 0.90f, 0.92f, 0.98f, CollectAllRewards);
            UiSkinUtility.ApplyPrimaryButton(collectAll.GetComponent<Image>());

            TMP_Text boxTitle = HomeHubUiFactory.CreateText(column, "BigBoxTitle", 22, FontStyles.Bold, TextAlignmentOptions.Center);
            boxTitle.text = "BIG BOX";
            Anchor(boxTitle.rectTransform, 0.08f, 0.84f, 0.92f, 0.90f);

            Image chest = CreateImage(column, "BigChest");
            Anchor(chest.rectTransform, 0.28f, 0.68f, 0.72f, 0.84f);
            HomeHubUiFactory.ApplyIcon(chest, Kit?.iconChest);
            KitUi.MakeClickable(chest.gameObject, OpenBook);

            var boxBar = HomeHubUiFactory.CreateProgressBar(column, "BoxTrack");
            Anchor(boxBar.track.rectTransform, 0.08f, 0.62f, 0.92f, 0.67f);
            bigBoxFill = boxBar.fill;
            bigBoxProgressText = boxBar.label;
            bigBoxProgressText.fontSize = 18;

            CreateChestSlot(column, "ChestA", 0.50f, 0.61f, "2H", "START UNLOCK", OpenFacilities);
            CreateChestSlot(column, "ChestB", 0.38f, 0.49f, "READY", "OPEN", OpenFacilities);
            CreateEmptySlot(column, "SlotA", 0.28f, 0.37f, OpenFacilities);
            CreateEmptySlot(column, "SlotB", 0.18f, 0.27f, OpenFacilities);

            TMP_Text incubatorTitle = HomeHubUiFactory.CreateText(column, "IncubatorTitle", 20, FontStyles.Bold, TextAlignmentOptions.Center);
            incubatorTitle.text = "INCUBATOR";
            Anchor(incubatorTitle.rectTransform, 0.08f, 0.12f, 0.92f, 0.18f);

            Button incubator = CreateTextButton(column, "EggSlot", "EGG SLOT", 0.10f, 0.02f, 0.90f, 0.12f, OpenIncubator);
            UiSkinUtility.ApplyTabButton(incubator.GetComponent<Image>(), false);
        }

        private void BuildCollectionChrome(Transform uiRoot)
        {
            collectionChrome = Create("CollectionChrome", uiRoot);
            Stretch(collectionChrome.GetComponent<RectTransform>());
            collectionChrome.transform.SetAsLastSibling();

            Image bar = CreateImage(collectionChrome.transform, "CollectionBar");
            Anchor(bar.rectTransform, 0.01f, 0.88f, 0.99f, 0.985f);
            HomeHubUiFactory.ApplyPanel(bar, Kit?.horizontalPanel, 0.94f);

            Button back = CreateTextButton(bar.transform, "BackHome", "← HOME", 0.015f, 0.12f, 0.16f, 0.88f, ShowHome);
            UiSkinUtility.ApplySecondaryButton(back.GetComponent<Image>());

            TMP_Text title = HomeHubUiFactory.CreateText(bar.transform, "Title", 32, FontStyles.Bold, TextAlignmentOptions.Left);
            title.text = "COLLECTION";
            Anchor(title.rectTransform, 0.18f, 0.18f, 0.52f, 0.82f);

            CreateTextButton(bar.transform, "Scan", "SCAN", 0.70f, 0.12f, 0.84f, 0.88f, () => SceneManager.LoadScene(GameScenes.Scan));
            CreateTextButton(bar.transform, "Breed", "FUSION", 0.85f, 0.12f, 0.985f, 0.88f, OpenIncubator);
            collectionChrome.SetActive(false);
        }

        private void Refresh()
        {
            if (homeRoot == null || refreshing)
            {
                return;
            }

            refreshing = true;
            try
            {
                int rank = TrainerProgressionService.RankIndex + 1;
                string trainerName = SocialProfileService.DisplayName;
                if (string.IsNullOrWhiteSpace(trainerName))
                {
                    trainerName = "Trainer";
                }

                if (nameText != null)
                {
                    nameText.text = trainerName;
                }

                if (levelBadgeText != null)
                {
                    levelBadgeText.text = $"Lv {rank}";
                }

                if (levelScoreText != null)
                {
                    levelScoreText.text = $"LEVEL SCORE: {TrainerProgressionService.TrainerXp}";
                }

                if (xpFill != null)
                {
                    xpFill.fillAmount = TrainerProgressionService.GetRankProgress01();
                }

                int coins = TrainerProgressionService.RanchCoins;
                int dex = MonsterCollectionService.UnlockedDexCount;
                if (stonesText != null)
                {
                    stonesText.text = MonsterCollectionService.Count.ToString();
                }

                if (coinsText != null)
                {
                    coinsText.text = coins.ToString();
                }

                if (gemsText != null)
                {
                    gemsText.text = dex.ToString();
                }

                if (energyText != null)
                {
                    energyText.text = $"{RanchEnergyService.Current} / {RanchEnergyService.DailyMax}";
                }

                int ranchCount = MonsterCollectionService.Count;
                int ranchMax = MonsterCollectionService.MaxRanchSlots;
                if (passProgressText != null)
                {
                    passProgressText.text = $"{ranchCount} / {ranchMax}";
                }

                if (passFill != null)
                {
                    passFill.fillAmount = ranchMax > 0 ? ranchCount / (float)ranchMax : 0f;
                }

                int claimable = CountClaimableQuests();
                SetBadge(giftBadgeText, claimable);
                SetBadge(passBadgeText, claimable);
                SetBadge(adventureBadgeText, MonsterCollectionService.Count == 0 ? 1 : 0);

                const int bigBoxTarget = 25;
                if (bigBoxProgressText != null)
                {
                    bigBoxProgressText.text = $"{dex} / {bigBoxTarget}";
                }

                if (bigBoxFill != null)
                {
                    bigBoxFill.fillAmount = Mathf.Clamp01(dex / (float)bigBoxTarget);
                }

                MonsterData featured = MonsterCollectionService.ActiveMonster ??
                                       (MonsterCollectionService.Count > 0 ? MonsterCollectionService.Monsters[0] : null);
                bool hasMonster = featured != null;
                if (featuredPortrait != null)
                {
                    featuredPortrait.enabled = hasMonster;
                    if (hasMonster)
                    {
                        MonsterPortraitUiHelper.Bind(featuredPortrait, featured, 512, animated: true);
                    }
                }

                if (featuredHintText != null)
                {
                    featuredHintText.gameObject.SetActive(!hasMonster);
                }
            }
            finally
            {
                refreshing = false;
            }
        }

        private void OnFeaturedClicked()
        {
            MonsterData featured = MonsterCollectionService.ActiveMonster ??
                                   (MonsterCollectionService.Count > 0 ? MonsterCollectionService.Monsters[0] : null);
            if (featured == null)
            {
                SceneManager.LoadScene(GameScenes.Scan);
                return;
            }

            ShowCollection();
        }

        private void OpenSettings()
        {
            SettingsPanel.ShowPanel();
        }

        private static void OpenGifts()
        {
            ProgressionHubPanel.ShowQuests();
        }

        private static void OpenShop()
        {
            ProgressionHubPanel.ShowShop();
        }

        private static void OpenRank()
        {
            ProgressionHubPanel.ShowRank();
        }

        private static void OpenBook()
        {
            ProgressionHubPanel.ShowBook();
        }

        private static void OpenFriends()
        {
            SocialHubPanel.ShowFriends();
        }

        private static void OpenFacilities()
        {
            RanchSystemsPanel.ShowFacilities();
        }

        private static void OpenAdventure()
        {
            AdventureHubPanel.ShowPanel();
        }

        private static void OpenEvent()
        {
            EventBannerPanel.ShowEventDetail();
        }

        private static void OpenQuickPlay()
        {
            SceneManager.LoadScene(GameScenes.Battle);
        }

        private void OpenIncubator()
        {
            ranchController?.OpenBreedingPanel();
        }

        private static void CollectAllRewards()
        {
            int claimed = 0;
            ClaimCategory(QuestCategory.Daily, ref claimed);
            ClaimCategory(QuestCategory.Weekly, ref claimed);
            ClaimCategory(QuestCategory.Main, ref claimed);
            MonsterBookRewardDefinition[] rewards = ProgressionCatalogRegistry.BookRewards?.Rewards;
            if (rewards != null)
            {
                for (int i = 0; i < rewards.Length; i++)
                {
                    MonsterBookRewardDefinition reward = rewards[i];
                    if (reward != null &&
                        MonsterBookService.IsRewardAvailable(reward) &&
                        !MonsterBookService.IsRewardClaimed(reward.RewardId) &&
                        MonsterBookService.TryClaimReward(reward.RewardId, out _))
                    {
                        claimed++;
                    }
                }
            }
            if (claimed > 0)
            {
                GameFeedbackService.Instance?.PlayQuestComplete();
            }

            ProgressionHubPanel.ShowQuests();
        }

        private static void ClaimCategory(QuestCategory category, ref int claimed)
        {
            var ids = QuestService.GetActiveQuestIds(category);
            for (int i = 0; i < ids.Count; i++)
            {
                QuestProgressEntry progress = QuestService.GetProgress(ids[i]);
                if (progress != null && progress.completed && !progress.rewardClaimed)
                {
                    QuestClaimResult result = QuestService.TryClaimReward(ids[i]);
                    if (result.Success)
                    {
                        claimed++;
                    }
                }
            }
        }

        private static int CountClaimableQuests()
        {
            return CountCategory(QuestCategory.Daily) +
                   CountCategory(QuestCategory.Weekly) +
                   CountCategory(QuestCategory.Main);
        }

        private static int CountCategory(QuestCategory category)
        {
            int count = 0;
            var ids = QuestService.GetActiveQuestIds(category);
            for (int i = 0; i < ids.Count; i++)
            {
                QuestProgressEntry progress = QuestService.GetProgress(ids[i]);
                if (progress != null && progress.completed && !progress.rewardClaimed)
                {
                    count++;
                }
            }

            return count;
        }

        private static void SetBadge(TMP_Text badge, int count)
        {
            if (badge == null)
            {
                return;
            }

            Transform root = badge.transform.parent;
            bool show = count > 0;
            if (root != null)
            {
                root.gameObject.SetActive(show);
            }

            badge.text = count.ToString();
        }

        private void CreateChestSlot(Transform parent, string name, float minY, float maxY, string timer, string action, Action onClick)
        {
            Image slotBg = CreateImage(parent, name);
            Anchor(slotBg.rectTransform, 0.08f, minY, 0.92f, maxY);
            HomeHubUiFactory.ApplyPanel(slotBg, Kit?.slotPanel, 0.85f);

            if (Kit?.iconChest != null)
            {
                Image chestIcon = CreateImage(slotBg.transform, "ChestIcon");
                Anchor(chestIcon.rectTransform, 0.04f, 0.20f, 0.22f, 0.88f);
                HomeHubUiFactory.ApplyIcon(chestIcon, Kit.iconChest);
            }

            TMP_Text timerLabel = HomeHubUiFactory.CreateText(slotBg.transform, "Timer", 20, FontStyles.Bold, TextAlignmentOptions.Left);
            timerLabel.text = timer;
            Anchor(timerLabel.rectTransform, 0.24f, 0.50f, 0.96f, 0.92f);

            Button start = CreateTextButton(slotBg.transform, "Action", action, 0.08f, 0.06f, 0.92f, 0.46f, onClick);
            UiSkinUtility.ApplyPrimaryButton(start.GetComponent<Image>());
            TMP_Text startLabel = start.GetComponentInChildren<TMP_Text>();
            if (startLabel != null)
            {
                startLabel.fontSize = 18;
            }
        }

        private static void CreateEmptySlot(Transform parent, string name, float minY, float maxY, Action onClick)
        {
            Image slotBg = CreateImage(parent, name);
            Anchor(slotBg.rectTransform, 0.08f, minY, 0.92f, maxY);
            HomeHubUiFactory.ApplyPanel(slotBg, MobileGameUiKit.Theme?.slotPanel, 0.75f);

            TMP_Text label = HomeHubUiFactory.CreateText(slotBg.transform, "Label", 18, FontStyles.Bold, TextAlignmentOptions.Center);
            label.text = "BOX SLOT";
            KitUi.MakeClickable(slotBg.gameObject, onClick);
        }

        private static Button CreateIconOnlyButton(Transform parent, string name, Sprite icon, float minX, float minY, float maxX, float maxY, Action onClick)
        {
            var go = Create(name, parent);
            Anchor(go.GetComponent<RectTransform>(), minX, minY, maxX, maxY);
            var image = go.AddComponent<Image>();
            UiSkinUtility.ApplyTabButton(image, false);
            if (icon != null)
            {
                Image iconImage = HomeHubUiFactory.CreateSpriteImage(go.transform, "Icon", icon);
                Anchor(iconImage.rectTransform, 0.12f, 0.12f, 0.88f, 0.88f);
            }

            var button = go.AddComponent<Button>();
            button.targetGraphic = image;
            button.onClick.AddListener(() => onClick?.Invoke());
            return button;
        }

        private static Button CreateTextButton(Transform parent, string name, string label, float minX, float minY, float maxX, float maxY, Action onClick)
        {
            var go = Create(name, parent);
            Anchor(go.GetComponent<RectTransform>(), minX, minY, maxX, maxY);
            var image = go.AddComponent<Image>();
            UiSkinUtility.ApplyPrimaryButton(image);
            var button = go.AddComponent<Button>();
            button.targetGraphic = image;
            button.onClick.AddListener(() => onClick?.Invoke());
            HomeHubUiFactory.CreateText(go.transform, "Label", 22, FontStyles.Bold, TextAlignmentOptions.Center).text = label;
            return button;
        }

        private static RectTransform CreateRect(Transform parent, string name, float minX, float minY, float maxX, float maxY)
        {
            var go = Create(name, parent);
            Anchor(go.GetComponent<RectTransform>(), minX, minY, maxX, maxY);
            return go.GetComponent<RectTransform>();
        }

        private static Image CreateImage(Transform parent, string name)
        {
            var go = Create(name, parent);
            return go.AddComponent<Image>();
        }

        private static GameObject Create(string name, Transform parent)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            return go;
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

        private static Transform FindDeep(Transform root, string name)
        {
            if (root == null)
            {
                return null;
            }

            if (root.name == name)
            {
                return root;
            }

            for (int i = 0; i < root.childCount; i++)
            {
                Transform found = FindDeep(root.GetChild(i), name);
                if (found != null)
                {
                    return found;
                }
            }

            return null;
        }

        private void Awake()
        {
            Instance = this;
        }
    }

    internal sealed class HomeHubLayoutMarker : MonoBehaviour
    {
        public int Version;
    }
}
