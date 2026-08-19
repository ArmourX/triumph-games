using System;
using MonsterCollect.Monster;

namespace MonsterCollect.Appearance
{
    /// <summary>Deterministic hash byte access for appearance and other systems.</summary>
    public static class MonsterHashUtility
    {
        public static byte[] GetHashBytes(MonsterData data)
        {
            if (data == null)
            {
                return new byte[32];
            }

            if (!string.IsNullOrEmpty(data.FullHash) && data.FullHash.Length >= 64)
            {
                return HexToBytes(data.FullHash);
            }

            if (!string.IsNullOrEmpty(data.Id) && IsHexString(data.Id) && data.Id.Length >= 32)
            {
                string padded = data.Id.PadRight(64, '0');
                return HexToBytes(padded);
            }

            return DeriveFallbackBytes(data.DexNumber, data.Name);
        }

        private static bool IsHexString(string value)
        {
            for (int i = 0; i < value.Length; i++)
            {
                char c = value[i];
                bool isHex = (c >= '0' && c <= '9') ||
                             (c >= 'a' && c <= 'f') ||
                             (c >= 'A' && c <= 'F');
                if (!isHex)
                {
                    return false;
                }
            }

            return true;
        }

        public static int HashByte(MonsterData data, int index)
        {
            byte[] hash = GetHashBytes(data);
            return hash[index % hash.Length];
        }

        private static byte[] DeriveFallbackBytes(int dexNumber, string name)
        {
            var bytes = new byte[32];
            bytes[0] = (byte)(dexNumber & 0xFF);
            bytes[1] = (byte)((dexNumber >> 8) & 0xFF);

            if (!string.IsNullOrEmpty(name))
            {
                for (int i = 0; i < name.Length && i < 30; i++)
                {
                    bytes[2 + i] = (byte)name[i];
                }
            }

            return bytes;
        }

        private static byte[] HexToBytes(string hex)
        {
            int length = hex.Length / 2;
            var bytes = new byte[length];

            for (int i = 0; i < length; i++)
            {
                bytes[i] = Convert.ToByte(hex.Substring(i * 2, 2), 16);
            }

            return bytes;
        }
    }
}
