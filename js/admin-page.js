(function () {
  var denied = document.getElementById("tg-admin-denied");
  var main = document.getElementById("tg-admin-main");
  var queue = document.getElementById("tg-admin-queue");
  var elumiaItemsEl = document.getElementById("tg-admin-elumia-items");
  var guidesQueue = document.getElementById("tg-admin-guides");
  var allPostsEl = document.getElementById("tg-admin-all-posts");
  var usersEl = document.getElementById("tg-admin-users");
  var TUG = window.TriumphUserGuides;

  function escapeHtml(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function cardTitle(card) {
    var el = card && card.querySelector("header strong");
    return el ? el.textContent : "this item";
  }

  function guidePreview(guide) {
    var html = "<strong>" + escapeHtml(guide.title) + "</strong> (" + guide.type + ")";
    if (guide.description) html += "<p>" + escapeHtml(guide.description) + "</p>";
    (guide.sections || []).slice(0, 2).forEach(function (sec) {
      if (sec.heading) html += "<p><em>" + escapeHtml(sec.heading) + "</em></p>";
      if (sec.body) html += "<p>" + escapeHtml(sec.body.slice(0, 200)) + "</p>";
    });
    html += '<a href="guide-view.html?id=' + guide.id + '" class="tg-link-btn" target="_blank">Preview</a>';
    return html;
  }

  function deleteActions(id) {
    return '<button type="button" class="tg-btn tg-btn--danger tg-post-delete" data-post-id="' + id + '">Delete</button>';
  }

  function bindDeleteButtons(container, onDone) {
    container.querySelectorAll(".tg-post-delete").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-post-id");
        var title = cardTitle(btn.closest(".tg-edit-card"));
        if (!confirm('Delete "' + title + '" permanently? This cannot be undone.')) return;
        TUG.deleteGuide(id).then(onDone).catch(function (err) { alert(err.message); });
      });
    });
  }

  function renderAllPosts(posts) {
    posts = posts || [];
    allPostsEl.innerHTML = posts.length ? posts.map(function (g) {
      return (
        '<article class="tg-edit-card" data-post-id="' + g.id + '">' +
          '<header><strong>' + escapeHtml(g.title) + '</strong></header>' +
          '<p class="tg-edit-game">' + TUG.gameLabel(g.game) + ' · ' + g.type +
            ' · <span class="tg-guide-status-badge tg-guide-status-badge--' + g.status + '">' + TUG.statusLabel(g.status) + '</span>' +
            ' · by <strong>' + escapeHtml(g.authorUsername) + '</strong></p>' +
          '<div class="tg-edit-actions">' +
            '<a href="guide-view.html?id=' + g.id + '" class="tg-btn tg-btn--ghost" target="_blank">View</a>' +
            deleteActions(g.id) +
          '</div>' +
        '</article>'
      );
    }).join("") : '<p class="tg-empty">No guides or articles yet.</p>';
    bindDeleteButtons(allPostsEl, loadAll);
  }

  function renderUsers(users) {
    users = users || [];
    var session = TriumphCommunity.getSession();
    usersEl.innerHTML = users.length ? users.map(function (u) {
      var isSelf = session && session.userId === u.id;
      var badges = [];
      if (u.isAdmin) {
        badges.push('<span class="tg-guide-status-badge tg-guide-status-badge--published">Admin</span>');
      } else if (u.isMod) {
        badges.push('<span class="tg-guide-status-badge tg-guide-status-badge--mod">Mod</span>');
      } else {
        badges.push('<span class="tg-guide-status-badge tg-guide-status-badge--draft">Member</span>');
      }

      var adminBtn = u.isAdmin
        ? (u.isBuiltInAdmin
          ? '<span class="tg-admin-note">Built-in admin</span>'
          : '<button type="button" class="tg-btn tg-btn--ghost tg-user-demote" data-user-id="' + u.id + '">Remove admin</button>')
        : '<button type="button" class="tg-btn tg-btn--primary tg-user-promote" data-user-id="' + u.id + '">Make admin</button>';

      var modBtn = "";
      if (u.isAdmin) {
        modBtn = '<span class="tg-admin-note">Admin has full access</span>';
      } else if (u.isMod) {
        modBtn = u.isBuiltInMod
          ? '<span class="tg-admin-note">Built-in mod</span>'
          : '<button type="button" class="tg-btn tg-btn--ghost tg-user-demote-mod" data-user-id="' + u.id + '">Remove mod</button>';
      } else {
        modBtn = '<button type="button" class="tg-btn tg-btn--primary tg-user-promote-mod" data-user-id="' + u.id + '">Make mod</button>';
      }

      var removeBtn = isSelf
        ? '<span class="tg-admin-note">Signed in as you</span>'
        : '<button type="button" class="tg-btn tg-btn--danger tg-user-remove" data-user-id="' + u.id + '" data-username="' + escapeHtml(u.username) + '">Remove from site</button>';
      return (
        '<article class="tg-edit-card" data-user-id="' + u.id + '">' +
          '<header><strong>' + escapeHtml(u.username) + '</strong> ' + badges.join(" ") + '</header>' +
          '<p class="tg-edit-game">Joined ' + new Date(u.createdAt).toLocaleString() + '</p>' +
          '<div class="tg-edit-actions">' + adminBtn + modBtn + removeBtn + '</div>' +
        '</article>'
      );
    }).join("") : '<p class="tg-empty">No users yet.</p>';

    usersEl.querySelectorAll(".tg-user-promote").forEach(function (btn) {
      btn.addEventListener("click", function () {
        TriumphAPI.updateAdminUser(btn.getAttribute("data-user-id"), "promote").then(loadUsers);
      });
    });
    usersEl.querySelectorAll(".tg-user-demote").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!confirm("Remove admin privileges for this user?")) return;
        TriumphAPI.updateAdminUser(btn.getAttribute("data-user-id"), "demote").then(loadUsers).catch(function (err) { alert(err.message); });
      });
    });
    usersEl.querySelectorAll(".tg-user-promote-mod").forEach(function (btn) {
      btn.addEventListener("click", function () {
        TriumphAPI.updateAdminUser(btn.getAttribute("data-user-id"), "promoteMod").then(loadUsers).catch(function (err) { alert(err.message); });
      });
    });
    usersEl.querySelectorAll(".tg-user-demote-mod").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!confirm("Remove mod privileges for this user?")) return;
        TriumphAPI.updateAdminUser(btn.getAttribute("data-user-id"), "demoteMod").then(loadUsers).catch(function (err) { alert(err.message); });
      });
    });
    usersEl.querySelectorAll(".tg-user-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var name = btn.getAttribute("data-username");
        if (!confirm('Remove "' + name + '" from the site? Their guides, edits, and votes will be deleted.')) return;
        TriumphAPI.removeAdminUser(btn.getAttribute("data-user-id")).then(loadUsers).catch(function (err) { alert(err.message); });
      });
    });
  }

  function itemPreview(item) {
    var stats = [];
    var bonusData = item.bonuses;
    if (bonusData && bonusData.bonuses && bonusData.bonuses.length) {
      bonusData.bonuses.forEach(function (b) {
        var roll = b.min != null && b.max != null && b.min !== b.max ? b.min + "–" + b.max : (b.min != null ? b.min : b.max);
        stats.push((b.quality || item.rarity) + " " + b.stat + " " + roll);
      });
      if (bonusData.generatorType) stats.unshift("Gen: " + bonusData.generatorType);
    } else {
      if (item.dps != null) stats.push("DPS " + item.dps);
      if (item.speed != null) stats.push("Speed " + item.speed);
      if (item.armor != null) stats.push("Armor " + item.armor);
      if (item.stat) stats.push(item.stat);
      if (item.roll) stats.push("Roll " + item.roll);
    }
    return (
      "<p><strong>" + escapeHtml(item.name) + "</strong> · " + escapeHtml(item.category) +
      " · " + escapeHtml(item.rarity) + "</p>" +
      "<p>" + escapeHtml(stats.join(" · ") || "No stats listed") + "</p>" +
      (item.source ? "<p>Source: " + escapeHtml(item.source) + "</p>" : "")
    );
  }

  function renderQueue(data) {
    data = data || {};
    var pendingEdits = data.edits || [];
    var pendingPosts = data.posts || [];
    var pendingItems = data.elumiaItems || [];

    elumiaItemsEl.innerHTML = pendingItems.length ? pendingItems.map(function (item) {
      return (
        '<article class="tg-edit-card" data-item-id="' + item.id + '">' +
          '<header><strong>' + escapeHtml(item.name) + '</strong> · ' + escapeHtml(item.category) + '</header>' +
          '<p class="tg-edit-game">Submitted by <strong>' + escapeHtml(item.authorUsername) + '</strong></p>' +
          '<div class="tg-guide-admin-preview">' + itemPreview(item) + '</div>' +
          '<div class="tg-edit-actions">' +
            '<button type="button" class="tg-btn tg-btn--primary tg-elumia-approve">Approve</button>' +
            '<button type="button" class="tg-btn tg-btn--ghost tg-elumia-reject">Reject</button>' +
          '</div>' +
        '</article>'
      );
    }).join("") : '<p class="tg-empty">No pending Elumia item submissions.</p>';

    elumiaItemsEl.querySelectorAll(".tg-elumia-approve").forEach(function (btn) {
      btn.addEventListener("click", function () {
        TriumphAPI.reviewElumiaItem(btn.closest(".tg-edit-card").getAttribute("data-item-id"), "approve").then(loadQueue);
      });
    });
    elumiaItemsEl.querySelectorAll(".tg-elumia-reject").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (!confirm("Reject this item submission?")) return;
        TriumphAPI.reviewElumiaItem(btn.closest(".tg-edit-card").getAttribute("data-item-id"), "reject").then(loadQueue);
      });
    });

    guidesQueue.innerHTML = pendingPosts.length ? pendingPosts.map(function (g) {
      return (
        '<article class="tg-edit-card" data-post-id="' + g.id + '">' +
          '<header><strong>' + escapeHtml(g.title) + '</strong></header>' +
          '<p class="tg-edit-game">' + TUG.gameLabel(g.game) + ' · ' + g.type + ' · by <strong>' + escapeHtml(g.authorUsername) + '</strong></p>' +
          '<div class="tg-guide-admin-preview">' + guidePreview(g) + '</div>' +
          '<div class="tg-edit-actions">' +
            '<button type="button" class="tg-btn tg-btn--primary tg-guide-approve">Approve</button>' +
            '<button type="button" class="tg-btn tg-btn--ghost tg-guide-reject">Reject</button>' +
            deleteActions(g.id) +
          '</div>' +
        '</article>'
      );
    }).join("") : '<p class="tg-empty">No pending guides or articles.</p>';

    queue.innerHTML = pendingEdits.length ? pendingEdits.map(function (e) {
      return (
        '<article class="tg-edit-card" data-edit-id="' + e.id + '">' +
          '<header><strong>' + escapeHtml(e.pageTitle) + '</strong> · ' + escapeHtml(e.fieldLabel) + '</header>' +
          '<p class="tg-edit-game">' + escapeHtml(e.game) + ' · by <strong>' + escapeHtml(e.username) + '</strong></p>' +
          '<div class="tg-diff"><div><span>Proposed</span><pre>' + escapeHtml((e.proposedText || "").slice(0, 600)) + '</pre></div></div>' +
          '<div class="tg-edit-actions">' +
            '<button type="button" class="tg-btn tg-btn--primary tg-approve">Approve</button>' +
            '<button type="button" class="tg-btn tg-btn--ghost tg-reject">Reject</button>' +
          '</div>' +
        '</article>'
      );
    }).join("") : '<p class="tg-empty">No pending wiki edits.</p>';

    guidesQueue.querySelectorAll(".tg-guide-approve").forEach(function (btn) {
      btn.addEventListener("click", function () {
        TUG.approveGuide(btn.closest(".tg-edit-card").getAttribute("data-post-id")).then(loadQueue);
      });
    });
    guidesQueue.querySelectorAll(".tg-guide-reject").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.closest(".tg-edit-card").getAttribute("data-post-id");
        var note = prompt("Optional rejection note:");
        if (note === null) return;
        TUG.rejectGuide(id, note).then(loadQueue);
      });
    });
    bindDeleteButtons(guidesQueue, loadQueue);

    queue.querySelectorAll(".tg-approve").forEach(function (btn) {
      btn.addEventListener("click", function () {
        TriumphEdits.approveEdit(btn.closest(".tg-edit-card").getAttribute("data-edit-id")).then(loadQueue);
      });
    });
    queue.querySelectorAll(".tg-reject").forEach(function (btn) {
      btn.addEventListener("click", function () {
        TriumphEdits.rejectEdit(btn.closest(".tg-edit-card").getAttribute("data-edit-id")).then(loadQueue);
      });
    });
  }

  function loadQueue() {
    return TriumphAPI.getAdminQueue().then(renderQueue);
  }

  function loadAll() {
    return TUG.getAllPostsForAdmin().then(renderAllPosts);
  }

  function loadUsers() {
    return TriumphAPI.getAdminUsers().then(renderUsers);
  }

  function setTab(tab) {
    document.querySelectorAll(".tg-admin-tab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tab);
    });
    document.querySelectorAll(".tg-admin-panel").forEach(function (panel) {
      panel.hidden = panel.id !== "tg-admin-panel-" + tab;
    });
    if (tab === "queue") loadQueue().catch(showError);
    if (tab === "posts") loadAll().catch(showError);
    if (tab === "users") loadUsers().catch(showError);
  }

  function showError(err) {
    var msg = escapeHtml((err && err.message) || "Something went wrong.");
    if (!guidesQueue.hidden) guidesQueue.innerHTML = '<p class="tg-empty">' + msg + '</p>';
  }

  function init() {
    document.querySelectorAll(".tg-admin-tab").forEach(function (btn) {
      btn.addEventListener("click", function () { setTab(btn.getAttribute("data-tab")); });
    });

    TriumphCommunity.refreshSession().then(function () {
      TriumphCommunity.updateAuthUI();
      if (!TriumphCommunity.isAdmin()) {
        denied.hidden = false;
        main.hidden = true;
        return;
      }
      denied.hidden = true;
      main.hidden = false;
      setTab("queue");
    });
  }

  init();
})();
