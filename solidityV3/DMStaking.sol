/**
 *Submitted for verification at testnet.ftmscan.com on 2023-07-29
*/

// SPDX-License-Identifier: MIT
//disable and enable staking impolemntaion

pragma solidity 0.8.0;
interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract StakingContract {
    struct StakingPlan {
        uint256 planId;
        uint256 minimumStake;
        uint256 lockDuration;
        uint256 dailyReturn;
    }

    struct StakingDetails {
        uint256 stakingId;
        uint256 planId;
        uint256 unlockDate;
        //that amount user joined with : referral bonus calculates on this
        uint256 investedAmount;
        uint256 estimatedRewardsOnMaturity;
        uint256 stakingStartDate;
    }

    struct Participant {
        address referrer;
        address[] referrals;
        uint256 investedAmount;
        uint256 withdrawn;
    }

    mapping(address => Participant) private participants;


    address private owner;
    mapping(address => StakingDetails[]) private stakingInfo;
    mapping(uint256 => StakingPlan) private stakingPlans;
    mapping(address => uint256) public balances;
    uint256 private totalStaked;
    uint256 private totalStakers;
    uint256 private totalRewardsDistributed;
    IERC20 public token;
    uint256 public tokenDecimals;
    uint256 public dailyReturnDivider= 10000;
    uint256 public minimumRewardWithdrawal;
    uint256 private stakingIdCounter;
    uint256 public directReferralCommission;
    uint256 public indirectReferralCommission;
    address public icoContract;
    uint256 public withdrawalFeePercent;
    bool private icoRunning = true;


    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
        tokenDecimals =18;
        minimumRewardWithdrawal = 100;
        directReferralCommission=10;
        indirectReferralCommission=5;
        withdrawalFeePercent = 5;
        owner = msg.sender;
        // ECO1
        stakingPlans[1] = StakingPlan(1,1000 * 10**tokenDecimals, 120 days, 800);
        // ECO2
        stakingPlans[2] = StakingPlan(2,5000 * 10**tokenDecimals, 900 days, 800);
        // ECO3
        stakingPlans[3] = StakingPlan(3,10000 * 10**tokenDecimals, 700 days, 800);
        // BRONZE
        stakingPlans[4] = StakingPlan(4,20000 * 10**tokenDecimals, 500 days, 800);
        // SILVER
        stakingPlans[5] = StakingPlan(5,30000 * 10**tokenDecimals, 400 days, 800);
        // GOLD
        stakingPlans[6] = StakingPlan(6,50000 * 10**tokenDecimals, 300 days, 800);
        // PLATINUM
        stakingPlans[7] = StakingPlan(7,80000 * 10**tokenDecimals, 200 days, 800);
        // DIAMOND
        stakingPlans[8] = StakingPlan(8,100000 * 10**tokenDecimals, 100 days, 800);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }

    function join(address user,address referrer,uint256 planId,uint256 amount) external {
        if(icoRunning){
            require(msg.sender == icoContract, "Can not join directly until ico finished");
        }
        require(isPlanIdExists(planId), "Plan ID not exists.");
        require(user != referrer, "Referrer cannot be self");
        require(referrer != address(0), "Invalid address");
        Participant storage participant = participants[user];
        require(participant.referrer == address(0), "Participant already joined");
        StakingPlan storage plan = stakingPlans[planId];
        require(amount >= plan.minimumStake, "Insufficient stake amount");
        require(token.transferFrom(user, address(this), amount), "Token transfer failed");
        balances[user] += amount;
        totalStaked += amount;
        StakingDetails[] storage accountStakingDetails = stakingInfo[user];
        if (accountStakingDetails.length == 0) {
            totalStakers++;
        }

        // Save staking details for the account
        StakingDetails memory stakingDetails;
        stakingDetails.stakingId = stakingIdCounter;
        stakingDetails.planId = planId;
        stakingDetails.unlockDate = block.timestamp + plan.lockDuration;
        stakingDetails.investedAmount = amount;
        stakingDetails.estimatedRewardsOnMaturity = (amount * plan.dailyReturn * plan.lockDuration) / (dailyReturnDivider * 100 * 1 days );
        stakingDetails.stakingStartDate = block.timestamp;
        stakingInfo[user].push(stakingDetails);
        stakingIdCounter++;
        participant.referrer = referrer;
        participant.investedAmount = amount;
        participants[referrer].referrals.push(user);
    }

 // Stake tokens in a specific plan without referral
    function stake(uint256 planId, uint256 amount) public {
        if(icoRunning){
            require(msg.sender == icoContract, "Can not join directly until ico finished");
        }
        require(isPlanIdExists(planId), "Plan ID not exists.");
        StakingPlan storage plan = stakingPlans[planId];
        require(amount >= plan.minimumStake, "Insufficient stake amount");
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        balances[msg.sender] += amount;
        totalStaked += amount;
        StakingDetails[] storage accountStakingDetails = stakingInfo[msg.sender];
        if (accountStakingDetails.length == 0) {
            totalStakers++;
        }

        // Save staking details for the account
        StakingDetails memory stakingDetails;
        stakingDetails.stakingId = stakingIdCounter;
        stakingDetails.planId = planId;
        stakingDetails.unlockDate = block.timestamp + plan.lockDuration;
        stakingDetails.investedAmount = amount;
        stakingDetails.estimatedRewardsOnMaturity = (amount * plan.dailyReturn * plan.lockDuration) / (dailyReturnDivider * 100 * 1 days);
        stakingDetails.stakingStartDate = block.timestamp;
        stakingInfo[msg.sender].push(stakingDetails);
        // Increment the stakingId counter
        stakingIdCounter++;
    }


    function countDirectReferrals(address acccount) public view returns (uint256) {
        return participants[acccount].referrals.length;
    }

    function countIndirectReferrals(address user) public view returns (uint256) {
        return countIndirectReferralsRecursive(user)- countDirectReferrals(user);
    }

    function countIndirectReferralsRecursive(address user) private view returns (uint256) {
        uint256 count = 0;
        address[] memory referrals = participants[user].referrals;
        
        for (uint256 i = 0; i < referrals.length; i++) {
            count++;
            count += countIndirectReferralsRecursive(referrals[i]);
        }
        
        return count;
    }


