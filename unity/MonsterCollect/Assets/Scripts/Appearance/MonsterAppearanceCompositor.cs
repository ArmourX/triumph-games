using System.Collections.Generic;
using MonsterCollect.Monster;
using UnityEngine;

namespace MonsterCollect.Appearance
{
    /// <summary>
    /// Bakes layered part sprites into a single portrait texture with global caching for mobile performance.
    /// </summary>
    public static class MonsterAppearanceCompositor
    {
        private const int MaxCacheEntries = 96;
        private static readonly Dictionary<string, Texture2D> TextureCache = new Dictionary<string, Texture2D>();
        private static readonly Dictionary<string, Sprite> SpriteCache = new Dictionary<string, Sprite>();
        private static readonly LinkedList<string> CacheOrder = new LinkedList<string>();

        public static Texture2D GetOrCreatePortrait(MonsterData data, int size = 256)
        {
            if (data == null)
            {
                return CreateBlank(size);
            }

            if (QrmonPortraitProvider.IsAvailable)
            {
                Texture2D qrmonPortrait = QrmonPortraitProvider.GetPortrait(data, size);
                if (qrmonPortrait != null)
                {
                    return qrmonPortrait;
                }
            }

            string key = BuildCacheKey(data, size);
            if (TextureCache.TryGetValue(key, out Texture2D cached))
            {
                TouchCache(key);
                return cached;
            }

            Texture2D baked = BakePortrait(data, size);
            AddToCache(key, baked);
            return baked;
        }

        public static Sprite GetOrCreatePortraitSprite(MonsterData data, int size = 256)
        {
            if (data == null)
            {
                return null;
            }

            string key = BuildCacheKey(data, size);
            if (SpriteCache.TryGetValue(key, out Sprite cachedSprite))
            {
                TouchCache(key);
                return cachedSprite;
            }

            Texture2D texture = GetOrCreatePortrait(data, size);
            cachedSprite = Sprite.Create(
                texture,
                new Rect(0f, 0f, texture.width, texture.height),
                new Vector2(0.5f, 0.5f),
                size);
            SpriteCache[key] = cachedSprite;
            return cachedSprite;
        }

        public static bool IsCachedTexture(Texture2D texture)
        {
            if (texture == null)
            {
                return false;
            }

            foreach (Texture2D cached in TextureCache.Values)
            {
                if (cached == texture)
                {
                    return true;
                }
            }

            return false;
        }

        public static void ClearCache()
        {
            foreach (Sprite sprite in SpriteCache.Values)
            {
                if (sprite != null)
                {
                    Object.Destroy(sprite);
                }
            }

            foreach (Texture2D texture in TextureCache.Values)
            {
                if (texture != null)
                {
                    Object.Destroy(texture);
                }
            }

            SpriteCache.Clear();
            TextureCache.Clear();
            CacheOrder.Clear();
            QrmonPortraitProvider.ClearCache();
        }

        private static Texture2D BakePortrait(MonsterData data, int size)
        {
            MonsterAppearanceSelection selection = data.GetAppearanceSelection();
            MonsterPartCatalog catalog = MonsterAppearanceResolver.Catalog;
            var texture = CreateBlank(size);

            var layers = BuildLayerList(catalog, selection, data);
            float scaleFactor = size / 128f;

            for (int i = 0; i < layers.Count; i++)
            {
                LayerDrawInfo layer = layers[i];
                if (layer.Sprite == null)
                {
                    continue;
                }

                DrawSpriteLayer(texture, size, layer, scaleFactor);
            }

            ApplyRarityEffects(texture, size, data);
            texture.Apply();
            return texture;
        }

