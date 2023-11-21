// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "hardhat/console.sol";
import "./BaseDMContract.sol";

contract DMTransactions is BaseDMContract{

    mapping(address => LevelRewards) private memberLevelRewards;//Key:Sponsoraddress-->Value: Struct of rewards generated from the member

    struct LevelRewards {        
        address sponsor;  
        mapping(uint256 => mapping(address => uint256)) rewards;  // Key: Level value: ( key: member address value: member reward)      
        
        //The below variables will be updated only for the first update of new member
        address[] allMembers; // All members under this sponsor is stored irrespective of the level
        mapping(address => uint8)  allMembersLevelMap;//Key=MemberAddress & Value=Level are stored same for iterative purpose
    }

    function updateRewardsTxn(address sponsor, uint8 level, address member, uint256 reward) public onlyAllowedContract{
        
        bool uniqMember=true;

        uint8 levelValue =memberLevelRewards[sponsor].allMembersLevelMap[member];
        if(levelValue != 0){
            uniqMember=false;
        }
        console.log(string(abi.encodePacked(                                   
                                " Sponsor: ",addressToString(sponsor),
                                " Member: ",addressToString(member),
                                " Level: ",uintToString(level),
                                " Reward: ",uintToString(reward),
                                " levelValue: ",uintToString(levelValue)

                                )));
        

        if(uniqMember)  {
            memberLevelRewards[sponsor].allMembersLevelMap[member]=level;
            memberLevelRewards[sponsor].allMembers.push(member);                                            
        }

        memberLevelRewards[sponsor].rewards[level][member]+= reward;
    }

   

    function getSponsorLevelrewards(address sponsor) external view 
     returns  (address[] memory, uint256[] memory,uint256[] memory ){

       
        uint256 allMemCount=memberLevelRewards[sponsor].allMembers.length;

        console.log(string(abi.encodePacked(                                   
                                " Sponsor: ",addressToString(sponsor),
                                " allMemCount: ",uintToString(allMemCount)                              
                                )));


                address[] memory levelMemberAddressArry=new address[](allMemCount);
                uint256[] memory levelMemberRewardsArry=new uint256[](allMemCount);
                uint256[] memory levelArry=new uint256[](allMemCount);

        for (uint256 index = 0; index< allMemCount; index++) {

            address memberAddress = memberLevelRewards[sponsor].allMembers[index];
            uint8 memberlevel     = memberLevelRewards[sponsor].allMembersLevelMap[memberAddress];
            uint256 memberReward  = memberLevelRewards[sponsor].rewards[memberlevel][memberAddress];

            levelMemberAddressArry[index] = memberAddress;
            levelMemberRewardsArry[index] = memberReward; 
            levelArry[index]=memberlevel;

                        console.log(string(abi.encodePacked(                                   
                                " Sponsor: ",addressToString(sponsor),                                
                                " MemberAddress: ",addressToString(memberAddress),                                
                                " MemberLevel: ",uintToString(memberlevel),
                                " MemberReward: ",uintToString(memberReward)                                
                                )));
            
        }

        return (levelMemberAddressArry,levelMemberRewardsArry,levelArry);

    }



}