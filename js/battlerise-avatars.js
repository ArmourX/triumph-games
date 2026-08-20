/** BattleRise champion avatars for account signup and profile display. */
(function (global) {
  var list = [
    { slug: "bonelord", name: "Bonelord", portrait: "assets/battlerise/champions/Bonelord_Vertical.png" },
    { slug: "caelan", name: "Caelan", portrait: "assets/battlerise/champions/Archdruid_Vertical.png" },
    { slug: "cassiel", name: "Cassiel", portrait: "assets/battlerise/champions/Cassiel_Vertical.png" },
    { slug: "elicard", name: "Elicard", portrait: "assets/battlerise/champions/Vampire_Slayer_Vertical.png" },
    { slug: "etherstone-golem", name: "Etherstone Golem", portrait: "assets/battlerise/champions/Golem_Vertical.png" },
    { slug: "fara", name: "Fara", portrait: "assets/battlerise/champions/Harpy_Vertical.png" },
    { slug: "fionann", name: "Fionann", portrait: "assets/battlerise/champions/Lifebringer_Vertical.png" },
    { slug: "gozu", name: "Gozu", portrait: "assets/battlerise/champions/Gozu_Vertical.png" },
    { slug: "hilde", name: "Hilde", portrait: "assets/battlerise/champions/Hilde_Vertical.png" },
    { slug: "hirada", name: "Hirada", portrait: "assets/battlerise/champions/Samurai_Vertical.png" },
    { slug: "honnari", name: "Honnari", portrait: "assets/battlerise/champions/Succubus_Vertical.png" },
    { slug: "invictus", name: "Invictus", portrait: "assets/battlerise/champions/Invictus_Vertical.png" },
    { slug: "kojin", name: "Kojin", portrait: "assets/battlerise/champions/Ifrit_Vertical.png" },
    { slug: "logarius", name: "Logarius", portrait: "assets/battlerise/champions/Vampire_Lord_Vertical.png" },
    { slug: "marduk", name: "Marduk", portrait: "assets/battlerise/champions/Marduk_Vertical.png" },
    { slug: "nightwalker", name: "Nightwalker", portrait: "assets/battlerise/champions/Nightwalker_Vertical.png" },
    { slug: "nightwalker-fencer", name: "Nightwalker Fencer", portrait: "assets/battlerise/champions/Nightwalker_Fencer_Vertical.png" },
    { slug: "orochi", name: "Orochi", portrait: "assets/battlerise/champions/Monk_Vertical.png" },
    { slug: "ryker", name: "Ryker", portrait: "assets/battlerise/champions/Assassin_Vertical.png" },
    { slug: "siegward", name: "Siegward", portrait: "assets/battlerise/champions/BlessedSentinel_Vertical.png" },
    { slug: "sinister-lich", name: "Sinister Lich", portrait: "assets/battlerise/champions/Skeleton_Mage_Vertical.png" },
    { slug: "skeleton-knight", name: "Skeleton Knight", portrait: "assets/battlerise/champions/Skeleton_Knight_Vertical.png" },
    { slug: "skeleton-maniac", name: "Skeleton Maniac", portrait: "assets/battlerise/champions/Skeleton_Vertical.png" },
    { slug: "spirit-of-nature", name: "Spirit of Nature", portrait: "assets/battlerise/champions/WolfSpirit_Vertical.png" },
    { slug: "sybil", name: "Sybil", portrait: "assets/battlerise/champions/Huntress_Vertical.png" },
    { slug: "tharcann", name: "Tharcann", portrait: "assets/battlerise/champions/Ent_Vertical.png" },
    { slug: "tristan", name: "Tristan", portrait: "assets/battlerise/champions/Protector_Vertical.png" },
    { slug: "unshaken", name: "Unshaken", portrait: "assets/battlerise/champions/Unshaken_Vertical.png" },
    { slug: "ursan", name: "Ursan", portrait: "assets/battlerise/champions/BearBerserker_Vertical.png" },
    { slug: "vaila", name: "Vaila", portrait: "assets/battlerise/champions/Vaila_Vertical.png" },
    { slug: "wraith", name: "Wraith", portrait: "assets/battlerise/champions/Ghost_Vertical.png" },
    { slug: "zephyr", name: "Zephyr", portrait: "assets/battlerise/champions/ElvenArcher_Vertical.png" }
  ];

  var bySlug = {};
  list.forEach(function (a) { bySlug[a.slug] = a; });

  global.BATTLERISE_AVATARS = {
    defaultSlug: "invictus",
    list: list,
    bySlug: bySlug,
    portraitFor: function (slug) {
      var a = bySlug[slug];
      return a ? a.portrait : bySlug.invictus.portrait;
    }
  };
})(window);
