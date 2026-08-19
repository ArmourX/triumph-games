using System;
using UnityEngine;

namespace MonsterCollect.Ranch
{
    /// <summary>Light day/night and weather cycle using local device time (offline-friendly).</summary>
    public static class WorldCycleService
    {
        public static DayPhase CurrentDayPhase => GetDayPhase(DateTime.Now);
        public static WeatherKind CurrentWeather => GetWeatherForDate(DateTime.Now);

        public static string GetSummary()
        {
            return $"{CurrentDayPhase} · {CurrentWeather}";
        }

        public static float GetTrainingSuccessMultiplier()
        {
            float value = 1f;
            switch (CurrentDayPhase)
            {
                case DayPhase.Morning:
                    value += 0.1f;
                    break;
                case DayPhase.Evening:
                    value += 0.05f;
                    break;
                case DayPhase.Night:
                    value -= 0.15f;
                    break;
            }

            switch (CurrentWeather)
            {
                case WeatherKind.Sunny:
                    value += 0.08f;
                    break;
                case WeatherKind.Rain:
                    value -= 0.05f;
                    break;
                case WeatherKind.Storm:
                    value -= 0.12f;
                    break;
            }

            return Mathf.Clamp(value, 0.55f, 1.35f);
        }

        public static float GetExplorationRewardMultiplier()
        {
            float value = 1f;
            switch (CurrentDayPhase)
            {
                case DayPhase.Afternoon:
                    value += 0.1f;
                    break;
                case DayPhase.Night:
                    value += 0.15f;
                    break;
            }

            switch (CurrentWeather)
            {
                case WeatherKind.Rain:
                    value += 0.12f;
                    break;
                case WeatherKind.Storm:
                    value += 0.08f;
                    break;
                case WeatherKind.Sunny:
                    value += 0.05f;
                    break;
            }

            return Mathf.Clamp(value, 0.7f, 1.45f);
        }

        public static float GetWildEncounterMultiplier()
        {
            float value = 1f;
            if (CurrentDayPhase == DayPhase.Night)
            {
                value += 0.25f;
            }

            if (CurrentWeather == WeatherKind.Storm)
            {
                value += 0.2f;
            }
            else if (CurrentWeather == WeatherKind.Rain)
            {
                value += 0.1f;
            }

            return Mathf.Clamp(value, 0.5f, 1.75f);
        }

        public static DayPhase GetDayPhase(DateTime localTime)
        {
            int hour = localTime.Hour;
            if (hour >= 6 && hour < 12)
            {
                return DayPhase.Morning;
            }

            if (hour >= 12 && hour < 18)
            {
                return DayPhase.Afternoon;
            }

            if (hour >= 18 && hour < 22)
            {
                return DayPhase.Evening;
            }

            return DayPhase.Night;
        }

        public static WeatherKind GetWeatherForDate(DateTime localTime)
        {
            int seed = localTime.Year * 1000 + localTime.DayOfYear;
            var rng = new System.Random(seed);
            int roll = rng.Next(100);

            if (roll < 40)
            {
                return WeatherKind.Clear;
            }

            if (roll < 65)
            {
                return WeatherKind.Sunny;
            }

            if (roll < 85)
            {
                return WeatherKind.Rain;
            }

            return WeatherKind.Storm;
        }
    }
}
