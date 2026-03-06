"use client";

import { useState, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { getFhevmInstance } from "@/lib/fhevm";

/**
 * Hook for fhEVM encrypt/decrypt operations.
 *
 * - encryptUint64: encrypts a plaintext salary before sending to contract
 * - decryptBalance: re-encrypts a handle so only the user can read it
 */
export function useFhevm() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  /**
   * Encrypt a uint64 value for a specific contract.
   * Used when employer sets an employee's salary.
   */
  const encryptUint64 = useCallback(
    async (value: number, contractAddress: `0x${string}`) => {
      if (!address) throw new Error("Wallet not connected");

      setIsEncrypting(true);
      try {
        const instance = await getFhevmInstance();
        const input = instance.createEncryptedInput(
          contractAddress,
          address
        );
        input.add64(value);
        const encrypted = await input.encrypt();
        return encrypted;
      } finally {
        setIsEncrypting(false);
      }
    },
    [address]
  );

  /**
   * Decrypt an encrypted balance handle.
   * Matches Zama's official useFHEDecrypt pattern:
   * - Pass handle directly as hex string (no BigInt conversion)
   * - Uses createEIP712 + userDecrypt with contractAddresses[], startTimestamp, durationDays
   */
  const decryptBalance = useCallback(
    async (handleHex: `0x${string}`, contractAddress: `0x${string}`) => {
      if (!address || !walletClient)
        throw new Error("Wallet not connected");

      setIsDecrypting(true);
      try {
        const instance = await getFhevmInstance();
        const { publicKey, privateKey } = instance.generateKeypair();

        const now = Math.floor(Date.now() / 1000);
        const eip712 = instance.createEIP712(
          publicKey,
          [contractAddress],
          now,
          1, // 1 day validity
        );

        const signature = await walletClient.signTypedData({
          account: address,
          ...(eip712 as any),
        });

        console.log("[useFhevm] handleHex:", handleHex);
        console.log("[useFhevm] contractAddress:", contractAddress);
        console.log("[useFhevm] userAddress:", address);

        // Pass handle directly as hex string — matches Zama's official pattern
        const results = await instance.userDecrypt(
          [{ handle: handleHex, contractAddress }],
          privateKey,
          publicKey,
          signature,
          [contractAddress],
          address,
          now,
          1,
        );

        console.log("[useFhevm] Full results:", results);

        // Results is Record<`0x${string}`, bigint | boolean | `0x${string}`>
        // Try exact key match first, then fallback to first result
        const value = results[handleHex];
        if (value !== undefined) {
          console.log("[useFhevm] Decrypted value:", value, "type:", typeof value);
          return value;
        }

        // Key might differ in case — try case-insensitive lookup
        const lowerHandle = handleHex.toLowerCase();
        for (const [key, val] of Object.entries(results)) {
          if (key.toLowerCase() === lowerHandle) {
            console.log("[useFhevm] Decrypted value (case-insensitive):", val);
            return val;
          }
        }

        // Last resort: return first value
        const keys = Object.keys(results);
        if (keys.length > 0) {
          const fallback = results[keys[0] as `0x${string}`];
          console.log("[useFhevm] Fallback value:", fallback);
          return fallback;
        }

        throw new Error("No decryption result returned");
      } finally {
        setIsDecrypting(false);
      }
    },
    [address, walletClient]
  );

  return {
    encryptUint64,
    decryptBalance,
    isEncrypting,
    isDecrypting,
    isReady: !!address && !!walletClient,
  };
}
