/* Legends of Elumia — item database with community submissions */

(function () {

  var CATEGORIES = [
    { id: "weapons", label: "Weapons" },
    { id: "armour", label: "Armour" },
    { id: "rings", label: "Rings" },
    { id: "offhand", label: "Offhand" },
    { id: "amulet", label: "Amulet" },
    { id: "pets", label: "Pets" },
    { id: "goods", label: "Goods" }
  ];

  var RNG_CATEGORIES = { weapons: 1, armour: 1, rings: 1, offhand: 1, amulet: 1 };

  var LEVEL_BANDS = [
    "1-10", "10-20", "20-30", "30-40", "40-50",
    "50-60", "60-70", "70-80", "80-90", "90-100"
  ];

  var STAT_DISPLAY_ORDER = [
    "DarkDamage", "LightDamage", "AttackSpeed", "CriticalStrike",
    "Intelligence", "Agility", "GreatStrength", "GreatIntelligence", "GreatAgility",
    "Strength", "Health", "Mana"
  ];

  var STAT_OPTIONS = {
    weapons: [
      "DarkDamage", "LightDamage", "AttackSpeed", "CriticalStrike",
      "Intelligence", "Agility", "GreatStrength", "GreatIntelligence", "GreatAgility",
      "Strength", "Health", "Mana"
    ],
    offhand: [
      "Strength", "Intelligence", "Agility", "Health", "Mana",
      "GreatStrength", "GreatIntelligence", "GreatAgility", "GreatHealth", "GreatMana"
    ],
    armour: [
      "MaxHealth", "Strength", "MaxEnergy", "Intelligence", "DarkResist", "Agility",
      "PoisonResist", "Health", "PushResist", "Mana", "RootResist", "GreatStrength",
      "SnareResist", "GreatIntelligence", "StunResist", "GreatAgility", "FearResist",
      "GreatHealth", "Healing", "GreatMana"
    ],
    helmet: [
      "Strength", "Intelligence", "Agility", "GreatStrength", "GreatIntelligence",
      "GreatAgility", "Health", "Mana"
    ],
    amulet: [
      "Strength", "Intelligence", "Agility", "GreatStrength", "GreatIntelligence",
      "GreatAgility", "Health", "Mana"
    ],
    rings: ["Strength", "Intelligence", "Agility", "Health", "Mana"]
  };

  function statsForCategory(category) {
    if (category === "weapons") return STAT_OPTIONS.weapons;
    if (category === "offhand") return STAT_OPTIONS.offhand;
    if (category === "armour") return STAT_OPTIONS.armour;
    if (category === "amulet") return STAT_OPTIONS.amulet;
    if (category === "rings") return STAT_OPTIONS.rings;
    return [];
  }

  function statSelectHtml(stats, selected) {
    var opts = '<option value="">— Stat —</option>';
    var found = !selected;
    stats.forEach(function (st) {
      var sel = st === selected ? " selected" : "";
      if (st === selected) found = true;
      opts += '<option value="' + esc(st) + '"' + sel + ">" + esc(st) + "</option>";
    });
    if (selected && !found) {
      opts += '<option value="' + esc(selected) + '" selected>' + esc(selected) + "</option>";
    }
    return '<select class="elumia-db-bonus-stat" aria-label="Stat">' + opts + "</select>";
  }

  var QUALITIES = [
    { id: "common", label: "Common" },
    { id: "uncommon", label: "Uncommon" },
    { id: "rare", label: "Rare" },
    { id: "epic", label: "Epic" },
    { id: "legendary", label: "Legendary" }
  ];

  var HEADERS = {
    weapons: ["Name", "Level", "iLvl", "Req.", "RNG Bonuses", "Slot", "Source"],
    armour: ["Name", "Level", "iLvl", "Req.", "RNG Bonuses", "Slot", "Source"],
    rings: ["Name", "Level", "iLvl", "Req.", "RNG Bonuses", "Slot", "Source"],
    offhand: ["Name", "Level", "iLvl", "Req.", "RNG Bonuses", "Slot", "Source"],
    amulet: ["Name", "Level", "iLvl", "Req.", "RNG Bonuses", "Slot", "Source"],
    pets: ["Name", "iLvl", "Req.", "Pet Ability", "Slot", "Source", "Roll %"],
    goods: ["Name", "iLvl", "Req.", "Effect", "Type", "Source", "Roll %"]
  };

  var communityItems = [];
  var active = "weapons";
  var activeLevelBand = "";
  var rowLevelSelections = {};
  var variantLookup = {};

  function normalizeLevelBand(value) {
    return String(value || "").replace(/\s+/g, "");
  }

  function formatLevelBandLabel(band) {
    return normalizeLevelBand(band).replace("-", "–");
  }

  function ilvlFromLevelBand(band) {
    band = normalizeLevelBand(band);
    if (!band) return 10;
    if (band === "1-10") return 10;
    if (band === "90-100") return 95;
    var low = Number(band.split("-")[0]);
    return Number.isFinite(low) ? low + 5 : 10;
  }

  function stripRarityPrefix(name) {
    var text = String(name || "").trim();
    var low = text.toLowerCase();
    var prefixes = ["common", "uncommon", "rare", "mystic", "mythic", "epic", "legendary", "nightmare"];
    for (var i = 0; i < prefixes.length; i++) {
      var prefix = prefixes[i];
      if (low.startsWith(prefix + " ")) {
        return text.slice(prefix.length + 1).trim();
      }
    }
    return text;
  }

  function displayItemName(name) {
    return stripRarityPrefix(name);
  }

  function rarityFromName(name) {
    return "common";
  }

  function cemeteryLevelBand(ilvl) {
    var lvl = Math.max(1, Math.min(100, Number(ilvl) || 10));
    if (lvl <= 10) return "1-10";
    if (lvl >= 91) return "90-100";
    var low = Math.floor(lvl / 10) * 10;
    return low + "-" + (low + 10);
  }

  function generatorMatchesBand(type, band) {
    return normalizeLevelBand(type).indexOf(normalizeLevelBand(band)) >= 0;
  }

  function itemLevelBand(item) {
    var data = parseBonuses(item.bonuses);
    if (data && data.generatorType) {
      var match = String(data.generatorType).match(/(\d+\s*-\s*\d+)\s*$/);
      if (match) return normalizeLevelBand(match[1]);
    }
    return normalizeLevelBand(cemeteryLevelBand(item.ilvl));
  }

  function flattenGeneratorBonuses(gen) {
    if (!gen || !gen.bonusRows) return [];
    var bonuses = [];
    gen.bonusRows.forEach(function (row) {
      row.forEach(function (slot) {
        if (!slot.stat || String(slot.stat).indexOf("Bonus") === 0) return;
        bonuses.push({
          quality: slot.quality === "max" ? "legendary" : slot.quality,
          stat: slot.stat,
          group: slot.group,
          min: slot.min,
          max: slot.max
        });
      });
    });
    return bonuses;
  }

  function generatorPrefixesForCategory(category) {
    if (category === "weapons") return ["Cemetery Weapon"];
    if (category === "armour") return ["Cemetery Armor", "Cemetery Helmet"];
    if (category === "rings") return ["Cemetery Ring"];
    if (category === "offhand") return ["Cemetery OffHand", "Cemetery Shield"];
    if (category === "amulet") return ["Cemetery Necklace"];
    return [];
  }

  function findGeneratorsForLevel(category, levelBand) {
    var prefixes = generatorPrefixesForCategory(category);
    if (!prefixes.length || !levelBand) return [];
    var gens = window.ElumiaRngGenerators || [];
    return gens.filter(function (g) {
      return prefixes.some(function (prefix) {
        return g.type.indexOf(prefix) >= 0 && generatorMatchesBand(g.type, levelBand);
      });
    });
  }

  function statSortKey(stat) {
    var idx = STAT_DISPLAY_ORDER.indexOf(stat);
    return idx >= 0 ? idx : 999;
  }

  function buildStatReferenceRows(bonuses) {
    var byStat = {};
    bonuses.forEach(function (entry) {
      var stat = String(entry.stat || "").trim();
      var quality = entry.quality || "common";
      if (!stat) return;
      if (!byStat[stat]) byStat[stat] = {};
      byStat[stat][quality] = formatRoll(entry.min, entry.max);
    });
    return Object.keys(byStat).sort(function (a, b) {
      return statSortKey(a) - statSortKey(b);
    }).map(function (stat) {
      return { stat: stat, rolls: byStat[stat] };
    });
  }

  function renderLevelStatPanel(category, levelBand) {
    if (!levelBand || !isRngCategory(category)) return "";
    var gens = findGeneratorsForLevel(category, levelBand);
    if (!gens.length) {
      return (
        '<div class="elumia-db-level-stats-inner">' +
          '<p class="elumia-db-level-stats-empty">No cemetery stat data for this category at level ' + esc(levelBand) + ".</p>" +
        "</div>"
      );
    }

    var sections = gens.map(function (gen) {
      var rows = buildStatReferenceRows(flattenGeneratorBonuses(gen));
      var body = rows.map(function (row) {
        var chips = QUALITIES.map(function (q) {
          var roll = row.rolls[q.id];
          if (!roll || roll === "—") return "";
          return (
            '<span class="elumia-db-stat-ref-chip elumia-db-rarity--' + esc(q.id) + '">' +
              '<span class="elumia-db-stat-ref-q">' + esc(q.label.slice(0, 1)) + "</span> " +
              esc(roll) +
            "</span>"
          );
        }).join("");
        return (
          "<tr>" +
            "<th scope=\"row\">" + esc(row.stat) + "</th>" +
            "<td><div class=\"elumia-db-stat-ref-rolls\">" + (chips || "—") + "</div></td>" +
          "</tr>"
        );
      }).join("");

      return (
        '<section class="elumia-db-level-stats-section">' +
          '<h3 class="elumia-db-level-stats-title">' + esc(gen.type) + "</h3>" +
          '<table class="elumia-db-stat-ref-table">' +
            "<thead><tr><th>Stat</th><th>Min–max by quality</th></tr></thead>" +
            "<tbody>" + body + "</tbody>" +
          "</table>" +
        "</section>"
      );
    }).join("");

    return (
      '<div class="elumia-db-level-stats-inner">' +
        '<p class="elumia-db-level-stats-intro">Cemetery RNG stat ranges at level <strong>' + esc(levelBand) + "</strong> (from New Recipe RNG Bonus).</p>" +
        sections +
      "</div>"
    );
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function iconLabel(name) {
    return name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "?";
  }

  function canEditElumia() {
    return !!(window.TriumphCommunity && TriumphCommunity.canEditElumia());
  }

  function canDeleteElumia() {
    return !!(window.TriumphCommunity && TriumphCommunity.isAdmin());
  }

  function showItemActions() {
    return canEditElumia() || canDeleteElumia();
  }

  function getIconManifest() {
    return window.ElumiaItemIcons || [];
  }

  function lookupIcon(iconId) {
    if (!iconId) return null;
    var icons = getIconManifest();
    for (var i = 0; i < icons.length; i++) {
      if (icons[i].id === iconId) return icons[i];
    }
    return {
      id: iconId,
      label: iconId,
      url: "/assets/elumia/item-icons/" + iconId + ".png"
    };
  }

  function resolveIconFields(raw) {
    var iconId = raw.iconId || raw.icon_id || "";
    var iconUrl = raw.iconUrl || "";
    if (!iconUrl && iconId) {
      var icon = lookupIcon(iconId);
      iconUrl = icon ? icon.url : "/assets/elumia/item-icons/" + iconId + ".png";
    }
    return { iconId: iconId, iconUrl: iconUrl };
  }

  function isRngCategory(category) {
    return !!RNG_CATEGORIES[category];
  }

  function parseBonuses(raw) {
    if (!raw) return null;
    if (typeof raw === "object") return raw;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function bonusLines(item) {
    var data = parseBonuses(item.bonuses);
    if (data && data.bonuses && data.bonuses.length) return data.bonuses;
    return null;
  }

  function normalizeItem(raw, category) {
    var icons = resolveIconFields(raw);
    return {
      id: raw.id || null,
      category: category,
      name: raw.name,
      rarity: raw.rarity || "common",
      phase: raw.phase || "",
      ilvl: raw.ilvl,
      req: raw.req,
      slot: raw.slot || "",
      source: raw.source || "",
      sourceType: raw.sourceType || raw.source_type || "",
      dps: raw.dps,
      speed: raw.speed,
      armor: raw.armor,
      stat: raw.stat || "",
      roll: raw.roll || raw.roll_pct || "—",
      bonuses: parseBonuses(raw.bonuses),
      tag: raw.tag || "",
      iconId: icons.iconId,
      iconUrl: icons.iconUrl,
      createdAt: raw.createdAt || raw.created_at || ""
    };
  }

  function qualityLabel(id) {
    var q = QUALITIES.find(function (x) { return x.id === id; });
    return q ? q.label : id;
  }

  function formatRoll(min, max) {
    if (min == null && max == null) return "—";
    if (min == null) return String(max);
    if (max == null || min === max) return String(min);
    return min + "–" + max;
  }

  function computeOverallFromBonuses(bonusData) {
    if (!bonusData || !bonusData.bonuses || !bonusData.bonuses.length) return null;
    var byStat = {};
    var globalMin = null;
    var globalMax = null;

    bonusData.bonuses.forEach(function (entry) {
      var stat = String(entry.stat || "").trim();
      if (!stat) return;
      var min = entry.min != null && entry.min !== "" ? Number(entry.min) : null;
      var max = entry.max != null && entry.max !== "" ? Number(entry.max) : null;
      if (min != null && !Number.isFinite(min)) min = null;
      if (max != null && !Number.isFinite(max)) max = null;
      if (!byStat[stat]) byStat[stat] = { min: null, max: null };
      if (min != null) {
        byStat[stat].min = byStat[stat].min == null ? min : Math.min(byStat[stat].min, min);
        globalMin = globalMin == null ? min : Math.min(globalMin, min);
      }
      if (max != null) {
        byStat[stat].max = byStat[stat].max == null ? max : Math.max(byStat[stat].max, max);
        globalMax = globalMax == null ? max : Math.max(globalMax, max);
      }
    });

    var statNames = Object.keys(byStat).sort();
    if (!statNames.length) return null;

    return {
      statSummary: statNames.map(function (stat) {
        return stat + " " + formatRoll(byStat[stat].min, byStat[stat].max);
      }).join(" · "),
      globalRange: formatRoll(globalMin, globalMax)
    };
  }

  function overallFromItem(item) {
    var fromBonuses = computeOverallFromBonuses(item.bonuses);
    if (fromBonuses) return fromBonuses;
    if (item.stat || item.roll) {
      return {
        statSummary: item.stat || "",
        globalRange: item.roll && item.roll !== "—" ? item.roll : ""
      };
    }
    return null;
  }

  var QUALITY_ORDER = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };

  function bonusesCell(item, viewBand) {
    var bonusData = mergedBonusesForItemAtLevel(item, viewBand || getRowLevel(item));
    var lines = bonusData && bonusData.bonuses ? bonusData.bonuses : null;

    if (lines && lines.length) {
      lines = lines.slice().sort(function (a, b) {
        return (QUALITY_ORDER[a.quality] || 99) - (QUALITY_ORDER[b.quality] || 99);
      });
      return (
        '<div class="elumia-db-bonuses" data-bonus-cell>' +
          lines.map(function (b) {
            var q = b.quality || item.rarity;
            return (
              '<span class="elumia-db-bonus-chip elumia-db-rarity--' + esc(q) + '" title="' + esc(qualityLabel(q)) + '">' +
                '<span class="elumia-db-bonus-q">' + esc(qualityLabel(q).slice(0, 1)) + "</span> " +
                esc(b.stat) + " " + esc(formatRoll(b.min, b.max)) +
              "</span>"
            );
          }).join("") +
        "</div>"
      );
    }
    if (item.dps != null || item.speed != null) {
      return esc([item.dps != null ? "DPS " + item.dps : "", item.speed != null ? "Speed " + item.speed : ""].filter(Boolean).join(" · "));
    }
    if (item.armor != null) return esc("Armor " + item.armor);
    return "—";
  }

  function numBonus(value) {
    if (value === "" || value == null) return null;
    var n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function mergeBonusEntries(entries) {
    var byKey = {};
    (entries || []).forEach(function (entry) {
      var stat = String(entry.stat || "").trim();
      if (!stat) return;
      var quality = entry.quality || "common";
      var key = quality + "::" + stat;
      var min = numBonus(entry.min);
      var max = numBonus(entry.max);
      if (!byKey[key]) {
        byKey[key] = {
          quality: quality,
          stat: stat,
          group: entry.group,
          weight: entry.weight,
          min: null,
          max: null
        };
      }
      if (min != null) {
        byKey[key].min = byKey[key].min == null ? min : Math.min(byKey[key].min, min);
      }
      if (max != null) {
        byKey[key].max = byKey[key].max == null ? max : Math.max(byKey[key].max, max);
      }
    });
    return Object.keys(byKey).map(function (key) {
      var row = byKey[key];
      if (row.max == null && row.min != null) row.max = row.min;
      if (row.min == null && row.max != null) row.min = row.max;
      return row;
    });
  }

  function itemDisplayKey(item) {
    return (item.category || "") + "::" + displayItemName(item.name).toLowerCase();
  }

  function getRowLevel(item) {
    var key = itemDisplayKey(item);
    if (rowLevelSelections[key]) return rowLevelSelections[key];
    return itemLevelBand(item) || "1-10";
  }

  function mergedBonusesForItemAtLevel(item, levelBand) {
    var category = item.category;
    var nameKey = displayItemName(item.name).toLowerCase();
    var band = normalizeLevelBand(levelBand);
    var mergedLines = [];
    var contributors = 0;

    mergeCategoryItems(category).forEach(function (variant) {
      if (displayItemName(variant.name).toLowerCase() !== nameKey) return;
      if (itemLevelBand(variant) !== band) return;
      contributors++;
      var lines = bonusLines(variant);
      if (lines) mergedLines = mergedLines.concat(lines);
    });

    if (mergedLines.length) {
      return {
        generatorId: null,
        generatorType: null,
        rollPcts: null,
        bonuses: mergeBonusEntries(mergedLines),
        communityRollCount: contributors
      };
    }

    var gen = pickGeneratorForItem(category, band, item);
    if (!gen) return null;
    return {
      generatorId: gen.id,
      generatorType: gen.type,
      rollPcts: gen.rollPcts,
      bonuses: mergeBonusEntries(flattenGeneratorBonuses(gen)),
      communityRollCount: 0
    };
  }

  function collapseItemVariants(items) {
    var groups = {};
    var order = [];
    items.forEach(function (item) {
      var key = itemDisplayKey(item);
      if (!groups[key]) {
        groups[key] = [];
        order.push(key);
      }
      groups[key].push(item);
    });

    return order.map(function (key) {
      var variants = groups[key].slice().sort(function (a, b) {
        return String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
      });
      var primary = variants[0];
      return Object.assign({}, primary, {
        communityRollCount: variants.length
      });
    });
  }

  function displayCategoryItems(category) {
    return collapseItemVariants(mergeCategoryItems(category));
  }

  function mergeCategoryItems(category) {
    return communityItems
      .filter(function (item) { return item.category === category; })
      .map(function (item) { return normalizeItem(item, item.category || category); });
  }

  function rebuildVariantLookup(items) {
    variantLookup = {};
  }

  function variantIndex(items, item) {
    return 1;
  }

  function itemIconHtml(item) {
    if (item.iconId && item.iconUrl) {
      var img = '<img class="elumia-db-icon-img" src="' + esc(item.iconUrl) + '" alt="">';
      if (canEditElumia() && item.id) {
        return (
          '<button type="button" class="elumia-db-icon-btn" ' +
            'data-item-id="' + esc(item.id) + '" data-icon-id="' + esc(item.iconId) + '" aria-label="Change icon for ' + esc(item.name) + '">' +
            img +
          "</button>"
        );
      }
      return '<span class="elumia-db-icon-wrap" aria-hidden="true">' + img + "</span>";
    }
    return '<span class="elumia-db-icon" aria-hidden="true">' + iconLabel(item.name) + "</span>";
  }

  function nameCell(item, items) {
    var tag = item.tag ? '<span class="elumia-db-tag">' + esc(item.tag) + "</span>" : "";
    var variant = "";
    if (item.communityRollCount > 1) {
      variant = '<span class="elumia-db-roll-variant">' + item.communityRollCount + " community rolls</span>";
    }
    return (
      '<div class="elumia-db-name">' +
        itemIconHtml(item) +
        "<div>" +
          '<span class="elumia-db-item-link">' + esc(displayItemName(item.name)) + "</span>" +
          variant + tag +
          '<span class="elumia-db-sub">' + esc(item.slot) + "</span>" +
        "</div>" +
      "</div>"
    );
  }

  function sourceCell(item) {
    return (
      '<div class="elumia-db-source">' +
        esc(item.source) +
        '<span class="elumia-db-source-type">' + esc(item.sourceType) + "</span>" +
      "</div>"
    );
  }

  function displayNum(value) {
    return value == null || value === "" ? "—" : value;
  }

  function levelSelectOptions(selectedBand) {
    return LEVEL_BANDS.map(function (band) {
      var sel = normalizeLevelBand(band) === normalizeLevelBand(selectedBand) ? " selected" : "";
      return '<option value="' + band + '"' + sel + ">" + formatLevelBandLabel(band) + "</option>";
    }).join("");
  }

  function pickGeneratorForItem(category, levelBand, item) {
    var gens = findGeneratorsForLevel(category, levelBand);
    if (!gens.length) return null;
    if (category === "armour") {
      var slot = String(item && item.slot || "").toLowerCase();
      if (slot.indexOf("helm") >= 0) {
        return gens.find(function (g) { return g.type.indexOf("Helmet") >= 0; }) || gens[0];
      }
      return gens.find(function (g) { return g.type.indexOf("Armor") >= 0; }) || gens[0];
    }
    if (category === "offhand") {
      var offSlot = String(item && item.slot || "").toLowerCase();
      if (offSlot.indexOf("shield") >= 0) {
        return gens.find(function (g) { return g.type.indexOf("Shield") >= 0; }) || gens[0];
      }
      return gens.find(function (g) { return g.type.indexOf("OffHand") >= 0; }) || gens[0];
    }
    return gens[0];
  }

  function bonusesPayloadForLevel(category, levelBand, item) {
    var gen = pickGeneratorForItem(category, levelBand, item);
    if (!gen) return null;
    var bonuses = flattenGeneratorBonuses(gen);
    return {
      generatorId: gen.id,
      generatorType: gen.type,
      rollPcts: gen.rollPcts ? gen.rollPcts.slice() : emptyRollPcts(),
      bonuses: bonuses
    };
  }

  function levelCell(item, selectedBand) {
    return (
      '<select class="elumia-db-level-select elumia-db-level-select--table" ' +
        'data-display-key="' + esc(itemDisplayKey(item)) + '" ' +
        'data-item-id="' + esc(item.id || "") + '" ' +
        'aria-label="Item level for ' + esc(displayItemName(item.name)) + '">' +
        levelSelectOptions(selectedBand || getRowLevel(item)) +
      "</select>"
    );
  }

  function adminActionsCell(item) {
    if (!showItemActions() || !item.id) return "";
    var editBtn = canEditElumia()
      ? '<button type="button" class="elumia-db-edit-btn btn btn-outline btn-sm" data-item-id="' + esc(item.id) + '" aria-label="Edit ' + esc(item.name) + '">Edit</button>'
      : "";
    var deleteBtn = canDeleteElumia()
      ? '<button type="button" class="elumia-db-delete-btn btn btn-outline btn-sm" data-item-id="' + esc(item.id) + '" aria-label="Delete ' + esc(item.name) + '">Delete</button>'
      : "";
    return (
      '<td class="elumia-db-actions-col">' +
        editBtn +
        deleteBtn +
      "</td>"
    );
  }

  function rngRow(item, items) {
    var viewBand = getRowLevel(item);
    var bonusData = mergedBonusesForItemAtLevel(item, viewBand);
    var rollCount = bonusData && bonusData.communityRollCount ? bonusData.communityRollCount : 0;
    var displayItem = Object.assign({}, item, {
      communityRollCount: rollCount || item.communityRollCount
    });
    return (
      "<tr>" +
        "<td>" + nameCell(displayItem, items) + "</td>" +
        "<td>" + levelCell(item, viewBand) + "</td>" +
        '<td class="num">' + displayNum(ilvlFromLevelBand(viewBand)) + "</td>" +
        '<td class="num">' + displayNum(Math.max(1, ilvlFromLevelBand(viewBand) - 5)) + "</td>" +
        "<td>" + bonusesCell(item, viewBand) + "</td>" +
        "<td>" + esc(item.slot) + "</td>" +
        "<td>" + sourceCell(item) + "</td>" +
        adminActionsCell(item) +
      "</tr>"
    );
  }

  function statRow(item, items) {
    var overall = overallFromItem(item);
    var statText = overall && overall.statSummary ? overall.statSummary : (item.stat || "—");
    var rollText = overall && overall.globalRange ? overall.globalRange : item.roll;
    return (
      "<tr>" +
        "<td>" + nameCell(item, items) + "</td>" +
        '<td class="num">' + displayNum(item.ilvl) + "</td>" +
        '<td class="num">' + displayNum(item.req) + "</td>" +
        "<td>" + esc(statText) + "</td>" +
        "<td>" + esc(item.slot) + "</td>" +
        "<td>" + sourceCell(item) + "</td>" +
        '<td class="num elumia-db-roll">' + esc(rollText) + "</td>" +
        adminActionsCell(item) +
      "</tr>"
    );
  }

  function renderTable(category, query, levelBand) {
    var allItems = displayCategoryItems(category);
    var items = allItems;
    var q = (query || "").toLowerCase();
    if (q) {
      items = items.filter(function (item) {
        var bonusText = "";
        var lines = bonusLines(item);
        if (lines) bonusText = lines.map(function (b) { return b.stat; }).join(" ");
        return item.name.toLowerCase().indexOf(q) >= 0 ||
          item.source.toLowerCase().indexOf(q) >= 0 ||
          item.slot.toLowerCase().indexOf(q) >= 0 ||
          item.rarity.toLowerCase().indexOf(q) >= 0 ||
          formatLevelBandLabel(itemLevelBand(item)).toLowerCase().indexOf(q) >= 0 ||
          bonusText.toLowerCase().indexOf(q) >= 0;
      });
    }

    rebuildVariantLookup(items);

    var colCount = HEADERS[category].length + (showItemActions() ? 1 : 0);
    var headers = HEADERS[category].map(function (h) {
      var num = h === "iLvl" || h === "Req." || h === "Roll %";
      return "<th" + (num ? ' class="num"' : "") + ">" + h + "</th>";
    }).join("");
    if (showItemActions()) headers += '<th class="elumia-db-actions-col">Actions</th>';

    var rowFn = isRngCategory(category) ? rngRow : statRow;
    var emptyMsg = allItems.length
      ? (q ? "No items match your search." : "No items yet — sign in and click Add item to submit the first entry.")
      : "No items yet — sign in and click Add item to submit the first entry.";
    var body = items.length
      ? items.map(function (item) { return rowFn(item, items); }).join("")
      : '<tr><td colspan="' + colCount + '"><div class="elumia-db-empty">' + emptyMsg + "</div></td></tr>";

    return (
      '<table class="elumia-db-table">' +
        "<thead><tr>" + headers + "</tr></thead>" +
        "<tbody>" + body + "</tbody>" +
      "</table>"
    );
  }

  function bonusRowHtml(data, category) {
    data = data || {};
    var quality = data.quality || "common";
    var opts = QUALITIES.map(function (q) {
      return '<option value="' + q.id + '"' + (q.id === quality ? " selected" : "") + ">" + q.label + "</option>";
    }).join("");
    var stats = statsForCategory(category);
    return (
      '<div class="elumia-db-bonus-row">' +
        '<select class="elumia-db-bonus-quality" aria-label="Quality">' + opts + "</select>" +
        statSelectHtml(stats, data.stat || "") +
        '<input type="number" class="elumia-db-bonus-group" placeholder="Group" value="' + (data.group != null ? data.group : "") + '" step="1">' +
        '<input type="number" class="elumia-db-bonus-min" placeholder="Min" value="' + (data.min != null ? data.min : "") + '" step="0.1">' +
        '<input type="number" class="elumia-db-bonus-max" placeholder="Max" value="' + (data.max != null ? data.max : "") + '" step="0.1">' +
        '<button type="button" class="elumia-db-bonus-remove" aria-label="Remove bonus">&times;</button>' +
      "</div>"
    );
  }

  function refreshBonusStatSelects(container, category) {
    if (!container) return;
    var stats = statsForCategory(category);
    container.querySelectorAll(".elumia-db-bonus-row").forEach(function (row) {
      var select = row.querySelector(".elumia-db-bonus-stat");
      if (!select) return;
      var current = select.value;
      select.outerHTML = statSelectHtml(stats, current);
    });
  }

  function readBonusRows(container) {
    var rows = container.querySelectorAll(".elumia-db-bonus-row");
    var bonuses = [];
    rows.forEach(function (row) {
      var stat = row.querySelector(".elumia-db-bonus-stat").value.trim();
      if (!stat) return;
      bonuses.push({
        quality: row.querySelector(".elumia-db-bonus-quality").value,
        stat: stat,
        group: row.querySelector(".elumia-db-bonus-group").value,
        min: row.querySelector(".elumia-db-bonus-min").value,
        max: row.querySelector(".elumia-db-bonus-max").value
      });
    });
    return bonuses;
  }

  function emptyRollPcts() {
    return [null, null, null, null, null, null];
  }

  function setFormIconPreview(iconId) {
    var hidden = document.getElementById("elumia-db-icon-id");
    var previewImg = document.getElementById("elumia-db-icon-preview-img");
    var previewFallback = document.getElementById("elumia-db-icon-preview-fallback");
    var labelEl = document.getElementById("elumia-db-icon-label");
    if (!hidden) return;

    hidden.value = iconId || "";
    var icon = iconId ? lookupIcon(iconId) : null;

    if (icon && previewImg && previewFallback) {
      previewImg.src = icon.url;
      previewImg.alt = icon.label;
      previewImg.hidden = false;
      previewFallback.hidden = true;
      if (labelEl) labelEl.textContent = icon ? displayItemName(icon.label) : "No icon selected";
    } else {
      if (previewImg) {
        previewImg.hidden = true;
        previewImg.removeAttribute("src");
        previewImg.removeAttribute("alt");
      }
      if (previewFallback) {
        previewFallback.hidden = false;
        previewFallback.textContent = "?";
      }
      if (labelEl) labelEl.textContent = "No icon selected";
    }
  }

  function initIconPicker() {
    var modal = document.getElementById("elumia-db-icon-modal");
    var searchInput = document.getElementById("elumia-db-icon-search");
    var grid = document.getElementById("elumia-db-icon-grid");
    var statusEl = document.getElementById("elumia-db-icon-grid-status");
    if (!modal || !grid) return null;

    var callback = null;
    var icons = getIconManifest();

    function closePicker() {
      modal.hidden = true;
      callback = null;
    }

    function renderGrid(query) {
      var q = (query || "").toLowerCase();
      var filtered = q
        ? icons.filter(function (icon) {
            return icon.id.toLowerCase().indexOf(q) >= 0 ||
              (icon.label && icon.label.toLowerCase().indexOf(q) >= 0);
          })
        : icons;

      if (!filtered.length) {
        grid.innerHTML = "";
        if (statusEl) statusEl.textContent = q ? "No icons match your search." : "No icons available.";
        return;
      }

      if (statusEl) {
        statusEl.textContent = filtered.length + " icon" + (filtered.length === 1 ? "" : "s");
      }
      grid.innerHTML = filtered.map(function (icon) {
        return (
          '<button type="button" class="elumia-db-icon-grid-btn" data-icon-id="' + esc(icon.id) + '" title="' + esc(icon.label) + '">' +
            '<img src="' + esc(icon.url) + '" alt="' + esc(icon.label) + '" loading="lazy">' +
            '<span class="elumia-db-icon-grid-label">' + esc(displayItemName(icon.label)) + "</span>" +
          "</button>"
        );
      }).join("");
    }

    function openPicker(onSelect) {
      callback = onSelect;
      if (searchInput) searchInput.value = "";
      renderGrid("");
      modal.hidden = false;
      if (searchInput) searchInput.focus();
    }

    modal.querySelectorAll(".elumia-db-icon-modal-close").forEach(function (btn) {
      btn.addEventListener("click", closePicker);
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closePicker();
    });
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        renderGrid(searchInput.value);
      });
    }
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest(".elumia-db-icon-grid-btn");
      if (!btn || !callback) return;
      callback(btn.getAttribute("data-icon-id"));
      closePicker();
    });

    return { open: openPicker, close: closePicker };
  }

  function initModal(state, iconPicker) {
    var modal = document.getElementById("elumia-db-modal");
    var form = document.getElementById("elumia-db-form");
    var addBtn = document.getElementById("elumia-db-add-btn");
    var modalTitle = document.getElementById("elumia-db-modal-title");
    var submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    var variantNote = document.getElementById("elumia-db-variant-note");
    var statusEl = document.getElementById("elumia-db-form-status");
    var bonusHost = document.getElementById("elumia-db-bonus-rows");
    var addBonusBtn = document.getElementById("elumia-db-add-bonus");
    var generatorSelect = document.getElementById("elumia-db-generator");
    var chooseIconBtn = document.getElementById("elumia-db-choose-icon");
    var openIconPickerBtn = document.getElementById("elumia-db-open-icon-picker");
    if (!modal || !form || !addBtn) return null;

    var editItemId = null;
    var formRollPcts = emptyRollPcts();
    var bonusSourceRows = null;

    function syncFormToBonusSource() {
      if (!bonusHost) return;
      bonusSourceRows = readBonusRows(bonusHost);
    }

    function populateAllBonusRows() {
      if (!bonusHost) return;
      clearBonusRows();
      var rows = bonusSourceRows || [];
      if (rows.length) {
        rows.forEach(function (b) { addBonusRow(b); });
      } else {
        addBonusRow({ quality: "common" });
      }
    }

    function applyGeneratorForLevel(category, levelBand) {
      if (!isRngCategory(category) || !levelBand) return;
      var gen = pickGeneratorForItem(category, levelBand, null);
      if (!gen) return;
      if (generatorSelect) generatorSelect.value = String(gen.id);
      applyGenerator(gen.id);
    }

    function setBonusSourceFromBonuses(bonuses) {
      bonusSourceRows = bonuses && bonuses.bonuses && bonuses.bonuses.length
        ? bonuses.bonuses.map(function (b) {
            return {
              quality: b.quality,
              stat: b.stat,
              group: b.group,
              min: b.min,
              max: b.max
            };
          })
        : null;
    }

    function setCategoryFields(category) {
      form.setAttribute("data-category", category);
      form.category.value = category;
      var levelField = form.querySelector(".elumia-db-field--level");
      if (levelField) {
        var showLevel = isRngCategory(category);
        levelField.hidden = !showLevel;
        if (form.levelBand) {
          form.levelBand.required = showLevel;
          if (showLevel && !form.levelBand.value) form.levelBand.value = "1-10";
        }
      }
      var statLabel = form.querySelector(".elumia-db-field--stat span");
      if (statLabel) {
        if (category === "pets") statLabel.textContent = "Pet ability";
        else if (category === "goods") statLabel.textContent = "Effect";
        else statLabel.textContent = "Primary stat";
      }
    }

    function clearBonusRows() {
      if (!bonusHost) return;
      bonusHost.innerHTML = "";
    }

    function addBonusRow(data) {
      if (!bonusHost) return;
      bonusHost.insertAdjacentHTML("beforeend", bonusRowHtml(data, form.category.value));
    }

    function generatorsForCategory(category) {
      var gens = window.ElumiaRngGenerators || [];
      var filters = {
        weapons: "Weapon",
        armour: function (t) { return t.indexOf("Armor") >= 0 || t.indexOf("Helmet") >= 0; },
        rings: "Ring",
        offhand: function (t) { return t.indexOf("OffHand") >= 0 || t.indexOf("Shield") >= 0; },
        amulet: "Necklace"
      };
      var match = filters[category];
      if (!match) return gens;
      return gens.filter(function (g) {
        if (typeof match === "function") return match(g.type);
        return g.type.indexOf(match) >= 0;
      });
    }

    function populateGenerators(category) {
      if (!generatorSelect) return;
      var gens = generatorsForCategory(category);
      var current = generatorSelect.value;
      generatorSelect.innerHTML = '<option value="">— Optional template —</option>' +
        gens.map(function (g) {
          return '<option value="' + g.id + '">' + esc(g.type) + "</option>";
        }).join("");
      if (current && gens.some(function (g) { return String(g.id) === String(current); })) {
        generatorSelect.value = current;
      }
    }

    function applyGenerator(genId) {
      var gens = window.ElumiaRngGenerators || [];
      var gen = gens.find(function (g) { return String(g.id) === String(genId); });
      if (!gen) return;

      if (form.generatorType) form.generatorType.value = gen.type;
      formRollPcts = gen.rollPcts ? gen.rollPcts.slice() : emptyRollPcts();

      bonusSourceRows = flattenGeneratorBonuses(gen).map(function (slot) {
        return {
          quality: slot.quality,
          stat: slot.stat,
          group: slot.group,
          min: slot.min,
          max: slot.max
        };
      });
      populateAllBonusRows();
    }

    function openFormIconPicker() {
      if (!iconPicker) return;
      var currentId = form.iconId ? form.iconId.value : "";
      iconPicker.open(function (iconId) {
        setFormIconPreview(iconId);
      });
    }

    function setModalMode(mode) {
      var isEdit = mode === "edit";
      if (modalTitle) modalTitle.textContent = isEdit ? "Edit item" : "Add item to database";
      if (submitBtn) submitBtn.textContent = isEdit ? "Save changes" : "Submit item";
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove("tg-modal-open");
      editItemId = null;
      setModalMode("add");
      formRollPcts = emptyRollPcts();
      bonusSourceRows = null;
    }

    function openModal() {
      if (!window.TriumphCommunity) {
        alert("Community features are unavailable.");
        return;
      }

      TriumphCommunity.refreshSession().then(function () {
        if (!TriumphCommunity.getSession()) {
          TriumphCommunity.openAuthModal("login", openModal);
          return;
        }

        editItemId = null;
        setModalMode("add");
        formRollPcts = emptyRollPcts();
        bonusSourceRows = null;
        form.reset();
        setCategoryFields(active);
        setFormIconPreview("");
        clearBonusRows();
        if (isRngCategory(active)) applyGeneratorForLevel(active, form.levelBand.value);
        populateGenerators(active);
        variantNote.hidden = true;
        variantNote.textContent = "";
        statusEl.textContent = "";
        statusEl.className = "elumia-db-form-status";
        modal.hidden = false;
        document.body.classList.add("tg-modal-open");
        form.name.focus();
      });
    }

    function openEditModal(item) {
      if (!window.TriumphCommunity) {
        alert("Community features are unavailable.");
        return;
      }

      TriumphCommunity.refreshSession().then(function () {
        if (!canEditElumia()) {
          alert("Moderator access required to edit items.");
          return;
        }

        var normalized = normalizeItem(item, item.category || active);
        editItemId = normalized.id;
        setModalMode("edit");
        form.reset();
        setCategoryFields(normalized.category || active);
        populateGenerators(normalized.category || active);
        form.name.value = normalized.name || "";
        prefillFromItem(normalized);
        if (form.stat) form.stat.value = normalized.stat || "";
        if (form.roll) {
          form.roll.value = normalized.roll && normalized.roll !== "—" ? normalized.roll : "";
        }
        if (generatorSelect && normalized.bonuses && normalized.bonuses.generatorId != null) {
          generatorSelect.value = String(normalized.bonuses.generatorId);
        }
        variantNote.hidden = true;
        variantNote.textContent = "";
        statusEl.textContent = "";
        statusEl.className = "elumia-db-form-status";
        modal.hidden = false;
        document.body.classList.add("tg-modal-open");
        form.name.focus();
      });
    }

    function findLocalMatch(category, name) {
      var items = mergeCategoryItems(category);
      return items.find(function (item) {
        return item.name.toLowerCase() === name.toLowerCase();
      }) || null;
    }

    function prefillFromItem(item) {
      form.levelBand.value = itemLevelBand(item) || "1-10";
      form.source.value = item.source || "";
      form.sourceType.value = item.sourceType || "";
      setFormIconPreview(item.iconId || "");

      if (item.bonuses) {
        if (form.generatorType) form.generatorType.value = item.bonuses.generatorType || "";
        formRollPcts = item.bonuses.rollPcts ? item.bonuses.rollPcts.slice() : emptyRollPcts();
        setBonusSourceFromBonuses(item.bonuses);
        populateAllBonusRows();
      } else if (isRngCategory(form.category.value)) {
        applyGeneratorForLevel(form.category.value, form.levelBand.value);
      }
    }

    function checkExistingName() {
      if (editItemId) return;
      var category = form.category.value;
      var name = form.name.value.trim();
      if (name.length < 2) {
        variantNote.hidden = true;
        return;
      }

      var local = findLocalMatch(category, name);
      function showVariant(item, sourceLabel) {
        form.levelBand.value = itemLevelBand(item) || form.levelBand.value;
        setBonusSourceFromBonuses(item.bonuses);
        populateAllBonusRows();
        if (form.stat) form.stat.value = item.stat || "";
        variantNote.hidden = false;
        variantNote.textContent =
          '"' + name + '" is already in the ' + sourceLabel +
          ". Add your RNG bonus min/max rolls for this level — each roll appears as its own row.";
      }

      if (local) {
        showVariant(local, "database");
        return;
      }

      if (!window.TriumphAPI || !TriumphAPI.lookupElumiaItem) return;
      TriumphAPI.lookupElumiaItem(category, name).then(function (data) {
        if (data.exists && data.item) showVariant(data.item, "database");
        else variantNote.hidden = true;
      }).catch(function () {});
    }

    addBtn.addEventListener("click", openModal);
    modal.querySelectorAll(".elumia-db-modal-close").forEach(function (btn) {
      btn.addEventListener("click", closeModal);
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });

    if (chooseIconBtn) chooseIconBtn.addEventListener("click", openFormIconPicker);
    if (openIconPickerBtn) openIconPickerBtn.addEventListener("click", openFormIconPicker);

    if (addBonusBtn) {
      addBonusBtn.addEventListener("click", function () {
        addBonusRow({ quality: "common" });
      });
    }

    if (bonusHost) {
      bonusHost.addEventListener("click", function (e) {
        var btn = e.target.closest(".elumia-db-bonus-remove");
        if (!btn) return;
        var row = btn.closest(".elumia-db-bonus-row");
        if (row) row.remove();
      });
    }

    if (generatorSelect) {
      populateGenerators(active);
      generatorSelect.addEventListener("change", function () {
        if (generatorSelect.value) applyGenerator(generatorSelect.value);
      });
    }

    form.category.addEventListener("change", function () {
      setCategoryFields(form.category.value);
      populateGenerators(form.category.value);
      bonusSourceRows = null;
      clearBonusRows();
      if (isRngCategory(form.category.value)) applyGeneratorForLevel(form.category.value, form.levelBand.value);
      checkExistingName();
    });

    form.levelBand.addEventListener("change", function () {
      syncFormToBonusSource();
      if (isRngCategory(form.category.value)) {
        applyGeneratorForLevel(form.category.value, form.levelBand.value);
      }
    });

    form.name.addEventListener("blur", checkExistingName);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      statusEl.textContent = editItemId ? "Saving…" : "Submitting…";
      statusEl.className = "elumia-db-form-status";

      var category = form.category.value;
      var levelBand = form.levelBand ? form.levelBand.value : "1-10";
      var payload = {
        category: category,
        name: stripRarityPrefix(form.name.value.trim()),
        rarity: "common",
        phase: "Early Access",
        source: form.source.value.trim(),
        sourceType: form.sourceType.value.trim(),
        stat: form.stat.value.trim(),
        roll: form.roll.value.trim(),
        iconId: form.iconId ? form.iconId.value.trim() : ""
      };

      if (isRngCategory(category)) {
        payload.ilvl = ilvlFromLevelBand(levelBand);
        payload.req = Math.max(1, payload.ilvl - 5);
        syncFormToBonusSource();
        var bonusList = mergeBonusEntries(
          bonusSourceRows && bonusSourceRows.length
            ? bonusSourceRows
            : (bonusHost ? readBonusRows(bonusHost) : [])
        );
        payload.bonuses = {
          generatorId: generatorSelect && generatorSelect.value ? Number(generatorSelect.value) : null,
          generatorType: form.generatorType ? form.generatorType.value.trim() : "",
          rollPcts: formRollPcts,
          bonuses: bonusList
        };
      }

      if (editItemId) {
        var existing = communityItems.find(function (it) { return String(it.id) === String(editItemId); });
        if (existing) {
          payload.phase = existing.phase || payload.phase;
          payload.slot = existing.slot || "";
        }
      }

      var apiCall = editItemId
        ? TriumphAPI.updateElumiaItem(editItemId, payload)
        : TriumphAPI.submitElumiaItem(payload);

      apiCall.then(function (result) {
        if (editItemId) {
          statusEl.textContent = "Item updated.";
          statusEl.className = "elumia-db-form-status is-success";
          if (result.item) {
            var idx = communityItems.findIndex(function (it) { return String(it.id) === String(editItemId); });
            if (idx >= 0) communityItems[idx] = result.item;
            state.update();
          }
          window.setTimeout(closeModal, 900);
          return;
        }

        if (result.status === "published") {
          statusEl.textContent = result.isVariant
            ? "RNG roll added to the database."
            : "Item published to the database.";
          statusEl.className = "elumia-db-form-status is-success";
          if (result.item) {
            communityItems.push(result.item);
            state.update();
          }
          window.setTimeout(closeModal, 900);
        } else {
          statusEl.textContent = result.isVariant
            ? "RNG roll submitted for review. An admin will approve it soon."
            : "Item submitted for review. An admin will approve it soon.";
          statusEl.className = "elumia-db-form-status is-success";
          window.setTimeout(closeModal, 1400);
        }
      }).catch(function (err) {
        statusEl.textContent = err.message || (editItemId ? "Could not update item." : "Could not submit item.");
        statusEl.className = "elumia-db-form-status is-error";
      });
    });

    return { openEdit: openEditModal };
  }

  function init() {
    var root = document.getElementById("elumia-db-root");
    if (!root) return;

    var searchInput = document.getElementById("elumia-db-search");
    var levelSelect = document.getElementById("elumia-db-level");
    var levelStatsHost = document.getElementById("elumia-db-level-stats");
    var tableHost = document.getElementById("elumia-db-table-host");
    var countEl = document.getElementById("elumia-db-count");
    var footerEl = document.getElementById("elumia-db-footer");
    var tabsEl = document.getElementById("elumia-db-tabs");
    var iconPicker = initIconPicker();

    var levelFilterWrap = document.getElementById("elumia-db-level-filter-wrap");

    var state = {
      update: function () {
        var query = searchInput ? searchInput.value : "";
        var showGearLevels = isRngCategory(active);
        if (levelFilterWrap) levelFilterWrap.hidden = !showGearLevels;
        if (!showGearLevels && levelSelect) levelSelect.value = "";
        activeLevelBand = showGearLevels && levelSelect ? levelSelect.value : "";
        var items = displayCategoryItems(active);
        var q = query.toLowerCase();
        var band = normalizeLevelBand(activeLevelBand);
        var filtered = items;
        if (q) {
          filtered = filtered.filter(function (item) {
              var bonusText = "";
              var lines = bonusLines(item);
              if (lines) bonusText = lines.map(function (b) { return b.stat; }).join(" ");
              return item.name.toLowerCase().indexOf(q) >= 0 ||
                item.source.toLowerCase().indexOf(q) >= 0 ||
                item.slot.toLowerCase().indexOf(q) >= 0 ||
                item.rarity.toLowerCase().indexOf(q) >= 0 ||
                formatLevelBandLabel(itemLevelBand(item)).toLowerCase().indexOf(q) >= 0 ||
                bonusText.toLowerCase().indexOf(q) >= 0;
            });
        }

        if (levelStatsHost) {
          if (band && isRngCategory(active)) {
            levelStatsHost.hidden = false;
            levelStatsHost.innerHTML = renderLevelStatPanel(active, activeLevelBand);
          } else {
            levelStatsHost.hidden = true;
            levelStatsHost.innerHTML = "";
          }
        }

        tableHost.innerHTML = renderTable(active, query, activeLevelBand);
        if (countEl) countEl.textContent = filtered.length + " item" + (filtered.length === 1 ? "" : "s");
        if (footerEl) footerEl.textContent = filtered.length ? "1 – " + filtered.length + " of " + filtered.length : "0 of 0";
      }
    };

    tabsEl.innerHTML = CATEGORIES.map(function (cat) {
      return '<button type="button" class="elumia-db-tab' + (cat.id === active ? " active" : "") + '" data-category="' + cat.id + '">' + cat.label + "</button>";
    }).join("");

    tabsEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".elumia-db-tab");
      if (!btn) return;
      active = btn.getAttribute("data-category");
      tabsEl.querySelectorAll(".elumia-db-tab").forEach(function (t) {
        t.classList.toggle("active", t === btn);
      });
      state.update();
    });

    if (searchInput) searchInput.addEventListener("input", state.update);
    if (levelSelect) levelSelect.addEventListener("change", state.update);

    var modalControls = initModal(state, iconPicker);

    if (tableHost) {
      tableHost.addEventListener("change", function (e) {
        var levelEl = e.target.closest(".elumia-db-level-select--table");
        if (!levelEl) return;

        var displayKey = levelEl.getAttribute("data-display-key");
        var newBand = levelEl.value;
        if (displayKey) rowLevelSelections[displayKey] = newBand;

        if (canEditElumia()) {
          var itemId = levelEl.getAttribute("data-item-id");
          var item = communityItems.find(function (it) { return String(it.id) === String(itemId); });
          if (item && window.TriumphAPI && TriumphAPI.updateElumiaItem) {
            var newIlvl = ilvlFromLevelBand(newBand);
            var bonusPayload = bonusesPayloadForLevel(item.category || active, newBand, item);
            var payload = {
              category: item.category,
              name: item.name,
              rarity: item.rarity || rarityFromName(item.name),
              ilvl: newIlvl,
              req: Math.max(1, newIlvl - 5),
              phase: item.phase || "Early Access",
              slot: item.slot || "",
              source: item.source || "",
              sourceType: item.sourceType || item.source_type || "",
              iconId: item.iconId || item.icon_id || ""
            };
            if (bonusPayload) {
              bonusPayload.bonuses = mergeBonusEntries(bonusPayload.bonuses || []);
              payload.bonuses = bonusPayload;
            }
            levelEl.disabled = true;
            TriumphAPI.updateElumiaItem(itemId, payload).then(function (result) {
              if (result.item) {
                var idx = communityItems.findIndex(function (it) { return String(it.id) === String(itemId); });
                if (idx >= 0) communityItems[idx] = result.item;
              }
              state.update();
            }).catch(function (err) {
              levelEl.disabled = false;
              alert(err.message || "Could not update level.");
            });
            return;
          }
        }

        state.update();
      });

      tableHost.addEventListener("click", function (e) {
        var editBtn = e.target.closest(".elumia-db-edit-btn");
        if (editBtn) {
          var editId = editBtn.getAttribute("data-item-id");
          var editItem = communityItems.find(function (it) { return String(it.id) === String(editId); });
          if (editItem && modalControls && modalControls.openEdit) {
            modalControls.openEdit(editItem);
          }
          return;
        }

        var iconBtn = e.target.closest(".elumia-db-icon-btn");
        if (iconBtn && iconPicker) {
          var itemId = iconBtn.getAttribute("data-item-id");
          iconPicker.open(function (iconId) {
            if (!window.TriumphAPI || !TriumphAPI.updateElumiaItemIcon) return;
            TriumphAPI.updateElumiaItemIcon(itemId, iconId).then(function (result) {
              var idx = communityItems.findIndex(function (it) { return String(it.id) === String(itemId); });
              if (idx >= 0) {
                if (result.item) {
                  Object.assign(communityItems[idx], result.item);
                } else {
                  communityItems[idx].iconId = iconId;
                  var icon = lookupIcon(iconId);
                  communityItems[idx].iconUrl = icon ? icon.url : "";
                }
              }
              state.update();
            }).catch(function (err) {
              alert(err.message || "Could not update icon.");
            });
          });
          return;
        }

        var deleteBtn = e.target.closest(".elumia-db-delete-btn");
        if (deleteBtn) {
          var deleteId = deleteBtn.getAttribute("data-item-id");
          if (!confirm("Delete this item from the database? This cannot be undone.")) return;
          if (!window.TriumphAPI || !TriumphAPI.deleteElumiaItem) return;
          TriumphAPI.deleteElumiaItem(deleteId).then(function () {
            communityItems = communityItems.filter(function (it) { return String(it.id) !== String(deleteId); });
            state.update();
          }).catch(function (err) {
            alert(err.message || "Could not delete item.");
          });
        }
      });
    }

    if (window.TriumphAPI && TriumphAPI.getElumiaItems) {
      TriumphAPI.getElumiaItems().then(function (items) {
        communityItems = items || [];
        state.update();
      }).catch(function () {
        state.update();
      });
    } else {
      state.update();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
