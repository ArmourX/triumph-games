(function () {
  var data = window.BATTLERISE_DATA;
  var body = document.body;
  var slug = body.getAttribute("data-champion-slug");
  if (!data || !slug) return;

  var detail = data.detailChampions && data.detailChampions[slug] || data.champions.find(function (c) { return c.slug === slug; });
  if (!detail) {
    document.getElementById("br-champion-root").innerHTML = "<p>Champion not found.</p>";
    return;
  }

  var extras = window.BATTLERISE_CHAMPION_EXTRAS && window.BATTLERISE_CHAMPION_EXTRAS[slug] || {};

  function stars(n) {
    n = Math.round(Math.max(0, Math.min(5, n)));
    var full = "";
    for (var i = 0; i < 5; i++) {
      full += i < n ? "\u2605" : '<span class="dim">\u2606</span>';
    }
    return full;
  }

  var overview = extras.overview || (detail.lore ? detail.lore.replace(/\n/g, "\n\n") : "") || detail.name + " is a " + detail.rarity.toLowerCase() + " " + detail.spec + " champion. " + (detail.description || "");

  var ratings = extras.ratings || {
    "Arena": 4,
    "Gauntlet": detail.role === "defender" ? 5 : 3,
    "Dungeons": 4,
    "Bosses": 3,
    "PvP": detail.role === "attacker" ? 5 : 3
  };

  var skills = detail.skills || extras.skills || [
    { name: "Basic Attack", description: "Deal damage to a single target enemy.", cooldown: -1, type: "physical" },
    { name: detail.name + " Strike", description: "Deal heavy damage with a chance to apply a debuff.", cooldown: 2, type: detail.spec === "INT" ? "magic" : "physical" },
    { name: detail.name + " Ultimate", description: "Unleash a powerful ability affecting multiple enemies or allies.", cooldown: 4, type: "unique" }
  ];

  var gear = extras.gear || {
    pveStats: ["SPD", "HP%", "DEF%", "Effect ACC"],
    pveSets: ["Vitality Emblem", "Finest Shield", "Purity Breeze"],
    pvpStats: ["SPD", "HP%", "DEF%", "RES"],
    pvpSets: ["Plate of Justice", "Seraphim's Oath", "Divinity Spark"]
  };

  document.title = detail.name + " | BattleRise | Triumph Guides";

  var portrait = document.getElementById("br-portrait");
  if (portrait) {
    portrait.src = detail.portrait;
    portrait.alt = detail.name;
  }

  document.getElementById("br-name").textContent = detail.name;
  document.getElementById("br-spec").textContent = detail.spec;
  document.getElementById("br-spec").className = "br-meta-pill br-meta-pill--" + detail.spec.toLowerCase();
  document.getElementById("br-role").textContent = detail.role.charAt(0).toUpperCase() + detail.role.slice(1);

  document.getElementById("br-overview-text").innerHTML = overview.split("\n\n").map(function (p) { return "<p>" + p + "</p>"; }).join("");
  var overviewEl = document.getElementById("br-overview-text");
  overviewEl.setAttribute("data-editable", "");
  overviewEl.setAttribute("data-edit-game", "battlerise");
  overviewEl.setAttribute("data-edit-page", "champion-" + slug);
  overviewEl.setAttribute("data-edit-field", "overview");
  overviewEl.setAttribute("data-edit-title", detail.name);
  overviewEl.setAttribute("data-edit-label", "Overview");

  var ratingsEl = document.getElementById("br-ratings-grid");
  if (ratingsEl && window.TriumphCommunity) {
    TriumphCommunity.initRatings(slug, ratingsEl, ratings);
  } else if (ratingsEl) {
    ratingsEl.innerHTML = Object.keys(ratings).map(function (label) {
      return (
        '<div class="br-rating-card">' +
          '<div class="br-rating-label">' + label + "</div>" +
          '<div class="br-rating-stars">' + stars(ratings[label]) + "</div>" +
        "</div>"
      );
    }).join("");
  }

  var skillsEl = document.getElementById("br-skills-list");
  skillsEl.innerHTML = skills.map(function (s, i) {
    var cd = s.cooldown >= 0 ? s.cooldown + " turn cooldown" : "No cooldown";
    return (
      '<article class="br-skill-card">' +
        '<div class="br-skill-icon">A' + (i + 1) + "</div>" +
        "<div>" +
          '<div class="br-skill-name">' + s.name + "</div>" +
          '<div class="br-skill-desc">' + s.description + "</div>" +
          '<div class="br-skill-meta"><span>' + s.type + "</span><span>" + cd + "</span></div>" +
        "</div>" +
      "</article>"
    );
  }).join("");

  if (detail.passive || extras.passive) {
    var passive = detail.passive || extras.passive;
    skillsEl.innerHTML +=
      '<article class="br-skill-card">' +
        '<div class="br-skill-icon">P</div>' +
        "<div>" +
          '<div class="br-skill-name">Passive</div>' +
          '<div class="br-skill-desc">' + passive + "</div>" +
        "</div>" +
      "</article>";
  }

  function artifactChips(names) {
    return names.map(function (name) {
      var art = data.artifacts.find(function (a) { return a.name === name; });
      var icon = art && art.image ? art.image : "";
      var inner = (icon ? '<img src="' + icon + '" alt="">' : "") + name;
      if (art && art.icon) {
        return '<a class="br-artifact-chip" href="battlerise-artifacts.html#artifact-' + encodeURIComponent(art.icon) + '">' + inner + "</a>";
      }
      return '<span class="br-artifact-chip">' + inner + "</span>";
    }).join("");
  }

  document.getElementById("br-pve-stats").innerHTML = gear.pveStats.map(function (s) { return "<li>" + s + "</li>"; }).join("");
  document.getElementById("br-pvp-stats").innerHTML = gear.pvpStats.map(function (s) { return "<li>" + s + "</li>"; }).join("");
  document.getElementById("br-pve-sets").innerHTML = artifactChips(gear.pveSets);
  document.getElementById("br-pvp-sets").innerHTML = artifactChips(gear.pvpSets);

  if (detail.stats) {
    var statsEl = document.getElementById("br-base-stats");
    if (statsEl) {
      var s = detail.stats;
      statsEl.innerHTML =
        '<div class="br-stat"><strong>' + Math.round(s.health) + "</strong>HP</div>" +
        '<div class="br-stat"><strong>' + Math.round(s.speed) + "</strong>Speed</div>" +
        '<div class="br-stat"><strong>' + Math.round(s.physicalDamage) + "</strong>Physical DMG</div>" +
        '<div class="br-stat"><strong>' + Math.round(s.magicDamage) + "</strong>Magic DMG</div>" +
        '<div class="br-stat"><strong>' + Math.round(s.armor) + "</strong>Armor</div>";
    }
  }

  document.querySelectorAll(".br-champion-tab").forEach(function (tab) {
    tab.addEventListener("click", function (e) {
      e.preventDefault();
      var target = document.querySelector(tab.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelectorAll(".br-champion-tab").forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
    });
  });

  if (window.TriumphCommunity) {
    TriumphCommunity.updateAuthUI();
  }
  if (window.TriumphEdits) {
    TriumphEdits.initEditableSections();
  }
})();
