(function () {
  var HERO_CONTRACT = "0x8916ea9a8c36bf923920c5c84a77e1b118e915fa";
  var LISTINGS_KEY = "elumia-market-listings";
  var SALES_KEY = "elumia-market-sales";
  var WALLET_KEY = "elumia-market-wallet";

  var PROFILE_MODE_KEY = "mp-profile-mode";
  var PROFILE_ADDRESS_KEY = "mp-profile-address";
  var BINDINGS_KEY = "elumia-hero-bindings";
  var QUESTS_KEY = "elumia-market-quests";
  var BOUNTY_KEY = "elumia-market-bounty";
  var STREAK_KEY = "elumia-market-streak";
  var SPIN_COST = 100;
  var QUEST_REWARDS = {
    login: 250,
    sweep: 500,
    vote: 120,
    inspect: 80,
  };
  var WHEEL_PRIZES = [
    { short: "+50", name: "+50 bounty", bounty: 50 },
    { short: "+100", name: "+100 bounty", bounty: 100 },
    { short: "$15", name: "+$15 store credit", bounty: 0 },
    { short: "Frame", name: "Neon avatar frame", bounty: 0 },
    { short: "+150", name: "+150 bounty", bounty: 150 },
    { short: "Inspect", name: "Free inspect credit", bounty: 0 },
    { short: "+200", name: "Mana surge (+200 bounty)", bounty: 200 },
    { short: "Epic", name: "Epic loot crate", bounty: 0 },
    { short: "+75", name: "+75 bounty", bounty: 75 },
    { short: "Sweep", name: "Floor sweep boost", bounty: 0 },
    { short: "+300", name: "+300 bounty", bounty: 300 },
    { short: "Glow", name: "Guild badge glow", bounty: 0 },
    { short: "$25", name: "+$25 store credit", bounty: 0 },
    { short: "Shard", name: "Rare item shard", bounty: 0 },
    { short: "JACKPOT", name: "+500 bounty jackpot", bounty: 500 },
    { short: "Shield", name: "Streak shield", bounty: 0 },
    { short: "+60", name: "+60 bounty", bounty: 60 },
    { short: "Pet", name: "Companion pet treat", bounty: 0 },
    { short: "+120", name: "+120 bounty", bounty: 120 },
    { short: "Token", name: "Legendary spin token", bounty: 0 },
  ];
  var VOTES_KEY = "elumia-community-votes";
  var ADMIN_KEY = "elumia-community-admin";
  var VOLUME_KEY = "elumia-market-volume";
  var VOLUME_BASE = 454600;
  var ADMIN_PASSWORD = "Elumia6551new";
  var SESSION_START = Date.now();

  var listings = [];
  var mockSales = [];
  var heroPool = [];
  var activeSection = "marketplace";
  var activeView = "home";
  var activeCollection = "heroes";
  var connectedWallet = null;
  var sellState = {
    walletKey: null,
    walletLabel: null,
    heroes: [],
    items: [],
    selectedHero: null,
    selectedItemKeys: {},
    binding: null,
    activeStep: "hero",
  };

  var sectionMeta = {
    marketplace: { kicker: "Legends of Elumia", title: "Hero bundle marketplace" },
    rewards: { kicker: "Bounty hall", title: "Earn daily rewards" },
    community: { kicker: "Guild hub", title: "Weighted community votes" },
    profile: { kicker: "Adventurer", title: "Your hero profile" },
  };

  var viewMeta = {
    home: { kicker: "Legends of Elumia", title: "Hero bundle marketplace" },
    collections: { kicker: "Collections", title: "Heroes, items & companions" },
    activity: { kicker: "Activity", title: "Marketplace chronicle" },
    mine: { kicker: "My listings", title: "Bind & sell hero bundles" },
  };

  var collections = [
    {
      id: "heroes",
      name: "Heroes of Elumia",
      desc: "ERC-721 hero NFTs — images from TokenTrove.",
      image: "https://elumia.triumphcdn.com/imx/mainnet/heroes/collectionLogo.png",
      href: "https://tokentrove.com/collection/LegendsofElumiaHeroes",
    },
    {
      id: "items",
      name: "Items of Elumia",
      desc: "ERC-1155 gear bundled with heroes.",
      image: "https://elumia.triumphcdn.com/imx/mainnet/items/collectionLogo.png",
      href: "https://tokentrove.com/collection/LegendsofElumiaItems",
    },
    {
      id: "pets",
      name: "Companion pets",
      desc: "Shiba, Pitbull, ChaoChao companions.",
      image: "https://nft.elumia.io/mainnet-beta/items/70005_4.png?ext=png",
      href: "https://tokentrove.com/collection/LegendsofElumiaItems",
    },
  ];

  var els = {};

  function cacheElements() {
    els = {
      viewKicker: document.getElementById("mp-view-kicker"),
      viewTitle: document.getElementById("mp-view-title"),
      sections: {
        marketplace: document.getElementById("mp-section-marketplace"),
        rewards: document.getElementById("mp-section-rewards"),
        community: document.getElementById("mp-section-community"),
        profile: document.getElementById("mp-section-profile"),
      },
      sidebarItems: document.querySelectorAll(".mp-sidebar-item[data-section]"),
      subnavLinks: document.querySelectorAll(".mp-subnav-link[data-view]"),
      views: {
        home: document.getElementById("mp-view-home"),
        collections: document.getElementById("mp-view-collections"),
        activity: document.getElementById("mp-view-activity"),
        mine: document.getElementById("mp-view-mine"),
      },
      railFloor: document.getElementById("mp-rail-floor"),
      railDeals: document.getElementById("mp-rail-deals"),
      railPersonal: document.getElementById("mp-rail-personal"),
      railRecent: document.getElementById("mp-rail-recent"),
      topSales: document.getElementById("mp-top-sales"),
      bountyTimer: document.getElementById("mp-bounty-timer"),
      dailyReset: document.getElementById("mp-daily-reset"),
      rewardsReset: document.getElementById("mp-rewards-reset"),
      rewardsStreak: document.getElementById("mp-rewards-streak"),
      questBoard: document.getElementById("mp-quest-board"),
      energyFill: document.getElementById("mp-energy-fill"),
      energyLabel: document.getElementById("mp-energy-label"),
      tickerTrack: document.getElementById("mp-ticker-track"),
      flashDealTitle: document.getElementById("mp-flash-deal-title"),
      flashDealMeta: document.getElementById("mp-flash-deal-meta"),
      flashDealTimer: document.getElementById("mp-flash-deal-timer"),
      flashDealBtn: document.getElementById("mp-flash-deal-btn"),
      flashDealArt: document.getElementById("mp-flash-deal-art"),
      jackpotValue: document.getElementById("mp-jackpot-value"),
      bountyBalance: document.getElementById("mp-bounty-balance"),
      manaWheel: document.getElementById("mp-mana-wheel"),
      wheelFace: document.getElementById("mp-wheel-face"),
      wheelLabels: document.getElementById("mp-wheel-labels"),
      manaSpin: document.getElementById("mp-mana-spin"),
      manaSpinResult: document.getElementById("mp-mana-spin-result"),
      votePower: document.getElementById("mp-vote-power"),
      voteGenesisCount: document.getElementById("mp-vote-genesis-count"),
      voteEpochCount: document.getElementById("mp-vote-epoch-count"),
      voteWalletLabel: document.getElementById("mp-vote-wallet-label"),
      voteLoadTest: document.getElementById("mp-vote-load-test"),
      voteLoadProfile: document.getElementById("mp-vote-load-profile"),
      voteList: document.getElementById("mp-vote-list"),
      adminToggle: document.getElementById("mp-admin-toggle"),
      adminPanel: document.getElementById("mp-admin-panel"),
      adminGate: document.getElementById("mp-admin-gate"),
      adminGateForm: document.getElementById("mp-admin-gate-form"),
      adminPassword: document.getElementById("mp-admin-password"),
      adminGateError: document.getElementById("mp-admin-gate-error"),
      adminCreate: document.getElementById("mp-admin-create"),
      voteTopic: document.getElementById("mp-vote-topic"),
      voteImageUrl: document.getElementById("mp-vote-image-url"),
      voteImageFile: document.getElementById("mp-vote-image-file"),
      voteImagePreview: document.getElementById("mp-vote-image-preview"),
      voteOutcomes: document.getElementById("mp-vote-outcomes"),
      voteAddOutcome: document.getElementById("mp-vote-add-outcome"),
      adminLock: document.getElementById("mp-admin-lock"),
      personalCopy: document.getElementById("mp-personal-copy"),
      personalLogin: document.getElementById("mp-personal-login"),
      connectWallet: document.getElementById("mp-connect-wallet"),
      profileGate: document.getElementById("mp-profile-gate"),
      profileApp: document.getElementById("mp-profile-app"),
      profileFrame: document.getElementById("mp-profile-frame"),
      profileTest: document.getElementById("mp-profile-test"),
      profileConnectGate: document.getElementById("mp-profile-connect-gate"),
      profileBack: document.getElementById("mp-profile-back"),
      profileConnectModal: document.getElementById("mp-profile-connect-modal"),
      profileAddress: document.getElementById("mp-profile-address"),
      profileLoadAddress: document.getElementById("mp-profile-load-address"),
      profileMetamask: document.getElementById("mp-profile-metamask"),
      profileModalStatus: document.getElementById("mp-profile-modal-status"),
      profilePreviewName: document.getElementById("mp-profile-preview-name"),
      profilePreviewMeta: document.getElementById("mp-profile-preview-meta"),
      profilePreviewImg: document.getElementById("mp-profile-preview-img"),
      collectionGrid: document.getElementById("mp-collection-grid"),
      collectionTitle: document.getElementById("mp-collection-title"),
      collectionDesc: document.getElementById("mp-collection-desc"),
      browseGrid: document.getElementById("mp-browse-grid"),
      mineGrid: document.getElementById("mp-mine-grid"),
      activityFeed: document.getElementById("mp-activity-feed"),
      search: document.getElementById("mp-search"),
      classFilter: document.getElementById("mp-class-filter"),
      sortFilter: document.getElementById("mp-sort-filter"),
      listForm: document.getElementById("mp-list-form"),
      listPrice: document.getElementById("mp-list-price"),
      sellWalletLabel: document.getElementById("mp-sell-wallet-label"),
      sellUseProfile: document.getElementById("mp-sell-use-profile"),
      sellTestWallet: document.getElementById("mp-sell-test-wallet"),
      sellHeroes: document.getElementById("mp-sell-heroes"),
      sellItems: document.getElementById("mp-sell-items"),
      sellItemCount: document.getElementById("mp-sell-item-count"),
      sellSelectAll: document.getElementById("mp-sell-select-all"),
      sellClearItems: document.getElementById("mp-sell-clear-items"),
      sellNextItems: document.getElementById("mp-sell-next-items"),
      sellBackHero: document.getElementById("mp-sell-back-hero"),
      sellBindBtn: document.getElementById("mp-sell-bind-btn"),
      sellBackItems: document.getElementById("mp-sell-back-items"),
      sellBindPreview: document.getElementById("mp-sell-bind-preview"),
      sellSelectedHeroName: document.getElementById("mp-sell-selected-hero-name"),
      sellBoundBanner: document.getElementById("mp-sell-bound-banner"),
      sellBoundTitle: document.getElementById("mp-sell-bound-title"),
      sellBoundCopy: document.getElementById("mp-sell-bound-copy"),
      sellUnbind: document.getElementById("mp-sell-unbind"),
      sellStepTabs: document.querySelectorAll(".mp-sell-step-tab"),
      sellStepHero: document.getElementById("mp-sell-step-hero"),
      sellStepItems: document.getElementById("mp-sell-step-items"),
      sellStepList: document.getElementById("mp-sell-step-list"),
      profileSell: document.getElementById("mp-profile-sell"),
      modal: document.getElementById("mp-modal"),
      modalTitle: document.getElementById("mp-modal-title"),
      modalBody: document.getElementById("mp-modal-body"),
      toast: document.getElementById("mp-toast"),
      loading: document.getElementById("mp-loading"),
      error: document.getElementById("mp-error"),
    };
  }

  function traitValue(attributes, key) {
    if (!attributes) return "";
    for (var i = 0; i < attributes.length; i++) {
      if (
        String(attributes[i].trait_type || "").toLowerCase() ===
        String(key).toLowerCase()
      ) {
        return attributes[i].value;
      }
    }
    return "";
  }

  function shortAddress(address) {
    if (!address || address.length < 10) return address || "";
    return address.slice(0, 6) + "…" + address.slice(-4);
  }

  function timeAgo(ts) {
    var diff = Math.max(0, Date.now() - ts);
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + " min ago";
    var hours = Math.floor(mins / 60);
    if (hours < 24) return hours + "h ago";
    return Math.floor(hours / 24) + "d ago";
  }

  function priceUsd(listingOrAmount) {
    if (listingOrAmount != null && typeof listingOrAmount === "object") {
      return Number(listingOrAmount.price) || 0;
    }
    return Number(listingOrAmount) || 0;
  }

  function formatUsd(amount) {
    var n = Number(amount);
    if (!isFinite(n) || n < 0) return "$0.00";
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(2) + "M";
    if (n >= 10000) return "$" + Math.round(n).toLocaleString("en-US");
    if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "k";
    return "$" + n.toFixed(2);
  }

  function formatListingPrice(listingOrAmount) {
    return formatUsd(priceUsd(listingOrAmount));
  }

  function formatVolumeAmount(value) {
    var n = Number(value);
    if (!isFinite(n) || n < 0) return "0";
    if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return String(Math.round(n));
  }

  function loadMarketVolume() {
    try {
      var raw = localStorage.getItem(VOLUME_KEY);
      var stored = raw == null ? NaN : Number(raw);
      if (isFinite(stored) && stored >= VOLUME_BASE) return stored;
    } catch (err) {
      /* ignore */
    }
    return VOLUME_BASE;
  }

  function saveMarketVolume() {
    try {
      localStorage.setItem(VOLUME_KEY, String(jackpotValue));
    } catch (err) {
      /* ignore */
    }
  }

  function hashString(value) {
    var hash = 0;
    var str = String(value || "");
    for (var i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  function listingExpiresAt(listing) {
    var windowMs = (8 + (hashString(listing.id) % 22)) * 60 * 1000;
    return SESSION_START + windowMs;
  }

  function formatCountdown(ms) {
    var total = Math.max(0, Math.floor(ms / 1000));
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    if (h > 0) {
      return (
        String(h).padStart(2, "0") +
        ":" +
        String(m).padStart(2, "0") +
        ":" +
        String(s).padStart(2, "0")
      );
    }
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function loadBounty() {
    try {
      var raw = localStorage.getItem(BOUNTY_KEY);
      var value = raw == null ? 0 : Number(raw);
      return isFinite(value) && value >= 0 ? Math.floor(value) : 0;
    } catch (err) {
      return 0;
    }
  }

  function saveBounty(value) {
    localStorage.setItem(BOUNTY_KEY, String(Math.max(0, Math.floor(value))));
    renderBountyBalance();
  }

  function addBounty(amount) {
    if (!amount) return loadBounty();
    saveBounty(loadBounty() + amount);
    return loadBounty();
  }

  function spendBounty(amount) {
    var current = loadBounty();
    if (current < amount) return false;
    saveBounty(current - amount);
    return true;
  }

  function renderBountyBalance() {
    var balance = loadBounty();
    if (els.bountyBalance) {
      els.bountyBalance.textContent = String(balance);
    }
    if (els.manaSpin) {
      els.manaSpin.disabled = balance < SPIN_COST || !!els.manaSpin.dataset.spinning;
      els.manaSpin.textContent =
        balance < SPIN_COST
          ? "Need " + SPIN_COST + " bounty"
          : "Spin · " + SPIN_COST + " bounty";
    }
  }

  function questReady(id, q) {
    if (id === "inspect") return (q.inspect || 0) >= 3;
    if (id === "login") return true;
    return !!q[id];
  }

  function questClaimed(id, q) {
    return !!(q.claimed && q.claimed[id]);
  }

  function claimQuestBounty(id) {
    var q = loadQuestState();
    if (questClaimed(id, q)) return false;
    if (!questReady(id, q)) return false;
    if (id === "login" && !q.login) {
      markQuest("login");
      q = loadQuestState();
    }
    if (!q.claimed) q.claimed = {};
    q.claimed[id] = true;
    saveQuestState(q);
    addBounty(QUEST_REWARDS[id] || 0);
    renderQuestBoard();
    return true;
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  var wheelRotation = 0;
  var wheelSpinning = false;

  function buildManaWheel() {
    if (!els.wheelFace || !els.wheelLabels) return;
    var count = WHEEL_PRIZES.length;
    var segment = 360 / count;
    var stops = [];
    for (var i = 0; i < count; i += 1) {
      var color = i % 2 === 0 ? "#0d3a5c" : "#1a8cff";
      if (i === 14) color = "#6b5ce7";
      stops.push(color + " " + i * segment + "deg " + (i + 1) * segment + "deg");
    }
    els.wheelFace.style.background =
      "conic-gradient(from -90deg, " + stops.join(", ") + ")";
    els.wheelLabels.innerHTML = "";
    WHEEL_PRIZES.forEach(function (prize, index) {
      var label = document.createElement("span");
      label.className = "mp-wheel-label";
      label.textContent = prize.short;
      var angle = index * segment + segment / 2;
      label.style.transform =
        "rotate(" + angle + "deg) translateY(-118px) rotate(-" + angle + "deg)";
      els.wheelLabels.appendChild(label);
    });
  }

  function spinManaWheel(event) {
    if (wheelSpinning) return;
    if (loadBounty() < SPIN_COST) {
      showToast("Need " + SPIN_COST + " bounty to spin. Claim daily quests first.");
      return;
    }
    if (!spendBounty(SPIN_COST)) {
      showToast("Not enough bounty for a spin.");
      renderBountyBalance();
      return;
    }

    wheelSpinning = true;
    if (els.manaSpin) {
      els.manaSpin.dataset.spinning = "1";
      els.manaSpin.disabled = true;
    }
    if (els.manaWheel) els.manaWheel.classList.add("is-spinning");
    if (els.manaSpinResult) {
      els.manaSpinResult.textContent = "Spinning…";
      els.manaSpinResult.classList.remove("is-win");
    }

    var winIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    var segment = 360 / WHEEL_PRIZES.length;
    var extraSpins = 5 + Math.floor(Math.random() * 4);
    var targetOffset = 360 - (winIndex * segment + segment / 2);
    wheelRotation += extraSpins * 360 + targetOffset;

    if (els.manaWheel) {
      els.manaWheel.style.transition =
        "transform 4.2s cubic-bezier(0.12, 0.85, 0.18, 1)";
      els.manaWheel.style.transform = "rotate(" + wheelRotation + "deg)";
    }

    window.setTimeout(function () {
      wheelSpinning = false;
      if (els.manaWheel) els.manaWheel.classList.remove("is-spinning");
      if (els.manaSpin) delete els.manaSpin.dataset.spinning;

      var prize = WHEEL_PRIZES[winIndex];
      if (prize.bounty) addBounty(prize.bounty);
      else renderBountyBalance();

      if (els.manaSpinResult) {
        els.manaSpinResult.textContent = "You won: " + prize.name;
        els.manaSpinResult.classList.add("is-win");
      }
      showToast("Mana well: " + prize.name);
      if (window.MarketplaceFx && els.manaSpin) {
        window.MarketplaceFx.ripple(els.manaSpin, event);
      }
    }, 4300);
  }

  function loadQuestState() {
    var fallback = {
      day: todayKey(),
      inspect: 0,
      sweep: false,
      login: false,
      vote: false,
      spin: false,
      claimed: {},
    };
    try {
      var raw = localStorage.getItem(QUESTS_KEY);
      var data = raw ? JSON.parse(raw) : fallback;
      if (data.day !== todayKey()) return fallback;
      return data;
    } catch (err) {
      return fallback;
    }
  }

  function saveQuestState(state) {
    localStorage.setItem(QUESTS_KEY, JSON.stringify(state));
  }

  function questProgress() {
    var q = loadQuestState();
    var done = 0;
    if (q.login) done += 1;
    if (q.inspect >= 3) done += 1;
    if (q.sweep) done += 1;
    if (q.vote) done += 1;
    return { done: done, total: 4, state: q };
  }

  function markQuest(key, value) {
    var q = loadQuestState();
    if (key === "inspect") {
      q.inspect = Math.min(3, (q.inspect || 0) + 1);
    } else {
      q[key] = value == null ? true : value;
    }
    saveQuestState(q);
    renderQuestBoard();
    return q;
  }

  function renderQuestBoard() {
    var progress = questProgress();
    var q = progress.state;
    if (els.energyFill) {
      els.energyFill.style.width =
        Math.round((progress.done / progress.total) * 100) + "%";
    }
    if (els.energyLabel) {
      els.energyLabel.textContent =
        progress.done + " / " + progress.total + " quests";
    }
    if (!els.questBoard) return;
    var quests = [
      {
        id: "inspect",
        title: "Inspect 3 bundles",
        copy: (q.inspect || 0) + " / 3 listings opened",
        xp: 80,
        done: (q.inspect || 0) >= 3,
        action: "browse",
      },
      {
        id: "sweep",
        title: "Sweep the floor",
        copy: q.sweep ? "Floor swept" : "Hit Sweep on Home",
        xp: 500,
        done: !!q.sweep,
        action: "home",
      },
      {
        id: "login",
        title: "Claim daily login",
        copy: q.login ? "Claimed" : "Tap in Rewards",
        xp: 250,
        done: !!q.login,
        action: "rewards",
      },
      {
        id: "vote",
        title: "Guild vote",
        copy: q.vote ? "Vote locked in" : "Vote in Community",
        xp: 120,
        done: !!q.vote,
        action: "community",
      },
    ];
    els.questBoard.innerHTML = "";
    quests.forEach(function (quest) {
      var card = document.createElement("button");
      card.type = "button";
      card.className = "mp-quest-card" + (quest.done ? " is-done" : "");
      card.innerHTML =
        "<strong>" +
        quest.title +
        "</strong><span>" +
        quest.copy +
        '</span><span class="mp-quest-xp">+' +
        quest.xp +
        " bounty</span>";
      card.addEventListener("click", function () {
        if (quest.action === "rewards") setSection("rewards");
        else if (quest.action === "community") setSection("community");
        else if (quest.action === "browse") {
          setSection("marketplace");
          setView("collections");
        } else {
          setSection("marketplace");
          setView("home");
        }
      });
      els.questBoard.appendChild(card);
    });
    document.querySelectorAll(".mp-reward-card[data-quest]").forEach(function (card) {
      var id = card.getAttribute("data-quest");
      var claimed = questClaimed(id, q);
      var ready = questReady(id, q);
      card.classList.toggle("is-claimed", claimed);
      var cta = card.querySelector(".mp-reward-cta");
      if (cta) {
        if (claimed) cta.textContent = "Claimed";
        else if (ready) cta.textContent = "Tap to claim";
        else if (id === "login") cta.textContent = "Tap to claim";
        else if (id === "sweep") cta.textContent = "Sweep first, then claim";
        else if (id === "vote") cta.textContent = "Vote in Community";
        else cta.textContent = "Open listings to progress";
      }
    });
  }

  function renderTicker() {
    if (!els.tickerTrack) return;
    var names = allListings()
      .slice(0, 8)
      .map(function (listing) {
        return (
          (listing.hero.name || "Hero") +
          " listed at " +
          formatListingPrice(listing)
        );
      });
    var extra = [
      "Floor bounty pool is live",
      "Flash listing expires soon",
      "Daily mana board resets at midnight",
    ];
    els.tickerTrack.textContent = names.concat(extra).join("   ◆   ") + "   ◆   ";
  }

  var flashDealListing = null;

  function renderFlashDeal() {
    var all = allListings();
    if (!all.length) return;
    flashDealListing = all.slice().sort(function (a, b) {
      return listingExpiresAt(a) - listingExpiresAt(b);
    })[0];
    if (!flashDealListing) return;
    if (els.flashDealTitle) {
      els.flashDealTitle.textContent =
        (flashDealListing.hero.name || "Hero bundle") + " is flashing out";
    }
    if (els.flashDealMeta) {
      els.flashDealMeta.textContent =
        formatListingPrice(flashDealListing) +
        " · " +
        ((flashDealListing.bundle && flashDealListing.bundle.length) || 0) +
        " bound assets · inspect before the timer dies";
    }
    if (els.flashDealArt) {
      els.flashDealArt.innerHTML =
        '<img src="' + heroImage(flashDealListing.hero) + '" alt="">';
    }
  }

  function tickListingTimers() {
    var now = Date.now();
    document.querySelectorAll("[data-listing-timer]").forEach(function (node) {
      var ends = Number(node.getAttribute("data-listing-timer"));
      var remaining = ends - now;
      node.textContent = remaining <= 0 ? "ENDED" : formatCountdown(remaining);
      node.classList.toggle("is-urgent", remaining > 0 && remaining <= 120000);
    });
    if (els.flashDealTimer && flashDealListing) {
      var flashLeft = listingExpiresAt(flashDealListing) - now;
      els.flashDealTimer.textContent =
        flashLeft <= 0 ? "ENDED" : formatCountdown(flashLeft);
      els.flashDealTimer.classList.toggle(
        "is-urgent",
        flashLeft > 0 && flashLeft <= 120000
      );
    }
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      els.toast.classList.remove("is-visible");
    }, 3200);
  }

  function loadJson(path) {
    return fetch(path, { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("Failed to load " + path);
      return res.text().then(function (text) {
        return JSON.parse(String(text || "").replace(/^\uFEFF/, ""));
      });
    });
  }

  function loadStored(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function saveStored(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadWallet() {
    try {
      var raw = localStorage.getItem(WALLET_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function saveWallet(wallet) {
    if (wallet) localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
    else localStorage.removeItem(WALLET_KEY);
  }

  function itemKey(item) {
    return (
      String(item.contract_address || "item").toLowerCase() +
      ":" +
      String(item.token_id)
    );
  }

  function loadBindingsMap() {
    try {
      var raw = localStorage.getItem(BINDINGS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      return {};
    }
  }

  function saveBindingsMap(map) {
    localStorage.setItem(BINDINGS_KEY, JSON.stringify(map));
  }

  function getBindingForWallet(walletKey) {
    if (!walletKey) return null;
    var map = loadBindingsMap();
    return map[walletKey.toLowerCase()] || null;
  }

  function saveBindingForWallet(walletKey, binding) {
    var map = loadBindingsMap();
    var key = walletKey.toLowerCase();
    if (!binding) {
      delete map[key];
    } else {
      map[key] = binding;
    }
    saveBindingsMap(map);
  }

  function tokentroveHeroUrl(tokenId) {
    return (
      "https://tokentrove.com/collection/LegendsofElumiaHeroes/" + tokenId
    );
  }

  function tokentroveItemUrl(tokenId) {
    return "https://tokentrove.com/collection/LegendsofElumiaItems/" + tokenId;
  }

  function setLoading(isLoading) {
    if (els.loading) els.loading.hidden = !isLoading;
  }

  function setError(message) {
    if (!els.error) return;
    if (!message) {
      els.error.hidden = true;
      els.error.textContent = "";
      return;
    }
    els.error.hidden = false;
    els.error.textContent = message;
  }

  function inventoryEmbedUrl(options) {
    options = options || {};
    var url = "elumia-inventory.html?embed=1";
    if (options.test) url += "&test=1";
    if (options.address) {
      url += "&address=" + encodeURIComponent(options.address);
    }
    return url;
  }

  function showProfileGate() {
    if (els.profileGate) els.profileGate.hidden = false;
    if (els.profileApp) els.profileApp.hidden = true;
    if (els.profileFrame) els.profileFrame.src = "about:blank";
  }

  function showProfileApp(options) {
    options = options || {};
    if (els.profileGate) els.profileGate.hidden = true;
    if (els.profileApp) els.profileApp.hidden = false;
    if (els.profileFrame) {
      els.profileFrame.src = inventoryEmbedUrl(options);
    }
    if (window.MarketplaceFx && els.profileApp) {
      window.MarketplaceFx.onSectionChange(els.profileApp);
    }
  }

  function openProfileConnectModal() {
    if (!els.profileConnectModal) return;
    if (els.profileModalStatus) els.profileModalStatus.textContent = "";
    els.profileConnectModal.hidden = false;
    els.profileConnectModal.setAttribute("aria-hidden", "false");
  }

  function closeProfileConnectModal() {
    if (!els.profileConnectModal) return;
    els.profileConnectModal.hidden = true;
    els.profileConnectModal.setAttribute("aria-hidden", "true");
  }

  function setProfileModalStatus(message) {
    if (els.profileModalStatus) els.profileModalStatus.textContent = message || "";
  }

  function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(String(address || "").trim());
  }

  function unlockProfileTest() {
    sessionStorage.setItem(PROFILE_MODE_KEY, "test");
    sessionStorage.setItem(PROFILE_ADDRESS_KEY, "0xTestAdventurer");
    showProfileApp({ test: true });
    showToast("Test profile loaded — sample hero & inventory.");
    if (window.MarketplaceFx && els.profileTest) {
      var rect = els.profileTest.getBoundingClientRect();
      window.MarketplaceFx.burst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        20
      );
    }
  }

  function unlockProfileAddress(address) {
    sessionStorage.setItem(PROFILE_MODE_KEY, "connected");
    sessionStorage.setItem(PROFILE_ADDRESS_KEY, address);
    closeProfileConnectModal();
    showProfileApp({ address: address });
    showToast("Profile loaded for " + shortAddress(address));
  }

  function populateProfilePreview() {
    var sample = listings[0];
    if (!sample || !sample.hero) return;
    var hero = sample.hero;
    if (els.profilePreviewName) {
      els.profilePreviewName.textContent = hero.name || "Hero #" + hero.token_id;
    }
    if (els.profilePreviewMeta) {
      var heroClass = traitValue(hero.attributes, "CLASS") || "Hero";
      var itemCount = sample.items ? sample.items.length : 0;
      els.profilePreviewMeta.textContent =
        heroClass + " · Hero #" + hero.token_id + " · " + itemCount + " items";
    }
    if (els.profilePreviewImg && hero.image) {
      els.profilePreviewImg.src = hero.image;
    }
  }

  function initProfileSection() {
    var mode = sessionStorage.getItem(PROFILE_MODE_KEY);
    if (mode === "test") {
      showProfileApp({ test: true });
    } else if (mode === "connected") {
      showProfileGate();
    } else {
      showProfileGate();
    }
  }

  function heroImage(hero) {
    return (
      hero.image ||
      "https://elumia.triumphcdn.com/imx/mainnet/heroes/collectionLogo.png"
    );
  }

  function assetImage(asset) {
    return (
      asset.image ||
      "https://elumia.triumphcdn.com/imx/mainnet/items/collectionLogo.png"
    );
  }

  function allListings() {
    return loadStored(LISTINGS_KEY).concat(listings);
  }

  function findListing(id) {
    return allListings().find(function (entry) {
      return entry.id === id;
    });
  }

  function filteredListings(sourceListings) {
    var query = els.search ? String(els.search.value || "").trim().toLowerCase() : "";
    var classFilter = els.classFilter ? els.classFilter.value : "all";
    var sort = els.sortFilter ? els.sortFilter.value : "newest";
    var visible = sourceListings.filter(function (listing) {
      if (activeCollection === "pets" && !listing.pet) return false;
      if (activeCollection === "items" && !(listing.items && listing.items.length)) {
        return false;
      }
      var hero = listing.hero;
      var heroClass = String(traitValue(hero.attributes, "CLASS") || "").toLowerCase();
      var name = String(hero.name || "").toLowerCase();
      var tokenId = String(hero.token_id || "");
      if (classFilter !== "all" && heroClass !== classFilter) return false;
      if (!query) return true;
      return (
        name.indexOf(query) >= 0 ||
        tokenId.indexOf(query) >= 0 ||
        heroClass.indexOf(query) >= 0
      );
    });
    visible.sort(function (a, b) {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    return visible;
  }

  function heroClassLabel(hero) {
    return traitValue(hero.attributes, "CLASS") || "";
  }

  function heroFateLabel(hero) {
    return traitValue(hero.attributes, "FATE") || "";
  }

  function renderTile(listing, options) {
    options = options || {};
    var hero = listing.hero;
    var heroClass = heroClassLabel(hero);
    var tile = document.createElement("article");
    tile.className = "mp-tile" + (options.floor ? " mp-tile--floor" : "");
    tile.innerHTML =
      '<div class="mp-tile-shine"></div>' +
      '<div class="mp-tile-media">' +
      (options.badge
        ? '<span class="mp-tile-badge">' + options.badge + "</span>"
        : "") +
      (heroClass
        ? '<span class="mp-tile-class">' + heroClass + "</span>"
        : "") +
      (listing.pet
        ? '<div class="mp-tile-pet"><img src="' +
          assetImage(listing.pet) +
          '" alt="" loading="lazy"></div>'
        : "") +
      '<img src="' +
      heroImage(hero) +
      '" alt="' +
      (hero.name || "Hero") +
      '" loading="lazy">' +
      "</div>" +
      '<div class="mp-tile-body">' +
      '<div class="mp-tile-price">' +
      formatListingPrice(listing) +
      "</div>" +
      '<div class="mp-tile-meta">' +
      (hero.name || "Hero #" + hero.token_id) +
      "<br>" +
      (options.subline ||
        (listing.bundle ? listing.bundle.length : 0) +
          " assets · " +
          timeAgo(listing.createdAt)) +
      "</div>" +
      '<div class="mp-listing-timer" data-listing-timer="' +
      listingExpiresAt(listing) +
      '">--:--</div>' +
      "</div>";
    tile.addEventListener("click", function () {
      openListingModal(listing.id);
    });
    return tile;
  }

  function renderBrowseCard(listing) {
    var hero = listing.hero;
    var icons = (listing.bundle || listing.items || []).slice(0, 4);
    var card = document.createElement("article");
    card.className = "mp-browse-card";
    card.innerHTML =
      '<div class="mp-tile-shine"></div>' +
      '<div class="mp-tile-media">' +
      '<img src="' +
      heroImage(hero) +
      '" alt="" loading="lazy">' +
      "</div>" +
      '<div class="mp-tile-body">' +
      '<div class="mp-tile-name">' +
      (hero.name || "Hero #" + hero.token_id) +
      "</div>" +
      '<div class="mp-tile-meta">' +
      (heroClassLabel(hero) || "Hero") +
      " · " +
      ((listing.bundle && listing.bundle.length) || 0) +
      " assets</div>" +
      '<div class="mp-tile-icons">' +
      (listing.pet
        ? '<img src="' + assetImage(listing.pet) + '" alt="">'
        : "") +
      icons
        .map(function (asset) {
          return '<img src="' + assetImage(asset) + '" alt="">';
        })
        .join("") +
      "</div>" +
      "</div>" +
      '<div class="mp-tile-price">' +
      formatListingPrice(listing) +
      "</div>" +
      '<div class="mp-listing-timer" data-listing-timer="' +
      listingExpiresAt(listing) +
      '">--:--</div>';
    card.addEventListener("click", function () {
      openListingModal(listing.id);
    });
    return card;
  }

  function renderRail(container, items, options) {
    if (!container) return;
    container.innerHTML = "";
    if (!items.length) {
      container.innerHTML = '<p class="mp-empty">No listings yet.</p>';
      return;
    }
    items.forEach(function (listing) {
      container.appendChild(renderTile(listing, options));
    });
    tickListingTimers();
    if (window.MarketplaceFx) {
      window.MarketplaceFx.staggerReveal(container);
    }
  }

  function renderBrowseGrid(container, items) {
    if (!container) return;
    container.innerHTML = "";
    if (!items.length) {
      container.innerHTML = '<p class="mp-empty">No bundles match your filters.</p>';
      return;
    }
    items.forEach(function (listing) {
      container.appendChild(renderBrowseCard(listing));
    });
    tickListingTimers();
    if (window.MarketplaceFx) {
      window.MarketplaceFx.staggerReveal(container);
    }
  }

  function getSales() {
    var stored = loadStored(SALES_KEY);
    if (stored.length) return stored;
    return mockSales.slice();
  }

  function renderTopSales() {
    if (!els.topSales) return;
    var sales = getSales().slice(0, 8);
    els.topSales.innerHTML = "";
    if (!sales.length) {
      els.topSales.innerHTML = '<p class="mp-empty">No sales yet.</p>';
      return;
    }
    sales.forEach(function (sale, index) {
      var row = document.createElement("button");
      row.type = "button";
      row.className = "mp-sale-row";
      row.innerHTML =
        '<div class="mp-sale-rank">' +
        (index + 1) +
        "</div>" +
        '<div class="mp-sale-thumb"><img src="' +
        heroImage(sale.hero) +
        '" alt="" loading="lazy"></div>' +
        "<div>" +
        '<div class="mp-sale-name">' +
        (sale.hero.name || "Hero #" + sale.hero.token_id) +
        "</div>" +
        '<div class="mp-sale-sub">' +
        timeAgo(sale.soldAt) +
        "</div>" +
        "</div>" +
        '<div class="mp-sale-price">' +
        formatListingPrice(sale) +
        "</div>";
      row.addEventListener("click", function () {
        openListingModal(sale.listingId);
      });
      els.topSales.appendChild(row);
    });
    if (window.MarketplaceFx) {
      window.MarketplaceFx.staggerReveal(els.topSales);
    }
  }

  function renderActivity() {
    if (!els.activityFeed) return;
    var events = [];
    allListings().forEach(function (listing) {
      events.push({ type: "Listed", listing: listing, at: listing.createdAt });
    });
    getSales().forEach(function (sale) {
      events.push({
        type: "Sold",
        listing:
          findListing(sale.listingId) ||
          { hero: sale.hero, price: sale.price, currency: "USD" },
        at: sale.soldAt,
      });
    });
    events.sort(function (a, b) {
      return b.at - a.at;
    });
    els.activityFeed.innerHTML = "";
    if (!events.length) {
      els.activityFeed.innerHTML =
        '<p class="mp-empty">No marketplace activity yet.</p>';
      return;
    }
    events.slice(0, 24).forEach(function (event) {
      var row = document.createElement("div");
      row.className = "mp-activity-row";
      row.innerHTML =
        '<div class="mp-activity-type">' +
        event.type +
        "</div>" +
        "<div>" +
        '<div class="mp-sale-name">' +
        (event.listing.hero.name || "Hero bundle") +
        "</div>" +
        '<div class="mp-sale-sub">' +
        timeAgo(event.at) +
        "</div>" +
        "</div>" +
        '<div class="mp-sale-price">' +
        formatListingPrice(event.listing) +
        "</div>";
      els.activityFeed.appendChild(row);
    });
    if (window.MarketplaceFx) {
      window.MarketplaceFx.staggerReveal(els.activityFeed);
    }
  }

  function renderPersonalized() {
    if (!els.railPersonal) return;
    if (!connectedWallet) {
      els.railPersonal.innerHTML = "";
      return;
    }
    var prefs = connectedWallet.preferredClass || "";
    var picks = allListings()
      .filter(function (listing) {
        if (!prefs) return true;
        return (
          String(traitValue(listing.hero.attributes, "CLASS") || "").toLowerCase() ===
          prefs
        );
      })
      .slice(0, 10);
    if (!picks.length) picks = allListings().slice(0, 8);
    renderRail(els.railPersonal, picks, {
      subline: "Recommended for your wallet",
    });
  }

  function renderHome() {
    var all = allListings();
    if (!all.length) return;

    var floor = all
      .slice()
      .sort(function (a, b) {
        return a.price - b.price;
      })
      .slice(0, 10);
    var deals = all
      .slice()
      .sort(function (a, b) {
        return (b.score || 0) - (a.score || 0);
      })
      .slice(0, 12);
    var recent = all
      .slice()
      .sort(function (a, b) {
        return b.createdAt - a.createdAt;
      })
      .slice(0, 14);

    renderRail(els.railFloor, floor, { floor: true, badge: "Floor" });
    renderRail(els.railDeals, deals, { badge: "Deal" });
    Array.prototype.forEach.call(
      els.railDeals ? els.railDeals.children : [],
      function (tile, index) {
        var listing = deals[index];
        if (!listing || !tile || tile.classList.contains("mp-empty")) return;
        var meta = tile.querySelector(".mp-tile-meta");
        if (meta) {
          meta.innerHTML =
            (listing.hero.name || "Hero") +
            "<br>" +
            (listing.score || 0) +
            " assets per dollar";
        }
      }
    );
    renderPersonalized();
    renderRail(els.railRecent, recent, {});
    renderTopSales();
    renderTicker();
    renderFlashDeal();
    renderQuestBoard();
    tickListingTimers();
    if (window.MarketplaceFx) {
      window.MarketplaceFx.afterRender(
        document.getElementById("mp-view-home"),
        all
      );
    }
  }

  function renderCollections() {
    if (!els.collectionGrid) return;
    els.collectionGrid.innerHTML = "";
    collections.forEach(function (collection) {
      var card = document.createElement("button");
      card.type = "button";
      card.className =
        "mp-collection-card" +
        (activeCollection === collection.id ? " is-active" : "");
      card.innerHTML =
        '<img src="' +
        collection.image +
        '" alt="" loading="lazy">' +
        "<h3>" +
        collection.name +
        "</h3>" +
        "<p>" +
        collection.desc +
        "</p>";
      card.addEventListener("click", function () {
        activeCollection = collection.id;
        if (els.collectionTitle) els.collectionTitle.textContent = collection.name;
        if (els.collectionDesc) els.collectionDesc.textContent = collection.desc;
        renderCollections();
      });
      card.addEventListener("dblclick", function () {
        window.open(collection.href, "_blank", "noopener");
      });
      els.collectionGrid.appendChild(card);
    });
    renderBrowseGrid(els.browseGrid, filteredListings(allListings()));
  }

  function renderMine() {
    renderBrowseGrid(els.mineGrid, loadStored(LISTINGS_KEY));
    initSellWizard();
  }

  function setSellStep(step) {
    sellState.activeStep = step;
    if (els.sellStepHero) els.sellStepHero.hidden = step !== "hero";
    if (els.sellStepItems) els.sellStepItems.hidden = step !== "items";
    if (els.sellStepList) els.sellStepList.hidden = step !== "list";
    if (els.sellStepTabs) {
      els.sellStepTabs.forEach(function (tab) {
        tab.classList.toggle("is-active", tab.dataset.sellStep === step);
      });
    }
    if (window.MarketplaceFx) {
      window.MarketplaceFx.onSellStepChange(step);
    }
  }

  function updateSellWalletLabel() {
    if (!els.sellWalletLabel) return;
    els.sellWalletLabel.textContent = sellState.walletLabel || "Not loaded";
  }

  function countSelectedItems() {
    return Object.keys(sellState.selectedItemKeys).filter(function (key) {
      return sellState.selectedItemKeys[key];
    }).length;
  }

  function updateSellItemCount() {
    var count = countSelectedItems();
    if (els.sellItemCount) {
      els.sellItemCount.textContent = count + " selected";
    }
    if (els.sellBindBtn) {
      els.sellBindBtn.disabled = !sellState.selectedHero || count === 0;
    }
    if (window.MarketplaceFx) {
      window.MarketplaceFx.updateSellBundleScore(
        sellState.selectedHero ? 1 : 0,
        count
      );
    }
  }

  function updateBoundBanner() {
    var binding = sellState.binding;
    if (!els.sellBoundBanner) return;
    if (!binding || !binding.hero) {
      els.sellBoundBanner.hidden = true;
      return;
    }
    els.sellBoundBanner.hidden = false;
    if (els.sellBoundTitle) {
      els.sellBoundTitle.textContent =
        (binding.hero.name || "Hero #" + binding.hero.token_id) + " is bound";
    }
    if (els.sellBoundCopy) {
      els.sellBoundCopy.textContent =
        (binding.boundItems ? binding.boundItems.length : 0) +
        " items locked to this hero · ready to list";
    }
  }

  function applyExistingBinding() {
    if (!sellState.walletKey) return;
    var binding = getBindingForWallet(sellState.walletKey);
    sellState.binding = binding;
    if (!binding) return;

    sellState.selectedHero =
      sellState.heroes.find(function (hero) {
        return String(hero.token_id) === String(binding.heroTokenId);
      }) || binding.hero;

    sellState.selectedItemKeys = {};
    (binding.boundItems || []).forEach(function (item) {
      sellState.selectedItemKeys[itemKey(item)] = true;
    });

    setSellStep("list");
    renderSellBindPreview();
    updateBoundBanner();
    if (window.MarketplaceFx) {
      window.MarketplaceFx.resumeSellBindLock();
    }
  }

  function loadSellPortfolio(options) {
    options = options || {};
    var walletKey = options.walletKey;
    var walletLabel = options.walletLabel;

    return loadJson("assets/elumia/marketplace-cache.json").then(function (cache) {
      sellState.walletKey = walletKey;
      sellState.walletLabel = walletLabel;
      sellState.heroes = (cache.heroes || []).slice();
      sellState.items = (cache.items || []).slice();
      sellState.selectedHero = null;
      sellState.selectedItemKeys = {};
      sellState.binding = getBindingForWallet(walletKey);

      updateSellWalletLabel();

      if (sellState.binding) {
        applyExistingBinding();
      } else {
        setSellStep("hero");
      }

      renderSellHeroes();
      renderSellItems();
      updateSellItemCount();
      updateBoundBanner();
      if (window.MarketplaceFx) {
        window.MarketplaceFx.onSellWalletLoaded();
      }
    });
  }

  function loadSellTestWallet() {
    return loadSellPortfolio({
      walletKey: "0xTestAdventurer",
      walletLabel: "Test adventurer (Ryan)",
    });
  }

  function loadSellProfileWallet() {
    var mode = sessionStorage.getItem(PROFILE_MODE_KEY);
    var address = sessionStorage.getItem(PROFILE_ADDRESS_KEY);
    if (!mode || mode === "gate") {
      showToast("Connect your profile wallet first, or use Test wallet.");
      return Promise.resolve();
    }
    if (mode === "test") {
      return loadSellPortfolio({
        walletKey: "0xTestAdventurer",
        walletLabel: "Profile · Test adventurer",
      });
    }
    if (address && isValidAddress(address)) {
      return loadSellPortfolio({
        walletKey: address,
        walletLabel: "Profile · " + shortAddress(address),
      });
    }
    showToast("No profile wallet found — connect in Profile first.");
    return Promise.resolve();
  }

  function renderSellHeroes() {
    if (!els.sellHeroes) return;
    els.sellHeroes.innerHTML = "";

    if (!sellState.heroes.length) {
      els.sellHeroes.innerHTML =
        '<p class="mp-empty">No heroes in this wallet.</p>';
      if (els.sellNextItems) els.sellNextItems.disabled = true;
      return;
    }

    var boundHeroId =
      sellState.binding && sellState.binding.heroTokenId
        ? String(sellState.binding.heroTokenId)
        : null;

    sellState.heroes.forEach(function (hero, index) {
      var card = document.createElement("button");
      card.type = "button";
      card.style.setProperty("--reveal-i", index);
      var isSelected =
        sellState.selectedHero &&
        String(sellState.selectedHero.token_id) === String(hero.token_id);
      var isBound = boundHeroId && String(hero.token_id) === boundHeroId;
      card.className =
        "mp-sell-hero-card" +
        (isSelected ? " is-selected" : "") +
        (isBound ? " is-bound" : "");
      var heroClass = traitValue(hero.attributes, "CLASS") || "Hero";
      card.innerHTML =
        '<div class="mp-sell-hero-glow"></div>' +
        '<img src="' +
        heroImage(hero) +
        '" alt="" loading="lazy">' +
        '<div class="mp-sell-hero-body">' +
        '<strong>' +
        (hero.name || "Hero #" + hero.token_id) +
        "</strong>" +
        "<span>#" +
        hero.token_id +
        " · " +
        heroClass +
        "</span>" +
        (isBound ? '<em class="mp-sell-bound-tag">Bound</em>' : "") +
        "</div>";
      card.addEventListener("click", function () {
        selectSellHero(hero);
      });
      els.sellHeroes.appendChild(card);
    });

    if (window.MarketplaceFx && els.sellHeroes) {
      window.MarketplaceFx.onSellWizardRender(els.sellHeroes);
    }

    if (els.sellNextItems) {
      els.sellNextItems.disabled = !sellState.selectedHero;
    }
  }

  function selectSellHero(hero) {
    if (!hero) return;

    if (
      sellState.binding &&
      String(sellState.binding.heroTokenId) !== String(hero.token_id)
    ) {
      showToast(
        "This wallet already has a bound hero. Unbind first to pick a different one."
      );
      return;
    }

    sellState.selectedHero = hero;
    if (els.sellSelectedHeroName) {
      els.sellSelectedHeroName.textContent = hero.name || "Hero #" + hero.token_id;
    }
    renderSellHeroes();
    if (els.sellNextItems) els.sellNextItems.disabled = false;
    updateSellItemCount();
  }

  function renderSellItems() {
    if (!els.sellItems) return;
    els.sellItems.innerHTML = "";

    if (!sellState.items.length) {
      els.sellItems.innerHTML = '<p class="mp-empty">No items in this wallet.</p>';
      updateSellItemCount();
      return;
    }

    sellState.items.forEach(function (item, index) {
      var key = itemKey(item);
      var card = document.createElement("label");
      card.className = "mp-sell-item-card";
      card.style.setProperty("--reveal-i", index);
      var quality =
        traitValue(item.attributes, "QUALITY") ||
        traitValue(item.attributes, "quality") ||
        "";
      var checked = !!sellState.selectedItemKeys[key];
      card.innerHTML =
        '<input type="checkbox" class="mp-sell-item-check"' +
        (checked ? " checked" : "") +
        ">" +
        '<div class="mp-sell-item-image"><img src="' +
        assetImage(item) +
        '" alt="" loading="lazy"></div>' +
        '<div class="mp-sell-item-body">' +
        "<strong>" +
        (item.name || "Item #" + item.token_id) +
        "</strong>" +
        "<span>" +
        [quality, traitValue(item.attributes, "SLOT")].filter(Boolean).join(" · ") +
        "</span>" +
        "</div>";
      var checkbox = card.querySelector(".mp-sell-item-check");
      checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
          sellState.selectedItemKeys[key] = true;
        } else {
          delete sellState.selectedItemKeys[key];
        }
        updateSellItemCount();
      });
      els.sellItems.appendChild(card);
    });

    if (window.MarketplaceFx && els.sellItems) {
      window.MarketplaceFx.onSellWizardRender(els.sellItems);
    }

    updateSellItemCount();
  }

  function selectAllSellItems(selectAll) {
    if (selectAll) {
      sellState.items.forEach(function (item) {
        sellState.selectedItemKeys[itemKey(item)] = true;
      });
    } else {
      sellState.selectedItemKeys = {};
    }
    renderSellItems();
  }

  function getSelectedSellItems() {
    return sellState.items.filter(function (item) {
      return sellState.selectedItemKeys[itemKey(item)];
    });
  }

  function bindHeroInventory() {
    if (!sellState.walletKey || !sellState.selectedHero) {
      showToast("Pick a hero first.");
      return;
    }
    var selectedItems = getSelectedSellItems();
    if (!selectedItems.length) {
      showToast("Select at least one item to bind.");
      return;
    }

    var binding = {
      walletKey: sellState.walletKey,
      heroTokenId: String(sellState.selectedHero.token_id),
      hero: JSON.parse(JSON.stringify(sellState.selectedHero)),
      boundItems: selectedItems.map(function (item) {
        return JSON.parse(JSON.stringify(item));
      }),
      boundAt: Date.now(),
    };

    saveBindingForWallet(sellState.walletKey, binding);
    sellState.binding = binding;
    updateBoundBanner();
    renderSellHeroes();
    setSellStep("list");
    renderSellBindPreview();
    showToast(
      (binding.hero.name || "Hero") +
        " bound with " +
        selectedItems.length +
        " items — ready to list!"
    );
    if (window.MarketplaceFx) {
      window.MarketplaceFx.onSellBind(els.sellBindBtn);
    }
    if (window.MarketplaceFx && els.sellBindBtn) {
      var rect = els.sellBindBtn.getBoundingClientRect();
      window.MarketplaceFx.burst(rect.left + rect.width / 2, rect.top, 24);
    }
  }

  function unbindHeroInventory() {
    if (!sellState.walletKey) return;
    saveBindingForWallet(sellState.walletKey, null);
    sellState.binding = null;
    sellState.selectedHero = null;
    sellState.selectedItemKeys = {};
    if (window.MarketplaceFx) {
      window.MarketplaceFx.stopSellBindLock();
    }
    updateBoundBanner();
    setSellStep("hero");
    renderSellHeroes();
    renderSellItems();
    renderSellBindPreview();
    showToast("Binding cleared — pick a hero and items again.");
  }

  function renderSellBindPreview() {
    if (!els.sellBindPreview) return;
    var binding = sellState.binding;
    if (!binding || !binding.hero) {
      els.sellBindPreview.innerHTML =
        '<p class="mp-empty">Bind a hero and items before listing.</p>';
      return;
    }

    var itemsHtml = (binding.boundItems || [])
      .map(function (item, index) {
        return (
          '<div class="mp-sell-preview-item" style="--preview-i:' +
          index +
          '">' +
          '<img src="' +
          assetImage(item) +
          '" alt="" loading="lazy">' +
          "<span>" +
          (item.name || "Item") +
          "</span></div>"
        );
      })
      .join("");

    els.sellBindPreview.innerHTML =
      '<div class="mp-sell-preview-hero">' +
      '<img src="' +
      heroImage(binding.hero) +
      '" alt="" loading="lazy">' +
      '<div><strong>' +
      (binding.hero.name || "Hero #" + binding.hero.token_id) +
      "</strong>" +
      "<p>Hero #" +
      binding.hero.token_id +
      " · " +
      (traitValue(binding.hero.attributes, "CLASS") || "Hero") +
      "</p>" +
      '<p class="mp-sell-preview-note">This hero sells with the bound inventory below.</p></div></div>' +
      '<div class="mp-sell-preview-items">' +
      itemsHtml +
      "</div>";
  }

  function initSellWizard() {
    updateSellWalletLabel();
    if (!sellState.walletKey) {
      var existing = getBindingForWallet(sessionStorage.getItem(PROFILE_ADDRESS_KEY));
      if (existing) {
        loadSellProfileWallet();
      }
    }
  }

  function openSellFromProfile() {
    setSection("marketplace");
    setView("mine");
    loadSellProfileWallet().then(function () {
      showToast("Sell wizard loaded from your profile wallet.");
    });
  }

  var votePowerState = {
    walletKey: null,
    walletLabel: "No wallet loaded",
    genesis: 0,
    epoch: 0,
    total: 0,
  };
  var voteImageData = "";

  function nftVotePoints(nft) {
    var gen = String(
      traitValue(nft.attributes, "GENERATION") ||
        traitValue(nft.attributes, "generation") ||
        ""
    ).toLowerCase();
    if (gen.indexOf("genesis") >= 0) return 30;
    return 10;
  }

  function computeVotePower(heroes, items) {
    var genesis = 0;
    var epoch = 0;
    (heroes || []).concat(items || []).forEach(function (nft) {
      if (nftVotePoints(nft) === 30) genesis += 1;
      else epoch += 1;
    });
    return {
      genesis: genesis,
      epoch: epoch,
      total: genesis * 30 + epoch * 10,
    };
  }

  function renderVotePower() {
    if (els.votePower) els.votePower.textContent = String(votePowerState.total);
    if (els.voteGenesisCount) {
      els.voteGenesisCount.textContent = String(votePowerState.genesis);
    }
    if (els.voteEpochCount) {
      els.voteEpochCount.textContent = String(votePowerState.epoch);
    }
    if (els.voteWalletLabel) {
      els.voteWalletLabel.textContent = votePowerState.walletLabel;
    }
  }

  function applyVotePortfolio(walletKey, walletLabel, heroes, items) {
    var power = computeVotePower(heroes, items);
    votePowerState = {
      walletKey: walletKey,
      walletLabel: walletLabel,
      genesis: power.genesis,
      epoch: power.epoch,
      total: power.total,
    };
    renderVotePower();
    renderVoteList();
  }

  function loadVoteTestWallet() {
    return loadJson("assets/elumia/marketplace-cache.json").then(function (cache) {
      applyVotePortfolio(
        "0xTestAdventurer",
        "Test adventurer",
        cache.heroes || [],
        cache.items || []
      );
      showToast(
        "Vote weight loaded — " +
          votePowerState.genesis +
          " Genesis × 30 + " +
          votePowerState.epoch +
          " Epoch × 10 = " +
          votePowerState.total +
          " pts"
      );
    });
  }

  function loadVoteProfileWallet() {
    var mode = sessionStorage.getItem(PROFILE_MODE_KEY);
    var address = sessionStorage.getItem(PROFILE_ADDRESS_KEY);
    if (!mode) {
      showToast("Connect in Profile first, or load the test wallet.");
      return Promise.resolve();
    }
    return loadJson("assets/elumia/marketplace-cache.json").then(function (cache) {
      applyVotePortfolio(
        mode === "test" ? "0xTestAdventurer" : address || "0xProfile",
        mode === "test" ? "Profile · Test adventurer" : "Profile · " + shortAddress(address),
        cache.heroes || [],
        cache.items || []
      );
    });
  }

  function defaultVotes() {
    return [
      {
        id: "vote-seed-floor",
        topic: "Should floor sweep bounties double next epoch?",
        image: "https://www.triumphgames.io/images/Card_Image_Elumia.png",
        options: [
          { id: "yes", label: "Yes" },
          { id: "no", label: "No" },
        ],
        tallies: { yes: 90, no: 30 },
        ballots: {},
        createdAt: Date.now() - 3600000,
      },
    ];
  }

  function loadVotes() {
    var stored = loadStored(VOTES_KEY);
    if (stored.length) return stored;
    var seed = defaultVotes();
    saveStored(VOTES_KEY, seed);
    return seed;
  }

  function saveVotes(votes) {
    saveStored(VOTES_KEY, votes);
  }

  function optionSlug(label, index) {
    return (
      String(label || "option")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "option-" + index
    );
  }

  function renderVoteList() {
    if (!els.voteList) return;
    var votes = loadVotes();
    els.voteList.innerHTML = "";
    if (!votes.length) {
      els.voteList.innerHTML =
        '<p class="mp-empty">No votes yet. Admin can create the first topic.</p>';
      return;
    }
    votes.forEach(function (vote) {
      var totalPts = 0;
      vote.options.forEach(function (opt) {
        totalPts += Number(vote.tallies[opt.id] || 0);
      });
      var myChoice = votePowerState.walletKey
        ? vote.ballots[votePowerState.walletKey]
        : "";
      var card = document.createElement("article");
      card.className = "mp-vote-card";
      var optionsHtml = vote.options
        .map(function (opt) {
          var pts = Number(vote.tallies[opt.id] || 0);
          var pct = totalPts ? Math.round((pts / totalPts) * 100) : 0;
          return (
            '<button type="button" class="mp-vote-option' +
            (myChoice === opt.id ? " is-mine" : "") +
            '" data-vote-id="' +
            vote.id +
            '" data-option-id="' +
            opt.id +
            '"><div class="mp-vote-option-head"><span>' +
            opt.label +
            '</span><span class="mp-vote-option-pts">' +
            pts +
            " pts · " +
            pct +
            '%</span></div><div class="mp-vote-bar"><span style="width:' +
            pct +
            '%"></span></div></button>'
          );
        })
        .join("");
      card.innerHTML =
        '<div class="mp-vote-card-image"><img src="' +
        (vote.image ||
          "https://elumia.triumphcdn.com/imx/mainnet/heroes/collectionLogo.png") +
        '" alt=""></div><div><h3>' +
        vote.topic +
        "</h3>" +
        optionsHtml +
        '<p class="mp-vote-card-meta">' +
        totalPts +
        " weighted points · " +
        Object.keys(vote.ballots || {}).length +
        " wallets voted" +
        (myChoice ? " · you voted " + myChoice : "") +
        "</p></div>";
      els.voteList.appendChild(card);
    });
    els.voteList.querySelectorAll(".mp-vote-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        castWeightedVote(btn.getAttribute("data-vote-id"), btn.getAttribute("data-option-id"));
      });
    });
  }

  function castWeightedVote(voteId, optionId) {
    if (!votePowerState.walletKey || !votePowerState.total) {
      showToast("Load a wallet to vote with NFT weight.");
      return;
    }
    var votes = loadVotes();
    var vote = votes.find(function (entry) {
      return entry.id === voteId;
    });
    if (!vote) return;
    var wallet = votePowerState.walletKey;
    var weight = votePowerState.total;
    var previous = vote.ballots[wallet];
    if (previous === optionId) {
      showToast("You already voted " + optionId + " with " + weight + " pts.");
      return;
    }
    if (previous) {
      vote.tallies[previous] = Math.max(0, Number(vote.tallies[previous] || 0) - weight);
    }
    vote.tallies[optionId] = Number(vote.tallies[optionId] || 0) + weight;
    vote.ballots[wallet] = optionId;
    saveVotes(votes);
    markQuest("vote");
    renderVoteList();
    showToast("Voted with " + weight + " points (" + votePowerState.genesis + " Genesis / " + votePowerState.epoch + " Epoch).");
  }

  function isAdminUnlocked() {
    return sessionStorage.getItem(ADMIN_KEY) === "1";
  }

  function syncAdminUi() {
    var unlocked = isAdminUnlocked();
    if (els.adminGate) els.adminGate.hidden = unlocked;
    if (els.adminCreate) els.adminCreate.hidden = !unlocked;
  }

  function initCommunitySection() {
    renderVotePower();
    renderVoteList();
    if (els.adminPanel) els.adminPanel.hidden = true;
    syncAdminUi();
    if (!votePowerState.walletKey) {
      var mode = sessionStorage.getItem(PROFILE_MODE_KEY);
      if (mode) loadVoteProfileWallet();
    }
  }

  function previewVoteImage(src) {
    voteImageData = src || "";
    if (!els.voteImagePreview) return;
    if (!src) {
      els.voteImagePreview.hidden = true;
      els.voteImagePreview.innerHTML = "";
      return;
    }
    els.voteImagePreview.hidden = false;
    els.voteImagePreview.innerHTML = '<img src="' + src + '" alt="Vote image preview">';
  }

  function handleAdminCreate(event) {
    event.preventDefault();
    if (!isAdminUnlocked()) return;
    var topic = els.voteTopic ? String(els.voteTopic.value || "").trim() : "";
    if (!topic) {
      showToast("Enter a vote topic.");
      return;
    }
    var inputs = els.voteOutcomes
      ? els.voteOutcomes.querySelectorAll(".mp-outcome-input")
      : [];
    var options = [];
    var tallies = {};
    for (var i = 0; i < inputs.length; i++) {
      var label = String(inputs[i].value || "").trim();
      if (!label) continue;
      var id = optionSlug(label, i);
      if (options.some(function (opt) { return opt.id === id; })) {
        id = id + "-" + i;
      }
      options.push({ id: id, label: label });
      tallies[id] = 0;
    }
    if (options.length < 2) {
      showToast("Add at least two outcomes (e.g. Yes and No).");
      return;
    }
    var image =
      voteImageData ||
      (els.voteImageUrl ? String(els.voteImageUrl.value || "").trim() : "");
    var vote = {
      id: "vote-" + Date.now(),
      topic: topic,
      image: image,
      options: options,
      tallies: tallies,
      ballots: {},
      createdAt: Date.now(),
    };
    var votes = loadVotes();
    votes.unshift(vote);
    saveVotes(votes);
    if (els.voteTopic) els.voteTopic.value = "";
    if (els.voteImageUrl) els.voteImageUrl.value = "";
    previewVoteImage("");
    renderVoteList();
    showToast("Vote published: " + topic);
  }

  function openListingModal(id) {
    var listing = findListing(id);
    if (!listing || !els.modal) return;
    markQuest("inspect");
    if (els.modalTitle) {
      els.modalTitle.textContent = listing.hero.name || "Hero bundle";
    }
    var bundleAssets = (listing.bundle || []).concat(listing.items || []);
    var bundleHtml = bundleAssets
      .map(function (asset) {
        var troveUrl =
          asset.contract_address &&
          String(asset.contract_address).toLowerCase() ===
            String(HERO_CONTRACT).toLowerCase()
            ? tokentroveHeroUrl(asset.token_id)
            : tokentroveItemUrl(asset.token_id);
        return (
          '<a class="mp-detail-bundle-item" href="' +
          troveUrl +
          '" target="_blank" rel="noopener">' +
          '<img src="' +
          assetImage(asset) +
          '" alt="" loading="lazy"><span>' +
          (asset.name || "Asset") +
          "</span></a>"
        );
      })
      .join("");
    els.modalBody.innerHTML =
      '<div class="mp-detail-hero"><img src="' +
      heroImage(listing.hero) +
      '" alt="" loading="lazy"></div>' +
      "<p><strong>Hero #" +
      listing.hero.token_id +
      "</strong> · " +
      (traitValue(listing.hero.attributes, "CLASS") || "Hero") +
      "</p>" +
      "<p>Seller: " +
      listing.seller +
      " · Listed " +
      timeAgo(listing.createdAt) +
      "</p>" +
      "<p>Bundle includes <strong>" +
      bundleAssets.length +
      " bound assets</strong>" +
      (listing.boundAt ? " · Bound " + timeAgo(listing.boundAt) : "") +
      ".</p>" +
      (listing.boundWallet
        ? "<p>Seller wallet: " + shortAddress(listing.boundWallet) + "</p>"
        : "") +
      '<div class="mp-detail-links">' +
      '<a class="btn btn-primary" href="' +
      tokentroveHeroUrl(listing.hero.token_id) +
      '" target="_blank" rel="noopener">View on TokenTrove</a>' +
      "</div>" +
      '<div class="mp-detail-bundle">' +
      bundleHtml +
      "</div>" +
      '<div class="mp-detail-foot">' +
      '<div class="mp-tile-price">' +
      formatListingPrice(listing) +
      ' <span class="mp-mock-tag">mock price</span></div>' +
      '<button type="button" class="btn btn-outline" id="mp-buy-btn">Simulate buy</button>' +
      "</div>";
    var buyBtn = document.getElementById("mp-buy-btn");
    if (buyBtn) {
      buyBtn.addEventListener("click", function (e) {
        if (window.MarketplaceFx) {
          window.MarketplaceFx.burst(e.clientX, e.clientY, 28);
          window.MarketplaceFx.ripple(buyBtn, e);
        }
        recordSale(listing);
        showToast(
          "Mock purchase recorded — " + formatListingPrice(listing) + " bundle acquired!"
        );
        closeModal();
        renderHome();
        renderActivity();
        renderTopSales();
      });
    }
    els.modal.hidden = false;
    els.modal.setAttribute("aria-hidden", "false");
    els.modal.classList.add("is-open");
  }

  function closeModal() {
    if (!els.modal) return;
    els.modal.classList.remove("is-open");
    els.modal.hidden = true;
    els.modal.setAttribute("aria-hidden", "true");
  }

  function recordSale(listing) {
    var sales = loadStored(SALES_KEY);
    sales.unshift({
      id: "sale-" + Date.now(),
      listingId: listing.id,
      price: listing.price,
      currency: "USD",
      soldAt: Date.now(),
      hero: listing.hero,
    });
    saveStored(SALES_KEY, sales.slice(0, 30));
    bumpJackpot(priceUsd(listing));
  }

  function updateTopbar(section, view) {
    var meta =
      section === "marketplace"
        ? viewMeta[view] || viewMeta.home
        : sectionMeta[section] || sectionMeta.marketplace;
    if (els.viewKicker) els.viewKicker.textContent = meta.kicker;
    if (els.viewTitle) els.viewTitle.textContent = meta.title;
  }

  function setSection(section) {
    activeSection = section;
    Object.keys(els.sections).forEach(function (key) {
      if (els.sections[key]) els.sections[key].hidden = key !== section;
    });
    els.sidebarItems.forEach(function (item) {
      item.classList.toggle("is-active", item.dataset.section === section);
    });
    updateTopbar(section, activeView);
    if (window.MarketplaceFx && els.sections[section]) {
      window.MarketplaceFx.onSectionChange(els.sections[section]);
    }
    if (section === "profile") initProfileSection();
    if (section === "community") initCommunitySection();
  }

  function setView(view) {
    activeView = view;
    Object.keys(els.views).forEach(function (key) {
      if (els.views[key]) els.views[key].hidden = key !== view;
    });
    els.subnavLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.dataset.view === view);
    });
    updateTopbar("marketplace", view);
    if (view === "home") renderHome();
    if (view === "collections") renderCollections();
    if (view === "activity") renderActivity();
    if (view === "mine") renderMine();
    if (window.MarketplaceFx && els.views[view]) {
      window.MarketplaceFx.onSectionChange(els.views[view]);
    }
  }

  function populateHeroSelect() {
    /* replaced by sell wizard */
  }

  function connectWalletDemo(e) {
    var sample = heroPool[0] || (listings[0] && listings[0].hero);
    var heroClass = sample
      ? String(traitValue(sample.attributes, "CLASS") || "").toLowerCase()
      : "champion";
    connectedWallet = {
      address: "0xMock…Preview",
      preferredClass: heroClass,
    };
    saveWallet(connectedWallet);
    updateWalletUi();
    updateProfileUi();
    renderPersonalized();
    if (window.MarketplaceFx && e) {
      window.MarketplaceFx.burst(e.clientX, e.clientY, 22);
    }
    if (els.connectWallet) els.connectWallet.classList.add("is-connected");
    showToast("Wallet connected — personalized rails unlocked!");
  }

  function updateWalletUi() {
    var label = connectedWallet ? shortAddress(connectedWallet.address) : "Connect wallet";
    if (els.connectWallet) els.connectWallet.textContent = label;
    if (els.personalLogin) {
      els.personalLogin.textContent = connectedWallet ? "Connected" : "Connect wallet";
      els.personalLogin.disabled = !!connectedWallet;
    }
    if (els.personalCopy) {
      els.personalCopy.textContent = connectedWallet
        ? "Bundle picks for your " +
          (connectedWallet.preferredClass || "hero") +
          " wallet."
        : "Connect your wallet to see personalized picks.";
    }
  }

  function updateProfileUi() {
    /* profile UI lives in elumia-inventory iframe */
  }

  function startBountyTimer() {
    function tick() {
      var now = new Date();
      var end = new Date(now);
      end.setHours(24, 0, 0, 0);
      if (end <= now) end.setDate(end.getDate() + 1);
      var diff = end - now;
      var clock = formatCountdown(diff);
      if (clock.length === 5) clock = "00:" + clock;
      if (els.bountyTimer) els.bountyTimer.textContent = clock;
      if (els.dailyReset) els.dailyReset.textContent = clock;
      if (els.rewardsReset) els.rewardsReset.textContent = clock;
      if (els.bountyTimer) {
        els.bountyTimer.classList.toggle("is-urgent", diff <= 5 * 60 * 1000);
      }
      if (els.dailyReset) {
        els.dailyReset.classList.toggle("is-urgent", diff <= 5 * 60 * 1000);
      }
      tickListingTimers();
    }
    tick();
    setInterval(tick, 1000);
  }

  var jackpotValue = loadMarketVolume();

  function startJackpot() {
    if (!els.jackpotValue) return;
    els.jackpotValue.textContent = formatVolumeAmount(jackpotValue);
  }

  function bumpJackpot(amount) {
    var delta = Number(amount) || 0;
    if (delta <= 0) return;
    jackpotValue += delta;
    saveMarketVolume();
    if (els.jackpotValue) {
      els.jackpotValue.classList.remove("is-hit");
      void els.jackpotValue.offsetWidth;
      els.jackpotValue.classList.add("is-hit");
      els.jackpotValue.textContent = formatVolumeAmount(jackpotValue);
    }
  }

  function handleListSubmit(event) {
    event.preventDefault();
    var price = els.listPrice ? Number(els.listPrice.value) : 0;
    var binding = sellState.binding;

    if (!binding || !binding.hero) {
      showToast("Bind a hero and inventory before listing.");
      setSellStep("hero");
      return;
    }
    if (!price || price <= 0) {
      showToast("Enter a valid bundle price.");
      return;
    }

    var boundItems = binding.boundItems || [];
    var listing = {
      id: "user-" + binding.heroTokenId + "-" + Date.now(),
      seller: sellState.walletLabel || shortAddress(sellState.walletKey) || "You",
      price: price,
      currency: "USD",
      createdAt: Date.now(),
      source: "user",
      hero: JSON.parse(JSON.stringify(binding.hero)),
      items: boundItems.map(function (item) {
        return JSON.parse(JSON.stringify(item));
      }),
      bundle: boundItems.map(function (item) {
        return JSON.parse(JSON.stringify(item));
      }),
      boundWallet: sellState.walletKey,
      boundAt: binding.boundAt,
      heroBound: true,
      score:
        Math.round(((boundItems.length + 1) / price) * 100) / 100,
    };

    var stored = loadStored(LISTINGS_KEY);
    stored.unshift(listing);
    saveStored(LISTINGS_KEY, stored);

    saveBindingForWallet(sellState.walletKey, null);
    sellState.binding = null;
    sellState.selectedHero = null;
    sellState.selectedItemKeys = {};
    if (window.MarketplaceFx) {
      window.MarketplaceFx.stopSellBindLock();
    }
    updateBoundBanner();

    showToast(
      "Bundle listed — " +
        (binding.hero.name || "Hero") +
        " + " +
        boundItems.length +
        " items for " +
        formatUsd(price) +
        "!"
    );
    if (els.listForm) els.listForm.reset();
    renderMine();
    renderHome();
    setSellStep("hero");
    renderSellHeroes();
    renderSellItems();
    renderSellBindPreview();
  }

  function bindEvents() {
    els.sidebarItems.forEach(function (item) {
      item.addEventListener("click", function () {
        setSection(item.dataset.section);
      });
    });
    els.subnavLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setSection("marketplace");
        setView(link.dataset.view);
      });
    });
    if (els.search) {
      els.search.addEventListener("input", function () {
        renderBrowseGrid(els.browseGrid, filteredListings(allListings()));
      });
    }
    if (els.classFilter) {
      els.classFilter.addEventListener("change", function () {
        renderBrowseGrid(els.browseGrid, filteredListings(allListings()));
      });
    }
    if (els.sortFilter) {
      els.sortFilter.addEventListener("change", function () {
        renderBrowseGrid(els.browseGrid, filteredListings(allListings()));
      });
    }
    if (els.listForm) els.listForm.addEventListener("submit", handleListSubmit);
    if (els.sellTestWallet) {
      els.sellTestWallet.addEventListener("click", function () {
        loadSellTestWallet().then(function () {
          showToast("Test wallet loaded — pick Ryan's hero and items.");
        });
      });
    }
    if (els.sellUseProfile) {
      els.sellUseProfile.addEventListener("click", function () {
        loadSellProfileWallet();
      });
    }
    if (els.sellNextItems) {
      els.sellNextItems.addEventListener("click", function () {
        if (!sellState.selectedHero) {
          showToast("Select one hero first.");
          return;
        }
        setSellStep("items");
      });
    }
    if (els.sellBackHero) {
      els.sellBackHero.addEventListener("click", function () {
        setSellStep("hero");
      });
    }
    if (els.sellBackItems) {
      els.sellBackItems.addEventListener("click", function () {
        setSellStep("items");
      });
    }
    if (els.sellBindBtn) {
      els.sellBindBtn.addEventListener("click", function (e) {
        bindHeroInventory();
        if (window.MarketplaceFx) window.MarketplaceFx.ripple(els.sellBindBtn, e);
      });
    }
    if (els.sellUnbind) {
      els.sellUnbind.addEventListener("click", unbindHeroInventory);
    }
    if (els.sellSelectAll) {
      els.sellSelectAll.addEventListener("click", function () {
        selectAllSellItems(true);
      });
    }
    if (els.sellClearItems) {
      els.sellClearItems.addEventListener("click", function () {
        selectAllSellItems(false);
      });
    }
    if (els.profileSell) {
      els.profileSell.addEventListener("click", openSellFromProfile);
    }
    if (els.flashDealBtn) {
      els.flashDealBtn.addEventListener("click", function () {
        if (flashDealListing) openListingModal(flashDealListing.id);
      });
    }
    var sweepBtn = document.getElementById("mp-sweep-btn");
    if (sweepBtn) {
      sweepBtn.addEventListener("click", function () {
        markQuest("sweep");
        showToast("Floor swept — claim the bounty in Rewards.");
      });
    }
    document.querySelectorAll(".mp-vote-btn").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.stopPropagation();
        markQuest("vote");
        btn.textContent = "Voted";
        btn.disabled = true;
        showToast("Guild vote locked in — claim bounty in Rewards.");
      });
    });
    if (els.voteLoadTest) {
      els.voteLoadTest.addEventListener("click", function () {
        loadVoteTestWallet();
      });
    }
    if (els.voteLoadProfile) {
      els.voteLoadProfile.addEventListener("click", function () {
        loadVoteProfileWallet();
      });
    }
    if (els.adminToggle) {
      els.adminToggle.addEventListener("click", function () {
        if (!els.adminPanel) return;
        els.adminPanel.hidden = !els.adminPanel.hidden;
        syncAdminUi();
      });
    }
    if (els.adminGateForm) {
      els.adminGateForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = els.adminPassword ? String(els.adminPassword.value || "").trim() : "";
        if (value === ADMIN_PASSWORD) {
          sessionStorage.setItem(ADMIN_KEY, "1");
          if (els.adminGateError) els.adminGateError.textContent = "";
          syncAdminUi();
          showToast("Admin unlocked — create a vote.");
        } else if (els.adminGateError) {
          els.adminGateError.textContent = "Incorrect password.";
        }
      });
    }
    if (els.adminCreate) {
      els.adminCreate.addEventListener("submit", handleAdminCreate);
    }
    if (els.adminLock) {
      els.adminLock.addEventListener("click", function () {
        sessionStorage.removeItem(ADMIN_KEY);
        syncAdminUi();
        showToast("Admin locked.");
      });
    }
    if (els.voteAddOutcome) {
      els.voteAddOutcome.addEventListener("click", function () {
        if (!els.voteOutcomes) return;
        var input = document.createElement("input");
        input.className = "mp-input mp-outcome-input";
        input.type = "text";
        input.placeholder = "Outcome";
        els.voteOutcomes.appendChild(input);
        input.focus();
      });
    }
    if (els.voteImageUrl) {
      els.voteImageUrl.addEventListener("input", function () {
        previewVoteImage(String(els.voteImageUrl.value || "").trim());
      });
    }
    if (els.voteImageFile) {
      els.voteImageFile.addEventListener("change", function () {
        var file = els.voteImageFile.files && els.voteImageFile.files[0];
        if (!file) return;
        if (file.size > 700000) {
          showToast("Image is too large — use a smaller file or paste a URL.");
          return;
        }
        var reader = new FileReader();
        reader.onload = function () {
          previewVoteImage(String(reader.result || ""));
        };
        reader.readAsDataURL(file);
      });
    }
    document.querySelectorAll(".mp-reward-card[data-quest]").forEach(function (card) {
      card.addEventListener("click", function (e) {
        var id = card.getAttribute("data-quest");
        var q = loadQuestState();
        if (questClaimed(id, q)) {
          showToast("Already claimed today.");
          return;
        }
        if (id === "login") {
          if (!q.login) markQuest("login");
          var streak = Number(localStorage.getItem(STREAK_KEY) || 0) + 1;
          localStorage.setItem(STREAK_KEY, String(streak));
          if (els.rewardsStreak) els.rewardsStreak.textContent = streak + " days";
        } else if (id === "sweep") {
          if (!q.sweep) {
            setSection("marketplace");
            setView("home");
            showToast("Sweep the floor on Home first.");
            return;
          }
        } else if (id === "vote") {
          if (!q.vote) {
            setSection("community");
            showToast("Cast a guild vote first.");
            return;
          }
        } else if (id === "inspect") {
          if ((q.inspect || 0) < 3) {
            setSection("marketplace");
            setView("collections");
            showToast("Open 3 listings to finish this quest.");
            return;
          }
        }
        if (!claimQuestBounty(id)) {
          showToast("Could not claim bounty.");
          return;
        }
        showToast("+" + (QUEST_REWARDS[id] || 0) + " bounty added.");
        card.classList.add("is-claimed");
        if (window.MarketplaceFx) {
          window.MarketplaceFx.ripple(card, e);
        }
      });
    });
    if (els.manaSpin) {
      els.manaSpin.addEventListener("click", spinManaWheel);
    }
    if (els.connectWallet) {
      els.connectWallet.addEventListener("click", connectWalletDemo);
    }
    if (els.personalLogin) {
      els.personalLogin.addEventListener("click", connectWalletDemo);
    }
    if (els.profileConnectGate) {
      els.profileConnectGate.addEventListener("click", openProfileConnectModal);
    }
    if (els.profileTest) {
      els.profileTest.addEventListener("click", unlockProfileTest);
    }
    if (els.profileBack) {
      els.profileBack.addEventListener("click", function () {
        sessionStorage.removeItem(PROFILE_MODE_KEY);
        showProfileGate();
      });
    }
    if (els.profileLoadAddress) {
      els.profileLoadAddress.addEventListener("click", function () {
        var address = els.profileAddress ? els.profileAddress.value : "";
        if (!isValidAddress(address)) {
          setProfileModalStatus("Enter a valid 0x wallet address.");
          return;
        }
        unlockProfileAddress(String(address).trim());
      });
    }
    if (els.profileMetamask) {
      els.profileMetamask.addEventListener("click", function () {
        if (!window.ethereum) {
          setProfileModalStatus("Install MetaMask to connect.");
          return;
        }
        setProfileModalStatus("Connecting…");
        window.ethereum
          .request({ method: "eth_requestAccounts" })
          .then(function (accounts) {
            if (!accounts || !accounts[0]) {
              throw new Error("No account returned.");
            }
            unlockProfileAddress(accounts[0]);
          })
          .catch(function (err) {
            setProfileModalStatus(err.message || "Connect failed.");
          });
      });
    }
    if (els.profileConnectModal) {
      els.profileConnectModal
        .querySelectorAll("[data-close-profile-modal]")
        .forEach(function (node) {
          node.addEventListener("click", closeProfileConnectModal);
        });
    }
    if (els.modal) {
      els.modal.querySelectorAll("[data-close-modal]").forEach(function (node) {
        node.addEventListener("click", closeModal);
      });
    }
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeModal();
    });
  }

  function bootstrapMock(data) {
    mockData = data;
    listings = (data.listings || []).map(function (listing) {
      listing.score =
        listing.score ||
        Math.round(
          ((listing.bundle ? listing.bundle.length : 1) / listing.price) * 100
        ) / 100;
      return listing;
    });
    mockSales = data.sales || [];
    heroPool = listings.map(function (l) {
      return l.hero;
    });
    populateHeroSelect();
    populateProfilePreview();
    renderQuestBoard();
    buildManaWheel();
    renderBountyBalance();
    if (els.rewardsStreak) {
      els.rewardsStreak.textContent =
        Number(localStorage.getItem(STREAK_KEY) || 0) + " days";
    }
    setLoading(false);
    setError("");
    setSection("marketplace");
    setView("home");
    if (window.MarketplaceFx) {
      window.MarketplaceFx.init();
    }
  }

  function init() {
    cacheElements();
    buildManaWheel();
    renderBountyBalance();
    bindEvents();
    connectedWallet = loadWallet();
    updateWalletUi();
    updateProfileUi();
    startBountyTimer();
    startJackpot();
    setLoading(true);

    loadJson("assets/elumia/marketplace-mock.json")
      .then(function (data) {
        if (!data.listings || !data.listings.length) {
          throw new Error("Mock catalog is empty.");
        }
        bootstrapMock(data);
      })
      .catch(function (err) {
        setLoading(false);
        setError(err.message || "Failed to load mock marketplace.");
      });
  }

  init();
})();
