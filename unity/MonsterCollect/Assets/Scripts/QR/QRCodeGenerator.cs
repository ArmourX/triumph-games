using System;
using UnityEngine;
using ZXing;
using ZXing.Common;
using ZXing.QrCode;
using ZXing.Rendering;

namespace MonsterCollect.QR
{
    /// <summary>
    /// Generates QR code textures using ZXing.Net (for debug cards, editor tools, or in-game sharing).
    /// </summary>
    public static class QRCodeGenerator
    {
        /// <summary>
        /// Creates a square QR code Texture2D from the given text payload.
        /// </summary>
        /// <param name="payload">Text to encode (will be passed through <see cref="QRResultExtractor"/> first).</param>
        /// <param name="sizePixels">Width and height in pixels.</param>
        /// <param name="marginModules">Quiet zone around the code in modules.</param>
        public static Texture2D GenerateTexture(string payload, int sizePixels = 512, int marginModules = 2)
        {
            string normalized = QRResultExtractor.Extract(payload) ?? payload ?? string.Empty;

            var writer = new BarcodeWriterPixelData
            {
                Format = BarcodeFormat.QR_CODE,
                Options = new QrCodeEncodingOptions
                {
                    Height = sizePixels,
                    Width = sizePixels,
                    Margin = marginModules,
                    CharacterSet = "UTF-8"
                }
            };

            PixelData pixelData = writer.Write(normalized);

            var texture = new Texture2D(pixelData.Width, pixelData.Height, TextureFormat.RGBA32, false);
            texture.SetPixels32(ConvertToColor32(pixelData));
            texture.Apply(false, false);
            texture.filterMode = FilterMode.Point;
            return texture;
        }

        /// <summary>
        /// Encodes payload to PNG bytes (useful for saving share images on device).
        /// </summary>
        public static byte[] GeneratePngBytes(string payload, int sizePixels = 512, int marginModules = 2)
        {
            Texture2D texture = GenerateTexture(payload, sizePixels, marginModules);

            try
            {
                return texture.EncodeToPNG();
            }
            finally
            {
                UnityEngine.Object.Destroy(texture);
            }
        }

        private static Color32[] ConvertToColor32(PixelData pixelData)
        {
            var colors = new Color32[pixelData.Width * pixelData.Height];
            byte[] raw = pixelData.Pixels;

            for (int i = 0, p = 0; i < colors.Length; i++, p += 4)
            {
                colors[i] = new Color32(raw[p], raw[p + 1], raw[p + 2], raw[p + 3]);
            }

            return colors;
        }
    }
}
