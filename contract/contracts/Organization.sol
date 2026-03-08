// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Organization — manages employees, encrypted salaries, and batch payroll
/// @notice Deployed by OrganizationFactory. Uses Zama fhEVM for fully encrypted payroll.
contract Organization is ZamaEthereumConfig {
    // ── State ────────────────────────────────────────────────────────────
    address public admin;
    string public name;
    address public paymentToken; // address(0) = ETH, otherwise ERC-20
    uint256 public createdAt;

    address[] private _employees;
    mapping(address => bool) public isEmployee;
    mapping(address => euint64) private _salaries;  // encrypted monthly salary
    mapping(address => euint64) private _balances;  // encrypted accumulated balance

    // ── Events ───────────────────────────────────────────────────────────
    event EmployeeAdded(address indexed employee);
    event EmployeeRemoved(address indexed employee);
    event PayrollExecuted(uint256 timestamp, uint256 employeeCount);
    event Withdrawal(address indexed employee, uint256 amount);
    event Deposit(address indexed from, uint256 amount);

    // ── Errors ───────────────────────────────────────────────────────────
    error OnlyAdmin();
    error AlreadyEmployee();
    error NotEmployee();
    error DepositFailed();
    error WithdrawalFailed();
    error InvalidETHDeposit();
    error InsufficientContractBalance();
    error ZeroAmount();

    // ── Modifiers ────────────────────────────────────────────────────────
    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    // ── Constructor ──────────────────────────────────────────────────────
    constructor(string memory _name, address _admin, address _paymentToken) {
        name = _name;
        admin = _admin;
        paymentToken = _paymentToken;
        createdAt = block.timestamp;
    }

    // ── Deposit Functions ───────────────────────────────────────────────

    /// @notice Deposit tokens into the organization's pool
    /// @param amount The amount to deposit (ignored for ETH — uses msg.value)
    function deposit(uint256 amount) external payable {
        if (paymentToken == address(0)) {
            // ETH deposit
            if (msg.value == 0) revert ZeroAmount();
            emit Deposit(msg.sender, msg.value);
        } else {
            // ERC-20 deposit
            if (amount == 0) revert ZeroAmount();
            if (msg.value > 0) revert InvalidETHDeposit();
            bool success = IERC20(paymentToken).transferFrom(msg.sender, address(this), amount);
            if (!success) revert DepositFailed();
            emit Deposit(msg.sender, amount);
        }
    }

    /// @notice Accept direct ETH transfers (ETH orgs only)
    receive() external payable {
        if (paymentToken != address(0)) revert InvalidETHDeposit();
        if (msg.value == 0) revert ZeroAmount();
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Get the real token balance held by this contract
    function getContractBalance() external view returns (uint256) {
        if (paymentToken == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(paymentToken).balanceOf(address(this));
        }
    }

    // ── Admin Functions ──────────────────────────────────────────────────

    // /// @notice Add a single employee with an encrypted salary (deprecated — use addEmployees)
    // function addEmployee(
    //     address employee,
    //     externalEuint64 encryptedSalary,
    //     bytes calldata proof
    // ) external onlyAdmin { ... }

    /// @notice Add one or more employees with encrypted salaries in a single transaction
    /// @param employees Array of employee wallet addresses
    /// @param encryptedSalaries Array of encrypted salary input handles (one per employee)
    /// @param proof Shared input proof for all FHE handles (from one createEncryptedInput batch)
    function addEmployees(
        address[] calldata employees,
        externalEuint64[] calldata encryptedSalaries,
        bytes calldata proof
    ) external onlyAdmin {
        uint256 len = employees.length;
        require(len == encryptedSalaries.length, "Length mismatch");
        require(len > 0, "Empty array");

        for (uint256 i = 0; i < len; i++) {
            address emp = employees[i];
            if (isEmployee[emp]) revert AlreadyEmployee();

            euint64 salary = FHE.fromExternal(encryptedSalaries[i], proof);

            // Store salary — grant access to contract and employee
            _salaries[emp] = FHE.allowThis(salary);
            FHE.allow(_salaries[emp], emp);
            FHE.allow(_salaries[emp], admin);

            // Initialize balance to encrypted zero
            _balances[emp] = FHE.allowThis(FHE.asEuint64(0));
            FHE.allow(_balances[emp], emp);

            isEmployee[emp] = true;
            _employees.push(emp);

            emit EmployeeAdded(emp);
        }
    }

    /// @notice Remove an employee
    /// @param employee The employee wallet address to remove
    function removeEmployee(address employee) external onlyAdmin {
        if (!isEmployee[employee]) revert NotEmployee();

        isEmployee[employee] = false;

        // Remove from array by swap-and-pop
        uint256 len = _employees.length;
        for (uint256 i = 0; i < len; i++) {
            if (_employees[i] == employee) {
                _employees[i] = _employees[len - 1];
                _employees.pop();
                break;
            }
        }

        emit EmployeeRemoved(employee);
    }

    /// @notice Execute batch payroll — adds salary to each active employee's balance
    function runPayroll() external onlyAdmin {
        uint256 len = _employees.length;
        for (uint256 i = 0; i < len; i++) {
            address emp = _employees[i];
            euint64 newBalance = FHE.add(_balances[emp], _salaries[emp]);

            _balances[emp] = FHE.allowThis(newBalance);
            FHE.allow(_balances[emp], emp);
        }

        emit PayrollExecuted(block.timestamp, len);
    }

    // ── Employee Functions ───────────────────────────────────────────────

    /// @notice Withdraw from accumulated balance (trust-based: plaintext amount)
    /// @dev Employee specifies plaintext amount. Contract encrypts it, does FHE comparison
    ///      to update encrypted balance, then transfers real tokens.
    /// @param amount The plaintext withdrawal amount
    function withdraw(uint256 amount) external {
        if (!isEmployee[msg.sender]) revert NotEmployee();
        if (amount == 0) revert ZeroAmount();

        // Check contract has enough real tokens
        uint256 contractBal;
        if (paymentToken == address(0)) {
            contractBal = address(this).balance;
        } else {
            contractBal = IERC20(paymentToken).balanceOf(address(this));
        }
        if (contractBal < amount) revert InsufficientContractBalance();

        // Encrypt the withdrawal amount and do FHE balance update
        euint64 encAmount = FHE.asEuint64(uint64(amount));
        ebool sufficient = FHE.le(encAmount, _balances[msg.sender]);
        euint64 newBalance = FHE.select(
            sufficient,
            FHE.sub(_balances[msg.sender], encAmount),
            _balances[msg.sender]
        );

        _balances[msg.sender] = FHE.allowThis(newBalance);
        FHE.allow(_balances[msg.sender], msg.sender);

        // Transfer real tokens
        if (paymentToken == address(0)) {
            (bool success, ) = payable(msg.sender).call{value: amount}("");
            if (!success) revert WithdrawalFailed();
        } else {
            bool success = IERC20(paymentToken).transfer(msg.sender, amount);
            if (!success) revert WithdrawalFailed();
        }

        emit Withdrawal(msg.sender, amount);
    }

    // ── View Functions ───────────────────────────────────────────────────

    /// @notice Get the encrypted balance handle for re-encryption client-side
    /// @param employee The employee address
    /// @return The encrypted balance handle (euint64)
    function balanceOf(address employee) external view returns (euint64) {
        return _balances[employee];
    }

    /// @notice Get the list of active employees
    /// @return The array of employee addresses
    function getEmployees() external view returns (address[] memory) {
        return _employees;
    }
}
