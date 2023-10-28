
import { utils } from "ethers";
import ABI_DMTK from "./ABI_DMTK.json"
import ABI_SUBSCRIPTION from "./ABI_SUBSCRIPTION.json"
import getPlanName from "./contractUtils";
import Chart from "chart.js/auto";
import {erc20ABI, readContracts,watchAccount} from "@wagmi/core";
import ethereumClient from "./walletConnect";
import {TOKEN_PRICE,getShareData,subscriptionAddress,tokenAddress } from "./config";


const subscriptionContract = {
    address: subscriptionAddress,
    abi: ABI_SUBSCRIPTION,
}

const tokenContract = {
  address: tokenAddress,
  abi: ABI_DMTK,
}
  const tokenPrice = Number(TOKEN_PRICE); 

var connected=ethereumClient.getAccount().isConnected;
if(connected ==true){
    const balance = document.getElementById('balance');
    const balanceUsdValue = document.getElementById('balance-usd-value');
    const totalStaked = document.getElementById('total-staked');
    const earnings = document.getElementById('earnings');
    const earningsUSDT = document.getElementById('earning-usdt');
    const stakingUSDT = document.getElementById('staking-usdt');
    const nameMembership = document.getElementById('name-membership');
    const referAlert = document.getElementById('refer-alert');
    const referButton = document.getElementById('refer-button');
    const onboardMsg = document.getElementById('onboarding-msg');
    const onboardBtn = document.getElementById('onboarding-btn');
    
    
    const AccountData = await readContracts({
      contracts: [
        {
          ...tokenContract,
          functionName: 'balanceOf',
          args: [ethereumClient.getAccount().address],
          
        },
        {
          ...subscriptionContract,
          functionName: 'getSubscriptionDetails',
          args:[ethereumClient.getAccount().address]
        },
        
      ],
    });
    /*0:
    uint8: userType 0
    1:
    uint256: subscriptionBalance 0
    2:
    uint256: rewardReceived 0
    3:
    uint256: validity 0
    4:
    address[]: referrals
    5:
    address: referrer 0x0000000000000000000000000000000000000000
    6:
    address: _subscriber 0x0000000000000000000000000000000000000000
    */
    console.log(AccountData);
    if(AccountData[1].status == 'failure'){
      onboardMsg.innerHTML =`<div id="refer-alert" class="alert alert-info text-center" role="alert">&#128559; Seems like you are new User<br>Join any plan and start earning upto 3x Assured Rewards</div>`;
      onboardBtn.innerHTML = `<button onclick="window.location.href='./stakePlan.html'" class="btn btn-md btn-block btn-primary">View Plans <i class="fa-solid fa-arrow-up-right-from-square"></i></i></button>`;
      nameMembership.innerHTML = "Not A Member"
    }else{
      var result = AccountData[1].result;
      if(result[6]=="0x0000000000000000000000000000000000000000"){
        nameMembership.innerHTML = "Not A Subscriber";
      }else{
       nameMembership.innerHTML = result[0]==0?"Member":"Promotor";
      }
      balance.innerHTML =  Number(utils.formatEther(result[0])).toFixed(2);
      balanceUsdValue.innerHTML =  Number(utils.formatEther(result[0])).toFixed(2);
      totalStaked.innerHTML = Number(utils.formatEther(result[1])).toFixed(2);
      earnings.innerHTML = Number(utils.formatEther(result[2])).toFixed(2);

      var countReferrals = result[4].length;
      console.log(result[4].length);
      if(countReferrals==0){
        referAlert.innerHTML =`<div id="refer-alert" class="alert alert-primary text-center" role="alert">Seems like you have not referred any account.<br>Refer Now and earn upto 3x rewards</div>`;
        referButton.innerHTML = `<button id="share" class="btn btn-md btn-block btn-primary">Refer Now <i class="fa-solid fa-arrow-up-right-from-square"></i></i></button>`;
        share();
    }else{
        referAlert.innerHTML =`<div id="refer-alert" class="alert alert-success text-center" role="alert">Happy Earning! You have earned <strong>50% Direct Referral Commision</strong> by referring <strong>${countReferrals} accounts</strong> so far . Refer more and earn upto 3x rewards</div>`;
        referButton.innerHTML = `<button id="share" class="btn btn-md btn-block btn-primary">Refer More <i class="fa-solid fa-arrow-up-right-from-square"></i></i></button>`;
        share();
    }
        /* pie chart */
        const data = {
        labels: ['Your Deposits', 'Total Earnings'],
        datasets: [{
            data: [Number(utils.formatEther(result[1])).toFixed(2),Number(utils.formatEther(result[2])).toFixed(2)],
            backgroundColor: ['#3496ff', '#17a2b8'], 
        }]
        };
        
        // Pie chart options
        const options = {
            responsive: true,
            maintainAspectRatio: false,
        };

        // Create the pie chart
        const ctx = document.getElementById('myPieChart').getContext('2d');
        const myPieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: options,
        });
}


}

function share(){
const shareData =getShareData(ethereumClient.getAccount().address);
const shareBtn = document.getElementById("share");
shareBtn.addEventListener("click", async () => {
  try {
    await navigator.share(shareData);
   console.log("success")
  } catch (err) {
    console.log(err)
  }
});
}