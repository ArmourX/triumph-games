using MonsterCollect.Monster;

namespace MonsterCollect.Monster
{
    public static class MonsterDisplayExtensions
    {
        public static string GetDisplayName(this MonsterData monster)
        {
            if (monster == null)
            {
                return string.Empty;
            }

            if (monster.Customization != null && monster.Customization.HasCustomName)
            {
                return monster.Customization.customDisplayName;
            }

            return monster.Name ?? string.Empty;
        }

        public static string GetEvolutionLabel(this MonsterData monster)
        {
            if (monster == null || monster.EvolutionStage <= 0)
            {
                return "Base Form";
            }

            EvolutionPathEntry path = GameContentRegistry.Evolution.FindById(monster.EvolutionPathId);
            return path != null ? path.displayName : $"Stage {monster.EvolutionStage}";
        }
    }
}
