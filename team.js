    import {readContracts,watchAccount} from "@wagmi/core";
    import ethereumClient from "./walletConnect";
    
    import { maskWalletAddress } from "./dm_utils";  
    import { DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,DM_MEMBERSHIP_ADDRESS } from './config';
    
    import {dmConfigContract,dmTXNContract,dmManagerContract,dmCPdistributorContract,
      dmTokenContract,dmMembershipContract,usdtContract} from './config'; 
    import { generateBodyContent,walletAddress,membershipType,welMess } from './common';  


    if(generateBodyContent){

      const mysponsor  = document.getElementById("referredBy");
      const yourAccount  = document.getElementById("your-account");
      const referralsContainer  = document.getElementById("referrals-container");
      const subscriberAvailable  = document.getElementById("subscriberAvailable");
      const notsubscriberAvailable  = document.getElementById("notsubscriberAvailable");


        //Read data from contract
        const AccountData = await readContracts({
          contracts: [
            {
              ...dmMembershipContract,
              functionName: 'getSubscriptionDetails',
              args:[ethereumClient.getAccount().address]
            },
            
            {
                ...dmTokenContract,
                functionName: 'balanceOf',
                args: [ethereumClient.getAccount().address],
            }
        
            ],
          });
  
      

      var referrals;
      if(AccountData[0].status =="failure" || AccountData[0].result[6]=="0x0000000000000000000000000000000000000000"){
        referrals=[];
        subscriberAvailable.style.display ="none";
        document.getElementById("notsubscriberAvailable").innerHTML = "Unable to fetch data from contract"
        notsubscriberAvailable.style.display ="block";

      }else{

        mysponsor.innerHTML = `<a class= "no-decoration" href="referrals.html?address=${AccountData[0].result[5]}">
                                ${maskWalletAddress(String(AccountData[0].result[5]))} 
                                <i class="fa-solid fa-arrow-up-right-from-square"></i> </a>
                                <input type="hidden" value="${AccountData[0].result[5]}" id="referrerId">
                                <i onclick="copyToClipboard('referrerId')" class="fa-solid fa-copy float-right"></i>`;
        yourAccount.innerHTML = `${maskWalletAddress(ethereumClient.getAccount().address)} 
                                  <input type="hidden" value="${ethereumClient.getAccount().address}" id="yourAddressCopy">
                                  <i onclick="copyToClipboard('yourAddressCopy')" class="fa-solid fa-copy float-right"></i>`;
     
    
        subscriberAvailable.style.display ="block";
        notsubscriberAvailable.style.display ="none";
        referrals = AccountData[0].result[4];
        if(referrals.length>0){
          for(var i=0;i<referrals.length;i++){
            var htmlContent =   `<div class="referrer text-center">
              <a href="referrals.html?address=${referrals[i]}" class="no-decoration">
              ${maskWalletAddress(referrals[i])}</span> <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
              <input type="hidden" value="${referrals[i]}" id="copybutton${i}">
                  <i onclick="copyToClipboard('copybutton${i}')" class="fa-solid fa-copy float-right"></i>
              </div>`
              referralsContainer.insertAdjacentHTML("beforeend",(htmlContent));
          }
        }else{
            referralsContainer.insertAdjacentHTML("beforeend",(`<h5 style="color:var(--primary-color);" class="text-center">No Referrals</h5> `));
        }
  
      }
  

    }//End of Connected block
      
       