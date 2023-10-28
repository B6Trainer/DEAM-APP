import {waitForTransaction,readContracts,writeContract} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import { isAddress } from 'web3-validator';
import {utils} from 'ethers';
import {tokenAddress,subscriptionAddress } from './config';
import tokenABI from './ABI_DMTK.json';
import ABI_SUB from './ABI_SUBSCRIPTION.json';
const recipientAddress = document.getElementById("recipientAddress");
const amount = document.getElementById("amount");
const sendBtn = document.getElementById("sendbtn");
const errormsg = document.getElementById("errormsg");
const AvlBalance = document.getElementById("available_balance");
const fee_ = document.getElementById("fee");


const subscriptionContract = {
  address: subscriptionAddress,
  abi: ABI_SUB,
  }

  const dmtkCOntract = {
    address: tokenAddress,
    abi: tokenABI,
    }
  
const AccountDatas = await readContracts({
    contracts: [
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


amount.addEventListener("keyup",()=>{
  const withdrawAmount_ = amount.value;
  if(AccountDatas[0].result[0]==0){
    fee_.innerHTML =  (Number(String(AccountDatas[1].result)) * withdrawAmount_)/100;
   }
   if(AccountDatas[0].result[0]==1){
     fee_.innerHTML =  (Number(String(AccountDatas[2].result)) * withdrawAmount_)/100;
    }
   
});




const tokenContract = {
    address: tokenAddress,
    abi: tokenABI,
    }


const AccountData = await readContracts({
    contracts: [
      {
        ...tokenContract,
        functionName: 'balanceOf',
        args:[ethereumClient.getAccount().address]
      }
    ],
  });
  const balance = Number(utils.formatEther(AccountData[0].result)).toFixed(2);
  AvlBalance.innerHTML = balance;


  sendBtn.addEventListener("click", async () => {
    const amount_ = amount.value;
    if(amount_ == ""){
        errormsg.innerHTML =` <div class="alert alert-danger alert-dismissible fade show">
        <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
        <strong >Error!</strong> Please Enter Amount
      </div>`;
        return;
    }
    if(!isAddress(recipientAddress.value)){
        errormsg.innerHTML =` <div class="alert alert-danger alert-dismissible fade show">
        <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
        <strong >Error!</strong> Invalid recipient Address
      </div>`;
        return;
    }

    if(recipientAddress.value == ""){
        errormsg.innerHTML =` <div class="alert alert-danger alert-dismissible fade show">
        <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
        <strong >Error!</strong> Please Enter RecipientAddres
      </div>`;
        return;
    }
    if(Number(amount_) > balance){
        errormsg.innerHTML =` <div class="alert alert-danger alert-dismissible fade show">
        <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
        <strong >Error!</strong> Enter Amount less than ${balance} DFN
      </div>`;
        return;
    }
    sendBtn.disabled ="true";
    const result = await writeContract({
        address: tokenAddress,
        abi: tokenABI,
        functionName: 'transfer',
        args: [recipientAddress.value,utils.parseUnits(String(amount_), 18)],
    });
    
    const resultTr = await waitForTransaction({
        hash: result.hash,
      })
      if(resultTr.status=='success'){
        errormsg.innerHTML =` <div class="alert alert-info alert-dismissible fade show">
        <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
       Success:  <a href="https://testnet.ftmscan.com/tx/${resultTr.transactionHash}">${resultTr.transactionHash}</a>
      </div>`;
       
        return;
      }else{
        sendBtn.disabled ="false";
        console.log("failed",resultTr)
      }
    

});



