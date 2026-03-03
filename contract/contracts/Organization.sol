// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Organization — manages employees, encrypted salaries, and batch payroll
/// @notice Deployed by OrganizationFactory. Uses Zama fhEVM for fully encrypted payroll.
contract Organization is ZamaEthereumConfig {
    // ── State ────────────────────────────────────────────────────────────
    address public admin;
    string public name;

    address[] private _employees;
    mapping(address => bool) public isEmployee;
    mapping(address => euint64) private _salaries;  // encrypted monthly salary
    mapping(address => euint64) private _balances;  // encrypted accumulated balance

    // ── Events ───────────────────────────────────────────────────────────
    event EmployeeAdded(address indexed employee);
    event EmployeeRemoved(address indexed employee);
    event PayrollExecuted(uint256 timestamp, uint256 employeeCount);
    event Withdrawal(address indexed employee);

    // ── Errors ───────────────────────────────────────────────────────────
    error OnlyAdmin();
    error AlreadyEmployee();
    error NotEmployee();

    // ── Modifiers ────────────────────────────────────────────────────────
    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    // ── Constructor ──────────────────────────────────────────────────────
    constructor(string memory _name, address _admin) {
        name = _name;
        admin = _admin;
    }

    // ── Admin Functions ──────────────────────────────────────────────────

    /// @notice Add an employee with an encrypted salary
    /// @param employee The employee wallet address
    /// @param encryptedSalary The encrypted salary input handle
    /// @param proof The input proof for FHE verification
    function addEmployee(
        address employee,
        externalEuint64 encryptedSalary,
        bytes calldata proof
    ) external onlyAdmin {
        if (isEmployee[employee]) revert AlreadyEmployee();

        euint64 salary = FHE.fromExternal(encryptedSalary, proof);

        // Store salary — grant access to contract and employee
        _salaries[employee] = FHE.allowThis(salary);
        FHE.allow(_salaries[employee], employee);
        FHE.allow(_salaries[employee], admin);

        // Initialize balance to encrypted zero
        _balances[employee] = FHE.allowThis(FHE.asEuint64(0));
        FHE.allow(_balances[employee], employee);

        isEmployee[employee] = true;
        _employees.push(employee);

        emit EmployeeAdded(employee);
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

    /// @notice Withdraw from accumulated balance
    /// @param encryptedAmount The encrypted withdrawal amount
    /// @param proof The input proof for FHE verification
    function withdraw(
        externalEuint64 encryptedAmount,
        bytes calldata proof
    ) external {
        if (!isEmployee[msg.sender]) revert NotEmployee();

        euint64 amount = FHE.fromExternal(encryptedAmount, proof);

        // Check: amount <= balance (encrypted comparison)
        ebool sufficient = FHE.le(amount, _balances[msg.sender]);

        // Conditional subtract: if sufficient, subtract; otherwise keep balance unchanged
        euint64 newBalance = FHE.select(
            sufficient,
            FHE.sub(_balances[msg.sender], amount),
            _balances[msg.sender]
        );

        _balances[msg.sender] = FHE.allowThis(newBalance);
        FHE.allow(_balances[msg.sender], msg.sender);

        emit Withdrawal(msg.sender);
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
