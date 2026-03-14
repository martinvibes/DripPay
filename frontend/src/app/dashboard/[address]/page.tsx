"use client";

import dynamic from "next/dynamic";
import { use } from "react";

const OrgDashboard = dynamic(() => import("./OrgDashboard"), { ssr: false });

export default function OrgDashboardPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  return <OrgDashboard address={address as `0x${string}`} />;
}
