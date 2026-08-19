using System.Collections.Generic;
using MonsterCollect.Monster;
using UnityEngine;

namespace MonsterCollect.Appearance
{
    /// <summary>Uses authored QRmon art instead of procedural part compositing.</summary>
    public static class QrmonPortraitProvider
    {
        public const string SheetResourcePath = "Creatures/QRmon";

        private static readonly Dictionary<string, Texture2D> PortraitCache = new Dictionary<string, Texture2D>();
        private static Sprite portraitSprite;
        private static bool loadAttempted;

        public static bool IsAvailable => EnsureLoaded();

        public static Texture2D GetPortrait(MonsterData data, int size)
        {
            if (data == null || !EnsureLoaded())
            {
                return null;
            }

            string key = $"{data.FullHash}_{size}";
            if (PortraitCache.TryGetValue(key, out Texture2D cached))
            {
                return cached;
            }

            Texture2D portrait = BakePortrait(data, size);
            PortraitCache[key] = portrait;
            return portrait;
        }

        public static Sprite GetPortraitSprite(MonsterData data, int size)
        {
            Texture2D texture = GetPortrait(data, size);
            if (texture == null)
            {
                return null;
            }

            return Sprite.Create(
                texture,
                new Rect(0f, 0f, texture.width, texture.height),
                new Vector2(0.5f, 0.5f),
                size);
        }

        public static void ClearCache()
        {
            foreach (Texture2D texture in PortraitCache.Values)
            {
                if (texture != null)
                {
                    UnityEngine.Object.Destroy(texture);
                }
            }

            PortraitCache.Clear();
        }

        private static bool EnsureLoaded()
        {
            if (portraitSprite != null)
            {
                return true;
            }

            if (loadAttempted)
            {
                return false;
            }

            loadAttempted = true;
            portraitSprite = Resources.Load<Sprite>(SheetResourcePath);
            if (portraitSprite == null)
            {
                Debug.LogWarning("[QrmonPortraitProvider] QRmon sprite not found at Resources/Creatures/QRmon.");
            }

            return portraitSprite != null;
        }

        private static Texture2D BakePortrait(MonsterData data, int size)
        {
            var texture = new Texture2D(size, size, TextureFormat.RGBA32, false)
            {
                wrapMode = TextureWrapMode.Clamp,
                filterMode = FilterMode.Bilinear
            };

            Color background = Color.Lerp(data.GetDisplayPrimaryColor(), data.GetDisplaySecondaryColor(), 0.15f);
            background.a = 1f;
            var pixels = new Color32[size * size];
            var bg = (Color32)background;
            for (int i = 0; i < pixels.Length; i++)
            {
                pixels[i] = bg;
            }

            texture.SetPixels32(pixels);
            texture.Apply(false, false);
            RenderSpriteOnto(texture, portraitSprite, size, data);
            texture.Apply(false, false);
            return texture;
        }

        private static void RenderSpriteOnto(Texture2D target, Sprite sprite, int size, MonsterData data)
        {
            if (sprite == null || sprite.texture == null)
            {
                return;
            }

            Rect rect = sprite.textureRect;
            int srcW = Mathf.RoundToInt(rect.width);
            int srcH = Mathf.RoundToInt(rect.height);
            if (srcW <= 0 || srcH <= 0)
            {
                return;
            }

            Color[] src = ReadSpritePixels(sprite, rect, srcW, srcH);
            if (src == null || src.Length == 0)
            {
                return;
            }

            float scale = Mathf.Min(size * 0.92f / srcW, size * 0.92f / srcH);
            int drawW = Mathf.Max(1, Mathf.RoundToInt(srcW * scale));
            int drawH = Mathf.Max(1, Mathf.RoundToInt(srcH * scale));
            int offsetX = (size - drawW) / 2;
            int offsetY = (size - drawH) / 2;
            Color primary = data.GetDisplayPrimaryColor();
            Color secondary = data.GetDisplaySecondaryColor();
            float tintMix = MonsterHashUtility.HashByte(data, 5) / 255f * 0.18f;
            Color tint = Color.Lerp(Color.white, Color.Lerp(primary, secondary, 0.5f), tintMix);

            for (int y = 0; y < drawH; y++)
            {
                int srcY = Mathf.Min(srcH - 1, Mathf.RoundToInt(y / scale));
                for (int x = 0; x < drawW; x++)
                {
                    int srcX = Mathf.Min(srcW - 1, Mathf.RoundToInt(x / scale));
                    Color sample = src[srcY * srcW + srcX];

                    // Treat near-black backdrop as transparent so the monster reads on UI cards.
                    if (sample.a <= 0.03f ||
                        (sample.r < 0.08f && sample.g < 0.08f && sample.b < 0.08f))
                    {
                        continue;
                    }

                    Color blended = sample;
                    blended.r *= tint.r;
                    blended.g *= tint.g;
                    blended.b *= tint.b;
                    target.SetPixel(offsetX + x, offsetY + y, blended);
                }
            }
        }

        private static Color[] ReadSpritePixels(Sprite sprite, Rect rect, int width, int height)
        {
            Texture2D texture = sprite.texture;
            int x = Mathf.RoundToInt(rect.x);
            int y = Mathf.RoundToInt(rect.y);

            if (texture.isReadable)
            {
                try
                {
                    return texture.GetPixels(x, y, width, height);
                }
                catch (System.Exception ex)
                {
                    Debug.LogWarning($"[QrmonPortraitProvider] GetPixels failed: {ex.Message}");
                }
            }

            return ReadSpritePixelsViaRenderTexture(texture, rect, width, height);
        }

        private static Color[] ReadSpritePixelsViaRenderTexture(
            Texture2D source,
            Rect rect,
            int width,
            int height)
        {
            var previous = RenderTexture.active;
            var renderTarget = RenderTexture.GetTemporary(source.width, source.height, 0, RenderTextureFormat.ARGB32);

            try
            {
                Graphics.Blit(source, renderTarget);
                var readable = new Texture2D(width, height, TextureFormat.RGBA32, false);
                RenderTexture.active = renderTarget;
                readable.ReadPixels(new Rect(rect.x, rect.y, width, height), 0, 0);
                readable.Apply();
                return readable.GetPixels();
            }
            finally
            {
                RenderTexture.active = previous;
                RenderTexture.ReleaseTemporary(renderTarget);
            }
        }
    }
}
