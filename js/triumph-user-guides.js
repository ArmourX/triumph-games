/* Triumph Guides — user-created guides with text and images */
(function (global) {
  var GUIDES_KEY = "triumph_guides_user_guides";
  var DB_NAME = "triumph_guides_images";
  var DB_VERSION = 1;
  var STORE = "images";
  var MAX_IMAGE_BYTES = 2 * 1024 * 1024;

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

  function slugify(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "guide";
  }

  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function getAllGuides() {
    return readJSON(GUIDES_KEY, []);
  }

  function saveAllGuides(guides) {
    writeJSON(GUIDES_KEY, guides);
  }

  function getGuideById(id) {
    return getAllGuides().find(function (g) { return g.id === id; }) || null;
  }

  function getGuidesByGame(game, opts) {
    opts = opts || {};
    return getAllGuides().filter(function (g) {
      if (g.game !== game) return false;
      if (opts.status && g.status !== opts.status) return false;
      if (opts.authorId && g.authorId !== opts.authorId) return false;
      return true;
    }).sort(function (a, b) {
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });
  }

  function getPublishedGuides(game) {
    return getGuidesByGame(game, { status: "published" });
  }

  function getGuidesByAuthor(userId) {
    return getAllGuides().filter(function (g) { return g.authorId === userId; })
      .sort(function (a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); });
  }

  function getPendingGuides() {
    return getAllGuides().filter(function (g) { return g.status === "pending"; })
      .sort(function (a, b) { return new Date(b.updatedAt) - new Date(a.updatedAt); });
  }

  function openDB() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        e.target.result.createObjectStore(STORE, { keyPath: "id" });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function saveImageRecord(record) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(record);
        tx.oncomplete = function () { resolve(record); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function getImageRecord(id) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readonly");
        var req = tx.objectStore(STORE).get(id);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function deleteImageRecord(id) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      if (!file.type.match(/^image\//)) {
        reject(new Error("Please upload an image file (PNG, JPG, GIF, or WebP)."));
        return;
      }
      if (file.size > MAX_IMAGE_BYTES * 4) {
        reject(new Error("Image is too large. Please use a file under 8 MB."));
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var maxW = 1200;
          var scale = Math.min(1, maxW / img.width);
          var w = Math.round(img.width * scale);
          var h = Math.round(img.height * scale);
          var canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          var dataUrl = canvas.toDataURL("image/jpeg", 0.82);
          if (dataUrl.length > MAX_IMAGE_BYTES * 1.4) {
            reject(new Error("Image is still too large after compression. Try a smaller image."));
            return;
          }
          resolve(dataUrl);
        };
        img.onerror = function () { reject(new Error("Could not read image file.")); };
        img.src = reader.result;
      };
      reader.onerror = function () { reject(new Error("Could not read file.")); };
      reader.readAsDataURL(file);
    });
  }

  function uploadImage(file, guideId) {
    return compressImage(file).then(function (dataUrl) {
      var id = uid("img");
      return saveImageRecord({ id: id, guideId: guideId, dataUrl: dataUrl, createdAt: new Date().toISOString() })
        .then(function () { return id; });
    });
  }

  function getImageUrl(id) {
    return getImageRecord(id).then(function (rec) {
      return rec ? rec.dataUrl : null;
    });
  }

  function deleteGuideImages(guide) {
    var ids = [];
    (guide.sections || []).forEach(function (sec) {
      (sec.images || []).forEach(function (img) { ids.push(img.id); });
    });
    return Promise.all(ids.map(deleteImageRecord));
  }

  function requireSession() {
    var TC = global.TriumphCommunity;
    if (!TC || !TC.getSession()) {
      if (TC) TC.openAuthModal("login");
      return Promise.reject(new Error("Sign in to create guides."));
    }
    return Promise.resolve(TC.getSession());
  }

  function createGuide(payload) {
    return requireSession().then(function (session) {
      var now = new Date().toISOString();
      var guide = {
        id: uid("guide"),
        slug: slugify(payload.title || "untitled-guide"),
        game: payload.game || "battlerise",
        title: (payload.title || "").trim() || "Untitled Guide",
        description: (payload.description || "").trim(),
        authorId: session.userId,
        authorUsername: session.username,
        status: payload.status || "draft",
        sections: payload.sections || [{ id: uid("sec"), heading: "", body: "", images: [] }],
        createdAt: now,
        updatedAt: now,
        publishedAt: null,
        rejectNote: ""
      };
      var guides = getAllGuides();
      guides.unshift(guide);
      saveAllGuides(guides);
      return guide;
    });
  }

  function updateGuide(id, payload) {
    return requireSession().then(function (session) {
      var guides = getAllGuides();
      var idx = guides.findIndex(function (g) { return g.id === id; });
      if (idx === -1) throw new Error("Guide not found.");
      var guide = guides[idx];
      if (guide.authorId !== session.userId && !TriumphCommunity.isAdmin()) {
        throw new Error("You can only edit your own guides.");
      }
      if (payload.title != null) {
        guide.title = payload.title.trim() || guide.title;
        guide.slug = slugify(guide.title);
      }
      if (payload.description != null) guide.description = payload.description.trim();
      if (payload.game != null) guide.game = payload.game;
      if (payload.sections != null) guide.sections = payload.sections;
      if (payload.status != null) guide.status = payload.status;
      guide.updatedAt = new Date().toISOString();
      guides[idx] = guide;
      saveAllGuides(guides);
      return guide;
    });
  }

  function submitGuide(id) {
    return requireSession().then(function (session) {
      var guide = getGuideById(id);
      if (!guide) throw new Error("Guide not found.");
      if (guide.authorId !== session.userId) throw new Error("You can only submit your own guides.");
      if (!guide.title.trim()) throw new Error("Add a title before submitting.");
      if (!guide.sections.length || !guide.sections.some(function (s) { return s.body.trim() || (s.images && s.images.length); })) {
        throw new Error("Add at least one section with text or an image.");
      }
      return updateGuide(id, { status: "pending" });
    });
  }

  function approveGuide(id, reviewer) {
    var guides = getAllGuides();
    var idx = guides.findIndex(function (g) { return g.id === id; });
    if (idx === -1) return false;
    guides[idx].status = "published";
    guides[idx].publishedAt = new Date().toISOString();
    guides[idx].reviewedAt = guides[idx].publishedAt;
    guides[idx].reviewedBy = reviewer;
    guides[idx].rejectNote = "";
    saveAllGuides(guides);
    return true;
  }

  function rejectGuide(id, reviewer, note) {
    var guides = getAllGuides();
    var idx = guides.findIndex(function (g) { return g.id === id; });
    if (idx === -1) return false;
    guides[idx].status = "rejected";
    guides[idx].reviewedAt = new Date().toISOString();
    guides[idx].reviewedBy = reviewer;
    guides[idx].rejectNote = note || "";
    saveAllGuides(guides);
    return true;
  }

  function deleteGuide(id) {
    return requireSession().then(function (session) {
      var guides = getAllGuides();
      var idx = guides.findIndex(function (g) { return g.id === id; });
      if (idx === -1) throw new Error("Guide not found.");
      var guide = guides[idx];
      if (guide.authorId !== session.userId && !TriumphCommunity.isAdmin()) {
        throw new Error("You can only delete your own guides.");
      }
      return deleteGuideImages(guide).then(function () {
        guides.splice(idx, 1);
        saveAllGuides(guides);
      });
    });
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function statusLabel(status) {
    return { draft: "Draft", pending: "Pending review", published: "Published", rejected: "Rejected" }[status] || status;
  }

  function gameLabel(game) {
    return { battlerise: "BattleRise", elumia: "Legends of Elumia", armourx: "ArmourX" }[game] || game;
  }

  function gameGuidesUrl(game) {
    return game + "-guides.html";
  }

  global.TriumphUserGuides = {
    getAllGuides: getAllGuides,
    getGuideById: getGuideById,
    getGuidesByGame: getGuidesByGame,
    getPublishedGuides: getPublishedGuides,
    getGuidesByAuthor: getGuidesByAuthor,
    getPendingGuides: getPendingGuides,
    createGuide: createGuide,
    updateGuide: updateGuide,
    submitGuide: submitGuide,
    approveGuide: approveGuide,
    rejectGuide: rejectGuide,
    deleteGuide: deleteGuide,
    uploadImage: uploadImage,
    getImageUrl: getImageUrl,
    deleteImageRecord: deleteImageRecord,
    escapeHtml: escapeHtml,
    statusLabel: statusLabel,
    gameLabel: gameLabel,
    gameGuidesUrl: gameGuidesUrl,
    uid: uid
  };
})(window);
