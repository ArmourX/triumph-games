using TMPro;
using UnityEngine;

namespace MonsterCollect.UI
{
    /// <summary>Runtime SDF fonts generated from the 300Mind TTF files.</summary>
    public static class TmpFonts
    {
        private static TMP_FontAsset title;
        private static TMP_FontAsset body;
        private static TMP_FontAsset label;

        public static TMP_FontAsset Title => title != null ? title : title = Create(MobileGameUiKit.TitleFont);
        public static TMP_FontAsset Body => body != null ? body : body = Create(MobileGameUiKit.BodyFont);
        public static TMP_FontAsset Label => label != null ? label : label = Create(MobileGameUiKit.LabelFont ?? MobileGameUiKit.BodyFont);

        public static void PrepareCanvas(Canvas canvas)
        {
            if (canvas == null)
            {
                return;
            }

            canvas.additionalShaderChannels |=
                AdditionalCanvasShaderChannels.TexCoord1 |
                AdditionalCanvasShaderChannels.TexCoord2 |
                AdditionalCanvasShaderChannels.TexCoord3 |
                AdditionalCanvasShaderChannels.Normal |
                AdditionalCanvasShaderChannels.Tangent;
            canvas.pixelPerfect = false;
        }

        private static TMP_FontAsset Create(Font source)
        {
            if (source == null)
            {
                return null;
            }

            TMP_FontAsset asset = TMP_FontAsset.CreateFontAsset(source);
            if (asset != null)
            {
                asset.name = source.name + " SDF";
            }

            return asset;
        }
    }
}
