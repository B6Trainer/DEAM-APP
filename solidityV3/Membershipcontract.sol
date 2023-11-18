// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
import "hardhat/console.sol";
import "./BaseDMContract.sol";
import "./DeamMetaverseConfig.sol";

contract Membershipcontract is BaseDMContract {

    DeamMetaverseConfig public dmConfigContract;

    enum UserType {
        Member,
        Promotor,
        Guest,
        Admin
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
    address[] public allProfileAddresses;
    address[] public memberAddresses;
    mapping(address => address) private allowedContracts;

    //Data store to perform Communitity distribution
    uint256 public activeMembersCount = 0;
    mapping(address => bool) private activeMembers;

    uint256 public totalSubscriptionAmountMembers = 0;
    uint256 public totalMembers = 0;

    constructor() {
        owner = msg.sender;        
        allowedContracts[owner] = owner;
        

        logDMMessages("Membership contract constructed");  
        
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
        allProfileAddresses.push(owner);
        totalMembers += 1;
        
    }

    event Log(string message);
    event Logaddress(address add);

    function mapContracts(address _configContractAddress) external onlyOwner {

        logDMMessages("MemberShipContract : Executing Contract Mapping");

        thisContractAddress = address(this);        
        configContractAddress = _configContractAddress;
            
        if (_configContractAddress != address(0)) {
            setDMConfig(_configContractAddress, thisContractAddress);
        }
    
        logDMMessages("MemberShipContract : Completed Executing Contract Mapping");
    }

    function setDMConfig(
        address _configContractAddress,
        address _thisContractAddress
    ) internal {
        require(
            _configContractAddress != address(0),
            "Invalid address for DMConfiguration contract"
        );
        dmConfigContract = DeamMetaverseConfig(
            _configContractAddress
        );
        dmConfigContract.updateAllowedContract(_thisContractAddress);
    }

    function getUserType(address userAddress) external view returns (UserType) {
        return subscribers[userAddress].userType;
    }

    function isPromotor(address userAddress) external view returns (bool) {
        return (userAddress != address(0) && memberProfiles[userAddress].userType == UserType.Promotor);
    }

    function isAdmin(address userAddress) external view returns (bool) {
        return (userAddress != address(0) && memberProfiles[userAddress].userType == UserType.Admin);
    }

    function isMember(address userAddress) external view returns (bool) {
        return (userAddress != address(0) && memberProfiles[userAddress].userType == UserType.Member);
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

    function getMemberShipSummary() external view 
                returns (uint256 ,uint256 ,uint256)
    {

        return (
            totalMembers,
            totalSubscriptionAmountMembers,
            activeMembersCount
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

        subscribeMembers( subscriber,_usertype,subscriptionAmount,
                           _referrer,_validity,_email,_mobile,_name);

    }


    function subscribeMembers(
        address subscriber,
        UserType _usertype,
        uint256 subscriptionAmount,
        address _referrer,
        uint256 _validity,
        string memory _email,
        string memory _mobile,
        string memory _name
    ) internal  {

        //Registering as subscriber
        subscribers[subscriber] = Subscription({
            userType: _usertype,
            subscriptionBalance: 0, //amount will be added below with addsubscriptionbalance method
            rewardReceived: 0,
            validity: _validity,
            referrals: new address[](0),
            referrer: _referrer,
            subscriber: subscriber
        });

        memberProfiles[subscriber] = MemberProfile({
            userType: _usertype,  
            memberAddress: subscriber,          
            name: _name,    
            email: _email,
            mobile: _mobile        
        });

        allProfileAddresses.push(subscriber);        
        subscribers[_referrer].referrals.push(subscriber);

        if (_usertype == UserType.Member) {
            
            memberAddresses.push(subscriber);
            totalMembers += 1;

            addSubscriptionBalance( subscriber, subscriptionAmount);
                        

        }

        logDMMessages(string(abi.encodePacked(
            " New Subscriber MemberType: ",_usertype,
            " Member Addres: ",addressToString(subscriber),
            " Name: ",_name,   
            " Email: ",_email,   
            " Mobile: ",_mobile,                             
            " Subscribed Amount",uintToString(subscriptionAmount)                            
            
        )));
    }

    function topUpSubscriptionBalance(address account, uint256 amount)
        external
        onlyAllowedContract
    {
        addSubscriptionBalance(account,amount);
    }

    function addSubscriptionBalance(address account, uint256 amount) internal        
    {
        totalSubscriptionAmountMembers += amount;
        subscribers[account].subscriptionBalance += amount;

        if(!activeMembers[account]){
            if(subscribers[account].rewardReceived<=
                (subscribers[account].subscriptionBalance*dmConfigContract.maxRewardsMultiplier())){
                activeMembersCount += 1;
                activeMembers[account]=true;
            }
        }
        

    }

    function addReceivedReward(address account, uint256 amount)
        external
        onlyAllowedContract
    {
        subscribers[account].rewardReceived += amount;

        if(activeMembers[account]){
           
            if(subscribers[account].rewardReceived>=
                    (subscribers[account].subscriptionBalance*dmConfigContract.maxRewardsMultiplier()))
            {
                activeMembersCount -= 1;
                activeMembers[account]=false;
            }
        }

    }

    function getPendingReward(address account, uint256 _rewardMultiplier)
        external
        view
        returns (uint256)
    {
        if(subscribers[account].subscriptionBalance>0){
            return
            (_rewardMultiplier * subscribers[account].subscriptionBalance) -
            subscribers[account].rewardReceived;
        }else{
            return 0;
        }
        
    }

    function getSubscribedBalance(address account)
        external view returns(uint256)
    {

        return subscribers[account].subscriptionBalance;
        
    }

    function getRewardsReceived(address account)
        external view returns(uint256)
    {

        return subscribers[account].rewardReceived;
        
    }

    function getReferrer(address account) external view returns (address) {
        return subscribers[account].referrer;
    }


    /*
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
    }*/


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

    function getActiveMemAddresses() external view onlyAllowedContract returns (address[] memory) {
        return activeMembersArr;
    }

    address[] public activeMembersArr;
    function getActiveMemberAddresses() external onlyAllowedContract returns (address[] memory) {

        // Clear the filtered array
        delete activeMembersArr;

        uint256 membercount=memberAddresses.length;
         
        
        for (uint8 i=0; i<membercount; i++) 
        {
            if(activeMembers[memberAddresses[i]])
            {         
                if(subscribers[memberAddresses[i]].subscriptionBalance>0)
                {
                    //activeMembersArr[i]=memberAddresses[i];
                    activeMembersArr.push(memberAddresses[i]);
                    
                }else{
                    activeMembers[memberAddresses[i]]=false;
                }
                
            }

        }
        return activeMembersArr;
    }

    function getProfileDetails() external view onlyAllowedContract
     returns (
        UserType[] memory userTypeArr,
            address[] memory profileAddressArr,
            string[] memory nameArr,
            string[] memory emailArr,
            string[] memory mobileArr,
            uint profileCount,
            uint256 [] memory subsBalance,
            uint256[] memory rewardReceived,
            address[] memory referrer ) {

        
        profileCount=allProfileAddresses.length;
        
        userTypeArr = new UserType[] (profileCount) ;
        profileAddressArr= new address[] (profileCount);
        nameArr= new string[](profileCount) ;
        emailArr= new string[](profileCount) ;
        mobileArr= new string[](profileCount) ; 
        subsBalance= new uint256[](profileCount) ;
        rewardReceived= new uint256[](profileCount) ;
        referrer= new address[](profileCount) ; 

        for (uint i = 0; i < profileCount; i++) {
                
            MemberProfile memory memProfile = memberProfiles[allProfileAddresses[i]];
        
            userTypeArr[i]=memProfile.userType;
            profileAddressArr[i]=memProfile.memberAddress;
            nameArr[i]=memProfile.name;
            emailArr[i]=memProfile.email;
            mobileArr[i]=memProfile.mobile;

            Subscription memory subscription = subscribers[allProfileAddresses[i]]; 

            subsBalance[i]=subscription.subscriptionBalance;
            rewardReceived[i]=subscription.rewardReceived;                      
            referrer[i]=subscription.referrer;
            

        
        }

            return (userTypeArr, profileAddressArr, nameArr,emailArr,mobileArr,
                    profileCount,subsBalance,rewardReceived,referrer);

    }

}
