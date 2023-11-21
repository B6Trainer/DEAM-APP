// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./Membershipcontract.sol";
import "./DMCPdistributor.sol";
import "./DeamMetaverseConfig.sol";
import "./DMTransactions.sol";
import "./IBEP20.sol";
import "./DMToken.sol";
import "hardhat/console.sol";
import "./BaseDMContract.sol";


contract DMManager is BaseDMContract {
   
    Membershipcontract public membershipContract;
    DeamMetaverseConfig public deamMetaverseConfigContract;

    DMCPdistributor public dcomdistributor;
    DMTransactions public dmTransactions;

    mapping(address => uint256) public lastWithdrawTime;
    mapping(address => uint256) public numberOfWithdrawals;

    uint256 public minimumWithdrawalLimit = 50 * 10**18;
    uint256 public withdrawalsAllowedADay = 1;



    constructor() {
        logDMMessages("DMManager contract initialised");
    }

    function mapContracts(
        address _membershipContractAddress, address _configContractAddress,
        address _dmTokenAddress, address _usdtToken, address _dcpDistAddress,
        address _dmTransactionsAddress
    ) external onlyOwner {

        logDMMessages("DMManager : Executing Contract Mapping");

        thisContractAddress = address(this);

        membershipContractAddress = _membershipContractAddress;
        configContractAddress = _configContractAddress;
        dmTokenAddress = _dmTokenAddress;
        usdtTokenAddress = _usdtToken;
        dcpDistAddress = _dcpDistAddress;
        dmManagerAddress = address(this);
        dmTransactionsAddress=_dmTransactionsAddress;
       

        if (_membershipContractAddress != address(0)) {
            setMemberShipContract(
                _membershipContractAddress,
                thisContractAddress
            );
        }
        if (_configContractAddress != address(0)) {
            setDMConfig(_configContractAddress, thisContractAddress);
        }
        if (_dmTokenAddress != address(0)) {
            setDMToken(_dmTokenAddress, thisContractAddress);            
        }

        if (_usdtToken != address(0)) {
            setUSDTToken(_usdtToken);
        }
        if (_dcpDistAddress != address(0)) {
            setDCPDistributor(_dcpDistAddress, thisContractAddress);
        }
        if (_dmTransactionsAddress != address(0)) {
            setDMTransactions(_dmTransactionsAddress);
        }

        logDMMessages("DMManager : Completed Executing Contract Mapping");
    }



   function setDMTransactions( address _dmTransactionsAddress
    ) internal {
        require(
            _dmTransactionsAddress != address(0),
            "Invalid address for DMTransactions Contract"
        );
        dmTransactions = DMTransactions(_dmTransactionsAddress);
        dmTransactions.updateAllowedContract(thisContractAddress);
    }

    function setMemberShipContract( address _membershipContractAddress,
        address _thisContractAddress
    ) internal {
        require(
            _membershipContractAddress != address(0),
            "Invalid address for Membership Contract"
        );
        membershipContract = Membershipcontract(_membershipContractAddress);
        membershipContract.updateAllowedContract(_thisContractAddress);
    }

    function setDMConfig(
        address _configContractAddress,
        address _thisContractAddress
    ) internal {
        require(
            _configContractAddress != address(0),
            "Invalid address for DMConfiguration contract"
        );
        deamMetaverseConfigContract = DeamMetaverseConfig(
            _configContractAddress
        );
        deamMetaverseConfigContract.updateAllowedContract(_thisContractAddress);
    }



    function setDCPDistributor(
        address _dcpDistAddress,
        address _thisContractAddress
    ) internal {
        require(
            _dcpDistAddress != address(0),
            "Invalid address for DCPDistributor Contract"
        );
        dcomdistributor = DMCPdistributor(_dcpDistAddress);
        dcomdistributor.updateAllowedContract(_thisContractAddress);
    }

   



    function withdraw(uint256 amount) external returns (bool) {
        
        bool validmember=false;
        if(membershipContract.isMember(msg.sender)
            || membershipContract.isPromotor(msg.sender)
            || membershipContract.isAdmin(msg.sender)){

                require(amount > 0, "DMManager: withdraw amount must be greater than zero");
                uint256 tokenamount = dmTokenContract.getBalance(msg.sender);
                require(tokenamount >= amount, "DMManager: Insufficient DMTK balance");
                require(amount >= minimumWithdrawalLimit, "DMManager: Minimum Withdrawal not met");


                if(deamMetaverseConfigContract.withdrawdailyLimitCheck()==1){
                    require(block.timestamp > lastWithdrawTime[msg.sender] + 1 days,
                                "DMManager: Daily withdrawal Limit exceeded, Please try tommorrow");
                    //require(numberOfWithdrawals[msg.sender] <= withdrawalsAllowedADay,"DMManager: Withdrawals For the Day Exceeded");
                }        
                
                uint256 amountAfterFee = deductConversionFee(amount,msg.sender);
                usdtToken.transfer(msg.sender, amountAfterFee);
                dmTokenContract.burn(msg.sender, amountAfterFee);//Conversion fee is burnt while conversion fee is calculated
                lastWithdrawTime[msg.sender] = block.timestamp;

                logDMMessages( string(abi.encodePacked(uintToString(amount),
                                        " DMTK withdraw processed for memeber ",
                                        addressToString(msg.sender)))
                                );
                //numberOfWithdrawals[msg.sender] += 1;
                return true;

        }else{

                require(validmember, "DMManager: Withdraw requested client is not an active member");
                return false;

        }

        

    }

    function deductConversionFee(uint256 amount, address sendingMember) internal returns (uint256) {
        uint256 percentageDecimals = dmTokenContract.percentageDecimals();
        
        uint256 conversionfee;
        if(membershipContract.isMember(sendingMember)){
            conversionfee=deamMetaverseConfigContract.conversionFeeMember();
        }else if(membershipContract.isPromotor(sendingMember)){
            conversionfee=deamMetaverseConfigContract.conversionFeePromoter();
        }

        uint256 feeAmount = (amount * conversionfee) /(100 * percentageDecimals);
        if (feeAmount > 0) {
            uint256 conversionWalletAmount = (feeAmount * 70) / 100;
            uint256 communityPoolWalletAmount = (feeAmount * 30) / 100;
            //dmTokenContract.balanceOf(deamMetaverseConfigContract.conversionFeeWallet());
            dmTokenContract.addBalance(
                deamMetaverseConfigContract.conversionFeeWallet(),
                conversionWalletAmount
            );
            dmTokenContract.addBalance(
                deamMetaverseConfigContract.communityPoolWallet(),
                communityPoolWalletAmount
            );
            
            
            dmTokenContract.reduceBalance(msg.sender, feeAmount);
            
            dmTokenContract.emittransfer(
                msg.sender,
                deamMetaverseConfigContract.conversionFeeWallet(),
                conversionWalletAmount
            );
            dmTokenContract.emittransfer(
                msg.sender,
                deamMetaverseConfigContract.communityPoolWallet(),
                communityPoolWalletAmount
            );
        }
        return amount - feeAmount;
    }

    

    function SelfRegistrationasMember(
        uint256 subscriptionAmount,address _referrer) external {
       
        if(_referrer == address(0)){
            _referrer=deamMetaverseConfigContract.foundersWallet();
        }
        registerMember(msg.sender,msg.sender,subscriptionAmount, _referrer, "NA", "NA", "NA");
        
    }

    function registerForAMember(
        address _memberAddress,
        uint256 subscriptionAmount,
        address _referrer,
        string memory _email,
        string memory _mobile,
        string memory _name
    ) external {

        registerMember(_memberAddress,msg.sender,subscriptionAmount, _referrer, _email, _mobile, _name);
        
    }

    function registerMember(
        address _memberAddress,
        address _usdtSourceAddress,
        uint256 subscriptionAmount,
        address _referrer,
        string memory _email,
        string memory _mobile,
        string memory _name
    ) internal {

        logDMMessages("Executing Member registration validation ");
  
        require(
            !membershipContract.isSubscriber(_memberAddress),
            "DMManager: The member trying to register is already a member, The member may top up"
        );
        require(
            membershipContract.isSubscriber(_referrer),
            "DMManager: The referrer is not a member, Please provide a registered member as referrer"
        );

        require(
            subscriptionAmount >=deamMetaverseConfigContract.minimumDepositForMembers(),
            "DMManager: Given amount is less than Minimum Member Deposit "
        );
        require(
           usdtToken.allowance(_usdtSourceAddress,address(this)) >= subscriptionAmount,
           "DMManager: Insufficient USDT approved by the registrar wallet"
        );
        require(
            usdtToken.balanceOf(_usdtSourceAddress) >= subscriptionAmount,
            "DMManager: Insufficient USDT Balance in the registrar wallet"
        );


        logDMMessages("Member registration validation passed");

        usdtToken.transferFrom(_usdtSourceAddress, address(this), subscriptionAmount);

        logDMMessages(string(abi.encodePacked("Starting the Rewards distribution for registration/topup amount: ",
                             uintToString(subscriptionAmount))));
        
        membershipContract.subscribe(
            _memberAddress,Membershipcontract.UserType.Member,subscriptionAmount,
            _referrer,0,_email,_mobile,_name);

        distributeRewardsForMembers(subscriptionAmount, _referrer, _memberAddress);
    }


    function addPromotor(
        address promoterAddress,            
        string memory _email,
        string memory _mobile,
        string memory _name
    ) external onlyOwner {
        require(promoterAddress != address(0), string(abi.encodePacked(
                                    "DMManager: Invalid wallet address : ",addressToString(promoterAddress),
                                    " Message Sender: : ",addressToString(msg.sender)
                                    
                                    )));
        require(
            !membershipContract.isSubscriber(promoterAddress),
           string(abi.encodePacked(
            "DMManager: The requested  member/promoter : ",addressToString(promoterAddress),
                                    "is already a member, Message Sender: : ",addressToString(msg.sender)
           
           )));

        membershipContract.subscribe(
            promoterAddress,Membershipcontract.UserType.Promotor,
            0,//Setting subscription amount as zero for promoters
            owner,
            0,//Setting validity for lifetime
            _email,_mobile,_name
        );
    }
   

    function distributeRewardsForMembers(uint256 amount, address referrer, address memberAddress)
        internal
    {
        uint256 maxRewardAllowed = (deamMetaverseConfigContract.levelRewardPercentage() * amount) / 100; //71%
        logDMMessages(string(abi.encodePacked("Members - Distributing Level Rewards", 
                                            uintToString(maxRewardAllowed),
                                            " Amount: ",uintToString(amount),
                                            " Referrer: ",addressToString(referrer)
                                            )));
        uint256 rewardsLeft = distributeLevelRewards(referrer,amount,maxRewardAllowed,memberAddress);
        
        emit logMessage(string(abi.encodePacked("Members - Level Rewards distributed ", uintToString(maxRewardAllowed))));
        if (rewardsLeft > 0) {
            dmTokenContract.mint(deamMetaverseConfigContract.foundersWallet(),rewardsLeft);
        }

        //Admin wallet rewards distribution
        allocateAdminWallets(amount);
    }

    function allocateAdminWallets(uint256 amount) internal {

        uint256 communityPoolShare = (amount * deamMetaverseConfigContract.communityPoolSharePercent()) / 100;
        uint256 marketingShare = (amount * deamMetaverseConfigContract.marketingSharePercent()) / 100;
        uint256 technologyShare = (amount * deamMetaverseConfigContract.technologySharePercent()) / 100;
        uint256 foundersShare = (amount * deamMetaverseConfigContract.foundersSharePercent()) / 100;
        uint256 transactionPoolShare = (amount * deamMetaverseConfigContract.transactionPoolSharePercent()) / 100;

        dmTokenContract.mint(deamMetaverseConfigContract.communityPoolWallet(),communityPoolShare);
        dmTokenContract.mint(deamMetaverseConfigContract.marketingWallet(),marketingShare);
        dmTokenContract.mint(deamMetaverseConfigContract.technologyWallet(),technologyShare);
        dmTokenContract.mint(deamMetaverseConfigContract.foundersWallet(),foundersShare);
        dmTokenContract.mint(deamMetaverseConfigContract.transactionPoolWallet(),transactionPoolShare);

       logDMMessages(string(abi.encodePacked("Admin - Rewards distributed to CommPool: ", 
                                        uintToString(communityPoolShare),
                                        " Marketing: ",uintToString(marketingShare),
                                        " Tech: ",uintToString(technologyShare),
                                        " Founder: ",uintToString(foundersShare),
                                        " Transaction: ",uintToString(transactionPoolShare)                                        
                                        )));
    }

    function distributeLevelRewards(address referrer,uint256 subsAmount,uint256 maxRewardAmount, address memberAddress) 
                                                            public returns (uint256 remainingAmount) {

        remainingAmount=maxRewardAmount;

        uint totalDepth=15; //Need to get this from Config

        uint256 percentageDecimals = dmTokenContract.percentageDecimals();
        uint256[7] memory levelPercentage = deamMetaverseConfigContract.getlevelPercentageArray();
 
        address _1up_sponsor=referrer;
        
        for (uint8 currentDepth = 1; currentDepth <= totalDepth; currentDepth++) {

            logDMMessages(string(abi.encodePacked(uintToString(currentDepth),
                        "-Level Reward1 for Sponsor: ", addressToString(_1up_sponsor),
                        " Subs Amount: ",uintToString(subsAmount),                        
                        " Remaining rewards: ",uintToString(remainingAmount)                                       
                        )));

            if(remainingAmount>0){
                
                uint256 levelReward=calculateLevelRewards(subsAmount, currentDepth,
                                                        levelPercentage, percentageDecimals);

        
                logDMMessages(string(abi.encodePacked(uintToString(currentDepth),"-Level Reward2 for Sponsor: ", addressToString(_1up_sponsor),
                                        " Subs Amount: ",uintToString(subsAmount),
                                        " Reward: ",uintToString(levelReward),
                                        " Remaining rewards: ",uintToString(remainingAmount)                                       
                                        )));

          

                if (membershipContract.isMember(_1up_sponsor)) {
                    
                    uint256 subsBalance= membershipContract.getSubscribedBalance(_1up_sponsor);
                    
                    if(subsBalance>0){
                       uint256 pendingReward=( subsBalance*
                                                deamMetaverseConfigContract.maxRewardsMultiplier())
                                                -membershipContract.getRewardsReceived(_1up_sponsor);

                        if (pendingReward < levelReward) {
                            levelReward = pendingReward;
                        }
                    }else{
                        levelReward =0;
                    }

                  
                    logDMMessages(string(abi.encodePacked(uintToString(currentDepth),
                    "-Level Reward3 for Sponsor: ", addressToString(_1up_sponsor),
                    " Subs Amount: ",uintToString(subsAmount),
                    " Reward: ",uintToString(levelReward),
                    " Remaining rewards: ",uintToString(remainingAmount)                                       
                    )));
                }                                                        

                remainingAmount = depositRewards(levelReward,_1up_sponsor,remainingAmount, memberAddress,currentDepth);

                logDMMessages(string(abi.encodePacked(uintToString(currentDepth),"-Level Reward for Sponsor: ", addressToString(_1up_sponsor),
                                        " Subs Amount: ",uintToString(subsAmount),
                                        " Reward: ",uintToString(levelReward),
                                        " Remaining rewards: ",uintToString(remainingAmount)                                       
                                        )));

                //Get the next level sponsor
                _1up_sponsor=membershipContract.getReferrer(_1up_sponsor);

                //Exit the loop if the next level sponsor is not available
                if(_1up_sponsor == address(0))
                {
                    logDMMessages(string(abi.encodePacked("Reward Looping stopped at level: ",uintToString(currentDepth),
                                                            " Next Level sponsor: ", addressToString(_1up_sponsor),                                        
                                                             " Remaining rewards: ",uintToString(remainingAmount),
                                                           " Max rewards allowed: ",uintToString(maxRewardAmount)                                       
                                        )));
                    return remainingAmount;
                }
            }
                             

        }// End of for loop


        return remainingAmount;
    }
    
    function calculateLevelRewards(uint256 amount,uint8 depth,
                                    uint256[7] memory levelPercentage,uint256 percentageDecimals ) 
                                                            pure internal returns (uint256 levelReward) {

        if (depth == 1) {
            // 1st referrer (50% bonus)
            levelReward =(amount * levelPercentage[0]) /(100 * percentageDecimals);
        } else if (depth == 2) {
            // 2nd referrer (10% bonus)
            levelReward =(amount * levelPercentage[1]) /(100 * percentageDecimals);
        } else if (depth == 3) {
            // 3rd referrer (3% bonus)
            levelReward =(amount * levelPercentage[2]) /(100 * percentageDecimals);
        } else if (depth == 4) {
            // 4th referrer (2% bonus)
            levelReward =(amount * levelPercentage[3]) /(100 * percentageDecimals);
        } else if (depth >= 5 && depth <= 7) {
            // 5th and 7th referrers (1% bonus)
            levelReward =(amount * levelPercentage[4]) /(100 * percentageDecimals);
        } else if (depth >= 8 && depth <= 11) {
            // 8th to 11th referrers (0.5% bonus)
            levelReward =(amount * levelPercentage[5]) /(100 * percentageDecimals);
        } else if (depth >= 12 && depth <= 15) {
            // 12th to 15th referrers (0.25% bonus)
            levelReward =(amount * levelPercentage[6]) /(100 * percentageDecimals);
        }else{
            levelReward=0;
        }

        return levelReward;
    }

    function depositRewards(uint256 referralReward, address referrer,
                             uint remainingAmount, address memberAddress, uint8 level ) internal returns (uint256) {
        dmTokenContract.mint(referrer, referralReward);
        membershipContract.addReceivedReward(referrer, referralReward);
        remainingAmount -= referralReward;

        dmTransactions.updateRewardsTxn(referrer,level,memberAddress,referralReward);

        return remainingAmount;
        
    }

    function topUpSubscriptionForMember(uint256 topupAmount) external {
        require(
            membershipContract.isMember(msg.sender),
            "DMManager: Not a member yet. Need to be a registered member to topup"
        );
        require(
            topupAmount >=
                deamMetaverseConfigContract.minimumTopUpAmountMembers(),
            "DMManager: Minimum TopUp Amount Not met"
        );
        
        require(
           usdtToken.allowance(msg.sender,address(this)) >= topupAmount,
           "DMManager: Insufficient USDT approved by the member wallet"
        );
        require(
            usdtToken.balanceOf(msg.sender) >= topupAmount,
            "DMManager: Insufficient USDT Balance in the member wallet"
        );

        //uint256 allowance =IERC20(usdtToken).allowance(msg.sender,msg.sender);
        //uint256 balance =IERC20(usdtToken).balanceOf(msg.sender);
        
        IBEP20(usdtToken).transferFrom(msg.sender, address(this), topupAmount);
        membershipContract.topUpSubscriptionBalance(msg.sender, topupAmount);
        address referrer = membershipContract.getReferrer(msg.sender);
        logDMMessages("Top up completed. Proceed with level rewards");
        distributeRewardsForMembers(topupAmount, referrer,msg.sender);
    }

    function updateMinimumSwapAmount(uint256 _minimumWithdrawalLimit) external {
        minimumWithdrawalLimit = _minimumWithdrawalLimit;
    }

    function updateWithdrawalsAllowedADay(uint256 _withdrawalsAllowedADay)
        external
    {
        withdrawalsAllowedADay = _withdrawalsAllowedADay;
    }


    function recoverStuckTokens(address tokenAddress) public onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to recover.");
        require(token.transfer(owner, balance), "Token transfer failed.");
    }

    function withdrawNativeCurrency(address payable _to, uint256 _amount)
        external
        onlyOwner
    {
        payable(_to).transfer(_amount);
    }

    function withdrawUSDTto(address _to, uint256 _amount) external onlyOwner
    {
        IBEP20(usdtToken).transfer(_to,_amount);
    }
}
