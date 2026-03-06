"use client";

import dynamic from "next/dynamic";

const EmployeeClient = dynamic(() => import("./EmployeeClient"), {
  ssr: false,
});

export default function EmployeePage() {
  return <EmployeeClient />;
}
