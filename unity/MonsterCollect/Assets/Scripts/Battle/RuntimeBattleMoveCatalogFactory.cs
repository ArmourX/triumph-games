using System.Collections.Generic;
using UnityEngine;

namespace MonsterCollect.Battle
{
    /// <summary>Builds default move definitions when Resources catalog is missing.</summary>
    public static class RuntimeBattleMoveCatalogFactory
    {
        public static BattleMoveCatalog Create()
        {
            var catalog = ScriptableObject.CreateInstance<BattleMoveCatalog>();
            catalog.Moves = new[]
            {
                Move("flame_burst", "Flame Burst", BattleElement.Fire, 55, StatusEffectType.Burn, withStatus: true),
                Move("water_pulse", "Water Pulse", BattleElement.Water, 50),
                Move("vine_whip", "Vine Whip", BattleElement.Grass, 45),
                Move("thunder_bolt", "Thunder Bolt", BattleElement.Electric, 60),
                Move("earth_slam", "Earth Slam", BattleElement.Earth, 50),
                Move("gale_strike", "Gale Strike", BattleElement.Wind, 0, StatusEffectType.SpeedUp, statOnly: true),
                Move("shadow_hex", "Shadow Hex", BattleElement.Shadow, 40, StatusEffectType.Poison, withStatus: true),
                Move("radiant_beam", "Radiant Beam", BattleElement.Light, 55),
                Move("sleep_dust", "Sleep Dust", BattleElement.Grass, 0, StatusEffectType.Sleep, statusOnly: true),
                Move("iron_guard", "Iron Guard", BattleElement.Earth, 0, StatusEffectType.DefenseUp, statOnly: true),
                Move("war_cry", "War Cry", BattleElement.Earth, 0, StatusEffectType.AttackUp, statOnly: true),
                Move("tailwind", "Tailwind", BattleElement.Wind, 0, StatusEffectType.SpeedUp, statOnly: true),
                Move("curse", "Curse", BattleElement.Shadow, 0, StatusEffectType.AttackDown, statOnly: true),
                Move("power_surge", "Power Surge", BattleElement.Electric, 70, oneUse: true)
            };

            return catalog;
        }

        private static BattleMoveDefinition Move(
            string id,
            string name,
            BattleElement element,
            int power,
            StatusEffectType status = StatusEffectType.Poison,
            bool withStatus = false,
            bool statusOnly = false,
            bool statOnly = false,
            bool oneUse = false)
        {
            var def = ScriptableObject.CreateInstance<BattleMoveDefinition>();
            def.MoveId = id;
            def.DisplayName = name;
            def.Element = element;
            def.Power = power;
            def.Accuracy = statusOnly ? 85 : 95;
            def.Category = power > 0 ? MoveCategory.Special : MoveCategory.Status;
            def.HasStatusEffect = statusOnly || withStatus;
            def.AppliesStatus = status;
            def.StatusDuration = status == StatusEffectType.Sleep ? 2 : 3;
            def.AppliesStatChange = statOnly;
            def.StatChange = status;
            def.OneUsePerBattle = oneUse;
            def.DamageMultiplier = oneUse ? 1.5f : 1f;
            return def;
        }
    }
}
