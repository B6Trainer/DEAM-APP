   
    

    import stakeABi from "./ABI_STAKE.json";
    import { utils } from "ethers";
    import {readContracts,watchAccount} from "@wagmi/core";
    import ethereumClient from "./walletConnect";
    import ABI_SUB from "./ABI_SUBSCRIPTION.json";
    import { stakingAddress,TOKEN_PRICE,getShareData,tokenAddress,subscriptionAddress } from "./config";
  


    const TotalEarning = document.getElementById("total-earning");
    const TotalEarningUSDT  = document.getElementById("total-earning-usdt");
    const DirectReferrals  = document.getElementById("direct-referrals");
    const IndirectReferrals  = document.getElementById("indirect-referrals");
    const referredBy  = document.getElementById("referredBy");
    const yourAccount  = document.getElementById("your-account");
    const referralsContainer  = document.getElementById("referrals-container");
    const sharebtn  = document.getElementById("share");
    const subscriberAvailable  = document.getElementById("subscriberAvailable");
    const notsubscriberAvailable  = document.getElementById("notsubscriberAvailable");


      // sharebtn.addEventListener("click", async () => {
      //   const shareData =getShareData(ethereumClient.getAccount().address);
      //     try {
      //       await navigator.share(shareData);
      //      console.log("success")
      //     } catch (err) {
      //       console.log(err)
      //     }
      //   });



      var connected = ethereumClient.getAccount().isConnected;

      if(!connected){
       document.getElementById("subscriberAvailable").style.display = "none";
       document.getElementById("notsubscriberAvailable").innerHTML = "Connect Wallet"
       
      }
      

    
    const subcriptionContract = {
        address: subscriptionAddress,
        abi: ABI_SUB,
    }
    
    const AccountData = await readContracts({
        contracts: [
          {
            ...subcriptionContract,
            functionName: 'getSubscriptionDetails',
            args:[ethereumClient.getAccount().address]
          }
        ],
      });
      console.log(AccountData);
    referredBy.innerHTML = `<a class= "no-decoration" href="referrals.html?address=${AccountData[0].result[5]}">${maskWalletAddress(String(AccountData[0].result[5]))} <i class="fa-solid fa-arrow-up-right-from-square"></i> </a><input type="hidden" value="${AccountData[0].result[5]}" id="referrerId"><i onclick="copyToClipboard('referrerId')" class="fa-solid fa-copy float-right"></i>`;
    yourAccount.innerHTML = `${maskWalletAddress(ethereumClient.getAccount().address)} <input type="hidden" value="${ethereumClient.getAccount().address}" id="yourAddressCopy"><i onclick="copyToClipboard('yourAddressCopy')" class="fa-solid fa-copy float-right"></i>`;
    //   TotalEarning.innerHTML = Number(utils.formatEther(AccountData[0].result)).toFixed(2);
    //   TotalEarningUSDT.innerHTML = Number((Number(utils.formatEther(AccountData[0].result))*TOKEN_PRICE)).toFixed(2);
    //   DirectReferrals.innerHTML = AccountData[1].result;
    //   IndirectReferrals.innerHTML = AccountData[2].result;

    //   if(AccountData[3].result == '0x0000000000000000000000000000000000000000'){
    //     referredBy.innerHTML = 'Not A Member'
    //     yourAccount.innerHTML = `${maskWalletAddress(ethereumClient.getAccount().address)} <input type="hidden" value="${ethereumClient.getAccount().address}" id="yourAddressCopy"><i onclick="copyToClipboard('yourAddressCopy')" class="fa-solid fa-copy float-right"></i>`;
    //     referralsContainer.insertAdjacentHTML("beforeend",(`<h5 style="color:#3396FF" class="text-center">No Referrals</h5>`));
    //   }else{
    //   referredBy.innerHTML = `<a class= "no-decoration" href="referrals.html?address=${AccountData[3].result}">${maskWalletAddress(String(AccountData[3].result))} <i class="fa-solid fa-arrow-up-right-from-square"></i> </a><input type="hidden" value="${AccountData[3].result}" id="referrerId"><i onclick="copyToClipboard('referrerId')" class="fa-solid fa-copy float-right"></i>`;
    //   yourAccount.innerHTML = `${maskWalletAddress(ethereumClient.getAccount().address)} <input type="hidden" value="${ethereumClient.getAccount().address}" id="yourAddressCopy"><i onclick="copyToClipboard('yourAddressCopy')" class="fa-solid fa-copy float-right"></i>`;
    //   if(AccountData[4].result.length>0){
    //   for(var i=0;i<AccountData[4].result.length;i++){
    //   var htmlContent =   `<div class="referrer text-center">
    //     <a href="referrals.html?address=${AccountData[4].result[i]}" class="no-decoration">${maskWalletAddress(AccountData[4].result[i])}</span> <i class="fa-solid fa-arrow-up-right-from-square"></i></a><input type="hidden" value="${AccountData[4].result[i]}" id="copybutton${i}"><i onclick="copyToClipboard('copybutton${i}')" class="fa-solid fa-copy float-right"></i>
    //     </div>`
    //     referralsContainer.insertAdjacentHTML("beforeend",(htmlContent));
    //   }
    // }else{
    //   referralsContainer.insertAdjacentHTML("beforeend",(`<h5 style="color:#3396FF" class="text-center">No Referrals</h5>
      
    //   `));
    // }

    // }

    var referrals;
if(AccountData[0].status =="failure" || AccountData[0].result[6]=="0x0000000000000000000000000000000000000000"){
  referrals=[];
  subscriberAvailable.style.display ="none";
  notsubscriberAvailable.style.display ="block";
}else{
  subscriberAvailable.style.display ="block";
  notsubscriberAvailable.style.display ="none";
  referrals = AccountData[0].result[4];
  if(referrals.length>0){
    for(var i=0;i<referrals.length;i++){
      var htmlContent =   `<div class="referrer text-center">
        <a href="referrals.html?address=${referrals[i]}" class="no-decoration">${maskWalletAddress(referrals[i])}</span> <i class="fa-solid fa-arrow-up-right-from-square"></i></a><input type="hidden" value="${referrals[i]}" id="copybutton${i}"><i onclick="copyToClipboard('copybutton${i}')" class="fa-solid fa-copy float-right"></i>
        </div>`
        referralsContainer.insertAdjacentHTML("beforeend",(htmlContent));
    }
  }else{
      referralsContainer.insertAdjacentHTML("beforeend",(`<h5 style="color:var(--primary-color);" class="text-center">No Referrals</h5>
      
`));
  }

}




      function maskWalletAddress(walletAddress) {
        if (typeof walletAddress !== 'string') {
          throw new Error('Input must be a string representing the wallet address');
        }
      
        if (walletAddress.length < 10) {
          throw new Error('Wallet address must have at least 10 characters');
        }
      
        const firstFive = walletAddress.slice(0, 5);
        const lastFive = walletAddress.slice(-5);
        const middleAsterisks = "*******";
      
        return `${firstFive}${middleAsterisks}${lastFive}`;
      }
      