// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./Membershipcontract.sol";
import "./DMCPdistributor.sol";
import "./DeamMetaverseConfig.sol";
import "./IERC20.sol";
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
    IERC20 public usdtToken;

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
       usdtToken = IERC20(_usdtToken);                
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
        require(amount > 0, "ERC20: Amount must be greater than zero");
        uint256 tokenamount = dmTokenContract.getBalance(msg.sender);
        require(tokenamount >= amount, "ERC20: Insufficient balance");
        require(block.timestamp > lastWithdrawTime[msg.sender] + 1 days, "");
        require(amount >= minimumWithdrawalLimit, "Minimum Withdrawal not met");
        require(
            numberOfWithdrawals[msg.sender] <= withdrawalsAllowedADay,
            "Withdrawals For the Day Exceeded"
        );
        uint256 amountAfterFee = deductConversionFee(amount,msg.sender);
        usdtToken.transfer(msg.sender, amountAfterFee);
        dmTokenContract.burn(msg.sender, amountAfterFee);
        lastWithdrawTime[msg.sender] = block.timestamp;
        numberOfWithdrawals[msg.sender] += 1;
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

    event logMessage(string message);

    function SelfRegistrationasMember(
        uint256 subscriptionAmount,
        address _referrer

    ) external {

        require(
            usdtToken.balanceOf(msg.sender) >= subscriptionAmount,
            "DMManager: Insufficient USDT Balance in the user wallet"
        );
        registerMember(msg.sender,subscriptionAmount, _referrer, "NA", "NA", "NA");
        
    }

    function registerForAMember(
        address _memberAddress,
        uint256 subscriptionAmount,
        address _referrer,
        string memory _email,
        string memory _mobile,
        string memory _name
    ) external {

        require(
            usdtToken.balanceOf(_referrer) >= subscriptionAmount,
            "DMManager: Insufficient USDT Balance in the sponsor wallet"
        );
        registerMember(_memberAddress,subscriptionAmount, _referrer, _email, _mobile, _name);
        
    }

    function registerMember(
        address _memberAddress,
        uint256 subscriptionAmount,
        address _referrer,
        string memory _email,
        string memory _mobile,
        string memory _name
    ) internal {

        emit logMessage("Executing Member registration validation ");
        console.log("Executing Member registration validation ");
        require(
            membershipContract.isSubscriber(_memberAddress) == false,
            "DMManager: User trying to register is already a member, Please top up"
        );

        require(
            subscriptionAmount >=deamMetaverseConfigContract.minimumDepositForMembers(),
            "DMManager: Minimum Deposit amount not met"
        );

        console.log("Member registration validation passed");
        // require(_referrer != address(0),"ERC20: Referrer is Invalid");
        usdtToken.transferFrom(_referrer, address(this), subscriptionAmount);
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
           string(abi.encodePacked("DMManager: Already a member/promoter : ",addressToString(promoterAddress)))
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
        if (amountLeft > 0) {
            dmTokenContract.mint(
                deamMetaverseConfigContract.foundersWallet(),
                amountLeft
            );
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
        dmTokenContract.mint(
            deamMetaverseConfigContract.communityPoolWallet(),
            communityPoolShare
        );
        dmTokenContract.mint(
            deamMetaverseConfigContract.marketingWallet(),
            marketingShare
        );
        dmTokenContract.mint(
            deamMetaverseConfigContract.technologyWallet(),
            technologyShare
        );
        dmTokenContract.mint(
            deamMetaverseConfigContract.foundersWallet(),
            foundersShare
        );
        dmTokenContract.mint(
            deamMetaverseConfigContract.transactionPoolWallet(),
            transactionPoolShare
        );
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
            "DMManager: Not a member yet. Need to be a registerd member to topup"
        );
        require(
            topupAmount >=
                deamMetaverseConfigContract.minimumTopUpAmountMembers(),
            "DMManager: Minimum TopUp Amount Not met"
        );
        console.log("Transfer amount:");
        console.log(topupAmount);
        console.log("Allowance available amount:");
        //uint256 allowance =IERC20(usdtToken).allowance(msg.sender,msg.sender);
        uint256 balance =IERC20(usdtToken).balanceOf(msg.sender);
        console.log(balance);
        //console.log(allowance);

        IERC20(usdtToken).transferFrom(msg.sender, address(this), topupAmount);
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
}
