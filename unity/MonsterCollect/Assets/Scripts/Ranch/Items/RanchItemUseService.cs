using MonsterCollect.Data;
using MonsterCollect.Monster;

namespace MonsterCollect.Ranch
{
    public readonly struct ItemUseResult
    {
        public bool Success { get; }
        public string Message { get; }

        public ItemUseResult(bool success, string message)
        {
            Success = success;
            Message = message;
        }

        public static ItemUseResult Fail(string message) => new ItemUseResult(false, message);
        public static ItemUseResult Ok(string message) => new ItemUseResult(true, message);
    }

    /// <summary>Applies consumable item effects to a ranch monster.</summary>
    public static class RanchItemUseService
    {
        public static ItemUseResult TryUseOnMonster(string itemId, MonsterData monster, double utcNowSeconds)
        {
            if (monster == null)
            {
                return ItemUseResult.Fail("No monster selected.");
            }

            if (LifespanRetirementService.IsUnavailableForActivities(monster))
            {
                return ItemUseResult.Fail(LifespanRetirementService.GetUnavailableReason(monster));
            }

            RanchItemDefinition item = PlayerInventoryService.GetDefinition(itemId);
            if (item == null)
            {
                return ItemUseResult.Fail("Unknown item.");
            }

            if (!PlayerInventoryService.TryRemoveItem(itemId, 1))
            {
                return ItemUseResult.Fail("Not enough items.");
            }

            MonsterRaisingService.EnsureRaisingState(monster);
            MonsterRaisingService.SimulateElapsedTime(monster, utcNowSeconds);
            MonsterRaisingState state = monster.Raising;

            state.hunger = MonsterRaisingService.ClampMeterPublic(state.hunger + item.HungerDelta);
            state.energy = MonsterRaisingService.ClampMeterPublic(state.energy + item.EnergyDelta);
            state.mood = MonsterRaisingService.ClampMeterPublic(state.mood + item.MoodDelta);
            state.lifespan = MonsterRaisingService.ClampMeterPublic(state.lifespan + item.LifespanDelta);
            state.fatigue = MonsterRaisingService.ClampMeterPublic(state.fatigue + item.FatigueDelta);

            if (item.HpDelta != 0)
            {
                monster.Hp += item.HpDelta;
            }

            if (item.AttackDelta != 0)
            {
                monster.Attack += item.AttackDelta;
            }

            if (item.DefenseDelta != 0)
            {
                monster.Defense += item.DefenseDelta;
            }

            if (item.SpeedDelta != 0)
            {
                monster.Speed += item.SpeedDelta;
            }

            if (item.TrainingSuccessBonus > 0f)
            {
                state.nextTrainingBonus = System.Math.Max(state.nextTrainingBonus, item.TrainingSuccessBonus);
            }

            if (item.BattleDamageBonus > 0f)
            {
                state.nextBattleDamageBonus = System.Math.Max(state.nextBattleDamageBonus, item.BattleDamageBonus);
            }

            state.lastSimulatedUtc = utcNowSeconds;
            RanchProgressionService.AddCarePoints(1);

            return ItemUseResult.Ok($"Used {item.DisplayName}.");
        }
    }
}
