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

        // Relayer SDK createEIP712 signature:
        // createEIP712(publicKey, contractAddresses[], startTimestamp, durationDays)
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

        // Use the instance's userDecrypt method
        const decrypted = await (instance as any).userDecrypt(
          handle,
          privateKey,
          publicKey,
          signature,
          contractAddress,
          address
        );

        return decrypted;
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
