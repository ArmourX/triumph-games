using System;
using System.Security.Cryptography;
using System.Text;
using MonsterCollect.Monster;
using MonsterCollect.QR;
using MonsterCollect.Social;
using UnityEngine;

namespace MonsterCollect.Sharing
{
    /// <summary>
    /// Encodes / decodes exact monster snapshots for QR sharing.
    ///
    /// COPY RULES (documented for designers & engineers):
    /// - A share QR contains a frozen snapshot of stats, colors, species, rarity, and affinities.
    /// - Scanning creates a COPY on the recipient's ranch; the original owner keeps their monster.
    /// - Care / raising progress is NOT transferred — imported copies start with fresh meters.
    /// - Each player can import a given share payload only once (dedup via deterministic import hash).
    /// - Payload prefix: MONSTER:SHARE: + Base64(JSON). Optional HMAC signature suffix.
    /// </summary>
    public static class MonsterShareCodec
    {
        public const string SharePrefix = "MONSTER:SHARE:";
        public const int CurrentVersion = 2;

        [Serializable]
        private class MonsterSharePayload
        {
            public int v = CurrentVersion;
            public string n;
            public int d;
            public int sp;
            public int r;
            public int hp;
            public int atk;
            public int def;
            public int spd;
            public float pR;
            public float pG;
            public float pB;
            public float sR;
            public float sG;
            public float sB;
            public float[] aff;
            public bool bred;
            public string src;
            public int lvl;
            public string owner;
        }

        public static string Encode(MonsterData monster, bool sign = true)
        {
            if (monster == null)
            {
                throw new ArgumentNullException(nameof(monster));
            }

            MonsterRaisingService.EnsureRaisingState(monster);
            MonsterTypeAffinities affinities = monster.GetTypeAffinities();
            var payload = new MonsterSharePayload
            {
                v = CurrentVersion,
                n = monster.Name,
                d = monster.DexNumber,
                sp = (int)monster.Species,
                r = (int)monster.Rarity,
                hp = monster.Hp,
                atk = monster.Attack,
                def = monster.Defense,
                spd = monster.Speed,
                pR = monster.PrimaryColor.r,
                pG = monster.PrimaryColor.g,
                pB = monster.PrimaryColor.b,
                sR = monster.SecondaryColor.r,
                sG = monster.SecondaryColor.g,
                sB = monster.SecondaryColor.b,
                aff = AffinitiesToArray(affinities),
                bred = monster.IsBred,
                src = monster.FullHash,
                lvl = monster.Raising.level,
                owner = SocialProfileService.GetShareOwnerTag()
            };

            string json = JsonUtility.ToJson(payload);
            string encoded = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
            string raw = SharePrefix + encoded;
            return sign ? MonsterShareIntegrity.AppendSignature(raw) : raw;
        }

        public static bool IsSharePayload(string extractedPayload)
        {
            if (string.IsNullOrEmpty(extractedPayload))
            {
                return false;
            }

            string body = MonsterShareIntegrity.StripSignature(extractedPayload);
            return body.StartsWith(SharePrefix, StringComparison.Ordinal);
        }

        public static bool TryDecode(string extractedPayload, out MonsterData monster, out string importHash)
        {
            monster = null;
            importHash = null;

            if (string.IsNullOrEmpty(extractedPayload))
            {
                return false;
            }

            string signed = extractedPayload;
            string body = MonsterShareIntegrity.StripSignature(signed);

            if (!body.StartsWith(SharePrefix, StringComparison.Ordinal))
            {
                return false;
            }

            if (!MonsterShareIntegrity.VerifyPayload(signed))
            {
                return false;
            }

            string encoded = body.Substring(SharePrefix.Length);

            try
            {
                string json = Encoding.UTF8.GetString(Convert.FromBase64String(encoded));
                var payload = JsonUtility.FromJson<MonsterSharePayload>(json);

                if (payload == null || string.IsNullOrEmpty(payload.n))
                {
                    return false;
                }

                if (payload.v != CurrentVersion && payload.v != 1)
                {
                    return false;
                }

                importHash = ComputeImportHash(body);
                monster = ToMonsterData(payload, importHash);

                ShareValidationResult validation = MonsterShareValidator.Validate(monster, signed);
                if (!validation.IsValid)
                {
                    Debug.LogWarning($"[MonsterShareCodec] Share rejected: {validation.Reason}");
                    monster = null;
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[MonsterShareCodec] Failed to decode share payload: {ex.Message}");
                return false;
            }
        }

        public static string ComputeImportHash(string canonicalSharePayload)
        {
            using SHA256 sha = SHA256.Create();
            byte[] hash = sha.ComputeHash(Encoding.UTF8.GetBytes("shareimport|" + canonicalSharePayload));
            return BytesToHex(hash);
        }

        private static MonsterData ToMonsterData(MonsterSharePayload payload, string importHash)
        {
            var affinities = ArrayToAffinities(payload.aff);
            affinities.Normalize();

            MonsterRaisingState raising = MonsterRaisingState.CreateDefault();
            if (payload.v >= 2 && payload.lvl > 1)
            {
                raising.level = Mathf.Clamp(payload.lvl, 1, 99);
            }

            return new MonsterData
            {
                Id = importHash.Substring(0, Mathf.Min(16, importHash.Length)),
                FullHash = importHash,
                DexNumber = payload.d,
                Name = payload.n,
                Species = (MonsterSpecies)Mathf.Clamp(payload.sp, 0, 7),
                Rarity = (MonsterRarity)Mathf.Clamp(payload.r, 0, 4),
                Hp = payload.hp,
                Attack = payload.atk,
                Defense = payload.def,
                Speed = payload.spd,
                PrimaryColor = new Color(payload.pR, payload.pG, payload.pB, 1f),
                SecondaryColor = new Color(payload.sR, payload.sG, payload.sB, 1f),
                TypeAffinities = affinities,
                IsBred = payload.bred,
                SourceQrContent = string.Empty,
                ParentAId = string.Empty,
                ParentBId = string.Empty,
                Raising = raising
            };
        }

        private static float[] AffinitiesToArray(MonsterTypeAffinities affinities)
        {
            return new[]
            {
                affinities.beast,
                affinities.dragon,
                affinities.slime,
                affinities.elemental,
                affinities.spirit,
                affinities.insect,
                affinities.aquatic,
                affinities.undead
            };
        }

        private static MonsterTypeAffinities ArrayToAffinities(float[] values)
        {
            var affinities = new MonsterTypeAffinities();

            if (values == null || values.Length < 8)
            {
                return affinities;
            }

            affinities.beast = values[0];
            affinities.dragon = values[1];
            affinities.slime = values[2];
            affinities.elemental = values[3];
            affinities.spirit = values[4];
            affinities.insect = values[5];
            affinities.aquatic = values[6];
            affinities.undead = values[7];
            return affinities;
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
}
