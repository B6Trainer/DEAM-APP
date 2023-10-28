import ethereumClient from "./walletConnect";
import {
  waitForTransaction,
  writeContract,
  readContract,
  readContracts,
} from "@wagmi/core";
import { utils } from "ethers";
import tokenABI from "./ABI_ERC20.json";
import { usdtAddress, tokenAddress, stakingAddress } from "./config";
import { isAddress } from "web3-validator";
import stakeABI from "./ABI_STAKE.json";

const stakeContract = {
  address: stakingAddress,
  abi: stakeABI,
};

const usdtContract = {
  address: usdtAddress,
  abi: tokenABI,
};

const tokenContract = {
  address: tokenAddress,
  abi: tokenABI,
};

var contractData = await readContracts({
  contracts: [
    {
      ...tokenContract,
      functionName: "allowance",
      args: [ethereumClient.getAccount().address, stakingAddress],
    },
    {
      ...usdtContract,
      functionName: "balanceOf",
      args: [ethereumClient.getAccount().address],
    },
    {
      ...tokenContract,
      functionName: "balanceOf",
      args: [ethereumClient.getAccount().address],
    },
    {
      ...stakeContract,
      functionName: "balances",
      args: [ethereumClient.getAccount().address],
    },
  ],
});
const usdtBal = contractData[1].result;
const tokenBalance = contractData[2].result;
const stakingBalance = contractData[3].result;
const tokenAllowance = contractData[0].result;
console.log(contractData);

const planName = document.getElementById("plan-name");
const minStake = document.getElementById("minimum-stake");
const duration = document.getElementById("duration");
const tokenPercentage = document.getElementById("token-percentage");
const tokenProfit = document.getElementById("token-profit");
const usd = document.getElementById("usdt-available");
const dfn = document.getElementById("dfn-available");
const required = document.getElementById("dfn-required");
const joinBtn = document.getElementById("joinBtn");
const joiningForm = document.querySelector("#joiningForm");
const addressError = document.getElementById("addressError");
const containerJoin = document.getElementById("joinCont");
const swapBtn = document.getElementById("swap_btn");
const amountInput = document.getElementById("amount");

const urlParams = new URLSearchParams(window.location.search);
planName.innerHTML = urlParams.get("name");
minStake.innerHTML = urlParams.get("minAmount");
duration.innerHTML = urlParams.get("stakingPeriod");
tokenPercentage.innerHTML = urlParams.get("earningpercentage");
tokenProfit.innerHTML = urlParams.get("earningtoken");
usd.innerHTML = Number(utils.formatEther(usdtBal)).toFixed(2);
var tokenBalances = Number(utils.formatEther(tokenBalance)).toFixed(2);
dfn.innerHTML = tokenBalances;
required.innerHTML = urlParams.get("minAmount");

amountInput.addEventListener("keyup", function (event) {
  console.log(amountInput.value);
  if (amountInput.value !== "") {
    if (
      Number(utils.parseEther(String(amountInput.value))) <=
      Number(tokenAllowance)
    ) {
      joinBtn.value = "stake";
      joinBtn.innerHTML = "Stake";
      joinBtn.style.background = "#26b562";
    } else {
      joinBtn.value = "approve";
      joinBtn.innerHTML = "Approve";
      joinBtn.style.background = "#0d6efd";
    }
  }
});

