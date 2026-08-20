(function () {
  var data = window.BATTLERISE_DATA;
  if (!data) return;

  function stars(n) {
    n = Math.round(Math.max(0, Math.min(5, n)));
    return "\u2605".repeat(n) + "\u2606".repeat(5 - n);
  }

  function rarityClass(r) {
    return (r || "").toLowerCase();
  }

  function renderChampionCard(c) {
    var role = c.role.charAt(0).toUpperCase() + c.role.slice(1);
    return (
      '<a href="' + c.detailUrl + '" class="warrior-card warrior-card--' + c.cardClass + '">' +
        '<img class="br-card-img" src="' + c.portrait + '" alt="' + c.name + '" loading="lazy">' +
        '<span class="warrior-role">' + role + "</span>" +
        '<span class="warrior-name">' + c.name + "</span>" +
      "</a>"
    );
  }

  function initFeatured() {
    var grid = document.getElementById("br-featured-champions");
    if (!grid) return;
    featured = data.featured
      .map(function (key) {
        return data.champions.find(function (c) { return c.key === key; });
      })
      .filter(Boolean);
    if (!featured.length) {
      featured = data.champions.slice(0, 6);
    }
    grid.innerHTML = featured.map(renderChampionCard).join("");
  }

  function initChampionList() {
    var grid = document.getElementById("br-champion-grid");
    if (!grid) return;

    var search = document.getElementById("br-champion-search");
    var filters = document.querySelectorAll(".br-filter-btn[data-filter]");
    var activeFilter = "all";

    function apply() {
      var q = (search && search.value || "").toLowerCase();
      var list = data.champions.filter(function (c) {
        var matchQ = !q || c.name.toLowerCase().indexOf(q) >= 0 || c.faction.toLowerCase().indexOf(q) >= 0;
        var matchF = activeFilter === "all" || c.rarity.toLowerCase() === activeFilter || c.spec.toLowerCase() === activeFilter || c.role === activeFilter;
        return matchQ && matchF;
      });
      grid.innerHTML = list.map(renderChampionCard).join("");
    }

    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filters.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        activeFilter = btn.getAttribute("data-filter");
        apply();
      });
    });

    if (search) search.addEventListener("input", apply);
    apply();
  }

  function rarityBorderClass(r) {
    return (r || "rare").toLowerCase();
  }

  function formatStatLine(text, muted) {
    var cls = "br-artifact-stat" + (muted ? " br-artifact-stat--muted" : "");
    return '<li class="' + cls + '">' + text + "</li>";
  }

  function rollStatLines(roll) {
    var lines = (roll.stats || []).slice();
    (roll.substatRolls || []).forEach(function (s) { lines.push(s); });
    (roll.notes || []).forEach(function (n) { lines.push(n); });
    return lines;
  }

  function applyArtifactRoll(row, roll) {
    var levelEl = row.querySelector(".br-artifact-level");
    if (levelEl) levelEl.textContent = roll.level;
    var lines = rollStatLines(roll);
    var ul = row.querySelector(".br-artifact-stats");
    if (ul) {
      ul.innerHTML = lines.length
        ? lines.map(function (line, i) {
            var muted = i >= (roll.stats || []).length && line.indexOf("(substat roll)") >= 0;
            return formatStatLine(line, muted);
          }).join("")
        : formatStatLine("See in-game for full stats", true);
    }
    var more = row.querySelector(".br-artifact-more");
    if (more) more.hidden = true;
  }

  function renderArtifactCard(a) {
    var img = a.cardImage || a.image || ("assets/battlerise/artifacts/cards/" + a.icon + ".png");
    var rolls = a.rolls && a.rolls.length
      ? a.rolls
      : [{ level: a.level || 1, label: "Level " + (a.level || 1), stats: a.displayStats || [], substatRolls: [], notes: [] }];
    var defaultRoll = rolls[rolls.length - 1];
    var stats = rollStatLines(defaultRoll);
    var rollSelect = rolls.length > 1
      ? (
        '<label class="br-artifact-roll-field">' +
          '<span class="br-artifact-section-label">Available roll</span>' +
          '<select class="br-artifact-roll-select" aria-label="Artifact roll for ' + a.name + '">' +
            rolls.map(function (r, i) {
              return '<option value="' + i + '"' + (i === rolls.length - 1 ? " selected" : "") + ">" + r.label + "</option>";
            }).join("") +
          "</select>" +
        "</label>"
      )
      : '<p class="br-artifact-roll-single">Roll: <strong>' + defaultRoll.label + "</strong></p>";
    var statsHtml = stats.length
      ? stats.map(function (line, i) {
          var muted = i >= (defaultRoll.stats || []).length && line.indexOf("(substat roll)") >= 0;
          return formatStatLine(line, muted);
        }).join("")
      : formatStatLine("See in-game for full stats", true);
    return (
      '<article id="artifact-' + a.icon + '" class="br-artifact-row br-artifact-row--' + rarityBorderClass(a.rarity) + '" data-artifact-icon="' + a.icon + '">' +
        '<div class="br-artifact-card-face">' +
          '<span class="br-artifact-level">' + defaultRoll.level + "</span>" +
          '<img class="br-artifact-card-img" src="' + img + '" alt="' + a.name + '" loading="lazy">' +
          '<div class="br-artifact-card-type">' +
            '<span class="br-artifact-rarity-label">' + a.rarity + "</span>" +
            '<span class="br-artifact-type-label">' + (a.gearTypeLabel || "Artifact") + "</span>" +
          "</div>" +
        "</div>" +
        '<div class="br-artifact-panel">' +
          '<h3 class="br-artifact-name">' + a.name + "</h3>" +
          rollSelect +
          '<p class="br-artifact-section-label">Attributes</p>' +
          '<ul class="br-artifact-stats">' + statsHtml + "</ul>" +
        "</div>" +
      "</article>"
    );
  }

  function bindArtifactRollSelects() {
    var grid = document.getElementById("br-artifact-grid");
    if (!grid) return;
    grid.querySelectorAll(".br-artifact-row").forEach(function (row) {
      var select = row.querySelector(".br-artifact-roll-select");
      if (!select) return;
      var icon = row.getAttribute("data-artifact-icon");
      var artifact = data.artifacts.find(function (a) { return a.icon === icon; });
      if (!artifact || !artifact.rolls) return;
      select.addEventListener("change", function () {
        var roll = artifact.rolls[parseInt(select.value, 10)];
        if (roll) applyArtifactRoll(row, roll);
      });
    });
  }

  function scrollToArtifactHash() {
    var hash = window.location.hash;
    if (!hash || hash.indexOf("#artifact-") !== 0) return;
    var el = document.querySelector(hash);
    if (!el) return;
    window.setTimeout(function () {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("br-artifact-row--highlight");
      window.setTimeout(function () {
        el.classList.remove("br-artifact-row--highlight");
      }, 2200);
    }, 120);
  }

  function initArtifactList() {
    var grid = document.getElementById("br-artifact-grid");
    if (!grid) return;

    var search = document.getElementById("br-artifact-search");
    var filters = document.querySelectorAll(".br-filter-btn[data-artifact-filter]");
    var activeFilter = "all";

    function apply() {
      var q = (search && search.value || "").toLowerCase();
      var list = data.artifacts.filter(function (a) {
        var matchQ = !q || a.name.toLowerCase().indexOf(q) >= 0;
        var matchF = activeFilter === "all" || a.rarity.toLowerCase() === activeFilter || a.spec.toLowerCase() === activeFilter;
        return matchQ && matchF;
      });
      grid.innerHTML = list.map(renderArtifactCard).join("");
      bindArtifactRollSelects();
      scrollToArtifactHash();
    }

    var hash = window.location.hash;
    if (hash && hash.indexOf("#artifact-") === 0) {
      var icon = decodeURIComponent(hash.slice("#artifact-".length));
      var target = data.artifacts.find(function (a) { return a.icon === icon; });
      if (target) {
        if (search) search.value = target.name;
        activeFilter = "all";
        filters.forEach(function (btn) {
          btn.classList.toggle("active", btn.getAttribute("data-artifact-filter") === "all");
        });
      }
    }

    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filters.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        activeFilter = btn.getAttribute("data-artifact-filter");
        apply();
      });
    });

    if (search) search.addEventListener("input", apply);
    apply();
  }

  initFeatured();
  initChampionList();
  initArtifactList();
})();
