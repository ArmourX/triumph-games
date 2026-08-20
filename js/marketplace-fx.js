/* Marketplace FX — particles, tilt, sparkles, live stats */

(function (global) {
  var prefersReduced =
    global.matchMedia &&
    global.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function burstSparkles(x, y, count) {
    if (prefersReduced) return;
    var layer = document.getElementById("mp-sparkle-layer");
    if (!layer) return;
    count = count || 18;
    for (var i = 0; i < count; i++) {
      var s = document.createElement("span");
      s.className = "mp-sparkle";
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      var dist = 40 + Math.random() * 90;
      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.setProperty("--sx", Math.cos(angle) * dist + "px");
      s.style.setProperty("--sy", Math.sin(angle) * dist + "px");
      s.style.background =
        i % 3 === 0 ? "#4fd2ff" : i % 3 === 1 ? "#f4dc9a" : "#6b5ce7";
      s.style.animationDelay = Math.random() * 0.12 + "s";
      layer.appendChild(s);
      setTimeout(function (node) {
        if (node.parentNode) node.parentNode.removeChild(node);
      }, 900, s);
    }
  }

  function ripple(el, event) {
    if (!el || prefersReduced) return;
    var rect = el.getBoundingClientRect();
    var rippleEl = document.createElement("span");
    rippleEl.className = "mp-ripple";
    var size = Math.max(rect.width, rect.height);
    rippleEl.style.width = rippleEl.style.height = size + "px";
    rippleEl.style.left = (event.clientX - rect.left - size / 2) + "px";
    rippleEl.style.top = (event.clientY - rect.top - size / 2) + "px";
    el.appendChild(rippleEl);
    setTimeout(function () {
      if (rippleEl.parentNode) rippleEl.parentNode.removeChild(rippleEl);
    }, 650);
  }

  function staggerReveal(container) {
    if (!container || prefersReduced) return;
    var items = container.querySelectorAll(
      ".mp-tile, .mp-browse-card, .mp-sale-row, .mp-activity-row, .mp-collection-card, .mp-sell-hero-card, .mp-sell-item-card"
    );
    items.forEach(function (item, index) {
      item.classList.remove("is-revealed");
      item.style.setProperty("--reveal-i", index);
      requestAnimationFrame(function () {
        setTimeout(function () {
          item.classList.add("is-revealed");
        }, Math.min(index * 55, 600));
      });
    });
  }

  function formatUsdStat(amount) {
    var n = Number(amount);
    if (!isFinite(n) || n < 0) return "$0.00";
    if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "k";
    return "$" + n.toFixed(2);
  }

  function animateValue(el, target, suffix, formatFn) {
    if (!el) return;
    suffix = suffix || "";
    formatFn =
      formatFn ||
      function (val) {
        return (
          (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix
        );
      };
    var start = Number(el.dataset.current || 0);
    var diff = target - start;
    var duration = 700;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = start + diff * eased;
      el.textContent = formatFn(val);
      if (p < 1) requestAnimationFrame(step);
      else el.dataset.current = String(target);
    }
    requestAnimationFrame(step);
  }

  function updateLiveStats(listings) {
    var floorEl = document.querySelector('[data-stat="floor"]');
    var volumeEl = document.querySelector('[data-stat="volume"]');
    var countEl = document.querySelector('[data-stat="listings"]');
    var dealsEl = document.querySelector('[data-stat="deals"]');
    if (!listings.length) return;
    var prices = listings.map(function (l) {
      return l.price;
    });
    var floor = Math.min.apply(null, prices);
    var volume = prices.reduce(function (a, b) {
      return a + b;
    }, 0);
    var topDeal = listings.slice().sort(function (a, b) {
      return (b.score || 0) - (a.score || 0);
    })[0];
    animateValue(floorEl, floor, "", formatUsdStat);
    animateValue(volumeEl, Math.round(volume), "", function (val) {
      return formatUsdStat(val);
    });
    animateValue(countEl, listings.length, "");
    if (dealsEl && topDeal) {
      dealsEl.textContent = (topDeal.score || 0) + "x";
    }
  }

  function initParticles() {
    if (prefersReduced) return;
    var layer = document.getElementById("mp-particles");
    if (!layer) return;
    var colors = ["#4fd2ff", "#9eebff", "#6b5ce7"];
    for (var i = 0; i < 24; i++) {
      var p = document.createElement("span");
      p.className = "mp-particle";
      var size = 2 + Math.random() * 4;
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.left = Math.random() * 100 + "%";
      p.style.top = Math.random() * 100 + "%";
      p.style.background = colors[i % colors.length];
      p.style.setProperty("--dur", 8 + Math.random() * 14 + "s");
      p.style.setProperty("--delay", Math.random() * 8 + "s");
      p.style.setProperty("--drift", -30 + Math.random() * 60 + "px");
      layer.appendChild(p);
    }
  }

  function initCursorGlow() {
    if (prefersReduced || global.innerWidth < 900) return;
    var glow = document.getElementById("mp-cursor-glow");
    if (!glow) return;
    var visible = false;
    document.addEventListener("mousemove", function (e) {
      glow.style.transform =
        "translate(" + (e.clientX - 150) + "px," + (e.clientY - 150) + "px)";
      if (!visible) {
        glow.classList.add("is-visible");
        visible = true;
      }
    });
    document.addEventListener("mouseleave", function () {
      glow.classList.remove("is-visible");
      visible = false;
    });
  }

  function initCardTilt() {
    if (prefersReduced || global.innerWidth < 768) return;
    document.addEventListener("mousemove", function (e) {
      var card = e.target.closest(".mp-tile, .mp-browse-card, .mp-collection-card");
      if (!card || !card.classList.contains("is-revealed")) return;
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform =
        "perspective(600px) rotateY(" +
        x * 10 +
        "deg) rotateX(" +
        -y * 10 +
        "deg) translateY(-6px)";
    });
    document.addEventListener("mouseout", function (e) {
      var card = e.target.closest(".mp-tile, .mp-browse-card, .mp-collection-card");
      if (card) card.style.transform = "";
    });
  }

  function initRailControls() {
    document.querySelectorAll(".mp-rail-wrap").forEach(function (wrap) {
      var rail = wrap.querySelector(".mp-rail");
      var prev = wrap.querySelector(".mp-rail-btn--prev");
      var next = wrap.querySelector(".mp-rail-btn--next");
      if (!rail || !prev || !next) return;
      function scrollBy(dir) {
        rail.scrollBy({ left: dir * 220, behavior: "smooth" });
        wrap.classList.add("is-scrolling");
        clearTimeout(scrollBy._t);
        scrollBy._t = setTimeout(function () {
          wrap.classList.remove("is-scrolling");
        }, 400);
      }
      prev.addEventListener("click", function () {
        scrollBy(-1);
      });
      next.addEventListener("click", function () {
        scrollBy(1);
      });
    });
  }

  function initRewardCards() {
    document.querySelectorAll(".mp-reward-card").forEach(function (card) {
      if (card.hasAttribute("data-quest")) return;
      card.addEventListener("click", function (e) {
        if (card.classList.contains("is-claimed")) return;
        card.classList.add("is-claimed");
        var rect = card.getBoundingClientRect();
        burstSparkles(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          24
        );
        ripple(card, e);
        var val = card.querySelector(".mp-reward-value");
        if (val) {
          val.textContent = "✓";
          val.style.color = "#4fd2ff";
        }
      });
    });
  }

  function initCommunityCards() {
    document.querySelectorAll(".mp-community-list li").forEach(function (li) {
      li.addEventListener("click", function (e) {
        li.classList.toggle("is-joined");
        ripple(li, e);
        if (li.classList.contains("is-joined")) {
          var badge = li.querySelector(".mp-join-badge");
          if (!badge) {
            badge = document.createElement("span");
            badge.className = "mp-join-badge";
            badge.textContent = "Joined";
            li.appendChild(badge);
          }
        }
      });
    });
  }

  function initSweepButton() {
    var btn = document.getElementById("mp-sweep-btn");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      ripple(btn, e);
      btn.classList.add("is-pulsing");
      var rect = btn.getBoundingClientRect();
      burstSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, 30);
        btn.textContent = "Sweeping floor…";
      setTimeout(function () {
        btn.textContent = "Floor swept! +120 bounty";
        btn.classList.remove("is-pulsing");
      }, 1200);
      setTimeout(function () {
        btn.textContent = "Sweep floor bundles";
      }, 3200);
    });
  }

  function initBannerParallax() {
    if (prefersReduced) return;
    var banner = document.querySelector(".mp-hero-banner img");
    if (!banner) return;
    global.addEventListener(
      "scroll",
      function () {
        var y = global.scrollY * 0.25;
        banner.style.transform = "scale(1.08) translateY(" + y + "px)";
      },
      { passive: true }
    );
  }

  function formatTimer(ms) {
    var total = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(total / 60);
    var s = total % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function setTimerUrgency(el, ms, criticalMs) {
    if (!el) return;
    criticalMs = criticalMs || 120000;
    el.classList.toggle("is-urgent", ms > 0 && ms <= criticalMs);
    el.classList.toggle("is-hot", ms > criticalMs && ms <= criticalMs * 2);
  }

  var sellFx = {
    listingEndsAt: 0,
    bindEndsAt: 0,
    listingInterval: null,
    bindInterval: null,
  };

  function updateSellListingTimer() {
    var el = document.getElementById("mp-sell-listing-timer");
    var wrap = document.querySelector(".mp-sell-timer--window");
    if (!el) return;
    var remaining = sellFx.listingEndsAt - Date.now();
    if (remaining <= 0) {
      el.textContent = "00:00";
      el.classList.add("is-urgent");
      if (wrap) wrap.classList.add("is-critical");
      return;
    }
    el.textContent = formatTimer(remaining);
    setTimerUrgency(el, remaining, 120000);
    if (wrap) wrap.classList.toggle("is-critical", remaining <= 120000);
  }

  function updateSellBindTimer() {
    var el = document.getElementById("mp-sell-bind-timer");
    var wrap = document.getElementById("mp-sell-bind-timer-wrap");
    if (!el || !wrap || wrap.hidden) return;
    var remaining = sellFx.bindEndsAt - Date.now();
    if (remaining <= 0) {
      el.textContent = "00:00";
      el.classList.add("is-urgent");
      return;
    }
    el.textContent = formatTimer(remaining);
    setTimerUrgency(el, remaining, 60000);
  }

  function startSellListingWindow(minutes) {
    minutes = minutes || 15;
    sellFx.listingEndsAt = Date.now() + minutes * 60 * 1000;
    if (sellFx.listingInterval) clearInterval(sellFx.listingInterval);
    updateSellListingTimer();
    sellFx.listingInterval = setInterval(updateSellListingTimer, 1000);
  }

  function startSellBindLock(minutes) {
    minutes = minutes || 10;
    var wrap = document.getElementById("mp-sell-bind-timer-wrap");
    if (wrap) wrap.hidden = false;
    sellFx.bindEndsAt = Date.now() + minutes * 60 * 1000;
    if (sellFx.bindInterval) clearInterval(sellFx.bindInterval);
    updateSellBindTimer();
    sellFx.bindInterval = setInterval(updateSellBindTimer, 1000);
  }

  function stopSellBindLock() {
    var wrap = document.getElementById("mp-sell-bind-timer-wrap");
    if (wrap) wrap.hidden = true;
    if (sellFx.bindInterval) {
      clearInterval(sellFx.bindInterval);
      sellFx.bindInterval = null;
    }
  }

  function updateSellBundleScore(heroCount, itemCount) {
    var el = document.getElementById("mp-sell-bundle-score");
    if (!el) return;
    var score = heroCount * 50 + itemCount * 12;
    if (!heroCount && !itemCount) {
      el.textContent = "—";
      el.classList.remove("is-hot");
      return;
    }
    el.textContent = score + " PWR";
    el.classList.toggle("is-hot", itemCount >= 5);
    animateValue(el, score, " PWR");
  }

  function markSellSteps(activeStep) {
    document.querySelectorAll(".mp-sell-step-tab").forEach(function (tab) {
      var step = tab.dataset.sellStep;
      tab.classList.toggle("is-active", step === activeStep);
      var order = { hero: 1, items: 2, list: 3 };
      tab.classList.toggle(
        "is-complete",
        order[step] < order[activeStep]
      );
    });
  }

  function animateSellStepPanel(step) {
    var panelMap = {
      hero: document.getElementById("mp-sell-step-hero"),
      items: document.getElementById("mp-sell-step-items"),
      list: document.getElementById("mp-sell-step-list"),
    };
    var panel = panelMap[step];
    if (!panel || prefersReduced) return;
    panel.classList.remove("is-entering");
    void panel.offsetWidth;
    panel.classList.add("is-entering");
  }

  function flashSellBoundBanner() {
    var banner = document.getElementById("mp-sell-bound-banner");
    if (!banner) return;
    banner.classList.add("is-locked");
    setTimeout(function () {
      banner.classList.remove("is-locked");
    }, 2000);
  }

  function onSellWizardRender(container) {
    if (container) staggerReveal(container);
  }

  function onSellStepChange(step) {
    markSellSteps(step);
    animateSellStepPanel(step);
    var wizard = document.querySelector(".mp-sell-wizard");
    if (wizard && !prefersReduced) {
      wizard.classList.remove("is-step-flash");
      void wizard.offsetWidth;
      wizard.classList.add("is-step-flash");
    }
  }

  function onSellBind(btn) {
    if (btn) {
      btn.classList.add("is-binding");
      setTimeout(function () {
        btn.classList.remove("is-binding");
      }, 1200);
    }
    startSellBindLock(10);
    flashSellBoundBanner();
    var banner = document.getElementById("mp-sell-bound-banner");
    if (banner) {
      var rect = banner.getBoundingClientRect();
      burstSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2, 36);
    }
  }

  function onSellWalletLoaded() {
    startSellListingWindow(15);
  }

  function initSellCardTilt() {
    if (prefersReduced || global.innerWidth < 768) return;
    document.addEventListener("mousemove", function (e) {
      var card = e.target.closest(".mp-sell-hero-card.is-revealed");
      if (!card) return;
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform =
        "perspective(500px) rotateY(" +
        x * 8 +
        "deg) rotateX(" +
        -y * 8 +
        "deg) translateY(-4px)";
    });
    document.addEventListener("mouseout", function (e) {
      var card = e.target.closest(".mp-sell-hero-card");
      if (card) card.style.transform = "";
    });
  }

  function initBountyTimerUrgency() {
    var el = document.getElementById("mp-bounty-timer");
    if (!el) return;
    setInterval(function () {
      var text = el.textContent || "";
      var parts = text.split(":");
      if (parts.length < 3) return;
      var h = Number(parts[0]) || 0;
      var m = Number(parts[1]) || 0;
      var s = Number(parts[2]) || 0;
      var totalSec = h * 3600 + m * 60 + s;
      el.classList.toggle("is-urgent", totalSec > 0 && totalSec <= 300);
    }, 1000);
  }

  function onSectionChange(sectionEl) {
    if (!sectionEl) return;
    sectionEl.classList.remove("is-entering");
    void sectionEl.offsetWidth;
    sectionEl.classList.add("is-entering");
    staggerReveal(sectionEl);
  }

  global.MarketplaceFx = {
    init: function () {
      initParticles();
      initCursorGlow();
      initCardTilt();
      initRailControls();
      initRewardCards();
      initCommunityCards();
      initSweepButton();
      initBannerParallax();
      initSellCardTilt();
      initBountyTimerUrgency();
    },
    afterRender: function (container, listings) {
      if (container) staggerReveal(container);
      if (listings) updateLiveStats(listings);
    },
    burst: burstSparkles,
    ripple: ripple,
    onSectionChange: onSectionChange,
    staggerReveal: staggerReveal,
    onSellWizardRender: onSellWizardRender,
    onSellStepChange: onSellStepChange,
    onSellBind: onSellBind,
    onSellWalletLoaded: onSellWalletLoaded,
    stopSellBindLock: stopSellBindLock,
    resumeSellBindLock: function () {
      startSellBindLock(10);
      flashSellBoundBanner();
    },
    updateSellBundleScore: updateSellBundleScore,
  };
})(window);
