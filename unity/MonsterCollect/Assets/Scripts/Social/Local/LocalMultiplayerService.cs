using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using MonsterCollect.QR;
using UnityEngine;

namespace MonsterCollect.Social.Local
{
    public readonly struct NearbyPeer
    {
        public string DisplayName { get; }
        public string FriendCode { get; }
        public string Address { get; }
        public int Port { get; }
        public double LastSeenUtc { get; }

        public NearbyPeer(string displayName, string friendCode, string address, int port, double lastSeenUtc)
        {
            DisplayName = displayName;
            FriendCode = friendCode;
            Address = address;
            Port = port;
            LastSeenUtc = lastSeenUtc;
        }
    }

    /// <summary>UDP discovery + TCP messaging for same-Wi-Fi nearby play.</summary>
    public static class LocalMultiplayerService
    {
        private static readonly Dictionary<string, NearbyPeer> Peers = new Dictionary<string, NearbyPeer>();
        private static readonly object Gate = new object();

        private static Thread discoveryThread;
        private static Thread listenerThread;
        private static volatile bool running;
        private static UdpClient broadcastClient;
        private static UdpClient listenClient;
        private static TcpListener tcpListener;
        private static int sessionPort = LanProtocol.DefaultSessionPort;

        public static event Action PeersChanged;
        public static event Action<LanEnvelope, string> MessageReceived;
        public static event Action<string> StatusChanged;

        public static bool IsRunning => running;

        public static IReadOnlyList<NearbyPeer> GetNearbyPeers()
        {
            lock (Gate)
            {
                PrunePeers();
                return new List<NearbyPeer>(Peers.Values);
            }
        }

        public static void Start()
        {
            if (running)
            {
                return;
            }

            SocialProfileService.EnsureReady();
            SocialProfileService.EnsureFriendCodeAssigned();
            running = true;
            sessionPort = FindFreePort(LanProtocol.DefaultSessionPort);

            discoveryThread = new Thread(DiscoveryLoop) { IsBackground = true, Name = "LanDiscovery" };
            listenerThread = new Thread(SessionListenerLoop) { IsBackground = true, Name = "LanSession" };
            discoveryThread.Start();
            listenerThread.Start();

            RaiseStatus($"Nearby play active on port {sessionPort}");
        }

        public static void Stop()
        {
            running = false;

            try { broadcastClient?.Close(); } catch { /* ignore */ }
            try { listenClient?.Close(); } catch { /* ignore */ }
            try { tcpListener?.Stop(); } catch { /* ignore */ }

            lock (Gate)
            {
                Peers.Clear();
            }

            PeersChanged?.Invoke();
            RaiseStatus("Nearby play stopped.");
        }

        public static void SendToPeer(NearbyPeer peer, LanEnvelope envelope)
        {
            if (peer.Address == null)
            {
                return;
            }

            ThreadPool.QueueUserWorkItem(_ =>
            {
                try
                {
                    using var client = new TcpClient();
                    client.Connect(peer.Address, peer.Port > 0 ? peer.Port : sessionPort);
                    WriteEnvelope(client, envelope);
                }
                catch (Exception ex)
                {
                    RaiseStatus($"Send failed: {ex.Message}");
                }
            });
        }

        public static void SendTradeOffer(NearbyPeer peer, string monsterPayload, string requestedPayload = null)
        {
            SendToPeer(peer, new LanEnvelope
            {
                t = LanMessageTypes.TradeOffer,
                code = SocialProfileService.FriendCode,
                name = SocialProfileService.DisplayName,
                offerId = Guid.NewGuid().ToString("N").Substring(0, 10),
                payload = monsterPayload,
                wantPayload = requestedPayload ?? string.Empty
            });
        }

        public static void SendBattleInvite(NearbyPeer peer, string monsterPayload, string inviteId = null)
        {
            SendToPeer(peer, new LanEnvelope
            {
                t = LanMessageTypes.BattleInvite,
                code = SocialProfileService.FriendCode,
                name = SocialProfileService.DisplayName,
                inviteId = inviteId ?? Guid.NewGuid().ToString("N").Substring(0, 10),
                payload = monsterPayload,
                seed = UnityEngine.Random.Range(1, int.MaxValue)
            });
        }

        public static void SendBattleAccept(NearbyPeer peer, string inviteId, string monsterPayload, int seed)
        {
            SendToPeer(peer, new LanEnvelope
            {
                t = LanMessageTypes.BattleAccept,
                code = SocialProfileService.FriendCode,
                name = SocialProfileService.DisplayName,
                inviteId = inviteId,
                payload = monsterPayload,
                seed = seed
            });
        }

        public static void SendBattleResult(NearbyPeer peer, string inviteId, string outcome, string checksum, int seed)
        {
            SendToPeer(peer, new LanEnvelope
            {
                t = LanMessageTypes.BattleResult,
                code = SocialProfileService.FriendCode,
                inviteId = inviteId,
                outcome = outcome,
                checksum = checksum,
                seed = seed
            });
        }

