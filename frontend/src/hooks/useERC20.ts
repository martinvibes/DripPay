"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ERC20_ABI } from "@/lib/contracts";

/**
 * Hook for ERC-20 token interactions.
 *
 * - Approve spender
 * - Read: allowance, balanceOf, symbol, decimals
 */
export function useERC20(tokenAddress?: `0x${string}`, spender?: `0x${string}`) {
  const { address } = useAccount();
  const { writeContract, isPending: isApproving, data: approveTxHash } = useWriteContract();

  const approve = (amount: bigint) => {
    if (!tokenAddress || !spender) return;
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spender, amount],
    });
  };

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && spender ? [address, spender] : undefined,
    query: { enabled: !!tokenAddress && !!address && !!spender },
  });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!tokenAddress && !!address },
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: { enabled: !!tokenAddress },
  });

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: { enabled: !!tokenAddress },
  });

  return {
    approve,
    isApproving,
    approveTxHash,
    allowance: allowance as bigint | undefined,
    balance: balance as bigint | undefined,
    symbol: symbol as string | undefined,
    decimals: decimals as number | undefined,
    refetchAllowance,
    refetchBalance,
  };
}
