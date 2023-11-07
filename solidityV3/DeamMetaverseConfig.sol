// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./SubscriptionContract.sol";
import "./IERC20.sol";

contract DeamConfig {

    address public owner;
    address[] public allowedContract;

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
    uint256[7] levelPercentage = [500000,100000,30000,20000,10000,5000,2500];




}