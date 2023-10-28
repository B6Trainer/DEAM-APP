import {writeContract,waitForTransaction,readContract,readContracts} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';
import {stakingAddress,TOKEN_PRICE } from './config';
import stakeABI from './ABI_STAKE.json';
import getPlanName from "./contractUtils";

const totalStaked = document.getElementById("total-staked");
const totalStakedUSDT = document.getElementById("total-staked-usdt");
const totalRewards = document.getElementById("total-rewards");
const totalRewardsUSDT = document.getElementById("total-rewards-usdt");
const totalWithdrawn = document.getElementById("total-withdrawn");
const totalWithdrawnUSDT = document.getElementById("total-withdrawn-usdt");
const stakesContainer = document.getElementById("stakes-container");
const tokenPrice = Number(TOKEN_PRICE); 

const stakeContract = {
    address: stakingAddress,
    abi: stakeABI,
    }


    
    


const AccountData = await readContracts({
    contracts: [
      {
        ...stakeContract,
        functionName: 'balances',
        args: [ethereumClient.getAccount().address],
        
      },
      {
        ...stakeContract,
        functionName: 'getRealtimeStakingRewards',
        args:[ethereumClient.getAccount().address]
      },
      {
        ...stakeContract,
        functionName: 'getAccountStakings',
        args:[ethereumClient.getAccount().address]
      },
      {
        ...stakeContract,
        functionName: 'getWithdrawnRewards',
        args:[ethereumClient.getAccount().address]
      }
     
    ],
  });


// DFN_BAL.innerHTML = Number(utils.formatEther(AccountData[0].result)).toFixed(2);
// USDTBAL.innerHTML =Number(utils.formatEther(AccountData[1].result)).toFixed(2);
totalStaked.innerHTML = Number(utils.formatEther(AccountData[0].result)).toFixed(2);
const usdtValue = Number(Number(utils.formatEther(AccountData[0].result))*tokenPrice).toFixed(2);
totalStakedUSDT.innerHTML = usdtValue;

totalRewards.innerHTML = Number(utils.formatEther(String(AccountData[1].result))).toFixed(2); 
const usdtValuer  = Number(Number(utils.formatEther(AccountData[1].result))*tokenPrice).toFixed(2);
totalRewardsUSDT.innerHTML =usdtValuer;
totalWithdrawn.innerHTML = Number(utils.formatEther(String(AccountData[3].result))).toFixed(2); 
const usdtw = Number(Number(utils.formatEther(AccountData[3].result))*tokenPrice).toFixed(2);
totalWithdrawnUSDT.innerHTML = usdtw;

if(AccountData[2].status != 'failure'){
   const stakes =  AccountData[2].result;
   for(var i=0;i<stakes.length;i++){    
    var startDate = new Date((Number(stakes[i].stakingStartDate))*1000)
    var startDateForamt = startDate.toISOString().split('T')[0]
    var endDate = new Date((Number(stakes[i].unlockDate))*1000)
    var endDateForamt = endDate.toISOString().split('T')[0]
    var stakedAmount__ = Number(utils.formatEther(String(stakes[i].investedAmount))).toFixed(2);
   
const stakingData = await readContracts({
    contracts: [
      {
        ...stakeContract,
        functionName: 'getRealtimeStakingReward',
        args: [ethereumClient.getAccount().address,Number(stakes[i].stakingId)],
        
      }
     
    ],
  });
  var rewards__ = Number(utils.formatEther(String(stakingData[0].result))).toFixed(2);
  var staking_id = stakes[i].stakingId;
  
    
    const template =`
    <div class="stake-container mb-3">
        <div class="stake-card">
          <div class="d-flex justify-content-between">
            <div class="staked-amount no-margin">
              <p class="title no-margin">Staking Start</p>
              <p class="value no-margin">${startDateForamt}</p>
            </div>
            <div class="reward no-margin">
              <p class="title no-margin">Staking End</p>
              <p class="value no-margin">${endDateForamt}</p>
            </div>
          </div>
          <p style="color: rgb(68, 66, 66)" class="no-margin">${getPlanName(Number(stakes[i].planId)) +" Plan"}</p>
          <h2 style="color: rgb(68, 66, 66)" class="balance">${stakedAmount__} DFN</h2>

          <p style="color: rgb(68, 66, 66)" class="no-margin">Earning</p>
          <h4 style="color: rgb(68, 66, 66)">${rewards__}</h4>
        </div>
        <div class="button-container-stake">
          <button value ="${staking_id}" id="unstakebtn${staking_id}" class="btn btn-outline-basic btn-lg text-center">
            <i  class="fa-solid fa-arrow-up-right-from-square"></i> Unstake
          </button>
        </div>
      </div>
    `;

   
    stakesContainer.insertAdjacentHTML("beforeend",(template));
}
}
    stakesContainer.addEventListener('click', async function (e) {
      var buttons = document.getElementsByTagName('button');
      for (var j = 2; j < buttons.length; j+=1) {
          var button = buttons[j];
          if (button.id === e.target.id) {
            try {
              var unstakeResult = await writeContract({
                  address: stakingAddress,
                  abi: stakeABI,
                  functionName: 'unstake',
                  args: [button.value],
              });
              var resultStake = await waitForTransaction({
                  hash: unstakeResult.hash,
                })

                console.log(resultStake);
                if(resultStake.status=='success'){
                  alert("success");
                }else{
                  alert("lock period is not over");
                }
          }catch(error){
              alert("lock period is not over");
          }
             
            
          }
        }
        console.log("loop finished")
  });




