using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using MonsterCollect.Appearance;
using UnityEngine;

namespace MonsterCollect.Social
{
    [Serializable]
    public class CommunityPartMod
    {
        public string id = string.Empty;
        public string displayName = string.Empty;
        public string slot = "Accessory";
        public string shape = "AccessoryCrown";
        public float tintR = 1f;
        public float tintG = 1f;
        public float tintB = 1f;
        public string pngFile = string.Empty;
    }

    /// <summary>
    /// Sandboxed custom accessory import. Only JSON + optional tiny PNG from persistentDataPath/QRmonMods.
    /// No code, no network, accessory slot only.
    /// </summary>
    public static class CommunityPartModService
    {
        public const int MaxPngBytes = 64 * 1024;
        public const int MaxPngSize = 128;
        private static readonly Regex IdPattern = new Regex(@"^mod_[a-z0-9_]{2,24}$", RegexOptions.Compiled);

        private static readonly Dictionary<string, MonsterPartVariantDefinition> RuntimeVariants =
            new Dictionary<string, MonsterPartVariantDefinition>();
        private static readonly List<CommunityPartMod> LoadedMods = new List<CommunityPartMod>();
        private static bool scanned;

        public static string ModsFolder => Path.Combine(Application.persistentDataPath, "QRmonMods");

        public static IReadOnlyList<CommunityPartMod> Mods
        {
            get
            {
                EnsureScanned();
                return LoadedMods;
            }
        }

        public static bool IsLoadedMod(string variantId)
        {
            EnsureScanned();
            return !string.IsNullOrEmpty(variantId) && RuntimeVariants.ContainsKey(variantId);
        }

        public static MonsterPartVariantDefinition TryGetRuntimeVariant(string variantId)
        {
            EnsureScanned();
            if (string.IsNullOrEmpty(variantId))
            {
                return null;
            }

            RuntimeVariants.TryGetValue(variantId, out MonsterPartVariantDefinition variant);
            return variant;
        }

        public static void Rescan()
        {
            scanned = false;
            EnsureScanned();
        }

        public static string WriteExamplePack()
        {
            Directory.CreateDirectory(ModsFolder);
            string jsonPath = Path.Combine(ModsFolder, "mod_star_pin.json");
            var example = new CommunityPartMod
            {
                id = "mod_star_pin",
                displayName = "Star Pin",
                slot = "Accessory",
                shape = "AccessoryCrown",
                tintR = 1f,
                tintG = 0.84f,
                tintB = 0.2f
            };

            File.WriteAllText(jsonPath, JsonUtility.ToJson(example, true));
            string readme = Path.Combine(ModsFolder, "README.txt");
            File.WriteAllText(readme,
                "QRmon sandboxed mods\n" +
                "- JSON only, optional PNG next to it.\n" +
                "- id must look like mod_star_pin\n" +
                "- slot must be Accessory\n" +
                "- shape must be AccessoryHorn, AccessoryWings, or AccessoryCrown\n" +
                "- PNG max 128x128 and 64KB. No scripts or URLs.\n");
            Rescan();
            return ModsFolder;
        }

        private static void EnsureScanned()
        {
            if (scanned)
            {
                return;
            }

            scanned = true;
            LoadedMods.Clear();
            RuntimeVariants.Clear();
            Directory.CreateDirectory(ModsFolder);

            string[] files;
            try
            {
                files = Directory.GetFiles(ModsFolder, "*.json");
            }
            catch (Exception)
            {
                return;
            }

            for (int i = 0; i < files.Length; i++)
            {
                TryLoadMod(files[i]);
            }
        }

        private static void TryLoadMod(string jsonPath)
        {
            string json;
            try
            {
                json = File.ReadAllText(jsonPath);
            }
            catch (Exception)
            {
                return;
            }

            CommunityPartMod mod;
            try
            {
                mod = JsonUtility.FromJson<CommunityPartMod>(json);
            }
            catch (Exception)
            {
                return;
            }

            if (mod == null || !IdPattern.IsMatch(mod.id ?? string.Empty))
            {
                return;
            }

            if (!string.Equals(mod.slot, "Accessory", StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            if (!Enum.TryParse(mod.shape, true, out MonsterPartShapeKind shape) ||
                (shape != MonsterPartShapeKind.AccessoryHorn &&
                 shape != MonsterPartShapeKind.AccessoryWings &&
                 shape != MonsterPartShapeKind.AccessoryCrown))
            {
                return;
            }

            var variant = ScriptableObject.CreateInstance<MonsterPartVariantDefinition>();
            variant.VariantId = mod.id;
            variant.Slot = MonsterPartSlot.Accessory;
            variant.SortOrder = 28;
            variant.Shape = shape;
            variant.TintMode = PartTintMode.Accent;
            variant.LocalScale = Vector2.one;

            Sprite pngSprite = TryLoadPng(Path.GetDirectoryName(jsonPath), mod.pngFile);
            if (pngSprite != null)
            {
                variant.SpriteOverride = pngSprite;
            }

            RuntimeVariants[mod.id] = variant;
            LoadedMods.Add(mod);
        }

        private static Sprite TryLoadPng(string folder, string fileName)
        {
            if (string.IsNullOrWhiteSpace(folder) || string.IsNullOrWhiteSpace(fileName))
            {
                return null;
            }

            fileName = Path.GetFileName(fileName);
            if (!fileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            string path = Path.Combine(folder, fileName);
            if (!File.Exists(path))
            {
                return null;
            }

            byte[] bytes;
            try
            {
                bytes = File.ReadAllBytes(path);
            }
            catch (Exception)
            {
                return null;
            }

            if (bytes.Length == 0 || bytes.Length > MaxPngBytes || !IsPng(bytes))
            {
                return null;
            }

            var texture = new Texture2D(2, 2, TextureFormat.RGBA32, false);
            if (!texture.LoadImage(bytes, markNonReadable: true))
            {
                UnityEngine.Object.Destroy(texture);
                return null;
            }

            if (texture.width > MaxPngSize || texture.height > MaxPngSize)
            {
                UnityEngine.Object.Destroy(texture);
                return null;
            }

            texture.filterMode = FilterMode.Point;
            return Sprite.Create(
                texture,
                new Rect(0f, 0f, texture.width, texture.height),
                new Vector2(0.5f, 0.5f),
                100f);
        }

        private static bool IsPng(byte[] bytes)
        {
            return bytes.Length >= 8 &&
                   bytes[0] == 0x89 &&
                   bytes[1] == 0x50 &&
                   bytes[2] == 0x4E &&
                   bytes[3] == 0x47;
        }
    }
}
