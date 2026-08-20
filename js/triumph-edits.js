/* Triumph Guides — proposed edits with admin approval (server-backed) */
(function (global) {
  var API = function () { return global.TriumphAPI; };

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function applyContentToElement(el, approved) {
    if (approved == null) return;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.value = approved;
    } else {
      el.innerHTML = approved.split("\n\n").map(function (p) {
        return "<p>" + escapeHtml(p).replace(/\n/g, "<br>") + "</p>";
      }).join("");
    }
  }

  function applyApprovedToPage() {
    if (!API()) return Promise.resolve();
    var byGame = {};
    document.querySelectorAll("[data-editable]").forEach(function (el) {
      var game = el.getAttribute("data-edit-game");
      if (!byGame[game]) byGame[game] = [];
      byGame[game].push(el);
    });

    return Promise.all(Object.keys(byGame).map(function (game) {
      return API().getApprovedBulk(game).then(function (map) {
        byGame[game].forEach(function (el) {
          var pageId = el.getAttribute("data-edit-page");
          var field = el.getAttribute("data-edit-field");
          var key = pageId + "|" + field;
          if (map[key] != null) applyContentToElement(el, map[key]);
        });
      }).catch(function () {});
    }));
  }

  function submitEdit(payload) {
    if (!API()) return Promise.reject(new Error("API not loaded."));
    if (!global.TriumphCommunity.getSession()) {
      global.TriumphCommunity.openAuthModal("login");
      return Promise.reject(new Error("Sign in to submit edits."));
    }
    return API().submitEdit({
      game: payload.game,
      pageId: payload.pageId,
      pageTitle: payload.pageTitle,
      field: payload.field,
      fieldLabel: payload.fieldLabel,
      originalText: payload.originalText,
      proposedText: payload.proposedText
    });
  }

  function getPendingEdits() {
    if (!API()) return Promise.resolve([]);
    if (global.TriumphCommunity.isAdmin()) {
      return API().getPendingEdits();
    }
    return API().getMyEdits();
  }

  function approveEdit(id) {
    return API().reviewEdit(id, "approve");
  }

  function rejectEdit(id) {
    return API().reviewEdit(id, "reject");
  }

  var editModal = null;

  function openEditModal(meta, el) {
    var TC = global.TriumphCommunity;
    if (!TC.getSession()) {
      TC.openAuthModal("login", function () { openEditModal(meta, el); });
      return;
    }
    if (!editModal) {
      editModal = document.createElement("div");
      editModal.className = "tg-modal-overlay";
      editModal.hidden = true;
      editModal.innerHTML =
        '<div class="tg-modal tg-modal--wide" role="dialog">' +
          '<button type="button" class="tg-modal-close" aria-label="Close">&times;</button>' +
          '<h2 class="tg-modal-title">Propose an edit</h2>' +
          '<p class="tg-modal-desc">Text-only edits are reviewed by admin. Champion portraits and artifact images cannot be changed.</p>' +
          '<p class="tg-edit-meta"></p>' +
          '<label class="tg-field"><span>Current content</span><textarea class="tg-edit-original" rows="4" readonly></textarea></label>' +
          '<label class="tg-field"><span>Your proposed change</span><textarea class="tg-edit-proposed" rows="8" required></textarea></label>' +
          '<p class="tg-form-error" hidden></p>' +
          '<button type="button" class="tg-btn tg-btn--primary tg-edit-submit">Submit for approval</button>' +
        '</div>';
      document.body.appendChild(editModal);
      editModal.querySelector(".tg-modal-close").addEventListener("click", closeEditModal);
      editModal.addEventListener("click", function (e) { if (e.target === editModal) closeEditModal(); });
    }

    var original = el.innerText || el.textContent || "";
    editModal.querySelector(".tg-edit-meta").textContent =
      meta.game + " · " + meta.pageTitle + " · " + meta.fieldLabel;
    editModal.querySelector(".tg-edit-original").value = original;
    editModal.querySelector(".tg-edit-proposed").value = original;
    editModal.querySelector(".tg-form-error").hidden = true;

    editModal.querySelector(".tg-edit-submit").onclick = function () {
      var proposed = editModal.querySelector(".tg-edit-proposed").value.trim();
      if (!proposed) return;
      submitEdit({
        game: meta.game,
        pageId: meta.pageId,
        pageTitle: meta.pageTitle,
        field: meta.field,
        fieldLabel: meta.fieldLabel,
        originalText: original,
        proposedText: proposed
      }).then(function () {
        closeEditModal();
        alert("Edit submitted! An admin will review your change before it goes live.");
      }).catch(function (err) {
        var errEl = editModal.querySelector(".tg-form-error");
        errEl.textContent = err.message;
        errEl.hidden = false;
      });
    };

    editModal.hidden = false;
    document.body.classList.add("tg-modal-open");
    editModal.querySelector(".tg-edit-proposed").focus();
  }

  function closeEditModal() {
    if (!editModal) return;
    editModal.hidden = true;
    document.body.classList.remove("tg-modal-open");
  }

  function initEditableSections() {
    applyApprovedToPage().finally(function () {
      var TC = global.TriumphCommunity;
      var session = TC && TC.getSession();
      document.querySelectorAll("[data-editable]").forEach(function (el) {
        if (document.body.getAttribute("data-official-guide") === "true") return;
        if (el.closest(".tg-guide-view--official")) return;
        if (el.parentElement && el.parentElement.querySelector(".tg-edit-btn")) return;
        var wrap = document.createElement("div");
        wrap.className = "tg-editable-wrap";
        el.parentNode.insertBefore(wrap, el);
        wrap.appendChild(el);
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tg-edit-btn";
        btn.title = session ? "Propose edit" : "Sign in to edit";
        btn.innerHTML = "&#9998;";
        btn.addEventListener("click", function () {
          openEditModal({
            game: el.getAttribute("data-edit-game"),
            pageId: el.getAttribute("data-edit-page"),
            pageTitle: el.getAttribute("data-edit-title") || el.getAttribute("data-edit-page"),
            field: el.getAttribute("data-edit-field"),
            fieldLabel: el.getAttribute("data-edit-label") || el.getAttribute("data-edit-field")
          }, el);
        });
        wrap.appendChild(btn);
      });
    });
  }

  global.TriumphEdits = {
    submitEdit: submitEdit,
    getPendingEdits: getPendingEdits,
    approveEdit: approveEdit,
    rejectEdit: rejectEdit,
    applyApprovedToPage: applyApprovedToPage,
    initEditableSections: initEditableSections
  };

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      applyApprovedToPage();
      initEditableSections();
    }, 200);
  });
})(window);
