(function () {
  var PASSWORD = "Elumianew2026@";
  var STORAGE_KEY = "elumia-database2-access";

  function setUnlocked(unlocked) {
    document.body.classList.toggle("edb2-unlocked", unlocked);
    var app = document.getElementById("edb2-app");
    if (app) app.hidden = !unlocked;
  }

  function unlock() {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setUnlocked(true);
    if (window.ElumiaDatabase2 && typeof window.ElumiaDatabase2.init === "function") {
      window.ElumiaDatabase2.init();
    }
  }

  function showError(message) {
    var error = document.getElementById("edb2-gate-error");
    if (error) error.textContent = message || "";
  }

  function tryUnlockFromInput() {
    var input = document.getElementById("edb2-gate-password");
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
      if (window.ElumiaDatabase2 && typeof window.ElumiaDatabase2.init === "function") {
        window.ElumiaDatabase2.init();
      }
      return;
    }

    setUnlocked(false);

    var form = document.getElementById("edb2-gate-form");
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
