// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./SubscriptionContract.sol";
import "./IERC20.sol";

contract DeamMetaverse is IERC20 {
    string public name = "DEAM Metaverse";
    string public symbol = "DMTK";
    uint8 public decimals = 18;
    uint256 public _totalSupply;
    SubscriptionContract public subscriptionContract;
    IERC20 public usdtToken;

    mapping(address => uint256) override public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public lastWithdrawTime;
    mapping(address => uint256) public numberOfWithdrawals;
    
    address public owner;

    address public communityPoolWallet;
    address public marketingWallet;
    address public technologyWallet;
    address public transactionPoolWallet;
    address public foundersWallet;
    address public conversionFeeWallet;
    uint256 public conversionFeeMember = 100000;
    uint256 public maxRewardsMultiplier = 3;
    uint256 public lastCommunityDistributionTime = block.timestamp;
    uint256 public communityDistributionFrequencyInDays = 30 seconds;
    uint256 public totalCommunityDistribution = 0;
    uint256 public transactionFee_communityPoolFeePercentage = 30000;
    uint256 public transactionFee_foundersFeePercentage = 20000;
    uint256 public minimumDepositForMembers = 100 * 10 ** 18;
    uint256 public minimumTopUpAmountMembers = 100 * 10 ** 18;
    uint256 public communityPoolBalanceWhileCommunityDistribution=0;
    uint256 public startIndexOfNextBatch;
    uint256 public minimumWithdrawalLimit = 50 *10 ** 18;
    uint256 public withdrawalsAllowedADay = 1;
    uint256 public initialSupply =0;
    uint256 public percentageDecimals=10000;
    uint256 public levelRewardPercentage =71; //71%
    uint256 public communityPoolSharePercent = 10; // 10.0%
    uint256 public marketingSharePercent = 10; // 10.0%
    uint256 public technologySharePercent = 3; // 3.0%
    uint256 public foundersSharePercent = 3; // 3.0%
    uint256 public transactionPoolSharePercent = 3; // 3.0%
    uint256[7] levelPercentage = [500000,100000,30000,20000,10000,5000,2500];

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor(
        address _subscriptionContractAddress,
        address _communityPoolWallet,
        address _marketingWallet,
        address _technologyWallet,
        address _transactionPoolWallet,
        address _foundersWallet,
        address _usdtToken,
        address _conversionFeeWallet
    ) {
        
        _totalSupply = initialSupply * 10**uint256(decimals);
        balanceOf[msg.sender] = _totalSupply;
        owner = msg.sender;
        subscriptionContract = SubscriptionContract(_subscriptionContractAddress);
        communityPoolWallet = _communityPoolWallet;
        marketingWallet = _marketingWallet;
        technologyWallet = _technologyWallet;
        transactionPoolWallet = _transactionPoolWallet;
        foundersWallet = _foundersWallet;
        conversionFeeWallet = _conversionFeeWallet;
        usdtToken = IERC20(_usdtToken);
        emit Transfer(address(0), owner, _totalSupply);
    }

     function totalSupply() external view override  returns (uint256) {
        return _totalSupply;
    }

    function _transfer(address sender, address receiver, uint256 amount) internal {
        balanceOf[receiver] += amount;
        balanceOf[sender] -= amount;
        emit Transfer(sender, receiver, amount);
    }

    function deductTransferFee(address from , uint256 amount) internal  returns (uint256) {
        uint256 communityPoolFee = ((amount * transactionFee_communityPoolFeePercentage) / (100*percentageDecimals));
        uint256 foundersFee = (amount * transactionFee_foundersFeePercentage) / (100*percentageDecimals);
        _transfer(from, communityPoolWallet, communityPoolFee);
        _transfer(from, foundersWallet, foundersFee);
        return (amount-communityPoolFee-foundersFee);
    }

    function transfer(address to, uint256 amount) public override returns (bool success) {
        require(to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        uint256 deduction = 0;
        balanceOf[msg.sender] -= amount;
        if (subscriptionContract.isSubscriber(msg.sender)) {
            deduction = deductTransferFee(msg.sender, amount);
        }
        _transfer(msg.sender, to, amount - deduction);
        return true;
    }

    function approve(address spender, uint256 value) public override returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) override public returns (bool success) {
        require(to != address(0), "Invalid address");
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        uint256 deduction = 0;
        if (subscriptionContract.isSubscriber(msg.sender)) {
            deduction = deductTransferFee(from,amount);
        }
        _transfer(from, to, amount-deduction);
        allowance[from][msg.sender] -= amount;
        return true;
    }

    function burn(address from, uint256 value) internal {
        require(balanceOf[from] >= value, "Insufficient balance");
        balanceOf[from] -= value;
        _totalSupply -= value;
        emit Transfer(from, address(0), value);
    }

    function mint(address to, uint256 value) internal {
        balanceOf[to] += value;
        _totalSupply += value;
        emit Transfer(address(0), to, value);
    }

    function updateAdminWalletAddresses(
        address _communityPoolWallet,
        address _marketingWallet,
        address _technologyWallet,
        address _transactionPoolWallet,
        address _foundersWallet,
        address _conversionFeeWallet
    ) external onlyOwner {
        communityPoolWallet = _communityPoolWallet;
        marketingWallet = _marketingWallet;
        technologyWallet = _technologyWallet;
        transactionPoolWallet = _transactionPoolWallet;
        foundersWallet = _foundersWallet;
        conversionFeeWallet = _conversionFeeWallet;
    }

    function setTransactionFees(
        uint256 _communityPoolFeePercentage,
        uint256 _foundersFeePercentage
    ) external onlyOwner {
        transactionFee_communityPoolFeePercentage = _communityPoolFeePercentage;
        transactionFee_foundersFeePercentage = _foundersFeePercentage;
    }

    function swapToDMTK(uint256 amount) external returns (bool) {
        require(amount > 0, "ERC20: Amount must be greater than zero");
        usdtToken.transferFrom(msg.sender, address(this), amount);
        mint(msg.sender, amount);
        return true;
    }

    function withdraw(uint256 amount) external returns (bool) {
        require(amount > 0, "ERC20: Amount must be greater than zero");
        require(balanceOf[msg.sender] >= amount, "ERC20: Insufficient balance");
        require(block.timestamp > lastWithdrawTime[msg.sender] + 1 days, "");
        require(amount >= minimumWithdrawalLimit, "Minimum Withdrawal not met");
        require(numberOfWithdrawals[msg.sender] <= withdrawalsAllowedADay, "Withdrawals For the Day Exceeded");
        uint256 amountAfterFee = deductConversionFee(amount);
        usdtToken.transfer(msg.sender, amountAfterFee);
        burn(msg.sender, amountAfterFee);
        lastWithdrawTime[msg.sender] = block.timestamp;
        numberOfWithdrawals[msg.sender] +=1; 
        return true;
    }

    function deductConversionFee(uint256 amount) internal returns (uint256) {
        uint256 feeAmount = (amount * conversionFeeMember) / (100*percentageDecimals);
        if (feeAmount > 0) {
            uint256 conversionWalletAmount = (feeAmount * 70) / 100;
            uint256 communityPoolWalletAmount = (feeAmount * 30) / 100;
            balanceOf[conversionFeeWallet] += conversionWalletAmount;
            balanceOf[communityPoolWallet] += communityPoolWalletAmount;
            balanceOf[msg.sender] -= feeAmount;
            emit Transfer(msg.sender, conversionFeeWallet, conversionWalletAmount);
            emit Transfer(msg.sender, communityPoolWallet, communityPoolWalletAmount);
        }
        return amount - feeAmount;
    }

    function setConversionFee_member(uint256 newFee) external onlyOwner {
        require(newFee <= (100*percentageDecimals), "Conversion fee percentage cannot exceed 100");
        conversionFeeMember = newFee;
    }

     function addAMember(address memberAddress, uint256 subscriptionAmount, address _referrer, string memory _email, string memory  _mobile,string memory _name)
        external
    {   
        require(usdtToken.balanceOf(msg.sender) >= subscriptionAmount,"ERC20: Insufficient Balance");
        require(subscriptionAmount >= minimumDepositForMembers,"Minimum Deposit amount not met");
        require(subscriptionContract.isSubscriber(memberAddress) == false,"ERC20: Already a Subsciber");
        // require(_referrer != address(0),"ERC20: Referrer is Invalid");
        usdtToken.transferFrom(msg.sender,address(this),subscriptionAmount);
        subscriptionContract.subscribe(memberAddress, SubscriptionContract.UserType.Member, subscriptionAmount, _referrer,0,_email,_mobile,_name);
        distributeRewardsForMembers(subscriptionAmount,_referrer);
    }

    function subscribeAsMember(uint256 subscriptionAmount, address _referrer, string memory _email, string memory  _mobile,string memory _name)
        external
    {   
        require(usdtToken.balanceOf(msg.sender) >= subscriptionAmount,"ERC20: Insufficient Balance");
        require(subscriptionAmount >= minimumDepositForMembers,"Minimum Deposit amount not met");
        require(subscriptionContract.isSubscriber(msg.sender) == false,"ERC20: Already a Subsciber");
        // require(_referrer != address(0),"ERC20: Referrer is Invalid");
        usdtToken.transferFrom(msg.sender,address(this),subscriptionAmount);
        subscriptionContract.subscribe(msg.sender, SubscriptionContract.UserType.Member, subscriptionAmount, _referrer,0,_email,_mobile,_name);
        distributeRewardsForMembers(subscriptionAmount,_referrer);
    }

    function addAMemberFree(address memberAddress, uint256 subscriptionAmount, address _referrer, string memory _email, string memory  _mobile,string memory _name)
        external onlyOwner
    {   
        require(subscriptionContract.isSubscriber(memberAddress) == false,"ERC20: Already a Subsciber");
        subscriptionContract.subscribe(memberAddress, SubscriptionContract.UserType.Member, subscriptionAmount, _referrer,0,_email,_mobile,_name);
    }

    function distributeRewardsForMembers(uint256 amount,address referrer) internal {
        uint256 levelDistributionPart = (levelRewardPercentage * amount) / 100; //71%
        uint256 amountLeft = distributeLevelRewards(
            referrer,
            levelDistributionPart,
            1,
            levelDistributionPart
        );
        if (amountLeft > 0) {
            mint(foundersWallet,amountLeft);
        }
        allocateAdminWallets(amount);
    }

    function allocateAdminWallets(uint256 amount) internal {
        uint256 communityPoolShare = (amount * communityPoolSharePercent) / 100; 
        uint256 marketingShare = (amount * marketingSharePercent) / 100;
        uint256 technologyShare = (amount * technologySharePercent) / 100; 
        uint256 foundersShare = (amount * foundersSharePercent) / 100; 
        uint256 transactionPoolShare = (amount * transactionPoolSharePercent) / 100; 
        mint(communityPoolWallet,communityPoolShare);
        mint(marketingWallet,marketingShare);
        mint(technologyWallet,technologyShare);
        mint(foundersWallet,foundersShare);
        mint(transactionPoolWallet,transactionPoolShare);
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

        if (depth == 1) {
            // 1st referrer (50% bonus)
            referralBonus = (amount * levelPercentage[0]) / (100*percentageDecimals);
        } else if (depth == 2) {
            // 2nd referrer (10% bonus)
            referralBonus = (amount * levelPercentage[1]) / (100*percentageDecimals);
        } else if (depth == 3) {
            // 3rd referrer (3% bonus)
            referralBonus = (amount * levelPercentage[2]) / (100*percentageDecimals);
        } else if (depth == 4) {
            // 4th referrer (2% bonus)
            referralBonus = (amount * levelPercentage[3]) / (100*percentageDecimals);
        } else if (depth >= 5 && depth <=7) {
            // 5th and 7th referrers (1% bonus)
            referralBonus = (amount * levelPercentage[4]) / (100*percentageDecimals);
        } else if (depth >= 8 && depth <= 11) {
            // 8th to 11th referrers (0.5% bonus)
            referralBonus = (amount * levelPercentage[5]) / (100*percentageDecimals);
        } else if (depth >= 12 && depth <= 15) {
            // 12th to 15th referrers (0.25% bonus)
            referralBonus = (amount * levelPercentage[6]) / (100*percentageDecimals);
        }
        SubscriptionContract.UserType usertype = subscriptionContract.getUserType(referrer);
        if (usertype == SubscriptionContract.UserType.Member) {
            uint256 pendingReward = subscriptionContract.getPendingReward(referrer,maxRewardsMultiplier);
            if (pendingReward>0) {
                if(pendingReward<referralBonus){
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
        address referrer_ = subscriptionContract.getReferrer(referrer);
        // Continue recursively to the next referrer
       remainingAmount = distributeLevelRewards(referrer_, amount, depth, remainingAmount);
        return remainingAmount;
    }

     function depositBonus(
        uint256 referralBonus,
        address referrer,
        uint256 remainingAmount
    ) internal returns (uint256) {
        mint(referrer,referralBonus);
        subscriptionContract.addReceivedReward(referrer,referralBonus);
        remainingAmount -= referralBonus;
        return remainingAmount;
    }


    function topUpSubscriptionForMember(uint256 topupAmount) external {
        require(subscriptionContract.isMember(msg.sender)==true, "ERC20: Not a member");
        require(topupAmount >= minimumTopUpAmountMembers, "ERC20: Minimum TopUp Amount Not");
        IERC20(usdtToken).transferFrom(msg.sender,address(this),topupAmount);
        subscriptionContract.topUpSubscriptionBalance(msg.sender, topupAmount);
        address referrer = subscriptionContract.getReferrer(msg.sender);
        distributeRewardsForMembers(topupAmount,referrer);
    }

function DistributeCommunityPool(uint256 _startIndex, uint256 batchSize) external onlyOwner returns (uint256){
    address[] memory memberAddressList =  subscriptionContract.getMemberAddresses();
    require(block.timestamp >lastCommunityDistributionTime + communityDistributionFrequencyInDays, "Community Distribution Frequency Not Met");
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
        communityPoolBalanceWhileCommunityDistribution = balanceOf[communityPoolWallet];
    }
    require(communityPoolBalanceWhileCommunityDistribution > 0, "No balance in the transaction pool");
    uint256 pendingReward;
    uint256 share;

    for (uint256 i = _startIndex; i <= endIndex; i++) {
            pendingReward = subscriptionContract.getPendingReward(memberAddressList[i],maxRewardsMultiplier);
            if (pendingReward > 0) {
                share = subscriptionContract.calculateShare(memberAddressList[i], communityPoolBalanceWhileCommunityDistribution);
                if (pendingReward < share) {
                    share = pendingReward;
                }
                _transfer(communityPoolWallet, memberAddressList[i], share);
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


    function setCommunityDistributionFrequencyInDays(
        uint256 _communityDistributionFrequencyInDays
    ) external {
        communityDistributionFrequencyInDays =
            _communityDistributionFrequencyInDays *
            1 days;
    }

    function updateMinimumDepositMembers(
        uint256 _minmumDeposit
    ) external {
        minimumDepositForMembers = _minmumDeposit;
    }

      function updateMinimumTopUpAmountMembers(
        uint256 _minimumTopUpAmountMembers
    ) external {
        minimumTopUpAmountMembers = _minimumTopUpAmountMembers;
    }

    function updateMinimumSwapAmount(
        uint256 _minimumWithdrawalLimit
    ) external {
        minimumWithdrawalLimit = _minimumWithdrawalLimit;
    }

     function updateWithdrawalsAllowedADay(
        uint256 _withdrawalsAllowedADay
    ) external {
        withdrawalsAllowedADay = _withdrawalsAllowedADay;
    }

    function updateLevelPercentageWithDecimals(
        uint256[7] memory _levelPercentage
    ) external {
         uint256 sum = 0;
        for (uint8 i = 0; i < 7; i++) {
            sum += _levelPercentage[i];
        }
        require((sum/percentageDecimals)==levelRewardPercentage,"Sum should be match to levelRewardPercentage");
        levelPercentage = _levelPercentage;
    }

    function setAdminWalletShares(
        uint256 _communityPoolSharePercent,
        uint256 _marketingSharePercent,
        uint256  _technologySharePercent,
        uint256  _foundersSharePercent,
        uint256  _transactionPoolSharePercent
        ) external {
            require(_communityPoolSharePercent+_marketingSharePercent+_technologySharePercent+_foundersSharePercent+_transactionPoolSharePercent== 100-levelRewardPercentage,
            "Sum should be exactly 100-levelRewardPercentage");
            communityPoolSharePercent= _communityPoolSharePercent;
            marketingSharePercent=_marketingSharePercent;
            technologySharePercent=_technologySharePercent;
            foundersSharePercent=_foundersSharePercent;
            transactionPoolSharePercent=_transactionPoolSharePercent;
        }

    function recoverStuckTokens(address tokenAddress) public onlyOwner{
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to recover.");
        require(token.transfer(owner, balance), "Token transfer failed.");
    }

    function withdrawNativeCurrency(address payable _to,uint256 _amount) external onlyOwner {
        payable(_to).transfer(_amount);
    }

}
