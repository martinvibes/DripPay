"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
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
 * Hook for fetching organizations an employee belongs to.
 * Uses the factory's getEmployeeOrganizations(address) view.
 */
export function useEmployeeOrganizations() {
  const { address } = useAccount();

  const {
    data: employeeOrgs,
    isLoading: isLoadingEmployeeOrgs,
    refetch: refetchEmployeeOrgs,
  } = useReadContract({
    address: CONTRACTS.organizationFactory,
    abi: ORGANIZATION_FACTORY_ABI,
    functionName: "getEmployeeOrganizations",
    args: address ? [address] : undefined,
    query: { enabled: !!address && isContractsDeployed },
  });

  return {
    employeeOrgs: (employeeOrgs as `0x${string}`[] | undefined) ?? [],
    isLoadingEmployeeOrgs,
    refetchEmployeeOrgs,
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
  const { writeContract, isPending, data: txHash, reset: resetTx } = useWriteContract();
  const {
    writeContract: writeRemove,
    data: removeTxHash,
    reset: resetRemove,
  } = useWriteContract();

  // Track which specific employee address is being removed
  const [removingAddress, setRemovingAddress] = useState<`0x${string}` | null>(null);

  // Wait for remove tx to confirm on-chain
  const { isSuccess: isRemoveConfirmed } = useWaitForTransactionReceipt({
    hash: removeTxHash,
    query: { enabled: !!removeTxHash },
  });

  const addEmployees = (
    employees: `0x${string}`[],
    encryptedSalaries: `0x${string}`[],
    proof: `0x${string}`
  ) => {
    if (!orgAddress) return;
    writeContract({
      address: orgAddress,
      abi: ORGANIZATION_ABI,
      functionName: "addEmployees",
      args: [employees, encryptedSalaries, proof],
    });
  };

  const removeEmployee = (employee: `0x${string}`) => {
    if (!orgAddress) return;
    setRemovingAddress(employee);
    writeRemove(
      {
        address: orgAddress,
        abi: ORGANIZATION_ABI,
        functionName: "removeEmployee",
        args: [employee],
      },
      {
        onError: () => setRemovingAddress(null),
      }
    );
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

  const updateSalary = (
    employee: `0x${string}`,
    encryptedSalary: `0x${string}`,
    proof: `0x${string}`
  ) => {
    if (!orgAddress) return;
    writeContract({
      address: orgAddress,
      abi: ORGANIZATION_ABI,
      functionName: "updateSalary",
      args: [employee, encryptedSalary, proof],
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

  const { data: payrollRunCount } = useReadContract({
    address: orgAddress,
    abi: ORGANIZATION_ABI,
    functionName: "payrollRunCount",
    query: { enabled: !!orgAddress },
  });

  const isETH = !paymentToken || paymentToken === ZERO_ADDRESS;

  // When remove tx confirms on-chain, refetch employees and clear state
  useEffect(() => {
    if (isRemoveConfirmed && removingAddress) {
      refetchEmployees();
      setRemovingAddress(null);
      resetRemove();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRemoveConfirmed]);

  return {
    addEmployees,
    removeEmployee,
    runPayroll,
    withdraw,
    deposit,
    updateSalary,
    orgName: orgName as string | undefined,
    employees: (employees as `0x${string}`[] | undefined) ?? [],
    adminAddress: adminAddress as `0x${string}` | undefined,
    paymentToken: paymentToken as `0x${string}` | undefined,
    contractBalance: contractBalance as bigint | undefined,
    createdAt: createdAt as bigint | undefined,
    payrollRunCount: payrollRunCount as bigint | undefined,
    isETH,
    isPending,
    removingAddress,
    txHash,
    resetTx,
    refetchEmployees,
    refetchBalance,
  };
}
