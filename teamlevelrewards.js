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
    import {membershipType,walletAddress,wconnected} from './common';
    

    const TotalEarning = document.getElementById("total-earning");
    const TotalEarningUSDT  = document.getElementById("total-earning-usdt");
    const DirectReferrals  = document.getElementById("direct-referrals");
    const IndirectReferrals  = document.getElementById("indirect-referrals");
    
    const myAccount  = document.getElementById("myWalletid");
    const referralsContainer  = document.getElementById("referrals-container");
    const sharebtn  = document.getElementById("share");
    const subscriberAvailable  = document.getElementById("subscriberAvailable");
    const notsubscriberAvailable  = document.getElementById("notsubscriberAvailable");

  
      

    if(!wconnected){

        messagex.innerHTML=getErrorMessageContent("Please connect your wallet");
        
        walletconnectBtn.style.display="block";
        subscriberAvailable.style.display = "none";
        notsubscriberAvailable.innerHTML = "Connect Wallet"
    
    }else{


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
  
      console.log(ContractResponseData);

      

      var referrals;
      if(ContractResponseData[0].status =="failure" || ContractResponseData[0].result[6]=="0x0000000000000000000000000000000000000000"){
        referrals=[];
        subscriberAvailable.style.display ="none";
        notsubscriberAvailable.innerHTML = "Unable to fetch data from contract"
        notsubscriberAvailable.style.display ="block";

      }else{
    
        subscriberAvailable.style.display ="block";
        referralsContainer.style.display ="block";

            var memAddressArr=ContractResponseData[0].result[0];
            var levelRewardsArr=ContractResponseData[0].result[1];
            var levelArr=ContractResponseData[0].result[2];

            var arrLength= memAddressArr.length;
            console.log("Array length "+arrLength);

            var txntable = document.getElementById("txnTable");
            var txnHeader = document.getElementById("txnTableHeader");
            var txnbody = document.getElementById("txnTableBody");
            
            var txnTableheaders = [ "Level", "Member Wallet Address","Rewards generated"]; // Profile header values
            
            var headerRow=txnHeader.insertRow(0);

            for (var i = 0; i < txnTableheaders.length; i++) {
              var headerCell = document.createElement("th");
              var text = document.createTextNode(txnTableheaders[i]);
              headerCell.appendChild(text);
              headerRow.appendChild(headerCell);
            }

            for ( let i = 0; i < arrLength; i++) {
                
              console.log(" Member Address "+memAddressArr[i]+" Level:"+levelArr[i]+" Level Reward:"+levelRewardsArr[i]);
      
              var newRow = txntable.insertRow(txnbody.rows.length); 
              
              var txnLevelcell = newRow.insertCell(0); 
              var txnWalletAddresscell = newRow.insertCell(1); 
              var txnLevelRewardscell = newRow.insertCell(2); 

              txnLevelcell.innerHTML = levelArr[i];
              txnWalletAddresscell.innerHTML = maskWalletAddress(memAddressArr[i]);              
              txnLevelRewardscell.innerHTML = Number(utils.formatEther(levelRewardsArr[i])).toFixed(2);
          
          }
        
  
      }
  
  




      }//End of Connected else block
      
       