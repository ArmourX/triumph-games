using System;
using System.Security.Cryptography;
using System.Text;
using MonsterCollect.Data;
using MonsterCollect.Events;
using MonsterCollect.Progression;
using MonsterCollect.Ranch;
using UnityEngine;

namespace MonsterCollect.Monster
{
    /// <summary>
    /// Breeding / fusion logic for combining two owned ranch monsters into a child.
    /// </summary>
    public static class MonsterBreedingService
    {
        public const int EssenceCost = 50;

        public static int CurrentEssenceCost
        {
            get
            {
                EventManager.Initialize();
                return Mathf.Max(1, EssenceCost - EventManager.GetBreedingEssenceDiscount());
            }
        }
        public const float ParentEnergyCost = 30f;
        public const float ParentMoodCost = 5f;
        public const int MaxBreedsPerDay = 2;
        public const double BreedingCooldownSeconds = 1800d; // 30 minutes
        public const int StartingRanchEssence = 100;

        private const int IdLength = 16;
        private const int StatVariance = 5;
        private const float FusionStatBonusPercent = 0.05f;

        /*
         * INHERITANCE RULES (deterministic — same parents always produce the same child)
         * --------------------------------------------------------------------------------
         *
         * 1) Identity / hash
         *    - Build a canonical fusion payload: "breed|{lowHash}|{highHash}" where parent
         *      full hashes are sorted lexicographically so A×B == B×A.
         *    - Child FullHash = SHA-256(payload). Id = first 16 hex chars of FullHash.
         *
         * 2) Dex number
         *    - Derived from child hash seed via DexCatalog.ResolveDexNumberFromHash.
         *
         * 3) Type affinities
         *    - Each parent's affinity profile contributes 50% weight, then re-normalized to 1.0.
         *    - QR captures use a single dominant species (75%) with 25% spread across others.
         *
         * 4) Species
         *    - Same-species parents → child keeps that species.
         *    - Mixed species → rng roll weighted 60% toward parent A species, 40% toward parent B
         *      (after sorting hashes, A is always the lexicographically smaller hash).
         *
         * 5) Stats (HP, ATK, DEF, SPD)
         *    - Start at integer average of both parents: (parentA + parentB) / 2.
         *    - Apply ±StatVariance jitter per stat from fusion rng.
         *    - Fusion bonus: +5% (rounded) to whichever base stat was highest on either parent.
         *    - Clamp each stat to [1, 999].
         *
         * 6) Colors
         *    - Primary   = Lerp(parentA.primary,   parentB.primary,   0.50) + hash jitter (±0.05).
         *    - Secondary = Lerp(parentA.secondary, parentB.secondary, 0.45) + hash jitter (±0.05),
         *                  biased slightly toward the higher-rarity parent.
         *
         * 7) Rarity
         *    - Base = max(parentA.rarity, parentB.rarity).
         *    - 15% seeded chance to upgrade one tier (Legendary cap).
         *
         * 8) Name
         *    - Take first 3 letters of each parent name + fusion syllable from rng
         *      (e.g. "Kor" + "Vex" → "Korvex" style).
         *
         * 9) Visual
         *    - Bred monsters use dual-blob placeholder art (see MonsterVisualBuilder).
         *    - Colors above drive the blend; parent ids are stored for preview regeneration.
         *
         * COSTS (not part of inheritance — enforced before generation)
         *    - 50 ranch essence (global currency).
         *    - 50 daily ranch energy (resets to 200 at local midnight).
         *    - 30 energy + 5 mood deducted from EACH parent.
         *    - 2 breeds/day max, 30-minute global cooldown between attempts.
         */

