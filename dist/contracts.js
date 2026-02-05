"use strict";
/**
 * Pay Lobster Contract Addresses & ABIs
 * Deployed on Base Mainnet 🦞
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowStatus = exports.ERC20_ABI = exports.REGISTRY_ABI = exports.ESCROW_ABI = exports.CONTRACTS = void 0;
// Contract Addresses
exports.CONTRACTS = {
    escrow: '0xa091fC821c85Dfd2b2B3EF9e22c5f4c8B8A24525',
    registry: '0x10BCa62Ce136A70F914c56D97e491a85d1e050E7',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
};
// Escrow ABI
exports.ESCROW_ABI = [
    'function createEscrow(address seller, uint256 amount, string description, uint256 deadline) returns (uint256)',
    'function releaseEscrow(uint256 escrowId)',
    'function refundEscrow(uint256 escrowId)',
    'function disputeEscrow(uint256 escrowId)',
    'function resolveDispute(uint256 escrowId, bool releaseToSeller)',
    'function getEscrow(uint256 escrowId) view returns (address buyer, address seller, uint256 amount, uint8 status, string description, uint256 createdAt, uint256 deadline)',
    'function escrowCount() view returns (uint256)',
    'event EscrowCreated(uint256 indexed id, address indexed buyer, address indexed seller, uint256 amount, string description)',
    'event EscrowReleased(uint256 indexed id, address indexed seller, uint256 amount)',
    'event EscrowRefunded(uint256 indexed id, address indexed buyer, uint256 amount)',
    'event EscrowDisputed(uint256 indexed id, address indexed disputer)'
];
// Registry ABI
exports.REGISTRY_ABI = [
    'function registerAgent(string name, string capabilitiesCSV, string metadataURI)',
    'function updateAgent(string name, string capabilitiesCSV, string metadataURI)',
    'function deactivateAgent()',
    'function rateAgent(address agent, uint8 score, string comment)',
    'function getTrustScore(address agent) view returns (uint256 score, uint256 ratings)',
    'function getAgent(address agent) view returns (string name, string capabilitiesCSV, string metadataURI, uint256 registeredAt, bool active, uint256 trustScore, uint256 numRatings)',
    'function discoverAgents(uint256 limit) view returns (address[] agentAddresses, string[] names, uint256[] trustScores)',
    'function getAgentRatings(address agent, uint256 limit) view returns (tuple(address rater, uint8 score, string comment, uint256 timestamp)[])',
    'function getAgentCount() view returns (uint256)',
    'event AgentRegistered(address indexed agent, string name, string capabilitiesCSV)',
    'event AgentRated(address indexed agent, address indexed rater, uint8 score, string comment)'
];
// ERC20 ABI (for USDC)
exports.ERC20_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)'
];
// Escrow status enum
var EscrowStatus;
(function (EscrowStatus) {
    EscrowStatus[EscrowStatus["Active"] = 0] = "Active";
    EscrowStatus[EscrowStatus["Released"] = 1] = "Released";
    EscrowStatus[EscrowStatus["Refunded"] = 2] = "Refunded";
    EscrowStatus[EscrowStatus["Disputed"] = 3] = "Disputed";
})(EscrowStatus || (exports.EscrowStatus = EscrowStatus = {}));
//# sourceMappingURL=contracts.js.map