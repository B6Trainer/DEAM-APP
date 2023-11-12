    import {readContracts,watchAccount} from "@wagmi/core";
    import ethereumClient from "./walletConnect";
    
    import { maskWalletAddress } from "./dm_utils";  
    import { DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,DM_MEMBERSHIP_ADDRESS } from './config';
    import DM_CONFIG_ABI from './ABI_DM_CONFIG.json';
    import DM_MANAGER_ABI from './ABI_DM_MANAGER.json';
    import DM_CPDISTRIBUTOR_ABI from './ABI_DM_CPDISTRIBUTOR.json';
    import DM_TOKEN_ABI from './ABI_DM_TOKEN.json';
    import DM_MEMBERSHIP_ABI from './ABI_DM_MEMBERSHIP.json';
    

    const TotalEarning = document.getElementById("total-earning");
    const TotalEarningUSDT  = document.getElementById("total-earning-usdt");
    const DirectReferrals  = document.getElementById("direct-referrals");
    const IndirectReferrals  = document.getElementById("indirect-referrals");
    const mysponsor  = document.getElementById("referredBy");
    const yourAccount  = document.getElementById("your-account");
    const referralsContainer  = document.getElementById("referrals-container");
    const sharebtn  = document.getElementById("share");
    const subscriberAvailable  = document.getElementById("subscriberAvailable");
    const notsubscriberAvailable  = document.getElementById("notsubscriberAvailable");


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
              args:[ethereumClient.getAccount().address]
            },
            
            {
                ...dmTokenContract,
                functionName: 'balanceOf',
                args: [ethereumClient.getAccount().address],
            }
        
            ],
          });
  
      console.log(AccountData);

      

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
  
  




      }//End of Connected else block
      
       