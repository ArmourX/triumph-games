using UnityEngine;
using ZXing;
using ZXing.Common;
using static ZXing.RGBLuminanceSource;

namespace MonsterCollect.QR
{
    /// <summary>Decodes QR codes from still images (photo picker / gallery).</summary>
    public static class QRImageDecoder
    {
        private static readonly IBarcodeReaderGeneric Reader = new BarcodeReaderGeneric
        {
            AutoRotate = true,
            TryInverted = true,
            Options = new DecodingOptions
            {
                PossibleFormats = new[] { BarcodeFormat.QR_CODE },
                TryHarder = true
            }
        };

        public static bool TryDecodeTexture(Texture2D texture, out string rawText)
        {
            rawText = null;
            if (texture == null)
            {
                return false;
            }

            Color32[] pixels = texture.GetPixels32();
            int width = texture.width;
            int height = texture.height;
            if (pixels == null || pixels.Length != width * height)
            {
                return false;
            }

            byte[] rgba = Color32ToRgbaBytes(pixels);
            Result result = Reader.Decode(rgba, width, height, BitmapFormat.RGBA32);
            rawText = result?.Text;
            return !string.IsNullOrEmpty(rawText);
        }

        public static bool TryDecodeDataUrl(string dataUrl, out string rawText)
        {
            rawText = null;
            if (string.IsNullOrWhiteSpace(dataUrl))
            {
                return false;
            }

            // Browser may return decoded text directly when BarcodeDetector succeeds.
            if (!dataUrl.StartsWith("data:", System.StringComparison.OrdinalIgnoreCase))
            {
                rawText = dataUrl.Trim();
                return true;
            }

            int comma = dataUrl.IndexOf(',');
            if (comma < 0)
            {
                return false;
            }

            byte[] bytes;
            try
            {
                bytes = System.Convert.FromBase64String(dataUrl.Substring(comma + 1));
            }
            catch
            {
                return false;
            }

            var texture = new Texture2D(2, 2, TextureFormat.RGBA32, false);
            try
            {
                if (!texture.LoadImage(bytes))
                {
                    return false;
                }

                return TryDecodeTexture(texture, out rawText);
            }
            finally
            {
                Object.Destroy(texture);
            }
        }

        private static byte[] Color32ToRgbaBytes(Color32[] pixels)
        {
            var buffer = new byte[pixels.Length * 4];
            for (int i = 0, p = 0; i < pixels.Length; i++, p += 4)
            {
                buffer[p] = pixels[i].r;
                buffer[p + 1] = pixels[i].g;
                buffer[p + 2] = pixels[i].b;
                buffer[p + 3] = pixels[i].a;
            }

            return buffer;
        }
    }
}
