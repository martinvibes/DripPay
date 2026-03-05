"use client";

import { useAccount, useReadContract, useWriteContract } from "wagmi";
import {
  CONTRACTS,
  ORGANIZATION_FACTORY_ABI,
  ORGANIZATION_ABI,
  isContractsDeployed,
} from "@/lib/contracts";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

/**
 * Hook for organization factory interactions.
 *
 * - Create new organizations
 * - Fetch user's organizations
 */
export function useOrganizationFactory() {
  const { address } = useAccount();
  const { writeContract, isPending, isSuccess, data: hash } = useWriteContract();

  const createOrganization = (name: string, paymentToken: `0x${string}` = ZERO_ADDRESS) => {
    writeContract({
      address: CONTRACTS.organizationFactory,
      abi: ORGANIZATION_FACTORY_ABI,
      functionName: "createOrg",
      args: [name, paymentToken],
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
 * - Deposit tokens
 * - Read org data (including paymentToken, contractBalance, createdAt)
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

  const withdraw = (amount: bigint) => {
    if (!orgAddress) return;
    writeContract({
      address: orgAddress,
      abi: ORGANIZATION_ABI,
      functionName: "withdraw",
      args: [amount],
    });
  };

  const deposit = (amount: bigint, isETH: boolean) => {
    if (!orgAddress) return;
    if (isETH) {
      writeContract({
        address: orgAddress,
        abi: ORGANIZATION_ABI,
        functionName: "deposit",
        args: [BigInt(0)],
        value: amount,
      });
    } else {
      writeContract({
        address: orgAddress,
        abi: ORGANIZATION_ABI,
        functionName: "deposit",
        args: [amount],
      });
    }
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

  const { data: paymentToken } = useReadContract({
    address: orgAddress,
    abi: ORGANIZATION_ABI,
    functionName: "paymentToken",
    query: { enabled: !!orgAddress },
  });

  const { data: contractBalance, refetch: refetchBalance } = useReadContract({
    address: orgAddress,
    abi: ORGANIZATION_ABI,
    functionName: "getContractBalance",
    query: { enabled: !!orgAddress },
  });

  const { data: createdAt } = useReadContract({
    address: orgAddress,
    abi: ORGANIZATION_ABI,
    functionName: "createdAt",
    query: { enabled: !!orgAddress },
  });

  const isETH = !paymentToken || paymentToken === ZERO_ADDRESS;

  return {
    addEmployee,
    removeEmployee,
    runPayroll,
    withdraw,
    deposit,
    orgName: orgName as string | undefined,
    employees: (employees as `0x${string}`[] | undefined) ?? [],
    adminAddress: adminAddress as `0x${string}` | undefined,
    paymentToken: paymentToken as `0x${string}` | undefined,
    contractBalance: contractBalance as bigint | undefined,
    createdAt: createdAt as bigint | undefined,
    isETH,
    isPending,
    refetchEmployees,
    refetchBalance,
  };
}
