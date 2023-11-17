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

    //uint256 public communityPoolBalanceWhileCommunityDistribution=0;
    uint256 public startIndexOfNextBatch;

    Membershipcontract public membershipContract;
    DeamMetaverseConfig public dmConfigContract;
    DMToken public dmTokenContract;

    constructor() {        
        logDMMessages("DMCPDistributor contract initialised");
             
    }
  

    function mapContracts(address _membershipContractAddress,
                            address _configContractAddress,
                            address _dmTokenAddress) external onlyOwner
    {   
        logDMMessages("DMCPdistributor : Executing Contract Mapping");
        
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

        logDMMessages("DMCPdistributor : Completed Executing Contract Mapping");
                    
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

    function getActiveMembers() external view onlyOwner returns (address[] memory activeMembersArr){
        activeMembersArr= membershipContract.getActiveMemAddresses();

        return activeMembersArr;
    }

    function DistributeCommunityPool(uint256 _startIndex, uint256 batchSize, uint8 forceDistribute) external onlyOwner returns (uint256,uint256,uint256){
        
       // address[] memory memberAddressList =  membershipContract.getMemberAddresses();
        address[] memory activeMembersArr=membershipContract.getActiveMemberAddresses();
        uint256 activeMemCount = activeMembersArr.length;
        require(activeMemCount > 0, "No active member to perform distribution");

        uint256 communityPoolBalance = dmTokenContract.getBalance(dmConfigContract.communityPoolWallet());
        
        require(communityPoolBalance > 0, "Balance is Zero in the Community pool");

        logDMMessages(string(abi.encodePacked(
            "Distribution to community pool started, DCP balance: ",
                             uintToString(communityPoolBalance),
            " Active Members: ",uintToString(activeMemCount)                            
                             
                             )));

        if(dmConfigContract.dcpDistributionIntervalCheck()==1){
            require(block.timestamp >lastCommunityDistributionTime + communityDistributionFrequencyInDays,
                                         "Community Distribution Frequency Not Met");
        }

        if(forceDistribute !=1){
            if(startIndexOfNextBatch != 0){
                require( _startIndex == startIndexOfNextBatch,
                    "Start Index should be greater than last distributed Index"); 
            }            
        }        

        require(_startIndex < activeMemCount, "Start index out of bounds");
        require(batchSize > 0, "Batch size must be greater than 0");

        uint256 endIndex = _startIndex + batchSize -1;
        if (endIndex > activeMemCount) {
            endIndex = activeMemCount-1;
        }
        
        uint256 share = calculateShare( communityPoolBalance, activeMemCount);
        uint256 distributedAmount=0;
        uint256 i=0;
        for ( i = _startIndex; i <= endIndex; i++) {
                uint256 pendingReward = membershipContract.getPendingReward(activeMembersArr[i],dmConfigContract.maxRewardsMultiplier());
                if (pendingReward > 0) {

                    if (pendingReward < share) {
                        share = pendingReward;
                    }
                    dmTokenContract.transfer(dmConfigContract.communityPoolWallet(), activeMembersArr[i], share);
                    totalCommunityDistribution += share;

                }

               distributedAmount += share;
                    logDMMessages(string(abi.encodePacked(
                        " Sno: ",uintToString(i),
                        " Member Addres: ",addressToString(activeMembersArr[i]),
                        " Shared amount: ",uintToString(share),                             
                        " Distributed Amount",uintToString(distributedAmount)                            
                        
                    )));
        }

        logDMMessages(string(abi.encodePacked(
                             " Share per member: ",uintToString(share),
                             " Total Active members: ",uintToString(i),
                             " DCP balance Amount",uintToString((communityPoolBalance-distributedAmount))                           
                             
                             )));
        
        if(endIndex == activeMemCount-1){
            lastCommunityDistributionTime = block.timestamp;            
            startIndexOfNextBatch = 0;
        }else{
            startIndexOfNextBatch = endIndex+1;
        }

        return (startIndexOfNextBatch,totalCommunityDistribution,communityPoolBalance);
    }


    function calculateShare( uint256 totalPoolBalance,uint256 activeMemberCount) pure
        internal                
        returns (uint256)
    {

        uint256 share =  totalPoolBalance/activeMemberCount;
        return share;
    }


}