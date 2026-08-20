(function () {
  var game = document.body.getAttribute("data-guide-game");
  if (!game || !window.TriumphUserGuides) return;

  var TUG = window.TriumphUserGuides;
  var TC = window.TriumphCommunity;

  function wireAuthLink(btn) {
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      if (!TC.getSession()) {
        e.preventDefault();
        TC.openAuthModal("login", function () { window.location.href = btn.href; });
      }
    });
  }

  wireAuthLink(document.getElementById("write-guide-btn"));
  wireAuthLink(document.getElementById("write-article-btn"));

  function renderList(posts, listEl, emptyEl) {
    if (!listEl) return;
    if (!posts.length) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    listEl.innerHTML = posts.map(function (g) {
      return (
        '<a href="guide-view.html?id=' + g.id + '" class="guide-page-item tg-guide-page-item--community">' +
          '<h2>' + TUG.escapeHtml(g.title) + '</h2>' +
          '<p>' + TUG.escapeHtml(g.description || (g.type === "article" ? "Community article" : "Community guide")) + '</p>' +
          '<p class="tg-guide-author">By ' + TUG.escapeHtml(g.authorUsername) + '</p>' +
        '</a>'
      );
    }).join("");
  }

  Promise.all([
    TUG.getPublishedGuides(game),
    TUG.getPublishedArticles(game)
  ]).then(function (results) {
    renderList(results[0], document.getElementById("community-guides-list"), document.getElementById("community-guides-empty"));
    renderList(results[1], document.getElementById("community-articles-list"), document.getElementById("community-articles-empty"));
  }).catch(function () {});
})();
