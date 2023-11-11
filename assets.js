import {readContract,readContracts} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';
import { usdtAddress,tokenAddress,subscriptionAddress } from './config';
import ERC20_ABI from './ABI_ERC20.json'
import ABI_DMTK from './ABI_DMTK.json'
import stakeABI from './ABI_STAKE.json';
import subscriptionABI from './ABI_SUBSCRIPTION.json';
import QRCode from 'qrcode'

import { DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,DM_MEMBERSHIP_ADDRESS } from './config';
import DM_CONFIG_ABI from './ABI_DM_CONFIG.json';
import DM_MANAGER_ABI from './ABI_DM_MANAGER.json';
import DM_CPDISTRIBUTOR_ABI from './ABI_DM_CPDISTRIBUTOR.json';
import DM_TOKEN_ABI from './ABI_DM_TOKEN.json';
import DM_MEMBERSHIP_ABI from './ABI_DM_MEMBERSHIP.json';

const DFN_BAL = document.getElementById("swap_dfn_balance");
const USDTBAL = document.getElementById("swap_usdt_balance");
const TotalStakes = document.getElementById("total_stakes");
const RealtimeRewards = document.getElementById("realtimeReward");
const referralRewards = document.getElementById("referralRewards");
const totalRewards = document.getElementById("totalRewards");
const rewardsWithdrawn = document.getElementById("rewardsWithdrawn");
const AvailableRewards= document.getElementById("availableRewards");
// const receivebtn= document.getElementById("receivebtn");
const qrcode__= document.getElementById("qrcode");


   
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
    ],
  });

//console.log(AccountData[2])

if(AccountData[0].status =="success"){  
  DFN_BAL.innerHTML = Number(utils.formatEther(AccountData[0].result)).toFixed(2);
  AvailableRewards.innerHTML = Number(utils.formatEther(AccountData[0].result)).toFixed(2);
}else{
  console.log("No data on DMTK Balance of operation. Status: "+AccountData[0].status);
}

if(AccountData[1].status =="success"){  
  USDTBAL.innerHTML =Number(utils.formatEther(AccountData[1].result)).toFixed(2);
}else{
  console.log("No data on USDT Balance of operation. Status: "+AccountData[1].status);
}

if(AccountData[2].status =="success"){  
  TotalStakes.innerHTML = Number(utils.formatEther(AccountData[2].result[1])).toFixed(2);
  RealtimeRewards.innerHTML = Number(utils.formatEther(String(AccountData[2].result[2]))).toFixed(2); 
}else{
  console.log("No data on Subscription operation. Status: "+AccountData[2].status);
}






// receivebtn.addEventListener("click", async () => {
//   var opts = {
//     type: 'image/webp',
//     quality: 1,
//     margin: 1,
//   }
//         try {
//          var data_ =  await QRCode.toDataURL(ethereumClient.getAccount().address,opts);
//          console.log(data_);
//          var data = `
//          <img style="margin-bottom: 10px;border:1px solid black" width="70%" src="data: ${data_}">
//         <p class="alert alert-primary" style="word-wrap:break-word;padding:10px;width: 100%;"> ${ethereumClient.getAccount().address}<input type="hidden" value="${ethereumClient.getAccount().address}" id="yourAddressCopy"><i onclick="copyToClipboard('yourAddressCopy')" class="fa-solid fa-copy float-right"></i></p>
//          <p class="alert alert-danger">Note: Send Only BEP20 USDT or DMTK only to this address</p>
//          `
//          qrcode__.innerHTML = data;
//         } catch (err) {
//           console.error(err)
//         }
      
// });



