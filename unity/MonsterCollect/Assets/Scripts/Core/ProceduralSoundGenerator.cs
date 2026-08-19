using UnityEngine;

namespace MonsterCollect.Core
{
    /// <summary>Generates tiny placeholder tones when no audio clips are imported yet.</summary>
    public static class ProceduralSoundGenerator
    {
        private const int SampleRate = 44100;

        public static AudioClip CreateTone(float frequencyHz, float durationSeconds, float volume = 0.25f)
        {
            int sampleCount = Mathf.Max(1, Mathf.RoundToInt(SampleRate * durationSeconds));
            var clip = AudioClip.Create(
                $"Tone_{frequencyHz:0}",
                sampleCount,
                1,
                SampleRate,
                false);

            var samples = new float[sampleCount];
            float fadeSamples = Mathf.Min(sampleCount * 0.1f, SampleRate * 0.02f);

            for (int i = 0; i < sampleCount; i++)
            {
                float t = i / (float)SampleRate;
                float envelope = 1f;

                if (i < fadeSamples)
                {
                    envelope = i / fadeSamples;
                }
                else if (i > sampleCount - fadeSamples)
                {
                    envelope = (sampleCount - i) / fadeSamples;
                }

                samples[i] = Mathf.Sin(2f * Mathf.PI * frequencyHz * t) * volume * envelope;
            }

            clip.SetData(samples, 0);
            return clip;
        }

        /// <summary>Soft ambient placeholder loop for ranch/scan scenes until music assets ship.</summary>
        public static AudioClip CreateAmbientLoop(float durationSeconds = 8f, float volume = 0.08f)
        {
            int sampleCount = Mathf.Max(1, Mathf.RoundToInt(SampleRate * durationSeconds));
            var clip = AudioClip.Create("AmbientLoop", sampleCount, 1, SampleRate, false);
            var samples = new float[sampleCount];

            for (int i = 0; i < sampleCount; i++)
            {
                float t = i / (float)SampleRate;
                float wave = Mathf.Sin(2f * Mathf.PI * 110f * t) * 0.45f +
                             Mathf.Sin(2f * Mathf.PI * 165f * t) * 0.25f +
                             Mathf.Sin(2f * Mathf.PI * 220f * t) * 0.15f;
                samples[i] = wave * volume;
            }

            clip.SetData(samples, 0);
            return clip;
        }
    }
}
