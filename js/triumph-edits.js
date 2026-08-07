/* Triumph Guides — proposed edits with admin approval */
(function (global) {
  var EDITS_KEY = "triumph_guides_pending_edits";
  var APPROVED_KEY = "triumph_guides_approved_edits";

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function editKey(game, pageId, field) {
    return game + "|" + pageId + "|" + field;
  }

  function getPendingEdits() {
    return readJSON(EDITS_KEY, []);
  }

  function savePendingEdits(edits) {
    writeJSON(EDITS_KEY, edits);
  }

  function getApprovedEdits() {
    return readJSON(APPROVED_KEY, {});
  }

  function saveApprovedEdits(map) {
    writeJSON(APPROVED_KEY, map);
  }

  function getApprovedContent(game, pageId, field) {
    return getApprovedEdits()[editKey(game, pageId, field)] || null;
  }

  function submitEdit(payload) {
    var TC = global.TriumphCommunity;
    if (!TC || !TC.getSession()) {
      TC.openAuthModal("login");
      return Promise.reject(new Error("Sign in to submit edits."));
    }
    var session = TC.getSession();
    var edits = getPendingEdits();
    var entry = {
      id: "edit_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      userId: session.userId,
      username: session.username,
      game: payload.game,
      pageId: payload.pageId,
      pageTitle: payload.pageTitle || payload.pageId,
      field: payload.field,
      fieldLabel: payload.fieldLabel || payload.field,
      originalText: payload.originalText || "",
      proposedText: payload.proposedText || "",
      status: "pending",
      createdAt: new Date().toISOString()
    };
    edits.unshift(entry);
    savePendingEdits(edits);
    return Promise.resolve(entry);
  }

  function approveEdit(id, reviewer) {
    var edits = getPendingEdits();
    var idx = edits.findIndex(function (e) { return e.id === id; });
    if (idx === -1) return false;
    var entry = edits[idx];
    entry.status = "approved";
    entry.reviewedAt = new Date().toISOString();
    entry.reviewedBy = reviewer;
    var approved = getApprovedEdits();
    approved[editKey(entry.game, entry.pageId, entry.field)] = entry.proposedText;
    saveApprovedEdits(approved);
    edits.splice(idx, 1);
    savePendingEdits(edits);
    return true;
  }

  function rejectEdit(id, reviewer, note) {
    var edits = getPendingEdits();
    var idx = edits.findIndex(function (e) { return e.id === id; });
    if (idx === -1) return false;
    edits[idx].status = "rejected";
    edits[idx].reviewedAt = new Date().toISOString();
    edits[idx].reviewedBy = reviewer;
    edits[idx].rejectNote = note || "";
    savePendingEdits(edits.filter(function (e) { return e.status === "pending"; }));
    return true;
  }

  function applyApprovedToPage() {
    document.querySelectorAll("[data-editable]").forEach(function (el) {
      var game = el.getAttribute("data-edit-game");
      var pageId = el.getAttribute("data-edit-page");
      var field = el.getAttribute("data-edit-field");
      var approved = getApprovedContent(game, pageId, field);
      if (approved != null) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.value = approved;
        } else {
          el.innerHTML = approved.split("\n\n").map(function (p) {
            return "<p>" + escapeHtml(p).replace(/\n/g, "<br>") + "</p>";
          }).join("");
        }
      }
    });
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
          '<p class="tg-modal-desc">Changes are sent to admin for approval before going live.</p>' +
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
    if (el.getAttribute("data-edit-html") === "true") {
      original = el.innerText.trim();
    }
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
    applyApprovedToPage();
    var TC = global.TriumphCommunity;
    var session = TC && TC.getSession();

    document.querySelectorAll("[data-editable]").forEach(function (el) {
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
  }

  global.TriumphEdits = {
    submitEdit: submitEdit,
    getPendingEdits: getPendingEdits,
    getApprovedEdits: getApprovedEdits,
    getApprovedContent: getApprovedContent,
    approveEdit: approveEdit,
    rejectEdit: rejectEdit,
    applyApprovedToPage: applyApprovedToPage,
    initEditableSections: initEditableSections
  };

  document.addEventListener("DOMContentLoaded", function () {
    applyApprovedToPage();
    setTimeout(initEditableSections, 100);
  });
})(window);
