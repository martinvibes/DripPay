"use client";

import { useState, useEffect } from "react";

const CACHE_KEY = "drippay_eth_price";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedPrice {
  price: number;
  timestamp: number;
}

function getCachedPrice(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedPrice = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) return null;
    return cached.price;
  } catch {
    return null;
  }
}

function setCachedPrice(price: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_KEY, JSON.stringify({ price, timestamp: Date.now() }));
}

/**
 * Fetches current ETH/USD price from CoinGecko's free API.
 * Caches for 5 minutes to avoid rate limits.
 */
export function useEthPrice() {
  const [ethPrice, setEthPrice] = useState<number | null>(getCachedPrice);

  useEffect(() => {
    // If we have a valid cache, skip fetch
    if (ethPrice !== null) return;

    let cancelled = false;

    async function fetchPrice() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        if (!res.ok) return;
        const data = await res.json();
        const price = data?.ethereum?.usd;
        if (price && !cancelled) {
          setEthPrice(price);
          setCachedPrice(price);
        }
      } catch {
        // Silently fail - USD estimate is optional
      }
    }

    fetchPrice();
    return () => { cancelled = true; };
  }, []);

  return ethPrice;
}

/**
 * Format a USD value nicely.
 * e.g. 12345.67 → "$12,345.67"
 */
export function formatUsd(amount: number): string {
  if (amount < 0.01) return "<$0.01";
  return "$" + amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