function calculateReferralCommission(address user) public view returns (uint256) {
    uint256 directCommission = 0;
    uint256 indirectCommission = 0;
    address[] memory referrals =   participants[user].referrals;
    uint256 directReferralCount = referrals.length;
    if (directReferralCount >= 2) {
       for (uint256 i = 0; i < referrals.length; i++) {
            directCommission += (participants[referrals[i]].investedAmount * directReferralCommission/100);
       }
    }

        // Indirect commission calculation
    for (uint256 i = 0; i < directReferralCount; i++) {
        indirectCommission += calculateIndirectCommission(referrals[i]);
    }
    return directCommission + indirectCommission;
}

function calculateIndirectCommission(address participantAddress) private view returns (uint256) {
    uint256 indirectCommission = 0;

    address[] storage indirectReferrals = participants[participantAddress].referrals;
    uint256 indirectReferralsCount = indirectReferrals.length;

    if (indirectReferralsCount >= 2) {
        for (uint256 i = 0; i < indirectReferralsCount; i++) {
            address indirectReferral = indirectReferrals[i];
            indirectCommission += participants[indirectReferral].investedAmount * indirectReferralCommission / 100;
            indirectCommission += calculateIndirectCommission(indirectReferral);
        }
    }

    return indirectCommission;
}

    function getDirectReferrals(address participantAddress) public view returns (address[] memory) {
        return participants[participantAddress].referrals;
    }

        // Get the staking details for a specific staking_id of an account
    function getStakingDetails(address account, uint256 staking_id) private view returns (StakingDetails storage) {
        require(stakingInfo[account].length > 0, "No staked amount");
        bool is_staked = false;
        uint256 selectedIndex = 0;
        StakingDetails[] storage accountStakingDetails = stakingInfo[account];
        for (uint256 i = 0; i < accountStakingDetails.length; i++) {
            if (accountStakingDetails[i].stakingId == staking_id) {
                selectedIndex = i;
                is_staked = true;
                break;
            }
        }
        require(is_staked, "No staked amount for the specified stakingId");

        StakingDetails storage stakingDetails = accountStakingDetails[selectedIndex];
        return stakingDetails;
    }

    function getRealtimeStakingReward(address account, uint256 staking_id) public view returns (uint256 actualReward) {
        StakingDetails storage stakingDetails = getStakingDetails(account, staking_id);
        StakingPlan storage plan = stakingPlans[stakingDetails.planId];
        uint256 stakingDuration = block.timestamp - stakingDetails.stakingStartDate;
        if (stakingDuration > plan.lockDuration) {
            stakingDuration = plan.lockDuration;
        }
        uint256 perSecondReward = (plan.dailyReturn * stakingDetails.investedAmount) / (dailyReturnDivider * 100 * 86400);
        uint256 reward = perSecondReward * stakingDuration;
        return reward;
    }

       function getRealtimeStakingRewards(address account) public view returns (uint256 actualReward) {
           uint256 totalReward;
         StakingDetails[] memory stakingDetails =   stakingInfo[account];
        for(uint i=0;i<stakingDetails.length;i++){
            StakingDetails memory stakingDetail = stakingDetails[i];
            StakingPlan memory plan = stakingPlans[stakingDetail.planId];
            uint256 stakingDuration = block.timestamp - stakingDetail.stakingStartDate;
            if (stakingDuration > plan.lockDuration) {
                stakingDuration = plan.lockDuration;
            }
            uint256 perSecondReward = (plan.dailyReturn * stakingDetail.investedAmount) / (dailyReturnDivider * 100 * 86400);
            uint256 reward = perSecondReward * stakingDuration;
            totalReward +=reward;
        }
        return totalReward;
    }

    function updateMinimumWithdrawalLimit(uint256 limit) external onlyOwner {
        require(limit > 0, "Invalid token decimals");
        minimumRewardWithdrawal = limit;
    }

        // Withdraw account rewards
    function withdrawRewards(uint256 amount) external {
        uint256 stakingReward = getRealtimeStakingRewards(msg.sender);
        uint256 withdrawableReward =  stakingReward - participants[msg.sender].withdrawn;
        require(withdrawableReward >= minimumRewardWithdrawal, "Reward amount is less than the minimum withdrawal limit");
        require(amount <= withdrawableReward, "Withdrawal amount exceeds the available rewards");
        uint256  finalValue = amount - ((amount * withdrawalFeePercent)/100);
        require(token.transfer(msg.sender, finalValue), "Token transfer failed");
        participants[msg.sender].withdrawn += amount;
        totalRewardsDistributed += amount;
    }

    // Withdraw tokens from the contract
    function withdrawTokens(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= token.balanceOf(address(this)), "Insufficient contract balance");
        require(token.transfer(owner, amount), "Token transfer failed");
    }

    // Withdraw Native Currency (BNB) from the contract
    function withdrawNativeCurrency(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(address(this).balance >= amount, "Insufficient balance");

        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "BNB transfer failed");
    }

    // Unstake tokens from a specific staking
    function unstake(uint256 staking_id) external {
        require(stakingInfo[msg.sender].length > 0, "No staked amount");
        bool is_staked = false;
        uint256 selectedIndex = 0;
        StakingDetails[] storage accountStakingDetails = stakingInfo[msg.sender];
        for (uint256 i = 0; i < accountStakingDetails.length; i++) {
            if (accountStakingDetails[i].stakingId == staking_id) {
                selectedIndex = i;
                is_staked = true;
                break;
            }
        }
        require(is_staked, "No staked amount for the specified stakingId");

        StakingDetails storage stakingDetails = accountStakingDetails[selectedIndex];

        StakingPlan storage plan = stakingPlans[stakingDetails.planId];
        uint256 stakingDuration = block.timestamp - stakingDetails.stakingStartDate;
        require(stakingDuration >= plan.lockDuration, "Lock period not over");
        uint256 reward = getRealtimeStakingReward(msg.sender, stakingDetails.stakingId);
        uint256 totalWithdrawable = stakingDetails.investedAmount + reward - participants[msg.sender].withdrawn;
        require(token.transfer(msg.sender, totalWithdrawable), "Token transfer failed");

        balances[msg.sender] -= stakingDetails.investedAmount;
        totalStaked -= stakingDetails.investedAmount;
        totalRewardsDistributed = totalRewardsDistributed + reward - participants[msg.sender].withdrawn;

        // Remove the selected staking detail from the array
        if (selectedIndex < accountStakingDetails.length - 1) {
            // Move the last element to the selected index and remove the last element
            accountStakingDetails[selectedIndex] = accountStakingDetails[accountStakingDetails.length - 1];
        }
        accountStakingDetails.pop();
    }


      // Get the staking details for a specific staking_id of an account
    function getStakingDetailsofId(address account, uint256 staking_id) public view returns (
        uint256 stakingId,
        uint256 planId,
        uint256 unlockDate,
        uint256 investedAmount,
        uint256 estimatedRewardsOnMaturity,
        uint256 stakingStartDate,
        uint256 realtimeReward
        ) {
        require(stakingInfo[account].length > 0, "No staked amount");
        bool is_staked = false;
        uint256 selectedIndex = 0;
        StakingDetails[] memory accountStakingDetails = stakingInfo[account];
        for (uint256 i = 0; i < accountStakingDetails.length; i++) {
            if (accountStakingDetails[i].stakingId == staking_id) {
                selectedIndex = i;
                is_staked = true;
                break;
            }
        }
        require(is_staked, "No staked amount for the specified stakingId");
        StakingDetails memory stakingDetails = accountStakingDetails[selectedIndex];
        uint256 realtime_reward = getRealtimeStakingReward(account,staking_id);
        return(
        stakingDetails.stakingId,
        stakingDetails.planId,
        stakingDetails.unlockDate,
        stakingDetails.investedAmount,
        stakingDetails.estimatedRewardsOnMaturity,
        stakingDetails.stakingStartDate,
        realtime_reward
        );
    }
   
    // Get all staking plans
    function getAllPlans() public view returns (StakingPlan[] memory) {
        StakingPlan[] memory allPlans = new StakingPlan[](15);
        for (uint256 i = 1; i <= 15; i++) {
            allPlans[i - 1] = stakingPlans[i];
        }
        return allPlans;
    }

    // Get all staking details of an account
    function getAccountStakings(address account) public view returns (StakingDetails[] memory) {
        require(stakingInfo[account].length > 0, "No staked amount");
        return stakingInfo[account];
    }

    // Get staking statistics
    function getStakingStatistics() public view returns (
        uint256 total_stakers,
        uint256 total_staked,
        uint256 total_rewards_distributed
    ) {
        return (
            totalStakers,
            totalStaked,
            totalRewardsDistributed
        );
    }
  
    // Get the Ether balance of the contract
    function getContractEtherBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Get the token balance of the contract
    function getContractTokenBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function getReferrer(address participantAddress) external view returns (address) {
        return participants[participantAddress].referrer;
    }

     function getIcoContractAddress() external view returns (address) {
        return icoContract;
    }

     function getWithdrawnRewards(address account) external view returns (uint256) {
        return participants[account].withdrawn;
    }

      function updateIcoContractAddress(address contract_address) public {
        icoContract =contract_address;
    }
    function updateIcoStatus(bool status) public {
        icoRunning =status;
    }

    function updatePlan(uint256 planId, uint256 minimumAmount, uint256 numDays,uint256 perDayPercent) external onlyOwner{
        require(isPlanIdExists(planId), "Plan ID not exists.");
        stakingPlans[planId] = StakingPlan(planId,minimumAmount * 10**tokenDecimals, numDays * 1 days, perDayPercent);
    }

     function deletePlan(uint256 planId) external onlyOwner{
        // Check if the planId already exists
        require(isPlanIdExists(planId), "Plan ID not exists.");
        delete stakingPlans[planId];
    }
    // Function to check if a planId already exists
    function isPlanIdExists(uint256 planId) public view returns (bool) {
        require(planId != 0, "Plan ID cannot be zero.");
        return stakingPlans[planId].planId ==  planId;
    }

        // Function to check if a planId already exists
    function isICORunning() public view returns (bool) {
        return icoRunning;
    }



    function addStakingPlan(
        uint256 _planId,
        uint256 _minimumStakeWithoutDecimals,
        uint256 _lockDurationInDays,
        uint256 _dailyReturnWithfourDecimals
    ) external onlyOwner {
        // Check if the planId already exists
        require(!isPlanIdExists(_planId), "Plan ID already exists.");

        // Create a new StakingPlan object
        StakingPlan memory newPlan = StakingPlan({
            planId :_planId,
            minimumStake: _minimumStakeWithoutDecimals * 10 **tokenDecimals,
            lockDuration: _lockDurationInDays * 1 days,
            dailyReturn: _dailyReturnWithfourDecimals
        });

        // Add the new plan to the mapping
        stakingPlans[_planId] = newPlan;
    }

}