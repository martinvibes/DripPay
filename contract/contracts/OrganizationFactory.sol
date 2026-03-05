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

    /// @notice Deploy a new Organization contract
    /// @param name The organization name
    /// @param paymentToken The payment token address (address(0) for ETH)
    /// @return orgAddress The address of the newly deployed Organization
    function createOrg(string calldata name, address paymentToken) external returns (address orgAddress) {
        Organization org = new Organization(name, msg.sender, paymentToken);
        orgAddress = address(org);
        _orgsByAdmin[msg.sender].push(orgAddress);
        emit OrganizationCreated(orgAddress, msg.sender, name, paymentToken);
    }

    /// @notice Get all organizations created by an admin
    /// @param admin The admin address to query
    /// @return The list of Organization contract addresses
    function getOrganizations(address admin) external view returns (address[] memory) {
        return _orgsByAdmin[admin];
    }
}
