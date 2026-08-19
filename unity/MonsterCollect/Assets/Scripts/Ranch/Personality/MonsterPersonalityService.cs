using MonsterCollect.Monster;

namespace MonsterCollect.Ranch
{
    public enum TrainingFocus
    {
        Strength,
        Agility,
        Intelligence,
        Defense
    }

    /// <summary>Personality-driven training and battle modifiers.</summary>
    public static class MonsterPersonalityService
    {
        public static MonsterPersonality Resolve(MonsterData monster)
        {
            if (monster?.Raising == null)
            {
                return MonsterPersonality.Curious;
            }

            if (monster.Raising.personality >= 0 && monster.Raising.personality <= (int)MonsterPersonality.Stubborn)
            {
                return (MonsterPersonality)monster.Raising.personality;
            }

            int seed = MonsterProceduralTraits.SeedFromInt(monster.FullHash.GetHashCode());
            var rng = new System.Random(seed);
            monster.Raising.personality = rng.Next(5);
            return (MonsterPersonality)monster.Raising.personality;
        }

        public static string GetDisplayName(MonsterPersonality personality)
        {
            return personality switch
            {
                MonsterPersonality.Gentle => "Gentle",
                MonsterPersonality.Bold => "Bold",
                MonsterPersonality.Lazy => "Lazy",
                MonsterPersonality.Curious => "Curious",
                MonsterPersonality.Stubborn => "Stubborn",
                _ => "Unknown"
            };
        }

        public static string GetDescription(MonsterPersonality personality)
        {
            return personality switch
            {
                MonsterPersonality.Gentle => "Calm and cooperative — great mood, modest gains.",
                MonsterPersonality.Bold => "Aggressive trainer — strong attack drills, loves battle.",
                MonsterPersonality.Lazy => "Avoids hard work — rest helps more, training often fails.",
                MonsterPersonality.Curious => "Learns quickly — library and errantry bonuses.",
                MonsterPersonality.Stubborn => "Resists drills — inconsistent but spikes on good days.",
                _ => string.Empty
            };
        }

        /// <summary>Multiplier applied to chance of +1 stat on training (base ~1.0).</summary>
        public static float GetTrainingMultiplier(MonsterData monster, TrainingFocus focus)
        {
            MonsterPersonality personality = Resolve(monster);
            MonsterRaisingState state = monster.Raising;
            float moodFactor = 0.75f + state.mood / 200f;
            float fatiguePenalty = 1f - state.fatigue / 150f;
            float bonus = RanchCustomizationService.GetTrainingSuccessBonus() + state.nextTrainingBonus;

            float personalityFactor = personality switch
            {
                MonsterPersonality.Gentle when focus == TrainingFocus.Defense => 1.15f,
                MonsterPersonality.Bold when focus == TrainingFocus.Strength => 1.2f,
                MonsterPersonality.Lazy => 0.65f,
                MonsterPersonality.Curious when focus == TrainingFocus.Intelligence => 1.25f,
                MonsterPersonality.Stubborn => state.mood > 60f ? 1.1f : 0.8f,
                _ => 1f
            };

            return System.Math.Max(0.2f, moodFactor * fatiguePenalty * personalityFactor * (1f + bonus));
        }

        /// <summary>Battle damage multiplier from mood + personality + charms.</summary>
        public static float GetBattleDamageMultiplier(MonsterData monster)
        {
            if (monster?.Raising == null)
            {
                return 1f;
            }

            MonsterPersonality personality = Resolve(monster);
            float moodFactor = 0.85f + monster.Raising.mood / 250f;
            float charmBonus = monster.Raising.nextBattleDamageBonus;

            float personalityFactor = personality switch
            {
                MonsterPersonality.Bold => 1.08f,
                MonsterPersonality.Gentle => 0.95f,
                MonsterPersonality.Lazy when monster.Raising.energy < 40f => 0.85f,
                MonsterPersonality.Stubborn when monster.Raising.mood < 30f => 0.9f,
                _ => 1f
            };

            return moodFactor * personalityFactor * (1f + charmBonus);
        }

        /// <summary>Chance (0–1) that AI-style player auto-suggestions favor aggressive moves.</summary>
        public static float GetAggressionBias(MonsterData monster)
        {
            return Resolve(monster) switch
            {
                MonsterPersonality.Bold => 0.75f,
                MonsterPersonality.Gentle => 0.35f,
                MonsterPersonality.Lazy => 0.25f,
                MonsterPersonality.Curious => 0.5f,
                MonsterPersonality.Stubborn => 0.55f,
                _ => 0.5f
            };
        }
    }
}
