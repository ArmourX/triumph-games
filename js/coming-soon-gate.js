(function () {
  var SITE = window.TRIUMPH_SITE || {};
  var SOON = SITE.comingSoon || {};
  var LOCKED = SITE.passwordProtected || {};
  var path = (window.location.pathname || "").toLowerCase();

  function detectGame() {
    if (/elumia/.test(path)) return "elumia";
    if (/armourx/.test(path)) return "armourx";
    var params = new URLSearchParams(window.location.search);
    var game = (params.get("game") || "").toLowerCase();
    if (game && (SOON[game] || LOCKED[game])) return game;
    return null;
  }

  function isUnlocked(game) {
    var config = LOCKED[game];
    if (!config) return true;
    try {
      return localStorage.getItem(config.storageKey) === "1";
    } catch (e) {
      return false;
    }
  }

  function setUnlocked(game) {
    var config = LOCKED[game];
    if (!config) return;
    try {
      localStorage.setItem(config.storageKey, "1");
    } catch (e) {
      /* ignore */
    }
  }

  function markNavLinks() {
    Object.keys(SOON).forEach(function (slug) {
      document.querySelectorAll('a[href="' + slug + '.html"]').forEach(function (link) {
        if (link.closest(".hub-nav")) return;
        link.classList.add("hub-game-pill--soon");
        if (!link.querySelector(".hub-soon-tag") && (link.classList.contains("hub-game-pill") || link.closest(".main-nav"))) {
          var tag = document.createElement("span");
          tag.className = "hub-soon-tag";
          tag.textContent = "Soon";
          link.appendChild(tag);
        }
      });
    });

    document.querySelectorAll(".game-card").forEach(function (card) {
      var href = (card.getAttribute("href") || "").toLowerCase();
      Object.keys(SOON).forEach(function (slug) {
        if (href.indexOf(slug) >= 0) {
          card.classList.add("game-card--soon");
          var badge = card.querySelector(".badge");
          if (badge) {
            badge.textContent = "Coming Soon";
            badge.classList.remove("badge-featured", "badge-new", "badge-early");
            badge.classList.add("badge-soon");
          }
          var linkLabel = card.querySelector(".game-link");
          if (linkLabel) linkLabel.textContent = "Coming soon";
        }
      });
    });
  }

  function renderComingSoon(game) {
    var title = SOON[game];
    var panel = document.createElement("div");
    panel.className = "container hub-coming-soon";
    panel.innerHTML =
      '<div class="hub-coming-soon-inner">' +
        '<p class="hub-coming-soon-label">Coming Soon</p>' +
        "<h1>" + title + "</h1>" +
        "<p>We're building the " + title + " wiki — guides, tier lists, and databases are on the way. BattleRise is live now.</p>" +
        '<div class="hub-coming-soon-actions">' +
          '<a href="battlerise.html" class="tg-btn tg-btn--primary">Explore BattleRise</a>' +
          '<a href="index.html" class="tg-btn tg-btn--ghost">Back to home</a>' +
        "</div>" +
      "</div>";

    var hubNav = document.querySelector(".hub-nav");
    if (hubNav) hubNav.hidden = true;

    var main = document.querySelector("main");
    if (main) {
      main.innerHTML = "";
      main.appendChild(panel);
      return;
    }

    var sub = document.querySelector(".hub-subpage");
    if (sub) sub.hidden = true;

    var footer = document.querySelector(".hub-footer, .site-footer");
    if (footer) footer.parentNode.insertBefore(panel, footer);
    else document.body.appendChild(panel);
  }

  function renderPasswordGate(game) {
    var config = LOCKED[game];
    if (!config) return;

    var hubNav = document.querySelector(".hub-nav");
    if (hubNav) hubNav.hidden = true;

    var main = document.querySelector("main");
    var sub = document.querySelector(".hub-subpage");
    if (sub) sub.hidden = true;

    var panel = document.createElement("div");
    panel.className = "container hub-coming-soon hub-password-gate";
    panel.innerHTML =
      '<div class="hub-coming-soon-inner">' +
        '<p class="hub-coming-soon-label">Early Access</p>' +
        "<h1>" + config.title + "</h1>" +
        "<p>This wiki section is in early access. Enter the password to continue.</p>" +
        '<form class="hub-password-form" id="hub-password-form">' +
          '<label class="hub-password-field">' +
            "<span>Password</span>" +
            '<input type="password" name="password" autocomplete="current-password" required autofocus>' +
          "</label>" +
          '<p class="hub-password-error" hidden>Incorrect password. Try again.</p>' +
          '<div class="hub-coming-soon-actions">' +
            '<button type="submit" class="tg-btn tg-btn--primary">Enter wiki</button>' +
            '<a href="index.html" class="tg-btn tg-btn--ghost">Back to home</a>' +
          "</div>" +
        "</form>" +
      "</div>";

    if (main) {
      main.innerHTML = "";
      main.appendChild(panel);
    } else {
      var footer = document.querySelector(".hub-footer, .site-footer");
      if (footer) footer.parentNode.insertBefore(panel, footer);
      else document.body.appendChild(panel);
    }

    var form = panel.querySelector("#hub-password-form");
    var errorEl = panel.querySelector(".hub-password-error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = (new FormData(form).get("password") || "").trim();
      if (value !== config.password) {
        errorEl.hidden = false;
        return;
      }
      setUnlocked(game);
      window.location.reload();
    });
  }

  function gateGuideCreate() {
    var select = document.getElementById("guide-game");
    if (!select) return;
    Object.keys(SOON).forEach(function (slug) {
      var opt = select.querySelector('option[value="' + slug + '"]');
      if (opt) {
        opt.disabled = true;
        opt.textContent = SOON[slug] + " (Coming Soon)";
      }
    });
  }

  markNavLinks();
  gateGuideCreate();

  var game = detectGame();
  if (!game) return;

  if (LOCKED[game]) {
    if (!isUnlocked(game)) {
      renderPasswordGate(game);
      return;
    }
  }

  if (SOON[game]) renderComingSoon(game);
})();
