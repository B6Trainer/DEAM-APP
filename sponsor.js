import {writeContract,waitForTransaction,readContract,readContracts, erc20ABI} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';
import {subscriptionAddress,tokenAddress,usdtAddress} from './config';
import subscriptionABI from './ABI_SUBSCRIPTION.json';
import ABI_ERC20 from './ABI_ERC20.json'
import getPlanName from "./contractUtils";
import ABI_DMTK from "./ABI_DMTK.json";

const planName = document.getElementById("plan-name");
const validity = document.getElementById("validity");
const totalDeposits = document.getElementById("total-deposits");
const totalEarnings = document.getElementById("total-earnings");
const benefits = document.getElementById("benefits");
const carddiv = document.getElementById("carddiv");
const renewbtndiv = document.getElementById("button-renew");
const topupdiv = document.getElementById("button-topup");
const renewBtn = document.getElementById("btn-renew");
const topupBtn = document.getElementById("btn-topup");
const labeltopup = document.getElementById("labeltopup");
const renewalCharge = document.getElementById("renewalCharge");
const errorx = document.getElementById("errorx");
const amountx = document.getElementById("amountx");
const btnApprove = document.getElementById("btn-approve");
const availableUSDT = document.getElementById("availableUSDT");
const mindeposit = document.getElementById("mindeposit");
const subscribeBtn = document.getElementById("subscribeBtnxx");
const subscribeBtnCont = document.getElementById("subscribeBtnCont");
const amountsubscriptionnewx = document.getElementById("amountsubscriptionnew")
const membershipType = document.getElementById("membershipType")
const benefitsSection = document.getElementById("benefits-section")
const mindepositcontainer = document.getElementById("mindepositcontainer")
const name_ = document.getElementById("name")
const mobile_ = document.getElementById("mobile")
const email_ = document.getElementById("email")
const referrerAc___ = document.getElementById("referrerAc")
const amountInput___ = document.getElementById("amountInput")
const minimumTopup = document.getElementById("minimumTopup")

document.getElementById("referrerAccount").value = ethereumClient.getAccount().address;
var connected = ethereumClient.getAccount().isConnected;

if(!connected){
  carddiv.innerHTML =``;
  carddiv.innerHTML =`<span style="text-align:center;margin-left:110px;margin-top:100px;position: fixed;">Connect  Wallet<span>`;
}

const subscriptionContract = {
  address: subscriptionAddress,
  abi: subscriptionABI,
  }
  
  const dmtkCOntract = {
  address: tokenAddress,
  abi: ABI_DMTK,
  }

  const usdtContract = {
    address: usdtAddress,
    abi: ABI_ERC20,
    }
    
  

const AccountData = await readContracts({
  contracts: [
  {
      ...usdtContract,
      functionName: 'balanceOf',
      args: [ethereumClient.getAccount().address],
  },
  {
    ...dmtkCOntract,
    functionName: 'minimumDepositForMembers',
  },
  {
    ...usdtContract,
    functionName: 'allowance',
    args: [ethereumClient.getAccount().address,tokenAddress],
  },
  ],
});

if(AccountData[0].result)
availableUSDT.innerHTML = Number(utils.formatEther(AccountData[0].result)).toFixed(2)





subscribeBtn.addEventListener('click', async function (e) {

    const amountsubscriptionnew = document.getElementById("amountsubscriptionnew").value;
    const referrerAccount = document.getElementById("referrerAccount").value;
    const name = document.getElementById("name__").value;
    const mobile = document.getElementById("mobile__").value;
    const email = document.getElementById("email__").value;
    const member = document.getElementById("member__").value;

    
    if(!member || !name || !mobile || !email || !referrerAccount){
     alert("enter Required Field")
     return;
    }

    var min = Number(utils.formatEther(AccountData[1].result)).toFixed(2);
    if(Number(amountsubscriptionnew)<min){
     alert("Error:"+"Minimum Deposit is "+min);
      return;
    }
      subscribeBtn.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Please Wait`;
      subscribeBtn.disabled =true;
      try{
        const result = await writeContract({
          address: tokenAddress,
          abi: ABI_DMTK,
          functionName: 'addAMember',
          args: [member,utils.parseUnits(String(amountsubscriptionnew), 18),referrerAccount,email,mobile,name],
      });
      
      
      const resultTr = await waitForTransaction({
          hash: result.hash,
        })
        if(resultTr.status=='success'){
          alert("Success")
        }
      }catch(e){
        subscribeBtn.innerHTML = `Subscribe`;
        subscribeBtn.disabled =false;
        console.log(e)
        alert("Error:"+e.shortMessage);
        return;
      }
  });




//minimumDepositFee
var amount = document.getElementById("amountsubscriptionnew");
amount.addEventListener("keyup",()=>{
    const amout__ = amount.value;
    if(Number(amout__)<=Number(utils.formatEther(AccountData[2].result)).toFixed(2)){
        subscribeBtn.style.display = "block";
      btnApprove.style.display = "none";
     }else{
      btnApprove.style.display = "block";
      subscribeBtn.style.display = "none";
     }
     
  });




btnApprove.addEventListener('click', async function (e) {
    const amountx_ = document.getElementById("amountsubscriptionnew").value;
    var result;
    try{
      btnApprove.disabled = true;
    btnApprove.innerHTML  = `<i class="fa fa-refresh fa-spin"></i> Please Wait`;
   result = await writeContract({
      address: usdtAddress,
      abi: ABI_ERC20,
      functionName: 'approve',
      args: [tokenAddress, utils.parseUnits(String(amountx_), 18)],
  });



  const resultTr = await waitForTransaction({
    hash: result.hash,
  })
  if(resultTr.status=='success'){
    if(amountx_==""){
      btnApprove.disabled = false;
      btnApprove.style.display = "none";
      subscribeBtn.style.display ="block"

    }else{
      btnApprove.disabled = false;
    btnApprove.style.display = "none";
    subscribeBtn.style.display = "block";
    }
  }



  }catch(e){
    btnApprove.disabled = false;
    btnApprove.innerHTML  = `Approve`;
    // btnApprove.disabled = false;
    errorx.innerHTML = "Error: "+e.shortMessage;
  }
});