        public static BreedingActionResult TryBreed(MonsterData parentA, MonsterData parentB, double utcNowSeconds)
        {
            if (parentA == null || parentB == null)
            {
                return BreedingActionResult.Fail("Select two parents to breed.");
            }

            if (parentA.Id == parentB.Id)
            {
                return BreedingActionResult.Fail("A monster cannot breed with itself.");
            }

            if (MonsterCollectionService.IsFull)
            {
                return BreedingActionResult.Fail(
                    $"Ranch is full ({MonsterCollectionService.MaxRanchSlots}/{MonsterCollectionService.MaxRanchSlots}).");
            }

            MonsterRaisingService.EnsureRaisingState(parentA);
            MonsterRaisingService.EnsureRaisingState(parentB);
            ResetDailyBreedingCountersIfNeeded(utcNowSeconds);

            if (MonsterCollectionService.BreedsToday >= MaxBreedsPerDay)
            {
                return BreedingActionResult.Fail($"Breeding limit reached ({MaxBreedsPerDay}/day).");
            }

            double cooldown = GetBreedingCooldownRemaining(utcNowSeconds);
            if (cooldown > 0d)
            {
                int minutes = (int)Math.Ceiling(cooldown / 60d);
                return BreedingActionResult.Fail($"Breeding cooldown: {minutes}m remaining.");
            }

            if (MonsterCollectionService.RanchEssence < CurrentEssenceCost)
            {
                return BreedingActionResult.Fail($"Need {CurrentEssenceCost} essence (have {MonsterCollectionService.RanchEssence}).");
            }

            if (!RanchEnergyService.CanAfford(RanchEnergyService.BreedCost, out string energyMessage))
            {
                return BreedingActionResult.Fail(energyMessage);
            }

            if (!LifespanRetirementService.IsRetired(parentA) && parentA.Raising.energy < ParentEnergyCost)
            {
                return BreedingActionResult.Fail("Parent A needs at least 30 energy.");
            }

            if (!LifespanRetirementService.IsRetired(parentB) && parentB.Raising.energy < ParentEnergyCost)
            {
                return BreedingActionResult.Fail("Parent B needs at least 30 energy.");
            }

            MonsterData offspring = GenerateOffspring(parentA, parentB);

            if (MonsterCollectionService.ContainsHash(offspring.FullHash))
            {
                return BreedingActionResult.Fail("This fusion already exists in your ranch.");
            }

            if (!MonsterCollectionService.TrySpendEssence(CurrentEssenceCost))
            {
                return BreedingActionResult.Fail("Not enough essence.");
            }

            if (!MonsterCollectionService.TryAddMonster(offspring, out string addError))
            {
                MonsterCollectionService.AddEssence(CurrentEssenceCost);
                return BreedingActionResult.Fail(addError);
            }

            if (!RanchEnergyService.TrySpend(RanchEnergyService.BreedCost, out string spendMessage))
            {
                MonsterCollectionService.TryRemoveMonster(offspring.Id, out _);
                MonsterCollectionService.AddEssence(CurrentEssenceCost);
                return BreedingActionResult.Fail(spendMessage);
            }

            ApplyParentBreedingCosts(parentA, utcNowSeconds);
            ApplyParentBreedingCosts(parentB, utcNowSeconds);
            MonsterCollectionService.UpdateMonster(parentA);
            MonsterCollectionService.UpdateMonster(parentB);
            MonsterCollectionService.RecordBreeding(utcNowSeconds);
            ProgressionEventReporter.ReportMonsterBred(offspring);

            return BreedingActionResult.Ok($"Fusion success! {offspring.Name} joined the ranch.", offspring);
        }

        public static MonsterData GeneratePreview(MonsterData parentA, MonsterData parentB)
        {
            if (parentA == null || parentB == null || parentA.Id == parentB.Id)
            {
                return null;
            }

            return GenerateOffspring(parentA, parentB);
        }

        public static MonsterData GenerateOffspring(MonsterData parentA, MonsterData parentB)
        {
            string parentAId = parentA.Id;
            string parentBId = parentB.Id;
            OrderParentsByHash(ref parentA, ref parentB, out string hashLow, out string hashHigh);

            string payload = $"breed|{hashLow}|{hashHigh}";
            byte[] hash = ComputeSha256(payload);
            string fullHash = BytesToHex(hash);
            string id = fullHash.Substring(0, IdLength);
            var rng = new System.Random(MonsterProceduralTraits.SeedFromHashBytes(hash));

            MonsterTypeAffinities parentAffinitiesA = parentA.GetTypeAffinities();
            MonsterTypeAffinities parentAffinitiesB = parentB.GetTypeAffinities();
            MonsterTypeAffinities childAffinities = MonsterTypeAffinities.Blend(parentAffinitiesA, parentAffinitiesB);

            MonsterSpecies childSpecies = ResolveChildSpecies(parentA, parentB, rng);
            MonsterRarity childRarity = ResolveChildRarity(parentA, parentB, rng);

            int hp = BlendStat(parentA.Hp, parentB.Hp, rng);
            int attack = BlendStat(parentA.Attack, parentB.Attack, rng);
            int defense = BlendStat(parentA.Defense, parentB.Defense, rng);
            int speed = BlendStat(parentA.Speed, parentB.Speed, rng);
            ApplyFusionStatBonus(parentA, parentB, ref hp, ref attack, ref defense, ref speed);
            ApplyRetirementBreedingBonus(parentA, parentB, ref hp, ref attack, ref defense, ref speed);

            Color primary = BlendColor(parentA.PrimaryColor, parentB.PrimaryColor, 0.5f, rng);
            Color secondary = BlendColor(
                parentA.SecondaryColor,
                parentB.SecondaryColor,
                parentA.Rarity >= parentB.Rarity ? 0.4f : 0.55f,
                rng);

            int dexNumber = DexCatalog.ResolveDexNumberFromHash(hash);

            return new MonsterData
            {
                Id = id,
                FullHash = fullHash,
                DexNumber = dexNumber,
                Name = BuildFusionName(parentA, parentB, rng),
                Species = childSpecies,
                Hp = hp,
                Attack = attack,
                Defense = defense,
                Speed = speed,
                PrimaryColor = primary,
                SecondaryColor = secondary,
                Rarity = childRarity,
                SourceQrContent = string.Empty,
                TypeAffinities = childAffinities,
                ParentAId = parentAId,
                ParentBId = parentBId,
                IsBred = true,
                BaseFormHash = fullHash,
                Raising = MonsterRaisingState.CreateDefault()
            };
        }

