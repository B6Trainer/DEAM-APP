// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;


import "./Membershipcontract.sol";
import "./DeamMetaverseConfig.sol";
import "./DMToken.sol";
import "hardhat/console.sol";
import "./BaseDMContract.sol";

contract DMCPdistributor  is BaseDMContract{

    uint256 public lastCommunityDistributionTime = block.timestamp;
    uint256 public communityDistributionFrequencyInDays = 30 seconds;
    uint256 public totalCommunityDistribution = 0;

    uint256 public communityPoolBalanceWhileCommunityDistribution=0;
    uint256 public startIndexOfNextBatch;

    Membershipcontract public membershipContract;
    DeamMetaverseConfig public dmConfigContract;
    DMToken public dmTokenContract;

    constructor() {        
        console.log("DMCPDistributor contract initialised");
             
    }
  

    function mapContracts(address _membershipContractAddress,
                            address _configContractAddress,
                            address _dmTokenAddress) external onlyOwner
    {   
    console.log("DMCPdistributor : Executing Contract Mapping");
        
        thisContractAddress=address(this);
        
        if(_membershipContractAddress != address(0)){
            setMemberShipContract(_membershipContractAddress, thisContractAddress);
        }
        if(_configContractAddress != address(0)){
            setDMConfig(_configContractAddress, thisContractAddress);
        }
        if(_dmTokenAddress != address(0)){
            setDMToken(_dmTokenAddress, thisContractAddress);
        }
                    
    }

    function setMemberShipContract(address _membershipContractAddress, address _thisContractAddress) internal
    {   
        require(_membershipContractAddress != address(0), "Invalid address for Membership Contract");        
        membershipContract = Membershipcontract(_membershipContractAddress); 
        membershipContract.updateAllowedContract(_thisContractAddress);               
    }
    
    function setDMConfig(address _configContractAddress, address _thisContractAddress) internal
    {   
        require(_configContractAddress != address(0), "Invalid address for DMConfiguration contract");        
        dmConfigContract = DeamMetaverseConfig(_configContractAddress);
        dmConfigContract.updateAllowedContract(_thisContractAddress);                
    }

    function setDMToken(address _dmTokenAddress, address _thisContractAddress) internal
    {   
        require(_dmTokenAddress != address(0), "Invalid address for DM Token Contract");        
        dmTokenContract = DMToken(_dmTokenAddress);  
        dmTokenContract.updateAllowedContract(_thisContractAddress);     
                    
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
        require(block.timestamp >lastCommunityDistributionTime + communityDistributionFrequencyInDays,
                                         "Community Distribution Frequency Not Met");
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
        require(communityPoolBalanceWhileCommunityDistribution > 0, "Balance is Zero in the Community pool");
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


    function calculateShare(address account, uint256 totalPoolBalance)
        internal
        view        
        returns (uint256)
    {
        uint256 subscriptionBalance = subscribers[account].subscriptionBalance;
        uint256 share = (subscriptionBalance * totalPoolBalance) /
            totalSubscriptionAmountMembers;
        return share;
    }


}