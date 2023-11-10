import {waitForTransaction,readContracts,writeContract} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';
import {stakingAddress,tokenAddress,subscriptionAddress } from './config';

import { DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,DM_MEMBERSHIP_ADDRESS } from './config';
import DM_CONFIG_ABI from './ABI_DM_CONFIG.json';
import DM_MANAGER_ABI from './ABI_DM_MANAGER.json';
import DM_CPDISTRIBUTOR_ABI from './ABI_DM_CPDISTRIBUTOR.json';
import DM_TOKEN_ABI from './ABI_DM_TOKEN.json';
import DM_MEMBERSHIP_ABI from './ABI_DM_MEMBERSHIP.json';

import ABI_DMTK from './ABI_DMTK.json';
import SUB_ABI from './ABI_SUBSCRIPTION.json';
const withdrawable = document.getElementById("withdrawable-reward");
const withdrawAmount = document.getElementById("withdrawAmount");
const submitWithdraw = document.getElementById("submit-withdraw");
const fee_ = document.getElementById("fee");
const errormsg = document.getElementById("errormsg");


  const dmtkCOntract = {
  address: tokenAddress,
  abi: ABI_DMTK,
  }


const subscriptionContract = {
  address: subscriptionAddress,
  abi: SUB_ABI,
  }


    //New Contracts
    const dmConfigContract = {
      address: DM_CONFIG_ADDRESS,
      abi: DM_CONFIG_ABI,
    }

    const dmManagerContract = {
      address: DM_MANAGER_ADDRESS,
      abi: DM_MANAGER_ABI,
    }

    const dmCPdistributorContract = {
      address: DM_CPDISTRIBUTOR_ADDRESS,
      abi: DM_CPDISTRIBUTOR_ABI,
    }

    const dmTokenContract = {
      address: DM_TOKEN_ADDRESS,
      abi: DM_TOKEN_ABI,
    }
    
    const dmMembershipContract = {
      address: DM_MEMBERSHIP_ADDRESS,
      abi: DM_MEMBERSHIP_ABI,
    }
  
const AccountData = await readContracts({
    contracts: [
      {
        ...dmTokenContract,
        functionName: 'balanceOf',
        args: [ethereumClient.getAccount().address],
    },
    {
      ...dmMembershipContract,
      functionName: 'getSubscriptionDetails',
      args:[ethereumClient.getAccount().address]
    },
    {
      ...dmConfigContract,
      functionName: 'conversionFeeMember',
    },

    {
      ...dmConfigContract,
      functionName: 'conversionFeePromoter',
    },
     
    ],
  });

console.log(AccountData)

const total = Number(utils.formatEther(AccountData[0].result));
const withdrawable_ = (total)
withdrawable.innerHTML = withdrawable_;



withdrawAmount.addEventListener("keyup",()=>{
  const withdrawAmount_ = withdrawAmount.value;
  if(AccountData[1].result[0]==0){
    fee_.innerHTML =  (Number(String(AccountData[2].result)) * withdrawAmount_)/(100);//Member Fee
   }
   if(AccountData[1].result[0]==1){
     fee_.innerHTML =  (Number(String(AccountData[3].result)) * withdrawAmount_)/(100);//Promoter Fee
    }
   
});


submitWithdraw.addEventListener("click", async () => {
    const withdrawAmount_ = withdrawAmount.value;
    if(withdrawAmount_ == "" || withdrawAmount_ <=0){
        errormsg.innerHTML =` <div class="alert alert-danger alert-dismissible fade show">
        <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
        <strong >Error!</strong> Please Enter Amount above 0
      </div>`;
        return;
    }

    if(withdrawable_ <=0){
      errormsg.innerHTML =` <div class="alert alert-danger alert-dismissible fade show">
      <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
      <strong >Error!</strong> Withdraw is not possible as your balance is ${withdrawable_} DMTK
    </div>`;
      return;
    }

    if(Number(withdrawAmount_) > withdrawable_){
        errormsg.innerHTML =` <div class="alert alert-danger alert-dismissible fade show">
        <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
        <strong >Error!</strong> Enter Amount less than ${withdrawable_} DMTK
      </div>`;
        return;
    }
    var result;
    try{
      submitWithdraw.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Please Wait`
      submitWithdraw.disabled =true;
      result = await writeContract({
        address: DM_MANAGER_ADDRESS,
        abi: DM_MANAGER_ABI,
        functionName: 'withdraw',
        args: [utils.parseUnits(String(withdrawAmount_), 18)],
    });
  }catch(e){
    submitWithdraw.innerHTML = `Withdraw`
    submitWithdraw.disabled =false;
    console.log(e)
    errormsg.innerHTML =` <div class="alert alert-danger alert-dismissible fade show">
    <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
    <strong >Error!</strong> ${e}
  </div>`;
  }
    
    const resultTr = await waitForTransaction({
        hash: result.hash,
      })
      if(resultTr.status=='success'){
        errormsg.innerHTML =` <div class="alert alert-info alert-dismissible fade show">
        <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
        Transaction Successful! Txn hash:&nbsp; <a target ='_blank' href="https://testnet.ftmscan.com/tx/${resultTr.transactionHash}">${resultTr.transactionHash}</a>
      </div>`;
      submitWithdraw.disabled =true;
      submitWithdraw.innerHTML = `Withdraw`
      
        return;
      }else{
        submitWithdraw.innerHTML = `Withdraw`
        submitWithdraw.disabled =false;
        console.log("failed",resultTr)
      }
    

});



