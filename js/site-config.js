/* Site-wide game hub settings */
(function (global) {
  global.TRIUMPH_SITE = {
    themes: {
      triumph: { name: "Triumph Guides", accent: "#d4af37" },
      battlerise: { name: "BattleRise", accent: "#d4af37" },
      elumia: { name: "Legends of Elumia", accent: "#d4af37" },
      armourx: { name: "ArmourX", accent: "#d4af37" }
    },
    comingSoon: {
      armourx: "ArmourX"
    },
    passwordProtected: {
      elumia: {
        title: "Legends of Elumia",
        password: "11223344",
        storageKey: "triumph_unlock_elumia"
      }
    },
    discordUrl: "https://discord.com/invite/triumphgames"
  };
})(window);
