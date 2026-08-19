using UnityEngine;

namespace MonsterCollect.Appearance
{
    /// <summary>Generates white-on-transparent part silhouettes for tinting at runtime.</summary>
    public static class ProceduralPartSpriteGenerator
    {
        public static Texture2D Generate(MonsterPartShapeKind shape, int size)
        {
            var texture = new Texture2D(size, size, TextureFormat.RGBA32, false)
            {
                filterMode = FilterMode.Bilinear,
                wrapMode = TextureWrapMode.Clamp
            };

            Clear(texture, size);

            float cx = size * 0.5f;
            float cy = size * 0.5f;

            switch (shape)
            {
                case MonsterPartShapeKind.BodyRound:
                    FillEllipse(texture, size, cx, cy - size * 0.02f, size * 0.32f, size * 0.28f);
                    break;
                case MonsterPartShapeKind.BodyOval:
                    FillEllipse(texture, size, cx, cy, size * 0.28f, size * 0.34f);
                    break;
                case MonsterPartShapeKind.BodyAngular:
                    FillDiamond(texture, size, cx, cy, size * 0.3f, size * 0.32f);
                    break;
                case MonsterPartShapeKind.BodyBlob:
                    FillEllipse(texture, size, cx - size * 0.04f, cy, size * 0.3f, size * 0.26f);
                    FillEllipse(texture, size, cx + size * 0.06f, cy + size * 0.04f, size * 0.22f, size * 0.2f);
                    break;

                case MonsterPartShapeKind.HeadRound:
                    FillEllipse(texture, size, cx, cy + size * 0.12f, size * 0.2f, size * 0.18f);
                    break;
                case MonsterPartShapeKind.HeadPointed:
                    FillTriangle(texture, size, cx, cy + size * 0.24f, size * 0.2f, size * 0.22f);
                    break;
                case MonsterPartShapeKind.HeadWide:
                    FillEllipse(texture, size, cx, cy + size * 0.1f, size * 0.26f, size * 0.16f);
                    break;
                case MonsterPartShapeKind.HeadSmall:
                    FillEllipse(texture, size, cx, cy + size * 0.14f, size * 0.14f, size * 0.13f);
                    break;

                case MonsterPartShapeKind.LimbsStub:
                    FillEllipse(texture, size, cx - size * 0.22f, cy - size * 0.06f, size * 0.1f, size * 0.08f);
                    FillEllipse(texture, size, cx + size * 0.22f, cy - size * 0.06f, size * 0.1f, size * 0.08f);
                    FillEllipse(texture, size, cx - size * 0.12f, cy - size * 0.18f, size * 0.08f, size * 0.1f);
                    FillEllipse(texture, size, cx + size * 0.12f, cy - size * 0.18f, size * 0.08f, size * 0.1f);
                    break;
                case MonsterPartShapeKind.LimbsLong:
                    FillEllipse(texture, size, cx - size * 0.26f, cy, size * 0.08f, size * 0.18f);
                    FillEllipse(texture, size, cx + size * 0.26f, cy, size * 0.08f, size * 0.18f);
                    FillEllipse(texture, size, cx - size * 0.1f, cy - size * 0.22f, size * 0.07f, size * 0.16f);
                    FillEllipse(texture, size, cx + size * 0.1f, cy - size * 0.22f, size * 0.07f, size * 0.16f);
                    break;

                case MonsterPartShapeKind.TailShort:
                    FillEllipse(texture, size, cx, cy - size * 0.22f, size * 0.08f, size * 0.12f);
                    break;
                case MonsterPartShapeKind.TailLong:
                    FillEllipse(texture, size, cx, cy - size * 0.28f, size * 0.06f, size * 0.2f);
                    break;
                case MonsterPartShapeKind.TailFin:
                    FillTriangle(texture, size, cx, cy - size * 0.24f, size * 0.16f, size * 0.12f);
                    break;

                case MonsterPartShapeKind.EyesDot:
                    FillEllipse(texture, size, cx - size * 0.08f, cy + size * 0.08f, size * 0.035f, size * 0.035f);
                    FillEllipse(texture, size, cx + size * 0.08f, cy + size * 0.08f, size * 0.035f, size * 0.035f);
                    break;
                case MonsterPartShapeKind.EyesBig:
                    FillEllipse(texture, size, cx - size * 0.09f, cy + size * 0.08f, size * 0.06f, size * 0.07f);
                    FillEllipse(texture, size, cx + size * 0.09f, cy + size * 0.08f, size * 0.06f, size * 0.07f);
                    FillEllipse(texture, size, cx - size * 0.09f, cy + size * 0.08f, size * 0.025f, size * 0.03f, 0.85f);
                    FillEllipse(texture, size, cx + size * 0.09f, cy + size * 0.08f, size * 0.025f, size * 0.03f, 0.85f);
                    break;
                case MonsterPartShapeKind.EyesAngry:
                    FillEllipse(texture, size, cx - size * 0.08f, cy + size * 0.07f, size * 0.05f, size * 0.04f);
                    FillEllipse(texture, size, cx + size * 0.08f, cy + size * 0.07f, size * 0.05f, size * 0.04f);
                    DrawLine(texture, size, cx - size * 0.12f, cy + size * 0.12f, cx - size * 0.04f, cy + size * 0.1f, 2);
                    DrawLine(texture, size, cx + size * 0.12f, cy + size * 0.12f, cx + size * 0.04f, cy + size * 0.1f, 2);
                    break;
                case MonsterPartShapeKind.EyesSleepy:
                    DrawLine(texture, size, cx - size * 0.11f, cy + size * 0.08f, cx - size * 0.05f, cy + size * 0.08f, 3);
                    DrawLine(texture, size, cx + size * 0.05f, cy + size * 0.08f, cx + size * 0.11f, cy + size * 0.08f, 3);
                    break;

                case MonsterPartShapeKind.PatternStripes:
                    for (int i = -2; i <= 2; i++)
                    {
                        DrawLine(texture, size, cx - size * 0.2f, cy + i * size * 0.06f, cx + size * 0.2f, cy + i * size * 0.06f, 2);
                    }

                    break;
                case MonsterPartShapeKind.PatternSpots:
                    FillEllipse(texture, size, cx - size * 0.12f, cy, size * 0.04f, size * 0.04f);
                    FillEllipse(texture, size, cx + size * 0.1f, cy - size * 0.06f, size * 0.035f, size * 0.035f);
                    FillEllipse(texture, size, cx, cy + size * 0.1f, size * 0.03f, size * 0.03f);
                    break;

                case MonsterPartShapeKind.AccessoryHorn:
                    FillTriangle(texture, size, cx, cy + size * 0.26f, size * 0.08f, size * 0.16f);
                    break;
                case MonsterPartShapeKind.AccessoryWings:
                    FillEllipse(texture, size, cx - size * 0.22f, cy + size * 0.04f, size * 0.14f, size * 0.08f);
                    FillEllipse(texture, size, cx + size * 0.22f, cy + size * 0.04f, size * 0.14f, size * 0.08f);
                    break;
                case MonsterPartShapeKind.AccessoryCrown:
                    DrawLine(texture, size, cx - size * 0.12f, cy + size * 0.2f, cx - size * 0.06f, cy + size * 0.28f, 3);
                    DrawLine(texture, size, cx - size * 0.06f, cy + size * 0.28f, cx, cy + size * 0.22f, 3);
                    DrawLine(texture, size, cx, cy + size * 0.22f, cx + size * 0.06f, cy + size * 0.28f, 3);
                    DrawLine(texture, size, cx + size * 0.06f, cy + size * 0.28f, cx + size * 0.12f, cy + size * 0.2f, 3);
                    DrawLine(texture, size, cx - size * 0.12f, cy + size * 0.2f, cx + size * 0.12f, cy + size * 0.2f, 3);
                    break;
            }

            texture.Apply();
            return texture;
        }

