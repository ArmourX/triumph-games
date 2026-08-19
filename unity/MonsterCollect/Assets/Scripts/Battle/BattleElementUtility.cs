using MonsterCollect.Monster;

namespace MonsterCollect.Battle
{
    /// <summary>Maps ranch monster data to battle element types.</summary>
    public static class BattleElementUtility
    {
        public static BattleElement FromSpecies(MonsterSpecies species)
        {
            return species switch
            {
                MonsterSpecies.Dragon => BattleElement.Fire,
                MonsterSpecies.Aquatic => BattleElement.Water,
                MonsterSpecies.Insect => BattleElement.Grass,
                MonsterSpecies.Elemental => BattleElement.Electric,
                MonsterSpecies.Beast => BattleElement.Earth,
                MonsterSpecies.Spirit => BattleElement.Wind,
                MonsterSpecies.Undead => BattleElement.Shadow,
                MonsterSpecies.Slime => BattleElement.Water,
                _ => BattleElement.Earth
            };
        }

        public static BattleElement FromMonster(MonsterData monster)
        {
            if (monster == null)
            {
                return BattleElement.Earth;
            }

            MonsterTypeAffinities affinities = monster.GetTypeAffinities();
            if (affinities != null && !affinities.IsEmpty())
            {
                MonsterSpecies dominant = affinities.GetDominantSpecies();
                return FromSpecies(dominant);
            }

            return FromSpecies(monster.Species);
        }

        public static string GetShortName(BattleElement element)
        {
            string name = element switch
            {
                BattleElement.Fire => "Fire",
                BattleElement.Water => "Water",
                BattleElement.Grass => "Grass",
                BattleElement.Electric => "Electric",
                BattleElement.Earth => "Earth",
                BattleElement.Wind => "Wind",
                BattleElement.Shadow => "Shadow",
                BattleElement.Light => "Light",
                _ => element.ToString()
            };

            return GetAccessibleLabel(name);
        }

        public static string GetAccessibleLabel(string elementName)
        {
            string symbol = MonsterCollect.Core.AccessibilityService.GetElementSymbol(elementName);
            return string.IsNullOrEmpty(symbol) ? elementName : $"{symbol} {elementName}";
        }
    }
}
