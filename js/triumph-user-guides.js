/* Triumph Guides — user-created guides & articles (server-backed) */
(function (global) {
  var API = function () { return global.TriumphAPI; };

  function slugify(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "guide";
  }

  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
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

  function requireSession() {
    if (!global.TriumphCommunity.getSession()) {
      global.TriumphCommunity.openAuthModal("login");
      return Promise.reject(new Error("Sign in to create guides."));
    }
    return Promise.resolve(global.TriumphCommunity.getSession());
  }

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      if (!file.type.match(/^image\//)) {
        reject(new Error("Please upload an image file."));
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var maxW = 1200;
          var scale = Math.min(1, maxW / img.width);
          var canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = function () { reject(new Error("Could not read image.")); };
        img.src = reader.result;
      };
      reader.onerror = function () { reject(new Error("Could not read file.")); };
      reader.readAsDataURL(file);
    });
  }

  function getPublishedGuides(game) {
    return API().listPosts({ game: game, type: "guide", status: "published" });
  }

  function getPublishedArticles(game) {
    return API().listPosts({ game: game, type: "article", status: "published" });
  }

  function getGuideById(id) {
    return API().getPost(id);
  }

  function getGuidesByAuthor(userId) {
    return API().listPosts({ status: "mine" }).then(function (posts) {
      return posts.filter(function (p) { return p.authorId === userId; });
    });
  }

  function getAllPostsForAdmin() {
    return API().listPosts({ status: "all" });
  }

  function getPendingGuides() {
    return API().listPosts({ status: "pending" });
  }

  function createGuide(payload) {
    return requireSession().then(function () {
      return API().createPost({
        game: payload.game || "battlerise",
        type: payload.type || "guide",
        title: payload.title,
        description: payload.description,
        sections: payload.sections || [{ id: uid("sec"), heading: "", body: "", images: [] }]
      });
    });
  }

  function updateGuide(id, payload) {
    return requireSession().then(function () {
      return API().updatePost(id, Object.assign({}, payload, {
        type: payload.type
      }));
    });
  }

  function submitGuide(id) {
    return requireSession().then(function () {
      return API().submitPost(id);
    });
  }

  function approveGuide(id) {
    return API().reviewPost(id, "approve");
  }

  function rejectGuide(id, note) {
    return API().reviewPost(id, "reject", note);
  }

  function deleteGuide(id) {
    return requireSession().then(function () {
      return API().deletePost(id);
    });
  }

  function uploadImage(file) {
    return compressImage(file).then(function (dataUrl) {
      return API().uploadImage(dataUrl).then(function (res) {
        return { id: res.url, url: res.url };
      });
    });
  }

  function getImageUrl(id) {
    return Promise.resolve(id);
  }

  global.TriumphUserGuides = {
    getGuideById: getGuideById,
    getPublishedGuides: getPublishedGuides,
    getPublishedArticles: getPublishedArticles,
    getGuidesByAuthor: getGuidesByAuthor,
    getPendingGuides: getPendingGuides,
    getAllPostsForAdmin: getAllPostsForAdmin,
    createGuide: createGuide,
    updateGuide: updateGuide,
    submitGuide: submitGuide,
    approveGuide: approveGuide,
    rejectGuide: rejectGuide,
    deleteGuide: deleteGuide,
    uploadImage: uploadImage,
    getImageUrl: getImageUrl,
    escapeHtml: escapeHtml,
    statusLabel: statusLabel,
    gameLabel: gameLabel,
    gameGuidesUrl: gameGuidesUrl,
    uid: uid,
    slugify: slugify
  };
})(window);
