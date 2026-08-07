(function () {
  var guest = document.getElementById("tg-account-guest");
  var user = document.getElementById("tg-account-user");
  var myEdits = document.getElementById("tg-my-edits");
  var myGuides = document.getElementById("tg-my-guides");
  var adminLink = document.getElementById("tg-admin-link");
  var TUG = window.TriumphUserGuides;

  function escapeHtml(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderMyEdits(username) {
    var pending = TriumphEdits.getPendingEdits().filter(function (e) {
      return e.username === username && e.status === "pending";
    });
    if (!pending.length) {
      myEdits.innerHTML = '<p class="tg-empty">No pending edits. Visit a wiki page and click the edit icon on any section.</p>';
      return;
    }
    myEdits.innerHTML = pending.map(function (e) {
      return (
        '<article class="tg-edit-card tg-edit-card--pending">' +
          '<header><strong>' + e.pageTitle + '</strong> · ' + e.fieldLabel + '</header>' +
          '<p class="tg-edit-game">' + e.game + ' · submitted ' + new Date(e.createdAt).toLocaleString() + '</p>' +
          '<div class="tg-diff"><div><span>Proposed</span><pre>' + escapeHtml(e.proposedText.slice(0, 400)) + (e.proposedText.length > 400 ? "…" : "") + '</pre></div></div>' +
          '<p class="tg-edit-status">Awaiting admin approval</p>' +
        '</article>'
      );
    }).join("");
  }

  function renderMyGuides(userId) {
    var guides = TUG.getGuidesByAuthor(userId);
    if (!guides.length) {
      myGuides.innerHTML = '<p class="tg-empty">No guides yet. <a href="guide-create.html">Write your first guide</a>.</p>';
      return;
    }
    myGuides.innerHTML = guides.map(function (g) {
      var viewUrl = g.status === "published" ? "guide-view.html?id=" + g.id : "guide-create.html?id=" + g.id;
      return (
        '<article class="tg-edit-card">' +
          '<header><strong>' + escapeHtml(g.title) + '</strong></header>' +
          '<p class="tg-edit-game">' + TUG.gameLabel(g.game) + ' · ' +
            '<span class="tg-guide-status-badge tg-guide-status-badge--' + g.status + '">' + TUG.statusLabel(g.status) + '</span> · ' +
            new Date(g.updatedAt).toLocaleString() +
          '</p>' +
          (g.rejectNote ? '<div class="tg-guide-reject-note">' + escapeHtml(g.rejectNote) + '</div>' : '') +
          '<div class="tg-edit-actions">' +
            '<a href="' + viewUrl + '" class="tg-btn tg-btn--ghost">' + (g.status === "published" ? "View" : "Edit") + '</a>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  function refresh() {
    var session = TriumphCommunity.getSession();
    if (!session) {
      guest.hidden = false;
      user.hidden = true;
      return;
    }
    guest.hidden = true;
    user.hidden = false;
    document.getElementById("tg-account-name").textContent = session.username;
    document.getElementById("tg-account-avatar").textContent = session.username.charAt(0).toUpperCase();
    adminLink.hidden = !TriumphCommunity.isAdmin();
    renderMyGuides(session.userId);
    renderMyEdits(session.username);
  }

  document.getElementById("tg-show-signup").addEventListener("click", function () {
    TriumphCommunity.openAuthModal("signup", refresh);
  });
  document.getElementById("tg-show-login").addEventListener("click", function () {
    TriumphCommunity.openAuthModal("login", refresh);
  });
  document.getElementById("tg-logout-account").addEventListener("click", function () {
    TriumphCommunity.logout();
    refresh();
  });

  refresh();
  TriumphCommunity.updateAuthUI();
})();
