using System.Collections.Generic;
using MonsterCollect.Monster;
using UnityEngine;

namespace MonsterCollect.Appearance
{
    /// <summary>Shared sprite cache for part variants (procedural or authored).</summary>
    public static class MonsterPartSpriteCache
    {
        private const int PartTextureSize = 128;
        private static readonly Dictionary<string, Sprite> SpriteCache = new Dictionary<string, Sprite>();

        public static Sprite GetSprite(MonsterPartVariantDefinition variant)
        {
            if (variant == null)
            {
                return null;
            }

            if (variant.SpriteOverride != null)
            {
                return variant.SpriteOverride;
            }

            if (variant.IsEmptyShape)
            {
                return null;
            }

            string key = variant.VariantId;
            if (SpriteCache.TryGetValue(key, out Sprite cached))
            {
                return cached;
            }

            Texture2D texture = ProceduralPartSpriteGenerator.Generate(variant.Shape, PartTextureSize);
            Sprite sprite = Sprite.Create(
                texture,
                new Rect(0f, 0f, PartTextureSize, PartTextureSize),
                new Vector2(0.5f, 0.5f),
                PartTextureSize);

            SpriteCache[key] = sprite;
            return sprite;
        }

        public static Color ResolveTint(MonsterPartVariantDefinition variant, MonsterData data)
        {
            if (variant == null || data == null)
            {
                return Color.white;
            }

            Color accent = Color.Lerp(data.GetDisplaySecondaryColor(), Color.white, 0.25f);

            return variant.TintMode switch
            {
                PartTintMode.Primary => data.GetDisplayPrimaryColor(),
                PartTintMode.Secondary => data.GetDisplaySecondaryColor(),
                PartTintMode.Accent => accent,
                PartTintMode.None => Color.white,
                _ => data.GetDisplayPrimaryColor()
            };
        }
    }
}