        internal static List<LayerDrawInfo> BuildLayerList(
            MonsterPartCatalog catalog,
            MonsterAppearanceSelection selection,
            MonsterData data)
        {
            var layers = new List<LayerDrawInfo>(8);
            if (catalog == null || selection == null)
            {
                return layers;
            }

            MonsterPartSlot[] slots =
            {
                MonsterPartSlot.Body,
                MonsterPartSlot.ArmsLegs,
                MonsterPartSlot.Tail,
                MonsterPartSlot.Head,
                MonsterPartSlot.Eyes,
                MonsterPartSlot.PatternOverlay,
                MonsterPartSlot.Accessory
            };

            for (int i = 0; i < slots.Length; i++)
            {
                string variantId = selection.GetVariantId(slots[i]);
                MonsterPartVariantDefinition variant = catalog.FindById(variantId);
                if (variant == null)
                {
                    variant = MonsterCollect.Social.CommunityPartModService.TryGetRuntimeVariant(variantId);
                }
                if (variant == null || variant.IsEmptyShape)
                {
                    continue;
                }

                Sprite sprite = MonsterPartSpriteCache.GetSprite(variant);
                if (sprite == null)
                {
                    continue;
                }

                layers.Add(new LayerDrawInfo
                {
                    Sprite = sprite,
                    Tint = MonsterPartSpriteCache.ResolveTint(variant, data),
                    Offset = variant.LocalOffset,
                    Scale = variant.LocalScale,
                    SortOrder = variant.SortOrder
                });
            }

            layers.Sort((a, b) => a.SortOrder.CompareTo(b.SortOrder));
            return layers;
        }

        private static void DrawSpriteLayer(Texture2D target, int size, LayerDrawInfo layer, float scaleFactor)
        {
            Texture2D source = layer.Sprite.texture;
            Rect rect = layer.Sprite.textureRect;
            int srcW = Mathf.RoundToInt(rect.width);
            int srcH = Mathf.RoundToInt(rect.height);

            float drawW = srcW * layer.Scale.x * scaleFactor;
            float drawH = srcH * layer.Scale.y * scaleFactor;
            float offsetX = layer.Offset.x * scaleFactor;
            float offsetY = layer.Offset.y * scaleFactor;
            float originX = size * 0.5f - drawW * 0.5f + offsetX;
            float originY = size * 0.5f - drawH * 0.5f + offsetY;

            Color[] targetPixels = target.GetPixels();
            int srcXMin = (int)rect.x;
            int srcYMin = (int)rect.y;
            int srcXMax = (int)rect.xMax - 1;
            int srcYMax = (int)rect.yMax - 1;

            for (int y = 0; y < size; y++)
            {
                float v = (y - originY) / drawH;
                if (v < 0f || v > 1f)
                {
                    continue;
                }

                int sy = Mathf.Clamp(Mathf.FloorToInt(srcYMin + v * srcH), srcYMin, srcYMax);

                for (int x = 0; x < size; x++)
                {
                    float u = (x - originX) / drawW;
                    if (u < 0f || u > 1f)
                    {
                        continue;
                    }

                    int sx = Mathf.Clamp(Mathf.FloorToInt(srcXMin + u * srcW), srcXMin, srcXMax);
                    Color sample = source.GetPixel(sx, sy);
                    if (sample.a <= 0.01f)
                    {
                        continue;
                    }

                    Color tinted = new Color(
                        sample.r * layer.Tint.r,
                        sample.g * layer.Tint.g,
                        sample.b * layer.Tint.b,
                        sample.a);

                    int index = y * size + x;
                    targetPixels[index] = Color.Lerp(targetPixels[index], tinted, tinted.a);
                }
            }

            target.SetPixels(targetPixels);
        }

