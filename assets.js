import {readContracts,writeContract,waitForTransaction} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';
import { usdtAddress,M_TYPE_Guest,M_TYPE_Member,M_TYPE_Promoter,M_TYPE_Admin } from './config';
import { wconnected,walletAddress,membershipType,welMess } from './common';
import ERC20_ABI from './ABI_ERC20.json'
import stakeABI from './ABI_STAKE.json';

import {copyToClipboard} from "./dm_utils";

import { DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,DM_MEMBERSHIP_ADDRESS } from './config';
import DM_CONFIG_ABI from './ABI_DM_CONFIG.json';
import DM_MANAGER_ABI from './ABI_DM_MANAGER.json';
import DM_CPDISTRIBUTOR_ABI from './ABI_DM_CPDISTRIBUTOR.json';
import DM_TOKEN_ABI from './ABI_DM_TOKEN.json';
import DM_MEMBERSHIP_ABI from './ABI_DM_MEMBERSHIP.json';

import { maskWalletAddress,getErrorMessageContent,getInfoMessageContent,getInfoMessageandTxn,getErrorMessageandTxn } from "./dm_utils";

const DMTK_BAL = document.getElementById("dmtk_balance");
const USDTBAL = document.getElementById("usdt_balance");
const TotalStakes = document.getElementById("total_mem_purchases");
const RealtimeRewards = document.getElementById("realtimeReward");
const referralRewards = document.getElementById("referralRewards");
const totalRewards = document.getElementById("totalRewards");
const rewardsWithdrawn = document.getElementById("rewardsWithdrawn");
const AvailableRewards= document.getElementById("availableRewards");



const welcomemessage = document.getElementById("welcome-message");
const availableDMTK = document.getElementById("availableDMTK");
const availableUSDT = document.getElementById("availableUSDT");
const walletid = document.getElementById("walletid");
const rewardsEarned = document.getElementById("rewardsEarned");
const withdrawableRewards = document.getElementById("withdrawableRewards");

const actionsselect = document.getElementById("actionsselect");
const messageBox = document.getElementById("messageBox");
const myWithdrawContainer=document.getElementById('myWithdrawContainer');
const myInvContainer=document.getElementById('myInvContainer');

const _withdrawfee = document.getElementById("fee");
const withdrawAmount = document.getElementById("withdrawAmount");
const submitWithdraw = document.getElementById("submit-withdraw");

var actionTab="";
var withdrawalFee;
var withdrawableAmount;

