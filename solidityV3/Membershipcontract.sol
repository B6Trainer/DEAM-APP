// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

contract Membershipcontract {
    
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
        string email;
        string mobile;
        string name;
    }

    mapping(address => Subscription) private subscribers;
    address[] public memberAddresses;
    mapping(address => address) private allowedContracts;

    uint256 public totalSubscriptionAmountMembers = 0;
    uint256 public totalMembers=0;

    constructor() {
        owner = msg.sender;
        allowedContracts[owner]=owner;
        subscribers[owner] = Subscription({
            userType: UserType.Member,
            subscriptionBalance: 0,
            rewardReceived: 0,
            validity: 0,
            referrals: new address[](0),
            referrer: address(0),
            subscriber: owner,
            email:"test@test.com",
            mobile:"+971502387786",
            name: "test"
        });

        memberAddresses.push(owner);
        totalMembers +=1;
    }

    event Log(string message);
    event Logaddress(address add);
    modifier onlyOwner() {


        //string memory errormessage =String.concat("MembershipContract: Only the contract owner can call this function. OWner:",owner," MsgSender:",msg.sender);
        string memory errormessage =string(abi.encodePacked("MembershipContract: Only the contract owner can call this function. Owner: ",
                                            addressToString(owner),
                                            " MsgSender: ",
                                            addressToString(msg.sender),
                                            " tx.origin: ",
                                            addressToString(tx.origin)
                                            ));
        //string memory errormessage="MembershipContract: Only the contract owner can call this function.";
        emit Log("MembershipContract: Only the contract owner can call this function. logged");
        emit Logaddress(owner);
        emit Logaddress(msg.sender);
        require(msg.sender == owner,errormessage);
        _;
    }

    function addressToString(address _address) internal pure returns(string memory) {
    bytes32 _bytes = bytes32(uint256(uint160(_address)));
    bytes memory HEX = "0123456789abcdef";
    bytes memory _string = new bytes(42);
    _string[0] = '0';
    _string[1] = 'x';
    for(uint i = 0; i < 20; i++) {
        _string[2+i*2] = HEX[uint8(_bytes[i + 12] >> 4)];
        _string[3+i*2] = HEX[uint8(_bytes[i + 12] & 0x0f)];
    }
    return string(_string);
    }

    modifier onlyAllowedContract() {
        require(allowedContracts[msg.sender] != address(0), "Only the authorized contracts can call this function");
        _;
    }

    function updateAllowedContract(address _allowedContract) external onlyOwner{
        allowedContracts[_allowedContract]=_allowedContract;
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
            address _subscriber,
            string memory email,
            string memory mobile,
            string memory name
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
            subscription.subscriber,
            subscription.email,
            subscription.mobile,
            subscription.name
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
            subscriber: subscriber,
            email: _email,
            mobile: _mobile,
            name: _name
        });

        subscribers[_referrer].referrals.push(subscriber);
        if(_usertype == UserType.Member){
            totalSubscriptionAmountMembers += subscriptionAmount;
            memberAddresses.push(subscriber);
            totalMembers +=1;
        }
    }



    function addReceivedReward(address account, uint256 amount)
        external
        onlyAllowedContract
    {
        subscribers[account].rewardReceived += amount;
    }

    function getPendingReward(address account,uint256 _rewardMultiplier) external view returns  (uint256)  {
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

    function calculateShare(address account,uint256 totalPoolBalance) external view onlyAllowedContract returns (uint256)  {
        uint256 subscriptionBalance = subscribers[account].subscriptionBalance;
        uint256 share = (subscriptionBalance * totalPoolBalance) / totalSubscriptionAmountMembers;
        return share;
    }

    function updateUserType(address account, UserType _userType) external onlyOwner returns (bool)  {
        subscribers[account].userType = _userType; 
        return true;
    }

     function updateReferrer(address account, address _referrer) external onlyOwner returns (bool)  {
        subscribers[account].referrer = _referrer; 
        return true;
    }

    function getMemberAddresses() external view returns (address[] memory) {
        return memberAddresses;
    }

}
