(function () {
  var TUG = window.TriumphUserGuides;
  var TC = window.TriumphCommunity;
  var params = new URLSearchParams(window.location.search);
  var editId = params.get("id");
  var defaultGame = params.get("game") || "battlerise";

  var guestEl = document.getElementById("tg-guide-guest");
  var editorWrap = document.getElementById("tg-guide-editor-wrap");
  var sectionsEl = document.getElementById("guide-sections");
  var form = document.getElementById("tg-guide-form");
  var errorEl = document.getElementById("guide-form-error");
  var successEl = document.getElementById("guide-form-success");
  var statusBadge = document.getElementById("guide-status-badge");
  var deleteBtn = document.getElementById("guide-delete");
  var backLink = document.getElementById("guide-back-link");

  var currentGuideId = editId;
  var sectionData = [];

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
    successEl.hidden = true;
  }

  function showSuccess(msg) {
    successEl.textContent = msg;
    successEl.hidden = !msg;
    errorEl.hidden = true;
  }

  function updateBackLink(game) {
    backLink.href = TUG.gameGuidesUrl(game);
  }

  function collectFormData() {
    return {
      game: document.getElementById("guide-game").value,
      title: document.getElementById("guide-title").value,
      description: document.getElementById("guide-description").value,
      sections: sectionData.map(function (sec, i) {
        var card = sectionsEl.children[i];
        return {
          id: sec.id,
          heading: card.querySelector(".sec-heading").value,
          body: card.querySelector(".sec-body").value,
          images: sec.images.slice()
        };
      })
    };
  }

  function renderSectionCard(sec, index) {
    var card = document.createElement("div");
    card.className = "tg-guide-section-card";
    card.dataset.sectionId = sec.id;
    card.innerHTML =
      '<div class="tg-guide-section-head">' +
        '<h3>Section ' + (index + 1) + '</h3>' +
        (sectionData.length > 1 ? '<button type="button" class="tg-guide-section-remove" data-action="remove-section">Remove</button>' : '') +
      '</div>' +
      '<label class="tg-field"><span>Heading (optional)</span>' +
        '<input type="text" class="sec-heading" value="' + TUG.escapeHtml(sec.heading || "") + '" placeholder="Section title">' +
      '</label>' +
      '<label class="tg-field"><span>Content</span>' +
        '<textarea class="sec-body" rows="6" placeholder="Write your guide content here…">' + TUG.escapeHtml(sec.body || "") + '</textarea>' +
      '</label>' +
      '<div class="tg-guide-images" data-images></div>' +
      '<label class="tg-guide-image-upload">' +
        '<input type="file" accept="image/*" data-action="upload">' +
        '+ Add image' +
      '</label>';

    card.querySelector('[data-action="remove-section"]') &&
      card.querySelector('[data-action="remove-section"]').addEventListener("click", function () {
      if (sectionData.length <= 1) return;
      sectionData.splice(index, 1);
      renderAllSections();
    });

    card.querySelector('[data-action="upload"]').addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var guideId = currentGuideId || "draft";
      TUG.uploadImage(file, guideId).then(function (imageId) {
        sec.images.push({ id: imageId, caption: "" });
        renderSectionImages(card, sec);
        e.target.value = "";
      }).catch(function (err) {
        showError(err.message);
        e.target.value = "";
      });
    });

    renderSectionImages(card, sec);
    return card;
  }

  function renderSectionImages(card, sec) {
    var wrap = card.querySelector("[data-images]");
    wrap.innerHTML = "";
    sec.images.forEach(function (img, imgIdx) {
      TUG.getImageUrl(img.id).then(function (url) {
        if (!url) return;
        var item = document.createElement("div");
        item.className = "tg-guide-image-item";
        item.innerHTML =
          '<button type="button" class="tg-guide-image-remove" aria-label="Remove image">&times;</button>' +
          '<img src="' + url + '" alt="">' +
          '<input type="text" class="img-caption" placeholder="Caption (optional)" value="' + TUG.escapeHtml(img.caption || "") + '">';
        item.querySelector(".tg-guide-image-remove").addEventListener("click", function () {
          TUG.deleteImageRecord(img.id);
          sec.images.splice(imgIdx, 1);
          renderSectionImages(card, sec);
        });
        item.querySelector(".img-caption").addEventListener("input", function (e) {
          img.caption = e.target.value;
        });
        wrap.appendChild(item);
      });
    });
  }

  function renderAllSections() {
    sectionsEl.innerHTML = "";
    sectionData.forEach(function (sec, i) {
      sectionsEl.appendChild(renderSectionCard(sec, i));
    });
  }

  function loadGuide(id) {
    var guide = TUG.getGuideById(id);
    if (!guide) {
      showError("Guide not found.");
      return;
    }
    document.getElementById("guide-editor-title").textContent = "Edit Guide";
    document.getElementById("guide-game").value = guide.game;
    document.getElementById("guide-title").value = guide.title;
    document.getElementById("guide-description").value = guide.description || "";
    sectionData = JSON.parse(JSON.stringify(guide.sections || []));
    if (!sectionData.length) sectionData = [{ id: TUG.uid("sec"), heading: "", body: "", images: [] }];
    renderAllSections();
    updateBackLink(guide.game);
    statusBadge.hidden = false;
    statusBadge.textContent = TUG.statusLabel(guide.status);
    statusBadge.className = "tg-guide-status-badge tg-guide-status-badge--" + guide.status;
    deleteBtn.hidden = false;

    if (guide.status === "pending") {
      document.getElementById("guide-submit").disabled = true;
      document.getElementById("guide-submit").textContent = "Awaiting review";
    } else if (guide.status === "rejected") {
      document.getElementById("guide-submit").disabled = false;
      document.getElementById("guide-submit").textContent = "Resubmit for review";
    }
    if (guide.status === "published") {
      document.getElementById("guide-submit").hidden = true;
      document.getElementById("guide-save-draft").hidden = true;
      form.querySelectorAll("input, textarea, select, button").forEach(function (el) {
        if (el.id !== "guide-delete") el.disabled = true;
      });
      document.getElementById("guide-add-section").hidden = true;
      showSuccess("This guide is published. View it on the guides page.");
    }
    if (guide.status === "rejected" && guide.rejectNote) {
      showError("Rejected: " + guide.rejectNote);
    }
  }

  function initEditor() {
    document.getElementById("guide-game").value = defaultGame;
    updateBackLink(defaultGame);
    if (!sectionData.length) {
      sectionData = [{ id: TUG.uid("sec"), heading: "", body: "", images: [] }];
    }
    renderAllSections();
    if (editId) loadGuide(editId);
  }

  function saveDraft() {
    var data = collectFormData();
    var promise = currentGuideId
      ? TUG.updateGuide(currentGuideId, data)
      : TUG.createGuide(Object.assign({}, data, { status: "draft" }));

    return promise.then(function (guide) {
      currentGuideId = guide.id;
      editId = guide.id;
      history.replaceState(null, "", "guide-create.html?id=" + guide.id);
      deleteBtn.hidden = false;
      statusBadge.hidden = false;
      statusBadge.textContent = TUG.statusLabel(guide.status);
      statusBadge.className = "tg-guide-status-badge tg-guide-status-badge--" + guide.status;
      showSuccess("Draft saved.");
      updateBackLink(guide.game);
    }).catch(function (err) {
      showError(err.message);
    });
  }

  document.getElementById("guide-add-section").addEventListener("click", function () {
    sectionData.push({ id: TUG.uid("sec"), heading: "", body: "", images: [] });
    renderAllSections();
  });

  document.getElementById("guide-save-draft").addEventListener("click", saveDraft);

  document.getElementById("guide-game").addEventListener("change", function () {
    updateBackLink(this.value);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = collectFormData();
    var savePromise = currentGuideId
      ? TUG.updateGuide(currentGuideId, data)
      : TUG.createGuide(Object.assign({}, data, { status: "draft" }));

    savePromise.then(function (guide) {
      currentGuideId = guide.id;
      return TUG.submitGuide(guide.id);
    }).then(function (guide) {
      statusBadge.hidden = false;
      statusBadge.textContent = TUG.statusLabel("pending");
      statusBadge.className = "tg-guide-status-badge tg-guide-status-badge--pending";
      document.getElementById("guide-submit").disabled = true;
      document.getElementById("guide-submit").textContent = "Awaiting review";
      showSuccess("Guide submitted! An admin will review it before publishing.");
    }).catch(function (err) {
      showError(err.message);
    });
  });

  deleteBtn.addEventListener("click", function () {
    if (!currentGuideId || !confirm("Delete this guide permanently?")) return;
    TUG.deleteGuide(currentGuideId).then(function () {
      window.location.href = TUG.gameGuidesUrl(document.getElementById("guide-game").value);
    }).catch(function (err) {
      showError(err.message);
    });
  });

  document.getElementById("tg-guide-login").addEventListener("click", function () {
    TC.openAuthModal("login", refresh);
  });

  function refresh() {
    var session = TC.getSession();
    if (!session) {
      guestEl.hidden = false;
      editorWrap.hidden = true;
      return;
    }
    guestEl.hidden = true;
    editorWrap.hidden = false;
    initEditor();
  }

  refresh();
  TC.updateAuthUI();
})();
