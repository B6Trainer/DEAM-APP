    import {readContracts,watchAccount} from "@wagmi/core";
    import ethereumClient from "./walletConnect";
    import {utils} from 'ethers';
    import { maskWalletAddress } from "./dm_utils";  
    import { DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,DM_MEMBERSHIP_ADDRESS,DM_TXN_ADDRESS} from './config';
    import DM_CONFIG_ABI from './ABI_DM_CONFIG.json';
    import DM_MANAGER_ABI from './ABI_DM_MANAGER.json';    
    import DM_TOKEN_ABI from './ABI_DM_TOKEN.json';
    import DM_MEMBERSHIP_ABI from './ABI_DM_MEMBERSHIP.json';
    import DM_TXN_ABI from './ABI_DM_TXN.json';
    import {membershipType,walletAddress,generateBodyContent} from './common';
    
    const myAccount  = document.getElementById("myWalletid");
    const referralsContainer  = document.getElementById("referrals-container");
    const subscriberAvailable  = document.getElementById("subscriberAvailable");
    const notsubscriberAvailable  = document.getElementById("notsubscriberAvailable");

  
      

    if(generateBodyContent){

      subscriberAvailable.style.display = "block";
      notsubscriberAvailable.style.display = "none";

      myAccount.innerHTML = `${maskWalletAddress(walletAddress)} 
      <input type="hidden" value="${walletAddress}" id="myAddressCopy">
      <i onclick="copyToClipboard('myAddressCopy')" class="fa-solid fa-copy float-right"></i>`;
        
        //New Contracts
        const dmTXNContract = {
          address: DM_TXN_ADDRESS,
          abi: DM_TXN_ABI,
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
        const ContractResponseData = await readContracts({
          contracts: [
            {
              ...dmTXNContract,
              functionName: 'getSponsorLevelrewards',
              args:[walletAddress]
            }
        
            ],
          });
  
      

      

      var referrals;
      if(ContractResponseData[0].status =="failure" || ContractResponseData[0].result[6]=="0x0000000000000000000000000000000000000000"){
        referrals=[];
        subscriberAvailable.style.display ="none";
        notsubscriberAvailable.innerHTML = "Unable to fetch data from contract"
        notsubscriberAvailable.style.display ="block";
        console.log(ContractResponseData[0].error.message);

      }else{
    
        subscriberAvailable.style.display ="block";
        referralsContainer.style.display ="block";

            var memAddressArr=ContractResponseData[0].result[0];
            var levelRewardsArr=ContractResponseData[0].result[1];
            var levelArr=ContractResponseData[0].result[2];

            var txndetails1element=document.getElementById("txndetailstable");
            var arrLength= memAddressArr.length;
            var txnTableheaders = [ "Level", "Member Wallet Address","Rewards generated"]; // Profile header values
            
            var table = document.createElement('table');                                   
            
            // Create header row              
            var headerRow1 = table.insertRow();
            for (var i = 0; i < txnTableheaders.length; i++) {
                var th = document.createElement('th');
                th.textContent = txnTableheaders[i];
                headerRow1.appendChild(th);
             }

            if(arrLength >0){

              // Create body rows
              for ( let i = 0; i < arrLength; i++) {
                var row = table.insertRow();

                var txnLevelcell = row.insertCell(0); 
                var txnWalletAddresscell = row.insertCell(1); 
                var txnLevelRewardscell = row.insertCell(2); 

                txnLevelcell.textContent = levelArr[i];
                txnWalletAddresscell.textContent = maskWalletAddress(memAddressArr[i]);              
                txnLevelRewardscell.textContent = Number(utils.formatEther(levelRewardsArr[i])).toFixed(2);
                
              }

             }
            else{
              txndetails1element.innerHTML="No rewards available for Sponsor: "+walletAddress;
            }
            

            txndetails1element.appendChild(table);
  
      }
  
 

      }//End of body generate block
      
       