        private static void Clear(Texture2D texture, int size)
        {
            Color32 clear = new Color32(0, 0, 0, 0);
            var pixels = new Color32[size * size];
            for (int i = 0; i < pixels.Length; i++)
            {
                pixels[i] = clear;
            }

            texture.SetPixels32(pixels);
        }

        private static void FillEllipse(Texture2D texture, int size, float cx, float cy, float rx, float ry, float alpha = 1f)
        {
            int minX = Mathf.Max(0, Mathf.FloorToInt(cx - rx));
            int maxX = Mathf.Min(size - 1, Mathf.CeilToInt(cx + rx));
            int minY = Mathf.Max(0, Mathf.FloorToInt(cy - ry));
            int maxY = Mathf.Min(size - 1, Mathf.CeilToInt(cy + ry));

            for (int y = minY; y <= maxY; y++)
            {
                for (int x = minX; x <= maxX; x++)
                {
                    float dx = (x - cx) / rx;
                    float dy = (y - cy) / ry;
                    if ((dx * dx + dy * dy) > 1f)
                    {
                        continue;
                    }

                    Color existing = texture.GetPixel(x, y);
                    texture.SetPixel(x, y, Blend(existing, Color.white, alpha));
                }
            }
        }

        private static void FillDiamond(Texture2D texture, int size, float cx, float cy, float halfWidth, float halfHeight)
        {
            for (int y = 0; y < size; y++)
            {
                for (int x = 0; x < size; x++)
                {
                    float dx = Mathf.Abs(x - cx) / halfWidth;
                    float dy = Mathf.Abs(y - cy) / halfHeight;
                    if (dx + dy > 1f)
                    {
                        continue;
                    }

                    Color existing = texture.GetPixel(x, y);
                    texture.SetPixel(x, y, Blend(existing, Color.white, 1f));
                }
            }
        }

        private static void FillTriangle(Texture2D texture, int size, float cx, float topY, float halfWidth, float height)
        {
            float bottomY = topY - height;

            for (int y = 0; y < size; y++)
            {
                for (int x = 0; x < size; x++)
                {
                    if (y > topY || y < bottomY)
                    {
                        continue;
                    }

                    float t = (topY - y) / height;
                    float halfSpan = halfWidth * t;
                    if (Mathf.Abs(x - cx) > halfSpan)
                    {
                        continue;
                    }

                    Color existing = texture.GetPixel(x, y);
                    texture.SetPixel(x, y, Blend(existing, Color.white, 1f));
                }
            }
        }

        private static void DrawLine(Texture2D texture, int size, float x0, float y0, float x1, float y1, int thickness)
        {
            float distance = Vector2.Distance(new Vector2(x0, y0), new Vector2(x1, y1));
            int steps = Mathf.Max(1, Mathf.CeilToInt(distance));

            for (int i = 0; i <= steps; i++)
            {
                float t = i / (float)steps;
                float x = Mathf.Lerp(x0, x1, t);
                float y = Mathf.Lerp(y0, y1, t);
                FillEllipse(texture, size, x, y, thickness * 0.5f, thickness * 0.5f);
            }
        }

        private static Color Blend(Color existing, Color overlay, float alpha)
        {
            return Color.Lerp(existing, overlay, alpha * overlay.a);
        }
    }
}