if(wconnected){
  const usdtContract = {
    address: usdtAddress,
    abi: ERC20_ABI,
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
        ...usdtContract,
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
    }
    
    ],
  });

    //console.log(AccountData[2])
  if(AccountData !=null){
    
    walletid.value=walletAddress;
    walletid.innerHTML = maskWalletAddress(String(walletAddress));

    //Populate the card details
    welcomemessage.innerHTML = welMess; 

    if(AccountData[0].status =="success"){  
      DMTK_BAL.innerHTML = Number(utils.formatEther(AccountData[0].result)).toFixed(2);
      availableDMTK.innerHTML=Number(utils.formatEther(AccountData[0].result)).toFixed(2);

      withdrawableAmount=Number(utils.formatEther(AccountData[0].result)).toFixed(2);
      AvailableRewards.innerHTML = withdrawableAmount;
      withdrawableRewards.innerHTML = withdrawableAmount;

    }else{
      console.log("No data on DMTK Balance of operation. Status: "+AccountData[0].status);
    }

    if(AccountData[1].status =="success"){  
      USDTBAL.innerHTML = Number(utils.formatEther(AccountData[1].result)).toFixed(2);
      availableUSDT.innerHTML = Number(utils.formatEther(AccountData[1].result)).toFixed(2);
    }else{
      console.log("No data on USDT Balance of operation. Status: "+AccountData[1].status);
    }

    if(AccountData[2].status =="success"){  
      TotalStakes.innerHTML = Number(utils.formatEther(AccountData[2].result[1])).toFixed(2);
      RealtimeRewards.innerHTML = Number(utils.formatEther(String(AccountData[2].result[2]))).toFixed(2); 
      rewardsEarned.innerHTML = Number(utils.formatEther(String(AccountData[2].result[2]))).toFixed(2); 
    }else{
      console.log("No data on Subscription operation. Status: "+AccountData[2].status);
    }

    
    if(membershipType==M_TYPE_Member){
      withdrawalFee= Number(String(AccountData[3].result));//Member Fee
    }else if(membershipType==M_TYPE_Promoter){
      withdrawalFee= Number(String(AccountData[4].result));//Promoter Fee
    }else if(membershipType==M_TYPE_Admin){
      withdrawalFee= 0;//Admin Fee
    }


    //-----------------------------------------------------Functions if wallet is connected-----------------------------------------------------
      //Withdraw amount text box key in event
      withdrawAmount.addEventListener("keyup",()=>{
          
        const _withdrawAmountVal = withdrawAmount.value;          
        _withdrawfee.innerHTML =  (withdrawalFee * _withdrawAmountVal)/(100);//Member Fee
              
      });

      //Withdrawal function
      
          submitWithdraw.addEventListener("click", async () => {
            
            submitWithdraw.disabled =true;
            const withdrawAmount_ = withdrawAmount.value;

            var result;
            try{

              if(withdrawAmount_ == "" || withdrawAmount_ <=0){              
                messageBox.innerHTML =getErrorMessageContent("Please Enter Amount above 0");              
                return;
              }

              if(withdrawableAmount <=0){
                messageBox.innerHTML =getErrorMessageContent("Insufficient balance in withdrawable rewards "+withdrawAmount_);                            
                return;
              }

              if(Number(withdrawAmount_) > withdrawableAmount){
                messageBox.innerHTML =getErrorMessageContent("Enter withdraw amount less than "+withdrawableAmount+" DMTK");                
                return;
              }

              submitWithdraw.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Please Wait`
              submitWithdraw.disabled =true;
              result = await writeContract({
                address: DM_MANAGER_ADDRESS,
                abi: DM_MANAGER_ABI,
                functionName: 'withdraw',
                args: [utils.parseUnits(String(withdrawAmount_), 18)],
            });
            }catch(e){
              messageBox.innerHTML =getErrorMessageContent(" Unable to process withdraw request for "+withdrawAmount_+" DMTK <br> ErrorMessage: "+e);
              submitWithdraw.innerHTML = `Withdraw Rewards`              
              console.log(e);            
            }finally{
              submitWithdraw.disabled =false;
            }
            
            const resultTr = await waitForTransaction({hash: result.hash,})

              if(resultTr.status=='success'){
                messageBox.innerHTML =getInfoMessageandTxn("Withdraw successfull for amount: "+withdrawAmount_,result.hash);                
                submitWithdraw.disabled =true;
                submitWithdraw.innerHTML = `Withdraw`              
                return;
              }else{
                submitWithdraw.innerHTML = `Withdraw`
                submitWithdraw.disabled =false;
                console.log("failed",resultTr)
              }
            
          });

      //----------


  }else{
    // Message to retry connecting wallet again
  }

}else{

  //Message to connect wallet

}



actionsselect.addEventListener("change", function() {

  //alert("Member Type: "+memberType);
  const selectedActionValue = actionsselect.value;
  messageBox.innerHTML="";
  actionTab=selectedActionValue;


  if (selectedActionValue == "MI") {
    myInvContainer.style.display ="block";    
    myWithdrawContainer.style.display ="none";    
    
  }else if (selectedActionValue == "W") {
      
    myInvContainer.style.display ="none";    
    myWithdrawContainer.style.display ="block"; 
  
  }else{
    myInvContainer.style.display ="none";    
    myWithdrawContainer.style.display ="none"; 
  }

});


const walletidCopybutton = document.getElementById("walletidCopybutton");
const textToCopyValue = document.getElementById("walletid").value;
walletidCopybutton.addEventListener("click", () => {
      copyToClipboard(textToCopyValue);
});



