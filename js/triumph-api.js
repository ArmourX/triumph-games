/* Triumph Guides — backend API client */
(function (global) {
  var API_BASE = "/api";

  function request(path, options) {
    options = options || {};
    return fetch(API_BASE + path, {
      method: options.method || "GET",
      credentials: "include",
      headers: Object.assign(
        { "Content-Type": "application/json" },
        options.headers || {}
      ),
      body: options.body != null ? JSON.stringify(options.body) : undefined
    }).catch(function () {
      throw new Error(
        "Could not reach the server. If you're testing locally, run npx vercel dev (not a plain static server). On the live site, the API must be deployed with database env vars set."
      );
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.error || ("Request failed (" + res.status + ")"));
        return data;
      });
    });
  }

  global.TriumphAPI = {
    me: function () { return request("/auth/me"); },
    signup: function (username, password, avatarSlug) {
      return request("/auth/signup", {
        method: "POST",
        body: { username: username, password: password, avatarSlug: avatarSlug }
      });
    },
    login: function (username, password) {
      return request("/auth/login", { method: "POST", body: { username: username, password: password } });
    },
    logout: function () { return request("/auth/logout", { method: "POST" }); },

    getApprovedContent: function (game, pageId, field) {
      return request("/content?game=" + encodeURIComponent(game) + "&page=" + encodeURIComponent(pageId) + "&field=" + encodeURIComponent(field))
        .then(function (d) { return d.content; });
    },
    getApprovedBulk: function (game) {
      return request("/content?game=" + encodeURIComponent(game) + "&bulk=1")
        .then(function (d) { return d.content || {}; });
    },
    submitEdit: function (payload) {
      return request("/edits", { method: "POST", body: payload });
    },
    getMyEdits: function () { return request("/edits?mine=1").then(function (d) { return d.edits; }); },
    getPendingEdits: function () { return request("/edits").then(function (d) { return d.edits; }); },
    reviewEdit: function (id, action) {
      return request("/edits/" + id, { method: "PATCH", body: { action: action } });
    },

    listPosts: function (opts) {
      opts = opts || {};
      var q = [];
      if (opts.game) q.push("game=" + encodeURIComponent(opts.game));
      if (opts.type) q.push("type=" + encodeURIComponent(opts.type));
      if (opts.status) q.push("status=" + encodeURIComponent(opts.status));
      return request("/posts?" + q.join("&")).then(function (d) { return d.posts; });
    },
    getPost: function (id) { return request("/posts/" + id).then(function (d) { return d.post; }); },
    createPost: function (payload) {
      return request("/posts", { method: "POST", body: payload }).then(function (d) { return d.post; });
    },
    updatePost: function (id, payload) {
      return request("/posts/" + id, { method: "PUT", body: payload }).then(function (d) { return d.post; });
    },
    submitPost: function (id) {
      return request("/posts/" + id + "/submit", { method: "POST" });
    },
    reviewPost: function (id, action, rejectNote) {
      return request("/posts/" + id, { method: "PATCH", body: { action: action, rejectNote: rejectNote } });
    },
    deletePost: function (id) { return request("/posts/" + id, { method: "DELETE" }); },

    uploadImage: function (dataUrl) {
      return request("/upload", { method: "POST", body: { dataUrl: dataUrl } });
    },

    castVote: function (championSlug, category, stars) {
      return request("/votes", { method: "POST", body: { championSlug: championSlug, category: category, stars: stars } });
    },
    getVoteStats: function (championSlug, category) {
      return request("/votes?champion=" + encodeURIComponent(championSlug) + "&category=" + encodeURIComponent(category));
    },

    listContributors: function () {
      return request("/contributors").then(function (d) { return d.contributors || []; });
    },

    getElumiaItems: function (category) {
      var q = category ? "?category=" + encodeURIComponent(category) : "";
      return request("/elumia/items" + q).then(function (d) { return d.items || []; });
    },
    lookupElumiaItem: function (category, name) {
      return request("/elumia/items?category=" + encodeURIComponent(category) + "&lookup=" + encodeURIComponent(name));
    },
    submitElumiaItem: function (payload) {
      return request("/elumia/items", { method: "POST", body: payload });
    },
    reviewElumiaItem: function (id, action) {
      return request("/elumia/items/" + id, { method: "PATCH", body: { action: action } });
    },
    deleteElumiaItem: function (id) {
      return request("/elumia/items/" + id, { method: "DELETE" });
    },
    updateElumiaItem: function (id, payload) {
      return request("/elumia/items/" + id, { method: "PATCH", body: Object.assign({ action: "update" }, payload) });
    },
    updateElumiaItemIcon: function (id, iconId) {
      return request("/elumia/items/" + id, { method: "PATCH", body: { action: "updateIcon", iconId: iconId } });
    },

    getAdminQueue: function () { return request("/admin/queue"); },
    getAdminUsers: function () { return request("/admin/users").then(function (d) { return d.users || []; }); },
    updateAdminUser: function (id, action) {
      return request("/admin/users/" + id, { method: "PATCH", body: { action: action } });
    },
    removeAdminUser: function (id) {
      return request("/admin/users/" + id, { method: "DELETE" });
    }
  };
})(window);
