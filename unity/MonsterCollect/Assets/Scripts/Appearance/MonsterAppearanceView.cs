using System.Collections;
using System.Collections.Generic;
using MonsterCollect.Monster;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.Appearance
{
    /// <summary>
    /// Layered UI monster renderer with idle bob/breathe and attack lunge animations.
    /// </summary>
    [DisallowMultipleComponent]
    public class MonsterAppearanceView : MonoBehaviour
    {
        [SerializeField] private RectTransform animatedRoot;
        [SerializeField] private Image glowImage;
        [SerializeField] private RectTransform layerContainer;

        private readonly List<Image> layerImages = new List<Image>(8);
        private MonsterData boundData;
        private Coroutine idleRoutine;
        private Coroutine attackRoutine;
        private Vector3 baseScale = Vector3.one;

        public void Bind(MonsterData data, int displaySize)
        {
            boundData = data;
            EnsureHierarchy();

            if (data == null)
            {
                gameObject.SetActive(false);
                return;
            }

            gameObject.SetActive(true);

            RectTransform root = animatedRoot != null ? animatedRoot : (RectTransform)transform;
            root.sizeDelta = new Vector2(displaySize, displaySize);
            baseScale = Vector3.one;
            root.localScale = baseScale;

            MonsterAppearanceSelection selection = data.GetAppearanceSelection();
            MonsterPartCatalog catalog = MonsterAppearanceResolver.Catalog;

            if (QrmonPortraitProvider.IsAvailable)
            {
                BindQrmonPortrait(data, displaySize);
            }
            else
            {
                List<MonsterAppearanceCompositor.LayerDrawInfo> layers =
                    MonsterAppearanceCompositor.BuildLayerList(catalog, selection, data);

                while (layerImages.Count < layers.Count)
                {
                    layerImages.Add(CreateLayerImage());
                }

                if (glowImage != null)
                {
                    glowImage.color = Color.clear;
                }

                for (int i = 0; i < layerImages.Count; i++)
                {
                    Image image = layerImages[i];
                    if (i >= layers.Count)
                    {
                        image.gameObject.SetActive(false);
                        continue;
                    }

                    MonsterAppearanceCompositor.LayerDrawInfo layer = layers[i];
                    image.gameObject.SetActive(true);
                    image.sprite = layer.Sprite;
                    image.color = layer.Tint;

                    RectTransform rt = image.rectTransform;
                    rt.localScale = new Vector3(layer.Scale.x, layer.Scale.y, 1f);
                    rt.anchoredPosition = layer.Offset;
                }
            }

            ApplyRarityPresentation(data, displaySize);
            RestartIdleAnimation();
        }

        public void PlayAttack()
        {
            if (!gameObject.activeInHierarchy || boundData == null)
            {
                return;
            }

            if (attackRoutine != null)
            {
                StopCoroutine(attackRoutine);
            }

            attackRoutine = StartCoroutine(AttackRoutine());
        }

        private void OnDisable()
        {
            if (idleRoutine != null)
            {
                StopCoroutine(idleRoutine);
                idleRoutine = null;
            }

            if (attackRoutine != null)
            {
                StopCoroutine(attackRoutine);
                attackRoutine = null;
            }
        }

        private void EnsureHierarchy()
        {
            if (animatedRoot == null)
            {
                animatedRoot = GetComponent<RectTransform>();
            }

            if (layerContainer == null)
            {
                var containerGo = new GameObject("Layers", typeof(RectTransform));
                layerContainer = containerGo.GetComponent<RectTransform>();
                layerContainer.SetParent(animatedRoot, false);
                Stretch(layerContainer);
            }

            if (glowImage == null)
            {
                var glowGo = new GameObject("Glow", typeof(RectTransform), typeof(Image));
                glowImage = glowGo.GetComponent<Image>();
                RectTransform glowRt = glowGo.GetComponent<RectTransform>();
                glowRt.SetParent(animatedRoot, false);
                glowRt.SetAsFirstSibling();
                Stretch(glowRt);
                glowImage.raycastTarget = false;
            }
        }

        private Image CreateLayerImage()
        {
            var go = new GameObject("PartLayer", typeof(RectTransform), typeof(Image));
            Image image = go.GetComponent<Image>();
            RectTransform rt = go.GetComponent<RectTransform>();
            rt.SetParent(layerContainer, false);
            Stretch(rt);
            image.raycastTarget = false;
            image.preserveAspect = true;
            image.raycastTarget = false;
            image.color = Color.clear;
            return image;
        }

        private static void Stretch(RectTransform rt)
        {
            rt.anchorMin = Vector2.zero;
            rt.anchorMax = Vector2.one;
            rt.offsetMin = Vector2.zero;
            rt.offsetMax = Vector2.zero;
        }

        private void ApplyRarityPresentation(MonsterData data, int displaySize)
        {
            MonsterRarityVisualEffects.Profile profile = MonsterRarityVisualEffects.GetProfile(data.Rarity);

            if (glowImage != null)
            {
                bool showGlow = profile.GlowStrength > 0f;
                glowImage.gameObject.SetActive(showGlow);

                if (showGlow)
                {
                    glowImage.sprite = QrmonPortraitProvider.IsAvailable
                        ? QrmonPortraitProvider.GetPortraitSprite(data, displaySize)
                        : MonsterAppearanceCompositor.GetOrCreatePortraitSprite(data, displaySize);
                    Color glowColor = MonsterRarityVisualEffects.GetGlowColor(data);
                    glowImage.color = new Color(glowColor.r, glowColor.g, glowColor.b, profile.GlowStrength * 0.45f);
                    glowImage.preserveAspect = true;
                    glowImage.raycastTarget = false;
                    glowImage.rectTransform.localScale = Vector3.one * profile.GlowRadius;
                }
            }
        }

        private void BindQrmonPortrait(MonsterData data, int displaySize)
        {
            if (layerImages.Count == 0)
            {
                layerImages.Add(CreateLayerImage());
            }

            Sprite portrait = QrmonPortraitProvider.GetPortraitSprite(data, displaySize);
            Image image = layerImages[0];
            image.gameObject.SetActive(true);
            image.sprite = portrait;
            image.color = Color.white;
            image.preserveAspect = true;
            image.raycastTarget = false;
            image.rectTransform.localScale = Vector3.one;
            image.rectTransform.anchoredPosition = Vector2.zero;

            for (int i = 1; i < layerImages.Count; i++)
            {
                layerImages[i].gameObject.SetActive(false);
            }
        }

        private void RestartIdleAnimation()
        {
            if (idleRoutine != null)
            {
                StopCoroutine(idleRoutine);
            }

            if (isActiveAndEnabled)
            {
                idleRoutine = StartCoroutine(IdleRoutine());
            }
        }

        private IEnumerator IdleRoutine()
        {
            RectTransform root = animatedRoot != null ? animatedRoot : (RectTransform)transform;
            float phase = MonsterHashUtility.HashByte(boundData, 7) / 255f * Mathf.PI * 2f;

            while (true)
            {
                float breathe = 1f + Mathf.Sin((Time.unscaledTime + phase) * 2.2f) * 0.035f;
                float bob = Mathf.Sin((Time.unscaledTime + phase) * 1.6f) * 3f;
                root.localScale = baseScale * breathe;
                root.anchoredPosition = new Vector2(0f, bob);
                yield return null;
            }
        }

        private IEnumerator AttackRoutine()
        {
            RectTransform root = animatedRoot != null ? animatedRoot : (RectTransform)transform;
            Vector3 startScale = root.localScale;
            Vector2 startPos = root.anchoredPosition;
            float duration = 0.18f;
            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.unscaledDeltaTime;
                float t = elapsed / duration;
                float punch = t < 0.5f ? t * 2f : (1f - t) * 2f;
                root.localScale = startScale * (1f + punch * 0.12f);
                root.anchoredPosition = startPos + new Vector2(punch * 10f, 0f);
                yield return null;
            }

            root.localScale = startScale;
            root.anchoredPosition = startPos;
            attackRoutine = null;
        }
    }
}
