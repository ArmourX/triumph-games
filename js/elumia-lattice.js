const TARGET_NODES=500;
const NFT_BONUS_CAP=10;
const NFT_PCT_PER_NODE=0.5;
const NFT_COL='#c084fc';
const CX=5000,CY=5000;
const GLYPH={minor:'◇',major:'◆',apex:'✦'};
const R={core:52,branch:34,gate:26,minor:14,major:18,apex:22,stat:10,notable:16,lock:16};
const QRANK={Common:1,Rare:2,Mystic:3,Epic:4,Legendary:5,Elumian:9};
const GEM_POWER={Common:1,Rare:1.6,Mystic:2.2,Epic:2.8,Legendary:3.6,Elumian:5};
const LOCK_Q={1:'Common',2:'Rare',3:'Mystic',4:'Legendary'};

const GEM_DATA = {"champion": {"paths": {"emerald": "ELUMIAN EMERALD", "rubis": "ELUMIAN RUBIS", "citrine": "ELUMIAN CITRINE"}, "branches": {"tank": [{"skill": "Collision Course", "path": "emerald", "gems": {"minor": {"name": "Common Gem · Ironclad Rush", "body": "+10% dash distance. Each enemy hit generates 3 Threat.", "quality": "Common", "gemType": "emerald", "gemLabel": "Elumian Emerald", "color": "#3d9a5c", "cond": "Common quality · Elumian Emerald", "note": "Minor gem tier (Common). Socket in gear for stat bonus."}, "major": {"name": "Mystic Gem · Rampart Line", "body": "All enemies hit are Taunted for 4s. No damage bonus.", "quality": "Mystic", "gemType": "emerald", "gemLabel": "Elumian Emerald", "color": "#3d9a5c", "cond": "Mystic quality · Elumian Emerald", "note": "Major gem tier (Mystic). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Provoking Strike", "body": "A small attack that taunts single target for 10 sec.", "quality": "Elumian", "gemType": "emerald", "gemLabel": "Elumian Emerald", "color": "#3d9a5c", "cond": "Elumian APEX · Elumian Emerald · Fortify", "note": "Requires Elumian Emerald APEX gem socketed in skill rune."}}}, {"skill": "Deep Draught", "path": "emerald", "gems": {"minor": {"name": "Rare Gem · Warding Draught", "body": "+10% Armor for the Lifesteal duration.", "quality": "Rare", "gemType": "emerald", "gemLabel": "Elumian Emerald", "color": "#3d9a5c", "cond": "Rare quality · Elumian Emerald", "note": "Minor gem tier (Rare). Socket in gear for stat bonus."}, "major": {"name": "Mystic Gem · Shield Sap", "body": "30% of Lifesteal heals also generates Threat.", "quality": "Mystic", "gemType": "emerald", "gemLabel": "Elumian Emerald", "color": "#3d9a5c", "cond": "Mystic quality · Elumian Emerald", "note": "Major gem tier (Mystic). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Iron Vigil", "body": "Boost armor 30% for 10 sec on self", "quality": "Elumian", "gemType": "emerald", "gemLabel": "Elumian Emerald", "color": "#3d9a5c", "cond": "Elumian APEX · Elumian Emerald · Fortify", "note": "Tank sustain capstone"}}}, {"skill": "Breathbreak", "path": "emerald", "gems": {"minor": {"name": "Common Gem · Iron Interrupt Stun", "body": "duration +0.5s. Generates high Threat on stunned target.", "quality": "Common", "gemType": "emerald", "gemLabel": "Elumian Emerald", "color": "#3d9a5c", "cond": "Common quality · Elumian Emerald", "note": "Minor gem tier (Common). Socket in gear for stat bonus."}, "major": {"name": "Mystic Gem · Taunt Break", "body": "Applies Taunt to stunned target for 2s after stun expires (seamless threat hold).", "quality": "Mystic", "gemType": "emerald", "gemLabel": "Elumian Emerald", "color": "#3d9a5c", "cond": "Mystic quality · Elumian Emerald", "note": "Major gem tier (Mystic). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Bulwark Pulse", "body": "Apply 10% armor on the group.", "quality": "Elumian", "gemType": "emerald", "gemLabel": "Elumian Emerald", "color": "#3d9a5c", "cond": "Elumian APEX · Elumian Emerald · Fortify", "note": "Requires Elumian Emerald APEX gem."}}}], "dps": [{"skill": "Shield Shock", "path": "rubis", "gems": {"minor": {"name": "Rare Gem · Crater Force", "body": "+12% AoE radius. Enemies at edge receive Slow 2s.", "quality": "Rare", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Rare quality · Elumian Rubis", "note": "Minor gem tier (Rare). Socket in gear for stat bonus."}, "major": {"name": "Epic Gem · Kill Momentum", "body": "On kill: next skill costs 30% less energy.", "quality": "Epic", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Epic quality · Elumian Rubis", "note": "Major gem tier (Epic). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Flurry Guard", "body": "Do DMG — on kill get DMG UP", "quality": "Elumian", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Elumian APEX · Elumian Rubis · Fury", "note": "Skill becomes both offense and reactive defense"}}}, {"skill": "Elu's Kindling", "path": "rubis", "gems": {"minor": {"name": "Common Gem · Stoked Flames", "body": "Each Basic Attack adds +1 burn tick to target (max +3 extra stacks).", "quality": "Common", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Common quality · Elumian Rubis", "note": "Minor gem tier (Common). Socket in gear for stat bonus."}, "major": {"name": "Epic Gem · Scorched Earth", "body": "On kill with burning target: leave fire zone 3m for 4s dealing burn to others who enter.", "quality": "Epic", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Epic quality · Elumian Rubis", "note": "Major gem tier (Epic). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Infernal Mantle", "body": "DMG aura 10 sec.", "quality": "Elumian", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Elumian APEX · Elumian Rubis · Fury", "note": "Requires Elumian Rubis APEX gem."}}}, {"skill": "Galeforce", "path": "rubis", "gems": {"minor": {"name": "Rare Gem · Force Wave", "body": "+15% AoE radius.", "quality": "Rare", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Rare quality · Elumian Rubis", "note": "Minor gem tier (Rare). Socket in gear for stat bonus."}, "major": {"name": "Epic Gem · Crippling Slash Combo", "body": "Galeforce knockdown into 180° Snare on landing — enemies have movement reduced 50% for 3s.", "quality": "Epic", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Epic quality · Elumian Rubis", "note": "Major gem tier (Epic). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Crippling Slash", "body": "Cleave and 180° AoE snare.", "quality": "Elumian", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Elumian APEX · Elumian Rubis · Fury", "note": "Requires Elumian Rubis APEX gem."}}}], "cc": [{"skill": "Gore", "path": "citrine", "gems": {"minor": {"name": "Common Gem · Blood Tithe", "body": "Each bleed tick heals Champion for 2% of damage dealt.", "quality": "Common", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Common quality · Elumian Citrine", "note": "Minor gem tier (Common). Socket in gear for stat bonus."}, "major": {"name": "Legendary Gem · Sanguine Edge", "body": "+12% crit damage on bleeding targets.", "quality": "Legendary", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Legendary quality · Elumian Citrine", "note": "Major gem tier (Legendary)."}, "apex": {"name": "Sanguine Frenzy", "body": "On kill with Gore bleed active: reset Collision Course cooldown and gain +20% ATK 6s.", "quality": "Elumian", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Elumian APEX · Elumian Citrine · Striker", "note": "Skill chain reward for DPS aggression"}}}, {"skill": "Flurry", "path": "citrine", "gems": {"minor": {"name": "Rare Gem · Swift Momentum", "body": "Flurry duration +3s.", "quality": "Rare", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Rare quality · Elumian Citrine", "note": "Minor gem tier (Rare). Socket in gear for stat bonus."}, "major": {"name": "Legendary Gem · Swift Barrage", "body": "Each Flurry hit reduces ability cooldowns by 0.3s (max 3s).", "quality": "Legendary", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Legendary quality · Elumian Citrine", "note": "Major gem tier (Legendary)."}, "apex": {"name": "Elu's Grace", "body": "Invincibility for 5 sec on self.", "quality": "Elumian", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Elumian APEX · Elumian Citrine · Striker", "note": "Requires Elumian Citrine APEX gem."}}}, {"skill": "Kaion Fury", "path": "citrine", "gems": {"minor": {"name": "Common Gem · Fury Channel Cooldown", "body": "-6s.", "quality": "Common", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Common quality · Elumian Citrine", "note": "Minor gem tier (Common). Socket in gear for stat bonus."}, "major": {"name": "Legendary Gem · Fury Momentum", "body": "Roar grants +15% movement speed to allies for 6s.", "quality": "Legendary", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Legendary quality · Elumian Citrine", "note": "Major gem tier (Legendary)."}, "apex": {"name": "Primal Roar", "body": "AoE fear + 20% damage amp on feared targets for 4s.", "quality": "Elumian", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Elumian APEX · Elumian Citrine · Striker", "note": "Requires Elumian Citrine APEX gem."}}}]}}, "battlemage": {"paths": {"amethyst": "ELUMIAN AMETHYST", "opale": "ELUMIAN OPALE", "hybrid": "TIDECALLER"}, "branches": {"tank": [{"skill": "Astral Impact", "path": "amethyst", "gems": {"minor": {"name": "Common Gem · Arcane Rally", "body": "All allies within 8m gain +5% damage for 8s after cast.", "quality": "Common", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Common quality · Elumian Amethyst", "note": "Minor gem tier (Common). Socket in gear for stat bonus."}, "major": {"name": "Mystic Gem · Impact Beacon", "body": "After Astral Impact lands, next Heal cast on any target in the crater is +20% effective.", "quality": "Mystic", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Mystic quality · Elumian Amethyst", "note": "Major gem tier (Mystic). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Arcane Focus", "body": "Increase 20% damage of a single target for 10 sec.", "quality": "Elumian", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Elumian APEX · Elumian Amethyst · Arcane / Hex", "note": "Requires Elumian Amethyst APEX gem."}}}, {"skill": "Tandaia's Reprieve", "path": "amethyst", "gems": {"minor": {"name": "Rare Gem · Aegis Ward Heal", "body": "also places a Magic Shield absorbing 15% of target's max HP for 4s.", "quality": "Rare", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Rare quality · Elumian Amethyst", "note": "Minor gem tier (Rare). Socket in gear for stat bonus."}, "major": {"name": "Mystic Gem · Moonphase Weave Tandaia's Reprieve", "body": "also applies a short HoT (3 ticks, 3s) after the instant heal.", "quality": "Mystic", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Mystic quality · Elumian Amethyst", "note": "Major gem tier (Mystic). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Moonphase Ward Heal", "body": "Increase all elemental resist by 10% for 100 sec on single target", "quality": "Elumian", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Elumian APEX · Elumian Amethyst · Arcane / Hex", "note": "Healer zone capstone — mirrors Moonphase Apex note"}}}, {"skill": "Unforgiving Earth", "path": "amethyst", "gems": {"minor": {"name": "Common Gem · Earthen Shackles", "body": "Root duration +1s. Rooted target takes +8% damage from all sources.", "quality": "Common", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Common quality · Elumian Amethyst", "note": "Minor gem tier (Common). Socket in gear for stat bonus."}, "major": {"name": "Mystic Gem · Freedom Field AoE", "body": "buff to all allies within 8m: +30% resist to Snare, Root, Stun, Fear for 30s.", "quality": "Mystic", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Mystic quality · Elumian Amethyst", "note": "Major gem tier (Mystic). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Freedom Field", "body": "AoE resist snare/root/stun for 30 sec.", "quality": "Elumian", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Elumian APEX · Elumian Amethyst · Arcane / Hex", "note": "Requires Elumian Amethyst APEX gem."}}}], "summoner": [{"skill": "Star Shower", "path": "opale", "gems": {"minor": {"name": "Rare Gem · Comet Shard", "body": "Star Shower summons leave a 3m slow field for 4s.", "quality": "Rare", "gemType": "opale", "gemLabel": "Elumian Opale", "color": "#6ad0e0", "cond": "Rare quality · Elumian Opale", "note": "Minor gem tier (Rare)."}, "major": {"name": "Epic Gem · Wind Conduit", "body": "Allies in shower radius gain +8% cast speed for 10s.", "quality": "Epic", "gemType": "opale", "gemLabel": "Elumian Opale", "color": "#6ad0e0", "cond": "Epic quality · Elumian Opale", "note": "Major gem tier (Epic)."}, "apex": {"name": "Zephyr Elemental", "body": "Summon a wind elemental that fights for 20 sec (single-target wind dmg).", "quality": "Elumian", "gemType": "opale", "gemLabel": "Elumian Opale", "color": "#6ad0e0", "cond": "Elumian APEX · Elumian Opale · Conjure", "note": "Requires Elumian Opale APEX gem."}}}, {"skill": "Moonphase", "path": "opale", "gems": {"minor": {"name": "Common Gem · Lunar Shard", "body": "Moonphase conjures grant +5% armor to nearby allies for 8s.", "quality": "Common", "gemType": "opale", "gemLabel": "Elumian Opale", "color": "#6ad0e0", "cond": "Common quality · Elumian Opale", "note": "Minor gem tier (Common)."}, "major": {"name": "Epic Gem · Phase Bulwark", "body": "Shard aura applies 10% armor in 10m radius for 20 sec.", "quality": "Epic", "gemType": "opale", "gemLabel": "Elumian Opale", "color": "#6ad0e0", "cond": "Epic quality · Elumian Opale", "note": "Major gem tier (Epic)."}, "apex": {"name": "Moonphase Beacon", "body": "Summon a lunar shard that pulses protective light every 4s.", "quality": "Elumian", "gemType": "opale", "gemLabel": "Elumian Opale", "color": "#6ad0e0", "cond": "Elumian APEX · Elumian Opale · Conjure", "note": "Requires Elumian Opale APEX gem."}}}, {"skill": "Dilation", "path": "opale", "gems": {"minor": {"name": "Rare Gem · Temporal Echo", "body": "Dilation cooldown reduced by 1s when a conjuration is active.", "quality": "Rare", "gemType": "opale", "gemLabel": "Elumian Opale", "color": "#6ad0e0", "cond": "Rare quality · Elumian Opale", "note": "Minor gem tier (Rare)."}, "major": {"name": "Epic Gem · Golem Bind", "body": "Conjured golem taunts targets it stuns for 3s.", "quality": "Epic", "gemType": "opale", "gemLabel": "Elumian Opale", "color": "#6ad0e0", "cond": "Epic quality · Elumian Opale", "note": "Major gem tier (Epic)."}, "apex": {"name": "Stonebound Guardian", "body": "Summon an earth elemental / mini golem that stuns for 20 sec.", "quality": "Elumian", "gemType": "opale", "gemLabel": "Elumian Opale", "color": "#6ad0e0", "cond": "Elumian APEX · Elumian Opale · Conjure", "note": "Requires Elumian Opale APEX gem."}}}], "healer": [{"skill": "Solar Sear", "path": "hybrid", "gems": {"minor": {"name": "Common Gem · Scorching Mark DoT", "body": "application also marks target for +5% fire damage received 6s.", "quality": "Common", "gemType": "hybrid", "gemLabel": "Tidecaller", "color": "#4fc6a0", "cond": "Common quality · Hybrid", "note": "Minor gem tier (Common). Socket in gear for stat bonus."}, "major": {"name": "Legendary Gem · Scorch Ward", "body": "Allies in sear radius gain +10% fire resist for 12s.", "quality": "Legendary", "gemType": "hybrid", "gemLabel": "Tidecaller", "color": "#4fc6a0", "cond": "Legendary quality · Tidecaller", "note": "Major gem tier (Legendary)."}, "apex": {"name": "Infernal Conjuration", "body": "Summon a fire entity — DoT fire damage in area, 10 sec every 2 sec.", "quality": "Elumian", "gemType": "hybrid", "gemLabel": "Tidecaller", "color": "#4fc6a0", "cond": "Elumian APEX · Tidecaller · Conjure", "note": "Requires Tidecaller APEX gem."}}}, {"skill": "Memorium's Gift", "path": "hybrid", "gems": {"minor": {"name": "Rare Gem · Quickheal", "body": "Cooldown -4s.", "quality": "Rare", "gemType": "hybrid", "gemLabel": "Tidecaller", "color": "#4fc6a0", "cond": "Rare quality · Hybrid", "note": "Minor gem tier (Rare). Socket in gear for stat bonus."}, "major": {"name": "Legendary Gem · Shard Empowerment", "body": "Gift conjuration increases all ally damage by 10% for 8s.", "quality": "Legendary", "gemType": "hybrid", "gemLabel": "Tidecaller", "color": "#4fc6a0", "cond": "Legendary quality · Tidecaller", "note": "Major gem tier (Legendary)."}, "apex": {"name": "Shard of Empowerment", "body": "Summon a shard that increases all damage by 10%.", "quality": "Elumian", "gemType": "hybrid", "gemLabel": "Tidecaller", "color": "#4fc6a0", "cond": "Elumian APEX · Tidecaller · Conjure", "note": "Requires Tidecaller APEX gem."}}}, {"skill": "Time Hop", "path": "hybrid", "gems": {"minor": {"name": "Common Gem · Phased", "body": "Landing Stun duration +0.5s.", "quality": "Common", "gemType": "hybrid", "gemLabel": "Tidecaller", "color": "#4fc6a0", "cond": "Common quality · Hybrid", "note": "Minor gem tier (Common). Socket in gear for stat bonus."}, "major": {"name": "Legendary Gem · Phase Anchor", "body": "Time Hop leaves a healing rift at origin for 6s.", "quality": "Legendary", "gemType": "hybrid", "gemLabel": "Tidecaller", "color": "#4fc6a0", "cond": "Legendary quality · Tidecaller", "note": "Major gem tier (Legendary)."}, "apex": {"name": "Phase Beacon", "body": "Hop creates a beacon allies can interact with to cleanse roots.", "quality": "Elumian", "gemType": "hybrid", "gemLabel": "Tidecaller", "color": "#4fc6a0", "cond": "Elumian APEX · Tidecaller · Conjure", "note": "Requires Tidecaller APEX gem."}}}]}}, "archer": {"paths": {"amethyst": "ELUMIAN AMETHYST", "citrine": "ELUMIAN CITRINE", "rubis": "ELUMIAN RUBIS"}, "branches": {"dps": [{"skill": "Hailstone", "path": "amethyst", "gems": {"minor": {"name": "Common Gem · Marrow Shot", "body": "Each arrow applies -3% Armor on hit (stacks, max -9%).", "quality": "Common", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Common quality · Elumian Amethyst", "note": "Minor gem tier (Common). Socket in gear for stat bonus."}, "major": {"name": "Mystic Gem · Elemental Vulnerability", "body": "Reduces target elemental resist -10% for 6s on hit.", "quality": "Mystic", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Mystic quality · Elumian Amethyst", "note": "Major gem tier (Mystic). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Shatter Mark", "body": "Mark target and reduce elemental damage resist by 10% (single target) + bonus damage", "quality": "Elumian", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Elumian APEX · Elumian Amethyst · Arcane / Hex", "note": "Debuffer capstone: setup for party"}}}, {"skill": "Squall", "path": "amethyst", "gems": {"minor": {"name": "Rare Gem · Gust Debuff", "body": "All enemies hit receive -8% ATK for 4s.", "quality": "Rare", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Rare quality · Elumian Amethyst", "note": "Minor gem tier (Rare). Socket in gear for stat bonus."}, "major": {"name": "Epic Gem · Withering Volley", "body": "Enemies hit by 3+ arrows have ATK reduced -15% for 8s.", "quality": "Epic", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Epic quality · Elumian Amethyst", "note": "Major gem tier (Epic). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Marked Storm", "body": "Mark target and reduce armor by 10% + bonus damage", "quality": "Elumian", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Elumian APEX · Elumian Amethyst · Arcane / Hex", "note": "Debuffer capstone: mass mark"}}}, {"skill": "Aeolian Scream", "path": "amethyst", "gems": {"minor": {"name": "Common Gem · Festering Arrow", "body": "Bleed duration +2s. Bleed reduces target's Armor by 5%.", "quality": "Common", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Common quality · Elumian Amethyst", "note": "Minor gem tier (Common). Socket in gear for stat bonus."}, "major": {"name": "Legendary Gem · Haemorrhage", "body": "Aeolian Scream applies 2 stacks of bleed instead of 1. Each stack ticks independently.", "quality": "Legendary", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Legendary quality · Elumian Amethyst", "note": "Major gem tier (Legendary). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Hunter's Mark", "body": "Mark target and reduce damage of single target by 20% + bonus damage.", "quality": "Elumian", "gemType": "amethyst", "gemLabel": "Elumian Amethyst", "color": "#9a6ae8", "cond": "Elumian APEX · Elumian Amethyst · Arcane / Hex", "note": "Requires Elumian Amethyst APEX gem."}}}], "support": [{"skill": "Torrent Rush", "path": "citrine", "gems": {"minor": {"name": "Rare Gem · Lightning Draw", "body": "+5% Crit Chance during Torrent Rush.", "quality": "Rare", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Rare quality · Elumian Citrine", "note": "Minor gem tier (Rare). Socket in gear for stat bonus."}, "major": {"name": "Mystic Gem · Lightning Conductor Zone", "body": "Torrent Rush creates an AoE electric zone at player position (5m). Enemies who walk into it take shock damage + Slow 20%. Zone lasts 8s. Enemies can move out.", "quality": "Mystic", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Mystic quality · Elumian Citrine", "note": "Major gem tier (Mystic). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Stormbind Arrow", "body": "Lightning-conductor — arrow stays 10 sec, AoE electric dmg.", "quality": "Elumian", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Elumian APEX · Elumian Citrine · Striker", "note": "Requires Elumian Citrine APEX gem."}}}, {"skill": "Noxious Archery", "path": "citrine", "gems": {"minor": {"name": "Common Gem · Toxic Crit", "body": "Crit hits during Noxious Archery deal +1 extra poison tick instantly.", "quality": "Common", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Common quality · Elumian Citrine", "note": "Minor gem tier (Common). Socket in gear for stat bonus."}, "major": {"name": "Epic Gem · Penetrating Dose", "body": "Narrow-arc shot (5°, long range) with double poison stack application on hit.", "quality": "Epic", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Epic quality · Elumian Citrine", "note": "Major gem tier (Epic). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Piercing Gale", "body": "Penetrating shot — narrow AoE (5°) but long range.", "quality": "Elumian", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Elumian APEX · Elumian Citrine · Striker", "note": "Requires Elumian Citrine APEX gem."}}}, {"skill": "Leecher Shot", "path": "citrine", "gems": {"minor": {"name": "Rare Gem · Surplus Draw", "body": "Excess mana gained above cap converts to +5% ATK for 4s.", "quality": "Rare", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Rare quality · Elumian Citrine", "note": "Minor gem tier (Rare). Socket in gear for stat bonus."}, "major": {"name": "Legendary Gem · Self Sacrifice Shot", "body": "Leecher Shot deals -10% of max HP to self but deals +50% damage and double mana steal.", "quality": "Legendary", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Legendary quality · Elumian Citrine", "note": "Major gem tier (Legendary). Random STR/INT/AGI + protection% + elemental damage."}, "apex": {"name": "Blood Price", "body": "Regular range shot — small dmg to self, huge dmg to target.", "quality": "Elumian", "gemType": "citrine", "gemLabel": "Elumian Citrine", "color": "#d4a82a", "cond": "Elumian APEX · Elumian Citrine · Striker", "note": "Requires Elumian Rubis APEX gem (Fury branch)."}}}], "cc": [{"skill": "Astral Falconry", "path": "rubis", "gems": {"minor": {"name": "Common Gem · Falconry Snare", "body": "Snare slows movement by 50% instead of 30%.", "quality": "Common", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Common quality · Elumian Rubis", "note": "Minor gem tier (Common). Socket in gear for stat bonus."}, "major": {"name": "Legendary Gem · Falcon's Fury", "body": "Fear targets also take +10% physical damage for the duration.", "quality": "Legendary", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Legendary quality · Elumian Rubis", "note": "Major gem tier (Legendary)."}, "apex": {"name": "Primal Screech", "body": "Call a spider that fights around you for 10 sec.", "quality": "Elumian", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Elumian APEX · Elumian Rubis · Fury", "note": "Requires Elumian Rubis APEX gem."}}}, {"skill": "Lunar Trap", "path": "rubis", "gems": {"minor": {"name": "Rare Gem · Swift Plant", "body": "Trap placement animation speed +30%.", "quality": "Rare", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Rare quality · Elumian Rubis", "note": "Minor gem tier (Rare). Socket in gear for stat bonus."}, "major": {"name": "Legendary Gem · Snare Burst", "body": "Trap trigger deals +20% damage to snared targets.", "quality": "Legendary", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Legendary quality · Elumian Rubis", "note": "Major gem tier (Legendary)."}, "apex": {"name": "Bear Trap", "body": "When Lunar Trap triggers, summon a Spirit Bear companion for 8s at trap location.", "quality": "Elumian", "gemType": "rubis", "gemLabel": "Elumian Rubis", "color": "#c93a3a", "cond": "Elumian APEX · Elumian Rubis · Fury", "note": "Requires Elumian Rubis APEX gem."}}}]}}};

const CLASS_OPTIONS=[
  {id:'champion',label:'CHAMPION',sub:'Melee frontline'},
  {id:'battlemage',label:'BATTLEMAGE',sub:'Ranged caster'},
  {id:'archer',label:'ARCHER',sub:'Ranged support'},
];

const CLASSES={
  champion:{
    name:'CHAMPION',
    palette:{p1:'#3d9a5c',p1g:'#6fd88a',p2:'#c93a3a',p2g:'#ff6a6a',p3:'#d4a82a',p3g:'#ffd54f'},
    branches:[
      {id:'tank',name:'Iron Bulwark',role:'Tank',slot:'p1',gemPath:'emerald',skills:['Collision Course','Deep Draught','Breathbreak']},
      {id:'dps',name:'Warbreaker',role:'DPS',slot:'p2',gemPath:'rubis',skills:['Shield Shock',"Elu's Kindling",'Galeforce']},
      {id:'cc',name:'Lockdown',role:'Crowd Control',slot:'p3',gemPath:'citrine',skills:['Gore','Flurry','Kaion Fury']},
    ],
  },
  battlemage:{
    name:'BATTLEMAGE',
    palette:{p1:'#5a7ae8',p1g:'#8aa4ff',p2:'#9a6ae8',p2g:'#c4a0ff',p3:'#4fc6a0',p3g:'#7fe8c4'},
    branches:[
      {id:'tank',name:'Arcane Aegis',role:'Tank',slot:'p1',gemPath:'amethyst',skills:['Astral Impact',"Tandaia's Reprieve",'Unforgiving Earth']},
      {id:'summoner',name:'Pactbinder',role:'Summoner',slot:'p2',gemPath:'opale',skills:['Star Shower','Moonphase','Dilation']},
      {id:'healer',name:'Lifeweaver',role:'Healer',slot:'p3',gemPath:'hybrid',skills:['Solar Sear',"Memorium's Gift",'Time Hop']},
    ],
  },
  archer:{
    name:'ARCHER',
    palette:{p1:'#4fc6c0',p1g:'#79f0e9',p2:'#8b5cf6',p2g:'#c4b5fd',p3:'#c93a3a',p3g:'#ff6a6a'},
    branches:[
      {id:'support',name:'Skylark',role:'Support',slot:'p1',gemPath:'citrine',skills:['Torrent Rush','Noxious Archery','Leecher Shot']},
      {id:'dps',name:'Marksman',role:'DPS',slot:'p2',gemPath:'amethyst',skills:['Hailstone','Squall','Aeolian Scream']},
      {id:'cc',name:'Trapline',role:'Crowd Control',slot:'p3',gemPath:'rubis',skills:['Astral Falconry','Lunar Trap']},
    ],
  },
};

let cur='champion',DATA,META,byId={},adj={},branchIds=[];
const STATE={};
const canvas=document.getElementById('grid');
const ctx=canvas.getContext('2d');
const tip=document.getElementById('tip');
let canvasDpr=1,loopOn=false,hoverId=null,awakenAnim=false;
const skyStars=[];
const elementEmblem={show:false,elementId:'FIRE',t0:0,dur:3400,lit:false,particles:[]};

const CLASS_PRIM={champion:'STR',archer:'AGI',battlemage:'INT'};
const CLASS_PRIM_LABEL={
  champion:{stat:'STR',name:'Strength',short:'STR'},
  archer:{stat:'AGI',name:'Agility',short:'AGI'},
  battlemage:{stat:'INT',name:'Intelligence',short:'INT'},
};
const GEM_ELEM={emerald:['EARTH'],rubis:['FIRE'],citrine:['AIR','LIGHT'],amethyst:['DARK'],opale:['WATER','LIGHT'],hybrid:['WATER','FIRE']};
const GCOL={
  STR:'#e04545',AGI:'#4fc6a0',INT:'#6a8aff',
  vit:'#6fd88a',off:'#ff8080',res:'#8aa4ff',
  DARK:'#9b7adb',LIGHT:'#f3e7a8',EARTH:'#6fd88a',FIRE:'#ff6a6a',WATER:'#6ad0e0',AIR:'#c5d0e0',
  MNA:'#7fe8c4',HL:'#ffb347',EN:'#ffd54f',
  core:'#f6d27a',lock:'#e3b04b',gate:'#b794ff'
};

const STATS={
  STR:{id:'STR',g:'STR',n:'Strength',b:'+4 Strength.',v:'+4 STR',group:'attr',col:GCOL.STR},
  AGI:{id:'AGI',g:'AGI',n:'Agility',b:'+4 Agility.',v:'+4 AGI',group:'attr',col:GCOL.AGI},
  INT:{id:'INT',g:'INT',n:'Intelligence',b:'+4 Intelligence.',v:'+4 INT',group:'attr',col:GCOL.INT},
  HP:{id:'HP',g:'HP',n:'Max Health',b:'+120 Max Health.',v:'+120 HP',group:'vit',col:GCOL.vit},
  EN:{id:'EN',g:'EN',n:'Max Energy',b:'+8 Max Energy.',v:'+8 EN',group:'vit',col:GCOL.EN},
  MNA:{id:'MNA',g:'MP',n:'Mana',b:'+10 Mana.',v:'+10 MP',group:'vit',col:GCOL.MNA},
  HL:{id:'HL',g:'HL',n:'Healing',b:'+4% Healing.',v:'+4% Heal',group:'vit',col:GCOL.HL},
  ASP:{id:'ASP',g:'AS',n:'Attack Speed',b:'+3% Attack Speed.',v:'+3% AS',group:'off',col:GCOL.off},
  CRT:{id:'CRT',g:'CR',n:'Critical Strike',b:'+3% Critical Strike.',v:'+3% Crit',group:'off',col:'#ff6b6b'},
  CRD:{id:'CRD',g:'CD',n:'Critical Damage',b:'+5% Critical Damage.',v:'+5% CDmg',group:'off',col:'#ff9f43'},
  DARK:{id:'DARK',g:'DK',n:'Dark Damage',b:'+4% Dark Damage.',v:'+4% Dark',group:'ele',col:GCOL.DARK},
  LIGHT:{id:'LIGHT',g:'LT',n:'Light Damage',b:'+4% Light Damage.',v:'+4% Light',group:'ele',col:GCOL.LIGHT},
  EARTH:{id:'EARTH',g:'EA',n:'Earth Damage',b:'+4% Earth Damage.',v:'+4% Earth',group:'ele',col:GCOL.EARTH},
  FIRE:{id:'FIRE',g:'FR',n:'Fire Damage',b:'+4% Fire Damage.',v:'+4% Fire',group:'ele',col:GCOL.FIRE},
  WATER:{id:'WATER',g:'WA',n:'Water Damage',b:'+4% Water Damage.',v:'+4% Water',group:'ele',col:GCOL.WATER},
  AIR:{id:'AIR',g:'AR',n:'Air Damage',b:'+4% Air Damage.',v:'+4% Air',group:'ele',col:GCOL.AIR},
  RDK:{id:'RDK',g:'rDK',n:'Dark Resist',b:'+4% Dark Resist.',v:'+4% Dark Res',group:'res',col:GCOL.res},
  RPO:{id:'RPO',g:'rPO',n:'Poison Resist',b:'+4% Poison Resist.',v:'+4% Psn Res',group:'res',col:GCOL.res},
  RPU:{id:'RPU',g:'rPU',n:'Push Resist',b:'+5% Push Resist.',v:'+5% Push Res',group:'res',col:GCOL.res},
  RRT:{id:'RRT',g:'rRT',n:'Root Resist',b:'+5% Root Resist.',v:'+5% Root Res',group:'res',col:GCOL.res},
  RSN:{id:'RSN',g:'rSN',n:'Snare Resist',b:'+5% Snare Resist.',v:'+5% Snare Res',group:'res',col:GCOL.res},
  RST:{id:'RST',g:'rST',n:'Stun Resist',b:'+5% Stun Resist.',v:'+5% Stun Res',group:'res',col:GCOL.res},
  RFE:{id:'RFE',g:'rFE',n:'Fear Resist',b:'+5% Fear Resist.',v:'+5% Fear Res',group:'res',col:GCOL.res},
};

const STAT_GROUPS=[
  {id:'attr',label:'Attributes',order:['STR','AGI','INT']},
  {id:'vit',label:'Vitality',order:['HP','EN','MNA','HL']},
  {id:'off',label:'Offense',order:['ASP','CRT','CRD']},
  {id:'ele',label:'Elemental damage',order:['DARK','LIGHT','EARTH','FIRE','WATER','AIR']},
  {id:'res',label:'Resists',order:['RDK','RPO','RPU','RRT','RSN','RST','RFE']},
];

const BRANCH_NOTABLE={
  champion:{tank:'Emerald Fortitude',dps:'Rubis Fury',cc:'Citrine Lockdown'},
  battlemage:{tank:'Arcane Aegis',summoner:'Pactbinder',healer:'Lifeweaver'},
  archer:{support:'Skylark',dps:'Marksman',cc:'Trapline'},
};

const NODE_KIND_INFO={
  core:{label:'Class Core',desc:'Center hub — use the class dropdown to switch Champion, Battlemage, or Archer.',color:GCOL.core},
  branch:{label:'Experience Hub',desc:'Branch entry for a role path (Tank, DPS, Support, etc.). Uses branch path color.',color:'#9a93a8'},
  notable:{label:'Keystone Notable',desc:'Large passive keystone bonus.',color:'#e3b04b'},
};

const LOCK_INFO={
  1:{label:'Lock 1',gem:'Common',desc:'Burn a Common gem or better (Rare, Mystic, Epic, Legendary) to open.'},
  2:{label:'Lock 2',gem:'Rare',desc:'Burn a Rare gem or better (Mystic, Epic, Legendary) to open.'},
  3:{label:'Lock 3',gem:'Mystic',desc:'Burn a Mystic gem or better (Epic, Legendary) to open.'},
  4:{label:'Lock 4',gem:'Legendary',desc:'Burn a Legendary gem to open. Elumian gems cannot be burned.'},
};

const NFT_POOL=[
  {id:'NPSTR',n:'STR %',g:'%S',b:'+0.5% Strength.',col:GCOL.STR,pct:NFT_PCT_PER_NODE},
  {id:'NPAGI',n:'AGI %',g:'%A',b:'+0.5% Agility.',col:GCOL.AGI,pct:NFT_PCT_PER_NODE},
  {id:'NPINT',n:'INT %',g:'%I',b:'+0.5% Intelligence.',col:GCOL.INT,pct:NFT_PCT_PER_NODE},
  {id:'NPHP',n:'HP %',g:'%H',b:'+0.5% Max Health.',col:GCOL.vit,pct:NFT_PCT_PER_NODE},
  {id:'NPEN',n:'EN %',g:'%E',b:'+0.5% Max Energy.',col:GCOL.EN,pct:NFT_PCT_PER_NODE},
  {id:'NPASP',n:'AS %',g:'%AS',b:'+0.5% Attack Speed.',col:GCOL.off,pct:NFT_PCT_PER_NODE},
  {id:'NPCRT',n:'Crit %',g:'%C',b:'+0.5% Critical Strike.',col:'#ff6b6b',pct:NFT_PCT_PER_NODE},
  {id:'NPHL',n:'Heal %',g:'%HL',b:'+0.5% Healing.',col:GCOL.HL,pct:NFT_PCT_PER_NODE},
  {id:'NPMNA',n:'Mana %',g:'%M',b:'+0.5% Mana.',col:GCOL.MNA,pct:NFT_PCT_PER_NODE},
  {id:'NPCRD',n:'CDmg %',g:'%D',b:'+0.5% Critical Damage.',col:'#ff9f43',pct:NFT_PCT_PER_NODE},
];

const NFT_ELEMENTS=['FIRE','WATER','EARTH','AIR','LIGHT','DARK'];
const ELEMENT_FX={
  FIRE:{core:'#ff4d1a',glow:'#ff9a3c',spark:'#ffe7a3',hot:'#fff3c8'},
  WATER:{core:'#1eb8ff',glow:'#6ee0ff',spark:'#e8ffff',hot:'#ffffff'},
  EARTH:{core:'#4fd45e',glow:'#a6f07a',spark:'#f0ffe4',hot:'#ffffff'},
  AIR:{core:'#c9dcff',glow:'#8eb8ff',spark:'#ffffff',hot:'#ffffff'},
  LIGHT:{core:'#ffd84a',glow:'#ffe99a',spark:'#fffdf2',hot:'#ffffff'},
  DARK:{core:'#8b4dff',glow:'#c9a0ff',spark:'#f4eaff',hot:'#ffffff'},
};

function nftElementStat(elId){
  const s=STATS[elId];
  return s||STATS.FIRE;
}

function nftHubNode(){
  if(DATA?.nft_hub_id!=null&&byId[DATA.nft_hub_id])return byId[DATA.nft_hub_id];
  return DATA?.nodes?.find(n=>n.nftHub)||null;
}

function applyNftSanctumElement(elId){
  const stat=nftElementStat(elId);
  const hub=nftHubNode();
  if(!hub)return elId;
  hub.elementId=stat.id;
  hub.col=stat.col;
  hub.name=stat.n+' Awakening';
  hub.glyph=stat.g;
  hub.body='Awaken your NFT character\'s '+stat.n+' element.\n'+stat.b+'\nSanctum keystone · retarget with the element dropdown before allocating.';
  const cl=(DATA.clusters||[]).find(c=>c.kind==='nft');
  if(cl)cl.col=stat.col;
  const labelEl=document.getElementById('nft-elem-label');
  if(labelEl)labelEl.textContent=stat.n;
  return stat.id;
}

function gridScale(){
  return{
    startRing:2,homeRing:3,skillRing:2,islandRing:2,islandN:2,
    bridgeHomeSkill:4,bridgeSkillSkill:3,bridgeIsland:3,bridgeHub:4,bridgeRegion:5
  };
}
let GRID_SCALE=gridScale();

function polar(r,a){return[CX+r*Math.cos(a),CY+r*Math.sin(a)];}
function triAngle(i){return -Math.PI/2+i*(2*Math.PI/3);}
function pick(arr,i){return arr[i%arr.length];}
function lerp(a,b,t){return a+(b-a)*t;}
function dist2(ax,ay,bx,by){const dx=ax-bx,dy=ay-by;return dx*dx+dy*dy;}
function nearest(list,x,y){
  let b=0,bd=1e18;
  list.forEach((n,i)=>{const d=dist2(n.x,n.y,x,y);if(d<bd){bd=d;b=i;}});
  return b;
}
function rot(x,y,a){const c=Math.cos(a),s=Math.sin(a);return[x*c-y*s,x*s+y*c];}
function hexKey(q,r){return q+','+r;}
function hexPixel(q,r,size){
  return[size*(Math.sqrt(3)*q+Math.sqrt(3)/2*r), size*(1.5*r)];
}
function hexRingCoords(radius){
  if(radius===0)return[[0,0]];
  const out=[];let q=radius,r=-radius;
  const dirs=[[0,1],[-1,1],[-1,0],[0,-1],[1,-1],[1,0]];
  for(let d=0;d<6;d++)for(let s=0;s<radius;s++){out.push([q,r]);q+=dirs[d][0];r+=dirs[d][1];}
  return out;
}

function buildPool(clsId,br){
  const prim=CLASS_PRIM[clsId];
  const elems=GEM_ELEM[br.gemPath]||['FIRE'];
  const role=br.role;
  const bag=[];
  const add=(k,n)=>{const s=STATS[k];if(!s)return;for(let i=0;i<n;i++)bag.push(s);};
  add(prim,14);
  add('HP',7);
  add('EN',4);
  if(clsId==='battlemage')add('MNA',8);
  else if(clsId==='archer')add('ASP',4);
  else add('MNA',2);
  add('HL',(role==='Healer'||role==='Support'||role==='Tank')?6:2);
  add('ASP',(role==='DPS'||role==='Support'||role==='Crowd Control')?5:2);
  add('CRT',role==='DPS'?6:2);
  add('CRD',role==='DPS'?5:1);
  elems.forEach(e=>add(e,6));
  ['DARK','LIGHT','EARTH','FIRE','WATER','AIR'].forEach(e=>{if(!elems.includes(e))add(e,1);});
  add('RDK',2);add('RPO',3);add('RPU',2);add('RRT',3);add('RSN',3);add('RST',3);add('RFE',3);
  if(role==='Tank'||role==='Crowd Control'){add('HP',4);add('RRT',3);add('RSN',3);add('RST',3);add('RFE',3);add('RPU',3);}
  if(role==='Healer'){add('HL',6);add('MNA',4);add('HP',3);}
  return bag;
}

function stFields(s,extra){
  return Object.assign({name:s.n,glyph:s.g,body:s.n+' · '+s.b,col:s.col,statId:s.id},extra);
}

function nftFields(s,extra){
  return Object.assign({
    name:s.n,glyph:s.g,
    body:s.n+' · '+s.b+'\nNFT Sanctum · counts toward +10% cap.',
    col:s.col||NFT_COL,statId:s.id,nft:true,pctBonus:s.pct||NFT_PCT_PER_NODE,
  },extra);
}

function nftBonusTotal(st){
  st=st||S();let t=0;
  st.allocated.forEach(id=>{const n=byId[id];if(n?.nft&&n.kind==='stat')t+=n.pctBonus||0;});
  return Math.round(t*10)/10;
}

function makeBuilder(){
  const nodes=[],edges=[],clusters=[],seen=new Set();
  let nid=0;
  function add(spec){spec.id=nid++;nodes.push(spec);return spec;}
  function link(a,b){
    if(a==null||b==null||a===b)return;
    const k=a<b?a+','+b:b+','+a;
    if(seen.has(k))return;
    seen.add(k);edges.push([a,b]);
  }
  function bridge(fromId,toId,n,meta){
    const A=nodes[fromId],B=nodes[toId];
    let prev=fromId,lockId=null;
    const lockAt=meta.lockTier?Math.ceil(n/2):-1;
    for(let i=1;i<=n;i++){
      const t=i/(n+1);
      const x=lerp(A.x,B.x,t),y=lerp(A.y,B.y,t);
      let nd;
      if(i===lockAt){
        const q=LOCK_Q[meta.lockTier];
        nd=add({kind:'lock',zone:'lock',branchId:meta.branchId,slot:meta.slot,lockTier:meta.lockTier,lockQuality:q,name:'Lock '+meta.lockTier,glyph:String(meta.lockTier),body:'Burn a '+q+' gem or better to open this bridge.\nApex gems cannot be burned.',col:meta.col,x,y});
        lockId=nd.id;
      }else{
        const s=meta.pool?pick(meta.pool,i-1):STATS.HP;
        const fields=meta.nft?nftFields:stFields;
        nd=add(fields(s,{kind:'stat',zone:meta.zone||'bridge',branchId:meta.branchId,slot:meta.slot,micro:true,x,y}));
      }
      link(prev,nd.id);prev=nd.id;
    }
    link(prev,toId);
    return lockId;
  }
  function hexCluster(cx,cy,size,maxRing,rotA,centerId,factory){
    const cells=new Map();
    if(centerId!=null)cells.set(hexKey(0,0),{q:0,r:0,id:centerId,ring:0,x:cx,y:cy});
    for(let ring=centerId==null?0:1;ring<=maxRing;ring++){
      hexRingCoords(ring).forEach(([q,r],i)=>{
        let [lx,ly]=hexPixel(q,r,size);
        [lx,ly]=rot(lx,ly,rotA);
        const spec=factory(ring,i,cx+lx,cy+ly,q,r);
        const nd=add(spec);
        cells.set(hexKey(q,r),{q,r,id:nd.id,ring,x:cx+lx,y:cy+ly});
      });
    }
    const dirs=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
    cells.forEach(c=>{
      dirs.forEach(([dq,dr])=>{
        const n=cells.get(hexKey(c.q+dq,c.r+dr));
        if(n&&n.id>c.id)link(c.id,n.id);
      });
    });
    const outer=[...cells.values()].filter(c=>c.ring===maxRing).map(c=>c.id);
    return {cells,outer};
  }
  return {add,link,bridge,hexCluster,nodes,edges,clusters};
}

function branchSkills(br){
  const skills=br.skills.slice();
  while(skills.length<3)skills.push(skills[skills.length-1]||'Mastery');
  return skills.slice(0,3);
}

function addStatIsland(B,cx,cy,br,pool,col,label,rotA){
  const sc=GRID_SCALE;
  const size=34,maxRing=sc.islandRing;
  B.clusters.push({x:cx,y:cy,r:size*(maxRing+0.85)*1.75,col,kind:'island',hex:true,rot:rotA});
  const key=B.add({kind:'notable',zone:'island',branchId:br.id,slot:br.slot,name:label,glyph:'◈',body:'Stat island · '+label+'. Hex cluster of attributes.',col,x:cx,y:cy});
  const cl=B.hexCluster(cx,cy,size,maxRing,rotA,key.id,(ring,i,x,y)=>{
    const s=pick(pool,ring*12+i);
    return stFields(s,{kind:'stat',zone:'island',branchId:br.id,slot:br.slot,micro:true,x,y});
  });
  return {key,outer:cl.outer,x:cx,y:cy};
}

function buildExperience(B,clsId,cfg,br,bi){
  const sc=GRID_SCALE;
  const spine=triAngle(bi);
  const col=cfg.palette[br.slot+'g']||'#cfd6e6';
  const pool=buildPool(clsId,br);
  const gemPathLabel=GEM_DATA[clsId]?.paths?.[br.gemPath]||br.gemPath;
  const notableName=BRANCH_NOTABLE[clsId]?.[br.id]||br.name;
  const skills=branchSkills(br);
  const nSkills=skills.length;
  const HOME_C=620, SKILL_C=1240, ISLE_C=1680;
  const spread=0.34;

  const [hx,hy]=polar(HOME_C,spine);
  const hub=B.add({
    kind:'branch',zone:'hub',branchId:br.id,name:br.name,role:br.role,slot:br.slot,
    body:br.role+' start · '+br.name+'\nPrimary: '+(STATS[CLASS_PRIM[clsId]]||{}).n+'\n'+gemPathLabel,
    x:hx,y:hy,
  });
  B.clusters.push({x:hx,y:hy,r:34*5.2,col,kind:'home',hex:true,rot:spine});
  const home=B.hexCluster(hx,hy,34,sc.homeRing,spine,hub.id,(ring,i,x,y)=>{
    const s=pick(pool,i+ring*6);
    const notable=ring===2&&i===0;
    if(notable)return {kind:'notable',zone:'travel',branchId:br.id,slot:br.slot,name:notableName,glyph:'◈',body:'Keystone · '+notableName+'.',col,x,y};
    return stFields(s,{kind:'stat',zone:'travel',branchId:br.id,slot:br.slot,micro:true,x,y});
  });

  const masteryClusters=[];
  skills.forEach((sk,si)=>{
    const wing=si-(nSkills-1)/2;
    const la=spine+wing*spread;
    const tilt=spine+wing*(spread*0.35);
    const [sx,sy]=polar(SKILL_C,la);
    B.clusters.push({x:sx,y:sy,r:32*5.1,col,kind:'skill',hex:true,rot:tilt});

    const anchor=B.add({
      kind:'notable',zone:'mastery',branchId:br.id,slot:br.slot,name:sk,
      body:'Mastery keystone · '+sk+'\nLarge passive bonus.',
      col,x:sx,y:sy,
    });

    const cl=B.hexCluster(sx,sy,32,sc.skillRing,tilt,anchor.id,(ring,i,x,y)=>{
      const s=pick(pool,si*20+ring*8+i);
      return stFields(s,{kind:'stat',zone:'mastery',branchId:br.id,slot:br.slot,micro:true,x,y});
    });

    const homeExit=home.outer[nearest(home.outer.map(id=>B.nodes[id]),sx,sy)];
    const skillEntry=cl.outer[nearest(cl.outer.map(id=>B.nodes[id]),hx,hy)];
    B.bridge(homeExit,skillEntry,sc.bridgeHomeSkill,{branchId:br.id,slot:br.slot,col,pool,lockTier:2});
    masteryClusters.push({outer:cl.outer,x:sx,y:sy,ang:la,si});
  });

  for(let i=0;i<masteryClusters.length-1;i++){
    const A=masteryClusters[i],C=masteryClusters[i+1];
    const aId=A.outer[nearest(A.outer.map(id=>B.nodes[id]),C.x,C.y)];
    const cId=C.outer[nearest(C.outer.map(id=>B.nodes[id]),A.x,A.y)];
    B.bridge(aId,cId,sc.bridgeSkillSkill,{branchId:br.id,slot:br.slot,col,pool,lockTier:1});
  }

  const islandN=sc.islandN;
  for(let k=0;k<islandN;k++){
    const wingFrom=k===0?0:masteryClusters.length-1;
    const from=masteryClusters[wingFrom]||{outer:home.outer,x:hx,y:hy,ang:spine};
    const side=k===0?-1:1;
    const a=spine+side*spread*0.42;
    const r=SKILL_C+360;
    const [ix,iy]=polar(r,a);
    const tilt=spine+side*spread*0.12;
    const isle=addStatIsland(B,ix,iy,br,pool,col,(k<2?'Outer ':'Inner ')+br.role+' Isle',tilt);
    const aId=from.outer[nearest(from.outer.map(id=>B.nodes[id]),ix,iy)];
    const bId=isle.outer[nearest(isle.outer.map(id=>B.nodes[id]),from.x,from.y)];
    B.bridge(aId,bId,sc.bridgeIsland,{branchId:br.id,slot:br.slot,col,pool,lockTier:k<2?3:1});
  }

  return {hub,skillClusters:masteryClusters,homeOuter:home.outer};
}

function expandGridToTarget(B,clsId,cfg,target){
  if(B.nodes.length>=target)return;
  const pools=cfg.branches.map(br=>buildPool(clsId,br));
  const maxLink=320*320;
  let ring=0;
  while(B.nodes.length<target){
    ring++;
    const perRing=Math.min(48,target-B.nodes.length);
    for(let i=0;i<perRing&&B.nodes.length<target;i++){
      const ang=(i/perRing)*Math.PI*2+ring*0.31;
      const rad=1750+ring*22+(i%9)*5;
      const [x,y]=polar(rad,ang);
      const bi=i%cfg.branches.length;
      const br=cfg.branches[bi];
      const s=pick(pools[bi],B.nodes.length+i);
      const nd=B.add(stFields(s,{kind:'stat',zone:'expansion',branchId:br.id,slot:br.slot,micro:true,x,y}));
      let best=null,bd=maxLink;
      for(const o of B.nodes){
        if(o.id===nd.id)continue;
        if(o.nft||o.lockType==='nft'||o.branchId==='nft')continue;
        const d=dist2(o.x,o.y,x,y);
        if(d<bd){bd=d;best=o;}
      }
      if(best)B.link(best.id,nd.id);
    }
  }
}

function buildTree(clsId){
  GRID_SCALE=gridScale();
  const cfg=CLASSES[clsId];
  const sc=GRID_SCALE;
  const B=makeBuilder();
  const prim=STATS[CLASS_PRIM[clsId]];
  const primLabel=CLASS_PRIM_LABEL[clsId];
  const core=B.add({
    kind:'core',name:cfg.name,
    body:'Class core · '+cfg.name+'\nPrimary attribute: '+prim.n+' ('+primLabel.short+')\nUse the class dropdown to switch Champion, Battlemage, or Archer.',
    x:CX,y:CY,
  });
  B.clusters.push({x:CX,y:CY,r:42*2.6,col:prim.col,kind:'core',hex:true,rot:-Math.PI/2});
  const startPool=[prim,STATS.HP,STATS.EN,STATS.MNA,STATS.ASP,STATS.CRT,STATS.HL,STATS.RPU,prim,prim];
  const start=B.hexCluster(CX,CY,48,sc.startRing,-Math.PI/2,core.id,(ring,i,x,y)=>{
    const s=pick(startPool,i+ring*6);
    return stFields(s,{kind:'stat',zone:'start',micro:true,x,y});
  });
  let southStat=null,southY=-1e18;
  B.nodes.forEach(n=>{
    if(n.zone==='start'&&n.kind==='stat'&&n.y>southY){southY=n.y;southStat=n;}
  });
  if(southStat)Object.assign(southStat,stFields(prim,{kind:'stat',zone:'start',micro:true,x:southStat.x,y:southStat.y}));

  const regions=[];
  cfg.branches.forEach((br,bi)=>{
    const res=buildExperience(B,clsId,cfg,br,bi);
    regions.push(res);
    const pool=buildPool(clsId,br);
    const near=start.outer[nearest(start.outer.map(id=>B.nodes[id]),res.hub.x,res.hub.y)];
    B.bridge(near,res.hub.id,sc.bridgeHub,{branchId:br.id,slot:br.slot,col:cfg.palette[br.slot+'g'],pool});
  });

  for(let i=0;i<regions.length;i++){
    if(i===1)continue;
    const A=regions[i],C=regions[(i+1)%regions.length];
    if(!A.skillClusters.length||!C.skillClusters.length)continue;
    const aCl=A.skillClusters[A.skillClusters.length-1];
    const cCl=C.skillClusters[0];
    const aId=aCl.outer[nearest(aCl.outer.map(id=>B.nodes[id]),cCl.x,cCl.y)];
    const cId=cCl.outer[nearest(cCl.outer.map(id=>B.nodes[id]),aCl.x,aCl.y)];
    B.bridge(aId,cId,sc.bridgeRegion,{
      branchId:A.hub.branchId,slot:A.hub.slot,col:'#cdae62',
      pool:[STATS.HP,STATS.EN,STATS.ASP,STATS.CRT,STATS.HL],
      lockTier:4,
    });
  }

  const nftSanctum=buildNftSanctum(B,findSouthPrimaryId(B,clsId),clsId);

  expandGridToTarget(B,clsId,cfg,TARGET_NODES);
  stitchNearby(B);

  return{
    meta:{name:cfg.name,palette:cfg.palette,branches:cfg.branches,nodeCount:B.nodes.length,primary:prim.n},
    data:{
      core_id:core.id,
      nft_lock_id:nftSanctum?.lockId??null,
      nft_hub_id:nftSanctum?.hubId??null,
      nodes:B.nodes,edges:B.edges,hubs:regions.map(r=>r.hub.id),clusters:B.clusters,
    },
  };
}

function findSouthPrimaryId(B,clsId){
  const primId=CLASS_PRIM[clsId]||'STR';
  let best=null,by=-1e18;
  B.nodes.forEach(n=>{
    if(n.zone!=='start'||n.kind!=='stat')return;
    if(n.statId===primId&&n.y>=by){by=n.y;best=n;}
  });
  if(!best){
    by=-1e18;
    B.nodes.forEach(n=>{
      if(n.zone!=='start'||n.kind!=='stat')return;
      if(n.y>=by){by=n.y;best=n;}
    });
  }
  return best?best.id:null;
}

function buildNftSanctum(B,entryId,clsId){
  if(entryId==null)return null;
  const entry=B.nodes[entryId];
  if(!entry)return null;
  const pool=NFT_POOL;
  const nftCol=NFT_COL;
  const hx=entry.x;
  const hy=entry.y+420;

  const hub=B.add({
    kind:'notable',zone:'nft',branchId:'nft',slot:'p1',
    name:'NFT Sanctum',glyph:'✦',
    body:'Elumia NFT character stat ball.\nOnly reachable through the NFT Gate. All nodes cap at +10% bonus.',
    col:nftCol,x:hx,y:hy,nft:true,nftHub:true,elementId:'FIRE',
  });

  B.clusters.push({x:hx,y:hy,r:32*2.2+28,col:nftCol,kind:'nft',hex:true,rot:-Math.PI/2});
  const cl=B.hexCluster(hx,hy,32,2,-Math.PI/2,hub.id,(ring,i,x,y)=>{
    const s=pick(pool,ring*10+i);
    return nftFields(s,{kind:'stat',zone:'nft',branchId:'nft',slot:'p1',micro:true,x,y});
  });

  let northId=cl.outer[0];
  cl.outer.forEach(id=>{if(B.nodes[id].y<B.nodes[northId].y)northId=id;});
  const north=B.nodes[northId];

  const nftLock=B.add({
    kind:'lock',lockType:'nft',zone:'nft-gate',branchId:'nft',slot:'p1',
    name:'NFT Gate',glyph:'◆',
    body:'Single entrance to the NFT Sanctum.\nRequires an Elumia NFT character — enable ownership in the sidebar, then click to unlock.',
    col:'#f6d27a',
    x:lerp(entry.x,north.x,0.42),
    y:lerp(entry.y,north.y,0.42),
  });

  const approachPool=[STATS[CLASS_PRIM[clsId]||'STR'],STATS.HP,STATS.EN,STATS.ASP,STATS.CRT];
  B.bridge(entryId,nftLock.id,3,{branchId:'nft',slot:'p1',col:nftCol,pool:approachPool,zone:'nft-approach'});
  B.bridge(nftLock.id,northId,2,{branchId:'nft',slot:'p1',col:nftCol,pool,zone:'nft',nft:true});

  const weld=56*56;
  const interior=B.nodes.filter(n=>n.zone==='nft'&&n.kind!=='lock');
  for(let i=0;i<interior.length;i++){
    for(let j=i+1;j<interior.length;j++){
      const d=dist2(interior[i].x,interior[i].y,interior[j].x,interior[j].y);
      if(d>0&&d<=weld)B.link(interior[i].id,interior[j].id);
    }
  }

  return{lockId:nftLock.id,hubId:hub.id};
}

function stitchNearby(B){
  const nodes=B.nodes,maxD=58,maxD2=maxD*maxD;
  const adj={};
  nodes.forEach(n=>adj[n.id]=[]);
  B.edges.forEach(([a,b])=>{
    if(nodes[a].kind==='lock'||nodes[b].kind==='lock')return;
    adj[a].push(b);adj[b].push(a);
  });
  const comp=new Array(nodes.length).fill(-1);
  let cid=0;
  for(let i=0;i<nodes.length;i++){
    if(nodes[i].kind==='lock'||comp[i]!==-1)continue;
    const q=[i];comp[i]=cid;
    while(q.length){
      const c=q.pop();
      (adj[c]||[]).forEach(nb=>{
        if(comp[nb]===-1&&nodes[nb].kind!=='lock'){comp[nb]=cid;q.push(nb);}
      });
    }
    cid++;
  }
  for(let i=0;i<nodes.length;i++){
    const A=nodes[i];
    if(A.kind==='lock')continue;
    for(let j=i+1;j<nodes.length;j++){
      const C=nodes[j];
      if(C.kind==='lock')continue;
      if(comp[A.id]!==comp[C.id]||comp[A.id]<0)continue;
      const d=dist2(A.x,A.y,C.x,C.y);
      if(d>0&&d<=maxD2)B.link(A.id,C.id);
    }
  }
}

function countNodes(nodes){
  const kinds={},stats={},locks={},nft={stats:0,bonus:NFT_PCT_PER_NODE};
  nodes.forEach(n=>{
    if(n.kind==='lock'){
      if(n.lockType==='nft')locks.nft=(locks.nft||0)+1;
      else{const t=n.lockTier||0;locks[t]=(locks[t]||0)+1;}
    }else if(n.kind==='stat'&&n.nft){
      nft.stats=(nft.stats||0)+1;
    }else if(n.kind==='stat'&&n.statId){
      stats[n.statId]=(stats[n.statId]||0)+1;
    }else if(n.kind==='notable'&&n.nft){
      kinds.nftCore=(kinds.nftCore||0)+1;
    }else if(n.kind==='notable'){
      kinds.notable=(kinds.notable||0)+1;
    }else if(n.kind==='branch'||n.kind==='core'){
      kinds[n.kind]=(kinds[n.kind]||0)+1;
    }
  });
  return{kinds,stats,locks,nft,total:nodes.length};
}

function catalogRow(label,count,desc,color){
  return(
    '<div class="cat-row">'+
      '<span class="cat-swatch" style="background:'+color+'" title="'+color+'"></span>'+
      '<div class="cat-body">'+
        '<div class="cat-name">'+label+' <span class="cat-count-inline">×'+count+'</span> <span style="color:#7a7388;font-size:9px">'+color+'</span></div>'+
        '<div class="cat-desc">'+desc+'</div>'+
      '</div>'+
    '</div>'
  );
}

function catalogSection(title){return'<div class="cat-section">'+title+'</div>';}

function renderStatCatalogRows(stats){
  const rows=[];
  STAT_GROUPS.forEach(grp=>{
    const items=grp.order.filter(sid=>(stats[sid]||0)>0);
    if(!items.length)return;
    rows.push(catalogSection(grp.label));
    items.forEach(sid=>{
      const s=STATS[sid];
      if(!s)return;
      rows.push(catalogRow(s.n+' · '+sid,stats[sid],'Walk to allocate. '+s.b,s.col));
    });
  });
  return rows;
}

function renderNodeCatalog(nodes){
  const el=document.getElementById('node-catalog');
  const totalEl=document.getElementById('node-catalog-total');
  if(!el)return;
  const {kinds,stats,locks,nft,total}=countNodes(nodes);
  const statTotal=Object.values(stats).reduce((a,b)=>a+b,0);
  const nftStatTotal=nft?.stats||0;
  if(totalEl)totalEl.textContent=total+' nodes · '+statTotal+' stat · '+nftStatTotal+' NFT';
  const rows=[];
  rows.push(catalogSection('Structure'));
  ['core','branch','notable'].forEach(k=>{
    const c=kinds[k]||0;
    if(!c)return;
    const info=NODE_KIND_INFO[k];
    rows.push(catalogRow(info.label,c,info.desc,info.color));
  });
  if(kinds.nftCore){
    rows.push(catalogRow('NFT Sanctum · element keystone',kinds.nftCore,'Awakens your NFT character element · +10% cap total.',NFT_COL));
  }
  const lockRows=[1,2,3,4].filter(t=>(locks[t]||0)>0);
  if(lockRows.length||locks.nft){
    rows.push(catalogSection('Locks'));
    lockRows.forEach(tier=>{
      const info=LOCK_INFO[tier];
      rows.push(catalogRow(info.label+' · '+info.gem+'+ gem',locks[tier],info.desc,GCOL.lock));
    });
    if(locks.nft){
      rows.push(catalogRow('NFT Gate · ownership',locks.nft,'Requires an Elumia NFT character. No gem burn.',NFT_COL));
    }
  }
  if(nftStatTotal){
    rows.push(catalogSection('NFT stats ('+nftStatTotal+' · +0.5% each · max +10%)'));
    NFT_POOL.forEach(s=>{
      const c=nodes.filter(n=>n.nft&&n.statId===s.id).length;
      if(c)rows.push(catalogRow(s.n+' · '+s.id,c,'NFT bonus node. '+s.b+' Cap applies across all NFT nodes.',s.col));
    });
  }
  if(statTotal){
    rows.push(catalogSection('Stat nodes ('+statTotal+')'));
    rows.push.apply(rows,renderStatCatalogRows(stats));
  }
  el.innerHTML=rows.join('')||'<div class="sub">No nodes</div>';
}

function initState(cls,coreId){
  if(!STATE[cls])STATE[cls]={allocated:new Set([coreId]),socketed:new Set(),gemUsed:{},unlocked:new Set(),activeBranchId:null,apexIds:new Set(),nftOwned:false,nftElement:'FIRE',inventory:[]};
  if(!STATE[cls].nftElement)STATE[cls].nftElement='FIRE';
}

function S(){return STATE[cur];}

function isGem(n){return n.kind==='minor'||n.kind==='major'||n.kind==='apex';}
function isPassive(n){return n.kind==='stat'||n.kind==='notable';}
function equippedRunes(){return DATA.nodes.filter(n=>n.kind==='gate'&&S().allocated.has(n.id));}
function apexCount(){return [...S().socketed].filter(id=>byId[id]?.kind==='apex').length;}
function runeForGem(n){return adj[n.id].map(id=>byId[id]).find(x=>x&&x.kind==='gate');}

function buildInventory(cls){
  const inv=[],seen=new Set();
  const types=new Map();
  const branches=GEM_DATA[cls]?.branches||{};
  Object.values(branches).forEach(rows=>{
    rows.forEach(row=>{
      const t=row.path||row.gems?.minor?.gemType;
      const label=row.gems?.minor?.gemLabel||row.gems?.apex?.gemLabel||t;
      const color=row.gems?.minor?.color||row.gems?.apex?.color||'#aaa';
      if(t)types.set(t,{label,color});
      Object.values(row.gems||{}).forEach(g=>{
        if(!g||!g.quality)return;
        const key=`named:${g.gemType}:${g.quality}:${g.name}`;
        if(seen.has(key))return;
        seen.add(key);
        inv.push({id:'n'+inv.length,gemType:g.gemType,quality:g.quality,name:g.name,label:g.gemLabel||g.gemType,color:g.color,count:1,named:true});
      });
    });
  });
  const stacks={Common:8,Rare:6,Mystic:4,Epic:3,Legendary:2};
  types.forEach((meta,t)=>{
    Object.entries(stacks).forEach(([q,c])=>{
      inv.push({id:`s:${t}:${q}`,gemType:t,quality:q,name:`${q} ${meta.label}`,label:meta.label,color:meta.color,count:c,named:false});
    });
  });
  return inv;
}

function burnCandidates(minQuality){
  const need=QRANK[minQuality]||1;
  return S().inventory.filter(g=>g.count>0&&g.quality!=='Elumian'&&(QRANK[g.quality]||0)>=need);
}
function matchingGems(n){
  return S().inventory.filter(g=>g.count>0&&g.gemType===n.gemType&&g.quality===n.gemQuality);
}

function spendGem(gem){if(!gem||gem.count<=0)return false;gem.count--;return true;}
function refundGem(gem){if(gem)gem.count++;}

function unsocket(n){
  const st=S();
  const g=st.gemUsed[n.id];
  if(g)refundGem(g);
  delete st.gemUsed[n.id];
  st.socketed.delete(n.id);
  st.apexIds.delete(n.id);
}

function socketGem(n,gem){
  const st=S();
  if(n.kind==='apex'){
    if(apexCount()>=MAX_APEX){toast('Max 4 Apex gems');return;}
    const rune=runeForGem(n);
    if(!rune||!st.allocated.has(rune.id)){toast('Equip this skill rune first');return;}
    st.apexIds.add(n.id);
  }
  if(!spendGem(gem)){toast('No gem left');return;}
  gem.used=true;st.gemUsed[n.id]=gem;st.socketed.add(n.id);
  toast(`Socketed ${gem.quality} · stats ×${GEM_POWER[gem.quality]||1}`);
  render();
}

function handleGemClick(n,e){
  const st=S();
  if(st.socketed.has(n.id)){unsocket(n);toast('Gem unsocketed');render();return;}
  if(!adj[n.id].some(id=>st.allocated.has(id))){toast('Walk to this socket first');return;}
  if(n.kind==='apex'){
    const rune=runeForGem(n);
    if(!rune||!st.allocated.has(rune.id)){toast('Equip the matching skill rune first');return;}
    if(apexCount()>=MAX_APEX){toast('Max 4 Apex — must match equipped runes');return;}
  }
  const matches=matchingGems(n);
  if(!matches.length){toast(`Need ${n.gemQuality} · ${n.gemLabel}`);return;}
  if(matches.length===1){socketGem(n,matches[0]);return;}
  openPicker(`Socket · ${n.gemQuality} ${n.gemLabel}`,matches.map(g=>({id:String(g.id),label:`${g.name}  ×${g.count}`})),null,id=>{
    const g=matches.find(x=>String(x.id)===id);if(g)socketGem(n,g);
  },e.clientX,e.clientY);
}

function handleLockClick(n,e){
  const st=S();
  if(st.allocated.has(n.id)){
    if(canDeallocate(n.id)){
      const g=st.gemUsed[n.id];if(g)refundGem(g);delete st.gemUsed[n.id];
      st.allocated.delete(n.id);st.unlocked.delete(n.id);
      toast('Lock resealed · gem returned');render();
    }else toast('Would orphan other nodes');
    return;
  }
  if(!isReachable(n.id)){toast('Reach this lock first');return;}
  const cands=burnCandidates(n.lockQuality);
  if(!cands.length){toast(`Burn a ${n.lockQuality}+ gem to open Lock ${n.lockTier}`);return;}
  const pickGem=g=>{
    if(!spendGem(g))return;
    st.gemUsed[n.id]=g;st.allocated.add(n.id);st.unlocked.add(n.id);
    toast(`Burned ${g.quality} · Lock ${n.lockTier} open`);render();
  };
  if(cands.length===1){pickGem(cands[0]);return;}
  openPicker(`Burn gem · Lock ${n.lockTier} (${n.lockQuality}+)`,cands.map(g=>({id:String(g.id),label:`${g.name}  ×${g.count}`})),null,id=>{
    const g=cands.find(x=>String(x.id)===id);if(g)pickGem(g);
  },e.clientX,e.clientY);
}

function handleNftLockClick(n){
  const st=S();
  if(st.allocated.has(n.id)){
    if(canDeallocate(n.id)){
      st.allocated.delete(n.id);
      toast('NFT Gate sealed');render();
    }else toast('Would orphan NFT Sanctum nodes');
    return;
  }
  if(!isReachable(n.id)){toast('Reach the NFT Gate first');return;}
  if(!st.nftOwned){toast('Requires an Elumia NFT character');return;}
  st.allocated.add(n.id);
  toast('NFT Sanctum unlocked');render();
}

function updatePouch(){
  const el=document.getElementById('pouch');if(!el)return;
  const rows=S().inventory.filter(g=>g.count>0||g.named);
  el.innerHTML=rows.map(g=>`<div class="g${g.count<=0?' used':''}"><span>${g.name}</span><span class="tag">${g.quality} · ×${g.count}</span></div>`).join('')||'<div class="sub">Empty pouch</div>';
}

function updateSide(){
  const sel=document.getElementById('class-select');
  if(sel&&sel.value!==cur)sel.value=cur;
  document.getElementById('sel-lvl').textContent=String(lvlUsed());
  const primEl=document.getElementById('sel-primary');
  if(primEl){
    const info=CLASS_PRIM_LABEL[cur]||CLASS_PRIM_LABEL.champion;
    primEl.textContent=info.name+' · '+info.short;
  }
  const locksEl=document.getElementById('sel-locks');
  if(locksEl){
    let n=0;
    S().allocated.forEach(id=>{if(byId[id]?.kind==='lock')n++;});
    locksEl.textContent=String(n);
  }
  const nftEl=document.getElementById('nft-bonus');
  if(nftEl)nftEl.textContent=String(nftBonusTotal());
  const nftCb=document.getElementById('nft-owned');
  if(nftCb)nftCb.checked=!!S().nftOwned;
  const nftElSel=document.getElementById('nft-element');
  if(nftElSel)nftElSel.value=S().nftElement||'FIRE';
  const hub=nftHubNode();
  const labelEl=document.getElementById('nft-elem-label');
  if(labelEl){
    const stat=nftElementStat(hub?.elementId||S().nftElement||'FIRE');
    labelEl.textContent=stat.n;
    if(hub&&S().allocated.has(hub.id))labelEl.textContent=stat.n+' (awakened)';
  }
  updatePouch();
}

function isReachable(id){
  const st=S(),n=byId[id];
  if(!n||st.allocated.has(id))return false;
  const nbs=adj[id]||[];
  for(let i=0;i<nbs.length;i++){
    const x=nbs[i],nb=byId[x];
    if(nb&&st.allocated.has(x))return true;
  }
  const maxD2=56*56;
  for(const x of st.allocated){
    const o=byId[x];
    if(!o||o.kind==='lock')continue;
    if(dist2(n.x,n.y,o.x,o.y)<=maxD2)return true;
  }
  return false;
}

function canDeallocate(id){
  if(id===DATA.core_id)return false;
  const st=S();
  const keep=new Set([...st.allocated].filter(x=>x!==id));
  const seen=new Set([DATA.core_id]),stk=[DATA.core_id];
  while(stk.length){const c=stk.pop();adj[c].forEach(nb=>{if(keep.has(nb)&&!seen.has(nb)){seen.add(nb);stk.push(nb);}});}
  return[...keep].every(x=>seen.has(x));
}

function lvlUsed(){let c=0;S().allocated.forEach(id=>{const n=byId[id];if(!n||id===DATA.core_id||n.kind==='lock')return;c++;});return c;}

function openPicker(title,options,current,onPick,x,y){
  const p=document.getElementById('picker');
  document.getElementById('picker-title').textContent=title;
  const wrap=document.getElementById('picker-options');
  wrap.innerHTML='';
  options.forEach(opt=>{
    const b=document.createElement('button');
    b.textContent=opt.label;
    if(opt.id===current)b.classList.add('active');
    b.onclick=ev=>{ev.stopPropagation();p.classList.remove('show');onPick(opt.id);};
    wrap.appendChild(b);
  });
  if(x!=null){p.style.left=Math.min(x,innerWidth-250)+'px';p.style.top=Math.min(y,innerHeight-280)+'px';}
  p.classList.add('show');
}

function selectClass(clsId){
  if(clsId===cur)return;
  loadClass(clsId);
  toast(`Class: ${CLASSES[clsId].name}`);
}

function selectBranch(branchId){
  S().activeBranchId=branchId;
  updateSide();render();
}

function handleNodeClick(n,e){
  if(n.kind==='core'){toast('Use the class dropdown in the top bar to switch class.');return;}
  if(n.kind==='lock'){
    if(n.lockType==='nft'){handleNftLockClick(n);return;}
    handleLockClick(n,e);return;
  }
  toggle(n.id);
}

function toggle(id){
  const st=S(),n=byId[id];
  if(!n||n.kind==='core'||n.kind==='lock')return;
  if(st.allocated.has(id)){
    if(canDeallocate(id))st.allocated.delete(id);
    else toast('Would orphan other nodes');
  }else if(isReachable(id)){
    if(n.nft&&!st.nftOwned){toast('Requires an Elumia NFT character');return;}
    if(n.nft&&n.kind==='stat'){
      const next=nftBonusTotal(st)+(n.pctBonus||0);
      if(next>NFT_BONUS_CAP+0.001){toast('NFT bonus cap (+10%) reached');return;}
    }
    st.allocated.add(id);
    if(n.kind==='branch')st.activeBranchId=n.branchId;
    igniteNode(n);
    if(n.nftHub){
      const stat=nftElementStat(n.elementId||st.nftElement);
      awakenAnim=true;
      toast(stat.n+' element awakened');
    }
  }else{
    toast('Open the previous node first');
  }
  render();
}

function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),1600);}

function updateCoreLabel(){}

function rgbaFromHex(hex,a){
  if(!hex||hex[0]!=='#')return`rgba(140,140,160,${a})`;
  const h=hex.replace('#','');
  const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  return`rgba(${r},${g},${b},${a})`;
}

function branchStroke(n){
  return(META?.palette||CLASSES[cur].palette)[n.slot]||'#888';
}

function nodeColors(n){
  const st=S();
  const on=st.allocated.has(n.id);
  const reach=isReachable(n.id);
  if(n.kind==='core')return{fill:'#fff6c8',stroke:GCOL.core,glow:GCOL.core};
  if(n.kind==='branch'){
    const c=branchStroke(n);
    return{fill:on?'#ffffff':rgbaFromHex(c,.85),stroke:c,glow:c};
  }
  if(n.kind==='lock'){
    const c=n.lockType==='nft'?NFT_COL:GCOL.lock;
    const open=st.allocated.has(n.id);
    return{fill:open?'#fff':rgbaFromHex(c,.5),stroke:c,glow:c};
  }
  const c=n.col||'#8aa4ff';
  if(on)return{fill:'#ffffff',stroke:c,glow:c};
  if(reach)return{fill:rgbaFromHex(c,.7),stroke:c,glow:c};
  return{fill:rgbaFromHex(c,.55),stroke:c,glow:c};
}

function igniteNode(n){
  if(!n)return;
  n.igniteAt=performance.now();
}

function applyPalette(p){
  const rs=document.documentElement.style;
  ['p1','p1g','p2','p2g','p3','p3g'].forEach(k=>rs.setProperty('--'+k,p[k]));
}

function inView(x,y,pad){
  return x>=vb.x-pad&&x<=vb.x+vb.w+pad&&y>=vb.y-pad&&y<=vb.y+vb.h+pad;
}

function drawStarfield(){
  if(skyStars.length)return;
  for(let i=0;i<280;i++){
    skyStars.push({
      x:Math.random()*10000,
      y:Math.random()*10000,
      r:Math.random()<0.12?2.2:0.6+Math.random()*1.5,
      o:0.12+Math.random()*0.55,
      tw:i%7===0,
      ph:Math.random()*Math.PI*2,
    });
  }
}
function elementAwakened(){
  const hub=nftHubNode();
  return !!(hub&&S().allocated.has(hub.id));
}

function nftSanctumAnchor(){
  if(!DATA)return null;
  let maxY=-1e18,sumX=0,cnt=0;
  DATA.nodes.forEach(n=>{
    const z=n.zone||'';
    if(n.branchId!=='nft'&&!z.startsWith('nft'))return;
    sumX+=n.x;cnt++;
    if(n.y>maxY)maxY=n.y;
  });
  const hub=nftHubNode();
  if(!cnt&&hub)return{x:hub.x,y:hub.y+95};
  if(!cnt)return null;
  const pxScale=vb.w/(canvas.clientWidth||1);
  return{x:sumX/cnt,y:maxY+82*pxScale};
}

function syncElementEmblem(animate){
  const hub=nftHubNode();
  const on=!!(hub&&S().allocated.has(hub.id));
  if(!on){
    elementEmblem.show=false;
    elementEmblem.lit=false;
    elementEmblem.particles=[];
    return;
  }
  const elId=hub.elementId||S()?.nftElement||'FIRE';
  const changed=elementEmblem.elementId!==elId;
  elementEmblem.show=true;
  elementEmblem.elementId=elId;
  if(animate||changed){
    elementEmblem.lit=false;
    elementEmblem.t0=performance.now();
    elementEmblem.particles=[];
    burstElementParticles(elId,52);
  }else if(!elementEmblem.lit&&!elementEmblem.t0){
    elementEmblem.lit=true;
    elementEmblem.t0=performance.now()-elementEmblem.dur;
  }else if(!elementEmblem.lit&&performance.now()-elementEmblem.t0>=elementEmblem.dur){
    elementEmblem.lit=true;
  }
}

function burstElementParticles(elId,n){
  const fx=ELEMENT_FX[elId]||ELEMENT_FX.FIRE;
  const px=vb.w/(canvas.clientWidth||1);
  for(let i=0;i<n;i++){
    const ang=Math.random()*Math.PI*2;
    const spd=(1.2+Math.random()*3.8)*px;
    elementEmblem.particles.push({
      ox:Math.cos(ang)*(4+Math.random()*18)*px,
      oy:Math.sin(ang)*(4+Math.random()*10)*px,
      vx:Math.cos(ang)*spd*(0.4+Math.random()*0.8),
      vy:Math.sin(ang)*spd*(0.4+Math.random()*0.8),
      life:0.55+Math.random()*0.45,
      decay:0.004+Math.random()*0.009,
      r:(1.5+Math.random()*4.5)*px,
      col:Math.random()<0.55?fx.core:fx.spark,
      el:elId,
    });
  }
}

function spawnAmbientParticle(elId){
  const fx=ELEMENT_FX[elId]||ELEMENT_FX.FIRE;
  const px=vb.w/(canvas.clientWidth||1);
  const p={
    ox:(Math.random()-0.5)*36*px,
    oy:(Math.random()-0.5)*14*px,
    life:0.35+Math.random()*0.55,
    decay:0.006+Math.random()*0.01,
    r:(1+Math.random()*3)*px,
    col:Math.random()<0.5?fx.core:fx.spark,
    el:elId,
  };
  if(elId==='FIRE'){p.vx=(Math.random()-0.5)*0.6*px;p.vy=(-1.4-Math.random()*2.2)*px;}
  else if(elId==='WATER'){p.vx=(Math.random()-0.5)*0.8*px;p.vy=(0.6+Math.random()*1.4)*px;}
  else if(elId==='EARTH'){p.vx=(Math.random()-0.5)*1.2*px;p.vy=(0.3+Math.random()*1)*px;p.r*=1.2;}
  else if(elId==='AIR'){p.vx=(1.6+Math.random()*2.2)*px;p.vy=(Math.random()-0.5)*0.8*px;}
  else if(elId==='LIGHT'){const a=Math.random()*Math.PI*2;p.vx=Math.cos(a)*1.8*px;p.vy=(Math.sin(a)*1.8-0.5)*px;}
  else{p.vx=(Math.random()-0.5)*1.4*px;p.vy=(-0.6-Math.random()*1.8)*px;}
  elementEmblem.particles.push(p);
}

function tickElementParticles(){
  const elId=elementEmblem.elementId;
  const px=vb.w/(canvas.clientWidth||1);
  if(elementEmblem.lit&&elementEmblem.particles.length<110&&Math.random()<0.42){
    spawnAmbientParticle(elId);
  }
  elementEmblem.particles=elementEmblem.particles.filter(p=>{
    p.ox+=p.vx;
    p.oy+=p.vy;
    if(p.el==='FIRE'){p.vy-=0.04*px;p.vx+=(Math.random()-0.5)*0.06*px;}
    else if(p.el==='WATER'){p.vy+=0.025*px;p.vx+=(Math.random()-0.5)*0.04*px;}
    else if(p.el==='EARTH'){p.vy+=0.05*px;p.vx*=0.98;}
    else if(p.el==='AIR'){p.vx+=0.02*px;p.vy+=(Math.random()-0.5)*0.05*px;}
    else if(p.el==='LIGHT'){p.vx*=0.985;p.vy*=0.985;}
    else{p.vx+=(Math.random()-0.5)*0.08*px;p.vy-=0.02*px;}
    p.life-=p.decay;
    return p.life>0;
  });
}

function drawElementParticles(ax,ay,alpha){
  elementEmblem.particles.forEach(p=>{
    ctx.save();
    ctx.globalAlpha=alpha*p.life;
    ctx.fillStyle=p.col;
    ctx.shadowColor=p.col;
    ctx.shadowBlur=8*p.life;
    ctx.beginPath();
    ctx.arc(ax+p.ox,ay+p.oy,p.r,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  });
}

function drawIconFlame(a,pulse){
  const g=ctx.createRadialGradient(0,-4,2,0,0,32);
  g.addColorStop(0,'#fff8dc');
  g.addColorStop(0.35,'#ff9a3c');
  g.addColorStop(0.75,'#ff4d1a');
  g.addColorStop(1,'rgba(255,40,0,0)');
  ctx.fillStyle=g;
  ctx.beginPath();
  ctx.moveTo(0,-30);
  ctx.bezierCurveTo(10,-18,16,-4,12,8);
  ctx.bezierCurveTo(9,18,4,24,0,28);
  ctx.bezierCurveTo(-4,24,-9,18,-12,8);
  ctx.bezierCurveTo(-16,-4,-10,-18,0,-30);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle='rgba(255,240,180,'+(0.55+0.35*pulse)+')';
  ctx.beginPath();
  ctx.moveTo(0,-18);
  ctx.bezierCurveTo(5,-10,6,0,0,12);
  ctx.bezierCurveTo(-6,0,-5,-10,0,-18);
  ctx.fill();
}

function drawIconWater(a){
  const g=ctx.createLinearGradient(0,-28,0,24);
  g.addColorStop(0,'#e8ffff');
  g.addColorStop(0.45,'#6ee0ff');
  g.addColorStop(1,'#1eb8ff');
  ctx.fillStyle=g;
  ctx.beginPath();
  ctx.moveTo(0,-28);
  ctx.bezierCurveTo(18,-8,18,12,0,26);
  ctx.bezierCurveTo(-18,12,-18,-8,0,-28);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle='rgba(255,255,255,'+(0.25+0.2*a)+')';
  ctx.beginPath();
  ctx.ellipse(-5,-8,4,7,-0.4,0,Math.PI*2);
  ctx.fill();
}

function drawIconSkull(a,pulse){
  ctx.fillStyle='#d8c8f0';
  ctx.strokeStyle='#6a3a9a';
  ctx.lineWidth=1.8;
  ctx.beginPath();
  ctx.ellipse(0,-2,20,22,0,0,Math.PI*2);
  ctx.fill();ctx.stroke();
  ctx.fillStyle='#1a0a28';
  ctx.beginPath();
  ctx.ellipse(-8,-4,5,6,0,0,Math.PI*2);
  ctx.ellipse(8,-4,5,6,0,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle='rgba(120,60,160,'+(0.5+0.4*pulse)+')';
  ctx.beginPath();
  ctx.moveTo(0,2);ctx.lineTo(-4,10);ctx.lineTo(4,10);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#9b7adb';
  ctx.lineWidth=2;
  for(let i=-1;i<=1;i++){
    ctx.beginPath();
    ctx.moveTo(i*7,14);ctx.lineTo(i*7,20);
    ctx.stroke();
  }
}

function drawIconNorthStar(a,pulse){
  const hot='#fff700';
  const warm='#ffe566';
  ctx.shadowColor=hot;
  ctx.shadowBlur=18+10*pulse;
  ctx.fillStyle=hot;
  ctx.strokeStyle=warm;
  ctx.lineWidth=2;
  ctx.beginPath();
  for(let i=0;i<8;i++){
    const ang=-Math.PI/2+i*Math.PI/4;
    const len=i%2?10:26;
    const x=Math.cos(ang)*len,y=Math.sin(ang)*len;
    if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
  }
  ctx.closePath();
  ctx.fill();ctx.stroke();
  ctx.fillStyle='#ffffff';
  ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;
}

function drawIconWind(a){
  ctx.strokeStyle='rgba(255,255,255,'+(0.85*a)+')';
  ctx.lineWidth=3;
  ctx.lineCap='round';
  ctx.shadowColor='#ffffff';
  ctx.shadowBlur=12;
  for(let i=0;i<3;i++){
    const y=-12+i*12;
    ctx.beginPath();
    ctx.moveTo(-22,y);
    ctx.bezierCurveTo(-6,y-8,8,y+6,24,y-2);
    ctx.stroke();
  }
  ctx.shadowBlur=0;
}

function drawIconRock(a,pulse){
  const g=ctx.createLinearGradient(-18,-16,18,18);
  g.addColorStop(0,'#a6f07a');
  g.addColorStop(0.5,'#6a9a52');
  g.addColorStop(1,'#4a6038');
  ctx.fillStyle=g;
  ctx.strokeStyle='#3d5030';
  ctx.lineWidth=1.6;
  ctx.beginPath();
  ctx.moveTo(-4,-22);
  ctx.lineTo(14,-10);
  ctx.lineTo(18,6);
  ctx.lineTo(6,20);
  ctx.lineTo(-14,16);
  ctx.lineTo(-20,-2);
  ctx.closePath();
  ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(180,220,140,'+(0.35+0.25*pulse)+')';
  ctx.beginPath();
  ctx.moveTo(-2,-14);ctx.lineTo(8,-6);ctx.lineTo(2,4);ctx.lineTo(-8,-2);ctx.closePath();
  ctx.fill();
}

function drawElementIcon(elId,alpha,pulse){
  ctx.save();
  ctx.globalAlpha=alpha;
  if(elId==='FIRE')drawIconFlame(alpha,pulse);
  else if(elId==='WATER')drawIconWater(alpha);
  else if(elId==='DARK')drawIconSkull(alpha,pulse);
  else if(elId==='LIGHT')drawIconNorthStar(alpha,pulse);
  else if(elId==='AIR')drawIconWind(alpha);
  else drawIconRock(alpha,pulse);
  ctx.restore();
}

function drawElementEmblem(now){
  if(!elementEmblem.show)return;
  const hub=nftHubNode();
  if(!hub||!S().allocated.has(hub.id))return;
  const anchor=nftSanctumAnchor();
  if(!anchor||!inView(anchor.x,anchor.y,120))return;

  let p=1;
  if(!elementEmblem.lit){
    p=easeOut(Math.min(1,(now-elementEmblem.t0)/elementEmblem.dur));
    if(p>=1)elementEmblem.lit=true;
  }
  const fx=ELEMENT_FX[elementEmblem.elementId]||ELEMENT_FX.FIRE;
  const pulse=elementEmblem.lit?0.5+0.5*Math.sin(now*0.003):p;
  const alpha=0.12+0.88*p;
  const grow=0.4+0.6*p;
  const pxScale=vb.w/(canvas.clientWidth||1);
  const iconWorld=58*pxScale*grow;

  tickElementParticles();

  const padGlow=ctx.createRadialGradient(anchor.x,anchor.y,8*pxScale,anchor.x,anchor.y,95*pxScale+24*pulse*pxScale);
  padGlow.addColorStop(0,rgbaFromHex(fx.glow,0.28*alpha));
  padGlow.addColorStop(0.55,rgbaFromHex(fx.core,0.1*alpha));
  padGlow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=padGlow;
  ctx.beginPath();ctx.arc(anchor.x,anchor.y,100*pxScale,0,Math.PI*2);ctx.fill();

  drawElementParticles(anchor.x,anchor.y,alpha);

  ctx.save();
  ctx.translate(anchor.x,anchor.y);
  ctx.scale(iconWorld/30,iconWorld/30);
  ctx.shadowColor=fx.glow;
  ctx.shadowBlur=(elementEmblem.lit?22:8)+14*pulse;

  ctx.strokeStyle=rgbaFromHex(fx.glow,0.25+0.45*alpha);
  ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(0,10,34,10,0,0,Math.PI*2);ctx.stroke();

  drawElementIcon(elementEmblem.elementId,alpha,pulse);
  ctx.restore();

  if(p>0.05){
    ctx.save();
    ctx.font='600 '+(11*pxScale)+'px Cinzel, serif';
    ctx.textAlign='center';
    ctx.textBaseline='top';
    ctx.fillStyle=rgbaFromHex(fx.hot||fx.core,alpha*0.92);
    ctx.shadowColor=fx.glow;
    ctx.shadowBlur=8*pxScale;
    ctx.fillText(nftElementStat(elementEmblem.elementId).n.toUpperCase(),anchor.x,anchor.y+iconWorld*0.55);
    ctx.restore();
  }
}

function awakenFx(){
  const id=nftHubNode()?.elementId||S()?.nftElement||'FIRE';
  return ELEMENT_FX[id]||ELEMENT_FX.FIRE;
}

function resizeCanvas(){
  const dpr=Math.min(2,window.devicePixelRatio||1);
  const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
  if(canvas.width!==Math.floor(w*dpr)||canvas.height!==Math.floor(h*dpr)){
    canvas.width=Math.floor(w*dpr);
    canvas.height=Math.floor(h*dpr);
  }
  canvasDpr=dpr;
}

function hitNodeAt(clientX,clientY){
  if(!DATA)return null;
  const rect=canvas.getBoundingClientRect();
  const mx=clientX-rect.left,my=clientY-rect.top;
  const cw=canvas.clientWidth||1,ch=canvas.clientHeight||1;
  const scale=cw/vb.w;
  let best=null,bd=1e18;
  for(let i=DATA.nodes.length-1;i>=0;i--){
    const n=DATA.nodes[i];
    const sx=(n.x-vb.x)*scale,sy=(n.y-vb.y)*scale;
    const rPx=Math.max(12,((R[n.kind]||10)+14)*scale);
    if(sx<-rPx||sx>cw+rPx||sy<-rPx||sy>ch+rPx)continue;
    const dx=mx-sx,dy=my-sy,d=dx*dx+dy*dy;
    if(d<rPx*rPx&&d<bd){bd=d;best=n;}
  }
  return best;
}

function easeOut(t){return 1-Math.pow(1-t,3);}

function beginWorld(){
  resizeCanvas();
  const dpr=canvasDpr;
  const cw=canvas.clientWidth,ch=canvas.clientHeight;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle='#050814';
  ctx.fillRect(0,0,cw,ch);
  const g=ctx.createRadialGradient(cw*0.5,ch*0.46,20,cw*0.5,ch*0.46,cw*0.7);
  g.addColorStop(0,'rgba(40,55,110,.22)');
  g.addColorStop(1,'rgba(2,4,10,0)');
  ctx.fillStyle=g;
  ctx.fillRect(0,0,cw,ch);
  const scale=cw/vb.w;
  ctx.setTransform(dpr*scale,0,0,dpr*scale,-vb.x*dpr*scale,-vb.y*dpr*scale);
}

function drawSky(now){
  for(let i=0;i<skyStars.length;i++){
    const s=skyStars[i];
    if(!inView(s.x,s.y,8))continue;
    let o=s.o;
    if(s.tw)o*=0.35+0.65*(0.5+0.5*Math.sin(now*0.0022+s.ph));
    ctx.beginPath();
    ctx.fillStyle='rgba(220,232,255,'+o+')';
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fill();
  }
}

function drawHex(c){
  const rr=c.r||180,rot=c.rot||-Math.PI/2;
  ctx.beginPath();
  for(let i=0;i<6;i++){
    const a=rot-Math.PI/2+i*Math.PI/3;
    const x=c.x+rr*Math.cos(a),y=c.y+rr*Math.sin(a);
    if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
  }
  ctx.closePath();
  ctx.strokeStyle=c.col||'rgba(160,190,255,.18)';
  ctx.globalAlpha=0.28;
  ctx.lineWidth=1.2;
  ctx.setLineDash([7,11]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha=1;
}

function drawEdges(now){
  if(!DATA)return;
  const st=S();
  const awaken=elementAwakened();
  const fx=awaken?awakenFx():null;
  let elemMix=1;
  if(awaken&&!elementEmblem.lit){
    elemMix=easeOut(Math.min(1,(now-elementEmblem.t0)/elementEmblem.dur));
  }
  const pulse=awaken&&(elementEmblem.lit||elemMix>0.05)?0.62+0.38*Math.sin(now*0.004):1;
  ctx.lineCap='round';
  DATA.edges.forEach(([a,b])=>{
    if(branchIds.includes(a)&&branchIds.includes(b))return;
    const A=byId[a],B=byId[b];
    if(!A||!B)return;
    const pathOn=st.allocated.has(a)&&st.allocated.has(b);
    ctx.beginPath();
    ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);
    if(awaken){
      const aMult=pathOn?0.95:0.42;
      ctx.strokeStyle=rgbaFromHex(fx.glow,aMult*elemMix*pulse);
      ctx.lineWidth=(pathOn?2.15:1.25)*elemMix+0.05;
      ctx.shadowColor=fx.core;
      ctx.shadowBlur=(pathOn?12:6)*elemMix;
    }else if(pathOn){
      ctx.strokeStyle='rgba(232,243,255,.92)';
      ctx.lineWidth=2.05;
      ctx.shadowColor='rgba(210,235,255,.8)';
      ctx.shadowBlur=8;
    }else{
      ctx.strokeStyle='rgba(106,134,192,.22)';
      ctx.lineWidth=1.05;
      ctx.shadowBlur=0;
    }
    ctx.stroke();
  });
  ctx.shadowBlur=0;
}

function drawStar(n,now){
  const st=S();
  const on=st.allocated.has(n.id)||n.kind==='core';
  const reach=isReachable(n.id);
  const col=nodeColors(n);
  const r=R[n.kind]||10;
  const hover=hoverId===n.id;
  let bloom=on?0.55:(reach?0.16:0.04);
  let rays=on?0.95:(reach?0.55:0.22);
  if(hover){bloom=Math.max(bloom,.55);rays=Math.max(rays,1);}
  if(on)bloom*=0.85+0.15*Math.sin(now*0.0024+(n.id%17));
  const ign=n.igniteAt?Math.max(0,1-(now-n.igniteAt)/700):0;
  if(ign>0)bloom=Math.max(bloom,0.15+0.8*ign);
  const pxScale=vb.w/(canvas.clientWidth||1);

  ctx.save();
  ctx.translate(n.x,n.y);
  const spin=on?(now*0.0002+(n.id%10)*0.4):0;
  ctx.rotate(spin);

  const bloomGrad=ctx.createRadialGradient(0,0,r*0.2,0,0,r*3.4);
  bloomGrad.addColorStop(0,rgbaFromHex(col.glow,.55*bloom));
  bloomGrad.addColorStop(0.45,rgbaFromHex(col.glow,.18*bloom));
  bloomGrad.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=bloomGrad;
  ctx.beginPath();ctx.arc(0,0,r*3.4,0,Math.PI*2);ctx.fill();

  ctx.beginPath();
  const outer=r*1.55,inner=r*0.22;
  for(let i=0;i<8;i++){
    const a=-Math.PI/2+i*Math.PI/4;
    const rad=i%2?inner:outer;
    const x=rad*Math.cos(a),y=rad*Math.sin(a);
    if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
  }
  ctx.closePath();
  ctx.globalAlpha=rays;
  ctx.fillStyle=col.glow;
  ctx.fill();
  ctx.globalAlpha=1;

  const coreR=Math.max(2.4,r*0.38);
  const coreGrad=ctx.createRadialGradient(0,0,0,0,0,coreR);
  coreGrad.addColorStop(0,'#ffffff');
  coreGrad.addColorStop(0.45,col.fill);
  coreGrad.addColorStop(1,rgbaFromHex(col.glow,.2));
  ctx.fillStyle=coreGrad;
  ctx.beginPath();ctx.arc(0,0,coreR,0,Math.PI*2);ctx.fill();

  if(hover){
    ctx.strokeStyle='rgba(255,255,255,.95)';
    ctx.lineWidth=2.5*pxScale;
    ctx.shadowColor=col.glow;
    ctx.shadowBlur=10*pxScale;
    ctx.beginPath();ctx.arc(0,0,r*1.85,0,Math.PI*2);ctx.stroke();
    ctx.shadowBlur=0;
  }

  if(n.kind==='lock'&&!on){
    ctx.strokeStyle=col.stroke;
    ctx.lineWidth=1.6;
    ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.arc(0,0,r*0.85,0,Math.PI*2);ctx.stroke();
    ctx.setLineDash([]);
  }

  if(ign>0){
    ctx.globalAlpha=ign;
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(0,0,r*(0.15+4.4*(1-ign)),0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
  }
  ctx.restore();
}

function drawFrame(now){
  if(!DATA)return;
  beginWorld();
  drawSky(now);
  (DATA.clusters||[]).forEach(c=>{
    if(inView(c.x,c.y,(c.r||180)+20))drawHex(c);
  });
  drawEdges(now);
  DATA.nodes.forEach(n=>{
    if(inView(n.x,n.y,80)||n.id===hoverId)drawStar(n,now);
  });
  drawElementEmblem(now);
}

function startLoop(){
  if(loopOn)return;
  loopOn=true;
  const tick=t=>{drawFrame(t);requestAnimationFrame(tick);};
  requestAnimationFrame(tick);
}

function loadClass(cls){
  cur=cls;
  const built=buildTree(cls);
  META=built.meta;DATA=built.data;
  applyPalette(META.palette);
  byId={};adj={};
  DATA.nodes.forEach(n=>{byId[n.id]=n;adj[n.id]=[];});
  DATA.edges.forEach(([a,b])=>{adj[a].push(b);adj[b].push(a);});
  branchIds=DATA.hubs;
  initState(cls,DATA.core_id);
  if(!S().inventory.length)S().inventory=buildInventory(cls);
  drawStarfield();
  document.getElementById('counter').innerHTML=`<span class="pip">ALLOCATED <b id="c-lvl">0</b></span><span class="pip">NODES <b>${DATA.nodes.length}</b></span>`;
  document.getElementById('hint').innerHTML=`Click <b>${META.name}</b> · primary <b>${META.primary}</b> · ${META.branches.map(b=>b.role).join(' / ')} · <b>${DATA.nodes.length}</b> nodes`;
  const sel=document.getElementById('class-select');
  if(sel)sel.value=cls;
  const nftCb=document.getElementById('nft-owned');
  if(nftCb)nftCb.checked=!!S().nftOwned;
  const nftElSel=document.getElementById('nft-element');
  if(nftElSel)nftElSel.value=S().nftElement||'FIRE';
  applyNftSanctumElement(S().nftElement||'FIRE');
  renderNodeCatalog(DATA.nodes);
  fit();updateSide();updateCoreLabel();render();
  startLoop();
}

function render(){
  document.getElementById('c-lvl').textContent=lvlUsed();
  updateCoreLabel();updateSide();
  const play=awakenAnim;
  awakenAnim=false;
  syncElementEmblem(play);
}

function showTip(n,e){
  const tier=n.lockType==='nft'?'NFT GATE':({core:'CLASS',branch:'EXPERIENCE',stat:'PASSIVE',notable:'NOTABLE ◈',lock:'BRIDGE LOCK'}[n.kind]||'');
  const zoneLbl={start:'Class ring',travel:'Experience ring',mastery:'Mastery constellation',hub:'Experience start',bridge:'Bridge',lock:'Burn a gem to cross',island:'Stat island',expansion:'Outer lattice',nft:'NFT Sanctum','nft-gate':'NFT Gate','nft-approach':'NFT approach'}[n.zone||''];
  document.getElementById('tip-tier').textContent=zoneLbl?`${tier} · ${zoneLbl}`:tier;
  document.getElementById('tip-nm').textContent=n.name+(n.role?` · ${n.role}`:'');
  let body=n.body||'';
  if(n.nftHub){
    const stat=nftElementStat(n.elementId||S().nftElement);
    document.getElementById('tip-tier').textContent='NFT KEYSTONE · Element Awakening · '+stat.id;
    body=n.body||'';
    if(S().allocated.has(n.id))body+='\n\n'+stat.n+' element is awakened on this character.';
    else body+='\n\nAllocate this node to awaken '+stat.n+'. Change element in the sidebar dropdown first.';
  }else if((n.kind==='stat'||n.kind==='notable')&&STATS[n.statId]){
    const stat=STATS[n.statId];
    document.getElementById('tip-tier').textContent=(zoneLbl?`${tier} · ${zoneLbl}`:tier)+` · ${stat.id}`;
    body=`${stat.n} · ${stat.b}\n\n${stat.v}`;
  }
  if(n.kind==='lock'){
    if(n.lockType==='nft'){
      body='Requires an Elumia NFT character to unlock.\n\nEnable NFT ownership in the sidebar, then click to open the Sanctum.\nNFT stat bonuses cap at +10% total.';
      if(!S().nftOwned)body+='\n\nYou do not have NFT ownership enabled.';
      else if(!S().allocated.has(n.id))body+='\n\nClick to unlock.';
    }else{
      const info=LOCK_INFO[n.lockTier];
      body='Requires '+n.lockQuality+'+ gem to unlock.\n\n'+(info?info.desc:'Burn a gem from your pouch.');
      if(!S().allocated.has(n.id))body+='\n\nClick to burn a '+n.lockQuality+'+ gem.';
    }
  }
  if(n.nft&&n.kind==='stat'){
    body=(n.body||'')+'\n\nAllocated: '+nftBonusTotal()+'% / '+NFT_BONUS_CAP+'% cap.';
  }
  if(n.kind==='core')body='Class core · primary '+((CLASS_PRIM_LABEL[cur]||{}).name||META?.primary||'attribute')+' · use the dropdown above to switch class.';
  document.getElementById('tip-body').textContent=body;
  tip.classList.add('show');moveTip(e);
}
function moveTip(e){tip.style.left=(e.clientX+16)+'px';tip.style.top=(e.clientY+16)+'px';}
function hideTip(){tip.classList.remove('show');}

let vb={x:2920,y:2920,w:4160,h:4160};
const ZOOM_MIN_VB=160,ZOOM_MAX_VB=9000;
function fit(){vb={x:2920,y:2920,w:4160,h:4160};}

document.getElementById('fit').onclick=fit;
document.getElementById('class-select').onchange=function(){selectClass(this.value);};
document.getElementById('nft-owned').onchange=function(){S().nftOwned=this.checked;render();};
document.getElementById('nft-element').onchange=function(){
  S().nftElement=this.value;
  applyNftSanctumElement(this.value);
  const hub=nftHubNode();
  if(hub&&S().allocated.has(hub.id))awakenAnim=true;
  render();
  const stat=nftElementStat(this.value);
  toast('Sanctum set to '+stat.n);
};
document.getElementById('reset').onclick=()=>{
  const st=S();
  st.allocated=new Set([DATA.core_id]);st.gemUsed={};st.unlocked=new Set();st.activeBranchId=null;st.inventory=buildInventory(cur);
  elementEmblem.show=false;elementEmblem.lit=false;elementEmblem.particles=[];
  render();
};
document.addEventListener('click',e=>{if(!document.getElementById('picker').contains(e.target))document.getElementById('picker').removeAttribute('style');document.getElementById('picker').classList.remove('show');});

let drag=null;
const stage=document.getElementById('stage');
stage.onpointerdown=e=>{
  if(e.target!==canvas)return;
  const n=hitNodeAt(e.clientX,e.clientY);
  if(n){handleNodeClick(n,e);return;}
  hoverId=null;hideTip();
  drag={x:e.clientX,y:e.clientY,vx:vb.x,vy:vb.y};
  stage.classList.add('grabbing');
  stage.setPointerCapture(e.pointerId);
};
stage.onpointermove=e=>{
  if(drag){
    const sc=vb.w/canvas.clientWidth;
    vb.x=drag.vx-(e.clientX-drag.x)*sc;
    vb.y=drag.vy-(e.clientY-drag.y)*sc;
    return;
  }
  if(e.target!==canvas){if(hoverId!=null){hoverId=null;hideTip();canvas.style.cursor='grab';}return;}
  const n=hitNodeAt(e.clientX,e.clientY);
  const id=n?n.id:null;
  canvas.style.cursor=n?'pointer':'grab';
  if(id!==hoverId){
    hoverId=id;
    if(n)showTip(n,e);else hideTip();
  }else if(n)moveTip(e);
};
stage.onpointerup=e=>{
  drag=null;stage.classList.remove('grabbing');
  if(e.target===canvas){
    const n=hitNodeAt(e.clientX,e.clientY);
    hoverId=n?n.id:null;
    if(n){showTip(n,e);canvas.style.cursor='pointer';}
    else{hideTip();canvas.style.cursor='grab';}
  }
};
stage.onpointerleave=()=>{if(!drag){hoverId=null;hideTip();canvas.style.cursor='grab';}};
stage.onwheel=e=>{
  e.preventDefault();
  const rect=canvas.getBoundingClientRect();
  const sc=vb.w/rect.width,f=e.deltaY>0?1.1:0.9;
  const mx=e.clientX-rect.left,my=e.clientY-rect.top;
  const wx=vb.x+mx*sc,wy=vb.y+my*sc;
  vb.w=Math.max(ZOOM_MIN_VB,Math.min(ZOOM_MAX_VB,vb.w*f));
  vb.h=vb.w;
  vb.x=wx-mx*(vb.w/rect.width);
  vb.y=wy-my*(vb.w/rect.width);
};
window.addEventListener('resize',resizeCanvas);

loadClass('champion');
