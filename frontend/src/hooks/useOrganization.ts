"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import {
  CONTRACTS,
  ORGANIZATION_FACTORY_ABI,
  ORGANIZATION_ABI,
  isContractsDeployed,
} from "@/lib/contracts";

/**
 * Hook for organization factory interactions.
 *
 * - Create new organizations
 * - Fetch user's organizations
 */
export function useOrganizationFactory() {
  const { address } = useAccount();
  const { writeContract, isPending, isSuccess, data: hash } = useWriteContract();

  const createOrganization = (name: string) => {
    writeContract({
      address: CONTRACTS.organizationFactory,
      abi: ORGANIZATION_FACTORY_ABI,
      functionName: "createOrg",
      args: [name],
    });
  };

  const {
    data: organizations,
    isLoading: isLoadingOrgs,
    refetch: refetchOrgs,
  } = useReadContract({
    address: CONTRACTS.organizationFactory,
    abi: ORGANIZATION_FACTORY_ABI,
    functionName: "getOrganizations",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isContractsDeployed },
  });

  return {
    createOrganization,
    organizations: (organizations as `0x${string}`[] | undefined) ?? [],
    isCreating: isPending,
    isCreated: isSuccess,
    txHash: hash,
    isLoadingOrgs,
    refetchOrgs,
  };
}

/**
 * Hook for single organization interactions.
 *
 * - Add/remove employees
 * - Run payroll
 * - Read org data
 */
export function useOrganization(orgAddress?: `0x${string}`) {
  const { writeContract, isPending } = useWriteContract();

  const addEmployee = (
    employee: `0x${string}`,
    encryptedSalary: `0x${string}`,
    proof: `0x${string}`
  ) => {
    if (!orgAddress) return;
    writeContract({
      address: orgAddress,
      abi: ORGANIZATION_ABI,
      functionName: "addEmployee",
      args: [employee, encryptedSalary, proof],
    });
  };

  const removeEmployee = (employee: `0x${string}`) => {
    if (!orgAddress) return;
    writeContract({
      address: orgAddress,
      abi: ORGANIZATION_ABI,
      functionName: "removeEmployee",
      args: [employee],
    });
  };

  const runPayroll = () => {
    if (!orgAddress) return;
    writeContract({
      address: orgAddress,
      abi: ORGANIZATION_ABI,
      functionName: "runPayroll",
    });
  };

  const withdraw = (
    encryptedAmount: `0x${string}`,
    proof: `0x${string}`
  ) => {
    if (!orgAddress) return;
    writeContract({
      address: orgAddress,
      abi: ORGANIZATION_ABI,
      functionName: "withdraw",
      args: [encryptedAmount, proof],
    });
  };

  // Read org data
  const { data: orgName } = useReadContract({
    address: orgAddress,
    abi: ORGANIZATION_ABI,
    functionName: "name",
    query: { enabled: !!orgAddress },
  });

  const { data: employees, refetch: refetchEmployees } = useReadContract({
    address: orgAddress,
    abi: ORGANIZATION_ABI,
    functionName: "getEmployees",
    query: { enabled: !!orgAddress },
  });

  const { data: adminAddress } = useReadContract({
    address: orgAddress,
    abi: ORGANIZATION_ABI,
    functionName: "admin",
    query: { enabled: !!orgAddress },
  });

  return {
    addEmployee,
    removeEmployee,
    runPayroll,
    withdraw,
    orgName: orgName as string | undefined,
    employees: (employees as `0x${string}`[] | undefined) ?? [],
    adminAddress: adminAddress as `0x${string}` | undefined,
    isPending,
    refetchEmployees,
  };
}
