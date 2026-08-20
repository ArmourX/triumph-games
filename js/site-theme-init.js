/* Triumph Guides — always start dark (black & gold) */
(function () {
  var theme = "dark";
  try {
    var stored = localStorage.getItem("tg-color-theme");
    if (stored === "light" || stored === "dark") theme = stored;
  } catch (e) {}
  document.documentElement.setAttribute("data-theme", theme);
})();
