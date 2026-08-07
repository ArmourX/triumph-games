(function () {
  var game = document.body.getAttribute("data-guide-game");
  if (!game || !window.TriumphUserGuides) return;

  var TUG = window.TriumphUserGuides;
  var TC = window.TriumphCommunity;
  var listEl = document.getElementById("community-guides-list");
  var emptyEl = document.getElementById("community-guides-empty");
  if (!listEl) return;

  var writeBtn = document.getElementById("write-guide-btn");
  if (writeBtn) {
    writeBtn.href = "guide-create.html?game=" + game;
    writeBtn.addEventListener("click", function (e) {
      if (!TC.getSession()) {
        e.preventDefault();
        TC.openAuthModal("login", function () {
          window.location.href = "guide-create.html?game=" + game;
        });
      }
    });
  }

  var published = TUG.getPublishedGuides(game);
  if (!published.length) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;

  listEl.innerHTML = published.map(function (g) {
    return (
      '<a href="guide-view.html?id=' + g.id + '" class="guide-page-item tg-guide-page-item--community">' +
        '<h2>' + TUG.escapeHtml(g.title) + '</h2>' +
        '<p>' + TUG.escapeHtml(g.description || "Community guide") + '</p>' +
        '<p class="tg-guide-author">By ' + TUG.escapeHtml(g.authorUsername) + '</p>' +
      '</a>'
    );
  }).join("");
})();
