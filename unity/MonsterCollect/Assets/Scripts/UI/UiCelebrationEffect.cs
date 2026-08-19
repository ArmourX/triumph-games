using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace MonsterCollect.UI
{
    /// <summary>Lightweight uGUI particle burst — no prefab assets required.</summary>
    public static class UiCelebrationEffect
    {
        private const float Duration = 0.65f;

        public static void Play(Transform anchor, Color color, int count = 12)
        {
            if (anchor == null)
            {
                return;
            }

            Canvas canvas = anchor.GetComponentInParent<Canvas>();
            if (canvas == null)
            {
                return;
            }

            var host = new GameObject("UiCelebrationEffect", typeof(RectTransform));
            host.transform.SetParent(canvas.transform, false);
            var hostRect = host.GetComponent<RectTransform>();
            hostRect.position = anchor.position;
            hostRect.sizeDelta = Vector2.zero;

            var runner = host.AddComponent<Runner>();
            runner.StartBurst(hostRect, color, count);
        }

        private sealed class Runner : MonoBehaviour
        {
            private readonly List<RectTransform> particles = new List<RectTransform>();
            private readonly List<Vector2> velocities = new List<Vector2>();
            private readonly List<Image> images = new List<Image>();
            private float elapsed;

            public void StartBurst(RectTransform host, Color color, int count)
            {
                for (int i = 0; i < count; i++)
                {
                    var particleGo = new GameObject("Particle", typeof(RectTransform), typeof(Image));
                    particleGo.transform.SetParent(host, false);
                    var rect = particleGo.GetComponent<RectTransform>();
                    rect.sizeDelta = new Vector2(18f, 18f);
                    rect.anchoredPosition = Vector2.zero;

                    var image = particleGo.GetComponent<Image>();
                    image.color = color;
                    particles.Add(rect);
                    images.Add(image);

                    float angle = Random.Range(0f, Mathf.PI * 2f);
                    float speed = Random.Range(120f, 260f);
                    velocities.Add(new Vector2(Mathf.Cos(angle), Mathf.Sin(angle)) * speed);
                }

                StartCoroutine(Animate(host));
            }

            private IEnumerator Animate(RectTransform host)
            {
                while (elapsed < Duration)
                {
                    elapsed += Time.unscaledDeltaTime;
                    float t = elapsed / Duration;

                    for (int i = 0; i < particles.Count; i++)
                    {
                        particles[i].anchoredPosition += velocities[i] * Time.unscaledDeltaTime;
                        Color c = images[i].color;
                        c.a = 1f - t;
                        images[i].color = c;
                    }

                    yield return null;
                }

                Destroy(host.gameObject);
            }
        }
    }
}
