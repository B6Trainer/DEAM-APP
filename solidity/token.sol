// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./SubscriptionContract.sol";
import "./IERC20.sol";

contract MyToken is IERC20 {
    string public name = "DEAM Metaverse";
    string public symbol = "DMTK";
    uint8 public decimals = 18;
    uint256 public _totalSupply;
    SubscriptionContract public subscriptionContract;
    IERC20 public usdtToken;

    mapping(address => uint256) override public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    address public owner;

    address public communityPoolWallet;
    address public marketingWallet;
    address public technologyWallet;
    address public transactionPoolWallet;
    address public foundersWallet;
    address public conversionFeeWallet;
    uint256 public conversionFeeMember = 10;
    uint256 public conversionFeePromotor = 20;
    uint256 public promotorSubscriptionFee = 120 * 10 ** 18;
    uint256 public maxRewardsMultiplier = 3;
    uint256 lastCommunityDistributionTime = block.timestamp;
    uint256 communityDistributionFrequencyInDays = 30 seconds;
    uint256 totalCommunityDistribution = 0;
    uint256 public transactionFee_communityPoolFeePercentage = 3;
    uint256 public transactionFee_foundersFeePercentage = 2;
    uint256 initialSupply =0;
    uint256 public minimumDepositForMembers = 250 * 10 ** 18;

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

    function deductTransferFee(uint256 amount) public returns (uint256 deduction) {
        uint256 communityPoolFee = ((amount * transactionFee_communityPoolFeePercentage) / 100);
        uint256 foundersFee = (amount * transactionFee_foundersFeePercentage) / 100;
        _transfer(msg.sender, communityPoolWallet, communityPoolFee);
        _transfer(msg.sender, foundersWallet, foundersFee);
        return deduction;
    }

    function transfer(address to, uint256 amount) public override returns (bool success) {
        require(to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        uint256 deduction = 0;
        balanceOf[msg.sender] -= amount;
        if (subscriptionContract.isSubscriber(msg.sender)) {
            deduction = deductTransferFee(amount);
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
            deduction = deductTransferFee(amount);
        }
        _transfer(from, to, amount);
        allowance[from][msg.sender] -= amount;
        return true;
    }

    function burn(address from, uint256 value) internal {
        require(balanceOf[from] >= value, "Insufficient balance");
        balanceOf[from] -= value;
        _totalSupply -= value;
        //emit Burn(from, value);
        emit Transfer(from, address(0), value);
    }

    function mint(address to, uint256 value) internal {
        balanceOf[to] += value;
        _totalSupply += value;
        //emit Mint(to, value);
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

    function swapToUSDT(uint256 amount) external returns (bool) {
        require(amount > 0, "ERC20: Amount must be greater than zero");
        require(balanceOf[msg.sender] >= amount, "ERC20: Insufficient balance");
        uint256 amountAfterFee = deductConversionFee(amount);
        usdtToken.transfer(msg.sender, amountAfterFee);
        burn(msg.sender, amountAfterFee);
        return true;
    }

    function deductConversionFee(uint256 amount) internal returns (uint256) {
        uint256 feeAmount = 0;
        SubscriptionContract.UserType userType = subscriptionContract.getUserType(msg.sender);
        if (userType == SubscriptionContract.UserType.Member) {
            feeAmount = (amount * conversionFeeMember) / 100;
        } else if (userType == SubscriptionContract.UserType.Promotor) {
            feeAmount = (amount * conversionFeePromotor) / 100;
        }
        if (feeAmount > 0) {
            uint256 conversionWalletAmount = (feeAmount * 70) / 100;
            uint256 communityPoolWalletAmount = (feeAmount * 30) / 100;
            balanceOf[conversionFeeWallet] += conversionWalletAmount;
            balanceOf[communityPoolWallet] += communityPoolWalletAmount;
            emit Transfer(msg.sender, conversionFeeWallet, conversionWalletAmount);
            emit Transfer(msg.sender, communityPoolWallet, communityPoolWalletAmount);
        }
        return amount - feeAmount;
    }

    function setConversionFee_member(uint256 newFee) external onlyOwner {
        require(newFee <= 100, "Conversion fee percentage cannot exceed 100");
        conversionFeeMember = newFee;
    }

    function setConversionFee_promotor(uint256 newFee) external onlyOwner {
        require(newFee <= 100, "Conversion fee percentage cannot exceed 100");
        conversionFeePromotor = newFee;
    }

     function subscribeAsMember(uint256 subscriptionAmount, address _referrer)
        external
    {   
        require(usdtToken.balanceOf(msg.sender) >= subscriptionAmount,"ERC20: Insufficient Balance");
        require(subscriptionAmount >= minimumDepositForMembers,"Minimum Deposit amount not met");
        require(subscriptionContract.isSubscriber(msg.sender) == false,"ERC20: Already a Subsciber");
        require(_referrer != address(0),"ERC20: Referrer is Invalid");
        usdtToken.transferFrom(msg.sender,address(this),subscriptionAmount);
        subscriptionContract.subscribe(msg.sender, SubscriptionContract.UserType.Member, subscriptionAmount, _referrer,0);
        
        distributeRewardsForMembers(subscriptionAmount,_referrer);
    }

    function distributeRewardsForMembers(uint256 amount,address referrer) internal {
        uint256 levelDistributionPart = (71 * amount) / 100;
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
        uint256 communityPoolShare = (amount * 10) / 100; // 10.0%
        uint256 marketingShare = (amount * 10) / 100; // 10.0%
        uint256 technologyShare = (amount * 3) / 100; // 3.0%
        uint256 foundersShare = (amount * 3) / 100; // 3.0%
        uint256 transactionPoolShare = (amount * 3) / 100; // 3.0%
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
            referralBonus = (amount * 50) / 100;
        } else if (depth == 2) {
            // 2nd referrer (10% bonus)
            referralBonus = (amount * 10) / 100;
        } else if (depth == 3) {
            // 3rd referrer (3% bonus)
            referralBonus = (amount * 3) / 100;
        } else if (depth == 4) {
            // 4th referrer (2% bonus)
            referralBonus = (amount * 2) / 100;
        } else if (depth == 5 || depth == 7) {
            // 5th and 7th referrers (1% bonus)
            referralBonus = (amount * 1) / 100;
        } else if (depth >= 8 && depth <= 11) {
            // 8th to 11th referrers (0.5% bonus)
            referralBonus = (amount * 5) / 1000;
        } else if (depth >= 12 && depth <= 15) {
            // 12th to 15th referrers (0.25% bonus)
            referralBonus = (amount * 25) / 10000;
        }
        SubscriptionContract.UserType usertype = subscriptionContract.getUserType(referrer);
        if (usertype == SubscriptionContract.UserType.Member) {
            uint256 pendingReward = subscriptionContract.getPendingReward(referrer);
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

  function subscribeAsPromotor(address _referrer) external {
        require(IERC20(usdtToken).balanceOf(msg.sender) >= promotorSubscriptionFee,"ERC20: Insufficient Balance");
         require(subscriptionContract.isSubscriber(msg.sender) == false,"ERC20: Already a Subsciber");
        require(_referrer != address(0),"ERC20: Referrer is Invalid");
        uint256 validity = block.timestamp + 365 days;
        IERC20(usdtToken).transferFrom(msg.sender,address(this),promotorSubscriptionFee);
        subscriptionContract.subscribe(msg.sender, SubscriptionContract.UserType.Promotor, promotorSubscriptionFee, _referrer,validity);
        distributeRewardsForPromotors(promotorSubscriptionFee);
    }

    function distributeRewardsForPromotors(uint256 _promotorSubscriptionFee) internal {
        uint256 marketingPoolShare = (50 * _promotorSubscriptionFee) / 100;
        uint256 communityPoolShares = _promotorSubscriptionFee - marketingPoolShare;
        mint(marketingWallet,marketingPoolShare);
        mint(communityPoolWallet,communityPoolShares);
    }

    function topUpSubscriptionForMember(uint256 topupAmount) external {
        require(subscriptionContract.isMember(msg.sender)==true, "ERC20: Not a member");
        IERC20(usdtToken).transferFrom(msg.sender,address(this),topupAmount);
        subscriptionContract.topUpSubscriptionBalance(msg.sender, topupAmount);
        address referrer = subscriptionContract.getReferrer(msg.sender);
        distributeRewardsForMembers(topupAmount,referrer);
    }

    function renewSubscriptionForPromotor() external {
        require(subscriptionContract.isPromotor(msg.sender)==true, "ERC20: Not a Promotor");
        require(block.timestamp > subscriptionContract.getPromotorValidity(msg.sender), "ERC20: Validity Not Expired");
        IERC20(usdtToken).transferFrom(msg.sender,address(this), promotorSubscriptionFee);
        subscriptionContract.topUpSubscriptionBalance(msg.sender, promotorSubscriptionFee);
        distributeRewardsForPromotors(promotorSubscriptionFee);
    }

     function DistributeCommunityPool(uint256 startIndex, uint256 batchSize) external onlyOwner {
        require(block.timestamp >lastCommunityDistributionTime + communityDistributionFrequencyInDays, "Community Distribution Frequency Not Met");
        address[] memory memberAddressList =  subscriptionContract.getMemberAddresses();
        require(memberAddressList.length > 0, "No Members");
        require(startIndex < memberAddressList.length, "Start index out of bounds");
        require(batchSize > 0, "Batch size must be greater than 0");
        uint256 endIndex = startIndex + batchSize;
        if (endIndex > memberAddressList.length) {
            endIndex = memberAddressList.length;
        }

        uint256 totalPoolBalance = balanceOf[transactionPoolWallet];
        require(totalPoolBalance > 0, "No balance in the transaction pool");
        
        for (uint256 i = startIndex; i < endIndex; i++) {
            uint256 pendingReward = subscriptionContract.getPendingReward(memberAddressList[i]);
         if (pendingReward>0) {
            uint256 share = subscriptionContract.calculateShare(memberAddressList[i], totalPoolBalance);
            if(pendingReward < share){
                share = pendingReward;
            }
            _transfer(transactionPoolWallet,memberAddressList[i],share);
            totalCommunityDistribution += share;
            }
        }
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

}
