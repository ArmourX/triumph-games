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
    if (window.__erc6551AppLoaded) return;
    window.__erc6551AppLoaded = true;
    await loadScript(
      "https://cdn.jsdelivr.net/npm/ethers@6.13.5/dist/ethers.umd.min.js"
    );
    await loadScript("js/site-ui.js");
    await loadScript("js/erc6551-test.js");
  }

  function setUnlocked(unlocked) {
    document.body.classList.toggle("erc6551-unlocked", unlocked);
  }

  function unlock() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setUnlocked(true);
    loadAppScripts();
  }

  function showError(message) {
    var error = document.getElementById("erc6551-gate-error");
    if (error) error.textContent = message || "";
  }

  function tryUnlockFromInput() {
    var input = document.getElementById("erc6551-gate-password");
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
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setUnlocked(true);
      loadAppScripts();
      return;
    }

    setUnlocked(false);

    var form = document.getElementById("erc6551-gate-form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopPropagation();
        tryUnlockFromInput();
      });
    }

    var input = document.getElementById("erc6551-gate-password");
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
