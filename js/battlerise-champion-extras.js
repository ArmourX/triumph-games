window.BATTLERISE_CHAMPION_EXTRAS = {
  siegward: {
    overview: "Siegward the Valiant Pilgrim is Avalon's premier healer — trained by Invictus himself. A core pick for Gauntlet sustain comps and any content where keeping allies alive matters more than raw speed.\n\nHis magical healing scales with INT artifacts and pairs naturally with defensive champions like Invictus. One of the most reliable support champions in the game.",
    ratings: { "Arena Defense": 4, "Gauntlet": 5, "Dungeons": 5, "Bosses": 4, "Live PvP": 3 },
    skills: [
      { name: "Luminous Strike", description: "Attacks one enemy. Heals the ally with the lowest HP by 10%.", cooldown: -1, type: "magic" },
      { name: "Pilgrim's Grace", description: "Removes all debuffs from all allies and places Continuous Heal for 2 turns.", cooldown: 4, type: "support" },
      { name: "Light of Avalon", description: "Revives all dead allies with 40% HP. Fills Turn Meter of all allies by 15%.", cooldown: 6, type: "support" }
    ],
    passive: "Allies under Continuous Heal have 10% increased Effect RES.",
    gear: {
      pveStats: ["HP%", "SPD", "RES", "DEF%"],
      pveSets: ["Seraphim's Oath", "Purity Breeze", "Lux Perpetua"],
      pvpStats: ["HP%", "SPD", "RES"],
      pvpSets: ["Divinity Spark", "Finest Shield", "Griffin Care"]
    }
  },
  invictus: {
    overview: "Invictus is BattleRise's signature Heaven Guardian — the unyielding defender who anchors nearly every competitive roster. As the default champion avatar and a staple of live PvP, Invictus combines team-wide protection with punishing counter-pressure that makes him one of the most sought-after Legendary champions in the game.\n\nIn Arena and Gauntlet content, Invictus excels at absorbing burst damage while keeping allies alive through shields and damage reduction. His kit scales beautifully with STR artifacts and defensive stat lines, making him a long-term investment that rarely falls out of the meta.\n\nWhile pure damage dealers may outpace him in speed-run dungeon clears, Invictus remains elite wherever survival and control matter — especially in multi-phase boss fights and 8-player Gauntlet speed dungeons.",
    ratings: { "Arena Defense": 5, "Gauntlet": 5, "Dungeons": 4, "Bosses": 4, "Live PvP": 5 },
    skills: [
      { name: "Guardian's Oath", description: "Attacks one enemy. Has a 30% chance to place Provoke on the target for 1 turn.", cooldown: -1, type: "physical" },
      { name: "Aegis of the Host", description: "Places a Shield equal to 25% of this Champion's MAX HP on all allies for 2 turns. Also places Block Debuffs on allies for 1 turn.", cooldown: 3, type: "support" },
      { name: "Unbroken Will", description: "Fills this Champion's Turn Meter by 50%. Heals all allies by 20% of their MAX HP and removes all debuffs from them.", cooldown: 5, type: "support" }
    ],
    passive: "Decreases damage taken by all allies by 8%. When an ally receives a critical hit, has a 40% chance to counterattack with Guardian's Oath.",
    gear: {
      pveStats: ["HP%", "DEF%", "SPD", "RES"],
      pveSets: ["Vitality Emblem", "Finest Shield", "Plate of Justice"],
      pvpStats: ["HP%", "DEF%", "SPD", "RES"],
      pvpSets: ["Plate of Justice", "Purity Breeze", "Seraphim's Oath"]
    }
  },
  bonelord: {
    overview: "Bonelord is a Legendary Undead controller who dominates prolonged fights through debuff stacking and turn manipulation. Few champions can shut down enemy teams as reliably in dungeon waves and extended content.\n\nHis INT scaling makes him a prime candidate for skill-effect artifacts. Pair with sustain or revivers to let Bonelord grind down even the tankiest Arena defenses.",
    ratings: { "Arena Offense": 4, "Gauntlet": 4, "Dungeons": 5, "Bosses": 3, "Live PvP": 4 },
    skills: [
      { name: "Bone Shard", description: "Attacks one enemy. Has a 50% chance to place Continuous Damage for 2 turns.", cooldown: -1, type: "magic" },
      { name: "Grave Silence", description: "Places Ability Block on all enemies for 1 turn. Decreases Turn Meter of each target by 15%.", cooldown: 4, type: "magic" },
      { name: "Lich's Dominion", description: "Revives all dead allies with 50% HP. Places Increase Attack on all allies for 2 turns.", cooldown: 6, type: "magic" }
    ],
    passive: "Enemies under debuffs take 10% increased damage from all sources.",
    gear: {
      pveStats: ["Effect ACC", "SPD", "HP%", "C.RATE"],
      pveSets: ["Plague of Decay", "Necromancer's Veil", "Souldrainer"],
      pvpStats: ["Effect ACC", "SPD", "HP%"],
      pvpSets: ["Observer's Gaze", "Dark Illusion", "Skullcrusher"]
    }
  },
  hirada: {
    overview: "Hirada is an Eastern Realm striker who wields the Samurai portrait and excels at precision burst damage. One of the highest single-target damage dealers when geared with crit and speed artifacts.\n\nExcels in Arena offense and quick Gauntlet phases — if Hirada survives to act, fights often end immediately.",
    ratings: { "Arena Offense": 5, "Gauntlet": 4, "Dungeons": 4, "Bosses": 5, "Live PvP": 5 },
    gear: {
      pveStats: ["C.RATE", "C.DMG", "SPD", "ATK%"],
      pveSets: ["Dragonslayer Sword", "Assassin's Mercy", "Harlequin Wear"],
      pvpStats: ["C.RATE", "C.DMG", "SPD"],
      pvpSets: ["Dragonslayer Sword", "Sinister Claws", "Wildling Arrows"]
    }
  },
  logarius: {
    overview: "Logarius, Count of Hemwick, is a Mythic Vampire healer who regenerates health through attacks. A sustain-heavy carry who snowballs through extended fights in Live PvP and multi-wave dungeon content.",
    ratings: { "Arena Offense": 5, "Gauntlet": 4, "Dungeons": 4, "Bosses": 4, "Live PvP": 5 },
    gear: {
      pveStats: ["ATK%", "SPD", "C.RATE", "HP%"],
      pveSets: ["Souldrainer", "Heart of Etherstone", "Infernal Reaper"],
      pvpStats: ["ATK%", "SPD", "C.RATE"],
      pvpSets: ["Born in Infernal", "Cursed Infamy", "Assassin's Mercy"]
    }
  },
  samurai: {
    overview: "Samurai is a Legendary AGI striker from the Eastern Realm, built around precision crits and burst windows. One of the highest single-target damage dealers in BattleRise when geared with crit and speed artifacts.\n\nExcels in Arena offense and quick Gauntlet phases. Requires protection — if he survives to his turn, fights often end immediately.",
    ratings: { "Arena Offense": 5, "Gauntlet": 4, "Dungeons": 4, "Bosses": 5, "Live PvP": 5 },
    skills: [
      { name: "Iaido Cut", description: "Attacks one enemy. Increases this Champion's C.RATE by 10% (stacks up to 5 times).", cooldown: -1, type: "physical" },
      { name: "Whirlwind Draw", description: "Attacks all enemies. Each critical hit decreases skill cooldowns by 1.", cooldown: 3, type: "physical" },
      { name: "Heaven's Edge", description: "Attacks one enemy. Ignores 50% of target DEF. Guaranteed critical hit if target is below 30% HP.", cooldown: 4, type: "physical" }
    ],
    passive: "Increases C.DMG by 15%. When this Champion lands a killing blow, fills Turn Meter by 25%.",
    gear: {
      pveStats: ["C.RATE", "C.DMG", "SPD", "ATK%"],
      pveSets: ["Dragonslayer Sword", "Assassin's Mercy", "Harlequin Wear"],
      pvpStats: ["C.RATE", "C.DMG", "SPD"],
      pvpSets: ["Dragonslayer Sword", "Sinister Claws", "Wildling Arrows"]
    }
  },
  "vampire-lord": {
    overview: "Vampire Lord is a sustain-heavy AGI carry who drains life and snowballs through extended fights. A terror in Live PvP and multi-wave dungeon content where healing reduction is absent.\n\nBuild for speed and lifesteal artifacts to maximize his self-sustain and turn cycling.",
    ratings: { "Arena Offense": 5, "Gauntlet": 4, "Dungeons": 4, "Bosses": 4, "Live PvP": 5 },
    skills: [
      { name: "Crimson Fang", description: "Attacks one enemy. Heals this Champion by 30% of damage dealt.", cooldown: -1, type: "physical" },
      { name: "Blood Mist", description: "Attacks all enemies. Places Decrease Healing on enemies for 2 turns.", cooldown: 3, type: "physical" },
      { name: "Eternal Thirst", description: "Attacks one enemy 3 times. Each hit heals this Champion by 15% of MAX HP.", cooldown: 4, type: "physical" }
    ],
    passive: "Increases Lifesteal by 10%. When an enemy dies, this Champion gains 5% Turn Meter.",
    gear: {
      pveStats: ["ATK%", "SPD", "C.RATE", "HP%"],
      pveSets: ["Souldrainer", "Heart of Etherstone", "Infernal Reaper"],
      pvpStats: ["ATK%", "SPD", "C.RATE"],
      pvpSets: ["Born in Infernal", "Cursed Infamy", "Assassin's Mercy"]
    }
  },
  cassiel: {
    overview: "Cassiel is a Legendary Seraphim support who defines the game's premier healing identity. Best-in-slot for keeping Gauntlet teams alive through brutal speed-run pacing.\n\nNot a damage dealer — but teams without a Cassiel equivalent often fail long Gauntlet runs entirely.",
    ratings: { "Arena Defense": 4, "Gauntlet": 5, "Dungeons": 5, "Bosses": 4, "Live PvP": 3 },
    skills: [
      { name: "Radiant Touch", description: "Attacks one enemy. Heals the ally with the lowest HP by 15% of their MAX HP.", cooldown: -1, type: "magic" },
      { name: "Seraph's Grace", description: "Removes all debuffs from all allies, then places Continuous Heal for 2 turns.", cooldown: 4, type: "support" },
      { name: "Divine Resurrection", description: "Revives a dead ally with 75% HP and full Turn Meter. Places Block Debuffs on them for 2 turns.", cooldown: 6, type: "support" }
    ],
    passive: "Allies with Continuous Heal receive 10% less damage.",
    gear: {
      pveStats: ["HP%", "SPD", "RES", "DEF%"],
      pveSets: ["Seraphim's Oath", "Purity Breeze", "Lux Perpetua"],
      pvpStats: ["HP%", "SPD", "RES"],
      pvpSets: ["Divinity Spark", "Finest Shield", "Griffin Care"]
    }
  },
  heretic: {
    overview: "Heretic is an Epic Dead Knight attacker who punishes ability-reliant teams with Ability Block and armor penetration. Pulled straight from BattleRise's prototype combat data, he represents an aggressive debuff style.\n\nStrong early-to-mid game Arena pick. Falls off slightly against cleansers but remains viable in dungeon waves.",
    ratings: { "Arena Offense": 4, "Gauntlet": 3, "Dungeons": 4, "Bosses": 3, "Live PvP": 4 },
    gear: {
      pveStats: ["ATK%", "Effect ACC", "SPD", "C.RATE"],
      pveSets: ["Shield of Darkness", "Infernal Cry", "Dead or Alive"],
      pvpStats: ["ATK%", "Effect ACC", "SPD"],
      pvpSets: ["Cursed Infamy", "Dungeon Curse", "The Mooncurse"]
    }
  }
};
