(function () {
  var PASSWORD = "Elumia6551@";
  var STORAGE_KEY = "elumia-grid-access";

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async function loadAppScripts() {
    if (window.__elumiaGridAppLoaded) return;
    window.__elumiaGridAppLoaded = true;
    await loadScript("js/elumia-lattice.js");
  }

  function setUnlocked(unlocked) {
    document.body.classList.toggle("elumia-grid-unlocked", unlocked);
  }

  function unlock() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setUnlocked(true);
    loadAppScripts();
  }

  function showError(message) {
    var error = document.getElementById("elumia-grid-gate-error");
    if (error) error.textContent = message || "";
  }

  function tryUnlockFromInput() {
    var input = document.getElementById("elumia-grid-gate-password");
    var value = input ? String(input.value || "") : "";
    if (value === PASSWORD) {
      showError("");
      unlock();
      return true;
    }
    showError("Incorrect password. Try again.");
    if (input) {
      input.focus();
      input.select();
    }
    return false;
  }

  function init() {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setUnlocked(true);
      loadAppScripts();
      return;
    }

    setUnlocked(false);

    var form = document.getElementById("elumia-grid-gate-form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopPropagation();
        tryUnlockFromInput();
      });
    }

    var input = document.getElementById("elumia-grid-gate-password");
    if (input) {
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          tryUnlockFromInput();
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
