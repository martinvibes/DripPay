import {
  initSDK,
  createInstance,
  SepoliaConfig,
  type FhevmInstance,
} from "@zama-fhe/relayer-sdk/web";

let instance: FhevmInstance | null = null;
let sdkInitialized = false;

/**
 * Get or create the fhEVM instance.
 * Uses Zama's relayer SDK with the official SepoliaConfig.
 * Pre-initializes WASM from /public/wasm/ to avoid import.meta.url issues.
 */
export async function getFhevmInstance(): Promise<FhevmInstance> {
  if (instance) return instance;

  // Initialize WASM modules from public directory
  if (!sdkInitialized) {
    await initSDK({
      tfheParams: "/wasm/tfhe_bg.wasm",
      kmsParams: "/wasm/kms_lib_bg.wasm",
    });
    sdkInitialized = true;
  }

  instance = await createInstance({
    ...SepoliaConfig,
    network:
      process.env.NEXT_PUBLIC_FHEVM_NETWORK_URL ||
      "https://sepolia.infura.io/v3/bf008ee040c7429eb8d8784e52f28d10",
  });

  return instance;
}

/**
 * Reset the fhEVM instance (e.g. on network change).
 */
export function resetFhevmInstance() {
  instance = null;
}
