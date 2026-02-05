// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PayLobsterRegistry
 * @notice On-chain registry for AI agents with trust scores and ratings
 * @dev Deployed on Base mainnet for Pay Lobster 🦞
 */
contract PayLobsterRegistry {

    struct Agent {
        string name;
        string capabilitiesCSV;  // Comma-separated capabilities (e.g., "payments,escrow,code-review")
        string metadataURI;  // IPFS or HTTP link to full profile
        uint256 registeredAt;
        bool active;
    }

    struct Rating {
        address rater;
        uint8 score;  // 1-5
        string comment;
        uint256 timestamp;
    }

    // Agent address => Agent data
    mapping(address => Agent) public agents;

    // Agent address => Ratings array
    mapping(address => Rating[]) public agentRatings;

    // Agent address => Total score (for averaging)
    mapping(address => uint256) public totalScore;
    mapping(address => uint256) public ratingCount;

    // Track all registered agents
    address[] public registeredAgents;

    event AgentRegistered(address indexed agent, string name, string capabilitiesCSV);
    event AgentUpdated(address indexed agent, string name, string capabilitiesCSV);
    event AgentDeactivated(address indexed agent);
    event AgentRated(address indexed agent, address indexed rater, uint8 score, string comment);

    /**
     * @notice Register as an agent
     * @param name Display name
     * @param capabilitiesCSV Comma-separated capabilities (e.g., "payments,escrow,code-review")
     * @param metadataURI Link to full profile JSON
     */
    function registerAgent(
        string calldata name,
        string calldata capabilitiesCSV,
        string calldata metadataURI
    ) external {
        require(bytes(name).length > 0, "Name required");
        require(bytes(capabilitiesCSV).length > 0, "At least one capability required");
        require(!agents[msg.sender].active, "Already registered");

        agents[msg.sender] = Agent({
            name: name,
            capabilitiesCSV: capabilitiesCSV,
            metadataURI: metadataURI,
            registeredAt: block.timestamp,
            active: true
        });

        registeredAgents.push(msg.sender);

        emit AgentRegistered(msg.sender, name, capabilitiesCSV);
    }

    /**
     * @notice Update agent profile
     */
    function updateAgent(
        string calldata name,
        string calldata capabilitiesCSV,
        string calldata metadataURI
    ) external {
        require(agents[msg.sender].active, "Not registered");

        agents[msg.sender].name = name;
        agents[msg.sender].capabilitiesCSV = capabilitiesCSV;
        agents[msg.sender].metadataURI = metadataURI;

        emit AgentUpdated(msg.sender, name, capabilitiesCSV);
    }

    /**
     * @notice Deactivate agent (self only)
     */
    function deactivateAgent() external {
        require(agents[msg.sender].active, "Not registered");
        agents[msg.sender].active = false;
        emit AgentDeactivated(msg.sender);
    }

    /**
     * @notice Rate an agent (1-5 stars)
     * @param agent Address of agent to rate
     * @param score Rating 1-5
     * @param comment Optional comment
     */
    function rateAgent(address agent, uint8 score, string calldata comment) external {
        require(agents[agent].active, "Agent not registered");
        require(score >= 1 && score <= 5, "Score must be 1-5");
        require(msg.sender != agent, "Cannot rate yourself");

        agentRatings[agent].push(Rating({
            rater: msg.sender,
            score: score,
            comment: comment,
            timestamp: block.timestamp
        }));

        totalScore[agent] += score;
        ratingCount[agent]++;

        emit AgentRated(agent, msg.sender, score, comment);
    }

    /**
     * @notice Get trust score (average rating * 20, so 5 stars = 100)
     */
    function getTrustScore(address agent) external view returns (uint256 score, uint256 ratings) {
        if (ratingCount[agent] == 0) {
            return (50, 0);  // Default score for new agents
        }
        uint256 avgRating = (totalScore[agent] * 20) / ratingCount[agent];
        return (avgRating, ratingCount[agent]);
    }

    /**
     * @notice Get agent details
     */
    function getAgent(address agent) external view returns (
        string memory name,
        string memory capabilitiesCSV,
        string memory metadataURI,
        uint256 registeredAt,
        bool active,
        uint256 trustScore,
        uint256 numRatings
    ) {
        Agent storage a = agents[agent];
        (uint256 ts, uint256 nr) = this.getTrustScore(agent);
        return (a.name, a.capabilitiesCSV, a.metadataURI, a.registeredAt, a.active, ts, nr);
    }

    /**
     * @notice Discover agents (returns all active agents up to limit)
     * @dev Filter by capability client-side using capabilitiesCSV
     */
    function discoverAgents(uint256 limit) external view returns (
        address[] memory agentAddresses,
        string[] memory names,
        uint256[] memory trustScores
    ) {
        uint256 count = registeredAgents.length < limit ? registeredAgents.length : limit;

        agentAddresses = new address[](count);
        names = new string[](count);
        trustScores = new uint256[](count);

        uint256 j = 0;
        for (uint i = 0; i < registeredAgents.length && j < count; i++) {
            if (agents[registeredAgents[i]].active) {
                agentAddresses[j] = registeredAgents[i];
                names[j] = agents[registeredAgents[i]].name;
                (trustScores[j],) = this.getTrustScore(registeredAgents[i]);
                j++;
            }
        }
    }

    /**
     * @notice Get all registered agents
     */
    function getAllAgents() external view returns (address[] memory) {
        return registeredAgents;
    }

    /**
     * @notice Get agent ratings
     */
    function getAgentRatings(address agent, uint256 limit) external view returns (Rating[] memory) {
        Rating[] storage ratings = agentRatings[agent];
        uint256 count = ratings.length < limit ? ratings.length : limit;
        Rating[] memory result = new Rating[](count);

        // Return most recent ratings
        for (uint i = 0; i < count; i++) {
            result[i] = ratings[ratings.length - 1 - i];
        }
        return result;
    }

    /**
     * @notice Get agent count
     */
    function getAgentCount() external view returns (uint256) {
        return registeredAgents.length;
    }

}
