// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./Membershipcontract.sol";
import "./DMCPdistributor.sol";
import "./DeamMetaverseConfig.sol";
import "./IBEP20.sol";
import "./DMToken.sol";
import "hardhat/console.sol";
import "./BaseDMContract.sol";

contract DMManager is BaseDMContract {
   
    Membershipcontract public membershipContract;
    DeamMetaverseConfig public deamMetaverseConfigContract;
    DMToken public dmTokenContract;
    DMCPdistributor public dcomdistributor;

    mapping(address => uint256) public lastWithdrawTime;
    mapping(address => uint256) public numberOfWithdrawals;

    uint256 public minimumWithdrawalLimit = 50 * 10**18;
    uint256 public withdrawalsAllowedADay = 1;
    IBEP20 public usdtToken;

    constructor() {
        console.log("DMManager contract initialised");
    }

    function mapContracts(
        address _membershipContractAddress, address _configContractAddress,
        address _dmTokenAddress, address _usdtToken, address _dcpDistAddress,
        address _dmManagerAddress
    ) external onlyOwner {

        console.log("DMManager : Executing Contract Mapping");

        thisContractAddress = _dmManagerAddress;

        membershipContractAddress = _membershipContractAddress;
        configContractAddress = _configContractAddress;
        dmTokenAddress = _dmTokenAddress;
        usdtTokenAddress = _usdtToken;
        dcpDistAddress = _dcpDistAddress;
        dmManagerAddress = _dmManagerAddress;
       

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

        console.log("DMManager : Completed Executing Contract Mapping");
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
    function setUSDTToken(address _usdtToken) internal 
    {   
        require(_usdtToken != address(0), "Invalid address for USDT Token Contract");        
       usdtToken = IBEP20(_usdtToken);                
    }

    function setDMToken(address _dmTokenAddress, address _thisContractAddress)
        internal
    {
        require(
            _dmTokenAddress != address(0),
            "Invalid address for DM Token Contract"
        );
        dmTokenContract = DMToken(_dmTokenAddress);
        dmTokenContract.updateAllowedContract(_thisContractAddress);
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
        dmTokenContract.burn(msg.sender, amountAfterFee);
        lastWithdrawTime[msg.sender] = block.timestamp;

        emit logMessage( string(abi.encodePacked(uintToString(amount),
                                " USDT withdraw processed for memeber ",
                                addressToString(msg.sender)))
                        );
        //numberOfWithdrawals[msg.sender] += 1;
        return true;
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
            //dmTokenContract.balanceOf[deamMetaverseConfigContract.conversionFeeWallet()] += conversionWalletAmount;
            //dmTokenContract.balanceOf[deamMetaverseConfigContract.communityPoolWallet()] += communityPoolWalletAmount;
            dmTokenContract.reduceBalance(msg.sender, feeAmount);
            // dmTokenContract.balanceOf[msg.sender] -= feeAmount;
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

    //Unused function
    /*
    function addAMember(
        address memberAddress,
        uint256 subscriptionAmount,
        address _referrer,
        string memory _email,
        string memory _mobile,
        string memory _name
    ) external {
        require(
            subscriptionAmount >=
                deamMetaverseConfigContract.minimumDepositForMembers(),
            "DMManager: Minimum Deposit amount not met"
        );
        require(
            usdtToken.balanceOf(msg.sender) >= subscriptionAmount,
            "DMManager: Insufficient USDT Balance"
        );
        
        require(
            membershipContract.isSubscriber(memberAddress) == false,
            "DMManager: Already a Subsciber"
        );
        // require(_referrer != address(0),"ERC20: Referrer is Invalid");
        usdtToken.transferFrom(msg.sender, address(this), subscriptionAmount);
        membershipContract.subscribe(
            memberAddress,
            Membershipcontract.UserType.Member,
            subscriptionAmount,
            _referrer,
            0,
            _email,
            _mobile,
            _name
        );
        distributeRewardsForMembers(subscriptionAmount, _referrer);
    }
    */

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

        emit logMessage("Executing Member registration validation ");
        console.log("Executing Member registration validation ");
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
            usdtToken.balanceOf(_usdtSourceAddress) >= subscriptionAmount,
            "DMManager: Insufficient USDT Balance in the registrar wallet"
        );
        require(
           usdtToken.allowance(_usdtSourceAddress,address(this)) >= subscriptionAmount,
           "DMManager: Insufficient USDT approved by the registrar wallet"
        );

        console.log("Member registration validation passed");

        usdtToken.transferFrom(_usdtSourceAddress, address(this), subscriptionAmount);
        console.log("USDT Token Transferred");
        membershipContract.subscribe(
            _memberAddress,
            Membershipcontract.UserType.Member,
            subscriptionAmount,
            _referrer,
            0,
            _email,
            _mobile,
            _name
        );
        distributeRewardsForMembers(subscriptionAmount, _referrer);
    }


    function addPromotor(
        address promoterAddress,            
        string memory _email,
        string memory _mobile,
        string memory _name
    ) external onlyOwner {
        require(promoterAddress != address(0), string(abi.encodePacked("DMManager: Invalid wallet address : ",addressToString(promoterAddress))));
        require(
            membershipContract.isSubscriber(promoterAddress) == false,
           string(abi.encodePacked("DMManager: The requested  member/promoter : ",addressToString(promoterAddress)))
        );
        membershipContract.subscribe(
            promoterAddress,
            Membershipcontract.UserType.Promotor,
            0,//Setting subscription amount as zero for promoters
            owner,
            0,
            _email,
            _mobile,
            _name
        );
    }
   

    function distributeRewardsForMembers(uint256 amount, address referrer)
        internal
    {
        uint256 levelDistributionPart = (deamMetaverseConfigContract
            .levelRewardPercentage() * amount) / 100; //71%
        uint256 amountLeft = distributeLevelRewards(
            referrer,
            levelDistributionPart,
            1,
            levelDistributionPart
        );

        emit logMessage(string(abi.encodePacked("Members - Rewards distributed ", uintToString(levelDistributionPart))));
        if (amountLeft > 0) {
            dmTokenContract.mint(deamMetaverseConfigContract.foundersWallet(),amountLeft);
        }
        allocateAdminWallets(amount);
    }

    function allocateAdminWallets(uint256 amount) internal {
        uint256 communityPoolShare = (amount *
            deamMetaverseConfigContract.communityPoolSharePercent()) / 100;
        uint256 marketingShare = (amount *
            deamMetaverseConfigContract.marketingSharePercent()) / 100;
        uint256 technologyShare = (amount *
            deamMetaverseConfigContract.technologySharePercent()) / 100;
        uint256 foundersShare = (amount *
            deamMetaverseConfigContract.foundersSharePercent()) / 100;
        uint256 transactionPoolShare = (amount *
            deamMetaverseConfigContract.transactionPoolSharePercent()) / 100;

        dmTokenContract.mint(deamMetaverseConfigContract.communityPoolWallet(),communityPoolShare);
        dmTokenContract.mint(deamMetaverseConfigContract.marketingWallet(),marketingShare);
        dmTokenContract.mint(deamMetaverseConfigContract.technologyWallet(),technologyShare);
        dmTokenContract.mint(deamMetaverseConfigContract.foundersWallet(),foundersShare);
        dmTokenContract.mint(deamMetaverseConfigContract.transactionPoolWallet(),transactionPoolShare);

        emit logMessage(string(abi.encodePacked("Admin Share - Rewards distributed ", 
                                        uintToString(communityPoolShare),
                                        uintToString(marketingShare),
                                        uintToString(technologyShare),
                                        uintToString(foundersShare),
                                        uintToString(transactionPoolShare)                                        
                                        )));
    }

    function distributeLevelRewards(
        address referrer,
        uint256 amount,
        uint8 depth,
        uint256 remainingAmount
    ) internal returns (uint256 amountleft) {
        if (depth > 15 || amount == 0 || referrer == address(0)) {
            return remainingAmount;
        }

        uint256 referralBonus;
        uint256 percentageDecimals = dmTokenContract.percentageDecimals();
        uint256[7] memory levelPercentage = deamMetaverseConfigContract
            .getlevelPercentageArray();

        if (depth == 1) {
            // 1st referrer (50% bonus)
            referralBonus =
                (amount * levelPercentage[0]) /
                (100 * percentageDecimals);
        } else if (depth == 2) {
            // 2nd referrer (10% bonus)
            referralBonus =
                (amount * levelPercentage[1]) /
                (100 * percentageDecimals);
        } else if (depth == 3) {
            // 3rd referrer (3% bonus)
            referralBonus =
                (amount * levelPercentage[2]) /
                (100 * percentageDecimals);
        } else if (depth == 4) {
            // 4th referrer (2% bonus)
            referralBonus =
                (amount * levelPercentage[3]) /
                (100 * percentageDecimals);
        } else if (depth >= 5 && depth <= 7) {
            // 5th and 7th referrers (1% bonus)
            referralBonus =
                (amount * levelPercentage[4]) /
                (100 * percentageDecimals);
        } else if (depth >= 8 && depth <= 11) {
            // 8th to 11th referrers (0.5% bonus)
            referralBonus =
                (amount * levelPercentage[5]) /
                (100 * percentageDecimals);
        } else if (depth >= 12 && depth <= 15) {
            // 12th to 15th referrers (0.25% bonus)
            referralBonus =
                (amount * levelPercentage[6]) /
                (100 * percentageDecimals);
        }
        Membershipcontract.UserType usertype = membershipContract.getUserType(
            referrer
        );
        if (usertype == Membershipcontract.UserType.Member) {
            uint256 pendingReward = membershipContract.getPendingReward(
                referrer,
                deamMetaverseConfigContract.maxRewardsMultiplier()
            );
            if (pendingReward > 0) {
                if (pendingReward < referralBonus) {
                    referralBonus = pendingReward;
                }
                remainingAmount = depositBonus(
                    referralBonus,
                    referrer,
                    remainingAmount
                );
            }
        } else {
            remainingAmount = depositBonus(
                referralBonus,
                referrer,
                remainingAmount
            );
        }

        depth += 1;
        address referrer_ = membershipContract.getReferrer(referrer);
        // Continue recursively to the next referrer
        remainingAmount = distributeLevelRewards(
            referrer_,
            amount,
            depth,
            remainingAmount
        );
        return remainingAmount;
    }

    function depositBonus(
        uint256 referralBonus,
        address referrer,
        uint256 remainingAmount
    ) internal returns (uint256) {
        dmTokenContract.mint(referrer, referralBonus);
        membershipContract.addReceivedReward(referrer, referralBonus);
        remainingAmount -= referralBonus;
        return remainingAmount;
    }

    function topUpSubscriptionForMember(uint256 topupAmount) external {
        require(
            membershipContract.isMember(msg.sender) == true,
            "DMManager: Not a member yet. Need to be a registered member to topup"
        );
        require(
            topupAmount >=
                deamMetaverseConfigContract.minimumTopUpAmountMembers(),
            "DMManager: Minimum TopUp Amount Not met"
        );
        
        //uint256 allowance =IERC20(usdtToken).allowance(msg.sender,msg.sender);
        //uint256 balance =IERC20(usdtToken).balanceOf(msg.sender);
        
        IBEP20(usdtToken).transferFrom(msg.sender, address(this), topupAmount);
        membershipContract.topUpSubscriptionBalance(msg.sender, topupAmount);
        address referrer = membershipContract.getReferrer(msg.sender);
        distributeRewardsForMembers(topupAmount, referrer);
    }

    function updateMinimumSwapAmount(uint256 _minimumWithdrawalLimit) external {
        minimumWithdrawalLimit = _minimumWithdrawalLimit;
    }

    function updateWithdrawalsAllowedADay(uint256 _withdrawalsAllowedADay)
        external
    {
        withdrawalsAllowedADay = _withdrawalsAllowedADay;
    }

    function getContractBalance()
        view external returns(uint256[] memory balanceArr)
    {

        require(usdtTokenAddress != address(0),"DMManager: USDT Contract is null");
        require(dmTokenAddress != address(0),"DMManager: DMTK Contract is null");

        balanceArr= new uint256[](2);
        balanceArr[0] = usdtToken.balanceOf(address(this));
        balanceArr[1] = dmTokenContract.balanceOf(address(this));        

        return  balanceArr;
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
