"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePublicClient } from "wagmi";
import { type Abi, type Log } from "viem";

type EventLog = Log & {
  args: Record<string, any>;
  eventName: string;
};

/**
 * Hook that watches for NEW contract events from the current block onward.
 * Does NOT fetch historical events — only captures events that happen
 * while the user has the page open. Call `refetch` after a transaction
 * to do a one-time fetch of recent blocks.
 */
export function useContractEvents({
  address,
  abi,
  eventName,
  args,
  enabled = true,
}: {
  address?: `0x${string}`;
  abi: Abi;
  eventName: string;
  args?: Record<string, any>;
  enabled?: boolean;
}) {
  const publicClient = usePublicClient();
  const [events, setEvents] = useState<EventLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const startBlockRef = useRef<bigint | null>(null);

  const mergeEvents = useCallback((newLogs: EventLog[]) => {
    setEvents((prev) => {
      const merged = [...newLogs, ...prev];
      const seen = new Set<string>();
      return merged
        .filter((e) => {
          const key = `${e.transactionHash}-${e.logIndex}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .sort((a, b) =>
          Number((b.blockNumber ?? BigInt(0)) - (a.blockNumber ?? BigInt(0)))
        );
    });
  }, []);

  // Initial fetch of recent blocks + watch for new events
  useEffect(() => {
    if (!publicClient || !address || !enabled) return;

    let cancelled = false;

    // Fetch recent events (single RPC call — last ~10000 blocks, ~33 hours on Sepolia)
    publicClient.getBlockNumber().then(async (currentBlock) => {
      if (cancelled) return;
      startBlockRef.current = currentBlock;
      setIsLoading(true);
      try {
        const fromBlock = currentBlock > BigInt(10000) ? currentBlock - BigInt(10000) : BigInt(0);
        const logs = await publicClient.getContractEvents({
          address, abi, eventName, args, fromBlock,
        });
        if (!cancelled) mergeEvents(logs as unknown as EventLog[]);
      } catch {
        // Silently handle
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }).catch(() => {});

    // Watch for live events going forward
    const unwatch = publicClient.watchContractEvent({
      address,
      abi,
      eventName,
      args,
      onLogs: (logs) => {
        if (!cancelled) mergeEvents(logs as unknown as EventLog[]);
      },
    });

    return () => {
      cancelled = true;
      unwatch();
    };
  }, [publicClient, address, abi, eventName, args, enabled, mergeEvents]);

  // Manual refetch: fetches events from startBlock to now (e.g. after a tx)
  const refetch = useCallback(async () => {
    if (!publicClient || !address || !enabled) return;

    setIsLoading(true);
    try {
      const fromBlock = startBlockRef.current ?? (await publicClient.getBlockNumber()) - BigInt(50);
      const logs = await publicClient.getContractEvents({
        address,
        abi,
        eventName,
        args,
        fromBlock,
      });

      const sorted = (logs as unknown as EventLog[]).sort((a, b) =>
        Number((b.blockNumber ?? BigInt(0)) - (a.blockNumber ?? BigInt(0)))
      );
      setEvents(sorted);
    } catch {
      // Silently handle RPC errors
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, address, abi, eventName, args, enabled]);

  return { events, isLoading, refetch };
}