        public static double GetBreedingCooldownRemaining(double utcNowSeconds)
        {
            double last = MonsterCollectionService.LastBreedUtc;
            double remaining = BreedingCooldownSeconds - (utcNowSeconds - last);
            return remaining > 0d ? remaining : 0d;
        }

        private static void OrderParentsByHash(
            ref MonsterData parentA,
            ref MonsterData parentB,
            out string hashLow,
            out string hashHigh)
        {
            string hashA = MonsterEvolutionService.GetBreedingIdentityHash(parentA);
            string hashB = MonsterEvolutionService.GetBreedingIdentityHash(parentB);
            if (string.CompareOrdinal(hashA, hashB) <= 0)
            {
                hashLow = hashA;
                hashHigh = hashB;
                return;
            }

            hashLow = hashB;
            hashHigh = hashA;
            (parentA, parentB) = (parentB, parentA);
        }

        private static MonsterSpecies ResolveChildSpecies(MonsterData parentA, MonsterData parentB, System.Random rng)
        {
            if (parentA.Species == parentB.Species)
            {
                return parentA.Species;
            }

            TypeCombinationDefinition combo = GameContentRegistry.TypeCombinations.Find(parentA.Species, parentB.Species);
            if (combo != null)
            {
                int threshold = Mathf.RoundToInt(combo.OffspringWeight * 100f);
                return rng.Next(100) < threshold ? combo.PreferredOffspring : parentA.Species;
            }

            return rng.Next(100) < 60 ? parentA.Species : parentB.Species;
        }

        private static MonsterRarity ResolveChildRarity(MonsterData parentA, MonsterData parentB, System.Random rng)
        {
            MonsterRarity baseRarity = parentA.Rarity >= parentB.Rarity ? parentA.Rarity : parentB.Rarity;

            if (rng.Next(100) >= 15)
            {
                return baseRarity;
            }

            return UpgradeRarity(baseRarity);
        }

        private static MonsterRarity UpgradeRarity(MonsterRarity rarity)
        {
            return rarity switch
            {
                MonsterRarity.Common => MonsterRarity.Uncommon,
                MonsterRarity.Uncommon => MonsterRarity.Rare,
                MonsterRarity.Rare => MonsterRarity.Epic,
                MonsterRarity.Epic => MonsterRarity.Legendary,
                _ => MonsterRarity.Legendary
            };
        }

        private static int BlendStat(int statA, int statB, System.Random rng)
        {
            int average = (statA + statB) / 2;
            int jitter = rng.Next(-StatVariance, StatVariance + 1);
            return Mathf.Clamp(average + jitter, 1, 999);
        }

        private static void ApplyFusionStatBonus(
            MonsterData parentA,
            MonsterData parentB,
            ref int hp,
            ref int attack,
            ref int defense,
            ref int speed)
        {
            int bestValue = -1;
            int bestStatIndex = 0;

            Consider(parentA.Hp, 0);
            Consider(parentB.Hp, 0);
            Consider(parentA.Attack, 1);
            Consider(parentB.Attack, 1);
            Consider(parentA.Defense, 2);
            Consider(parentB.Defense, 2);
            Consider(parentA.Speed, 3);
            Consider(parentB.Speed, 3);

            switch (bestStatIndex)
            {
                case 0: hp = ApplyPercentBonus(hp); break;
                case 1: attack = ApplyPercentBonus(attack); break;
                case 2: defense = ApplyPercentBonus(defense); break;
                default: speed = ApplyPercentBonus(speed); break;
            }

            void Consider(int value, int statIndex)
            {
                if (value > bestValue)
                {
                    bestValue = value;
                    bestStatIndex = statIndex;
                }
            }
        }

