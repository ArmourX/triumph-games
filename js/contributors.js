/* Load registered community usernames into hub contributor sections. */
(function () {
  function renderGrid(grid, usernames) {
    grid.innerHTML = "";
    if (!usernames.length) {
      grid.innerHTML = '<p class="contributors-empty">No contributors yet — sign up and help build the wiki.</p>';
      return;
    }
    usernames.forEach(function (name) {
      var item = document.createElement("div");
      item.className = "contributor";
      var label = document.createElement("span");
      label.className = "contributor-name";
      label.textContent = name;
      item.appendChild(label);
      grid.appendChild(item);
    });
  }

  function init() {
    var grids = document.querySelectorAll(".contributors-grid[data-contributors]");
    if (!grids.length || !window.TriumphAPI || !TriumphAPI.listContributors) return;

    grids.forEach(function (grid) {
      grid.innerHTML = '<p class="contributors-empty">Loading contributors…</p>';
    });

    TriumphAPI.listContributors()
      .then(function (names) {
        grids.forEach(function (grid) {
          renderGrid(grid, names);
        });
      })
      .catch(function () {
        grids.forEach(function (grid) {
          grid.innerHTML = '<p class="contributors-empty">Contributors could not be loaded right now.</p>';
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
