(function () {
  var IMX_CHAIN = {
    chainId: "0x3437",
    chainName: "Immutable zkEVM",
    nativeCurrency: { name: "Immutable X", symbol: "IMX", decimals: 18 },
    rpcUrls: ["https://rpc.immutable.com"],
    blockExplorerUrls: ["https://explorer.immutable.com"],
  };

  var config = null;
  var connectedAddress = null;
  var ownedHeroes = [];
  var ownedItems = [];
  var selectedHero = null;
  var activeProvider = null;
  var walletSource = null;
  var providerListenersBound = false;

  var els = {
    previewContext: document.getElementById("elumia-preview-context"),
    heroPicker: document.getElementById("elumia-hero-picker"),
    previewImage: document.getElementById("elumia-preview-image"),
    previewName: document.getElementById("elumia-preview-name"),
    previewDesc: document.getElementById("elumia-preview-desc"),
    inventory: document.getElementById("elumia-inventory"),
    inventoryNote: document.getElementById("elumia-inventory-note"),
    inventoryRefresh: document.getElementById("elumia-inventory-refresh"),
    walletAddress: document.getElementById("elumia-wallet-address"),
    walletType: document.getElementById("elumia-wallet-type"),
    heroCount: document.getElementById("elumia-hero-count"),
    itemCount: document.getElementById("elumia-item-count"),
    contractRows: document.getElementById("elumia-contract-rows"),
    connectBtn: document.getElementById("elumia-connect"),
    connectPanelBtn: document.getElementById("elumia-connect-panel"),
    connectModal: document.getElementById("elumia-connect-modal"),
    connectModalStatus: document.getElementById("elumia-connect-modal-status"),
    connectPassportBtn: document.getElementById("elumia-connect-passport"),
    connectMetamaskBtn: document.getElementById("elumia-connect-metamask"),
    passportAddressInput: document.getElementById("elumia-passport-address"),
    loadAddressBtn: document.getElementById("elumia-load-address"),
    switchBtn: document.getElementById("elumia-switch-network"),
    explorerHeroLink: document.getElementById("elumia-open-explorer-hero"),
    tokentroveHeroLink: document.getElementById("elumia-open-tokentrove-hero"),
    profileStats: document.getElementById("elumia-profile-stats"),
    itemCountBadge: document.getElementById("elumia-item-count-badge"),
    walletAddressBar: document.getElementById("elumia-wallet-address-bar"),
    heroCountBar: document.getElementById("elumia-hero-count-bar"),
    itemCountBar: document.getElementById("elumia-item-count-bar"),
    connectPanelEmbed: null,
    equipLeft: document.getElementById("elumia-equip-left"),
    equipRight: document.getElementById("elumia-equip-right"),
    modeEquip: document.getElementById("elumia-mode-equip"),
    modeTraits: document.getElementById("elumia-mode-traits"),
    bundleHeroBtn: document.getElementById("elumia-bundle-hero-btn"),
    bagView: document.getElementById("elumia-bag-view"),
    bundleModal: document.getElementById("elumia-bundle-modal"),
    bundleHeroes: document.getElementById("elumia-bundle-heroes"),
    bundleItems: document.getElementById("elumia-bundle-items"),
    bundleCount: document.getElementById("elumia-bundle-count"),
    bundleCopy: document.getElementById("elumia-bundle-copy"),
    bundleSelectAll: document.getElementById("elumia-bundle-select-all"),
    bundleClear: document.getElementById("elumia-bundle-clear"),
    bundleCancel: document.getElementById("elumia-bundle-cancel"),
    bundleSeal: document.getElementById("elumia-bundle-seal"),
    bundleUnseal: document.getElementById("elumia-bundle-unseal"),
    bundleStatus: document.getElementById("elumia-bundle-status"),
    sealedOverlay: document.getElementById("elumia-sealed-overlay"),
    heroImageWrap: document.querySelector(".elumia-inv-image-wrap--profile"),
    heroSkills: null,
    heroBarGrid: document.getElementById("elumia-hero-bar-grid"),
  };

  var BUNDLE_STORAGE_KEY = "elumia-profile-bundles";
  var bundleModalHero = null;
  var bundleSelectedKeys = {};
  var activeBundle = null;

  var EQUIP_LEFT = [
    { id: "helmet", label: "Helm", keys: ["helmet", "helm", "hat"] },
    { id: "chest", label: "Armor", keys: ["chest", "armor", "armour"] },
    { id: "ring1", label: "Ring 1", keys: ["ring"] },
    { id: "ring2", label: "Ring 2", keys: ["ring"] },
    { id: "ring3", label: "Ring 3", keys: ["ring"] },
  ];
  var EQUIP_RIGHT = [
    { id: "amulet", label: "Amulet", keys: ["amulet", "necklace"] },
    { id: "weapon", label: "Weapon", keys: ["weapon", "sword", "spear", "staff", "bow", "axe", "dagger", "mace", "wand"] },
    { id: "offhand", label: "Offhand", keys: ["offhand", "off-hand", "shield", "quiver"] },
    { id: "ring4", label: "Ring 4", keys: ["ring"] },
    { id: "companion", label: "Pet", keys: ["companion", "pet"] },
  ];
  var RING_SLOT_IDS = ["ring1", "ring2", "ring3", "ring4"];
  var SLOT_ID_MAP = {
    helmet: "helmet",
    helm: "helmet",
    hat: "helmet",
    chest: "chest",
    armor: "chest",
    armour: "chest",
    ring: "ring",
    ring1: "ring",
    ring2: "ring",
    ring3: "ring",
    ring4: "ring",
    weapon: "weapon",
    sword: "weapon",
    spear: "weapon",
    bow: "weapon",
    staff: "weapon",
    axe: "weapon",
    dagger: "weapon",
    mace: "weapon",
    wand: "weapon",
    offhand: "offhand",
    shield: "offhand",
    quiver: "offhand",
    amulet: "amulet",
    necklace: "amulet",
    companion: "companion",
    pet: "companion",
  };
  var EQUIP_SLOTS = EQUIP_LEFT.concat(EQUIP_RIGHT);
  var TRAIT_LEFT = [
    { key: "CLASS", label: "Class" },
    { key: "FATE", label: "Fate" },
    { key: "RACE", label: "Race" },
    { key: "GENERATION", label: "Generation" },
  ];
  var TRAIT_RIGHT = [
    { key: "AFFINITY", label: "Affinity" },
    { key: "OUTFIT", label: "Outfit" },
    { key: "GENDER", label: "Gender" },
  ];
  var HERO_SKILLS = [
    { key: "SKILL 1", label: "Skill 1" },
    { key: "SKILL 2", label: "Skill 2" },
    { key: "SKILL 3", label: "Skill 3" },
  ];
  var HERO_BAR_ENTRIES = HERO_SKILLS.map(function (skill) {
    return { type: "skill", key: skill.key, label: skill.label };
  }).concat(
    TRAIT_LEFT.concat(TRAIT_RIGHT).map(function (trait) {
      return { type: "trait", key: trait.key, label: trait.label };
    })
  );
  var ITEM_ICON_DIR = "/assets/elumia/item-icons/";
  var EQUIP_SLOT_ICONS = {
    helmet: ITEM_ICON_DIR + "10506_warrior_cemetery_helmet001_common_icon.png",
    chest: ITEM_ICON_DIR + "66371_b_invictus_armor_icon.png",
    ring: ITEM_ICON_DIR + "10536_cemetery_ring001_common_icon.png",
    amulet: ITEM_ICON_DIR + "10531_cemetery_necklace001_common_icon.png",
    weapon: ITEM_ICON_DIR + "10401_warrior_cemetery_sword_common001_icon.png",
    offhand: ITEM_ICON_DIR + "10416_warrior_cemetery_shield_common001_icon.png",
    companion: ITEM_ICON_DIR + "icon_companion_chaochao_brown.png",
  };
  var DEMO_EQUIP_BY_SLOT = {
    helmet: { name: "Helm", demoIcon: EQUIP_SLOT_ICONS.helmet, attributes: [{ trait_type: "QUALITY", value: "Rare" }] },
    chest: { name: "Armor", demoIcon: EQUIP_SLOT_ICONS.chest, attributes: [{ trait_type: "QUALITY", value: "Rare" }] },
    ring: { name: "Ring", demoIcon: EQUIP_SLOT_ICONS.ring, attributes: [{ trait_type: "QUALITY", value: "Rare" }] },
    amulet: { name: "Amulet", demoIcon: EQUIP_SLOT_ICONS.amulet, attributes: [{ trait_type: "QUALITY", value: "Rare" }] },
    weapon: { name: "Weapon", demoIcon: EQUIP_SLOT_ICONS.weapon, attributes: [{ trait_type: "QUALITY", value: "Rare" }] },
    offhand: { name: "Offhand", demoIcon: EQUIP_SLOT_ICONS.offhand, attributes: [{ trait_type: "QUALITY", value: "Rare" }] },
    companion: { name: "Pet", demoIcon: EQUIP_SLOT_ICONS.companion, attributes: [{ trait_type: "QUALITY", value: "Rare" }] },
  };
  var itemIconIndex = null;

  function isTestPortfolio() {
    return new URLSearchParams(window.location.search).get("test") === "1";
  }

  function mergeDemoPaperdoll(equipped) {
    if (!isTestPortfolio()) return equipped || {};
    var out = Object.assign({}, equipped || {});
    EQUIP_SLOTS.forEach(function (def) {
      if (!out[def.id]) {
        var demo = DEMO_EQUIP_BY_SLOT[equipSlotIconKey(def.id)];
        if (demo) out[def.id] = demo;
      }
    });
    return out;
  }

  var SKILL_ICON_DIR = "assets/elumia/skill-icons/";
  var SKILL_ICON_FILES = [
    "rune_skill_archer_agi_astralfalconery_icon.png",
    "rune_skill_archer_agi_lunartrap_icon.png",
    "rune_skill_archer_agi_moonhowler_icon.png",
    "rune_skill_archer_intel_leechershot_icon.png",
    "rune_skill_archer_intel_noxiousarchery_icon.png",
    "rune_skill_archer_intel_torrentrush_icon.png",
    "rune_skill_archer_strenght_aeolianscreem_icon.png",
    "rune_skill_archer_strenght_hailstone_icon.png",
    "rune_skill_archer_strenght_squall_icon.png",
    "rune_skill_champ_agi_breathbreak_icon.png",
    "rune_skill_champ_agi_galeforce_icon.png",
    "rune_skill_champ_agi_kaionfury_icon.png",
    "rune_skill_champ_intel_deepdraugh_icon.png",
    "rune_skill_champ_intel_eluknindling_icon.png",
    "rune_skill_champ_intel_flurry_icon.png",
    "rune_skill_champ_strenght_collisioncourse_icon.png",
    "rune_skill_champ_strenght_gore_icon.png",
    "rune_skill_champ_strenght_shieldshock_icon.png",
    "rune_skill_mage_agi_dilation_icon.png",
    "rune_skill_mage_agi_timehoop_icon.png",
    "rune_skill_mage_agi_unforgivinearth_icon.png",
    "rune_skill_mage_intel_memoriumgift_icon.png",
    "rune_skill_mage_intel_moonphase_icon.png",
    "rune_skill_mage_intel_tandaiarepreieve_icon.png",
    "rune_skill_mage_strenght_astralimpact_icon.png",
    "rune_skill_mage_strenght_solarsear_icon.png",
    "rune_skill_mage_strenght_starshower_icon.png",
  ];
  var SKILL_NAME_ALIASES = {
    timehop: "timehoop",
    timehoop: "timehoop",
    eluskindling: "eluknindling",
    elukindling: "eluknindling",
    memoriumsgift: "memoriumgift",
    memoriumgift: "memoriumgift",
    tandaiasreprieve: "tandaiarepreieve",
    tandaiasreprieve: "tandaiarepreieve",
    aeolianscream: "aeolianscreem",
    starshower: "starshower",
    unforgivingearth: "unforgivinearth",
  };
  var BAG_MIN_SLOTS = 12;
  var BAG_MAX_ITEMS = 2000;
  var TEST_ITEM_MIN = 240;
  var TEST_ITEM_MAX = 1500;
  var TEST_ITEM_TARGET = 800;
  var slotView = "equipment";
  var lastLoadout = { equipped: {}, bag: [] };

  function qualityRank(quality) {
    var q = String(quality || "").toLowerCase();
    if (q.indexOf("legend") >= 0) return 5;
    if (q.indexOf("epic") >= 0) return 4;
    if (q.indexOf("rare") >= 0) return 3;
    if (q.indexOf("uncommon") >= 0) return 2;
    if (q.indexOf("common") >= 0) return 1;
    return 0;
  }

  function qualityClass(quality) {
    var q = String(quality || "").toLowerCase();
    if (q.indexOf("legend") >= 0) return "legendary";
    if (q.indexOf("epic") >= 0) return "epic";
    if (q.indexOf("rare") >= 0) return "rare";
    if (q.indexOf("uncommon") >= 0) return "uncommon";
    return "common";
  }

  function itemScore(item) {
    var quality = traitValue(item.attributes, "QUALITY") || traitValue(item.attributes, "quality");
    var level = Number(traitValue(item.attributes, "LEVEL") || traitValue(item.attributes, "level") || 0);
    return qualityRank(quality) * 100 + level;
  }

  function syncProfileBars() {
    if (els.walletAddressBar) {
      els.walletAddressBar.textContent = connectedAddress
        ? shortAddress(connectedAddress)
        : "—";
    }
    if (els.heroCountBar) {
      els.heroCountBar.textContent = String(ownedHeroes.length || "—");
    }
    if (els.itemCountBar) {
      els.itemCountBar.textContent = String(ownedItems.length || "—");
    }
    updateBundleUi();
  }

  function normalizeSkillKey(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/['’`]/g, "")
      .replace(/[^a-z0-9]+/g, "");
  }

  function equipSlotIconKey(slotId) {
    if (!slotId) return "";
    if (String(slotId).indexOf("ring") === 0) return "ring";
    return slotId;
  }

  function equipSlotPlaceholderUrl(slotId) {
    return EQUIP_SLOT_ICONS[equipSlotIconKey(slotId)] || "";
  }

  function getItemIconIndex() {
    if (itemIconIndex) return itemIconIndex;
    itemIconIndex = { byId: {}, byPrefix: {} };
    var list = window.ElumiaItemIcons || [];
    list.forEach(function (icon) {
      if (!icon || !icon.id) return;
      itemIconIndex.byId[icon.id] = icon.url || ITEM_ICON_DIR + icon.id + ".png";
      var prefix = String(icon.id).split("_")[0];
      if (prefix && !itemIconIndex.byPrefix[prefix]) {
        itemIconIndex.byPrefix[prefix] = itemIconIndex.byId[icon.id];
      }
    });
    return itemIconIndex;
  }

  function itemImagePrefix(imageUrl) {
    var match = String(imageUrl || "").match(/\/items\/(\d+)_/i);
    return match ? match[1] : "";
  }

  function itemIconUrl(item) {
    if (!item) return "";
    if (item.demoIcon) return item.demoIcon;
    var idx = getItemIconIndex();
    var assetId = traitValue(item.attributes, "GAME_ASSET_ID");
    if (assetId) {
      if (idx.byId[assetId]) return idx.byId[assetId];
      var assetKey = String(assetId);
      var icons = window.ElumiaItemIcons || [];
      for (var i = 0; i < icons.length; i += 1) {
        if (String(icons[i].id || "").indexOf(assetKey) >= 0) {
          return icons[i].url || ITEM_ICON_DIR + icons[i].id + ".png";
        }
      }
    }
    var prefix = itemImagePrefix(item.image);
    if (prefix) {
      var list = window.ElumiaItemIcons || [];
      for (var j = 0; j < list.length; j += 1) {
        var id = String(list[j].id || "");
        if (id === prefix || id.indexOf(prefix + "_") === 0) {
          return list[j].url || ITEM_ICON_DIR + list[j].id + ".png";
        }
      }
      if (idx.byPrefix[prefix]) return idx.byPrefix[prefix];
    }
    var slotId = itemSlotCategory(item);
    return equipSlotPlaceholderUrl(slotId);
  }

  function itemDisplayImage(item, slotId) {
    return (
      itemIconUrl(item) ||
      item.image ||
      equipSlotPlaceholderUrl(slotId || itemSlotCategory(item)) ||
      "https://elumia.triumphcdn.com/imx/mainnet/items/collectionLogo.png"
    );
  }

  function skillIconSlug(filename) {
    return String(filename || "")
      .replace(/^rune_skill_[a-z]+_[a-z]+_/, "")
      .replace(/_icon\.png$/i, "")
      .replace(/_/g, "");
  }

  function skillIconForName(name) {
    var key = normalizeSkillKey(name);
    if (!key) return "";
    if (SKILL_NAME_ALIASES[key]) key = SKILL_NAME_ALIASES[key];
    for (var i = 0; i < SKILL_ICON_FILES.length; i += 1) {
      var file = SKILL_ICON_FILES[i];
      if (skillIconSlug(file) === key) return SKILL_ICON_DIR + file;
    }
    for (var j = 0; j < SKILL_ICON_FILES.length; j += 1) {
      var slug = skillIconSlug(SKILL_ICON_FILES[j]);
      if (key.indexOf(slug) >= 0 || slug.indexOf(key) >= 0) {
        return SKILL_ICON_DIR + SKILL_ICON_FILES[j];
      }
    }
    return "";
  }

  function traitAbbrev(label) {
    var parts = String(label || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  function heroBarTraitValue(entry) {
    if (!selectedHero) return "";
    return (
      traitValue(selectedHero.attributes, entry.key) ||
      traitValue(selectedHero.attributes, entry.label) ||
      ""
    );
  }

  function renderHeroBar() {
    if (!els.heroBarGrid) return;
    els.heroBarGrid.innerHTML = "";
    HERO_BAR_ENTRIES.forEach(function (entry) {
      var value =
        entry.type === "skill"
          ? selectedHero
            ? traitValue(selectedHero.attributes, entry.key)
            : ""
          : heroBarTraitValue(entry);
      var chip = document.createElement("div");
      chip.className =
        "elumia-inv-bar-chip elumia-inv-bar-chip--" +
        entry.type +
        (value ? "" : " is-empty");
      if (entry.type === "trait") {
        chip.classList.add("elumia-inv-bar-chip--" + traitTone(entry.key, value));
      }
      chip.title = entry.label + (value ? ": " + value : "");

      var icon = document.createElement("span");
      icon.className = "elumia-inv-bar-chip-icon";
      icon.setAttribute("aria-hidden", "true");

      if (entry.type === "skill") {
        icon.classList.add("is-skill");
        if (!value) icon.classList.add("is-empty");
        var skillIcon = value ? skillIconForName(value) : "";
        if (skillIcon) {
          var img = document.createElement("img");
          img.src = skillIcon;
          img.alt = "";
          icon.appendChild(img);
        }
      } else {
        icon.classList.add("is-trait");
        icon.textContent = traitAbbrev(entry.label);
      }

      var text = document.createElement("span");
      text.className = "elumia-inv-bar-chip-text";

      if (entry.type === "trait") {
        var traitLabel = document.createElement("span");
        traitLabel.className = "elumia-inv-bar-chip-label";
        traitLabel.textContent = entry.label;
        text.appendChild(traitLabel);
      }

      var traitValueNode = document.createElement("span");
      traitValueNode.className = "elumia-inv-bar-chip-value";
      traitValueNode.textContent = value || "—";
      text.appendChild(traitValueNode);

      chip.appendChild(icon);
      chip.appendChild(text);
      els.heroBarGrid.appendChild(chip);
    });
  }

  function updateProfileSkills() {
    renderHeroBar();
  }

  function walletStorageKey() {
    return String(connectedAddress || "guest").toLowerCase();
  }

  function itemStorageKey(item) {
    return (
      String(item.contract_address || "item").toLowerCase() +
      ":" +
      String(item.token_id)
    );
  }

  function loadBundleMap() {
    try {
      return JSON.parse(sessionStorage.getItem(BUNDLE_STORAGE_KEY) || "{}");
    } catch (err) {
      return {};
    }
  }

  function saveBundleMap(map) {
    sessionStorage.setItem(BUNDLE_STORAGE_KEY, JSON.stringify(map || {}));
  }

  function bundleRecordKey(heroTokenId) {
    return walletStorageKey() + ":" + String(heroTokenId);
  }

  function getBundleForHero(hero) {
    if (!hero) return null;
    var map = loadBundleMap();
    return map[bundleRecordKey(hero.token_id)] || null;
  }

  function loadActiveBundle() {
    activeBundle = selectedHero ? getBundleForHero(selectedHero) : null;
    return activeBundle;
  }

  function saveBundleForHero(hero, binding) {
    if (!hero) return;
    var map = loadBundleMap();
    var key = bundleRecordKey(hero.token_id);
    if (!binding) delete map[key];
    else map[key] = binding;
    saveBundleMap(map);
    if (selectedHero && String(selectedHero.token_id) === String(hero.token_id)) {
      activeBundle = binding || null;
    }
  }

  function isHeroSealedFor(hero) {
    var binding = getBundleForHero(hero);
    return !!(binding && binding.sealed);
  }

  function isHeroSealed() {
    return isHeroSealedFor(selectedHero);
  }

  function getAllBundleItems() {
    return ownedItems.slice();
  }

  function bundledItemKeysFor(binding) {
    var keys = {};
    if (!binding || !binding.boundItems) return keys;
    binding.boundItems.forEach(function (item) {
      keys[itemStorageKey(item)] = true;
    });
    return keys;
  }

  function bundledItemKeys() {
    return bundledItemKeysFor(activeBundle);
  }

  function updateSealedOverlay() {
    var sealed = isHeroSealed();
    if (els.sealedOverlay) {
      els.sealedOverlay.hidden = !sealed;
      els.sealedOverlay.setAttribute("aria-hidden", sealed ? "false" : "true");
    }
    if (els.heroImageWrap) {
      els.heroImageWrap.classList.toggle("is-sealed", sealed);
    }
  }

  function updateBundleUi() {
    var hasHeroes = ownedHeroes.length > 0;
    var hasItems = ownedItems.length > 0;
    var sealed = isHeroSealed();

    if (els.bundleHeroBtn) {
      els.bundleHeroBtn.disabled = !hasHeroes || !hasItems;
      els.bundleHeroBtn.textContent = sealed ? "Sealed" : "Bundle hero";
      els.bundleHeroBtn.classList.toggle("is-sealed", sealed);
    }

    updateSealedOverlay();
    markBundledSlots();
  }

  function markBundledSlots() {
    var keys = isHeroSealed() ? bundledItemKeys() : {};
    document.querySelectorAll(".elumia-inv-bag-slot, .elumia-inv-equip-slot").forEach(function (node) {
      var itemKey = node.dataset.itemKey || "";
      node.classList.toggle("is-bundled", !!keys[itemKey]);
    });
  }

  function openBundleModal() {
    if (!ownedHeroes.length || !ownedItems.length) return;
    bundleModalHero = selectedHero || ownedHeroes[0];
    syncBundleSelectionForHero(bundleModalHero);
    renderBundleModal();
    if (!els.bundleModal) return;
    els.bundleModal.hidden = false;
    els.bundleModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("elumia-bundle-modal-open");
  }

  function closeBundleModal() {
    if (!els.bundleModal) return;
    els.bundleModal.hidden = true;
    els.bundleModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("elumia-bundle-modal-open");
    if (els.bundleStatus) els.bundleStatus.textContent = "";
  }

  function syncBundleSelectionForHero(hero) {
    bundleSelectedKeys = {};
    var binding = getBundleForHero(hero);
    if (isHeroSealedFor(hero) && binding && binding.boundItems) {
      binding.boundItems.forEach(function (item) {
        bundleSelectedKeys[itemStorageKey(item)] = true;
      });
      return;
    }
    getAllBundleItems().forEach(function (item) {
      bundleSelectedKeys[itemStorageKey(item)] = true;
    });
  }

  function selectBundleModalHero(hero) {
    if (!hero) return;
    bundleModalHero = hero;
    syncBundleSelectionForHero(hero);
    renderBundleModal();
  }

  function updateBundleSelectionUi() {
    var count = Object.keys(bundleSelectedKeys).filter(function (key) {
      return bundleSelectedKeys[key];
    }).length;
    if (els.bundleCount) {
      els.bundleCount.textContent = count + " selected";
    }
    var sealed = isHeroSealedFor(bundleModalHero);
    if (els.bundleSeal) {
      els.bundleSeal.disabled = !bundleModalHero || count === 0 || sealed;
    }
  }

  function renderBundleHeroes() {
    if (!els.bundleHeroes) return;
    els.bundleHeroes.innerHTML = "";
    if (!ownedHeroes.length) {
      els.bundleHeroes.innerHTML = '<p class="elumia-inv-empty">No heroes in this wallet.</p>';
      return;
    }
    ownedHeroes.forEach(function (hero) {
      var card = document.createElement("button");
      card.type = "button";
      var isActive =
        bundleModalHero &&
        String(bundleModalHero.token_id) === String(hero.token_id);
      var heroSealed = isHeroSealedFor(hero);
      card.className =
        "elumia-bundle-hero-card" +
        (isActive ? " is-active" : "") +
        (heroSealed ? " is-sealed" : "");
      card.innerHTML =
        '<img src="' +
        (hero.image || "https://elumia.triumphcdn.com/imx/mainnet/heroes/collectionLogo.png") +
        '" alt="">' +
        "<strong>" +
        (hero.name || "Hero #" + hero.token_id) +
        "</strong>" +
        "<span>#" +
        hero.token_id +
        (heroSealed ? " · Sealed" : "") +
        "</span>";
      card.addEventListener("click", function () {
        selectBundleModalHero(hero);
      });
      els.bundleHeroes.appendChild(card);
    });
  }

  function renderBundleItems() {
    if (!els.bundleItems) return;
    var sealed = isHeroSealedFor(bundleModalHero);
    var items = getAllBundleItems();
    var lockedKeys = sealed ? bundledItemKeysFor(getBundleForHero(bundleModalHero)) : null;

    els.bundleItems.innerHTML = "";
    if (!items.length) {
      els.bundleItems.innerHTML =
        '<p class="elumia-inv-empty">No items available to bundle.</p>';
      updateBundleSelectionUi();
      return;
    }

    items.forEach(function (item) {
      var key = itemStorageKey(item);
      var meta = itemMeta(item);
      var card = document.createElement("label");
      card.className = "elumia-inv-bundle-item" + (sealed ? " is-locked" : "");
      var checked = sealed ? !!lockedKeys[key] : !!bundleSelectedKeys[key];
      card.innerHTML =
        (sealed
          ? ""
          : '<input type="checkbox" class="elumia-inv-bundle-check" data-bundle-key="' +
            key +
            '"' +
            (checked ? " checked" : "") +
            ">") +
        '<div class="elumia-inv-bundle-item-image"><img src="' +
        itemDisplayImage(item) +
        '" alt="">' +
        (meta.level ? '<span class="elumia-inv-slot-lv">+' + meta.level + "</span>" : "") +
        "</div>" +
        "<strong>" +
        (item.name || "Item") +
        "</strong>" +
        "<span>" +
        [meta.quality, meta.slot].filter(Boolean).join(" · ") +
        "</span>";
      if (!sealed) {
        var input = card.querySelector(".elumia-inv-bundle-check");
        if (input) {
          input.addEventListener("change", function () {
            bundleSelectedKeys[key] = input.checked;
            updateBundleSelectionUi();
          });
        }
      }
      els.bundleItems.appendChild(card);
    });

    updateBundleSelectionUi();
  }

  function renderBundleModal() {
    var sealed = isHeroSealedFor(bundleModalHero);
    if (els.bundleCopy) {
      els.bundleCopy.textContent = sealed
        ? "This hero is sealed. Review the bundle below or unseal to make changes."
        : "Choose a hero and the inventory you want to seal together.";
    }
    if (els.bundleSelectAll) els.bundleSelectAll.hidden = sealed;
    if (els.bundleClear) els.bundleClear.hidden = sealed;
    if (els.bundleSeal) els.bundleSeal.hidden = sealed;
    if (els.bundleUnseal) els.bundleUnseal.hidden = !sealed;
    renderBundleHeroes();
    renderBundleItems();
  }

  function sealBundle() {
    if (!bundleModalHero) return;
    var selectedItems = getAllBundleItems().filter(function (item) {
      return bundleSelectedKeys[itemStorageKey(item)];
    });
    if (!selectedItems.length) {
      if (els.bundleStatus) {
        els.bundleStatus.textContent = "Select at least one item to seal the bundle.";
      }
      return;
    }

    var binding = {
      walletKey: walletStorageKey(),
      heroTokenId: String(bundleModalHero.token_id),
      hero: JSON.parse(JSON.stringify(bundleModalHero)),
      heroName: bundleModalHero.name || "Hero #" + bundleModalHero.token_id,
      boundItems: selectedItems.map(function (item) {
        return JSON.parse(JSON.stringify(item));
      }),
      sealed: true,
      sealedAt: Date.now(),
    };

    saveBundleForHero(bundleModalHero, binding);
    if (els.bundleStatus) {
      els.bundleStatus.textContent =
        (bundleModalHero.name || "Hero") +
        " sealed with " +
        selectedItems.length +
        " items.";
    }
    renderBundleModal();
    updateBundleUi();
    if (selectedHero && String(selectedHero.token_id) === String(bundleModalHero.token_id)) {
      renderLoadout(ownedItems);
    }
    closeBundleModal();
  }

  function unsealBundle() {
    if (!bundleModalHero || !isHeroSealedFor(bundleModalHero)) return;
    saveBundleForHero(bundleModalHero, null);
    syncBundleSelectionForHero(bundleModalHero);
    if (els.bundleStatus) {
      els.bundleStatus.textContent = "Bundle unsealed — pick items and seal again.";
    }
    renderBundleModal();
    updateBundleUi();
    if (selectedHero && String(selectedHero.token_id) === String(bundleModalHero.token_id)) {
      renderLoadout(ownedItems);
    }
  }

  function traitTone(key, value) {
    var k = String(key || "").toLowerCase();
    var v = String(value || "").toLowerCase();
    if (k === "fate") return qualityClass(value);
    if (k === "generation" && v.indexOf("genesis") >= 0) return "legendary";
    if (k === "affinity") {
      if (v.indexOf("fire") >= 0) return "legendary";
      if (v.indexOf("water") >= 0) return "rare";
      if (v.indexOf("earth") >= 0) return "uncommon";
      if (v.indexOf("light") >= 0 || v.indexOf("dark") >= 0) return "epic";
    }
    if (k === "class") return "epic";
    return "common";
  }

  function setSlotView(view) {
    slotView = view === "traits" ? "traits" : "equipment";
    if (els.modeEquip) els.modeEquip.classList.toggle("is-active", slotView === "equipment");
    if (els.modeTraits) els.modeTraits.classList.toggle("is-active", slotView === "traits");
    renderPaperdoll();
  }

  function buildTraitSlot(def) {
    var value = selectedHero
      ? traitValue(selectedHero.attributes, def.key) ||
        traitValue(selectedHero.attributes, def.label)
      : "";
    var node = document.createElement("div");
    var tone = traitTone(def.key, value);
    node.className =
      "elumia-inv-equip-slot is-trait elumia-inv-equip-slot--" + tone;
    node.title = def.label + (value ? " · " + value : "");
    node.innerHTML =
      '<span class="elumia-inv-trait-value">' +
      (value || "—") +
      '</span><span class="elumia-inv-equip-label">' +
      def.label +
      "</span>";
    return node;
  }

  function renderTraitColumn(container, defs) {
    if (!container) return;
    container.innerHTML = "";
    defs.forEach(function (def) {
      container.appendChild(buildTraitSlot(def));
    });
  }

  function renderPaperdoll() {
    if (slotView === "traits") {
      renderTraitColumn(els.equipLeft, TRAIT_LEFT);
      renderTraitColumn(els.equipRight, TRAIT_RIGHT);
      return;
    }
    renderEquipColumn(els.equipLeft, EQUIP_LEFT, mergeDemoPaperdoll(lastLoadout.equipped || {}));
    renderEquipColumn(els.equipRight, EQUIP_RIGHT, mergeDemoPaperdoll(lastLoadout.equipped || {}));
  }

  function itemSlotCategory(item) {
    var slot = String(
      traitValue(item.attributes, "SLOT") || traitValue(item.attributes, "slot") || ""
    )
      .toLowerCase()
      .trim();
    if (slot && SLOT_ID_MAP[slot]) return SLOT_ID_MAP[slot];

    var name = String(item.name || "").toLowerCase();
    var hay = slot + " " + name;
    var categories = [
      { id: "helmet", keys: ["helmet", "helm", "hat"] },
      { id: "chest", keys: ["chest", "armor", "armour"] },
      { id: "ring", keys: ["ring"] },
      { id: "amulet", keys: ["amulet", "necklace"] },
      { id: "weapon", keys: ["weapon", "sword", "spear", "staff", "bow", "axe", "dagger", "mace", "wand"] },
      { id: "offhand", keys: ["offhand", "off-hand", "shield", "quiver"] },
      { id: "companion", keys: ["companion", "pet"] },
    ];
    for (var i = 0; i < categories.length; i += 1) {
      var keys = categories[i].keys;
      for (var k = 0; k < keys.length; k += 1) {
        if (hay.indexOf(keys[k]) >= 0) return categories[i].id;
      }
    }
    return "";
  }

  function itemSlotId(item) {
    return itemSlotCategory(item);
  }

  function splitLoadout(items) {
    var equipped = {};
    var bag = [];
    var rings = [];
    items
      .slice()
      .sort(function (a, b) {
        return itemScore(b) - itemScore(a);
      })
      .forEach(function (item) {
        var category = itemSlotCategory(item);
        if (category === "ring") {
          rings.push(item);
          return;
        }
        if (category && !equipped[category]) {
          equipped[category] = item;
          return;
        }
        bag.push(item);
      });

    rings.forEach(function (item, index) {
      if (index >= RING_SLOT_IDS.length) {
        bag.push(item);
        return;
      }
      equipped[RING_SLOT_IDS[index]] = item;
    });

    return { equipped: equipped, bag: bag };
  }

  function itemMeta(item) {
    return {
      quality: traitValue(item.attributes, "QUALITY") || traitValue(item.attributes, "quality"),
      slot: traitValue(item.attributes, "SLOT") || traitValue(item.attributes, "slot"),
      level: traitValue(item.attributes, "LEVEL") || traitValue(item.attributes, "level"),
      tier: traitValue(item.attributes, "TIER") || traitValue(item.attributes, "tier"),
      balance: item.balance != null ? item.balance : item.total_supply || 1,
    };
  }

  function buildEquipSlot(def, item) {
    var node = document.createElement("div");
    node.className = "elumia-inv-equip-slot";
    var placeholder = equipSlotPlaceholderUrl(def.id);
    if (!item) {
      node.className += " is-placeholder";
      node.innerHTML =
        (placeholder
          ? '<img src="' + placeholder + '" alt="" class="elumia-inv-equip-placeholder">'
          : '<span class="elumia-inv-equip-empty"></span>') +
        '<span class="elumia-inv-equip-label">' +
        def.label +
        "</span>";
      return node;
    }
    var meta = itemMeta(item);
    var isDemo = !!item.demoIcon;
    node.className += " elumia-inv-equip-slot--" + qualityClass(meta.quality);
    if (isDemo) node.className += " is-demo";
    if (!isDemo) node.dataset.itemKey = itemStorageKey(item);
    node.title = (item.name || def.label) + (meta.quality ? " · " + meta.quality : "");
    node.innerHTML =
      '<img src="' +
      itemDisplayImage(item, def.id) +
      '" alt="">' +
      (meta.level && !isDemo ? '<span class="elumia-inv-slot-lv">+' + meta.level + "</span>" : "") +
      '<span class="elumia-inv-equip-label">' +
      def.label +
      "</span>";
    return node;
  }

  function buildBagSlot(item) {
    var meta = itemMeta(item);
    var node = document.createElement("button");
    node.type = "button";
    node.className = "elumia-inv-bag-slot elumia-inv-bag-slot--" + qualityClass(meta.quality);
    node.dataset.itemKey = itemStorageKey(item);
    node.title = [
      item.name || "Item",
      meta.quality,
      meta.slot,
      meta.level ? "Lv " + meta.level : "",
    ]
      .filter(Boolean)
      .join(" · ");
    node.innerHTML =
      '<span class="elumia-inv-bag-slot-art">' +
      '<img src="' +
      itemDisplayImage(item) +
      '" alt="" loading="lazy">' +
      "</span>" +
      (Number(meta.balance) > 1
        ? '<span class="elumia-inv-bag-qty">×' + meta.balance + "</span>"
        : "") +
      (meta.level ? '<span class="elumia-inv-slot-lv">+' + meta.level + "</span>" : "");
    return node;
  }

  function renderEquipColumn(container, defs, equipped) {
    if (!container) return;
    container.innerHTML = "";
    defs.forEach(function (def) {
      container.appendChild(buildEquipSlot(def, equipped[def.id]));
    });
  }

  function renderLoadout(items) {
    lastLoadout = splitLoadout(items || []);
    renderPaperdoll();
    if (!els.inventory) return;
    els.inventory.innerHTML = "";
    if (!items.length) {
      els.inventory.innerHTML =
        '<p class="elumia-inv-empty">No Items of Elumia found in this wallet.</p>';
      syncProfileBars();
      return;
    }
    var bagItems = lastLoadout.bag.filter(function (item) {
      return Number(itemMeta(item).balance) > 0;
    });
    var overflow = Math.max(0, bagItems.length - BAG_MAX_ITEMS);
    if (overflow > 0) {
      bagItems = bagItems.slice(0, BAG_MAX_ITEMS);
    }
    bagItems.forEach(function (item) {
      els.inventory.appendChild(buildBagSlot(item));
    });
    var filled = els.inventory.children.length;
    for (var i = filled; i < BAG_MIN_SLOTS && i < BAG_MAX_ITEMS; i += 1) {
      var empty = document.createElement("div");
      empty.className = "elumia-inv-bag-slot is-empty";
      els.inventory.appendChild(empty);
    }
    if (overflow > 0) {
      var notice = document.createElement("p");
      notice.className = "elumia-inv-bag-overflow";
      notice.textContent =
        "Showing first " +
        BAG_MAX_ITEMS +
        " bag items (" +
        overflow +
        " more not shown).";
      els.inventory.appendChild(notice);
    }
    updateBundleUi();
  }

  function setText(el, value) {
    if (el) el.textContent = value || "—";
  }

  function shortAddress(address) {
    if (!address || address.length < 10) return address || "";
    return address.slice(0, 6) + "…" + address.slice(-4);
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

  function addContractRow(label, value, href, description) {
    if (!els.contractRows) return;
    var row = document.createElement("div");
    row.className = "elumia-inv-kv-row";
    var dt = document.createElement("dt");
    dt.textContent = label;
    if (description) {
      var desc = document.createElement("span");
      desc.className = "elumia-inv-kv-desc";
      desc.textContent = description;
      dt.appendChild(desc);
    }
    var dd = document.createElement("dd");
    if (href) {
      var a = document.createElement("a");
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = value;
      dd.appendChild(a);
    } else {
      dd.textContent = value;
    }
    row.appendChild(dt);
    row.appendChild(dd);
    els.contractRows.appendChild(row);
  }

  async function loadJson(path) {
    var res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load " + path);
    return res.json();
  }

  async function imxFetch(path, query) {
    var url = config.immutableApi + path;
    if (query) {
      var params = new URLSearchParams(query);
      url += "?" + params.toString();
    }
    var res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Immutable API request failed (" + res.status + ")");
    }
    return res.json();
  }

  async function fetchAllAccountNfts(address, contractAddress) {
    var all = [];
    var cursor = null;
    do {
      var query = {
        contract_address: contractAddress,
        page_size: "200",
      };
      if (cursor) query.cursor = cursor;
      var data = await imxFetch("/accounts/" + address + "/nfts", query);
      all = all.concat(data.result || []);
      cursor = data.page && data.page.next_cursor;
    } while (cursor);
    return all;
  }

  function renderHeroPicker(heroes, activeTokenId) {
    if (!els.heroPicker) return;
    if (!heroes || !heroes.length) {
      els.heroPicker.hidden = true;
      els.heroPicker.innerHTML = "";
      return;
    }
    els.heroPicker.hidden = false;
    els.heroPicker.innerHTML = "";
    heroes.forEach(function (hero) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className =
        "elumia-inv-hero-chip" +
        (String(hero.token_id) === String(activeTokenId) ? " is-active" : "");
      chip.title = hero.name || "Hero #" + hero.token_id;
      chip.innerHTML =
        '<img src="' +
        (hero.image || "https://elumia.triumphcdn.com/imx/mainnet/heroes/collectionLogo.png") +
        '" alt="">';
      chip.addEventListener("click", function () {
        selectHero(hero);
      });
      els.heroPicker.appendChild(chip);
    });
  }

  function updateHeroHeading(hero, emptyLabel) {
    if (els.previewContext) {
      if (!hero) {
        els.previewContext.textContent = emptyLabel || "Connect wallet to load";
        els.previewContext.className = "elumia-inv-context";
      } else {
        els.previewContext.textContent = "Hero #" + hero.token_id;
        els.previewContext.className = "elumia-inv-context is-live";
      }
    }
    if (els.previewName) {
      els.previewName.textContent = hero ? hero.name || "" : "";
    }
  }

  function selectHero(hero) {
    if (!hero) return;
    selectedHero = hero;
    updateHeroHeading(hero);
    if (els.previewImage) {
      els.previewImage.src =
        hero.image ||
        "https://elumia.triumphcdn.com/imx/mainnet/heroes/collectionLogo.png";
      els.previewImage.alt = hero.name || "Legends of Elumia hero";
    }
    if (els.previewDesc) {
      els.previewDesc.hidden = true;
      els.previewDesc.textContent = "";
    }
    renderHeroPicker(ownedHeroes, hero.token_id);
    renderPaperdoll();

    if (els.explorerHeroLink && config) {
      els.explorerHeroLink.href =
        config.explorer +
        "/token/" +
        config.heroes.contract +
        "/instance/" +
        hero.token_id;
    }
    if (els.tokentroveHeroLink && config && config.heroes.marketplace) {
      els.tokentroveHeroLink.href =
        config.heroes.marketplace + "/" + hero.token_id;
    }
    loadActiveBundle();
    closeBundleModal();
    updateProfileSkills();
    updateBundleUi();
  }

  function renderInventoryItems(items) {
    renderLoadout(items || []);
  }

  function showHeroEmpty(message) {
    selectedHero = null;
    updateHeroHeading(null, "Connect wallet to load");
    if (els.previewImage) {
      els.previewImage.src =
        "https://elumia.triumphcdn.com/imx/mainnet/heroes/collectionLogo.png";
    }
    if (els.previewDesc) {
      els.previewDesc.hidden = false;
      els.previewDesc.textContent = message;
    }
    if (els.heroPicker) {
      els.heroPicker.hidden = true;
      els.heroPicker.innerHTML = "";
    }
    activeBundle = null;
    closeBundleModal();
    updateProfileSkills();
    renderLoadout([]);
  }

  async function loadPortfolio(address) {
    if (!config) return;

    connectedAddress = address;
    setText(els.walletAddress, address);

    if (els.inventory) {
      els.inventory.innerHTML =
        '<p class="elumia-inv-empty">Loading items from Immutable…</p>';
    }

    var heroContracts = [config.heroes.contract].concat(
      config.legacyContracts && config.legacyContracts.heroes
        ? config.legacyContracts.heroes
        : []
    );
    var itemContracts = [config.items.contract].concat(
      config.legacyContracts && config.legacyContracts.items
        ? config.legacyContracts.items
        : []
    );

    try {
      var heroLists = await Promise.all(
        heroContracts.map(function (contractAddress) {
          return fetchAllAccountNfts(address, contractAddress);
        })
      );
      ownedHeroes = heroLists.reduce(function (acc, list) {
        return acc.concat(list);
      }, []);
      ownedHeroes.sort(function (a, b) {
        return Number(a.token_id) - Number(b.token_id);
      });

      var itemLists = await Promise.all(
        itemContracts.map(function (contractAddress) {
          return fetchAllAccountNfts(address, contractAddress);
        })
      );
      var itemMap = {};
      itemLists.forEach(function (list) {
        list.forEach(function (item) {
          var key =
            String(item.contract_address).toLowerCase() +
            ":" +
            String(item.token_id);
          var balance = Number(item.balance != null ? item.balance : 1);
          if (!itemMap[key]) {
            itemMap[key] = item;
            itemMap[key].balance = balance;
          } else {
            itemMap[key].balance = Number(itemMap[key].balance) + balance;
          }
        });
      });
      ownedItems = Object.keys(itemMap)
        .map(function (key) {
          return itemMap[key];
        })
        .filter(function (item) {
          return Number(item.balance) > 0;
        })
        .sort(function (a, b) {
          return Number(a.token_id) - Number(b.token_id);
        });

      setText(els.heroCount, String(ownedHeroes.length));
      setText(els.itemCount, String(ownedItems.length));
      syncProfileBars();

      if (els.inventoryNote) {
        els.inventoryNote.textContent =
        "Unequipped items live in the bag. Best gear per slot is shown on the hero.";
      }

      if (!ownedHeroes.length) {
        showHeroEmpty(
          "This wallet does not own any Heroes of Elumia NFTs yet. Browse heroes on TokenTrove."
        );
      } else {
        selectHero(ownedHeroes[0]);
      }

      renderInventoryItems(ownedItems);
    } catch (err) {
      showHeroEmpty(err.message);
      if (els.inventory) {
        els.inventory.innerHTML =
          '<p class="elumia-inv-empty">' + err.message + "</p>";
      }
      setText(els.heroCount, "—");
      setText(els.itemCount, "—");
    }
  }

  function expandTestItems(items, targetCount) {
    var count = Math.max(TEST_ITEM_MIN, Math.min(TEST_ITEM_MAX, targetCount || TEST_ITEM_TARGET));
    if (!items.length || items.length >= count) {
      return items.slice(0, count);
    }
    var qualities = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
    var out = items.slice();
    var index = 0;
    while (out.length < count) {
      var src = items[index % items.length];
      var clone = JSON.parse(JSON.stringify(src));
      var serial = out.length + 1;
      clone.token_id = String(900000 + serial);
      clone.name = (src.name || "Item") + " #" + serial;
      clone.attributes = (clone.attributes || []).map(function (attr) {
        if (!attr) return attr;
        if (attr.trait_type === "LEVEL") {
          return { trait_type: "LEVEL", value: String((Number(attr.value) + (serial % 7)) || 1) };
        }
        if (attr.trait_type === "QUALITY") {
          return { trait_type: "QUALITY", value: qualities[serial % qualities.length] };
        }
        return attr;
      });
      out.push(clone);
      index += 1;
    }
    return out.slice(0, count);
  }

  async function loadMockPortfolio() {
    if (!config) return;
    var cache = await loadJson("/assets/elumia/marketplace-cache.json");
    ownedHeroes = cache.heroes || [];
    ownedItems = expandTestItems(cache.items || [], TEST_ITEM_TARGET);
    connectedAddress = "0xTest…Adventurer";
    walletSource = "address";
    setWalletTypeLabel("address");
    setConnectLabel(shortAddress(connectedAddress));
    setText(els.walletAddress, connectedAddress);
    setText(els.heroCount, String(ownedHeroes.length));
    setText(els.itemCount, String(ownedItems.length));
    syncProfileBars();
    if (els.inventoryNote) {
      els.inventoryNote.textContent =
        "Test loadout — " +
        ownedItems.length +
        " items in bag (mock catalog expanded to " +
        TEST_ITEM_MIN +
        "–" +
        TEST_ITEM_MAX +
        ").";
    }
    if (ownedHeroes.length) {
      selectHero(ownedHeroes[0]);
    } else {
      showHeroEmpty("No mock heroes in catalog.");
    }
    renderInventoryItems(ownedItems);
  }

  async function refreshPortfolio() {
    if (!connectedAddress) {
      showHeroEmpty("Connect a wallet that owns Heroes of Elumia NFTs on Immutable zkEVM.");
      if (els.inventory) {
        els.inventory.innerHTML =
          '<p class="elumia-inv-empty">Connect your wallet to load items.</p>';
      }
      return;
    }
    if (els.inventoryRefresh) {
      els.inventoryRefresh.classList.add("is-spinning");
      els.inventoryRefresh.disabled = true;
    }
    try {
      await loadPortfolio(connectedAddress);
    } finally {
      if (els.inventoryRefresh) {
        els.inventoryRefresh.classList.remove("is-spinning");
        els.inventoryRefresh.disabled = false;
      }
    }
  }

  function renderConfigRows() {
    if (!els.contractRows || !config) return;
    els.contractRows.innerHTML = "";
    addContractRow(
      "Heroes collection",
      config.heroes.contract,
      config.explorer + "/address/" + config.heroes.contract,
      config.heroes.name + " (ERC-721) on TokenTrove."
    );
    addContractRow(
      "Items collection",
      config.items.contract,
      config.explorer + "/address/" + config.items.contract,
      config.items.name + " (ERC-1155) on TokenTrove."
    );
    addContractRow("Network", config.network);
    addContractRow("Chain ID", String(config.chainId));
    addContractRow(
      "Hero marketplace",
      "TokenTrove",
      config.heroes.marketplace
    );
    addContractRow(
      "Items marketplace",
      "TokenTrove",
      config.items.marketplace
    );
  }

  function setWalletTypeLabel(source) {
    if (!els.walletType) return;
    if (source === "passport") {
      els.walletType.textContent = "Immutable Passport";
    } else if (source === "browser") {
      els.walletType.textContent = "Browser wallet";
    } else if (source === "address") {
      els.walletType.textContent = "Wallet address";
    } else {
      els.walletType.textContent = "—";
    }
  }

  function updateNetworkControls() {
    if (!els.switchBtn) return;
    var hideSwitch = walletSource === "passport" || walletSource === "address";
    els.switchBtn.hidden = hideSwitch;
    els.switchBtn.disabled = hideSwitch;
  }

  function openConnectModal() {
    if (!els.connectModal) return;
    if (els.connectModalStatus) els.connectModalStatus.textContent = "";
    els.connectModal.hidden = false;
    els.connectModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("elumia-connect-modal-open");
  }

  function closeConnectModal() {
    if (!els.connectModal) return;
    els.connectModal.hidden = true;
    els.connectModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("elumia-connect-modal-open");
    if (els.connectModalStatus) els.connectModalStatus.textContent = "";
  }

  function setConnectModalStatus(message) {
    if (els.connectModalStatus) els.connectModalStatus.textContent = message || "";
  }

  function setConnectBusy(isBusy) {
    if (els.connectPassportBtn) els.connectPassportBtn.disabled = isBusy;
    if (els.connectMetamaskBtn) els.connectMetamaskBtn.disabled = isBusy;
  }

  function bindProviderListeners(provider) {
    if (!provider || !provider.on || providerListenersBound) return;
    provider.on("accountsChanged", function () {
      refreshWallet();
    });
    provider.on("chainChanged", function () {
      refreshWallet();
    });
    providerListenersBound = true;
  }

  function getActiveProvider() {
    if (activeProvider) return activeProvider;
    return window.ethereum || null;
  }

  function clearWalletState() {
    connectedAddress = null;
    activeProvider = null;
    walletSource = null;
    ownedHeroes = [];
    ownedItems = [];
    setWalletTypeLabel(null);
    updateNetworkControls();
  }

  function setConnectLabel(label) {
    if (els.connectBtn) els.connectBtn.textContent = label;
    if (els.connectPanelBtn) els.connectPanelBtn.textContent = label;
  }

  async function switchNetwork() {
    var provider = getActiveProvider();
    if (!provider) {
      alert("Install MetaMask or another EVM wallet to switch networks.");
      return;
    }
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: IMX_CHAIN.chainId }],
      });
    } catch (err) {
      if (err && err.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [IMX_CHAIN],
        });
      } else {
        throw err;
      }
    }
  }

  async function refreshWallet() {
    var provider = getActiveProvider();

    if (!provider) {
      setText(els.walletAddress, "Not connected");
      setConnectLabel("Connect wallet");
      clearWalletState();
      showHeroEmpty("Connect a wallet that owns Heroes of Elumia NFTs on Immutable zkEVM.");
      if (els.inventory) {
        els.inventory.innerHTML =
          '<p class="elumia-inv-empty">Connect your wallet to load items.</p>';
      }
      setText(els.heroCount, "—");
      setText(els.itemCount, "—");
      return;
    }

    try {
      var accounts = await provider.request({
        method: "eth_accounts",
      });
      if (!accounts.length) {
        setText(els.walletAddress, "Not connected");
        setConnectLabel("Connect wallet");
        clearWalletState();
        showHeroEmpty("Connect a wallet that owns Heroes of Elumia NFTs on Immutable zkEVM.");
        if (els.inventory) {
          els.inventory.innerHTML =
            '<p class="elumia-inv-empty">Connect your wallet to load items.</p>';
        }
        setText(els.heroCount, "—");
        setText(els.itemCount, "—");
        return;
      }

      setConnectLabel(shortAddress(accounts[0]));
      await loadPortfolio(accounts[0]);
    } catch (err) {
      setConnectLabel("Connect wallet");
      showHeroEmpty(err.message);
    }
  }

  async function connectBrowserWallet() {
    if (!window.ethereum) {
      throw new Error("Install MetaMask or another EVM wallet to connect.");
    }
    activeProvider = window.ethereum;
    walletSource = "browser";
    setWalletTypeLabel("browser");
    updateNetworkControls();
    bindProviderListeners(activeProvider);

    await activeProvider.request({ method: "eth_requestAccounts" });
    try {
      await switchNetwork();
    } catch (err) {
      // Continue loading via Immutable API even if network switch is skipped.
    }
    await refreshWallet();
  }

  function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(String(address || "").trim());
  }

  function getPassportConfig() {
    if (!config || !config.passport) return null;
    return config.passport;
  }

  function passportClientConfigured() {
    var passportConfig = getPassportConfig();
    return !!(passportConfig && passportConfig.clientId);
  }

  async function connectByAddress(address) {
    var normalized = String(address || "").trim();
    if (!isValidAddress(normalized)) {
      throw new Error("Enter a valid wallet address (0x…).");
    }
    activeProvider = null;
    walletSource = "address";
    setWalletTypeLabel("address");
    updateNetworkControls();
    setConnectLabel(shortAddress(normalized));
    setText(els.walletAddress, normalized);
    await loadPortfolio(normalized);
  }

  async function connectImmutablePassport() {
    if (!passportClientConfigured()) {
      throw new Error(
        "Passport sign-in needs a client ID in assets/elumia/imx-config.json. Register https://triumph-games.vercel.app/elumia-passport-callback in Immutable Hub, then paste the client ID. You can also paste a wallet address below to load inventory without signing in."
      );
    }
    setConnectModalStatus("Opening Immutable Passport…");
    var walletModule = await import("/js/elumia-immutable-wallet.bundle.mjs");
    var result = await walletModule.connectImmutablePassport(getPassportConfig());
    activeProvider = result.provider;
    walletSource = "passport";
    setWalletTypeLabel("passport");
    updateNetworkControls();
    bindProviderListeners(activeProvider);
    setConnectLabel(shortAddress(result.address));
    await loadPortfolio(result.address);
  }

  async function connectWallet() {
    openConnectModal();
  }

  function bindConnect(button) {
    if (!button) return;
    button.addEventListener("click", function () {
      connectWallet();
    });
  }

  bindConnect(els.connectBtn);
  bindConnect(els.connectPanelBtn);
  bindConnect(els.connectPanelEmbed);

  if (els.connectModal) {
    els.connectModal.querySelectorAll("[data-elumia-close-modal]").forEach(function (node) {
      node.addEventListener("click", closeConnectModal);
    });
  }

  if (els.connectMetamaskBtn) {
    els.connectMetamaskBtn.addEventListener("click", function () {
      setConnectBusy(true);
      connectBrowserWallet()
        .then(function () {
          closeConnectModal();
        })
        .catch(function (err) {
          setConnectModalStatus(err.message || "Browser wallet connect failed.");
        })
        .finally(function () {
          setConnectBusy(false);
        });
    });
  }

  if (els.connectPassportBtn) {
    els.connectPassportBtn.addEventListener("click", function () {
      setConnectBusy(true);
      connectImmutablePassport()
        .then(function () {
          closeConnectModal();
        })
        .catch(function (err) {
          var message = err && err.message ? err.message : "Immutable Passport connect failed.";
          setConnectModalStatus(message);
        })
        .finally(function () {
          setConnectBusy(false);
        });
    });
  }

  if (els.loadAddressBtn) {
    els.loadAddressBtn.addEventListener("click", function () {
      var address = els.passportAddressInput ? els.passportAddressInput.value : "";
      setConnectBusy(true);
      connectByAddress(address)
        .then(function () {
          closeConnectModal();
        })
        .catch(function (err) {
          setConnectModalStatus(err.message || "Could not load that address.");
        })
        .finally(function () {
          setConnectBusy(false);
        });
    });
  }

  window.addEventListener("message", function (event) {
    if (event.origin !== window.location.origin) return;
    if (event.data && event.data.type === "elumia-passport-complete") {
      refreshWallet();
    }
  });

  if (els.switchBtn) {
    els.switchBtn.addEventListener("click", function () {
      switchNetwork().catch(function (err) {
        alert(err.message || "Network switch failed");
      });
    });
  }

  if (els.inventoryRefresh) {
    els.inventoryRefresh.addEventListener("click", function () {
      refreshPortfolio();
    });
  }

  if (els.modeEquip) {
    els.modeEquip.addEventListener("click", function () {
      setSlotView("equipment");
    });
  }
  if (els.modeTraits) {
    els.modeTraits.addEventListener("click", function () {
      setSlotView("traits");
    });
  }

  if (els.bundleHeroBtn) {
    els.bundleHeroBtn.addEventListener("click", function () {
      openBundleModal();
    });
  }
  if (els.bundleModal) {
    els.bundleModal.querySelectorAll("[data-elumia-close-bundle]").forEach(function (node) {
      node.addEventListener("click", closeBundleModal);
    });
  }
  if (els.bundleCancel) {
    els.bundleCancel.addEventListener("click", closeBundleModal);
  }
  if (els.bundleSelectAll) {
    els.bundleSelectAll.addEventListener("click", function () {
      getAllBundleItems().forEach(function (item) {
        bundleSelectedKeys[itemStorageKey(item)] = true;
      });
      renderBundleItems();
    });
  }
  if (els.bundleClear) {
    els.bundleClear.addEventListener("click", function () {
      bundleSelectedKeys = {};
      renderBundleItems();
    });
  }
  if (els.bundleSeal) {
    els.bundleSeal.addEventListener("click", sealBundle);
  }
  if (els.bundleUnseal) {
    els.bundleUnseal.addEventListener("click", unsealBundle);
  }

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", function () {
      if (walletSource === "browser") refreshWallet();
    });
    window.ethereum.on("chainChanged", function () {
      if (walletSource === "browser") refreshWallet();
    });
  }

  updateNetworkControls();

  loadJson("/assets/elumia/imx-config.json")
    .then(function (loaded) {
      config = loaded;
      renderConfigRows();
      var params = new URLSearchParams(window.location.search);
      if (params.get("test") === "1") {
        return loadMockPortfolio();
      }
      var addressParam = params.get("address");
      if (addressParam && isValidAddress(addressParam)) {
        walletSource = "address";
        setWalletTypeLabel("address");
        return connectByAddress(addressParam);
      }
      return refreshWallet();
    })
    .catch(function (err) {
      showHeroEmpty(err.message);
      if (els.inventory) {
        els.inventory.innerHTML =
          '<p class="elumia-inv-empty">' + err.message + "</p>";
      }
    });
})();
