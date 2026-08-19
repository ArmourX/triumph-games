using MonsterCollect.Appearance;
using MonsterCollect.Monster;
using UnityEngine;

namespace MonsterCollect.Monster
{
    /// <summary>
    /// Backward-compatible facade over the modular appearance compositor.
    /// </summary>
    public static class MonsterVisualBuilder
    {
        private const int DefaultSize = 256;

        public static Texture2D CreatePlaceholderTexture(MonsterData data, int size = DefaultSize)
        {
            return MonsterAppearanceCompositor.GetOrCreatePortrait(data, size);
        }

        public static Texture2D CreateBreedingPreviewTexture(MonsterData parentA, MonsterData parentB, int size = DefaultSize)
        {
            MonsterData preview = MonsterBreedingService.GeneratePreview(parentA, parentB);
            return preview != null
                ? MonsterAppearanceCompositor.GetOrCreatePortrait(preview, size)
                : MonsterAppearanceCompositor.GetOrCreatePortrait(parentA, size);
        }

        public static Sprite CreatePlaceholderSprite(MonsterData data, int size = DefaultSize)
        {
            Texture2D texture = CreatePlaceholderTexture(data, size);
            return Sprite.Create(texture, new Rect(0f, 0f, size, size), new Vector2(0.5f, 0.5f), size);
        }
    }
}
