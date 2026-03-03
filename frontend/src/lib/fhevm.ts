import { createInstance, type FhevmInstance } from "fhevmjs";

let instance: FhevmInstance | null = null;

/**
 * fhEVM coprocessor configuration for Ethereum Sepolia.
 * Zama's coprocessor handles FHE operations off-chain while
 * contracts live on Sepolia.
 */
const FHEVM_CONFIG = {
  networkUrl:
    process.env.NEXT_PUBLIC_FHEVM_NETWORK_URL ||
    "https://eth-sepolia.public.blastapi.io",
  gatewayUrl:
    process.env.NEXT_PUBLIC_FHEVM_GATEWAY_URL ||
    "https://gateway.zama.ai",
  aclContractAddress:
    process.env.NEXT_PUBLIC_ACL_CONTRACT_ADDRESS ||
    "0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D",
  kmsContractAddress:
    process.env.NEXT_PUBLIC_KMS_CONTRACT_ADDRESS ||
    "0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A",
};

/**
 * Get or create the fhEVM instance.
 * Singleton — reuses the same instance across the app.
 */
export async function getFhevmInstance(): Promise<FhevmInstance> {
  if (instance) return instance;

  instance = await createInstance({
    networkUrl: FHEVM_CONFIG.networkUrl,
    gatewayUrl: FHEVM_CONFIG.gatewayUrl,
    aclContractAddress: FHEVM_CONFIG.aclContractAddress,
    kmsContractAddress: FHEVM_CONFIG.kmsContractAddress,
  });

  return instance;
}

/**
 * Reset the fhEVM instance (e.g. on network change).
 */
export function resetFhevmInstance() {
  instance = null;
}
