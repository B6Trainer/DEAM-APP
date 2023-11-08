// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;


contract DeamMetaverseConfig {

    address public owner;    
    mapping(address => address) private allowedContracts;

    address public communityPoolWallet;
    address public marketingWallet;
    address public technologyWallet;
    address public transactionPoolWallet;
    address public foundersWallet;
    address public conversionFeeWallet;
    uint256 public conversionFeeMember = 100000;
    uint256 public maxRewardsMultiplier = 3;
    uint256 public transactionFee_communityPoolFeePercentage = 30000;
    uint256 public transactionFee_foundersFeePercentage = 20000;
    uint256 public minimumDepositForMembers = 100 * 10 ** 18;
    uint256 public minimumTopUpAmountMembers = 100 * 10 ** 18;
    

    uint256 public percentageDecimals=10000;
    uint256 public levelRewardPercentage =71; //71%
    uint256 public communityPoolSharePercent = 10; // 10.0%
    uint256 public marketingSharePercent = 10; // 10.0%
    uint256 public technologySharePercent = 3; // 3.0%
    uint256 public foundersSharePercent = 3; // 3.0%
    uint256 public transactionPoolSharePercent = 3; // 3.0%
    uint256[7] public levelPercentage = [500000,100000,30000,20000,10000,5000,2500];


    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier onlyAllowedContract() {
        require(allowedContracts[msg.sender] != address(0), "Only the authorized contracts can call this function");
        _;
    }


    function updateAllowedContract(address _allowedContract) external onlyOwner{
        allowedContracts[_allowedContract]=_allowedContract;
    }

    constructor() {
      owner = msg.sender;
      allowedContracts[owner]=owner;
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


    function updateLevelPercentageWithDecimals(uint256[7] memory _levelPercentage) external onlyOwner{
         uint256 sum = 0;
        for (uint8 i = 0; i < 7; i++) {
            sum += _levelPercentage[i];
        }
        require((sum/percentageDecimals)==levelRewardPercentage,"Sum should be match to levelRewardPercentage");
        levelPercentage = _levelPercentage;
    }

    
    function getlevelPercentageArray() external view onlyAllowedContract returns  (uint256[7] memory) {
        return levelPercentage;
    }

    function updateMinimumDepositMembers(
        uint256 _minmumDeposit
    ) external onlyOwner{
        minimumDepositForMembers = _minmumDeposit;
    }

      function updateMinimumTopUpAmountMembers(
        uint256 _minimumTopUpAmountMembers
    ) external onlyOwner {
        minimumTopUpAmountMembers = _minimumTopUpAmountMembers;
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

    function setConversionFee_member(uint256 newFee) external onlyOwner {
        require(newFee <= (100*percentageDecimals), "Conversion fee percentage cannot exceed 100");
        conversionFeeMember = newFee;
    }

    function setTransactionFees(
        uint256 _communityPoolFeePercentage,
        uint256 _foundersFeePercentage
    ) external onlyOwner {
        transactionFee_communityPoolFeePercentage = _communityPoolFeePercentage;
        transactionFee_foundersFeePercentage = _foundersFeePercentage;
    }
}