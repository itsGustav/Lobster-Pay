// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PayLobsterEscrow
 * @notice Trustless USDC escrow for agent-to-agent payments
 * @dev Deployed on Base mainnet for Pay Lobster 🦞
 */
contract PayLobsterEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Base Mainnet USDC
    IERC20 public immutable usdc;
    
    enum EscrowStatus { Active, Released, Refunded, Disputed }
    
    struct Escrow {
        address buyer;
        address seller;
        uint256 amount;
        EscrowStatus status;
        string description;
        uint256 createdAt;
        uint256 deadline;
    }
    
    mapping(uint256 => Escrow) public escrows;
    uint256 public escrowCount;
    
    // Dispute resolution (simple: owner can resolve)
    address public arbiter;
    
    event EscrowCreated(uint256 indexed id, address indexed buyer, address indexed seller, uint256 amount, string description);
    event EscrowReleased(uint256 indexed id, address indexed seller, uint256 amount);
    event EscrowRefunded(uint256 indexed id, address indexed buyer, uint256 amount);
    event EscrowDisputed(uint256 indexed id, address indexed disputer);
    event DisputeResolved(uint256 indexed id, address indexed winner, uint256 amount);
    
    constructor(address _usdc, address _arbiter) {
        usdc = IERC20(_usdc);
        arbiter = _arbiter;
    }
    
    /**
     * @notice Create a new escrow
     * @param seller Address to receive funds on release
     * @param amount USDC amount (6 decimals)
     * @param description Task or item description
     * @param deadline Unix timestamp for auto-release (0 = no deadline)
     */
    function createEscrow(
        address seller,
        uint256 amount,
        string calldata description,
        uint256 deadline
    ) external nonReentrant returns (uint256 escrowId) {
        require(seller != address(0), "Invalid seller");
        require(seller != msg.sender, "Cannot escrow to self");
        require(amount > 0, "Amount must be > 0");
        
        // Transfer USDC from buyer to contract
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        
        escrowId = escrowCount++;
        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            status: EscrowStatus.Active,
            description: description,
            createdAt: block.timestamp,
            deadline: deadline
        });
        
        emit EscrowCreated(escrowId, msg.sender, seller, amount, description);
    }
    
    /**
     * @notice Release escrow funds to seller (buyer only)
     */
    function releaseEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(msg.sender == escrow.buyer, "Only buyer can release");
        
        escrow.status = EscrowStatus.Released;
        usdc.safeTransfer(escrow.seller, escrow.amount);
        
        emit EscrowReleased(escrowId, escrow.seller, escrow.amount);
    }
    
    /**
     * @notice Refund escrow to buyer (seller only, or buyer after deadline)
     */
    function refundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        
        bool canRefund = msg.sender == escrow.seller || 
            (msg.sender == escrow.buyer && escrow.deadline > 0 && block.timestamp > escrow.deadline);
        require(canRefund, "Cannot refund");
        
        escrow.status = EscrowStatus.Refunded;
        usdc.safeTransfer(escrow.buyer, escrow.amount);
        
        emit EscrowRefunded(escrowId, escrow.buyer, escrow.amount);
    }
    
    /**
     * @notice Dispute an escrow (buyer or seller)
     */
    function disputeEscrow(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(msg.sender == escrow.buyer || msg.sender == escrow.seller, "Not party to escrow");
        
        escrow.status = EscrowStatus.Disputed;
        emit EscrowDisputed(escrowId, msg.sender);
    }
    
    /**
     * @notice Resolve a dispute (arbiter only)
     * @param escrowId The disputed escrow
     * @param releaseToSeller True = seller wins, False = buyer wins
     */
    function resolveDispute(uint256 escrowId, bool releaseToSeller) external nonReentrant {
        require(msg.sender == arbiter, "Only arbiter");
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Disputed, "Not disputed");
        
        address winner;
        if (releaseToSeller) {
            escrow.status = EscrowStatus.Released;
            usdc.safeTransfer(escrow.seller, escrow.amount);
            winner = escrow.seller;
        } else {
            escrow.status = EscrowStatus.Refunded;
            usdc.safeTransfer(escrow.buyer, escrow.amount);
            winner = escrow.buyer;
        }
        
        emit DisputeResolved(escrowId, winner, escrow.amount);
    }
    
    /**
     * @notice Get escrow details
     */
    function getEscrow(uint256 escrowId) external view returns (
        address buyer,
        address seller,
        uint256 amount,
        EscrowStatus status,
        string memory description,
        uint256 createdAt,
        uint256 deadline
    ) {
        Escrow storage e = escrows[escrowId];
        return (e.buyer, e.seller, e.amount, e.status, e.description, e.createdAt, e.deadline);
    }
    
    /**
     * @notice Update arbiter (current arbiter only)
     */
    function setArbiter(address newArbiter) external {
        require(msg.sender == arbiter, "Only arbiter");
        arbiter = newArbiter;
    }
}
