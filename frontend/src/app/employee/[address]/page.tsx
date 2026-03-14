"use client";

import dynamic from "next/dynamic";
import { use } from "react";

const EmployeeBalance = dynamic(() => import("./EmployeeBalance"), { ssr: false });

export default function EmployeeBalancePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  return <EmployeeBalance orgAddress={address as `0x${string}`} />;
}
