// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;


import "./Membershipcontract.sol";
import "./DeamMetaverseConfig.sol";
import "./IERC20.sol";
import "./DMToken.sol";

contract DMCPdistributor  {

    uint256 public lastCommunityDistributionTime = block.timestamp;
    uint256 public communityDistributionFrequencyInDays = 30 seconds;
    uint256 public totalCommunityDistribution = 0;

    uint256 public communityPoolBalanceWhileCommunityDistribution=0;
    uint256 public startIndexOfNextBatch;

    address public owner;
    Membershipcontract public membershipContract;
    DeamMetaverseConfig public dmConfigContract;
    DMToken public dmTokenContract;

    constructor(
        address _membershipContractAddress,
        address _configContractAddress,
        address _dmTokenAddress
    ) {        
        owner = msg.sender;
        membershipContract = Membershipcontract(_membershipContractAddress);
        dmConfigContract = DeamMetaverseConfig(_configContractAddress);
        dmTokenContract = DMToken(_dmTokenAddress);        
            
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "DMCPdistributor: Only the contract owner can call this function"
        );
        _;
    }


    function setCommunityDistributionFrequencyInDays(
        uint256 _communityDistributionFrequencyInDays
    ) external {
        communityDistributionFrequencyInDays =
            _communityDistributionFrequencyInDays *
            1 days;
    }


    function DistributeCommunityPool(uint256 _startIndex, uint256 batchSize) external onlyOwner returns (uint256){
        address[] memory memberAddressList =  membershipContract.getMemberAddresses();
        require(block.timestamp >lastCommunityDistributionTime + communityDistributionFrequencyInDays, "Community Distribution Frequency Not Met");
        require(_startIndex == startIndexOfNextBatch,"Start Index Should be greater than Last Distributed Index");
        require(memberAddressList.length > 0, "No Members");
        require(_startIndex < memberAddressList.length, "Start index out of bounds");
        require(batchSize > 0, "Batch size must be greater than 0");

        uint256 endIndex = _startIndex + batchSize -1;
        if (endIndex > memberAddressList.length) {
            endIndex = memberAddressList.length-1;
        }

        startIndexOfNextBatch = endIndex+1;


        if(communityPoolBalanceWhileCommunityDistribution<=0){
            communityPoolBalanceWhileCommunityDistribution = dmTokenContract.getBalance(dmConfigContract.communityPoolWallet());
        }
        require(communityPoolBalanceWhileCommunityDistribution > 0, "No balance in the transaction pool");
        uint256 pendingReward;
        uint256 share;

        for (uint256 i = _startIndex; i <= endIndex; i++) {
                pendingReward = membershipContract.getPendingReward(memberAddressList[i],dmConfigContract.maxRewardsMultiplier());
                if (pendingReward > 0) {
                    share = membershipContract.calculateShare(memberAddressList[i], communityPoolBalanceWhileCommunityDistribution);
                    if (pendingReward < share) {
                        share = pendingReward;
                    }
                    dmTokenContract.transfer(dmConfigContract.communityPoolWallet(), memberAddressList[i], share);
                    totalCommunityDistribution += share;
            }
        }
        if(endIndex == memberAddressList.length-1){
            lastCommunityDistributionTime = block.timestamp;
            communityPoolBalanceWhileCommunityDistribution = 0;
            startIndexOfNextBatch = 0;
        }
        return startIndexOfNextBatch;
    }



}