        private static int ApplyPercentBonus(int stat)
        {
            return Mathf.Clamp(Mathf.RoundToInt(stat * (1f + FusionStatBonusPercent)), 1, 999);
        }

        private static Color BlendColor(Color colorA, Color colorB, float t, System.Random rng)
        {
            Color blended = Color.Lerp(colorA, colorB, t);
            float jitterR = (rng.Next(-5, 6) / 100f);
            float jitterG = (rng.Next(-5, 6) / 100f);
            float jitterB = (rng.Next(-5, 6) / 100f);

            return new Color(
                Mathf.Clamp01(blended.r + jitterR),
                Mathf.Clamp01(blended.g + jitterG),
                Mathf.Clamp01(blended.b + jitterB),
                1f);
        }

        private static string BuildFusionName(MonsterData parentA, MonsterData parentB, System.Random rng)
        {
            string fragmentA = GetNameFragment(parentA.Name);
            string fragmentB = GetNameFragment(parentB.Name);
            string syllable = MonsterProceduralTraits.Syllables[rng.Next(MonsterProceduralTraits.Syllables.Length)];
            string raw = fragmentA + fragmentB + syllable;
            return char.ToUpper(raw[0]) + raw.Substring(1);
        }

        private static string GetNameFragment(string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return "mon";
            }

            int length = Mathf.Min(3, name.Length);
            return name.Substring(0, length).ToLowerInvariant();
        }

        private static void ApplyParentBreedingCosts(MonsterData parent, double utcNowSeconds)
        {
            if (LifespanRetirementService.IsRetired(parent))
            {
                return;
            }

            parent.Raising.energy = Mathf.Max(0f, parent.Raising.energy - ParentEnergyCost);
            parent.Raising.mood = Mathf.Max(0f, parent.Raising.mood - ParentMoodCost);
            parent.Raising.lastSimulatedUtc = utcNowSeconds;
        }

        private static void ApplyRetirementBreedingBonus(
            MonsterData parentA,
            MonsterData parentB,
            ref int hp,
            ref int attack,
            ref int defense,
            ref int speed)
        {
            float bonus = LifespanRetirementService.GetCombinedParentBreedingBonus(parentA, parentB);
            if (bonus <= 0f)
            {
                return;
            }

            hp += Math.Max(1, (int)Math.Round(hp * bonus));
            attack += Math.Max(1, (int)Math.Round(attack * bonus));
            defense += Math.Max(1, (int)Math.Round(defense * bonus));
            speed += Math.Max(1, (int)Math.Round(speed * bonus));
        }

        private static void ResetDailyBreedingCountersIfNeeded(double utcNowSeconds)
        {
            string today = DateTimeOffset.FromUnixTimeSeconds((long)utcNowSeconds).UtcDateTime.ToString("yyyy-MM-dd");

            if (MonsterCollectionService.LastBreedDayKey == today)
            {
                return;
            }

            MonsterCollectionService.ResetDailyBreedingCounters(today);
        }

        private static byte[] ComputeSha256(string content)
        {
            using SHA256 sha = SHA256.Create();
            return sha.ComputeHash(Encoding.UTF8.GetBytes(content));
        }

        private static string BytesToHex(byte[] bytes)
        {
            var builder = new StringBuilder(bytes.Length * 2);

            foreach (byte b in bytes)
            {
                builder.Append(b.ToString("x2"));
            }

            return builder.ToString();
        }
    }

    public readonly struct BreedingActionResult
    {
        public bool Success { get; }
        public string Message { get; }
        public MonsterData Offspring { get; }

        public BreedingActionResult(bool success, string message, MonsterData offspring = null)
        {
            Success = success;
            Message = message;
            Offspring = offspring;
        }

        public static BreedingActionResult Fail(string message) => new BreedingActionResult(false, message);
        public static BreedingActionResult Ok(string message, MonsterData offspring) =>
            new BreedingActionResult(true, message, offspring);
    }
}
