using MonsterCollect.Monster;
using UnityEngine;

namespace MonsterCollect.Appearance
{
    /// <summary>Rarity-driven outline, glow, and particle settings.</summary>
    public static class MonsterRarityVisualEffects
    {
        public struct Profile
        {
            public float OutlineThickness;
            public float GlowStrength;
            public float GlowRadius;
            public bool EnableParticles;
        }

        public static Profile GetProfile(MonsterRarity rarity)
        {
            return rarity switch
            {
                MonsterRarity.Uncommon => new Profile
                {
                    OutlineThickness = 1f,
                    GlowStrength = 0.08f,
                    GlowRadius = 1.02f,
                    EnableParticles = false
                },
                MonsterRarity.Rare => new Profile
                {
                    OutlineThickness = 2f,
                    GlowStrength = 0.15f,
                    GlowRadius = 1.04f,
                    EnableParticles = false
                },
                MonsterRarity.Epic => new Profile
                {
                    OutlineThickness = 3f,
                    GlowStrength = 0.22f,
                    GlowRadius = 1.06f,
                    EnableParticles = true
                },
                MonsterRarity.Legendary => new Profile
                {
                    OutlineThickness = 4f,
                    GlowStrength = 0.32f,
                    GlowRadius = 1.1f,
                    EnableParticles = true
                },
                _ => new Profile
                {
                    OutlineThickness = 0f,
                    GlowStrength = 0f,
                    GlowRadius = 1f,
                    EnableParticles = false
                }
            };
        }

        public static Color GetGlowColor(MonsterData data)
        {
            if (data == null)
            {
                return Color.white;
            }

            return Color.Lerp(data.SecondaryColor, Color.white, 0.35f);
        }
    }
}
