using System;
using System.Collections.Generic;

namespace MonsterCollect.QR
{
    /// <summary>
    /// Minimal dispatcher so background threads (e.g. ZXing decode) can run UI callbacks on Unity's main thread.
    /// Auto-created before the first scene loads.
    /// </summary>
    public sealed class UnityMainThreadDispatcher : UnityEngine.MonoBehaviour
    {
        private static readonly Queue<Action> Queue = new Queue<Action>();
        private static UnityMainThreadDispatcher instance;

        [UnityEngine.RuntimeInitializeOnLoadMethod(UnityEngine.RuntimeInitializeLoadType.BeforeSceneLoad)]
        private static void Bootstrap()
        {
            if (instance != null)
            {
                return;
            }

            var go = new UnityEngine.GameObject(nameof(UnityMainThreadDispatcher));
            instance = go.AddComponent<UnityMainThreadDispatcher>();
            UnityEngine.Object.DontDestroyOnLoad(go);
        }

        /// <summary>Enqueue an action to run on the next Update tick.</summary>
        public static void Enqueue(Action action)
        {
            if (action == null)
            {
                return;
            }

            lock (Queue)
            {
                Queue.Enqueue(action);
            }
        }

        private void Update()
        {
            while (true)
            {
                Action action;

                lock (Queue)
                {
                    if (Queue.Count == 0)
                    {
                        break;
                    }

                    action = Queue.Dequeue();
                }

                action.Invoke();
            }
        }
    }
}
