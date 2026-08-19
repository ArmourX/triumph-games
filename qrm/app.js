const SPECIES = ["Beast", "Dragon", "Slime", "Elemental", "Spirit", "Insect", "Aquatic", "Undead"];
const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
const RARITY_THRESHOLDS = [1, 5, 15, 40];
const SYLLABLES = [
  "kor", "vex", "lun", "thar", "zix", "mora", "glen", "pyx",
  "brix", "nava", "quor", "syl", "tarn", "ulm", "vora", "wex",
  "yor", "zep", "axen", "brum", "cira", "dusk", "ember", "frost",
  "gale", "hex", "ivy", "jolt", "kite", "lynx", "myth", "nova"
];

const REGIONS = [
  { id: "meadow", name: "Home Meadow", hours: 0.2, minLevel: 1, fee: 0 },
  { id: "forest", name: "Verdant Forest", hours: 0.5, minLevel: 3, fee: 0 },
  { id: "volcano", name: "Ashen Volcano", hours: 1, minLevel: 6, fee: 0 },
  { id: "ocean", name: "Open Ocean", hours: 1, minLevel: 8, fee: 0 },
  { id: "ruins", name: "Ancient Ruins", hours: 2, minLevel: 10, fee: 0 }
];

const SAVE_KEY = "qrm-save-v1";

const state = loadSave();

let screen = "scan";
let battle = null;
let adventure = null;
let circuit = null;

const root = document.getElementById("screenRoot");
const hudCoins = document.getElementById("hudCoins");
const hudRank = document.getElementById("hudRank");
const hudDex = document.getElementById("hudDex");

document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    screen = btn.dataset.screen;
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t === btn));
    render();
  });
});

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    coins: 50,
    trainerXp: 0,
    rankIndex: 0,
    unlockedDex: [],
    monsters: [],
    activeId: null,
    adventureLog: [],
    circuitLog: [],
    seasonRating: 1000,
    careerPoints: 0,
    seasonWins: 0,
    seasonLosses: 0,
    cupWins: 0,
    equippedTitle: "Unranked"
  };
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  refreshHud();
}