        private static void DiscoveryLoop()
        {
            try
            {
                listenClient = new UdpClient(LanProtocol.DiscoveryPort);
                listenClient.EnableBroadcast = true;

                broadcastClient = new UdpClient();
                broadcastClient.EnableBroadcast = true;

                while (running)
                {
                    BroadcastHello();
                    if (listenClient.Available > 0)
                    {
                        IPEndPoint remote = new IPEndPoint(IPAddress.Any, 0);
                        byte[] data = listenClient.Receive(ref remote);
                        HandleDiscoveryPacket(data, remote);
                    }
                    else
                    {
                        Thread.Sleep(200);
                    }
                }
            }
            catch (Exception ex)
            {
                RaiseStatus($"Discovery error: {ex.Message}");
            }
        }

        private static void BroadcastHello()
        {
            var envelope = new LanEnvelope
            {
                t = LanMessageTypes.Hello,
                name = SocialProfileService.DisplayName,
                code = SocialProfileService.FriendCode,
                port = sessionPort
            };

            byte[] bytes = Encoding.UTF8.GetBytes(LanProtocol.Serialize(envelope));
            broadcastClient.Send(bytes, bytes.Length, new IPEndPoint(IPAddress.Broadcast, LanProtocol.DiscoveryPort));
            Thread.Sleep(1800);
        }

        private static void HandleDiscoveryPacket(byte[] data, IPEndPoint remote)
        {
            string json = Encoding.UTF8.GetString(data);
            if (!LanProtocol.TryDeserialize(json, out LanEnvelope envelope) || envelope.t != LanMessageTypes.Hello)
            {
                return;
            }

            if (envelope.code == SocialProfileService.FriendCode)
            {
                return;
            }

            string key = envelope.code ?? remote.Address.ToString();
            var peer = new NearbyPeer(
                envelope.name ?? "Trainer",
                envelope.code ?? string.Empty,
                remote.Address.ToString(),
                envelope.port > 0 ? envelope.port : LanProtocol.DefaultSessionPort,
                DateTimeOffset.UtcNow.ToUnixTimeSeconds());

            bool changed;
            lock (Gate)
            {
                changed = !Peers.TryGetValue(key, out NearbyPeer existing) || existing.Address != peer.Address;
                Peers[key] = peer;
            }

            if (changed)
            {
                UnityMainThreadDispatcher.Enqueue(() => PeersChanged?.Invoke());
            }
        }

        private static void SessionListenerLoop()
        {
            try
            {
                tcpListener = new TcpListener(IPAddress.Any, sessionPort);
                tcpListener.Start();

                while (running)
                {
                    if (!tcpListener.Pending())
                    {
                        Thread.Sleep(50);
                        continue;
                    }

                    TcpClient client = tcpListener.AcceptTcpClient();
                    ThreadPool.QueueUserWorkItem(_ => HandleIncomingClient(client));
                }
            }
            catch (Exception ex)
            {
                if (running)
                {
                    RaiseStatus($"Session listener error: {ex.Message}");
                }
            }
        }

        private static void HandleIncomingClient(TcpClient client)
        {
            using (client)
            {
                try
                {
                    if (!TryReadEnvelope(client, out LanEnvelope envelope))
                    {
                        return;
                    }

                    UnityMainThreadDispatcher.Enqueue(() =>
                        MessageReceived?.Invoke(envelope, client.Client?.RemoteEndPoint?.ToString() ?? string.Empty));
                }
                catch (Exception ex)
                {
                    RaiseStatus($"Incoming session error: {ex.Message}");
                }
            }
        }

        private static void WriteEnvelope(TcpClient client, LanEnvelope envelope)
        {
            string json = LanProtocol.Serialize(envelope);
            byte[] payload = Encoding.UTF8.GetBytes(json + "\n");
            client.GetStream().Write(payload, 0, payload.Length);
        }

        private static bool TryReadEnvelope(TcpClient client, out LanEnvelope envelope)
        {
            envelope = null;
            var buffer = new byte[8192];
            int read = client.GetStream().Read(buffer, 0, buffer.Length);

            if (read <= 0)
            {
                return false;
            }

            string json = Encoding.UTF8.GetString(buffer, 0, read).Trim();
            return LanProtocol.TryDeserialize(json, out envelope);
        }

        private static void PrunePeers()
        {
            double now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var stale = new List<string>();

            foreach (KeyValuePair<string, NearbyPeer> pair in Peers)
            {
                if (now - pair.Value.LastSeenUtc > 12d)
                {
                    stale.Add(pair.Key);
                }
            }

            foreach (string key in stale)
            {
                Peers.Remove(key);
            }
        }

        private static int FindFreePort(int preferred)
        {
            for (int port = preferred; port < preferred + 20; port++)
            {
                try
                {
                    var listener = new TcpListener(IPAddress.Any, port);
                    listener.Start();
                    listener.Stop();
                    return port;
                }
                catch
                {
                    // try next
                }
            }

            return preferred;
        }

        private static void RaiseStatus(string message)
        {
            UnityMainThreadDispatcher.Enqueue(() => StatusChanged?.Invoke(message));
        }
    }
}