if (Number(stakingBalance) != 0) {
  document.getElementById("referral-group").style.display = "none";
}
joinBtn.addEventListener("click", async function (event) {
  event.preventDefault();
  //already Joined
  if (Number(stakingBalance) != 0) {
    const amount = Number(joiningForm[0].value);
    const minAmount = Number(urlParams.get("minAmount"));
    const planId = Number(urlParams.get("planId"));
    if (amount < minAmount) {
      alert("Amount must be more than " + minAmount + " DFN");
      return;
    }

    if (joinBtn.value == "approve") {
      if (tokenBalances < minAmount) {
        alert("Not Enough DFN to stake");
        return;
      }
      joinBtn.disabled = true;
      joinBtn.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Waiting for Approval`;
      try {
        const result = await writeContract({
          address: tokenAddress,
          abi: tokenABI,
          functionName: "approve",
          args: [stakingAddress, utils.parseUnits(String(amount), 18)],
        });
        const resultTr = await waitForTransaction({
          hash: result.hash,
        });
        if (resultTr.status == "success") {
          joinBtn.disabled = false;
          joinBtn.value = "stake";
          joinBtn.innerHTML = "Stake Now";
          joinBtn.style.backgroundColor = "#26b562";
        } else {
          joinBtn.disabled = false;
          joinBtn.innerHTML = `Approve`;
          alert("Try Again");
        }
      } catch (e) {
        joinBtn.disabled = false;
        joinBtn.innerHTML = `Approve`;
        alert("Rejected Approval.Try Again");
      }
    } else {
      joinBtn.disabled = true;
      joinBtn.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Please Wait`;
      try {
        const joinresult = await writeContract({
          address: stakingAddress,
          abi: stakeABI,
          functionName: "stake",
          args: [String(planId), utils.parseUnits(String(amount), 18)],
        });
        const resultjoin = await waitForTransaction({
          hash: joinresult.hash,
        });
        console.log(resultjoin);
        if (resultjoin.status == "success") {
          containerJoin.style.display = "none";
          successMsg.innerHTML = `<span style="word-break: break-word;"  class="alert alert-success">Congratulations! You investment is successful.</span>`;
        } else {
          joinBtn.disabled = false;
          joinBtn.value = "stake";
          alert("Try Again");
        }
      } catch {
        joinBtn.disabled = false;
        joinBtn.value = "stake";
        alert("Rejected By User. Try Again");
      }
    }
  } else {
    const amount = Number(joiningForm[0].value);
    const referrer = joiningForm[1].value.trim();
    const planId = Number(urlParams.get("planId"));
    const minAmount = Number(urlParams.get("minAmount"));

    if (!isAddress(referrer)) {
      addressError.innerHTML = "Invalid Referral Code!";
      return;
    }
    if (tokenBalances < minAmount) {
      alert("Not Enough DFN to stake");
      return;
    }
    if (amount < minAmount) {
      addressError.innerHTML = "Amount must be more than " + minAmount + " DFN";
      return;
    }

    var data = await readContracts({
      contracts: [
        {
          ...stakeContract,
          functionName: "getAccountStakings",
          args: [referrer],
        },
      ],
    });

    if (data[0].status == "failure") {
      addressError.innerHTML = "Invalid Referral Code!";
      return;
    } else {
      if (joinBtn.value == "approve") {
      joinBtn.disabled = true;
      joinBtn.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Waiting for Approval`;
        try{
        const result = await writeContract({
          address: tokenAddress,
          abi: tokenABI,
          functionName: "approve",
          args: [stakingAddress, utils.parseUnits(String(amount), 18)],
        });
        const resultTr = await waitForTransaction({
          hash: result.hash,
        });
        if (resultTr.status == "success") {
          joinBtn.disabled = false;
          joinBtn.value = "join";
          joinBtn.innerHTML = "Join Now";
          joinBtn.style.backgroundColor = "#26b562";
        } else {
          joinBtn.disabled = false;
          joinBtn.innerHTML = `Approve`;
          alert("Try Again");
        }
      }catch{
        joinBtn.disabled = false;
        joinBtn.innerHTML = `Approve`;
        alert("Cancelled By User: Try Again");
      }
      } else {
        joinBtn.disabled = true;
        joinBtn.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Please Wait`;
        try{
        const joinresult = await writeContract({
          address: stakingAddress,
          abi: stakeABI,
          functionName: "join",
          args: [
            ethereumClient.getAccount().address,
            referrer,
            String(planId),
            utils.parseUnits(String(amount), 18),
          ],
        });
        const resultjoin = await waitForTransaction({
          hash: joinresult.hash,
        });
        if (resultjoin.status == "success") {
          containerJoin.style.display = "none";
          successMsg.innerHTML = `<span style="word-break: break-word;"  class="alert alert-success">Congratulations! You Are now DFN member. </span>`;
        }
      }catch(e){
        joinBtn.disabled = false;
        alert("Cancelled By User: Try Again");
      }
      }
    }
  }
});

swapBtn.addEventListener("click", async function (event) {
  window.location.href = "./swap.html";
});
