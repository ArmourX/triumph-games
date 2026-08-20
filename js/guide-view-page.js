(function () {

  var TUG = window.TriumphUserGuides;

  var TC = window.TriumphCommunity;

  var params = new URLSearchParams(window.location.search);

  var guideId = params.get("id");

  var root = document.getElementById("guide-view-root");

  var backLink = document.getElementById("guide-view-back");



  function renderGuide(guide) {

    document.title = guide.title + " | Triumph Guides";

    backLink.href = TUG.gameGuidesUrl(guide.game);

    backLink.textContent = "\u2190 Back to " + TUG.gameLabel(guide.game) + " guides";



    var session = TC.getSession();

    var isAuthor = session && session.userId === guide.authorId;

    var isAdmin = TC.isAdmin();

    var canView = guide.status === "published" || isAuthor || isAdmin;



    if (!canView) {

      root.innerHTML = '<h1>Guide not available</h1><p class="hub-subpage-intro">This guide is not published yet.</p>';

      return;

    }



    var actions = "";

    if (isAuthor && guide.status !== "pending") {

      actions += '<a href="guide-create.html?id=' + guide.id + '" class="tg-btn tg-btn--ghost">Edit</a>';

    }

    if (isAdmin) {

      actions += '<button type="button" class="tg-btn tg-btn--danger" id="tg-guide-delete">Delete</button>';

    }



    var rejectNote = "";

    if (guide.status === "rejected" && guide.rejectNote && isAuthor) {

      rejectNote = '<div class="tg-guide-reject-note"><strong>Rejected:</strong> ' + TUG.escapeHtml(guide.rejectNote) + '</div>';

    }



    root.innerHTML =

      '<article class="tg-guide-view">' +

        '<header class="tg-guide-view-header">' +

          '<h1>' + TUG.escapeHtml(guide.title) + '</h1>' +

          (guide.description ? '<p class="hub-subpage-intro">' + TUG.escapeHtml(guide.description) + '</p>' : '') +

          '<p class="tg-guide-view-meta">By <strong>' + TUG.escapeHtml(guide.authorUsername) + '</strong> · ' +

            TUG.gameLabel(guide.game) + ' · ' + guide.type + ' · ' +

            new Date(guide.publishedAt || guide.updatedAt || guide.createdAt).toLocaleDateString() +

            (guide.status !== "published" ? ' · <span class="tg-guide-status-badge tg-guide-status-badge--' + guide.status + '">' + TUG.statusLabel(guide.status) + '</span>' : '') +

          '</p>' +

          rejectNote +

          (actions ? '<div class="tg-guide-view-actions">' + actions + '</div>' : '') +

        '</header>' +

        '<div id="guide-sections-view"></div>' +

      '</article>';



    var deleteBtn = document.getElementById("tg-guide-delete");

    if (deleteBtn) {

      deleteBtn.addEventListener("click", function () {

        if (!confirm('Delete "' + guide.title + '" permanently? This cannot be undone.')) return;

        TUG.deleteGuide(guide.id).then(function () {

          window.location.href = TUG.gameGuidesUrl(guide.game);

        }).catch(function (err) { alert(err.message); });

      });

    }



    var sectionsView = document.getElementById("guide-sections-view");

    var imagePromises = [];



    (guide.sections || []).forEach(function (sec) {

      var secEl = document.createElement("section");

      secEl.className = "tg-guide-view-section";

      var html = "";

      if (sec.heading) html += "<h2>" + TUG.escapeHtml(sec.heading) + "</h2>";

      if (sec.body) {

        html += sec.body.split("\n\n").map(function (p) {

          return "<p>" + TUG.escapeHtml(p).replace(/\n/g, "<br>") + "</p>";

        }).join("");

      }

      secEl.innerHTML = html;



      (sec.images || []).forEach(function (img) {

        var fig = document.createElement("figure");

        fig.className = "tg-guide-view-figure";

        var imgEl = document.createElement("img");

        imgEl.alt = img.caption || "Guide image";

        fig.appendChild(imgEl);

        if (img.caption) {

          var cap = document.createElement("figcaption");

          cap.textContent = img.caption;

          fig.appendChild(cap);

        }

        secEl.appendChild(fig);

        imagePromises.push(

          TUG.getImageUrl(img.url || img.id).then(function (url) {

            if (url) imgEl.src = url;

          })

        );

      });



      sectionsView.appendChild(secEl);

    });



    return Promise.all(imagePromises);

  }



  function init() {

    TC.refreshSession().finally(function () {

      TC.updateAuthUI();

      if (!guideId) {

        root.innerHTML = '<h1>Guide not found</h1><p>No guide ID provided.</p>';

        return;

      }

      TUG.getGuideById(guideId).then(function (guide) {

        return renderGuide(guide);

      }).catch(function () {

        root.innerHTML = '<h1>Guide not found</h1><p>This guide may have been deleted.</p>';

      });

    });

  }



  init();

})();

