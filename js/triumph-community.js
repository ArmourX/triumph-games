/* Triumph Guides — local account auth, rating votes, contribute modal */
(function (global) {
  var USERS_KEY = "triumph_guides_users";
  var SESSION_KEY = "triumph_guides_session";
  var VOTES_KEY = "triumph_guides_votes";
  var ADMIN_USER = "admin";

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
    return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function hashPassword(password) {
    var encoded = new TextEncoder().encode(password);
    if (global.crypto && crypto.subtle) {
      return crypto.subtle.digest("SHA-256", encoded).then(function (buf) {
        return Array.from(new Uint8Array(buf)).map(function (b) {
          return b.toString(16).padStart(2, "0");
        }).join("");
      });
    }
    return Promise.resolve(btoa(password));
  }

  function getUsers() {
    return readJSON(USERS_KEY, { users: {} });
  }

  function saveUsers(store) {
    writeJSON(USERS_KEY, store);
  }

  function getVotes() {
    return readJSON(VOTES_KEY, {});
  }

  function saveVotes(votes) {
    writeJSON(VOTES_KEY, votes);
  }

  function getSession() {
    return readJSON(SESSION_KEY, null);
  }

  function setSession(session) {
    if (session) writeJSON(SESSION_KEY, session);
    else localStorage.removeItem(SESSION_KEY);
    updateAuthUI();
  }

  function voteKey(championSlug, category) {
    return championSlug + ":" + slugify(category);
  }

  function getUserVote(championSlug, category) {
    var session = getSession();
    if (!session) return null;
    var votes = getVotes();
    var bucket = votes[voteKey(championSlug, category)];
    if (!bucket) return null;
    return bucket[session.userId] || null;
  }

  function getVoteAggregate(championSlug, category, fallback) {
    var votes = getVotes();
    var bucket = votes[voteKey(championSlug, category)];
    if (!bucket) return fallback;
    var values = Object.keys(bucket).map(function (k) { return bucket[k]; });
    if (!values.length) return fallback;
    var sum = values.reduce(function (a, b) { return a + b; }, 0);
    return Math.round((sum / values.length) * 10) / 10;
  }

  function getVoteCount(championSlug, category) {
    var bucket = getVotes()[voteKey(championSlug, category)];
    return bucket ? Object.keys(bucket).length : 0;
  }

  function castVote(championSlug, category, stars) {
    var session = getSession();
    if (!session) {
      openAuthModal("login", function () {
        castVote(championSlug, category, stars);
      });
      return false;
    }
    stars = Math.max(1, Math.min(5, Math.round(stars)));
    var votes = getVotes();
    var key = voteKey(championSlug, category);
    if (!votes[key]) votes[key] = {};
    votes[key][session.userId] = stars;
    saveVotes(votes);
    return true;
  }

  function signup(username, password) {
    username = (username || "").trim();
    if (username.length < 3) return Promise.reject(new Error("Username must be at least 3 characters."));
    if ((password || "").length < 6) return Promise.reject(new Error("Password must be at least 6 characters."));
    var store = getUsers();
    if (store.users[username.toLowerCase()]) {
      return Promise.reject(new Error("That username is already taken."));
    }
    return hashPassword(password).then(function (passHash) {
      var userId = "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      store.users[username.toLowerCase()] = {
        id: userId,
        username: username,
        passHash: passHash,
        createdAt: new Date().toISOString(),
        contributor: true,
        isAdmin: username.toLowerCase() === ADMIN_USER
      };
      saveUsers(store);
      setSession({ userId: userId, username: username });
    });
  }

  function login(username, password) {
    username = (username || "").trim().toLowerCase();
    var store = getUsers();
    var user = store.users[username];
    if (!user) return Promise.reject(new Error("Account not found."));
    return hashPassword(password).then(function (passHash) {
      if (passHash !== user.passHash) throw new Error("Incorrect password.");
      setSession({ userId: user.id, username: user.username });
    });
  }

  function isAdmin() {
    var session = getSession();
    if (!session) return false;
    var user = getUsers().users[session.username.toLowerCase()];
    return !!(user && (user.isAdmin || session.username.toLowerCase() === ADMIN_USER));
  }

  function logout() {
    setSession(null);
  }

  var modalEl = null;
  var pendingCallback = null;

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement("div");
    modalEl.className = "tg-modal-overlay";
    modalEl.hidden = true;
    modalEl.innerHTML =
      '<div class="tg-modal" role="dialog" aria-labelledby="tg-modal-title">' +
        '<button type="button" class="tg-modal-close" aria-label="Close">&times;</button>' +
        '<h2 id="tg-modal-title" class="tg-modal-title">Join Triumph Guides</h2>' +
        '<p class="tg-modal-desc">Create an account to vote on champion ratings and contribute to the wiki.</p>' +
        '<div class="tg-modal-tabs">' +
          '<button type="button" class="tg-modal-tab active" data-tab="signup">Sign Up</button>' +
          '<button type="button" class="tg-modal-tab" data-tab="login">Log In</button>' +
        '</div>' +
        '<form id="tg-auth-form" class="tg-auth-form">' +
          '<label class="tg-field"><span>Username</span><input type="text" name="username" autocomplete="username" required minlength="3"></label>' +
          '<label class="tg-field"><span>Password</span><input type="password" name="password" autocomplete="new-password" required minlength="6"></label>' +
          '<label class="tg-field tg-field--signup"><span>Confirm password</span><input type="password" name="confirm" autocomplete="new-password" required minlength="6"></label>' +
          '<p class="tg-form-error" hidden></p>' +
          '<button type="submit" class="tg-btn tg-btn--primary">Create Account</button>' +
        '</form>' +
      '</div>';
    document.body.appendChild(modalEl);

    var activeTab = "signup";
    var form = modalEl.querySelector("#tg-auth-form");
    var errorEl = modalEl.querySelector(".tg-form-error");
    var submitBtn = form.querySelector(".tg-btn--primary");
    var confirmField = form.querySelector('input[name="confirm"]').closest(".tg-field");

    function setTab(tab) {
      activeTab = tab;
      modalEl.querySelectorAll(".tg-modal-tab").forEach(function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tab);
      });
      var isSignup = tab === "signup";
      modalEl.querySelectorAll(".tg-field--signup").forEach(function (el) {
        el.hidden = !isSignup;
      });
      if (confirmField) {
        confirmField.hidden = !isSignup;
        var confirmInput = confirmField.querySelector("input");
        if (confirmInput) confirmInput.required = isSignup;
      }
      submitBtn.textContent = isSignup ? "Create Account" : "Log In";
      errorEl.hidden = true;
    }

    modalEl.querySelectorAll(".tg-modal-tab").forEach(function (btn) {
      btn.addEventListener("click", function () { setTab(btn.getAttribute("data-tab")); });
    });

    modalEl.querySelector(".tg-modal-close").addEventListener("click", closeAuthModal);
    modalEl.addEventListener("click", function (e) {
      if (e.target === modalEl) closeAuthModal();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errorEl.hidden = true;
      var fd = new FormData(form);
      var username = fd.get("username");
      var password = fd.get("password");
      var confirm = fd.get("confirm");
      var action = activeTab === "signup"
        ? (confirm !== password ? Promise.reject(new Error("Passwords do not match.")) : signup(username, password))
        : login(username, password);

      action.then(function () {
        closeAuthModal();
        if (pendingCallback) pendingCallback();
        pendingCallback = null;
      }).catch(function (err) {
        errorEl.textContent = err.message || "Something went wrong.";
        errorEl.hidden = false;
      });
    });

    modalEl._setTab = setTab;
    return modalEl;
  }

  function openAuthModal(tab, onSuccess) {
    ensureModal();
    pendingCallback = onSuccess || null;
    modalEl._setTab(tab || "signup");
    modalEl.hidden = false;
    document.body.classList.add("tg-modal-open");
    modalEl.querySelector('input[name="username"]').focus();
  }

  function closeAuthModal() {
    if (!modalEl) return;
    modalEl.hidden = true;
    document.body.classList.remove("tg-modal-open");
  }

  function injectHeaderAuth() {
    var session = getSession();
    var initial = session ? session.username.charAt(0).toUpperCase() : "?";
    var href = session ? "account.html" : "account.html";
    var title = session ? "Signed in as " + session.username : "Sign in";

    document.querySelectorAll(".hub-header-inner, .header-inner").forEach(function (inner) {
      if (inner.querySelector(".tg-header-auth")) return;
      var link = document.createElement("a");
      link.href = href;
      link.className = "tg-header-auth" + (session ? " tg-header-auth--on" : "");
      link.title = title;
      link.setAttribute("aria-label", title);
      link.innerHTML = '<span class="tg-header-auth-icon">' + initial + "</span>";
      inner.insertBefore(link, inner.firstChild);
    });
  }

  function updateAuthUI() {
    var session = getSession();
    injectHeaderAuth();
    document.querySelectorAll(".tg-header-auth").forEach(function (link) {
      var initial = session ? session.username.charAt(0).toUpperCase() : "?";
      link.href = "account.html";
      link.title = session ? "Signed in as " + session.username : "Sign in";
      link.classList.toggle("tg-header-auth--on", !!session);
      link.querySelector(".tg-header-auth-icon").textContent = initial;
    });
    document.querySelectorAll(".hub-contribute-btn").forEach(function (btn) {
      if (session) {
        btn.textContent = "Write a guide";
        btn.classList.add("hub-contribute-btn--active");
      } else {
        btn.textContent = "Contribute";
        btn.classList.remove("hub-contribute-btn--active");
      }
    });
    var bar = document.getElementById("tg-auth-bar");
    if (bar) {
      if (session) {
        bar.innerHTML = 'Signed in as <strong>' + session.username + '</strong> <button type="button" class="tg-link-btn" id="tg-logout-btn">Log out</button>';
        bar.querySelector("#tg-logout-btn").addEventListener("click", logout);
      } else {
        bar.innerHTML = '<button type="button" class="tg-link-btn" id="tg-login-btn">Sign in</button> to vote and contribute.';
        bar.querySelector("#tg-login-btn").addEventListener("click", function () { openAuthModal("login"); });
      }
    }
  }

  function initContributeButtons() {
    document.querySelectorAll(".hub-contribute-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var session = getSession();
        if (session) {
          window.location.href = "guide-create.html";
          return;
        }
        openAuthModal("signup", function () {
          window.location.href = "guide-create.html";
        });
      });
    });
    updateAuthUI();
  }

  function renderStarsInteractive(value, championSlug, category) {
    var html = "";
    for (var i = 1; i <= 5; i++) {
      html += '<button type="button" class="br-star-btn' + (i <= value ? " is-filled" : "") + '" data-star="' + i + '" aria-label="Rate ' + i + ' out of 5">' +
        (i <= value ? "\u2605" : "\u2606") + "</button>";
    }
    return html;
  }

  function initRatings(championSlug, container, defaultRatings) {
    if (!container) return;

    var header = container.closest(".br-section");
    if (header && !header.querySelector(".br-ratings-hint")) {
      var hint = document.createElement("p");
      hint.className = "br-ratings-hint";
      hint.textContent = "Community ratings — click stars to cast your vote (one vote per category). Sign in required.";
      header.insertBefore(hint, container);
    }

    function renderCard(label) {
      var avg = getVoteAggregate(championSlug, label, defaultRatings[label]);
      var userVote = getUserVote(championSlug, label);
      var count = getVoteCount(championSlug, label);
      var displayValue = userVote || Math.round(avg);

      return (
        '<div class="br-rating-card" data-category="' + label + '">' +
          '<div class="br-rating-label">' + label + "</div>" +
          '<div class="br-rating-stars br-rating-stars--vote" data-category="' + label + '">' +
            renderStarsInteractive(displayValue, championSlug, label) +
          "</div>" +
          '<div class="br-rating-meta">' +
            (count ? '<span class="br-rating-avg">' + avg + " avg · " + count + " vote" + (count === 1 ? "" : "s") + "</span>" : "<span class=\"br-rating-avg\">Be the first to vote</span>") +
            (userVote ? '<span class="br-rating-yours">Your vote: ' + userVote + "</span>" : "") +
          "</div>" +
        "</div>"
      );
    }

    function refresh() {
      container.innerHTML = Object.keys(defaultRatings).map(renderCard).join("");
      bindStars();
    }

    function bindStars() {
      container.querySelectorAll(".br-rating-stars--vote").forEach(function (wrap) {
        var category = wrap.getAttribute("data-category");
        wrap.querySelectorAll(".br-star-btn").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var star = parseInt(btn.getAttribute("data-star"), 10);
            if (castVote(championSlug, category, star)) refresh();
          });
          btn.addEventListener("mouseenter", function () {
            var star = parseInt(btn.getAttribute("data-star"), 10);
            wrap.querySelectorAll(".br-star-btn").forEach(function (b, idx) {
              b.classList.toggle("is-hover", idx < star);
            });
          });
          wrap.addEventListener("mouseleave", function () {
            wrap.querySelectorAll(".br-star-btn").forEach(function (b) {
              b.classList.remove("is-hover");
            });
          });
        });
      });
    }

    refresh();
  }

  global.TriumphCommunity = {
    getSession: getSession,
    signup: signup,
    login: login,
    logout: logout,
    isAdmin: isAdmin,
    castVote: castVote,
    getUserVote: getUserVote,
    getVoteAggregate: getVoteAggregate,
    openAuthModal: openAuthModal,
    closeAuthModal: closeAuthModal,
    initContributeButtons: initContributeButtons,
    initRatings: initRatings,
    updateAuthUI: updateAuthUI,
    injectHeaderAuth: injectHeaderAuth
  };

  document.addEventListener("DOMContentLoaded", function () {
    injectHeaderAuth();
    initContributeButtons();
    if (global.TriumphEdits) TriumphEdits.initEditableSections();
  });
})(window);
