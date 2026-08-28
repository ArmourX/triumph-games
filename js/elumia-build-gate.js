(function () {
  var PASSWORD = "Elumianew2026@";
  var STORAGE_KEY = "elumia-build-access";

  function setUnlocked(unlocked) {
    document.body.classList.toggle("ebld-unlocked", unlocked);
    var app = document.getElementById("ebld-app");
    if (app) app.hidden = !unlocked;
  }

  function unlock() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setUnlocked(true);
    if (window.ElumiaBuild && typeof window.ElumiaBuild.init === "function") {
      window.ElumiaBuild.init();
    }
  }

  function showError(message) {
    var error = document.getElementById("ebld-gate-error");
    if (error) error.textContent = message || "";
  }

  function tryUnlockFromInput() {
    var input = document.getElementById("ebld-gate-password");
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
      if (window.ElumiaBuild && typeof window.ElumiaBuild.init === "function") {
        window.ElumiaBuild.init();
      }
      return;
    }

    setUnlocked(false);

    var form = document.getElementById("ebld-gate-form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        tryUnlockFromInput();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
