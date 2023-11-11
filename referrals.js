import {readContracts} from "@wagmi/core";
import ethereumClient from "./walletConnect";
import { maskWalletAddress } from "./dm_utils";
import { DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,DM_MEMBERSHIP_ADDRESS } from './config';
import DM_CONFIG_ABI from './ABI_DM_CONFIG.json';
import DM_MANAGER_ABI from './ABI_DM_MANAGER.json';
import DM_TOKEN_ABI from './ABI_DM_TOKEN.json';
import DM_MEMBERSHIP_ABI from './ABI_DM_MEMBERSHIP.json';


const yourAccount =  document.getElementById("your-account");
const parentAddress =  document.getElementById("parentAddress");
const referralsContainer =  document.getElementById("referralsContainer");
const urlParams = new URLSearchParams(window.location.search);
const addressValue = urlParams.get("address");


var connected = ethereumClient.getAccount().isConnected;

if(!connected){
 document.getElementById("subscriberAvailable").style.display = "none";
 document.getElementById("notsubscriberAvailable").innerHTML = "Connect Wallet"
 
}else{
      //New Contracts
      const dmConfigContract = {
        address: DM_CONFIG_ADDRESS,
        abi: DM_CONFIG_ABI,
      }
  
      const dmManagerContract = {
        address: DM_MANAGER_ADDRESS,
        abi: DM_MANAGER_ABI,
      }
  
      const dmTokenContract = {
        address: DM_TOKEN_ADDRESS,
        abi: DM_TOKEN_ABI,
      }
      
      const dmMembershipContract = {
        address: DM_MEMBERSHIP_ADDRESS,
        abi: DM_MEMBERSHIP_ABI,
      }
  
      //Read data from contract
      const AccountData = await readContracts({
      contracts: [
        {
          ...dmMembershipContract,
          functionName: 'getSubscriptionDetails',
          args:[addressValue]
        }        

        ],
      });

      console.log(AccountData);

      
      var referrals;
      if(AccountData[0].status =="failure"){
        referrals=[];
      }else{
        referrals = AccountData[0].result[4];
      
        yourAccount.innerHTML = `${maskWalletAddress(addressValue)} 
                                  <input type="hidden" value="${addressValue}" id="yourAddressCopy">
                                  <i onclick="copyToClipboard('yourAddressCopy')" class="fa-solid fa-copy float-right"></i>`;
        
        console.log(referrals)
        if(referrals.length>0){
          for(var i=0;i<referrals.length;i++){
              var htmlContent =   
              `<div class="referrer text-center">
              <a href="referrals.html?address=${referrals[i]}" class="no-decoration">
                    ${maskWalletAddress(referrals[i])}
                    </span> <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
              <input type="hidden" value="${referrals[i]}" id="copybutton${i}">
              <i onclick="copyToClipboard('copybutton${i}')" class="fa-solid fa-copy float-right"></i>
              </div>`
              referralsContainer.insertAdjacentHTML("beforeend",(htmlContent));
          }
        }else{
            referralsContainer.insertAdjacentHTML("beforeend",(`<h3 class="text-center">No Referrals</h3>`));
        }
  }
  



}//End of Connected else block
      
 