function refreshHud() {
  hudCoins.textContent = `🪙 ${state.coins}`;
  hudRank.textContent = `Lv ${state.rankIndex + 1}`;
  hudDex.textContent = `Dex ${state.unlockedDex.length}`;
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function seedFromInt(value) {
  let x = value >>> 0;
  x = ((x >>> 16) ^ x) * 0x45d9f3b;
  x = ((x >>> 16) ^ x) * 0x45d9f3b;
  x = (x >>> 16) ^ x;
  return x | 0;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function positiveMod(seed, mod) {
  return ((seed >>> 0) % mod + mod) % mod;
}

function pickRarity(rng) {
  const roll = Math.floor(rng() * 100);
  if (roll < RARITY_THRESHOLDS[0]) return "Legendary";
  if (roll < RARITY_THRESHOLDS[1]) return "Epic";
  if (roll < RARITY_THRESHOLDS[2]) return "Rare";
  if (roll < RARITY_THRESHOLDS[3]) return "Uncommon";
  return "Common";
}

function generateName(rng) {
  const count = 2 + Math.floor(rng() * 2);
  let raw = "";
  for (let i = 0; i < count; i++) raw += SYLLABLES[Math.floor(rng() * SYLLABLES.length)];
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function colorFromRng(rng) {
  const r = 0.7 + rng() * 0.3;
  const g = 0.7 + rng() * 0.3;
  const b = 0.7 + rng() * 0.3;
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

function dexEntry(dexNumber) {
  const rng = mulberry32(seedFromInt(dexNumber * 7919));
  return {
    dexNumber,
    name: generateName(rng),
    species: SPECIES[Math.floor(rng() * SPECIES.length)],
    rarity: pickRarity(rng),
    primary: colorFromRng(rng),
    secondary: colorFromRng(rng),
    hp: 50 + Math.floor(rng() * 150),
    attack: 10 + Math.floor(rng() * 90),
    defense: 10 + Math.floor(rng() * 90),
    speed: 5 + Math.floor(rng() * 75)
  };
}

function resolveDexFromHash(hex) {
  const seed = parseInt(hex.slice(0, 8), 16) | 0;
  return positiveMod(seed, 500) + 1;
}

async function generateFromQr(content) {
  const hash = await sha256Hex(content.trim());
  const dexNumber = resolveDexFromHash(hash);
  const entry = dexEntry(dexNumber);
  const rng = mulberry32(seedFromInt(parseInt(hash.slice(0, 8), 16)));
  const id = hash.slice(0, 16);
  return {
    id,
    hash,
    dexNumber,
    name: entry.name,
    species: entry.species,
    rarity: entry.rarity,
    primary: entry.primary,
    secondary: entry.secondary,
    hp: clamp(entry.hp + Math.floor(rng() * 21) - 10, 1, 999),
    attack: clamp(entry.attack + Math.floor(rng() * 17) - 8, 1, 999),
    defense: clamp(entry.defense + Math.floor(rng() * 17) - 8, 1, 999),
    speed: clamp(entry.speed + Math.floor(rng() * 13) - 6, 1, 999),
    level: 1,
    xp: 0,
    source: content.trim()
  };
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function activeMonster() {
  return state.monsters.find((m) => m.id === state.activeId) || state.monsters[0] || null;
}

function unlockDex(num) {
  if (!state.unlockedDex.includes(num)) state.unlockedDex.push(num);
}

function addTrainerXp(amount) {
  state.trainerXp += amount;
  const thresholds = [0, 100, 300, 600, 1000, 2000];
  while (state.rankIndex < thresholds.length - 1 && state.trainerXp >= thresholds[state.rankIndex + 1]) {
    state.rankIndex++;
    state.coins += 20;
  }
}

function appendLog(key, line) {
  state[key].unshift(`[${new Date().toLocaleTimeString()}] ${line}`);
  state[key] = state[key].slice(0, 24);
}

function render() {
  refreshHud();
  if (screen === "scan") renderScan();
  else if (screen === "ranch") renderRanch();
  else if (screen === "battle") renderBattle();
  else if (screen === "adventure") renderAdventure();
  else renderCircuit();
}

function renderScan() {
  root.innerHTML = `
    <section class="card">
      <h2>Scan a code</h2>
      <p class="muted">Paste any text or URL — the same input always hatches the same monster, matching the Unity game's SHA-256 dex logic.</p>
      <textarea id="qrInput" placeholder="Paste QR content here…"></textarea>
      <div class="row">
        <button class="btn" id="scanBtn">Hatch Monster</button>
        <button class="btn secondary" id="demoBtn">Demo Scan</button>
      </div>
      <p id="scanStatus" class="muted" style="margin-top:12px"></p>
    </section>
  `;
  const status = document.getElementById("scanStatus");
  document.getElementById("demoBtn").onclick = () => {
    document.getElementById("qrInput").value = `qrm-demo-${Date.now()}`;
  };
  document.getElementById("scanBtn").onclick = async () => {
    const content = document.getElementById("qrInput").value;
    if (!content.trim()) {
      status.textContent = "Enter some text to scan.";
      return;
    }
    if (state.monsters.length >= 20) {
      status.textContent = "Ranch is full (20).";
      return;
    }
    const existing = state.monsters.find((m) => m.source === content.trim());
    if (existing) {
      status.textContent = `${existing.name} already captured from this code.`;
      state.activeId = existing.id;
      save();
      return;
    }
    const monster = await generateFromQr(content);
    state.monsters.push(monster);
    state.activeId = monster.id;
    unlockDex(monster.dexNumber);
    addTrainerXp(10);
    appendLog("adventureLog", `Hatched ${monster.name} (#${String(monster.dexNumber).padStart(3, "0")}).`);
    status.textContent = `Captured ${monster.name} (${monster.rarity} ${monster.species})!`;
    save();
  };
}

function renderRanch() {
  const active = activeMonster();
  const cards = state.monsters.map((m) => `
    <article class="monster-card ${m.id === state.activeId ? "active" : ""}" data-id="${m.id}">
      <div class="monster-sprite" style="background:linear-gradient(135deg, ${m.primary}, ${m.secondary})">${String(m.dexNumber).padStart(3, "0")}</div>
      <strong>${m.name}</strong>
      <div class="statline">${m.rarity} ${m.species} · Lv ${m.level}</div>
      <div class="statline">HP ${m.hp} ATK ${m.attack} DEF ${m.defense} SPD ${m.speed}</div>
    </article>
  `).join("");

  root.innerHTML = `
    <section class="card">
      <h2>Ranch</h2>
      <p class="muted">${state.monsters.length}/20 monsters · Active: ${active ? active.name : "none"}</p>
      <div class="row">
        <button class="btn secondary" id="feedBtn" ${active ? "" : "disabled"}>Feed (+mood)</button>
        <button class="btn secondary" id="trainBtn" ${active ? "" : "disabled"}>Train (+XP)</button>
      </div>
    </section>
    <div class="monster-grid">${cards || '<p class="muted">Scan your first monster.</p>'}</div>
  `;

  root.querySelectorAll(".monster-card").forEach((el) => {
    el.onclick = () => {
      state.activeId = el.dataset.id;
      save();
      render();
    };
  });

  document.getElementById("feedBtn")?.addEventListener("click", () => {
    if (!active || state.coins < 5) return;
    state.coins -= 5;
    active.mood = (active.mood || 50) + 8;
    save();
    render();
  });

  document.getElementById("trainBtn")?.addEventListener("click", () => {
    if (!active) return;
    gainXp(active, 12);
    save();
    render();
  });
}

function gainXp(monster, amount) {
  monster.xp = (monster.xp || 0) + amount;
  while (monster.xp >= monster.level * 20) {
    monster.xp -= monster.level * 20;
    monster.level++;
    monster.hp += 4;
    monster.attack += 2;
    monster.defense += 2;
    monster.speed += 1;
  }
}

function renderBattle() {
  const player = activeMonster();
  if (!player) {
    root.innerHTML = `<section class="card"><h2>Battle</h2><p class="muted">Scan a monster first.</p></section>`;
    return;
  }

  if (!battle) {
    root.innerHTML = `
      <section class="card">
        <h2>Battle Arena</h2>
        <p class="muted">Quick turn fights against a wild opponent scaled to ${player.name}.</p>
        <div class="row">
          <button class="btn" id="startBattle">Fight Wild</button>
        </div>
      </section>
    `;
    document.getElementById("startBattle").onclick = () => {
      const seed = seedFromInt(player.dexNumber + player.level + Date.now());
      const wildEntry = dexEntry(positiveMod(seed, 500) + 1);
      const rng = mulberry32(seed);
      battle = {
        player: { ...player, currentHp: player.hp },
        wild: {
          name: `Wild ${wildEntry.name}`,
          level: player.level + Math.floor(rng() * 3),
          hp: wildEntry.hp,
          attack: wildEntry.attack,
          defense: wildEntry.defense,
          currentHp: wildEntry.hp
        },
        log: [`A wild ${wildEntry.name} appeared!`]
      };
      render();
    };
    return;
  }

  root.innerHTML = `
    <section class="card">
      <h2>${player.name} vs ${battle.wild.name}</h2>
      <p class="statline">${player.name}: ${battle.player.currentHp}/${player.hp} HP</p>
      <p class="statline">${battle.wild.name}: ${battle.wild.currentHp}/${battle.wild.hp} HP</p>
      <div class="row">
        <button class="btn" id="attackBtn" ${battle.over ? "disabled" : ""}>Attack</button>
        <button class="btn secondary" id="resetBattle" ${battle.over ? "" : "disabled"}>New Fight</button>
      </div>
      <div class="log" style="margin-top:12px">${battle.log.join("\n")}</div>
    </section>
  `;

  document.getElementById("attackBtn")?.addEventListener("click", () => {
    if (battle.over) return;
    const pDmg = calcDamage(battle.player, battle.wild);
    battle.wild.currentHp -= pDmg;
    battle.log.push(`${player.name} hits for ${pDmg}.`);
    if (battle.wild.currentHp <= 0) {
      battle.over = "win";
      battle.log.push("Victory!");
      gainXp(player, 15 + battle.wild.level);
      state.coins += 4 + battle.wild.level;
      addTrainerXp(8 + battle.wild.level);
      appendLog("adventureLog", `${player.name} won a wild battle.`);
      save();
      render();
      return;
    }
    const wDmg = calcDamage(battle.wild, battle.player);
    battle.player.currentHp -= wDmg;
    battle.log.push(`${battle.wild.name} hits for ${wDmg}.`);
    if (battle.player.currentHp <= 0) {
      battle.over = "loss";
      battle.log.push("Defeat…");
      save();
    }
    render();
  });

  document.getElementById("resetBattle")?.addEventListener("click", () => {
    battle = null;
    render();
  });
}

function calcDamage(attacker, defender) {
  const base = Math.max(1, attacker.attack - Math.floor(defender.defense / 3));
  return clamp(base + Math.floor(Math.random() * 6), 1, 999);
}

function renderAdventure() {
  const party = adventure?.partyIds?.map((id) => state.monsters.find((m) => m.id === id)).filter(Boolean) || [];
  const activeRegion = adventure ? REGIONS.find((r) => r.id === adventure.regionId) : REGIONS[0];

  root.innerHTML = `
    <section class="card">
      <h2>Adventure Hub</h2>
      <p class="muted">Send 1–3 monsters on timed trips. Progress continues while you're away (accelerated demo timer).</p>
      <label class="muted">Region</label>
      <select id="regionSelect">${REGIONS.map((r) => `<option value="${r.id}">${r.name} · Lv ${r.minLevel}+ · ${r.hours}h</option>`).join("")}</select>
      <p class="muted" style="margin-top:10px">Party: ${party.length ? party.map((p) => p.name).join(", ") : (activeMonster()?.name || "none")}</p>
      <div class="row">
        <button class="btn" id="departBtn">Depart</button>
        <button class="btn secondary" id="checkBtn">Check Progress</button>
        <button class="btn secondary" id="addPartyBtn">Toggle Active In Party</button>
      </div>
      <p id="advStatus" class="muted" style="margin-top:10px">${adventure?.status || ""}</p>
    </section>
    <section class="card">
      <h3>Adventure Log</h3>
      <div class="log">${state.adventureLog.join("\n") || "No trips yet."}</div>
    </section>
  `;

  if (adventure?.regionId) document.getElementById("regionSelect").value = adventure.regionId;

  document.getElementById("addPartyBtn").onclick = () => {
    const m = activeMonster();
    if (!m) return;
    if (!adventure) adventure = { partyIds: [], regionId: REGIONS[0].id };
    const idx = adventure.partyIds.indexOf(m.id);
    if (idx >= 0) adventure.partyIds.splice(idx, 1);
    else if (adventure.partyIds.length < 3) adventure.partyIds.push(m.id);
    render();
  };

  document.getElementById("departBtn").onclick = () => {
    const region = REGIONS.find((r) => r.id === document.getElementById("regionSelect").value);
    const ids = adventure?.partyIds?.length ? [...adventure.partyIds] : (activeMonster() ? [activeMonster().id] : []);
    if (!ids.length) {
      document.getElementById("advStatus").textContent = "Pick at least one monster.";
      return;
    }
    const members = ids.map((id) => state.monsters.find((m) => m.id === id)).filter(Boolean);
    const low = members.some((m) => m.level < region.minLevel);
    if (low) {
      document.getElementById("advStatus").textContent = `Need Lv ${region.minLevel}+ for ${region.name}.`;
      return;
    }
    adventure = {
      partyIds: ids,
      regionId: region.id,
      endsAt: Date.now() + region.hours * 3600 * 1000 * 0.02,
      status: `Party left for ${region.name}.`
    };
    appendLog("adventureLog", adventure.status);
    save();
    render();
  };

  document.getElementById("checkBtn").onclick = () => {
    if (!adventure?.endsAt) {
      document.getElementById("advStatus").textContent = "No party is away.";
      return;
    }
    if (Date.now() < adventure.endsAt) {
      const sec = Math.ceil((adventure.endsAt - Date.now()) / 1000);
      document.getElementById("advStatus").textContent = `Returning in ~${sec}s (demo timer).`;
      return;
    }
    const region = REGIONS.find((r) => r.id === adventure.regionId);
    const members = adventure.partyIds.map((id) => state.monsters.find((m) => m.id === id)).filter(Boolean);
    members.forEach((m) => gainXp(m, 8 + region.minLevel));
    state.coins += 6 + region.minLevel * 2;
    addTrainerXp(6);
    const loot = Math.random() < 0.7 ? "herbs" : "berries";
    appendLog("adventureLog", `Returned from ${region.name}. +XP, +coins, found ${loot}.`);
    adventure = { partyIds: [], regionId: region.id, status: `Returned from ${region.name}.` };
    save();
    render();
  };
}

function renderCircuit() {
  root.innerHTML = `
    <section class="card">
      <h2>Ranked Circuit</h2>
      <p class="muted">Season rating ${state.seasonRating} · ${state.careerPoints} RP · ${state.seasonWins}W/${state.seasonLosses}L · Title: ${state.equippedTitle}</p>
      <div class="row">
        <button class="btn purple" id="ladderBtn">Ladder Match (8c)</button>
        <button class="btn secondary" id="cupBtn">Meadow Cup (20c)</button>
        <button class="btn secondary" id="resolveCircuit">Resolve Match</button>
      </div>
      <p id="circuitStatus" class="muted" style="margin-top:10px">${circuit?.status || ""}</p>
    </section>
    <section class="card">
      <h3>Circuit Log</h3>
      <div class="log">${state.circuitLog.join("\n") || "No circuit matches yet."}</div>
    </section>
  `;

  document.getElementById("ladderBtn").onclick = () => startCircuit("ladder", 8);
  document.getElementById("cupBtn").onclick = () => startCircuit("cup", 20);
  document.getElementById("resolveCircuit").onclick = resolveCircuit;
}

function startCircuit(mode, fee) {
  const player = activeMonster();
  if (!player) {
    document.getElementById("circuitStatus").textContent = "Set an active monster.";
    return;
  }
  if (state.coins < fee) {
    document.getElementById("circuitStatus").textContent = `Need ${fee} coins.`;
    return;
  }
  state.coins -= fee;
  const seed = seedFromInt(player.dexNumber + state.seasonRating + Date.now());
  const opp = dexEntry(positiveMod(seed, 500) + 1);
  circuit = {
    mode,
    opponent: `CPU ${opp.name}`,
    seed,
    playerPower: player.attack + player.speed + player.level * 3,
    status: `${mode === "cup" ? "Cup" : "Ladder"} queued vs CPU ${opp.name}. Tap Resolve Match.`
  };
  appendLog("circuitLog", circuit.status);
  save();
  render();
}

function resolveCircuit() {
  if (!circuit) {
    document.getElementById("circuitStatus").textContent = "No match queued.";
    return;
  }
  const player = activeMonster();
  const rng = mulberry32(circuit.seed ^ 917);
  const wildPower = 40 + Math.floor(rng() * 80) + state.seasonRating / 25;
  const won = circuit.playerPower + rng() * 20 >= wildPower;
  const delta = won ? 14 : -10;
  state.seasonRating = clamp(state.seasonRating + delta, 600, 9999);
  if (won) {
    state.seasonWins++;
    state.careerPoints += circuit.mode === "cup" ? 50 : 12;
    state.coins += circuit.mode === "cup" ? 40 : 10;
    addTrainerXp(10);
    if (state.seasonRating >= 1200) state.equippedTitle = "Challenger";
    if (state.seasonRating >= 1500) state.equippedTitle = "Elite";
    if (circuit.mode === "cup") {
      state.cupWins++;
      state.equippedTitle = "Meadow Cup Winner";
    }
    appendLog("circuitLog", `Beat ${circuit.opponent}. ${delta > 0 ? "+" : ""}${delta} rating.`);
  } else {
    state.seasonLosses++;
    appendLog("circuitLog", `Lost to ${circuit.opponent}. ${delta} rating.`);
  }
  circuit = { status: won ? "Victory!" : "Defeat." };
  save();
  render();
}

render();
