// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

contract SubscriptionContract {
    enum UserType {
        Member,
        Promotor
    }

    address public owner;
    struct Subscription {
        UserType userType;
        uint256 subscriptionBalance;
        uint256 rewardReceived;
        uint256 validity;
        address referrer;
        address[] referrals;
        address subscriber;
    }

    mapping(address => Subscription) public subscribers;
    address[] public memberAddresses;
    address[] public promotorAddresses;
    address public allowedContract;

    uint256 public totalSubscriptionAmountMembers = 0;
    uint256 public rewardMultiplier = 3;
    uint256 public totalMembers=0;
    uint256 public totalPromotors;

    constructor() {
        owner = msg.sender;
        subscribers[owner] = Subscription({
            userType: UserType.Member,
            subscriptionBalance: 0,
            rewardReceived: 0,
            validity: 0,
            referrals: new address[](0),
            referrer: address(0),
            subscriber: owner
        });

        memberAddresses.push(owner);
        totalMembers +=1;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "ERC20: Only the contract owner can call this function"
        );
        _;
    }

    modifier onlyAllowedContract() {
        require(msg.sender == allowedContract, "Not authorized");
        _;
    }

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
        return subscribers[userAddress].subscriptionBalance > 0;
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
        require(userAddress != address(0), "Invalid address");
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

    function subscribe(
        address subscriber,
        UserType _usertype,
        uint256 subscriptionAmount,
        address _referrer,
        uint256 _validity

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

        subscribers[_referrer].referrals.push(subscriber);
        if(_usertype == UserType.Member){
            totalSubscriptionAmountMembers += subscriptionAmount;
            memberAddresses.push(subscriber);
            totalMembers +=1;
        }
        if(_usertype == UserType.Promotor){
            promotorAddresses.push(subscriber);
            totalPromotors +=1;
        }
    }

    function updateAllowedContract(address _allowedContract)
        external
        onlyOwner
    {
        allowedContract = _allowedContract;
    }

    function addReceivedReward(address account, uint256 amount)
        external
        onlyAllowedContract
    {
        subscribers[account].rewardReceived += amount;
    }

    function getPendingReward(address account) external view returns  (uint256)  {
        return
            (rewardMultiplier * subscribers[account].subscriptionBalance) -
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

    function getPromotorValidity(address account) external view returns (uint256) {
        require(subscribers[account].userType == UserType.Promotor, "ERC20: Not a Promotor");
        return subscribers[account].validity;
    }

    function getMemberAddresses() external view returns (address[] memory) {
        return memberAddresses;
    }

    function calculateShare(address account,uint256 totalPoolBalance) external view onlyAllowedContract returns (uint256)  {
        uint256 subscriptionBalance = subscribers[account].subscriptionBalance;
        uint256 share = (subscriptionBalance * totalPoolBalance) / totalSubscriptionAmountMembers;
        return share;
    }

}
