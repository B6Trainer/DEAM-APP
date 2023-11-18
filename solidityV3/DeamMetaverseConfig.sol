// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
import "hardhat/console.sol";
import "./BaseDMContract.sol";

contract DeamMetaverseConfig is BaseDMContract {


    address public communityPoolWallet=0x9F03df34b0218373eF544b7386a05d8701768240;
    address public marketingWallet=0x2Df4176b7285bf4970900e14C19F628f63fCfFDB;
    address public technologyWallet=0x2e4c722122D9c89102B670dA53c91efb54bE73c7;
    address public transactionPoolWallet=0x0F4c59277c876ee947dFE0d708B6d0E92E9095e6;
    address public foundersWallet=0x9b0a5444E574a4c40870fdabEaDB224da22664F8;
    address public conversionFeeWallet;
    uint256 public conversionFeeMember = 100000;
    uint256 public conversionFeePromoter = 250000;
    uint256 public maxRewardsMultiplier = 3;
    uint256 public transactionFee_communityPoolFeePercentage = 30000;
    uint256 public transactionFee_foundersFeePercentage = 70000;
    uint256 public minimumDepositForMembers = 100 * 10 ** 18;
    uint256 public minimumTopUpAmountMembers = 100 * 10 ** 18;
    
    uint256 public withdrawdailyLimitCheck = 0;
    uint256 public dcpDistributionIntervalCheck = 0;


    uint256 public percentageDecimals=10000;
    uint256 public levelRewardPercentage =71; //71%
    uint256 public communityPoolSharePercent = 10; // 10.0%
    uint256 public marketingSharePercent = 10; // 10.0%
    uint256 public technologySharePercent = 3; // 3.0%
    uint256 public foundersSharePercent = 3; // 3.0%
    uint256 public transactionPoolSharePercent = 3; // 3.0%
    uint256[7] public levelPercentage = [500000,100000,30000,20000,10000,5000,2500];




    constructor(address _founderWallet) {
        foundersWallet=_founderWallet;
        conversionFeeWallet=_founderWallet;
        logDMMessages("DMConfig contract constructed");               
    }

    function updateAdminWalletAddresses(
        address _communityPoolWallet,
        address _marketingWallet,
        address _technologyWallet,
        address _transactionPoolWallet,
        address _foundersWallet,
        address _conversionFeeWallet
    ) external onlyOwner {
        communityPoolWallet = (_communityPoolWallet != address(0))?_communityPoolWallet:communityPoolWallet;
        marketingWallet = (_marketingWallet != address(0))?_marketingWallet:marketingWallet;
        technologyWallet = (_technologyWallet != address(0))?_technologyWallet:technologyWallet;
        transactionPoolWallet = (_transactionPoolWallet != address(0))?_transactionPoolWallet:transactionPoolWallet;
        foundersWallet = (_foundersWallet != address(0))?_foundersWallet:foundersWallet;
        conversionFeeWallet = (_conversionFeeWallet != address(0))?_conversionFeeWallet:conversionFeeWallet;
        console.log("DMConfig: Admin wallets updated.");
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
            require(_communityPoolSharePercent+_marketingSharePercent+_technologySharePercent+
                        _foundersSharePercent+_transactionPoolSharePercent== 100-levelRewardPercentage,
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

    function setConversionFee_Promoter(uint256 newFee) external onlyOwner {
        require(newFee <= (100*percentageDecimals), "Conversion fee percentage cannot exceed 100");
        conversionFeePromoter = newFee;
    }

    function setTransactionFees(
        uint256 _communityPoolFeePercentage,
        uint256 _foundersFeePercentage
    ) external onlyOwner {
        transactionFee_communityPoolFeePercentage = _communityPoolFeePercentage;
        transactionFee_foundersFeePercentage = _foundersFeePercentage;
    }
}