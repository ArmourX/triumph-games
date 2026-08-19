using System;
using System.IO;
using MonsterCollect.Core.Analytics;
using UnityEngine;

namespace MonsterCollect.Core
{
    /// <summary>Captures unhandled exceptions and error logs for soft-launch diagnostics.</summary>
    public static class CrashReportingService
    {
        private const string CrashLogFileName = "crash_log.txt";
        private static bool initialized;

        public static void Initialize()
        {
            if (initialized)
            {
                return;
            }

            initialized = true;
            Application.logMessageReceived += OnLogMessage;
            AppDomain.CurrentDomain.UnhandledException += OnUnhandledException;
        }

        private static void OnUnhandledException(object sender, UnhandledExceptionEventArgs args)
        {
            if (args.ExceptionObject is Exception ex)
            {
                Report("unhandled_exception", ex.Message, ex.StackTrace);
            }
        }

        private static void OnLogMessage(string condition, string stackTrace, LogType type)
        {
            if (type != LogType.Exception && type != LogType.Error)
            {
                return;
            }

            Report(type == LogType.Exception ? "unity_exception" : "unity_error", condition, stackTrace);
        }

        private static void Report(string kind, string message, string stackTrace)
        {
            try
            {
                string path = Path.Combine(Application.persistentDataPath, CrashLogFileName);
                string entry =
                    $"[{DateTimeOffset.UtcNow:O}] {kind}\n{message}\n{stackTrace}\n---\n";
                File.AppendAllText(path, entry);

                GameAnalyticsService.Track("crash_report", new System.Collections.Generic.Dictionary<string, object>
                {
                    { "kind", kind },
                    { "message", message ?? string.Empty }
                });
            }
            catch
            {
                // Last-resort path — swallow to avoid recursive logging failures.
            }
        }
    }
}
