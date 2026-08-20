using MonsterCollect.Monster;
using MonsterCollect.UI;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.Appearance
{
    /// <summary>
    /// Unified portrait binding for cards and panels. Uses baked textures for lists, layered view for animated contexts.
    /// </summary>
    [DisallowMultipleComponent]
    public class MonsterPortraitDisplay : MonoBehaviour
    {
        [SerializeField] private RawImage bakedImage;
        [SerializeField] private MonsterAppearanceView animatedView;

        private Texture2D boundTexture;
        private bool usingAnimatedView;

        public bool IsAnimated => usingAnimatedView;

        public void Bind(MonsterData data, int size, bool animated = false)
        {
            ClearBinding();
            EnsureReferences();

            if (data == null)
            {
                gameObject.SetActive(false);
                return;
            }

            gameObject.SetActive(true);
            usingAnimatedView = animated;

            if (animated)
            {
                if (bakedImage != null)
                {
                    bakedImage.enabled = false;
                }

                EnsureAnimatedView();
                animatedView.gameObject.SetActive(true);
                animatedView.Bind(data, size);
                return;
            }

            if (animatedView != null)
            {
                animatedView.gameObject.SetActive(false);
            }

            boundTexture = MonsterAppearanceCompositor.GetOrCreatePortrait(data, Mathf.Max(size * 2, size));

            if (bakedImage != null)
            {
                bakedImage.enabled = true;
                bakedImage.color = Color.white;
                bakedImage.texture = boundTexture;
                UiSharpnessUtility.ApplyCrispRawImage(bakedImage);
            }
        }

        public void PlayAttack()
        {
            if (usingAnimatedView && animatedView != null)
            {
                animatedView.PlayAttack();
            }
        }

        private void OnDestroy()
        {
            ClearBinding();
        }

        private void EnsureReferences()
        {
            if (bakedImage == null)
            {
                bakedImage = GetComponent<RawImage>();
            }
        }

        private void EnsureAnimatedView()
        {
            if (animatedView != null)
            {
                return;
            }

            var go = new GameObject("AnimatedPortrait", typeof(RectTransform), typeof(MonsterAppearanceView));
            RectTransform rt = go.GetComponent<RectTransform>();
            rt.SetParent(transform, false);
            Stretch(rt);
            animatedView = go.GetComponent<MonsterAppearanceView>();
        }

        private void ClearBinding()
        {
            if (bakedImage != null && bakedImage.texture == boundTexture)
            {
                bakedImage.texture = null;
            }

            boundTexture = null;
            usingAnimatedView = false;
        }

        private static void Stretch(RectTransform rt)
        {
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
        }
    }
}
