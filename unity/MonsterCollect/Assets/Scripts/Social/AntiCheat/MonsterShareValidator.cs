using MonsterCollect.Data;
using MonsterCollect.Monster;
using MonsterCollect.Sharing;

namespace MonsterCollect.Social
{
    public readonly struct ShareValidationResult
    {
        public bool IsValid { get; }
        public string Reason { get; }

        public ShareValidationResult(bool isValid, string reason = null)
        {
            IsValid = isValid;
            Reason = reason;
        }
    }

    /// <summary>Validates imported/shared monster snapshots for plausible stats.</summary>
    public static class MonsterShareValidator
    {
        public const int MaxStat = 999;
        public const int MinStat = 1;
        public const int MaxNameLength = 32;

        public static ShareValidationResult Validate(MonsterData monster, string canonicalPayload = null)
        {
            if (monster == null)
            {
                return new ShareValidationResult(false, "Missing monster data.");
            }

            if (string.IsNullOrEmpty(monster.Name) || monster.Name.Length > MaxNameLength)
            {
                return new ShareValidationResult(false, "Invalid monster name.");
            }

            if (monster.DexNumber < 1 || monster.DexNumber > DexCatalog.TotalEntries)
            {
                return new ShareValidationResult(false, "Invalid dex number.");
            }

            if (!IsStatInRange(monster.Hp) || !IsStatInRange(monster.Attack) ||
                !IsStatInRange(monster.Defense) || !IsStatInRange(monster.Speed))
            {
                return new ShareValidationResult(false, "Stats out of allowed range.");
            }

            int maxAllowed = GetMaxTotalStatsForRarity(monster.Rarity);
            int total = monster.Hp + monster.Attack + monster.Defense + monster.Speed;
            if (total > maxAllowed)
            {
                return new ShareValidationResult(false, "Combined stats too high for rarity.");
            }

            if (!string.IsNullOrEmpty(canonicalPayload) &&
                MonsterShareCodec.IsSharePayload(canonicalPayload) &&
                !MonsterShareIntegrity.VerifyPayload(canonicalPayload))
            {
                return new ShareValidationResult(false, "Share signature failed integrity check.");
            }

            return new ShareValidationResult(true);
        }

        private static bool IsStatInRange(int value)
        {
            return value >= MinStat && value <= MaxStat;
        }

        private static int GetMaxTotalStatsForRarity(MonsterRarity rarity)
        {
            return rarity switch
            {
                MonsterRarity.Legendary => 720,
                MonsterRarity.Epic => 620,
                MonsterRarity.Rare => 520,
                MonsterRarity.Uncommon => 420,
                _ => 360
            };
        }
    }
}
