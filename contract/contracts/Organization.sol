// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {OrganizationFactory} from "./OrganizationFactory.sol";

/// @title Organization — manages employees, encrypted salaries, and batch payroll
/// @notice Deployed by OrganizationFactory. Uses Zama fhEVM for fully encrypted payroll.
contract Organization is ZamaEthereumConfig {
    // ── State ────────────────────────────────────────────────────────────
    address public admin;
    string public name;
    address public paymentToken; // address(0) = ETH, otherwise ERC-20
    uint256 public createdAt;
    OrganizationFactory public factory;

    address[] private _employees;
    mapping(address => bool) public isEmployee;
    mapping(address => euint64) private _salaries;  // encrypted monthly salary
    mapping(address => euint64) private _balances;  // encrypted accumulated balance
    euint64 private _totalPayrollCost;              // encrypted sum of all salaries
    uint256 public payrollRunCount;                 // number of times payroll has been executed

    // ── Events ───────────────────────────────────────────────────────────
    event EmployeeAdded(address indexed employee);
    event EmployeeRemoved(address indexed employee);
    event PayrollExecuted(uint256 timestamp, uint256 employeeCount);
    event Withdrawal(address indexed employee, uint256 amount);
    event Deposit(address indexed from, uint256 amount);
    event SalaryUpdated(address indexed employee);
    event BudgetStatus(bool sufficient);

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
    constructor(string memory _name, address _admin, address _paymentToken, address _factory) {
        name = _name;
        admin = _admin;
        paymentToken = _paymentToken;
        createdAt = block.timestamp;
        factory = OrganizationFactory(_factory);
        _totalPayrollCost = FHE.allowThis(FHE.asEuint64(0));
        FHE.allow(_totalPayrollCost, _admin);
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

            // Update encrypted total payroll cost
            _totalPayrollCost = FHE.allowThis(FHE.add(_totalPayrollCost, salary));
            FHE.allow(_totalPayrollCost, admin);

            // Register employee in factory for auto-discovery
            factory.registerEmployee(emp);

            emit EmployeeAdded(emp);
        }
    }

    /// @notice Remove an employee
    /// @param employee The employee wallet address to remove
    function removeEmployee(address employee) external onlyAdmin {
        if (!isEmployee[employee]) revert NotEmployee();

        isEmployee[employee] = false;

        // Subtract salary from total payroll cost before removing
        _totalPayrollCost = FHE.allowThis(FHE.sub(_totalPayrollCost, _salaries[employee]));
        FHE.allow(_totalPayrollCost, admin);

        // Remove from array by swap-and-pop
        uint256 len = _employees.length;
        for (uint256 i = 0; i < len; i++) {
            if (_employees[i] == employee) {
                _employees[i] = _employees[len - 1];
                _employees.pop();
                break;
            }
        }

        // Unregister employee from factory
        factory.unregisterEmployee(employee);

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

        payrollRunCount++;
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

    /// @notice Get the encrypted salary handle for an employee (for admin/employee decryption)
    /// @param employee The employee address
    /// @return The encrypted salary handle (euint64)
    function salaryOf(address employee) external view returns (euint64) {
        return _salaries[employee];
    }

    /// @notice Get the encrypted total payroll cost handle (sum of all salaries)
    /// @return The encrypted total payroll cost (euint64)
    function getTotalPayrollCost() external view returns (euint64) {
        return _totalPayrollCost;
    }

    /// @notice Get the number of payroll runs executed
    /// @return The payroll run count
    function getPayrollRunCount() external view returns (uint256) {
        return payrollRunCount;
    }

    // ── Feature: Salary Updates ───────────────────────────────────────────

    /// @notice Update an employee's encrypted salary
    /// @param employee The employee address to update
    /// @param encryptedSalary The new encrypted salary input handle
    /// @param proof The FHE input proof
    function updateSalary(
        address employee,
        externalEuint64 encryptedSalary,
        bytes calldata proof
    ) external onlyAdmin {
        if (!isEmployee[employee]) revert NotEmployee();

        euint64 newSalary = FHE.fromExternal(encryptedSalary, proof);

        // Update total payroll cost: subtract old salary, add new salary
        _totalPayrollCost = FHE.allowThis(
            FHE.add(FHE.sub(_totalPayrollCost, _salaries[employee]), newSalary)
        );
        FHE.allow(_totalPayrollCost, admin);

        // Store new salary with proper permissions
        _salaries[employee] = FHE.allowThis(newSalary);
        FHE.allow(_salaries[employee], employee);
        FHE.allow(_salaries[employee], admin);

        emit SalaryUpdated(employee);
    }

    // ── Feature: Confidential Budget Check ────────────────────────────────

    /// @notice Check if contract balance covers total payroll (FHE comparison)
    /// @dev Compares plaintext contract balance against encrypted total salary cost
    /// @return sufficient Encrypted boolean - true if budget covers payroll
    function checkBudget() external returns (ebool) {
        uint256 contractBal;
        if (paymentToken == address(0)) {
            contractBal = address(this).balance;
        } else {
            contractBal = IERC20(paymentToken).balanceOf(address(this));
        }
        euint64 encBalance = FHE.asEuint64(uint64(contractBal));
        ebool sufficient = FHE.le(_totalPayrollCost, encBalance);
        FHE.allowThis(sufficient);
        FHE.allow(sufficient, admin);
        return sufficient;
    }
}
