const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as `0x${string}`;

/**
 * Contract addresses — update after deployment.
 * These are placeholders until contracts are deployed to Ethereum Sepolia.
 */
export const CONTRACTS = {
  organizationFactory:
    (process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`) || ZERO_ADDRESS,
  testToken:
    (process.env.NEXT_PUBLIC_TEST_TOKEN_ADDRESS as `0x${string}`) || ZERO_ADDRESS,
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
      { name: "paymentToken", type: "address", indexed: false },
    ],
  },
  {
    type: "function",
    name: "createOrg",
    inputs: [
      { name: "name", type: "string" },
      { name: "paymentToken", type: "address" },
    ],
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
    type: "function",
    name: "getEmployeeOrganizations",
    inputs: [{ name: "employee", type: "address" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
] as const;

export const ORGANIZATION_ABI = [
  // Errors
  { type: "error", name: "AlreadyEmployee", inputs: [] },
  { type: "error", name: "NotEmployee", inputs: [] },
  { type: "error", name: "OnlyAdmin", inputs: [] },
  { type: "error", name: "DepositFailed", inputs: [] },
  { type: "error", name: "WithdrawalFailed", inputs: [] },
  { type: "error", name: "InvalidETHDeposit", inputs: [] },
  { type: "error", name: "InsufficientContractBalance", inputs: [] },
  { type: "error", name: "ZeroAmount", inputs: [] },
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
    inputs: [
      { name: "employee", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Deposit",
    anonymous: false,
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  // Functions
  {
    type: "function",
    name: "addEmployees",
    inputs: [
      { name: "employees", type: "address[]" },
      { name: "encryptedSalaries", type: "bytes32[]" },
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
    name: "paymentToken",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "createdAt",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getContractBalance",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
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
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deposit",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "salaryOf",
    inputs: [{ name: "employee", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalPayrollCost",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPayrollRunCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "payrollRunCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "updateSalary",
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
    name: "checkBudget",
    inputs: [],
    outputs: [{ name: "sufficient", type: "bytes32" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "SalaryUpdated",
    anonymous: false,
    inputs: [{ name: "employee", type: "address", indexed: true }],
  },
  {
    type: "event",
    name: "BudgetStatus",
    anonymous: false,
    inputs: [{ name: "sufficient", type: "bool", indexed: false }],
  },
  {
    type: "receive",
    stateMutability: "payable",
  },
] as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
] as const;
