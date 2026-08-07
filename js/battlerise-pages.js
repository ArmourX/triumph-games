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

  function formatStatLine(text) {
    return '<li class="br-artifact-stat">' + text + "</li>";
  }

  function renderArtifactCard(a) {
    var img = a.cardImage || a.image || ("assets/battlerise/artifacts/cards/" + a.icon + ".png");
    var stats = a.displayStats || [];
    var hidden = a.hiddenCount || 0;
    var statsHtml = stats.map(formatStatLine).join("");
    var moreHtml = hidden > 0 ? '<span class="br-artifact-more">+' + hidden + " MORE</span>" : "";
    return (
      '<article class="br-artifact-row br-artifact-row--' + rarityBorderClass(a.rarity) + '">' +
        '<div class="br-artifact-card-face">' +
          '<span class="br-artifact-level">' + (a.level || 1) + "</span>" +
          '<img class="br-artifact-card-img" src="' + img + '" alt="' + a.name + '" loading="lazy">' +
          '<div class="br-artifact-card-type">' +
            '<span class="br-artifact-rarity-label">' + a.rarity + "</span>" +
            '<span class="br-artifact-type-label">' + (a.gearTypeLabel || "Artifact") + "</span>" +
          "</div>" +
        "</div>" +
        '<div class="br-artifact-panel">' +
          '<h3 class="br-artifact-name">' + a.name + "</h3>" +
          '<p class="br-artifact-section-label">Attributes</p>' +
          '<ul class="br-artifact-stats">' + (statsHtml || '<li class="br-artifact-stat br-artifact-stat--muted">See in-game for full stats</li>') + "</ul>" +
          moreHtml +
        "</div>" +
      "</article>"
    );
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
