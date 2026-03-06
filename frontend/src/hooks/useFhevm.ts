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
   * Decrypt (re-encrypt) an encrypted balance handle.
   * Uses the relayer SDK's user decryption flow.
   *
   * Note: The relayer SDK uses createEIP712 with different params than fhevmjs.
   * Full implementation requires: contractAddresses[], startTimestamp, durationDays.
   */
  const decryptBalance = useCallback(
    async (handle: bigint, contractAddress: `0x${string}`) => {
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

        // Convert bigint handle to hex string for the SDK
        const handleHex = ("0x" + handle.toString(16).padStart(64, "0")) as `0x${string}`;
        console.log("[useFhevm] handleHex:", handleHex);
        console.log("[useFhevm] contractAddress:", contractAddress);
        console.log("[useFhevm] userAddress:", address);

        // userDecrypt expects HandleContractPair[], not a single handle
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

        console.log("[useFhevm] Full results object:", results);
        console.log("[useFhevm] Results keys:", Object.keys(results));
        console.log("[useFhevm] Results entries:", Object.entries(results).map(([k, v]) => `${k} => ${v} (${typeof v})`));

        // Results is Record<`0x${string}`, bigint | boolean | `0x${string}`>
        // Extract the value for our handle
        const value = results[handleHex];
        console.log("[useFhevm] Lookup by handleHex:", value, "type:", typeof value);
        if (value === undefined) {
          // Try to find any result
          const keys = Object.keys(results);
          console.log("[useFhevm] Value undefined, trying first key from", keys.length, "keys");
          if (keys.length > 0) {
            const fallback = results[keys[0] as `0x${string}`];
            console.log("[useFhevm] Fallback value:", fallback, "type:", typeof fallback);
            return fallback;
          }
          throw new Error("No decryption result returned");
        }
        return value;
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
