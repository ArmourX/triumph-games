(function () {
  var TEAM_SIZE = 5;
  var ART_SLOTS = 6;
  var MAX_LEGENDARY = 1;
  var MAX_EPIC = 2;
  var MAX_MYTHIC = 1;

  var data = window.BATTLERISE_DATA || { champions: [], artifacts: [] };
  var extras = window.BATTLERISE_CHAMPION_EXTRAS || {};
  var champions = data.champions || [];
  var artifacts = data.artifacts || [];
  var champBySlug = {};
  var artBySlug = {};
  var communitySeed = [];
  var apiPublished = [];
  var apiMine = [];
  var session = null;
  var editingBuildId = null;
  var pendingLoadId = null;

  champions.forEach(function (c) { champBySlug[c.slug] = c; });
  artifacts.forEach(function (a) { artBySlug[a.slug] = a; });

  var state = {
    slots: emptyTeam()
  };
  var pickerState = {
    type: null,
    slotIndex: null,
    artIndex: null,
    filter: "",
    rarity: "all",
    spec: "all"
  };

  function emptyHero() {
    return { champion: "", artifacts: ["", "", "", "", "", ""] };
  }

  function emptyTeam() {
    var slots = [];
    for (var i = 0; i < TEAM_SIZE; i++) slots.push(emptyHero());
    return slots;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function uid() {
    return "brbuild-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function apiBuildToClient(b, source) {
    return {
      id: b.id,
      name: b.name,
      author: b.authorUsername || b.author || "Anonymous",
      tags: b.tags || [],
      description: b.description || "",
      slots: b.slots || [],
      createdAt: b.createdAt,
      source: source
    };
  }

  function refreshBuildsFromApi() {
    var API = window.TriumphAPI;
    if (!API) return Promise.resolve();
    var published = API.listBuilds("published").then(function (rows) {
      apiPublished = rows.map(function (b) { return apiBuildToClient(b, "community"); });
    }).catch(function () { apiPublished = []; });
    if (!session) {
      apiMine = [];
      return published;
    }
    return Promise.all([
      published,
      API.listBuilds("mine").then(function (rows) {
        apiMine = rows.map(function (b) { return apiBuildToClient(b, "mine"); });
      }).catch(function () { apiMine = []; })
    ]);
  }

  function updateAuthorLabel() {
    var el = document.getElementById("brbld-author-label");
    if (el) el.textContent = session ? session.username : "—";
  }

  function showCreateForSession(hasSession) {
    var guest = document.getElementById("brbld-guest");
    var wrap = document.getElementById("brbld-create-wrap");
    if (guest) guest.hidden = !!hasSession;
    if (wrap) wrap.hidden = !hasSession;
  }

  function refreshAuth() {
    var TC = window.TriumphCommunity;
    if (!TC) {
      showCreateForSession(false);
      return Promise.resolve(null);
    }
    return TC.refreshSession().then(function (s) {
      session = s;
      updateAuthorLabel();
      showCreateForSession(!!s);
      return refreshBuildsFromApi().then(function () {
        if (s && pendingLoadId) {
          var id = pendingLoadId;
          pendingLoadId = null;
          loadBuildIntoEditor(id);
        }
        renderBrowse();
        return s;
      });
    });
  }

  function getChamp(slug) {
    return slug ? champBySlug[slug] || null : null;
  }

  function getArt(slug) {
    return slug ? artBySlug[slug] || null : null;
  }

  function rarityKey(r) {
    return String(r || "common").toLowerCase();
  }

  function starCount(rarity) {
    var r = rarityKey(rarity);
    if (r === "legendary") return 10;
    if (r === "epic") return 8;
    if (r === "rare") return 7;
    return 5;
  }

  function champBasePower(c) {
    var r = rarityKey(c && c.rarity);
    if (r === "legendary") return 760;
    if (r === "epic") return 560;
    if (r === "rare") return 480;
    return 360;
  }

  function artPower(a) {
    var r = rarityKey(a && a.rarity);
    var base = r === "mythic" ? 180 : r === "legendary" ? 120 : r === "epic" ? 70 : 35;
    return base + (Number(a && a.level) || 0);
  }

  function heroPower(slot) {
    var c = getChamp(slot.champion);
    if (!c) return 0;
    var total = champBasePower(c);
    (slot.artifacts || []).forEach(function (slug) {
      var a = getArt(slug);
      if (a) total += artPower(a);
    });
    return total;
  }

  function teamPower() {
    return state.slots.reduce(function (sum, slot) {
      return sum + heroPower(slot);
    }, 0);
  }

  function extrasFor(champ) {
    if (!champ) return null;
    return extras[champ.slug] || extras[champ.key] || extras[String(champ.key || "").toLowerCase()] || null;
  }

  function leaderAbility(champ) {
    var extra = extrasFor(champ);
    if (extra && extra.skills && extra.skills.length) {
      return extra.skills[extra.skills.length - 1];
    }
    if (extra && extra.passive) {
      return { name: champ.name + " Aura", description: extra.passive };
    }
    return champ
      ? { name: champ.name + " Presence", description: "Team follows this champion as Leader." }
      : null;
  }

  function countRarity(slot, rarity, skipArtIndex) {
    var n = 0;
    (slot.artifacts || []).forEach(function (slug, i) {
      if (skipArtIndex != null && i === skipArtIndex) return;
      var a = getArt(slug);
      if (a && rarityKey(a.rarity) === rarity) n += 1;
    });
    return n;
  }

  function artifactBlockReason(slot, artIndex, art) {
    if (!art) return "";
    var current = getArt(slot.artifacts[artIndex]);
    if (current && current.slug === art.slug) return "";

    var dup = (slot.artifacts || []).some(function (slug, i) {
      return i !== artIndex && slug === art.slug;
    });
    if (dup) return "Already equipped on this hero";

    var r = rarityKey(art.rarity);
    var replacingSame = current && rarityKey(current.rarity) === r;
    if (r === "legendary" && !replacingSame && countRarity(slot, "legendary", artIndex) >= MAX_LEGENDARY) {
      return "Max 1 Legendary per hero";
    }
    if (r === "epic" && !replacingSame && countRarity(slot, "epic", artIndex) >= MAX_EPIC) {
      return "Max 2 Epics per hero";
    }
    if (r === "mythic" && !replacingSame && countRarity(slot, "mythic", artIndex) >= MAX_MYTHIC) {
      return "Max 1 Mythic per hero";
    }
    return "";
  }

  function championTaken(slug, exceptIndex) {
    if (!slug) return false;
    return state.slots.some(function (slot, i) {
      return i !== exceptIndex && slot.champion === slug;
    });
  }

  function roleLabel(role) {
    if (!role) return "";
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  function starsHtml(rarity) {
    var on = starCount(rarity);
    var html = "";
    for (var i = 0; i < 10; i++) {
      html += '<span class="' + (i < on ? "is-on" : "") + '">&#9733;</span>';
    }
    return html;
  }

  function renderTeam() {
    var host = document.getElementById("brbld-team");
    if (!host) return;
    host.innerHTML = state.slots.map(function (slot, index) {
      return heroCardHtml(slot, index);
    }).join("");
    renderFooter();
  }

  function heroCardHtml(slot, index) {
    var champ = getChamp(slot.champion);
    var isLeader = index === 0;
    var power = heroPower(slot);
    var portrait = champ
      ? '<img class="brbld-portrait" src="' + esc(champ.portrait) + '" alt="' + esc(champ.name) + '">'
      : '<div class="brbld-portrait-empty">Tap to select</div>';
    var arts = [];
    for (var i = 0; i < ART_SLOTS; i++) {
      var art = getArt(slot.artifacts[i]);
      var rClass = art ? " brbld-art--" + rarityKey(art.rarity) : "";
      var inner = art
        ? '<img src="' + esc(art.cardImage || art.image) + '" alt="' + esc(art.name) + '">'
        : '<span class="brbld-art-empty">+</span>';
      arts.push(
        '<button type="button" class="brbld-art' + rClass + '" data-hero="' + index + '" data-art="' + i + '" title="' +
          esc(art ? art.name + " (" + art.rarity + ")" : "Select artifact " + (i + 1)) + '">' +
          inner +
        "</button>"
      );
    }

    return (
      '<article class="brbld-hero' + (isLeader ? " is-leader" : "") + '">' +
        '<div class="brbld-stars">' + (champ ? starsHtml(champ.rarity) : "") + "</div>" +
        '<button type="button" class="brbld-portrait-wrap" data-hero="' + index + '" aria-label="' +
          (champ ? "Change " + esc(champ.name) : "Select champion for slot " + (index + 1)) + '">' +
          '<div class="brbld-frame">' +
            portrait +
            (isLeader && champ ? '<span class="brbld-leader-banner">Leader</span>' : "") +
            (champ ? '<span class="brbld-level">' + esc(champ.rarity === "Legendary" ? 30 : champ.rarity === "Epic" ? 24 : champ.rarity === "Rare" ? 20 : 16) + "</span>" : "") +
            (champ ? '<span class="brbld-hero-power">' + power + "</span>" : "") +
          "</div>" +
          '<div class="brbld-nameplate">' + esc(champ ? champ.name : (isLeader ? "Leader slot" : "Empty slot")) + "</div>" +
        "</button>" +
        (champ
          ? '<div class="brbld-hero-meta">' +
              '<span class="br-meta-pill br-meta-pill--' + rarityKey(champ.rarity) + '">' + esc(champ.rarity) + "</span>" +
              '<span class="br-meta-pill br-meta-pill--' + rarityKey(champ.spec) + '">' + esc(champ.spec) + "</span>" +
            "</div>"
          : "") +
        '<div class="brbld-arts">' + arts.join("") + "</div>" +
      "</article>"
    );
  }

  function renderFooter() {
    var leader = getChamp(state.slots[0].champion);
    var ability = leaderAbility(leader);
    var nameEl = document.getElementById("brbld-leader-name");
    if (nameEl) {
      nameEl.textContent = ability ? ability.name : "Select a leader";
      nameEl.title = ability && ability.description ? ability.description : "";
    }
    var powerEl = document.getElementById("brbld-team-power");
    if (powerEl) powerEl.textContent = String(teamPower());

    var filled = state.slots.filter(function (s) { return s.champion; }).length;
    var chips = document.getElementById("brbld-rule-chips");
    if (chips) {
      chips.innerHTML =
        '<span class="brbld-chip">' + filled + " / 5 champions</span>" +
        '<span class="brbld-chip">1 Legendary / hero</span>' +
        '<span class="brbld-chip">2 Epics / hero</span>' +
        '<span class="brbld-chip">1 Mythic / hero</span>';
    }
  }

  function openChampionPicker(slotIndex) {
    pickerState.type = "champion";
    pickerState.slotIndex = slotIndex;
    pickerState.artIndex = null;
    pickerState.filter = "";
    pickerState.rarity = "all";
    pickerState.spec = "all";
    var title = document.getElementById("brbld-picker-title");
    var kicker = document.getElementById("brbld-picker-kicker");
    var search = document.getElementById("brbld-picker-search");
    if (kicker) kicker.textContent = slotIndex === 0 ? "Leader slot" : "Champion slot " + (slotIndex + 1);
    if (title) title.textContent = "Select champion";
    if (search) {
      search.value = "";
      search.placeholder = "Search champions…";
    }
    renderPickerFilters();
    renderPickerGrid();
    showPicker();
  }

  function openArtifactPicker(slotIndex, artIndex) {
    if (!state.slots[slotIndex].champion) {
      openChampionPicker(slotIndex);
      showSaveMsg("Pick a champion for this slot first.");
      return;
    }
    pickerState.type = "artifact";
    pickerState.slotIndex = slotIndex;
    pickerState.artIndex = artIndex;
    pickerState.filter = "";
    pickerState.rarity = "all";
    pickerState.spec = "all";
    var champ = getChamp(state.slots[slotIndex].champion);
    var title = document.getElementById("brbld-picker-title");
    var kicker = document.getElementById("brbld-picker-kicker");
    var search = document.getElementById("brbld-picker-search");
    if (kicker) kicker.textContent = (champ ? champ.name : "Hero") + " · artifact " + (artIndex + 1);
    if (title) title.textContent = "Select artifact";
    if (search) {
      search.value = "";
      search.placeholder = "Search artifacts…";
    }
    renderPickerFilters();
    renderPickerGrid();
    showPicker();
  }

  function showPicker() {
    var dialog = document.getElementById("brbld-picker-dialog");
    if (dialog && !dialog.open) dialog.showModal();
    var grid = document.getElementById("brbld-picker-grid");
    if (grid) {
      grid.scrollTop = 0;
      grid.focus({ preventScroll: true });
    }
  }

  function closePicker() {
    var dialog = document.getElementById("brbld-picker-dialog");
    pickerState.type = null;
    if (dialog && dialog.open) dialog.close();
  }

  function renderPickerFilters() {
    var host = document.getElementById("brbld-picker-filters");
    if (!host) return;
    var rarityOpts = pickerState.type === "champion"
      ? [["all", "All"], ["legendary", "Legendary"], ["epic", "Epic"], ["rare", "Rare"], ["common", "Common"]]
      : [["all", "All"], ["mythic", "Mythic"], ["legendary", "Legendary"], ["epic", "Epic"], ["rare", "Rare"]];
    var specOpts = [["all", "All specs"], ["str", "STR"], ["agi", "AGI"], ["int", "INT"]];
    if (pickerState.type === "champion") {
      specOpts = specOpts.concat([["attacker", "Attacker"], ["defender", "Defender"], ["support", "Support"]]);
    }

    host.innerHTML =
      rarityOpts.map(function (opt) {
        return '<button type="button" class="brbld-filter-btn' + (pickerState.rarity === opt[0] ? " active" : "") +
          '" data-filter-kind="rarity" data-filter-value="' + opt[0] + '">' + opt[1] + "</button>";
      }).join("") +
      specOpts.map(function (opt) {
        return '<button type="button" class="brbld-filter-btn' + (pickerState.spec === opt[0] ? " active" : "") +
          '" data-filter-kind="spec" data-filter-value="' + opt[0] + '">' + opt[1] + "</button>";
      }).join("");
  }

  function matchesQuery(hay, q) {
    if (!q) return true;
    return hay.toLowerCase().indexOf(q.toLowerCase()) >= 0;
  }

  function renderPickerGrid() {
    var grid = document.getElementById("brbld-picker-grid");
    var countEl = document.getElementById("brbld-picker-count");
    var ruleEl = document.getElementById("brbld-picker-rule");
    if (!grid || !pickerState.type) return;

    if (pickerState.type === "champion") {
      if (ruleEl) {
        ruleEl.hidden = true;
        ruleEl.textContent = "";
      }
      var all = champions.slice().sort(function (a, b) {
        var order = { legendary: 0, epic: 1, rare: 2, common: 3 };
        var ra = order[rarityKey(a.rarity)] != null ? order[rarityKey(a.rarity)] : 9;
        var rb = order[rarityKey(b.rarity)] != null ? order[rarityKey(b.rarity)] : 9;
        if (ra !== rb) return ra - rb;
        return a.name.localeCompare(b.name);
      });
      var list = all.filter(function (c) {
        if (pickerState.rarity !== "all" && rarityKey(c.rarity) !== pickerState.rarity) return false;
        if (pickerState.spec !== "all") {
          if (["str", "agi", "int"].indexOf(pickerState.spec) >= 0 && rarityKey(c.spec) !== pickerState.spec) return false;
          if (["attacker", "defender", "support"].indexOf(pickerState.spec) >= 0 && c.role !== pickerState.spec) return false;
        }
        return matchesQuery([c.name, c.faction, c.spec, c.role, c.rarity].join(" "), pickerState.filter);
      });
      if (countEl) countEl.textContent = list.length + " of " + all.length + " champions";
      if (!list.length) {
        grid.innerHTML = '<p class="brbld-picker-empty">No champions match your search.</p>';
        return;
      }
      var selected = state.slots[pickerState.slotIndex].champion;
      grid.innerHTML = list.map(function (c) {
        var taken = championTaken(c.slug, pickerState.slotIndex);
        var cls = "brbld-picker-item";
        if (c.slug === selected) cls += " is-selected";
        if (taken) cls += " is-disabled";
        return (
          '<button type="button" class="' + cls + '" data-champ="' + esc(c.slug) + '"' +
            (taken ? ' disabled title="Already on this team"' : "") + ">" +
            '<div class="brbld-picker-item-icon"><img src="' + esc(c.portrait) + '" alt=""></div>' +
            '<span class="brbld-picker-item-name brbld-rarity--' + rarityKey(c.rarity) + '">' + esc(c.name) + "</span>" +
            '<span class="brbld-picker-item-meta">' + esc(c.rarity) + " · " + esc(c.spec) + " · " + esc(roleLabel(c.role)) + "</span>" +
          "</button>"
        );
      }).join("");
      return;
    }

    var slot = state.slots[pickerState.slotIndex];
    var artAll = artifacts.slice().sort(function (a, b) {
      var order = { mythic: 0, legendary: 1, epic: 2, rare: 3 };
      var ra = order[rarityKey(a.rarity)] != null ? order[rarityKey(a.rarity)] : 9;
      var rb = order[rarityKey(b.rarity)] != null ? order[rarityKey(b.rarity)] : 9;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
    var artList = artAll.filter(function (a) {
      if (pickerState.rarity !== "all" && rarityKey(a.rarity) !== pickerState.rarity) return false;
      if (pickerState.spec !== "all" && rarityKey(a.spec) !== pickerState.spec && a.spec !== "NONE") return false;
      if (pickerState.spec !== "all" && a.spec === "NONE" && pickerState.spec !== "all") {
        /* keep NONE artifacts visible in spec filters so generic gear stays selectable */
      }
      return matchesQuery([a.name, a.rarity, a.spec, a.gearTypeLabel].join(" "), pickerState.filter);
    });
    if (countEl) countEl.textContent = artList.length + " of " + artAll.length + " artifacts";
    var blocked = 0;
    grid.innerHTML = artList.map(function (a) {
      var reason = artifactBlockReason(slot, pickerState.artIndex, a);
      if (reason) blocked += 1;
      var selected = slot.artifacts[pickerState.artIndex] === a.slug;
      var cls = "brbld-picker-item";
      if (selected) cls += " is-selected";
      if (reason) cls += " is-disabled";
      return (
        '<button type="button" class="' + cls + '" data-art="' + esc(a.slug) + '"' +
          (reason ? ' data-blocked="' + esc(reason) + '" title="' + esc(reason) + '"' : "") + ">" +
          '<div class="brbld-picker-item-icon is-art"><img src="' + esc(a.cardImage || a.image) + '" alt=""></div>' +
          '<span class="brbld-picker-item-name brbld-rarity--' + rarityKey(a.rarity) + '">' + esc(a.name) + "</span>" +
          '<span class="brbld-picker-item-meta">' + esc(a.rarity) + " · " + esc(a.gearTypeLabel || "Artifact") + "</span>" +
        "</button>"
      );
    }).join("");
    if (ruleEl) {
      ruleEl.hidden = blocked === 0;
      ruleEl.textContent = blocked
        ? blocked + " artifacts locked by the 1 Legendary / 2 Epic / 1 Mythic rule (or already equipped)."
        : "";
    }
    if (!artList.length) {
      grid.innerHTML = '<p class="brbld-picker-empty">No artifacts match your search.</p>';
    }
  }

  function selectChampion(slug) {
    if (pickerState.slotIndex == null) return;
    if (slug && championTaken(slug, pickerState.slotIndex)) return;
    var prev = state.slots[pickerState.slotIndex].champion;
    state.slots[pickerState.slotIndex].champion = slug || "";
    if (prev !== slug) {
      state.slots[pickerState.slotIndex].artifacts = ["", "", "", "", "", ""];
    }
    renderTeam();
    closePicker();
  }

  function selectArtifact(slug) {
    if (pickerState.slotIndex == null || pickerState.artIndex == null) return;
    var slot = state.slots[pickerState.slotIndex];
    if (slug) {
      var art = getArt(slug);
      var reason = artifactBlockReason(slot, pickerState.artIndex, art);
      if (reason) {
        showSaveMsg(reason);
        return;
      }
    }
    slot.artifacts[pickerState.artIndex] = slug || "";
    renderTeam();
    closePicker();
  }

  function setView(view) {
    var create = document.getElementById("brbld-create");
    var community = document.getElementById("brbld-community");
    document.querySelectorAll(".brbld-tab").forEach(function (btn) {
      var active = btn.getAttribute("data-view") === view;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (create) create.hidden = view !== "create";
    if (community) community.hidden = view !== "community";
    if (view === "community") renderBrowse();
    if (view === "create" && !session) showCreateForSession(false);
    if (location.hash.replace("#", "") !== view) {
      history.replaceState(null, "", "#" + view);
    }
  }

  function tagClass(tag) {
    var t = String(tag).toLowerCase();
    if (t === "pve") return "brbld-build-tag brbld-build-tag--pve";
    if (t === "pvp") return "brbld-build-tag brbld-build-tag--pvp";
    return "brbld-build-tag brbld-build-tag--hybrid";
  }

  function allBuilds() {
    var seed = (communitySeed || []).map(function (b) {
      return Object.assign({}, b, { source: b.source || "community" });
    });
    var publishedIds = {};
    apiPublished.forEach(function (b) { publishedIds[b.id] = true; });
    var mineOnly = apiMine.filter(function (b) { return !publishedIds[b.id]; });
    return seed.concat(apiPublished, mineOnly);
  }

  function filteredBuilds() {
    var q = String((document.getElementById("brbld-browse-search") || {}).value || "").trim().toLowerCase();
    var tag = (document.getElementById("brbld-browse-tag") || {}).value || "";
    var source = (document.getElementById("brbld-browse-source") || {}).value || "";
    return allBuilds().filter(function (b) {
      if (source && b.source !== source) return false;
      if (tag && (!b.tags || b.tags.indexOf(tag) < 0)) return false;
      if (q) {
        var names = (b.slots || []).map(function (s) {
          var c = getChamp(s.champion);
          return c ? c.name : "";
        }).join(" ");
        var hay = [b.name, b.author, b.description, names, (b.tags || []).join(" ")].join(" ").toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    }).sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }

  function filledCount(build) {
    return (build.slots || []).filter(function (s) { return s.champion; }).length;
  }

  function renderBrowse() {
    var grid = document.getElementById("brbld-build-grid");
    var empty = document.getElementById("brbld-build-empty");
    var countEl = document.getElementById("brbld-browse-count");
    var builds = filteredBuilds();
    if (countEl) countEl.textContent = builds.length + " build" + (builds.length === 1 ? "" : "s");
    if (empty) empty.hidden = builds.length > 0;
    if (!grid) return;

    grid.innerHTML = builds.map(function (b) {
      var sourceLabel = b.source === "mine" ? "My build" : "Community";
      var sourceCls = b.source === "mine" ? "brbld-build-source brbld-build-source--mine" : "brbld-build-source";
      var tags = (b.tags || []).map(function (t) {
        return '<span class="' + tagClass(t) + '">' + esc(t) + "</span>";
      }).join("");
      var portraits = (b.slots || []).map(function (s) {
        var c = getChamp(s.champion);
        return c
          ? '<img src="' + esc(c.portrait) + '" alt="' + esc(c.name) + '" title="' + esc(c.name) + '">'
          : "<span></span>";
      }).join("");

      return (
        '<article class="brbld-build-card" data-build-id="' + esc(b.id) + '">' +
          '<div class="brbld-build-card-head">' +
            '<h3 class="brbld-build-card-title">' + esc(b.name) + "</h3>" +
            '<span class="' + sourceCls + '">' + esc(sourceLabel) + "</span>" +
          "</div>" +
          '<p class="brbld-build-meta">' + esc(b.author || "Anonymous") + " · " + filledCount(b) + "/5 champions</p>" +
          '<div class="brbld-build-portraits">' + portraits + "</div>" +
          '<div class="brbld-build-tags">' + (tags || '<span class="brbld-build-tag brbld-build-tag--hybrid">Untagged</span>') + "</div>" +
          '<div class="brbld-build-card-actions">' +
            '<button type="button" class="btn btn-outline brbld-view-build" data-build-id="' + esc(b.id) + '">View</button>' +
            '<button type="button" class="btn btn-primary brbld-load-build" data-build-id="' + esc(b.id) + '">Load</button>' +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  function findBuild(id) {
    return allBuilds().find(function (b) { return b.id === id; }) || null;
  }

  function openBuildDetail(id) {
    var build = findBuild(id);
    var dialog = document.getElementById("brbld-detail-dialog");
    var host = document.getElementById("brbld-detail-content");
    if (!build || !dialog || !host) return;

    var heroes = (build.slots || []).map(function (slot, i) {
      var c = getChamp(slot.champion);
      var arts = (slot.artifacts || []).map(function (slug) {
        var a = getArt(slug);
        return a
          ? '<span class="brbld-rarity--' + rarityKey(a.rarity) + '">' + esc(a.name) + "</span>"
          : "—";
      }).join(" · ");
      return (
        '<div class="brbld-detail-hero">' +
          "<strong>" + (i === 0 ? "Leader · " : "") + esc(c ? c.name : "Empty") + "</strong>" +
          '<div class="brbld-detail-arts">' + arts + "</div>" +
        "</div>"
      );
    }).join("");

    var tags = (build.tags || []).map(function (t) {
      return '<span class="' + tagClass(t) + '">' + esc(t) + "</span>";
    }).join(" ");

    host.innerHTML =
      '<h2 class="brbld-detail-title">' + esc(build.name) + "</h2>" +
      '<p class="brbld-detail-sub">' + esc(build.author || "Anonymous") + " · " + filledCount(build) + "/5 champions</p>" +
      '<div class="brbld-build-tags" style="margin-bottom:1rem">' + tags + "</div>" +
      heroes +
      (build.description ? '<p class="brbld-detail-sub">' + esc(build.description) + "</p>" : "") +
      '<div style="margin-top:1rem;display:flex;gap:0.5rem">' +
        '<button type="button" class="btn btn-primary" id="brbld-detail-load">Load in editor</button>' +
        (build.source === "mine"
          ? '<button type="button" class="btn btn-outline" id="brbld-detail-delete">Delete</button>'
          : "") +
      "</div>";

    var loadBtn = document.getElementById("brbld-detail-load");
    if (loadBtn) {
      loadBtn.addEventListener("click", function () {
        dialog.close();
        loadBuildIntoEditor(build.id);
      });
    }
    var delBtn = document.getElementById("brbld-detail-delete");
    if (delBtn) {
      delBtn.addEventListener("click", function () {
        deleteMyBuild(build.id);
        dialog.close();
        renderBrowse();
      });
    }
    dialog.showModal();
  }

  function cloneSlots(slots) {
    return (slots || emptyTeam()).map(function (s) {
      return {
        champion: s.champion || "",
        artifacts: (s.artifacts || ["", "", "", "", "", ""]).slice(0, ART_SLOTS)
      };
    }).concat(emptyTeam()).slice(0, TEAM_SIZE);
  }

  function loadBuildIntoEditor(id) {
    if (!session) {
      pendingLoadId = id;
      setView("create");
      if (window.TriumphCommunity) window.TriumphCommunity.openAuthModal("login", refreshAuth);
      return;
    }
    var build = findBuild(id);
    if (!build) return;
    editingBuildId = build.source === "mine" ? build.id : null;
    state.slots = cloneSlots(build.slots);
    if (build.name) document.getElementById("brbld-name").value = build.name;
    if (build.description) document.getElementById("brbld-notes").value = build.description;
    document.querySelectorAll('input[name="brbld-tag"]').forEach(function (cb) {
      cb.checked = (build.tags || []).indexOf(cb.value) >= 0;
    });
    renderTeam();
    setView("create");
    showSaveMsg('Loaded "' + build.name + '" into the editor.');
  }

  function currentBuildPayload() {
    var tags = [];
    document.querySelectorAll('input[name="brbld-tag"]:checked').forEach(function (cb) {
      tags.push(cb.value);
    });
    return {
      name: String(document.getElementById("brbld-name").value || "").trim(),
      tags: tags,
      description: String(document.getElementById("brbld-notes").value || "").trim(),
      slots: cloneSlots(state.slots)
    };
  }

  function showSaveMsg(text) {
    var el = document.getElementById("brbld-save-msg");
    if (el) {
      el.textContent = text;
      setTimeout(function () { if (el.textContent === text) el.textContent = ""; }, 4200);
    }
  }

  function saveMyBuild(ev) {
    ev.preventDefault();
    if (!session) {
      if (window.TriumphCommunity) window.TriumphCommunity.openAuthModal("login", refreshAuth);
      return;
    }
    var payload = currentBuildPayload();
    if (!payload.name) return;
    if (!payload.tags.length) {
      showSaveMsg("Pick at least one build type (PvE / PvP / Hybrid).");
      return;
    }
    if (!filledCount(payload)) {
      showSaveMsg("Select at least one champion before saving.");
      return;
    }
    var API = window.TriumphAPI;
    if (!API) {
      showSaveMsg("Could not reach the server. Try again later.");
      return;
    }
    var saveBtn = document.querySelector("#brbld-save-form button[type=submit]");
    if (saveBtn) saveBtn.disabled = true;
    var req = editingBuildId
      ? API.updateBuild(editingBuildId, payload)
      : API.createBuild(payload);
    req.then(function () {
      editingBuildId = null;
      return refreshBuildsFromApi();
    }).then(function () {
      showSaveMsg("Build saved and published to the community.");
      renderBrowse();
    }).catch(function (err) {
      showSaveMsg((err && err.message) || "Save failed. Sign in and try again.");
    }).finally(function () {
      if (saveBtn) saveBtn.disabled = false;
    });
  }

  function deleteMyBuild(id) {
    var API = window.TriumphAPI;
    if (!API || !session) return Promise.resolve();
    return API.deleteBuild(id).then(function () {
      if (editingBuildId === id) editingBuildId = null;
      return refreshBuildsFromApi();
    }).then(renderBrowse).catch(function (err) {
      showSaveMsg((err && err.message) || "Could not delete build.");
    });
  }

  function bindControls() {
    var team = document.getElementById("brbld-team");
    if (team) {
      team.addEventListener("click", function (ev) {
        var artBtn = ev.target.closest(".brbld-art");
        if (artBtn) {
          openArtifactPicker(Number(artBtn.getAttribute("data-hero")), Number(artBtn.getAttribute("data-art")));
          return;
        }
        var heroBtn = ev.target.closest(".brbld-portrait-wrap");
        if (heroBtn) openChampionPicker(Number(heroBtn.getAttribute("data-hero")));
      });
    }

    document.querySelectorAll(".brbld-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setView(btn.getAttribute("data-view"));
      });
    });

    document.getElementById("brbld-save-form").addEventListener("submit", saveMyBuild);
    var loginBtn = document.getElementById("brbld-login");
    if (loginBtn) {
      loginBtn.addEventListener("click", function () {
        if (window.TriumphCommunity) window.TriumphCommunity.openAuthModal("login", refreshAuth);
      });
    }
    document.getElementById("brbld-clear-team").addEventListener("click", function () {
      state.slots = emptyTeam();
      editingBuildId = null;
      renderTeam();
      showSaveMsg("Team cleared.");
    });

    ["brbld-browse-search", "brbld-browse-tag", "brbld-browse-source"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", renderBrowse);
        el.addEventListener("change", renderBrowse);
      }
    });

    var grid = document.getElementById("brbld-picker-grid");
    var search = document.getElementById("brbld-picker-search");
    var filters = document.getElementById("brbld-picker-filters");
    var dialog = document.getElementById("brbld-picker-dialog");

    if (search) {
      search.addEventListener("input", function () {
        pickerState.filter = String(search.value || "").trim();
        renderPickerGrid();
      });
    }
    if (filters) {
      filters.addEventListener("click", function (ev) {
        var btn = ev.target.closest("[data-filter-kind]");
        if (!btn) return;
        var kind = btn.getAttribute("data-filter-kind");
        var value = btn.getAttribute("data-filter-value");
        if (kind === "rarity") pickerState.rarity = value;
        if (kind === "spec") pickerState.spec = value;
        renderPickerFilters();
        renderPickerGrid();
      });
    }
    if (grid) {
      grid.addEventListener("click", function (ev) {
        var champBtn = ev.target.closest("[data-champ]");
        if (champBtn && !champBtn.disabled) {
          selectChampion(champBtn.getAttribute("data-champ"));
          return;
        }
        var artBtn = ev.target.closest("[data-art]");
        if (artBtn) selectArtifact(artBtn.getAttribute("data-art"));
      });
      grid.addEventListener("wheel", function (ev) {
        var maxScroll = grid.scrollHeight - grid.clientHeight;
        if (maxScroll <= 0) return;
        var atTop = grid.scrollTop <= 0 && ev.deltaY < 0;
        var atBottom = grid.scrollTop >= maxScroll && ev.deltaY > 0;
        if (atTop || atBottom) ev.preventDefault();
      }, { passive: false });
    }

    document.getElementById("brbld-picker-close").addEventListener("click", closePicker);
    document.getElementById("brbld-picker-clear").addEventListener("click", function () {
      if (pickerState.type === "champion") selectChampion("");
      else selectArtifact("");
    });
    if (dialog) {
      dialog.addEventListener("click", function (ev) {
        if (ev.target === dialog) closePicker();
      });
    }

    document.getElementById("brbld-detail-close").addEventListener("click", function () {
      document.getElementById("brbld-detail-dialog").close();
    });

    var browse = document.getElementById("brbld-build-grid");
    if (browse) {
      browse.addEventListener("click", function (ev) {
        var viewBtn = ev.target.closest(".brbld-view-build");
        if (viewBtn) {
          openBuildDetail(viewBtn.getAttribute("data-build-id"));
          return;
        }
        var loadBtn = ev.target.closest(".brbld-load-build");
        if (loadBtn) loadBuildIntoEditor(loadBtn.getAttribute("data-build-id"));
      });
    }
  }

  function initFromHash() {
    var view = (location.hash || "#create").replace("#", "");
    setView(view === "community" ? "community" : "create");
  }

  function loadCommunity() {
    return fetch("data/battlerise-community-builds.json")
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; });
  }

  loadCommunity().then(function (seed) {
    communitySeed = seed || [];
    bindControls();
    renderTeam();
    window.addEventListener("hashchange", initFromHash);
    initFromHash();
    refreshAuth();
  });
})();
