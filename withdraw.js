import {waitForTransaction,readContracts,writeContract} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';
import {stakingAddress,tokenAddress,subscriptionAddress } from './config';
import stakeABI from './ABI_STAKE.json';
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
  
const AccountData = await readContracts({
    contracts: [
      {
        ...dmtkCOntract,
        functionName: 'balanceOf',
        args: [ethereumClient.getAccount().address],
    },
    {
      ...subscriptionContract,
      functionName: 'getSubscriptionDetails',
      args:[ethereumClient.getAccount().address]
    },
    {
      ...dmtkCOntract,
      functionName: 'conversionFeeMember',
    },

    {
      ...dmtkCOntract,
      functionName: 'conversionFeePromotor',
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
        address: tokenAddress,
        abi: ABI_DMTK,
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



