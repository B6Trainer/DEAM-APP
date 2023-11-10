// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
import "hardhat/console.sol";
import "./BaseDMContract.sol";

contract Membershipcontract is BaseDMContract {
    enum UserType {
        Member,
        Promotor,
        Guest
    }

    struct Subscription {
        UserType userType;
        uint256 subscriptionBalance;
        uint256 rewardReceived;
        uint256 validity;
        address referrer;
        address[] referrals;
        address subscriber;
    }

    struct MemberProfile {
        UserType userType;  
        address memberAddress;      
        string name;
        string email;
        string mobile;        
    }

    mapping(address => Subscription) private subscribers;
    mapping(address => MemberProfile) private memberProfiles;
    address[] public memberAddresses;
    mapping(address => address) private allowedContracts;

    uint256 public totalSubscriptionAmountMembers = 0;
    uint256 public totalMembers = 0;

    constructor() {
        owner = msg.sender;
        allowedContracts[owner] = owner;
        subscribers[owner] = Subscription({
            userType: UserType.Member,
            subscriptionBalance: 0,
            rewardReceived: 0,
            validity: 0,
            referrals: new address[](0),
            referrer: address(0),
            subscriber: owner
        });

        memberProfiles[owner] = MemberProfile({
            userType: UserType.Member,  
            memberAddress: owner,          
            name: "The Owner",
            email: "owner@mydeam.co",
            mobile: "+97100000000"            
        });

        memberAddresses.push(owner);
        totalMembers += 1;
    }

    event Log(string message);
    event Logaddress(address add);

    function getUserType(address userAddress) external view returns (UserType) {
        return subscribers[userAddress].userType;
    }

    function isPromotor(address userAddress) external view returns (bool) {
        return subscribers[userAddress].userType == UserType.Promotor;
    }

    function isMember(address userAddress) external view returns (bool) {
        return subscribers[userAddress].userType == UserType.Member;
    }

    function isSubscriber(address userAddress) external view returns (bool) {
        return subscribers[userAddress].subscriber != address(0);
    }

    function getSubscriptionDetails(address userAddress)
        external
        view
        returns (
            UserType userType,
            uint256 subscriptionBalance,
            uint256 rewardReceived,
            uint256 validity,
            address[] memory referrals,
            address referrer,
            address _subscriber
        )
    {
        require(userAddress != address(0), "Membership: Invalid User address given");
        Subscription memory subscription = subscribers[userAddress];
        return (
            subscription.userType,
            subscription.subscriptionBalance,
            subscription.rewardReceived,
            subscription.validity,
            subscription.referrals,
            subscription.referrer,
            subscription.subscriber
        );
    }


    function getMemberDetails(address userAddress)
        external
        view
        returns (
            UserType userType,
            address memberAddress,
            string memory name,
            string memory email,
            string memory mobile 
        )
    {

 

        require(userAddress != address(0), "Membership: Invalid User address given");
        MemberProfile memory memProfile = memberProfiles[userAddress];
        return (
            memProfile.userType,
            memProfile.memberAddress,
            memProfile.name,
            memProfile.email,
            memProfile.mobile
        );
    }

    function subscribe(
        address subscriber,
        UserType _usertype,
        uint256 subscriptionAmount,
        address _referrer,
        uint256 _validity,
        string memory _email,
        string memory _mobile,
        string memory _name
    ) external onlyAllowedContract {
        subscribers[subscriber] = Subscription({
            userType: _usertype,
            subscriptionBalance: subscriptionAmount,
            rewardReceived: 0,
            validity: _validity,
            referrals: new address[](0),
            referrer: _referrer,
            subscriber: subscriber
        });

        memberProfiles[subscriber] = MemberProfile({
            userType: UserType.Member,  
            memberAddress: subscriber,          
            name: _name,    
            email: _email,
            mobile: _mobile        
        });

        subscribers[_referrer].referrals.push(subscriber);
        if (_usertype == UserType.Member) {
            totalSubscriptionAmountMembers += subscriptionAmount;
            memberAddresses.push(subscriber);
            totalMembers += 1;
        }
    }

    function addReceivedReward(address account, uint256 amount)
        external
        onlyAllowedContract
    {
        subscribers[account].rewardReceived += amount;
    }

    function getPendingReward(address account, uint256 _rewardMultiplier)
        external
        view
        returns (uint256)
    {
        return
            (_rewardMultiplier * subscribers[account].subscriptionBalance) -
            subscribers[account].rewardReceived;
    }

    function getReferrer(address account) external view returns (address) {
        return subscribers[account].referrer;
    }

    function topUpSubscriptionBalance(address account, uint256 amount)
        external
        onlyAllowedContract
    {
        subscribers[account].subscriptionBalance += amount;
    }

    function calculateShare(address account, uint256 totalPoolBalance)
        external
        view
        onlyAllowedContract
        returns (uint256)
    {
        uint256 subscriptionBalance = subscribers[account].subscriptionBalance;
        uint256 share = (subscriptionBalance * totalPoolBalance) /
            totalSubscriptionAmountMembers;
        return share;
    }

    function updateUserType(address account, UserType _userType)
        external
        onlyOwner
        returns (bool)
    {
        subscribers[account].userType = _userType;
        memberProfiles[account].userType = _userType;
        return true;
    }

    function updateReferrer(address account, address _referrer)
        external
        onlyOwner
        returns (bool)
    {
        subscribers[account].referrer = _referrer;
        return true;
    }

    function getMemberAddresses() external view onlyAllowedContract returns (address[] memory) {
        return memberAddresses;
    }
}
