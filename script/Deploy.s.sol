// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {PayLobsterEscrow} from "../src/PayLobsterEscrow.sol";
import {PayLobsterRegistry} from "../src/PayLobsterRegistry.sol";

contract DeployScript is Script {
    // Base Mainnet USDC
    address constant USDC_BASE = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    // Pay Lobster wallet (arbiter)
    address constant ARBITER = 0xf775f0224A680E2915a066e53A389d0335318b7B;

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying Pay Lobster contracts to Base...");
        console.log("Deployer:", vm.addr(deployerPrivateKey));

        // Deploy Escrow
        PayLobsterEscrow escrow = new PayLobsterEscrow(USDC_BASE, ARBITER);
        console.log("PayLobsterEscrow:", address(escrow));

        // Deploy Registry
        PayLobsterRegistry registry = new PayLobsterRegistry();
        console.log("PayLobsterRegistry:", address(registry));

        vm.stopBroadcast();

        console.log("\n=== Deployment Complete ===");
        console.log("Escrow:", address(escrow));
        console.log("Registry:", address(registry));
    }
}