        private static void ApplyRarityEffects(Texture2D texture, int size, MonsterData data)
        {
            MonsterRarityVisualEffects.Profile profile = MonsterRarityVisualEffects.GetProfile(data.Rarity);
            if (profile.OutlineThickness <= 0f && profile.GlowStrength <= 0f)
            {
                return;
            }

            Color glowColor = MonsterRarityVisualEffects.GetGlowColor(data);
            var original = texture.GetPixels();
            var outline = new Color[size * size];

            for (int y = 0; y < size; y++)
            {
                for (int x = 0; x < size; x++)
                {
                    int index = y * size + x;
                    Color pixel = original[index];
                    if (pixel.a <= 0.05f)
                    {
                        continue;
                    }

                    float thickness = profile.OutlineThickness;
                    bool border = false;

                    for (int oy = -1; oy <= 1 && !border; oy++)
                    {
                        for (int ox = -1; ox <= 1; ox++)
                        {
                            int nx = x + ox;
                            int ny = y + oy;
                            if (nx < 0 || ny < 0 || nx >= size || ny >= size)
                            {
                                border = true;
                                break;
                            }

                            if (original[ny * size + nx].a <= 0.05f)
                            {
                                border = true;
                                break;
                            }
                        }
                    }

                    if (border && thickness > 0f)
                    {
                        outline[index] = Color.Lerp(Color.clear, glowColor, 0.85f);
                    }
                }
            }

            for (int i = 0; i < original.Length; i++)
            {
                Color combined = original[i];
                combined = Color.Lerp(combined, outline[i], outline[i].a);

                if (profile.GlowStrength > 0f && combined.a > 0.05f)
                {
                    combined = Color.Lerp(combined, glowColor, profile.GlowStrength * combined.a);
                }

                texture.SetPixel(i % size, i / size, combined);
            }
        }

        private const int PortraitBakeVersion = 2;

        private static string BuildCacheKey(MonsterData data, int size)
        {
            MonsterAppearanceSelection selection = data.GetAppearanceSelection();
            Color primary = data.GetDisplayPrimaryColor();
            Color secondary = data.GetDisplaySecondaryColor();

            return string.Concat(
                "v", PortraitBakeVersion, "|",
                data.FullHash ?? data.Id ?? data.DexNumber.ToString(),
                "|", size,
                "|", data.EvolutionStage,
                "|", (int)data.Rarity,
                "|", selection.BodyVariantId,
                "|", selection.HeadVariantId,
                "|", selection.ArmsLegsVariantId,
                "|", selection.TailVariantId,
                "|", selection.EyesVariantId,
                "|", selection.PatternVariantId,
                "|", selection.AccessoryVariantId,
                "|", primary.r.ToString("F2"), primary.g.ToString("F2"), primary.b.ToString("F2"),
                "|", secondary.r.ToString("F2"), secondary.g.ToString("F2"), secondary.b.ToString("F2"));
        }

        private static Texture2D CreateBlank(int size)
        {
            var texture = new Texture2D(size, size, TextureFormat.RGBA32, false)
            {
                filterMode = FilterMode.Bilinear,
                wrapMode = TextureWrapMode.Clamp
            };

            var clear = new Color[size * size];
            for (int i = 0; i < clear.Length; i++)
            {
                clear[i] = Color.clear;
            }

            texture.SetPixels(clear);
            texture.Apply();
            return texture;
        }

        private static void AddToCache(string key, Texture2D texture)
        {
            if (TextureCache.ContainsKey(key))
            {
                return;
            }

            TextureCache[key] = texture;
            CacheOrder.AddFirst(key);

            while (CacheOrder.Count > MaxCacheEntries)
            {
                string oldest = CacheOrder.Last.Value;
                CacheOrder.RemoveLast();

                if (TextureCache.TryGetValue(oldest, out Texture2D oldTexture))
                {
                    TextureCache.Remove(oldest);
                    if (oldTexture != null)
                    {
                        Object.Destroy(oldTexture);
                    }
                }

                if (SpriteCache.TryGetValue(oldest, out Sprite oldSprite))
                {
                    SpriteCache.Remove(oldest);
                    if (oldSprite != null)
                    {
                        Object.Destroy(oldSprite);
                    }
                }
            }
        }

        private static void TouchCache(string key)
        {
            CacheOrder.Remove(key);
            CacheOrder.AddFirst(key);
        }

        internal struct LayerDrawInfo
        {
            public Sprite Sprite;
            public Color Tint;
            public Vector2 Offset;
            public Vector2 Scale;
            public int SortOrder;
        }
    }
}
