(function () {
  var denied = document.getElementById("tg-admin-denied");
  var queue = document.getElementById("tg-admin-queue");
  var guidesQueue = document.getElementById("tg-admin-guides");
  var guidesHeading = document.getElementById("tg-admin-guides-heading");
  var editsHeading = document.getElementById("tg-admin-edits-heading");
  var TUG = window.TriumphUserGuides;

  function escapeHtml(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function guidePreview(guide) {
    var html = "<strong>" + escapeHtml(guide.title) + "</strong>";
    if (guide.description) html += "<p>" + escapeHtml(guide.description) + "</p>";
    (guide.sections || []).slice(0, 2).forEach(function (sec) {
      if (sec.heading) html += "<p><em>" + escapeHtml(sec.heading) + "</em></p>";
      if (sec.body) html += "<p>" + escapeHtml(sec.body.slice(0, 200)) + (sec.body.length > 200 ? "…" : "") + "</p>";
      if (sec.images && sec.images.length) html += "<p>" + sec.images.length + " image(s) in section</p>";
    });
    html += '<a href="guide-view.html?id=' + guide.id + '" class="tg-link-btn" target="_blank">Preview full guide</a>';
    return html;
  }

  function renderGuidesQueue() {
    var pending = TUG.getPendingGuides();
    guidesHeading.hidden = false;
    guidesQueue.hidden = false;
    if (!pending.length) {
      guidesQueue.innerHTML = '<p class="tg-empty">No pending guides.</p>';
      return;
    }
    guidesQueue.innerHTML = pending.map(function (g) {
      return (
        '<article class="tg-edit-card" data-guide-id="' + g.id + '">' +
          '<header><strong>' + escapeHtml(g.title) + '</strong></header>' +
          '<p class="tg-edit-game">' + TUG.gameLabel(g.game) + ' · by <strong>' + escapeHtml(g.authorUsername) + '</strong> · ' + new Date(g.updatedAt).toLocaleString() + '</p>' +
          '<div class="tg-guide-admin-preview">' + guidePreview(g) + '</div>' +
          '<div class="tg-edit-actions">' +
            '<button type="button" class="tg-btn tg-btn--primary tg-guide-approve">Approve &amp; publish</button>' +
            '<button type="button" class="tg-btn tg-btn--ghost tg-guide-reject">Reject</button>' +
          '</div>' +
        '</article>'
      );
    }).join("");

    guidesQueue.querySelectorAll(".tg-guide-approve").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.closest(".tg-edit-card").getAttribute("data-guide-id");
        TUG.approveGuide(id, TriumphCommunity.getSession().username);
        renderGuidesQueue();
      });
    });
    guidesQueue.querySelectorAll(".tg-guide-reject").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.closest(".tg-edit-card").getAttribute("data-guide-id");
        var note = prompt("Optional rejection note for the author:");
        if (note === null) return;
        TUG.rejectGuide(id, TriumphCommunity.getSession().username, note);
        renderGuidesQueue();
      });
    });
  }

  function renderEditsQueue() {
    var pending = TriumphEdits.getPendingEdits().filter(function (e) { return e.status === "pending"; });
    editsHeading.hidden = false;
    queue.hidden = false;
    if (!pending.length) {
      queue.innerHTML = '<p class="tg-empty">No pending wiki edits.</p>';
      return;
    }
    queue.innerHTML = pending.map(function (e) {
      return (
        '<article class="tg-edit-card" data-edit-id="' + e.id + '">' +
          '<header><strong>' + escapeHtml(e.pageTitle) + '</strong> · ' + escapeHtml(e.fieldLabel) + '</header>' +
          '<p class="tg-edit-game">' + escapeHtml(e.game) + ' · by <strong>' + escapeHtml(e.username) + '</strong> · ' + new Date(e.createdAt).toLocaleString() + '</p>' +
          '<div class="tg-diff">' +
            '<div><span>Current</span><pre>' + escapeHtml(e.originalText.slice(0, 600)) + '</pre></div>' +
            '<div><span>Proposed</span><pre>' + escapeHtml(e.proposedText.slice(0, 600)) + '</pre></div>' +
          '</div>' +
          '<div class="tg-edit-actions">' +
            '<button type="button" class="tg-btn tg-btn--primary tg-approve">Approve</button>' +
            '<button type="button" class="tg-btn tg-btn--ghost tg-reject">Reject</button>' +
          '</div>' +
        '</article>'
      );
    }).join("");

    queue.querySelectorAll(".tg-approve").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".tg-edit-card");
        var id = card.getAttribute("data-edit-id");
        TriumphEdits.approveEdit(id, TriumphCommunity.getSession().username);
        renderEditsQueue();
      });
    });
    queue.querySelectorAll(".tg-reject").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".tg-edit-card");
        var id = card.getAttribute("data-edit-id");
        TriumphEdits.rejectEdit(id, TriumphCommunity.getSession().username);
        renderEditsQueue();
      });
    });
  }

  function init() {
    TriumphCommunity.updateAuthUI();
    if (!TriumphCommunity.isAdmin()) {
      denied.hidden = false;
      queue.hidden = true;
      guidesQueue.hidden = true;
      return;
    }
    denied.hidden = true;
    renderGuidesQueue();
    renderEditsQueue();
  }

  init();
})();
