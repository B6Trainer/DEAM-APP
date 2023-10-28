
import stakeABi from "./ABI_STAKE.json";
import {readContracts} from "@wagmi/core";
import ethereumClient from "./walletConnect";
import { subscriptionAddress } from "./config";
import ABI_SUB from "./ABI_SUBSCRIPTION.json";

const yourAccount =  document.getElementById("your-account");
const parentAddress =  document.getElementById("parentAddress");
const referralsContainer =  document.getElementById("referralsContainer");
const urlParams = new URLSearchParams(window.location.search);
const addressValue = urlParams.get("address");


// address.innerHTML=maskWalletAddress(addressValue);
// parentAddress.value = addressValue;

 
const subcriptionContract = {
  address: subscriptionAddress,
  abi: ABI_SUB,
}

const AccountData = await readContracts({
  contracts: [
    {
      ...subcriptionContract,
      functionName: 'getSubscriptionDetails',
      args:[addressValue]
    }
  ],
});
var referrals;
if(AccountData[0].status =="failure"){
  referrals=[];
}else{
  referrals = AccountData[0].result[4];

yourAccount.innerHTML = `${maskWalletAddress(addressValue)} <input type="hidden" value="${addressValue}" id="yourAddressCopy"><i onclick="copyToClipboard('yourAddressCopy')" class="fa-solid fa-copy float-right"></i>`;

console.log(referrals)
if(referrals.length>0){
  for(var i=0;i<referrals.length;i++){
    var htmlContent =   `<div class="referrer text-center">
    <a href="referrals.html?address=${referrals[i]}" class="no-decoration">${maskWalletAddress(referrals[i])}</span> <i class="fa-solid fa-arrow-up-right-from-square"></i></a><input type="hidden" value="${referrals[i]}" id="copybutton${i}"><i onclick="copyToClipboard('copybutton${i}')" class="fa-solid fa-copy float-right"></i>
    </div>`
      referralsContainer.insertAdjacentHTML("beforeend",(htmlContent));
    }
}else{
    referralsContainer.insertAdjacentHTML("beforeend",(`<h3 class="text-center">No Referrals</h3>`));
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
  