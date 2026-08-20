using System.Collections.Generic;
using UnityEngine;

namespace MonsterCollect.Appearance
{
    /// <summary>
    /// Removes opaque sheet backgrounds (black/white mats, checkerboards) while preserving interior sprite detail.
    /// Uses edge-connected flood fill so in-creature blacks/whites (eyes, outlines) stay visible.
    /// </summary>
    public static class PortraitBackdropUtility
    {
        private const float NearBlack = 0.06f;
        private const float NearWhite = 0.96f;
        private const float LowSaturation = 0.045f;
        private const float EdgeColorMatchToleranceSq = 0.014f;

        public static void StripEdgeConnectedBackdrop(Color[] pixels, int width, int height)
        {
            if (pixels == null || pixels.Length != width * height || width < 2 || height < 2)
            {
                return;
            }

            Color[] edgeBackdrops = DetectEdgeBackdropColors(pixels, width, height);
            bool[] isBackdrop = new bool[pixels.Length];
            var queue = new Queue<int>(width * 2 + height * 2);

            void TryEnqueue(int x, int y)
            {
                int index = y * width + x;
                if (isBackdrop[index])
                {
                    return;
                }

                if (!IsBackgroundCandidate(pixels[index], edgeBackdrops))
                {
                    return;
                }

                isBackdrop[index] = true;
                queue.Enqueue(index);
            }

            for (int x = 0; x < width; x++)
            {
                TryEnqueue(x, 0);
                TryEnqueue(x, height - 1);
            }

            for (int y = 1; y < height - 1; y++)
            {
                TryEnqueue(0, y);
                TryEnqueue(width - 1, y);
            }

            while (queue.Count > 0)
            {
                int index = queue.Dequeue();
                int x = index % width;
                int y = index / width;

                if (x > 0)
                {
                    TryEnqueue(x - 1, y);
                }

                if (x < width - 1)
                {
                    TryEnqueue(x + 1, y);
                }

                if (y > 0)
                {
                    TryEnqueue(x, y - 1);
                }

                if (y < height - 1)
                {
                    TryEnqueue(x, y + 1);
                }
            }

            for (int i = 0; i < pixels.Length; i++)
            {
                if (isBackdrop[i])
                {
                    pixels[i] = Color.clear;
                }
            }
        }

        public static void StripEdgeConnectedBackdrop(Texture2D texture)
        {
            if (texture == null || !texture.isReadable)
            {
                return;
            }

            Color[] pixels = texture.GetPixels();
            StripEdgeConnectedBackdrop(pixels, texture.width, texture.height);
            texture.SetPixels(pixels);
            texture.Apply(false, false);
        }

        public static bool IsTransparentOrBackdrop(Color sample, Color backdropHint = default)
        {
            if (sample.a <= 0.04f)
            {
                return true;
            }

            if (backdropHint.a >= 0.5f && MatchesColor(sample, backdropHint))
            {
                return true;
            }

            return IsBackgroundCandidate(sample, System.Array.Empty<Color>());
        }

        private static Color[] DetectEdgeBackdropColors(Color[] pixels, int width, int height)
        {
            var buckets = new Dictionary<int, ColorSum>();

            void SampleEdge(int x, int y)
            {
                Color sample = pixels[y * width + x];
                if (sample.a <= 0.04f)
                {
                    return;
                }

                int key = QuantizeColor(sample);
                if (!buckets.TryGetValue(key, out ColorSum sum))
                {
                    sum = new ColorSum();
                }

                sum.Add(sample);
                buckets[key] = sum;
            }

            for (int x = 0; x < width; x++)
            {
                SampleEdge(x, 0);
                SampleEdge(x, height - 1);
            }

            for (int y = 1; y < height - 1; y++)
            {
                SampleEdge(0, y);
                SampleEdge(width - 1, y);
            }

            int borderCount = width * 2 + (height - 2) * 2;
            int minCount = Mathf.Max(4, borderCount / 12);
            var ranked = new List<KeyValuePair<int, ColorSum>>(buckets);
            ranked.Sort((a, b) => b.Value.Count.CompareTo(a.Value.Count));

            var results = new List<Color>(4);
            for (int i = 0; i < ranked.Count && results.Count < 4; i++)
            {
                if (ranked[i].Value.Count < minCount)
                {
                    continue;
                }

                Color average = ranked[i].Value.Average;
                average.a = 1f;
                results.Add(average);
            }

            return results.ToArray();
        }

        private static bool IsBackgroundCandidate(Color sample, Color[] edgeBackdrops)
        {
            if (sample.a <= 0.04f)
            {
                return true;
            }

            float maxChannel = Mathf.Max(sample.r, sample.g, sample.b);
            float minChannel = Mathf.Min(sample.r, sample.g, sample.b);
            float saturation = maxChannel - minChannel;
            float luminance = 0.2126f * sample.r + 0.7152f * sample.g + 0.0722f * sample.b;

            if (sample.r <= NearBlack && sample.g <= NearBlack && sample.b <= NearBlack)
            {
                return true;
            }

            if (sample.r >= NearWhite && sample.g >= NearWhite && sample.b >= NearWhite)
            {
                return true;
            }

            if (saturation <= LowSaturation)
            {
                if (luminance <= NearBlack || luminance >= NearWhite)
                {
                    return true;
                }
            }

            for (int i = 0; i < edgeBackdrops.Length; i++)
            {
                if (MatchesColor(sample, edgeBackdrops[i]))
                {
                    return true;
                }
            }

            return false;
        }

        private static bool MatchesColor(Color sample, Color target)
        {
            float dr = sample.r - target.r;
            float dg = sample.g - target.g;
            float db = sample.b - target.b;
            return (dr * dr + dg * dg + db * db) < EdgeColorMatchToleranceSq;
        }

        private static int QuantizeColor(Color sample)
        {
            int r = Mathf.Clamp(Mathf.RoundToInt(sample.r * 15f), 0, 15);
            int g = Mathf.Clamp(Mathf.RoundToInt(sample.g * 15f), 0, 15);
            int b = Mathf.Clamp(Mathf.RoundToInt(sample.b * 15f), 0, 15);
            return (r << 8) | (g << 4) | b;
        }

        private struct ColorSum
        {
            public int Count;
            public float R;
            public float G;
            public float B;

            public void Add(Color sample)
            {
                Count++;
                R += sample.r;
                G += sample.g;
                B += sample.b;
            }

            public Color Average => Count <= 0
                ? Color.clear
                : new Color(R / Count, G / Count, B / Count, 1f);
        }
    }
}
