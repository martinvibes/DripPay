const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as `0x${string}`;

/**
 * Contract addresses — update after deployment.
 * These are placeholders until contracts are deployed to Ethereum Sepolia.
 */
export const CONTRACTS = {
  organizationFactory:
    (process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`) || ZERO_ADDRESS,
};

/** True when real contract addresses have been configured. */
export const isContractsDeployed =
  CONTRACTS.organizationFactory !== ZERO_ADDRESS;

/**
 * ABIs — generated from compiled Solidity contracts (contract/artifacts/).
 */
export const ORGANIZATION_FACTORY_ABI = [
  {
    type: "event",
    name: "OrganizationCreated",
    anonymous: false,
    inputs: [
      { name: "orgAddress", type: "address", indexed: true },
      { name: "admin", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
    ],
  },
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
] as const;

export const ORGANIZATION_ABI = [
  // Errors
  { type: "error", name: "AlreadyEmployee", inputs: [] },
  { type: "error", name: "NotEmployee", inputs: [] },
  { type: "error", name: "OnlyAdmin", inputs: [] },
  // Events
  {
    type: "event",
    name: "EmployeeAdded",
    anonymous: false,
    inputs: [{ name: "employee", type: "address", indexed: true }],
  },
  {
    type: "event",
    name: "EmployeeRemoved",
    anonymous: false,
    inputs: [{ name: "employee", type: "address", indexed: true }],
  },
  {
    type: "event",
    name: "PayrollExecuted",
    anonymous: false,
    inputs: [
      { name: "timestamp", type: "uint256", indexed: false },
      { name: "employeeCount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Withdrawal",
    anonymous: false,
    inputs: [{ name: "employee", type: "address", indexed: true }],
  },
  // Functions
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
    name: "admin",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "employee", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
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
    name: "isEmployee",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
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
    name: "withdraw",
    inputs: [
      { name: "encryptedAmount", type: "bytes32" },
      { name: "proof", type: "bytes" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;
