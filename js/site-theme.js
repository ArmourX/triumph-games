/* Triumph Guides — light/dark toggle */
(function () {
  var STORAGE_KEY = "tg-color-theme";

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    updateToggleLabels();
  }

  function updateToggleLabels() {
    var theme = currentTheme();
    var next = theme === "dark" ? "light" : "dark";
    document.querySelectorAll(".tg-theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-label", "Switch to " + next + " mode");
      btn.setAttribute("title", "Switch to " + next + " mode");
    });
  }

  function createToggle() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tg-theme-toggle";
    btn.innerHTML =
      '<span class="tg-theme-toggle-track" aria-hidden="true">' +
        '<svg class="tg-theme-icon tg-theme-icon--sun" viewBox="0 0 24 24" aria-hidden="true">' +
          '<circle cx="12" cy="12" r="4" fill="currentColor"/>' +
          '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
        "</svg>" +
        '<svg class="tg-theme-icon tg-theme-icon--moon" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" fill="currentColor"/>' +
        "</svg>" +
      "</span>";
    btn.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark");
    });
    return btn;
  }

  function injectThemeToggle() {
    var siteActions = document.querySelector(".site-header .header-actions");
    if (siteActions && !siteActions.querySelector(".tg-theme-toggle")) {
      siteActions.insertBefore(createToggle(), siteActions.firstChild);
    }

    var hubInner = document.querySelector(".hub-header .hub-header-inner");
    if (hubInner && !hubInner.querySelector(".tg-theme-toggle")) {
      var tools = hubInner.querySelector(".hub-header-tools");
      if (!tools) {
        tools = document.createElement("div");
        tools.className = "hub-header-tools";
        hubInner.appendChild(tools);
      }
      tools.appendChild(createToggle());
    }

    updateToggleLabels();
  }

  document.addEventListener("DOMContentLoaded", injectThemeToggle);
})();
