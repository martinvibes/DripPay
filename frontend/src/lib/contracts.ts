const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as `0x${string}`;

/**
 * Contract addresses — update after deployment.
 * These are placeholders until contracts are deployed to Ethereum Sepolia.
 */
export const CONTRACTS = {
  organizationFactory:
    (process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`) || ZERO_ADDRESS,
  confidentialToken:
    (process.env.NEXT_PUBLIC_TOKEN_ADDRESS as `0x${string}`) || ZERO_ADDRESS,
};

/** True when real contract addresses have been configured. */
export const isContractsDeployed =
  CONTRACTS.organizationFactory !== ZERO_ADDRESS;

/**
 * ABIs — will be replaced with generated ABIs from compiled contracts.
 * Stubbed with expected function signatures for type safety.
 */
export const ORGANIZATION_FACTORY_ABI = [
  {
    type: "function",
    name: "createOrg",
    inputs: [{ name: "name", type: "string" }],
    outputs: [{ name: "orgAddress", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getOrganizations",
    inputs: [{ name: "admin", type: "address" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "OrganizationCreated",
    inputs: [
      { name: "orgAddress", type: "address", indexed: true },
      { name: "admin", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
    ],
  },
] as const;

export const ORGANIZATION_ABI = [
  {
    type: "function",
    name: "addEmployee",
    inputs: [
      { name: "employee", type: "address" },
      { name: "encryptedSalary", type: "bytes32" },
      { name: "proof", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeEmployee",
    inputs: [{ name: "employee", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "runPayroll",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getEmployees",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "employee", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "admin",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "encryptedAmount", type: "bytes32" },
      { name: "proof", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "EmployeeAdded",
    inputs: [
      { name: "employee", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "PayrollExecuted",
    inputs: [
      { name: "timestamp", type: "uint256", indexed: false },
      { name: "employeeCount", type: "uint256", indexed: false },
    ],
  },
] as const;
