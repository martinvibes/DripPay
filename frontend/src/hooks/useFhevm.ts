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
        const encrypted = input.encrypt();
        return encrypted;
      } finally {
        setIsEncrypting(false);
      }
    },
    [address]
  );

  /**
   * Decrypt (re-encrypt) an encrypted balance handle.
   * Used when employee views their own balance.
   *
   * Flow: get handle from contract → generate keypair → sign EIP-712 →
   *       re-encrypt with user's key → return plaintext.
   */
  const decryptBalance = useCallback(
    async (handle: bigint, contractAddress: `0x${string}`) => {
      if (!address || !walletClient)
        throw new Error("Wallet not connected");

      setIsDecrypting(true);
      try {
        const instance = await getFhevmInstance();
        const { publicKey, privateKey } = instance.generateKeypair();
        const eip712 = instance.createEIP712(publicKey, contractAddress);

        // Sign the re-encryption request with the user's wallet
        // fhevmjs EIP-712 types need casting for viem compatibility
        const signature = await walletClient.signTypedData({
          account: address,
          ...(eip712 as Parameters<typeof walletClient.signTypedData>[0]),
        });

        const decrypted = await instance.reencrypt(
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
