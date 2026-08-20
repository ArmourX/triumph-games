(function () {
  var PASSWORD = "Elumia6551new";
  var STORAGE_KEY = "erc6551-access";

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
    if (window.__elumiaInvAppLoaded) return;
    window.__elumiaInvAppLoaded = true;
    await loadScript("js/site-ui.js");
    await loadScript("js/elumia-item-icons.js");
    await loadScript("js/elumia-inventory.js");
  }

  function setUnlocked(unlocked) {
    document.body.classList.toggle("elumia-vault-unlocked", unlocked);
  }

  function unlock() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setUnlocked(true);
    loadAppScripts();
  }

  function showError(message) {
    var error = document.getElementById("elumia-inv-gate-error");
    if (error) error.textContent = message || "";
  }

  function tryUnlockFromInput() {
    var input = document.getElementById("elumia-inv-gate-password");
    var value = input ? String(input.value || "").trim() : "";
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
    if (new URLSearchParams(window.location.search).get("embed") === "1") {
      document.body.classList.add("elumia-inv-embed");
      setUnlocked(true);
      loadAppScripts();
      return;
    }

    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setUnlocked(true);
      loadAppScripts();
      return;
    }

    setUnlocked(false);

    var form = document.getElementById("elumia-inv-gate-form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopPropagation();
        tryUnlockFromInput();
      });
    }

    var input = document.getElementById("elumia-inv-gate-password");
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
