/* Triumph Guides — header scroll + mobile navigation */
(function () {
  function initHeaderScroll() {
    var headers = document.querySelectorAll(".site-header, .hub-header");
    if (!headers.length) return;
    var onScroll = function () {
      var scrolled = window.scrollY > 12;
      headers.forEach(function (h) {
        h.classList.toggle("is-scrolled", scrolled);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function buildMobileDrawer(header) {
    if (document.getElementById("tg-mobile-drawer")) return;

    var nav = header.querySelector(".main-nav, .hub-games-nav");
    if (!nav) return;

    var actions = header.querySelector(".header-actions");

    var btn = header.querySelector(".mobile-menu-btn");
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "mobile-menu-btn";
      btn.setAttribute("aria-label", "Open menu");
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = "<span></span><span></span><span></span>";
      var hubInner = header.querySelector(".hub-header-inner");
      if (hubInner) {
        var tools = hubInner.querySelector(".hub-header-tools");
        if (!tools) {
          tools = document.createElement("div");
          tools.className = "hub-header-tools";
          hubInner.appendChild(tools);
        }
        tools.appendChild(btn);
      } else {
        header.querySelector(".header-inner").appendChild(btn);
      }
    }

    var overlay = document.createElement("div");
    overlay.id = "tg-mobile-drawer";
    overlay.className = "tg-mobile-drawer";
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="tg-mobile-drawer-panel" role="dialog" aria-modal="true" aria-label="Navigation">' +
        '<div class="tg-mobile-drawer-head">' +
          '<span class="tg-mobile-drawer-title">Menu</span>' +
          '<button type="button" class="tg-mobile-drawer-close" aria-label="Close menu">&times;</button>' +
        '</div>' +
        '<nav class="tg-mobile-drawer-nav" id="tg-mobile-drawer-nav"></nav>' +
        '<div class="tg-mobile-drawer-actions" id="tg-mobile-drawer-actions"></div>' +
      '</div>';

    document.body.appendChild(overlay);

    var navHtml = nav.innerHTML;
    var hubNav = document.querySelector(".hub-nav .hub-nav-inner");
    if (hubNav) {
      navHtml += '<div class="tg-mobile-drawer-divider">Sections</div>' + hubNav.innerHTML;
    }
    overlay.querySelector("#tg-mobile-drawer-nav").innerHTML = navHtml;

    var actionsTarget = overlay.querySelector("#tg-mobile-drawer-actions");
    if (actions) {
      actionsTarget.innerHTML = actions.innerHTML;
    } else {
      actionsTarget.innerHTML =
        '<a href="account.html" class="btn btn-ghost">Account</a>' +
        '<a href="index.html#games" class="btn btn-primary">Browse guides</a>';
    }

    function close() {
      overlay.hidden = true;
      document.body.classList.remove("tg-mobile-open");
      btn.setAttribute("aria-expanded", "false");
      btn.classList.remove("is-open");
    }

    function open() {
      overlay.hidden = false;
      document.body.classList.add("tg-mobile-open");
      btn.setAttribute("aria-expanded", "true");
      btn.classList.add("is-open");
    }

    btn.addEventListener("click", function () {
      if (overlay.hidden) open();
      else close();
    });
    overlay.querySelector(".tg-mobile-drawer-close").addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    overlay.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) close();
    });
  }

  function initWelcomeModal() {
    var STORAGE_KEY = "tg_welcome_dismissed";
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    if (document.getElementById("tg-welcome-modal")) return;
    if (/admin\.html$/i.test(location.pathname)) return;

    var discordUrl = (window.TRIUMPH_SITE && TRIUMPH_SITE.discordUrl) ||
      "https://discord.com/invite/triumphgames";

    var overlay = document.createElement("div");
    overlay.id = "tg-welcome-modal";
    overlay.className = "tg-modal-overlay tg-welcome-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "tg-welcome-title");
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="tg-modal tg-welcome-modal">' +
        '<button type="button" class="tg-modal-close tg-welcome-close" aria-label="Close">&times;</button>' +
        '<p class="section-label tg-welcome-eyebrow">Triumph Guides</p>' +
        '<h2 class="tg-modal-title" id="tg-welcome-title">Welcome to the Wiki</h2>' +
        '<p class="tg-modal-desc tg-welcome-desc">' +
          "Community wikis, tier lists, and guides for Triumph games. " +
          "Join Discord to share strategies and help keep the wiki up to date." +
        "</p>" +
        '<div class="tg-welcome-actions">' +
          '<a href="' + discordUrl + '" class="btn btn-primary btn-lg tg-welcome-discord" target="_blank" rel="noopener">Join Discord</a>' +
          '<button type="button" class="btn btn-outline btn-lg tg-welcome-continue">Continue to wiki</button>' +
        "</div>" +
      "</div>";

    document.body.appendChild(overlay);

    function dismiss() {
      sessionStorage.setItem(STORAGE_KEY, "1");
      overlay.hidden = true;
      document.body.classList.remove("tg-modal-open");
    }

    function show() {
      overlay.hidden = false;
      document.body.classList.add("tg-modal-open");
      overlay.querySelector(".tg-welcome-continue").focus();
    }

    overlay.querySelector(".tg-welcome-continue").addEventListener("click", dismiss);
    overlay.querySelector(".tg-welcome-close").addEventListener("click", dismiss);
    overlay.querySelector(".tg-welcome-discord").addEventListener("click", dismiss);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) dismiss();
    });
    document.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape" && !overlay.hidden) {
        dismiss();
        document.removeEventListener("keydown", onKey);
      }
    });

    window.setTimeout(show, 350);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHeaderScroll();
    document.querySelectorAll(".site-header, .hub-header").forEach(buildMobileDrawer);
    initWelcomeModal();
  });
})();
