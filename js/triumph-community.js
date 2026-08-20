/* Triumph Guides — server auth, rating votes, contribute modal */
(function (global) {
  var API = function () { return global.TriumphAPI; };
  var cachedSession = null;
  var voteCache = {};

  function defaultAvatarSlug() {
    return (global.BATTLERISE_AVATARS && global.BATTLERISE_AVATARS.defaultSlug) || "invictus";
  }

  function portraitForSlug(slug) {
    if (global.BATTLERISE_AVATARS) return global.BATTLERISE_AVATARS.portraitFor(slug);
    return "assets/battlerise/champions/Invictus_Vertical.png";
  }

  function ensureAvatarsLoaded(cb) {
    if (global.BATTLERISE_AVATARS) {
      cb();
      return;
    }
    var script = document.createElement("script");
    script.src = "js/battlerise-avatars.js";
    script.onload = cb;
    document.head.appendChild(script);
  }

  function avatarMarkup(slug, className) {
    return '<img src="' + portraitForSlug(slug) + '" alt="" class="' + className + '">';
  }

  function normalizeUser(user) {
    if (!user) return null;
    return {
      userId: user.id,
      username: user.username,
      isAdmin: !!user.isAdmin,
      isMod: !!user.isMod,
      avatarSlug: user.avatarSlug || defaultAvatarSlug()
    };
  }

  function getSession() {
    if (!cachedSession) return null;
    return {
      userId: cachedSession.userId,
      username: cachedSession.username,
      avatarSlug: cachedSession.avatarSlug
    };
  }

  function setSession(user) {
    cachedSession = user
      ? {
          userId: user.userId,
          username: user.username,
          isAdmin: !!user.isAdmin,
          isMod: !!user.isMod,
          avatarSlug: user.avatarSlug || defaultAvatarSlug()
        }
      : null;
    updateAuthUI();
  }

  function refreshSession() {
    if (!API()) return Promise.resolve(null);
    return API().me().then(function (data) {
      setSession(normalizeUser(data.user));
      return cachedSession;
    }).catch(function () {
      setSession(null);
      return null;
    });
  }

  function signup(username, password, avatarSlug) {
    if (!API()) return Promise.reject(new Error("API not loaded."));
    return API().signup(username, password, avatarSlug).then(function (data) {
      setSession(normalizeUser(data.user));
    });
  }

  function login(username, password) {
    if (!API()) return Promise.reject(new Error("API not loaded."));
    return API().login(username, password).then(function (data) {
      setSession(normalizeUser(data.user));
    });
  }

  function logout() {
    if (!API()) { setSession(null); return Promise.resolve(); }
    return API().logout().finally(function () { setSession(null); });
  }

  function isAdmin() {
    return !!(cachedSession && cachedSession.isAdmin);
  }

  function isMod() {
    return !!(cachedSession && cachedSession.isMod);
  }

  function canEditElumia() {
    return isAdmin() || isMod();
  }

  function castVote(championSlug, category, stars) {
    if (!getSession()) {
      openAuthModal("login", function () { castVote(championSlug, category, stars); });
      return false;
    }
    if (!API()) return false;
    API().castVote(championSlug, category, stars).then(function () {
      delete voteCache[championSlug];
    }).catch(function (err) { alert(err.message); });
    return true;
  }

  var modalEl = null;
  var pendingCallback = null;

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement("div");
    modalEl.className = "tg-modal-overlay";
    modalEl.hidden = true;
    modalEl.innerHTML =
      '<div class="tg-modal tg-modal--signup" role="dialog" aria-labelledby="tg-modal-title">' +
        '<button type="button" class="tg-modal-close" aria-label="Close">&times;</button>' +
        '<h2 id="tg-modal-title" class="tg-modal-title">Join Triumph Guides</h2>' +
        '<p class="tg-modal-desc">Create an account to vote, edit wiki content, and publish guides.</p>' +
        '<div class="tg-modal-tabs">' +
          '<button type="button" class="tg-modal-tab active" data-tab="signup">Sign Up</button>' +
          '<button type="button" class="tg-modal-tab" data-tab="login">Log In</button>' +
        '</div>' +
        '<form id="tg-auth-form" class="tg-auth-form">' +
          '<div class="tg-field tg-field--signup tg-avatar-picker">' +
            '<span class="tg-field-label">Choose your BattleRise avatar</span>' +
            '<input type="hidden" name="avatar" value="invictus">' +
            '<div class="tg-avatar-grid" id="tg-avatar-grid"></div>' +
          '</div>' +
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
    var avatarPicker = form.querySelector(".tg-avatar-picker");
    var avatarInput = form.querySelector('input[name="avatar"]');
    var avatarGrid = form.querySelector("#tg-avatar-grid");
    var modalBox = modalEl.querySelector(".tg-modal");

    function buildAvatarGrid() {
      if (!global.BATTLERISE_AVATARS || !avatarGrid) return;
      var selected = avatarInput.value || defaultAvatarSlug();
      avatarGrid.innerHTML = global.BATTLERISE_AVATARS.list.map(function (a) {
        return (
          '<button type="button" class="tg-avatar-option' + (a.slug === selected ? " is-selected" : "") + '" data-slug="' + a.slug + '" title="' + a.name + '">' +
            '<img src="' + a.portrait + '" alt="' + a.name + '">' +
          "</button>"
        );
      }).join("");
      avatarGrid.querySelectorAll(".tg-avatar-option").forEach(function (btn) {
        btn.addEventListener("click", function () {
          avatarGrid.querySelectorAll(".tg-avatar-option").forEach(function (b) { b.classList.remove("is-selected"); });
          btn.classList.add("is-selected");
          avatarInput.value = btn.getAttribute("data-slug");
        });
      });
    }

    function setTab(tab) {
      activeTab = tab;
      modalEl.querySelectorAll(".tg-modal-tab").forEach(function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tab);
      });
      var isSignup = tab === "signup";
      modalEl.querySelectorAll(".tg-field--signup").forEach(function (el) { el.hidden = !isSignup; });
      if (avatarPicker) avatarPicker.hidden = !isSignup;
      if (modalBox) modalBox.classList.toggle("tg-modal--signup", isSignup);
      if (confirmField) {
        confirmField.hidden = !isSignup;
        var confirmInput = confirmField.querySelector("input");
        if (confirmInput) confirmInput.required = isSignup;
      }
      submitBtn.textContent = isSignup ? "Create Account" : "Log In";
      errorEl.hidden = true;
      if (isSignup) ensureAvatarsLoaded(buildAvatarGrid);
    }

    modalEl.querySelectorAll(".tg-modal-tab").forEach(function (btn) {
      btn.addEventListener("click", function () { setTab(btn.getAttribute("data-tab")); });
    });
    modalEl.querySelector(".tg-modal-close").addEventListener("click", closeAuthModal);
    modalEl.addEventListener("click", function (e) { if (e.target === modalEl) closeAuthModal(); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errorEl.hidden = true;
      var fd = new FormData(form);
      var username = fd.get("username");
      var password = fd.get("password");
      var confirm = fd.get("confirm");
      var avatarSlug = fd.get("avatar") || defaultAvatarSlug();
      var action = activeTab === "signup"
        ? (confirm !== password
          ? Promise.reject(new Error("Passwords do not match."))
          : signup(username, password, avatarSlug))
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
    document.querySelectorAll(".hub-header-inner, .header-inner").forEach(function (inner) {
      if (inner.querySelector(".tg-header-auth")) return;
      var link = document.createElement("a");
      link.href = "account.html";
      link.className = "tg-header-auth" + (session ? " tg-header-auth--on" : "");
      link.title = session ? "Signed in as " + session.username : "Sign in";
      link.setAttribute("aria-label", link.title);
      link.innerHTML = session
        ? '<span class="tg-header-auth-icon">' + avatarMarkup(session.avatarSlug, "tg-avatar-img tg-avatar-img--sm") + "</span>"
        : '<span class="tg-header-auth-icon">?</span>';
      inner.insertBefore(link, inner.firstChild);
    });
  }

  function updateAuthUI() {
    var session = getSession();
    injectHeaderAuth();
    document.querySelectorAll(".tg-header-auth").forEach(function (link) {
      link.href = "account.html";
      link.title = session ? "Signed in as " + session.username : "Sign in";
      link.classList.toggle("tg-header-auth--on", !!session);
      var icon = link.querySelector(".tg-header-auth-icon");
      if (session) {
        icon.innerHTML = avatarMarkup(session.avatarSlug, "tg-avatar-img tg-avatar-img--sm");
      } else {
        icon.textContent = "?";
      }
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
        bar.querySelector("#tg-logout-btn").addEventListener("click", function () { logout(); });
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
        if (getSession()) window.location.href = "guide-create.html";
        else openAuthModal("signup", function () { window.location.href = "guide-create.html"; });
      });
    });
    updateAuthUI();
  }

  function renderStarsInteractive(value) {
    var html = "";
    for (var i = 1; i <= 5; i++) {
      html += '<button type="button" class="br-star-btn' + (i <= value ? " is-filled" : "") + '" data-star="' + i + '" aria-label="Rate ' + i + ' out of 5">' +
        (i <= value ? "\u2605" : "\u2606") + "</button>";
    }
    return html;
  }

  function initRatings(championSlug, container, defaultRatings) {
    if (!container || !API()) return;

    var header = container.closest(".br-section");
    if (header && !header.querySelector(".br-ratings-hint")) {
      var hint = document.createElement("p");
      hint.className = "br-ratings-hint";
      hint.textContent = "Community ratings — click stars to vote. Sign in required.";
      header.insertBefore(hint, container);
    }

    function fetchStats(label) {
      return API().getVoteStats(championSlug, label).catch(function () {
        return { average: defaultRatings[label], count: 0, userVote: null };
      });
    }

    function renderCard(label, stats) {
      var avg = stats.average != null ? stats.average : defaultRatings[label];
      var userVote = stats.userVote;
      var count = stats.count || 0;
      var displayValue = userVote || Math.round(avg);
      return (
        '<div class="br-rating-card" data-category="' + label + '">' +
          '<div class="br-rating-label">' + label + "</div>" +
          '<div class="br-rating-stars br-rating-stars--vote" data-category="' + label + '">' +
            renderStarsInteractive(displayValue) +
          "</div>" +
          '<div class="br-rating-meta">' +
            (count ? '<span class="br-rating-avg">' + avg + " avg · " + count + " vote" + (count === 1 ? "" : "s") + "</span>" : '<span class="br-rating-avg">Be the first to vote</span>') +
            (userVote ? '<span class="br-rating-yours">Your vote: ' + userVote + "</span>" : "") +
          "</div>" +
        "</div>"
      );
    }

    function refresh() {
      var labels = Object.keys(defaultRatings);
      Promise.all(labels.map(fetchStats)).then(function (allStats) {
        container.innerHTML = labels.map(function (label, i) { return renderCard(label, allStats[i]); }).join("");
        bindStars();
      });
    }

    function bindStars() {
      container.querySelectorAll(".br-rating-stars--vote").forEach(function (wrap) {
        var category = wrap.getAttribute("data-category");
        wrap.querySelectorAll(".br-star-btn").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var star = parseInt(btn.getAttribute("data-star"), 10);
            if (!getSession()) {
              openAuthModal("login", function () {
                API().castVote(championSlug, category, star).then(refresh);
              });
              return;
            }
            API().castVote(championSlug, category, star).then(refresh).catch(function (err) { alert(err.message); });
          });
        });
      });
    }

    refresh();
  }

  global.TriumphCommunity = {
    getSession: getSession,
    refreshSession: refreshSession,
    signup: signup,
    login: login,
    logout: logout,
    isAdmin: isAdmin,
    isMod: isMod,
    canEditElumia: canEditElumia,
    castVote: castVote,
    openAuthModal: openAuthModal,
    closeAuthModal: closeAuthModal,
    initContributeButtons: initContributeButtons,
    initRatings: initRatings,
    updateAuthUI: updateAuthUI,
    portraitForSlug: portraitForSlug,
    avatarMarkup: avatarMarkup,
  };

  document.addEventListener("DOMContentLoaded", function () {
    injectHeaderAuth();
    refreshSession().finally(function () {
      initContributeButtons();
      if (global.TriumphEdits) TriumphEdits.initEditableSections();
    });
  });
})(window);
