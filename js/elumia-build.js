(function () {
  var STORAGE_MINE = "elumia-builds-mine";
  var STORAGE_LOCAL = "elumia-builds-shared-local";

  var SLOTS = [
    { id: "weapon", label: "Weapon", slot: "Weapon", category: "weapons" },
    { id: "offhand", label: "Off-hand", slot: "Off-hand", category: "offhand" },
    { id: "chest", label: "Chest", slot: "Chest", category: "armour" },
    { id: "helmet", label: "Helmet", slot: "Helmet", category: "armour" },
    { id: "amulet", label: "Amulet", slot: "Amulet", category: "amulet" },
    { id: "ring1", label: "Ring 1", slot: "Ring", category: "rings" },
    { id: "ring2", label: "Ring 2", slot: "Ring", category: "rings" },
    { id: "ring3", label: "Ring 3", slot: "Ring", category: "rings" },
    { id: "ring4", label: "Ring 4", slot: "Ring", category: "rings" }
  ];

  var catalog = null;
  var itemById = {};
  var communitySeed = [];
  var state = {
    class: "Champion",
    items: {}
  };
  var pickerState = {
    slotId: null,
    filter: ""
  };
  var slotDefById = {};
  SLOTS.forEach(function (s) { slotDefById[s.id] = s; });

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function uid() {
    return "build-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function readJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function isClassLockedSlot(slotDef) {
    return slotDef.category !== "amulet" && slotDef.category !== "rings";
  }

  function itemsForSlot(slotDef) {
    if (!catalog) return [];
    return catalog.items.filter(function (it) {
      if (it.category !== slotDef.category || it.slot !== slotDef.slot) return false;
      if (isClassLockedSlot(slotDef)) {
        return it.class === state.class;
      }
      return it.class === "Any";
    });
  }

  function clearIncompatibleItems() {
    SLOTS.forEach(function (slotDef) {
      if (!isClassLockedSlot(slotDef)) return;
      var item = getItem(state.items[slotDef.id]);
      if (item && item.class !== state.class) {
        state.items[slotDef.id] = "";
      }
    });
  }

  function compareItems(a, b) {
    if (Number(b.starRank) !== Number(a.starRank)) return Number(b.starRank) - Number(a.starRank);
    if (Number(b.masterwork) !== Number(a.masterwork)) return Number(b.masterwork) - Number(a.masterwork);
    if (a.class !== b.class) return String(a.class).localeCompare(String(b.class));
    return String(a.baseName).localeCompare(String(b.baseName));
  }

  function getItem(id) {
    return id ? itemById[id] || null : null;
  }

  function rarityClass(r) {
    return "elumia-db-rarity--" + esc(r || "common");
  }

  function iconHtml(item) {
    if (!item || !item.iconUrl) {
      return '<span class="ebld-picker-icon-fallback">?</span>';
    }
    return '<img src="' + esc(item.iconUrl) + '" alt="" loading="lazy">';
  }

  function itemMetaLine(item) {
    var parts = [];
    if (item.class && item.class !== "Any") parts.push(item.class);
    parts.push("Lv" + item.level);
    parts.push("IP " + item.ip);
    return parts.join(" · ");
  }

  function filterPickerItems(items, q) {
    if (!q) return items;
    q = q.toLowerCase();
    return items.filter(function (it) {
      var hay = [
        it.baseName, it.name, it.class, it.starName, it.masterworkName,
        it.stars, it.rarityLabel, String(it.ip), String(it.level)
      ].join(" ").toLowerCase();
      return hay.indexOf(q) >= 0;
    });
  }

  function pickerItemHtml(item, selected) {
    return (
      '<button type="button" class="ebld-picker-item' + (selected ? " is-selected" : "") + '" data-item-id="' + esc(item.id) + '">' +
        '<div class="ebld-picker-item-icon">' + iconHtml(item) + "</div>" +
        '<span class="ebld-picker-item-name ' + rarityClass(item.rarity) + '">' + esc(item.baseName) + "</span>" +
        '<span class="ebld-picker-item-meta">' + esc(item.stars) + " " + esc(item.masterworkName) + "</span>" +
        '<span class="ebld-picker-item-meta">' + esc(itemMetaLine(item)) + "</span>" +
      "</button>"
    );
  }

  function slotPickerHtml(slotDef, item) {
    var empty = !item;
    var body = empty
      ? '<span class="ebld-slot-picker-name">Select ' + esc(slotDef.label.toLowerCase()) + "</span>"
      : (
          '<span class="ebld-slot-picker-name">' + esc(item.masterworkName) + " " + esc(item.stars) + " " + esc(item.baseName) + "</span>" +
          '<span class="ebld-slot-picker-meta">' + esc(itemMetaLine(item)) + "</span>" +
          '<span class="ebld-slot-picker-meta">' + (item.stats || []).map(function (s) {
            return esc(s.affix) + " +" + esc(s.value);
          }).join(" · ") + "</span>"
        );

    return (
      '<button type="button" class="ebld-slot-picker' + (empty ? " is-empty" : "") + '" data-slot="' + esc(slotDef.id) + '">' +
        '<div class="ebld-slot-picker-icon' + (empty ? " is-empty" : "") + '">' + iconHtml(item) + "</div>" +
        '<div class="ebld-slot-picker-body">' + body + "</div>" +
        '<span class="ebld-slot-picker-cta">' + (empty ? "Choose" : "Change") + "</span>" +
      "</button>"
    );
  }

  function updateSlotUi(slotId) {
    var slotEl = document.querySelector('.ebld-slot[data-slot="' + slotId + '"]');
    if (!slotEl) return;
    var slotDef = slotDefById[slotId];
    var item = getItem(state.items[slotId]);
    var btn = slotEl.querySelector(".ebld-slot-picker");
    if (btn) {
      btn.outerHTML = slotPickerHtml(slotDef, item);
    }
  }

  function openPicker(slotId) {
    var slotDef = slotDefById[slotId];
    if (!slotDef) return;
    pickerState.slotId = slotId;
    pickerState.filter = "";

    var dialog = document.getElementById("ebld-picker-dialog");
    var title = document.getElementById("ebld-picker-title");
    var search = document.getElementById("ebld-picker-search");
    if (title) title.textContent = "Select " + slotDef.label + " · " + state.class;
    if (search) search.value = "";

    renderPickerGrid();
    if (dialog && !dialog.open) dialog.showModal();

    var grid = document.getElementById("ebld-picker-grid");
    if (grid) {
      grid.scrollTop = 0;
      grid.focus({ preventScroll: true });
    }
    if (search) search.focus({ preventScroll: true });
  }

  function closePicker() {
    var dialog = document.getElementById("ebld-picker-dialog");
    pickerState.slotId = null;
    pickerState.filter = "";
    if (dialog && dialog.open) dialog.close();
  }

  function selectSlotItem(itemId) {
    if (!pickerState.slotId) return;
    state.items[pickerState.slotId] = itemId || "";
    updateSlotUi(pickerState.slotId);
    renderSummary();
    closePicker();
  }

  function renderPickerGrid() {
    var grid = document.getElementById("ebld-picker-grid");
    var countEl = document.getElementById("ebld-picker-count");
    if (!grid || !pickerState.slotId) return;

    var slotDef = slotDefById[pickerState.slotId];
    var allItems = itemsForSlot(slotDef).slice().sort(compareItems);
    var items = filterPickerItems(allItems, pickerState.filter);
    var selected = state.items[pickerState.slotId] || "";

    if (countEl) {
      countEl.textContent = items.length + " of " + allItems.length + " items · scroll to browse";
    }

    if (!items.length) {
      grid.innerHTML = '<p class="ebld-picker-empty">No items match your search.</p>';
      return;
    }

    grid.innerHTML = items.map(function (it) {
      return pickerItemHtml(it, it.id === selected);
    }).join("");
  }

  function bindPickerControls() {
    var dialog = document.getElementById("ebld-picker-dialog");
    var grid = document.getElementById("ebld-picker-grid");
    var search = document.getElementById("ebld-picker-search");
    var closeBtn = document.getElementById("ebld-picker-close");
    var clearBtn = document.getElementById("ebld-picker-clear");
    var slotsHost = document.getElementById("ebld-slots");

    if (slotsHost) {
      slotsHost.addEventListener("click", function (ev) {
        var btn = ev.target.closest(".ebld-slot-picker");
        if (!btn) return;
        openPicker(btn.getAttribute("data-slot"));
      });
    }

    if (search) {
      search.addEventListener("input", function () {
        pickerState.filter = String(search.value || "").trim();
        renderPickerGrid();
      });
    }

    if (grid) {
      grid.addEventListener("click", function (ev) {
        var btn = ev.target.closest(".ebld-picker-item");
        if (!btn) return;
        selectSlotItem(btn.getAttribute("data-item-id"));
      });

      grid.addEventListener("wheel", function (ev) {
        var maxScroll = grid.scrollHeight - grid.clientHeight;
        if (maxScroll <= 0) return;
        var atTop = grid.scrollTop <= 0 && ev.deltaY < 0;
        var atBottom = grid.scrollTop >= maxScroll && ev.deltaY > 0;
        if (atTop || atBottom) ev.preventDefault();
      }, { passive: false });
    }

    if (closeBtn) closeBtn.addEventListener("click", closePicker);
    if (clearBtn) clearBtn.addEventListener("click", function () { selectSlotItem(""); });

    if (dialog) {
      dialog.addEventListener("click", function (ev) {
        if (ev.target === dialog) closePicker();
      });
      dialog.addEventListener("close", function () {
        pickerState.slotId = null;
        pickerState.filter = "";
      });
    }
  }

  function aggregateStats() {
    var totals = {};
    var ips = [];
    var levels = [];
    var filled = 0;

    SLOTS.forEach(function (slotDef) {
      var item = getItem(state.items[slotDef.id]);
      if (!item) return;
      filled += 1;
      ips.push(Number(item.ip) || 0);
      levels.push(Number(item.level) || 0);
      (item.stats || []).forEach(function (s) {
        totals[s.affix] = (totals[s.affix] || 0) + Number(s.value || 0);
      });
    });

    return {
      totals: totals,
      avgIp: ips.length ? Math.round(ips.reduce(function (a, b) { return a + b; }, 0) / ips.length) : null,
      reqLevel: levels.length ? Math.max.apply(null, levels) : null,
      filled: filled
    };
  }

  function renderStatTotals() {
    var host = document.getElementById("ebld-stat-totals");
    var agg = aggregateStats();
    if (!host) return;

    var keys = Object.keys(agg.totals).sort();
    if (!keys.length) {
      host.innerHTML = '<p class="ebld-stat-totals-empty">Equip items to see combined stats.</p>';
      return;
    }

    host.innerHTML = keys.map(function (affix) {
      return (
        '<span class="ebld-stat-total-chip">' +
          esc(affix) + " <strong>+" + esc(agg.totals[affix]) + "</strong>" +
        "</span>"
      );
    }).join("");
  }

  function renderSummary() {
    var agg = aggregateStats();
    var avgEl = document.getElementById("ebld-avg-ip");
    var lvlEl = document.getElementById("ebld-req-level");
    var filledEl = document.getElementById("ebld-slots-filled");
    if (avgEl) avgEl.textContent = agg.avgIp != null ? String(agg.avgIp) : "—";
    if (lvlEl) lvlEl.textContent = agg.reqLevel != null ? String(agg.reqLevel) : "—";
    if (filledEl) filledEl.textContent = agg.filled + " / " + SLOTS.length;
    renderStatTotals();
  }

  function renderSlots() {
    var host = document.getElementById("ebld-slots");
    if (!host) return;

    host.innerHTML = SLOTS.map(function (slotDef) {
      var selected = state.items[slotDef.id] || "";
      if (selected && !getItem(selected)) {
        selected = "";
        state.items[slotDef.id] = "";
      }
      var item = getItem(selected);

      return (
        '<div class="ebld-slot" data-slot="' + esc(slotDef.id) + '">' +
          '<span class="ebld-slot-label">' + esc(slotDef.label) + "</span>" +
          slotPickerHtml(slotDef, item) +
        "</div>"
      );
    }).join("");

    renderSummary();
  }

  function setView(view) {
    var create = document.getElementById("ebld-create");
    var community = document.getElementById("ebld-community");
    document.querySelectorAll(".ebld-tab").forEach(function (btn) {
      var active = btn.getAttribute("data-view") === view;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (create) create.hidden = view !== "create";
    if (community) community.hidden = view !== "community";
    if (view === "community") renderBrowse();
    if (location.hash.replace("#", "") !== view) {
      history.replaceState(null, "", "#" + view);
    }
  }

  function tagClass(tag) {
    var t = String(tag).toLowerCase();
    if (t === "pve") return "ebld-build-tag ebld-build-tag--pve";
    if (t === "pvp") return "ebld-build-tag ebld-build-tag--pvp";
    return "ebld-build-tag ebld-build-tag--hybrid";
  }

  function buildTierSummary(items) {
    var stars = [];
    SLOTS.forEach(function (s) {
      var it = getItem(items && items[s.id]);
      if (it) stars.push(Number(it.starRank));
    });
    if (!stars.length) return "—";
    var min = Math.min.apply(null, stars);
    var max = Math.max.apply(null, stars);
    return min === max ? "\u2605" + min : "\u2605" + min + "\u2013\u2605" + max;
  }

  function allBuilds() {
    var mine = readJson(STORAGE_MINE, []).map(function (b) {
      return Object.assign({}, b, { source: "mine" });
    });
    var local = readJson(STORAGE_LOCAL, []).map(function (b) {
      return Object.assign({}, b, { source: "local" });
    });
    return communitySeed.concat(local, mine);
  }

  function filteredBuilds() {
    var q = String((document.getElementById("ebld-browse-search") || {}).value || "").trim().toLowerCase();
    var cls = (document.getElementById("ebld-browse-class") || {}).value || "";
    var tag = (document.getElementById("ebld-browse-tag") || {}).value || "";
    var source = (document.getElementById("ebld-browse-source") || {}).value || "";

    return allBuilds().filter(function (b) {
      if (source && b.source !== source) return false;
      if (cls && b.class !== cls) return false;
      if (tag && (!b.tags || b.tags.indexOf(tag) < 0)) return false;
      if (q) {
        var hay = [b.name, b.author, b.class, b.description, (b.tags || []).join(" ")].join(" ").toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    }).sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }

  function buildCardMeta(build) {
    var filled = SLOTS.filter(function (s) { return build.items && build.items[s.id]; }).length;
    return build.class + " · " + buildTierSummary(build.items) + " · " + filled + "/9 slots";
  }

  function renderBrowse() {
    var grid = document.getElementById("ebld-build-grid");
    var empty = document.getElementById("ebld-build-empty");
    var countEl = document.getElementById("ebld-browse-count");
    var builds = filteredBuilds();

    if (countEl) countEl.textContent = builds.length + " build" + (builds.length === 1 ? "" : "s");
    if (empty) empty.hidden = builds.length > 0;
    if (!grid) return;

    grid.innerHTML = builds.map(function (b) {
      var sourceLabel = b.source === "mine" ? "My build" : b.source === "local" ? "Local share" : "Community";
      var sourceCls = b.source === "mine" ? "ebld-build-source ebld-build-source--mine" :
        b.source === "local" ? "ebld-build-source ebld-build-source--local" : "ebld-build-source";
      var tags = (b.tags || []).map(function (t) {
        return '<span class="' + tagClass(t) + '">' + esc(t) + "</span>";
      }).join("");

      return (
        '<article class="ebld-build-card" data-build-id="' + esc(b.id) + '">' +
          '<div class="ebld-build-card-head">' +
            '<h3 class="ebld-build-card-title">' + esc(b.name) + "</h3>" +
            '<span class="' + sourceCls + '">' + esc(sourceLabel) + "</span>" +
          "</div>" +
          '<p class="ebld-build-meta">' + esc(b.author || "Anonymous") + " · " + esc(buildCardMeta(b)) + "</p>" +
          '<div class="ebld-build-tags">' + (tags || '<span class="ebld-build-tag ebld-build-tag--hybrid">Untagged</span>') + "</div>" +
          '<div class="ebld-build-card-actions">' +
            '<button type="button" class="btn btn-outline ebld-view-build" data-build-id="' + esc(b.id) + '">View</button>' +
            '<button type="button" class="btn btn-primary ebld-load-build" data-build-id="' + esc(b.id) + '">Load</button>' +
          "</div>" +
        "</article>"
      );
    }).join("");

    grid.querySelectorAll(".ebld-view-build").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openBuildDetail(btn.getAttribute("data-build-id"));
      });
    });
    grid.querySelectorAll(".ebld-load-build").forEach(function (btn) {
      btn.addEventListener("click", function () {
        loadBuildIntoEditor(btn.getAttribute("data-build-id"));
      });
    });
  }

  function findBuild(id) {
    return allBuilds().find(function (b) { return b.id === id; }) || null;
  }

  function openBuildDetail(id) {
    var build = findBuild(id);
    var dialog = document.getElementById("ebld-detail-dialog");
    var host = document.getElementById("ebld-detail-content");
    if (!build || !dialog || !host) return;

    var slotsHtml = SLOTS.map(function (slotDef) {
      var item = getItem(build.items && build.items[slotDef.id]);
      var label = item
        ? esc(item.masterworkName) + " " + esc(item.stars) + " " + esc(item.baseName) +
          (item.class && item.class !== "Any" ? " (" + esc(item.class) + ")" : "")
        : "—";
      return '<div class="ebld-detail-slot"><strong>' + esc(slotDef.label) + "</strong> " + label + "</div>";
    }).join("");

    var tags = (build.tags || []).map(function (t) {
      return '<span class="' + tagClass(t) + '">' + esc(t) + "</span>";
    }).join(" ");

    host.innerHTML =
      '<h2 class="ebld-detail-title">' + esc(build.name) + "</h2>" +
      '<p class="ebld-detail-sub">' + esc(build.author || "Anonymous") + " · " + esc(build.class) +
        " · " + esc(buildTierSummary(build.items)) +
      "</p>" +
      '<div class="ebld-build-tags" style="margin-bottom:1rem">' + tags + "</div>" +
      '<div class="ebld-detail-slots">' + slotsHtml + "</div>" +
      (build.description ? '<p class="ebld-detail-notes">' + esc(build.description) + "</p>" : "") +
      '<div style="margin-top:1rem;display:flex;gap:0.5rem">' +
        '<button type="button" class="btn btn-primary" id="ebld-detail-load">Load in editor</button>' +
        (build.source === "mine"
          ? '<button type="button" class="btn btn-outline" id="ebld-detail-delete">Delete</button>'
          : "") +
      "</div>";

    var loadBtn = document.getElementById("ebld-detail-load");
    if (loadBtn) {
      loadBtn.addEventListener("click", function () {
        dialog.close();
        loadBuildIntoEditor(build.id);
      });
    }
    var delBtn = document.getElementById("ebld-detail-delete");
    if (delBtn) {
      delBtn.addEventListener("click", function () {
        deleteMyBuild(build.id);
        dialog.close();
        renderBrowse();
      });
    }

    dialog.showModal();
  }

  function loadBuildIntoEditor(id) {
    var build = findBuild(id);
    if (!build) return;

    state.class = build.class || "Champion";
    state.items = Object.assign({}, build.items || {});

    var classSel = document.getElementById("ebld-class");
    if (classSel) classSel.value = state.class;

    if (build.name) document.getElementById("ebld-name").value = build.name;
    if (build.author) document.getElementById("ebld-author").value = build.author;
    if (build.description) document.getElementById("ebld-notes").value = build.description;
    document.querySelectorAll('input[name="ebld-tag"]').forEach(function (cb) {
      cb.checked = (build.tags || []).indexOf(cb.value) >= 0;
    });

    renderSlots();
    setView("create");
    showSaveMsg("Loaded \"" + build.name + "\" into the editor.");
  }

  function currentBuildPayload() {
    var tags = [];
    document.querySelectorAll('input[name="ebld-tag"]:checked').forEach(function (cb) {
      tags.push(cb.value);
    });
    return {
      id: uid(),
      name: String(document.getElementById("ebld-name").value || "").trim(),
      author: String(document.getElementById("ebld-author").value || "").trim() || "Anonymous",
      class: state.class,
      tags: tags,
      description: String(document.getElementById("ebld-notes").value || "").trim(),
      items: Object.assign({}, state.items),
      createdAt: new Date().toISOString()
    };
  }

  function showSaveMsg(text) {
    var el = document.getElementById("ebld-save-msg");
    if (el) {
      el.textContent = text;
      setTimeout(function () { if (el.textContent === text) el.textContent = ""; }, 4000);
    }
  }

  function saveMyBuild(ev) {
    ev.preventDefault();
    var payload = currentBuildPayload();
    if (!payload.name) return;
    if (!payload.tags.length) {
      showSaveMsg("Pick at least one build type (PvE / PvP / Hybrid).");
      return;
    }
    var filled = SLOTS.filter(function (s) { return payload.items[s.id]; }).length;
    if (!filled) {
      showSaveMsg("Equip at least one item before saving.");
      return;
    }

    var mine = readJson(STORAGE_MINE, []);
    mine.unshift(payload);
    writeJson(STORAGE_MINE, mine);
    showSaveMsg("Saved to My Builds.");
  }

  function shareLocally() {
    var payload = currentBuildPayload();
    if (!payload.name) {
      showSaveMsg("Enter a build name first.");
      return;
    }
    if (!payload.tags.length) {
      showSaveMsg("Pick at least one build type.");
      return;
    }
    payload.source = "local";
    var local = readJson(STORAGE_LOCAL, []);
    local.unshift(payload);
    writeJson(STORAGE_LOCAL, local);
    showSaveMsg("Shared locally — visible under Community Builds on this browser.");
  }

  function deleteMyBuild(id) {
    var mine = readJson(STORAGE_MINE, []).filter(function (b) { return b.id !== id; });
    writeJson(STORAGE_MINE, mine);
  }

  function bindControls() {
    document.getElementById("ebld-class").addEventListener("change", function (e) {
      state.class = e.target.value;
      var hint = document.getElementById("ebld-class-hint");
      if (hint) hint.textContent = state.class;
      clearIncompatibleItems();
      renderSlots();
      if (pickerState.slotId) renderPickerGrid();
    });

    document.querySelectorAll(".ebld-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setView(btn.getAttribute("data-view"));
      });
    });

    document.getElementById("ebld-save-form").addEventListener("submit", saveMyBuild);
    document.getElementById("ebld-share-local").addEventListener("click", shareLocally);

    ["ebld-browse-search", "ebld-browse-class", "ebld-browse-tag", "ebld-browse-source"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("input", renderBrowse);
      if (el) el.addEventListener("change", renderBrowse);
    });

    document.getElementById("ebld-detail-close").addEventListener("click", function () {
      document.getElementById("ebld-detail-dialog").close();
    });
  }

  function initFromHash() {
    var view = (location.hash || "#create").replace("#", "");
    setView(view === "community" ? "community" : "create");
  }

  function loadData() {
    return Promise.all([
      fetch("data/elumia-gear-catalog.json").then(function (r) {
        if (!r.ok) throw new Error("Catalog load failed");
        return r.json();
      }),
      fetch("data/elumia-community-builds.json").then(function (r) {
        if (!r.ok) return [];
        return r.json();
      })
    ]).then(function (results) {
      catalog = results[0];
      communitySeed = results[1] || [];
      catalog.items.forEach(function (it) {
        itemById[it.id] = it;
      });
      bindControls();
      bindPickerControls();
      renderSlots();
      initFromHash();
    }).catch(function (err) {
      var host = document.getElementById("ebld-slots");
      if (host) {
        host.innerHTML = '<p class="elumia-db-empty">Could not load gear catalog. ' + esc(err.message) + "</p>";
      }
    });
  }

  var initialized = false;

  window.ElumiaBuild = {
    init: function () {
      if (initialized) return;
      initialized = true;
      window.addEventListener("hashchange", initFromHash);
      loadData();
    }
  };

  if (document.body.classList.contains("ebld-unlocked")) {
    window.ElumiaBuild.init();
  }
})();
