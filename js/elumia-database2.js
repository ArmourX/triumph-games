(function () {
  var catalog = null;
  var activeCategory = "weapons";
  var filters = { star: 9, mw: 4, cls: "", q: "" };

  var HEADERS = {
    weapons: ["Name", "Rank", "Masterwork", "Req.", "IP", "Fixed Stats", "Class", "Slot", "Recipe"],
    armour: ["Name", "Rank", "Masterwork", "Req.", "IP", "Fixed Stats", "Class", "Slot", "Recipe"],
    offhand: ["Name", "Rank", "Masterwork", "Req.", "IP", "Fixed Stats", "Class", "Slot", "Recipe"],
    rings: ["Name", "Rank", "Masterwork", "Req.", "IP", "Fixed Stats", "Class", "Slot", "Recipe"],
    amulet: ["Name", "Rank", "Masterwork", "Req.", "IP", "Fixed Stats", "Class", "Slot", "Recipe"]
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function iconLabel(name) {
    return String(name || "").replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "?";
  }

  function isClassless(cls) {
    return !cls || cls === "Any" || cls === "Classless";
  }

  function isJewelryCategory(category) {
    return category === "amulet" || category === "rings";
  }

  function classTag(cls) {
    if (isClassless(cls)) return '<span class="edb2-class-tag edb2-class-tag--classless">Classless</span>';
    var mod = cls.toLowerCase();
    return '<span class="edb2-class-tag edb2-class-tag--' + esc(mod) + '">' + esc(cls) + "</span>";
  }

  function rarityClass(r) {
    return "elumia-db-rarity--" + esc(r || "common");
  }

  function filteredItems() {
    if (!catalog) return [];
    return catalog.items.filter(function (it) {
      if (it.category !== activeCategory) return false;
      if (Number(it.starRank) !== Number(filters.star)) return false;
      if (Number(it.masterwork) !== Number(filters.mw)) return false;
      if (filters.cls && !isJewelryCategory(activeCategory)) {
        if (it.class !== filters.cls) return false;
      }
      if (filters.q) {
        var hay = [
          it.name, it.baseName, it.slot, it.displaySlot, it.class,
          it.starName, it.masterworkName, it.recipe,
          (it.stats || []).map(function (s) { return s.affix; }).join(" ")
        ].join(" ").toLowerCase();
        if (hay.indexOf(filters.q) < 0) return false;
      }
      return true;
    });
  }

  function statsCell(item) {
    if (!item.stats || !item.stats.length) {
      return '<span class="elumia-db-bonus-empty">—</span>';
    }
    return (
      '<div class="elumia-db-bonuses">' +
        item.stats.map(function (s) {
          return (
            '<span class="elumia-db-bonus-chip" title="' + esc(s.note || "") + '">' +
              '<span class="edb2-stat-chip-num">S' + s.slot + "</span> " +
              esc(s.affix) + " +" + esc(s.value) +
            "</span>"
          );
        }).join("") +
      "</div>"
    );
  }

  function iconHtml(item) {
    var img = item.iconUrl
      ? '<img class="elumia-db-icon-img" src="' + esc(item.iconUrl) + '" alt="" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false">' +
        '<span class="edb2-icon-fallback" hidden>' + iconLabel(item.baseName) + "</span>"
      : "";
    return (
      '<span class="elumia-db-icon-wrap" aria-hidden="true">' +
        (img || ('<span class="edb2-icon-fallback">' + iconLabel(item.baseName) + "</span>")) +
      "</span>"
    );
  }

  function nameCell(item) {
    return (
      '<div class="elumia-db-name">' +
        iconHtml(item) +
        "<div>" +
          '<span class="elumia-db-item-link ' + rarityClass(item.rarity) + '">' + esc(item.baseName) + "</span>" +
          '<span class="elumia-db-sub">' + esc(item.masterworkName) + " · " + esc(item.stars) + " " + esc(item.starName) + "</span>" +
        "</div>" +
      "</div>"
    );
  }

  function recipeCell(item) {
    return (
      '<div class="elumia-db-source edb2-recipe">' +
        esc(item.recipe || "—") +
      "</div>"
    );
  }

  function renderTable(items) {
    var headers = HEADERS[activeCategory] || HEADERS.weapons;
    var body = items.map(function (item) {
      return (
        "<tr>" +
          "<td>" + nameCell(item) + "</td>" +
          "<td><span class=\"elumia-db-level\">" + esc(item.stars) + " " + esc(item.starName) + "</span></td>" +
          "<td><span class=\"elumia-db-quality " + rarityClass(item.rarity) + "\">" + esc(item.masterworkName) + "</span></td>" +
          '<td class="num" title="Equip &amp; craft requirement">' + esc(item.level) + "</td>" +
          '<td class="num">' + esc(item.ip) + "</td>" +
          "<td>" + statsCell(item) + "</td>" +
          "<td>" + classTag(item.class) + "</td>" +
          "<td>" + esc(item.displaySlot || item.slot) + "</td>" +
          "<td>" + recipeCell(item) + "</td>" +
        "</tr>"
      );
    }).join("");

    if (!items.length) {
      return '<p class="elumia-db-empty">No items match this rank, Masterwork, and filter.</p>';
    }

    return (
      '<table class="elumia-db-table">' +
        "<thead><tr>" + headers.map(function (h) {
          var cls = (h === "Req." || h === "IP") ? ' class="num"' : "";
          return "<th" + cls + ">" + esc(h) + "</th>";
        }).join("") + "</tr></thead>" +
        "<tbody>" + body + "</tbody>" +
      "</table>"
    );
  }

  function slotPreviewTemplate() {
    if (!catalog) return;
    var host = document.getElementById("edb2-slot-preview");
    if (!host) return;

    var items = filteredItems();
    if (!items.length) {
      host.hidden = true;
      return;
    }

    var sample = items[0];
    var mwMeta = catalog.meta.masterwork.find(function (m) {
      return Number(m.id) === Number(filters.mw);
    });
    var statCount = mwMeta ? mwMeta.statCount : 3;

    var legendary = catalog.items.find(function (it) {
      return it.slot === sample.slot && it.class === sample.class &&
        Number(it.starRank) === Number(filters.star) && Number(it.masterwork) === 4;
    });

    var fullStats = (legendary && legendary.stats) ? legendary.stats : (sample.stats || []);
    var maxSlots = sample.maxStatSlots || fullStats.length || 7;

    host.hidden = false;
    host.innerHTML =
      '<p class="edb2-slot-preview-title">Fixed slot order — ' + esc(sample.slot) +
        (sample.class && !isClassless(sample.class) ? " (" + esc(sample.class) + ")" : "") +
        " · " + statCount + " / " + maxSlots + " unlocked at " + esc(mwMeta ? mwMeta.name : "") + "</p>" +
      '<div class="edb2-slot-preview-grid">' +
        fullStats.map(function (s) {
          var active = s.slot <= statCount;
          var cls = active ? "" : " is-locked";
          var val = active ? (' <span class="edb2-stat-chip-val">+' + esc(s.value) + "</span>") : "";
          return (
            '<span class="edb2-stat-chip' + cls + '">' +
              '<span class="edb2-stat-chip-num">' + s.slot + "</span> " +
              esc(s.affix) + val +
            "</span>"
          );
        }).join("") +
      "</div>";
  }

  function renderTabs() {
    var host = document.getElementById("edb2-tabs");
    if (!host || !catalog) return;
    host.innerHTML = catalog.meta.categories.map(function (cat) {
      var active = cat.id === activeCategory ? " active" : "";
      return (
        '<button type="button" class="elumia-db-tab' + active + '" role="tab" data-category="' + esc(cat.id) + '" aria-selected="' + (activeCategory === cat.id) + '">' +
          esc(cat.label) +
        "</button>"
      );
    }).join("");

    host.querySelectorAll(".elumia-db-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeCategory = btn.getAttribute("data-category");
        render();
      });
    });
  }

  function populateFilters() {
    if (!catalog) return;
    var starSel = document.getElementById("edb2-star");
    var mwSel = document.getElementById("edb2-mw");
    if (starSel && !starSel.options.length) {
      catalog.meta.stars.forEach(function (s) {
        var opt = document.createElement("option");
        opt.value = String(s.rank);
        opt.textContent = "\u2605".repeat(s.rank) + " " + s.name + " (" + s.element + ")";
        starSel.appendChild(opt);
      });
      starSel.value = String(filters.star);
    }
    if (mwSel && !mwSel.options.length) {
      catalog.meta.masterwork.forEach(function (m) {
        var opt = document.createElement("option");
        opt.value = String(m.id);
        opt.textContent = m.name + " — " + m.statCount + " stats (" + m.rarity + ")";
        mwSel.appendChild(opt);
      });
      mwSel.value = String(filters.mw);
    }
  }

  function render() {
    var items = filteredItems();
    var tableHost = document.getElementById("edb2-table-host");
    var countEl = document.getElementById("edb2-count");
    var footer = document.getElementById("edb2-footer");
    if (tableHost) tableHost.innerHTML = renderTable(items);
    if (countEl) countEl.textContent = items.length + " item" + (items.length === 1 ? "" : "s");
    if (footer) footer.textContent = "Database v2 · fixed stat slots · preview";
    slotPreviewTemplate();
    renderTabs();
  }

  function bindControls() {
    var search = document.getElementById("edb2-search");
    var starSel = document.getElementById("edb2-star");
    var mwSel = document.getElementById("edb2-mw");
    var clsSel = document.getElementById("edb2-class");

    if (search) {
      search.addEventListener("input", function () {
        filters.q = String(search.value || "").trim().toLowerCase();
        render();
      });
    }
    if (starSel) {
      starSel.addEventListener("change", function () {
        filters.star = Number(starSel.value);
        render();
      });
    }
    if (mwSel) {
      mwSel.addEventListener("change", function () {
        filters.mw = Number(mwSel.value);
        render();
      });
    }
    if (clsSel) {
      clsSel.addEventListener("change", function () {
        filters.cls = clsSel.value;
        render();
      });
    }
  }

  function loadCatalog() {
    return fetch("data/elumia-gear-catalog.json")
      .then(function (res) {
        if (!res.ok) throw new Error("Catalog load failed");
        return res.json();
      })
      .then(function (data) {
        catalog = data;
        populateFilters();
        bindControls();
        render();
      })
      .catch(function (err) {
        var host = document.getElementById("edb2-table-host");
        if (host) {
          host.innerHTML = '<p class="elumia-db-empty">Could not load gear catalog. ' + esc(err.message) + "</p>";
        }
      });
  }

  var initialized = false;
  window.ElumiaDatabase2 = {
    init: function () {
      if (initialized) return;
      initialized = true;
      loadCatalog();
    }
  };

  if (document.body.classList.contains("edb2-unlocked")) {
    window.ElumiaDatabase2.init();
  }
})();
