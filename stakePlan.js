import { BigNumber, utils } from "ethers";
import STAKE_ABI from "./ABI_STAKE.json";
import { stakingAddress } from "./config";
import getPlanName from "./contractUtils";
import { readContracts, watchAccount } from "@wagmi/core";
import ethereumClient from "./walletConnect";

const stakeContract = {
  address: stakingAddress,
  abi: STAKE_ABI,
};

const PlansDiv = document.getElementById("plans-content");

var connected = ethereumClient.getAccount().isConnected;
if (connected == true) {
  const plans = await readContracts({
    contracts: [
      {
        ...stakeContract,
        functionName: "getAllPlans",
      },
    ],
  });
  const daysDivider = 60 * 60 * 24;
  if (plans[0].status == "success") {
    for (var i = 0; i < plans[0].result.length; i++) {
      if (plans[0].result[i].dailyReturn != 0) {
        const plan = plans[0].result[i];

        var stakingDays = Number(plan.lockDuration) / daysDivider;
        var percentage = Number(plan.dailyReturn);
       var jj =  Number(plan.minimumStake) / (100 * 10000);
        var dailyReturn = Number(percentage) * jj;

        dailyReturn = Number(dailyReturn)/100000000000000000;

        var minReturn = Number(dailyReturn) * stakingDays;
        var profitPercentage =
          (minReturn * 100) / Number(utils.formatEther(plan.minimumStake));

        var monthlyInterestRate = (30 * percentage) / 10000;

        const htmlContent = `<div class="col-sm-4 pb-5" >
        <div class="card card-plans card_${i + 1} text-center">
          <div class="title">
            <i class="fa fa-paper-plane" aria-hidden="true"></i>
            <h2>${getPlanName(i + 1)}</h2>
          </div>
          <div class="price">
            <h4>${Number(utils.formatEther(String(plan.minimumStake))).toFixed(
              0
            )} DFN</h4>
           
          </div>
          <div class="option">
            <ul>
              <li><i class="fa-solid fa-arrows-to-dot"></i> Stake minimum ${Number(
                utils.formatEther(String(plan.minimumStake))
              ).toFixed(0)} DFN</li>
              <li><i class="fa-solid fa-arrows-to-dot"></i> Staking Period : ${stakingDays} Days</li>
              <li><i class="fa-solid fa-arrows-to-dot"></i> Minimum profit : ${minReturn.toFixed(
                0
              )} DFN upto ${profitPercentage.toFixed(0)} % Return</li>

              <li><i class="fa-solid fa-arrows-to-dot"></i>Guaranteed Monthly interest of ${monthlyInterestRate} %</li>
              <li><i class="fa-solid fa-arrows-to-dot"></i> Withdraw Profit anytime in your wallet.</li>
            </ul>
          </div>
          <form action="./joinPlan.html" style="z-index: 2;">
          <input type="hidden" value="${getPlanName(i + 1)}" name="name">
          <input type="hidden" value="${Number(
            utils.formatEther(String(plan.minimumStake))
          ).toFixed(0)}" name="minAmount">
          <input type="hidden" value="${stakingDays}" name="stakingPeriod">
          <input type="hidden" value="${profitPercentage.toFixed(
            0
          )}" name="earningpercentage">
          <input type="hidden" value="${minReturn.toFixed(
            0
          )}" name="earningtoken">
          <input type="hidden" value="${i + 1}" name="planId">
          <button type="submit" style="color:white;" class="btn btn-primary">Start Earning</button>
          </form>
        </div>
      </div>`;
        PlansDiv.insertAdjacentHTML("beforeend", htmlContent);
      }
    }
  } else {
    PlansDiv.innerHTML = `<div style="margin-top:30px" id="refer-alert" class="alert alert-danger text-center" role="alert"> Some error occured while fething plans.</div>`;
  }
}
