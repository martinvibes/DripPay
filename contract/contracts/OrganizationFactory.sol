// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Organization} from "./Organization.sol";

/// @title OrganizationFactory — deploys Organization instances for DripPay
contract OrganizationFactory {
    /// @notice Emitted when a new organization is created
    event OrganizationCreated(
        address indexed orgAddress,
        address indexed admin,
        string name,
        address paymentToken
    );

    /// @dev admin address → list of orgs they created
    mapping(address => address[]) private _orgsByAdmin;

    /// @dev employee address → list of orgs they belong to
    mapping(address => address[]) private _orgsByEmployee;

    /// @dev tracks which addresses are orgs deployed by this factory
    mapping(address => bool) public isDeployedOrg;

    /// @notice Deploy a new Organization contract
    /// @param name The organization name
    /// @param paymentToken The payment token address (address(0) for ETH)
    /// @return orgAddress The address of the newly deployed Organization
    function createOrg(string calldata name, address paymentToken) external returns (address orgAddress) {
        Organization org = new Organization(name, msg.sender, paymentToken, address(this));
        orgAddress = address(org);
        _orgsByAdmin[msg.sender].push(orgAddress);
        isDeployedOrg[orgAddress] = true;
        emit OrganizationCreated(orgAddress, msg.sender, name, paymentToken);
    }

    /// @notice Get all organizations created by an admin
    /// @param admin The admin address to query
    /// @return The list of Organization contract addresses
    function getOrganizations(address admin) external view returns (address[] memory) {
        return _orgsByAdmin[admin];
    }

    /// @notice Get all organizations an employee belongs to
    /// @param employee The employee address to query
    /// @return The list of Organization contract addresses
    function getEmployeeOrganizations(address employee) external view returns (address[] memory) {
        return _orgsByEmployee[employee];
    }

    /// @notice Register an employee in an organization (called by Organization contracts)
    /// @param employee The employee address to register
    function registerEmployee(address employee) external {
        require(isDeployedOrg[msg.sender], "Only deployed orgs");
        _orgsByEmployee[employee].push(msg.sender);
    }

    /// @notice Unregister an employee from an organization (called by Organization contracts)
    /// @param employee The employee address to unregister
    function unregisterEmployee(address employee) external {
        require(isDeployedOrg[msg.sender], "Only deployed orgs");
        address[] storage orgs = _orgsByEmployee[employee];
        uint256 len = orgs.length;
        for (uint256 i = 0; i < len; i++) {
            if (orgs[i] == msg.sender) {
                orgs[i] = orgs[len - 1];
                orgs.pop();
                break;
            }
        }
    }
}
