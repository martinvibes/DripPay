import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "viem/chains";
import { http } from "viem";

/**
 * DripPay deploys on Ethereum Sepolia with Zama's fhEVM coprocessor.
 * The contracts live on Sepolia, FHE computations are handled by
 * Zama's coprocessor network off-chain.
 *
 * Uses Infura RPC instead of the default free public RPC (ThirdWeb)
 * which is heavily rate-limited and causes event fetches to fail.
 */
const INFURA_URL = process.env.NEXT_PUBLIC_FHEVM_NETWORK_URL;

export const config = getDefaultConfig({
  appName: "DripPay",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "PLACEHOLDER",
  chains: [sepolia],
  ssr: true,
  transports: INFURA_URL
    ? { [sepolia.id]: http(INFURA_URL) }
    : undefined,
});
