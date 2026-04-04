// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HumanVote
 * @notice On-chain vote recording for World ID verified competitions.
 *         DB is the primary read source; this contract provides transparency.
 *         String IDs (CUIDs) are hashed to bytes32 via keccak256 client-side.
 */
contract HumanVote {
    // --- Events ---
    event CompetitionCreated(bytes32 indexed competitionId, uint256 endsAt, address creator);
    event VoteCast(bytes32 indexed competitionId, bytes32 indexed entryId, bytes32 nullifierHash, address voter);

    // --- Storage ---
    struct Competition {
        bool exists;
        uint256 endsAt;
        address creator;
    }

    mapping(bytes32 => Competition) public competitions;
    // competitionId => nullifierHash => voted
    mapping(bytes32 => mapping(bytes32 => bool)) public hasVoted;
    // entryId => vote count
    mapping(bytes32 => uint256) public voteCounts;
    // competitionId => total votes
    mapping(bytes32 => uint256) public competitionVoteCounts;

    // --- Functions ---

    /**
     * @notice Register a competition on-chain
     * @param competitionId keccak256 hash of the CUID string
     * @param endsAt Unix timestamp when voting closes
     */
    function createCompetition(bytes32 competitionId, uint256 endsAt) external {
        require(!competitions[competitionId].exists, "Competition already exists");
        require(endsAt > block.timestamp, "End time must be in the future");

        competitions[competitionId] = Competition({
            exists: true,
            endsAt: endsAt,
            creator: msg.sender
        });

        emit CompetitionCreated(competitionId, endsAt, msg.sender);
    }

    /**
     * @notice Record a World ID verified vote on-chain
     * @param competitionId keccak256 hash of the competition CUID
     * @param entryId keccak256 hash of the entry CUID
     * @param nullifierHash The World ID nullifier (ensures one vote per human)
     */
    function vote(bytes32 competitionId, bytes32 entryId, bytes32 nullifierHash) external {
        // Allow voting even if competition wasn't registered on-chain
        // (DB is source of truth; on-chain is transparency layer)
        if (competitions[competitionId].exists) {
            require(block.timestamp <= competitions[competitionId].endsAt, "Competition has ended");
        }

        require(!hasVoted[competitionId][nullifierHash], "Already voted in this competition");

        hasVoted[competitionId][nullifierHash] = true;
        voteCounts[entryId]++;
        competitionVoteCounts[competitionId]++;

        emit VoteCast(competitionId, entryId, nullifierHash, msg.sender);
    }

    /**
     * @notice Get the on-chain vote count for an entry
     */
    function getVoteCount(bytes32 entryId) external view returns (uint256) {
        return voteCounts[entryId];
    }

    /**
     * @notice Get total votes for a competition
     */
    function getCompetitionVoteCount(bytes32 competitionId) external view returns (uint256) {
        return competitionVoteCounts[competitionId];
    }

    /**
     * @notice Check if a nullifier has already voted in a competition
     */
    function hasNullifierVoted(bytes32 competitionId, bytes32 nullifierHash) external view returns (bool) {
        return hasVoted[competitionId][nullifierHash];
    }
}
