// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./Membershipcontract.sol";
import "./DeamMetaverseConfig.sol";
import "./IERC20.sol";

contract DMToken is IERC20 {
    string public name = "DEAM Metaverse";
    string public symbol = "DMTK";
    uint8 public decimals = 18;
    uint256 public _totalSupply;
    Membershipcontract public subscriptionContract;
    DeamMetaverseConfig public deamMetaverseConfigContract;
    IERC20 public usdtToken;

    mapping(address => uint256) override public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public lastWithdrawTime;
    mapping(address => uint256) public numberOfWithdrawals;
    
    address public owner;
    mapping(address => address) private allowedContracts;

    //uint256 public conversionFeeMember = 100000;

    uint256 public lastCommunityDistributionTime = block.timestamp;
    uint256 public communityDistributionFrequencyInDays = 30 seconds;
    uint256 public totalCommunityDistribution = 0;
    uint256 public transactionFee_communityPoolFeePercentage = 30000;
    uint256 public transactionFee_foundersFeePercentage = 20000;

    uint256 public communityPoolBalanceWhileCommunityDistribution=0;
    uint256 public startIndexOfNextBatch;
    uint256 public minimumWithdrawalLimit = 50 *10 ** 18;
    uint256 public withdrawalsAllowedADay = 1;
    uint256 public initialSupply =0;
    uint256 public percentageDecimals=10000;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

        modifier onlyAllowedContract() {
        require(allowedContracts[msg.sender] != address(0), "Only the authorized contracts can call this function");
        _;
    }


    function updateAllowedContract(address _allowedContract)
    external
    onlyOwner
    {
        allowedContracts[_allowedContract]=_allowedContract;
    }

    constructor(
        address _subscriptionContractAddress,
        address _configContractAddress,
        address _usdtToken
    ) {        
        _totalSupply = initialSupply * 10**uint256(decimals);
        balanceOf[msg.sender] = _totalSupply;
        owner = msg.sender;
        subscriptionContract = Membershipcontract(_subscriptionContractAddress);
        deamMetaverseConfigContract = DeamMetaverseConfig(_configContractAddress);
        usdtToken = IERC20(_usdtToken);
        emit Transfer(address(0), owner, _totalSupply);
    }

     function totalSupply() external view override  returns (uint256) {
        return _totalSupply;
    }

    function transfer(address sender, address receiver, uint256 amount) external onlyAllowedContract  {
        _transfer(sender, receiver, amount);
    }

    function _transfer(address sender, address receiver, uint256 amount) internal  {
        balanceOf[receiver] += amount;
        balanceOf[sender] -= amount;
        emit Transfer(sender, receiver, amount);
    }

    function getBalance(address account) public view returns (uint256) {
         return balanceOf[account];
    }

    function addBalance(address account, uint256 amount) external onlyAllowedContract  {
         
         balanceOf[account] += amount;
    }

    function reduceBalance(address account, uint256 amount) external onlyAllowedContract  {
         
         balanceOf[account] -= amount;
    }



    function deductTransferFee(address from , uint256 amount) internal  returns (uint256) {
        uint256 communityPoolFee = ((amount * transactionFee_communityPoolFeePercentage) / (100*percentageDecimals));
        uint256 foundersFee = (amount * transactionFee_foundersFeePercentage) / (100*percentageDecimals);
        address comPoolWalletAddress=deamMetaverseConfigContract.communityPoolWallet();
        address founderWalletPoolAddress=deamMetaverseConfigContract.communityPoolWallet();
        _transfer(from, comPoolWalletAddress, communityPoolFee);
        _transfer(from, founderWalletPoolAddress, foundersFee);
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

    function burn(address from, uint256 value) public onlyAllowedContract  {
        require(balanceOf[from] >= value, "Insufficient balance");
        balanceOf[from] -= value;
        _totalSupply -= value;
        emit Transfer(from, address(0), value);
    }

    function mint(address to, uint256 value) public onlyAllowedContract  {
        balanceOf[to] += value;
        _totalSupply += value;
        emit Transfer(address(0), to, value);
    }

 
    function swapToDMTK(uint256 amount) external returns (bool) {
        require(amount > 0, "ERC20: Amount must be greater than zero");
        usdtToken.transferFrom(msg.sender, address(this), amount);
        mint(msg.sender, amount);
        return true;
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
        uint256[7] memory levelPercentage = deamMetaverseConfigContract.getlevelPercentageArray();

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
        Membershipcontract.UserType usertype = subscriptionContract.getUserType(referrer);
        if (usertype == Membershipcontract.UserType.Member) {
            uint256 pendingReward = subscriptionContract.getPendingReward(referrer,deamMetaverseConfigContract.maxRewardsMultiplier());
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
        communityPoolBalanceWhileCommunityDistribution = balanceOf[deamMetaverseConfigContract.communityPoolWallet()];
    }
    require(communityPoolBalanceWhileCommunityDistribution > 0, "No balance in the transaction pool");
    uint256 pendingReward;
    uint256 share;

    for (uint256 i = _startIndex; i <= endIndex; i++) {
            pendingReward = subscriptionContract.getPendingReward(memberAddressList[i],deamMetaverseConfigContract.maxRewardsMultiplier());
            if (pendingReward > 0) {
                share = subscriptionContract.calculateShare(memberAddressList[i], communityPoolBalanceWhileCommunityDistribution);
                if (pendingReward < share) {
                    share = pendingReward;
                }
                _transfer(deamMetaverseConfigContract.communityPoolWallet(), memberAddressList[i], share);
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
