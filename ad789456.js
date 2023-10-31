import {waitForTransaction, writeContract,readContracts} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';
import { usdtAddress,tokenAddress,subscriptionAddress } from './config';
import ERC20_ABI from './ABI_ERC20.json'
import ABI_DMTK from './ABI_DMTK.json'
import subscriptionABI from './ABI_SUBSCRIPTION.json';

const addmembererrorx = document.getElementById("addmembererrorx");

 const dmtkContract = {
    address: tokenAddress,
    abi: ABI_DMTK,
    }
    
    
    // Load the header, body, and footer from their respective HTML files
    fetch('adheader.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
        });

 


const AdminWallets = await readContracts({
    contracts: [
    {
        ...dmtkContract,
        functionName: 'communityPoolWallet',
    },
    {
        ...dmtkContract,
        functionName: 'marketingWallet',
    },
    {
        ...dmtkContract,
        functionName: 'technologyWallet',
    },
    {
        ...dmtkContract,
        functionName: 'transactionPoolWallet',
    },
    {
        ...dmtkContract,
        functionName: 'foundersWallet',
    },
    {
        ...dmtkContract,
        functionName: 'conversionFeeWallet',
    },
    {
        ...dmtkContract,
        functionName: 'owner',
    },
    {
        ...dmtkContract,
        functionName: 'lastCommunityDistributionTime',
    },
    {
        ...dmtkContract,
        functionName: 'communityDistributionFrequencyInDays',
    },
    {
        ...dmtkContract,
        functionName: 'totalCommunityDistribution',
    },
    {
        ...dmtkContract,
        functionName: 'conversionFeeMember',
    },
    {
        ...dmtkContract,
        functionName: 'conversionFeeMember',
    },
    {
        ...dmtkContract,
        functionName: 'transactionFee_communityPoolFeePercentage',
    },
    {
        ...dmtkContract,
        functionName: 'transactionFee_foundersFeePercentage',
    },
    {
        ...dmtkContract,
        functionName: 'minimumDepositForMembers',
    },
    {
        ...dmtkContract,
        functionName: 'minimumTopUpAmountMembers',
    },
    {
        ...dmtkContract,
        functionName: 'startIndexOfNextBatch',
    }
    ],
  });
  document.getElementById("startIndex").value = AdminWallets[16].result;
  document.getElementById("startIndex").disabled = true;
  if(AdminWallets[6].result != ethereumClient.getAccount().address){
    document.getElementById("adminaddress").innerHTML = "Unauthorized!! You are not an admin!"
    document.getElementById("adminaddress").style.color="red";
  }else{
    document.getElementById("adminaddress").innerHTML = "Welcome admin!"
  }
  
  var name = ["communityPoolWallet","marketingWallet","technologyWallet","transactionPoolWallet","foundersWallet","conversionFeeWallet"]
  var table = document.getElementById("myTable");
  var tbody = document.getElementById("myTableBody");
  var args=[AdminWallets[0].result,AdminWallets[1].result,AdminWallets[2].result,AdminWallets[3].result,AdminWallets[4].result,AdminWallets[5].result]
for(var i=0;i<6;i++){
    var newRow = table.insertRow(tbody.rows.length); 
    var cell1 = newRow.insertCell(0); 
    var cell2 = newRow.insertCell(1); 
    var cell3 = newRow.insertCell(2); 
    var cell4 = newRow.insertCell(3); 
    cell1.innerHTML = name[i];
    cell2.innerHTML = AdminWallets[i].result;

// Create a new input element
    var inputElement = document.createElement("input");
    inputElement.setAttribute("type", "text"); // Set the input type (e.g., text, number, etc.)
    inputElement.setAttribute("id", `input${i}`); // Set an ID for the input element
    inputElement.setAttribute("placeholder", "Enter New Address");
    cell3.appendChild(inputElement);


    // Create a button element and add a click event listener
    var button = document.createElement("button");
    button.innerHTML = "Change";
    button.id = i;
    button.addEventListener("click", async function() {
       var value =  document.getElementById(`input${this.id}`).value;
       args[this.id] = value;
       try{
        var result = await writeContract({
            address: tokenAddress,
            abi: ABI_DMTK,
            functionName: `updateAdminWalletAddresses`,
            args: args,
        });
        var tr = await waitForTransaction({
            hash: result.hash,
          })
          if(tr.status=='success'){
            alert("success");
          }else{
            alert("Error");
          }
    }catch(e){
        alert(e);
    }
    });
    // Append the button to the third cell
    cell4.appendChild(button);

}


var lastDistributeTime = document.getElementById("lastDistributeTime");
    lastDistributeTime.innerHTML = `Last Distribution Time : ${new Date(Number(AdminWallets[7].result)*1000)}`;

var currentfrequency = document.getElementById("currentfrequency");
currentfrequency.innerHTML  = `Current Value : ${AdminWallets[8].result} seconds (${(Number(AdminWallets[8].result)/86400).toFixed(2)} Days)`
var changeFrequency = document.getElementById("changeFrequency");
changeFrequency.addEventListener("click", async function() {
var newFrequency = document.getElementById("newfrequency").value;
    try{
        var result = await writeContract({
            address: tokenAddress,
            abi: ABI_DMTK,
            functionName: `setCommunityDistributionFrequencyInDays`,
            args: newFrequency,
        });
        var tr = await waitForTransaction({
            hash: result.hash,
          })
          if(tr.status=='success'){
            alert("success");
          }else{
            alert("Error");
          }
    }catch(e){
        alert(e);
    }
});
var distributeButton = document.getElementById("distributeButton")
distributeButton.addEventListener("click", async function() {
var startIndex = document.getElementById("startIndex").value
var lastIndex = document.getElementById("lastIndex").value
    try{
        var result = await writeContract({
            address: tokenAddress,
            abi: ABI_DMTK,
            functionName: `DistributeCommunityPool`,
            args: [startIndex,lastIndex],
        });
        var tr = await waitForTransaction({
            hash: result.hash,
          })
          if(tr.status=='success'){
            alert("success");
          }else{
            alert("Error");
          }
    }catch(e){
        alert(e);
    }
})

document.getElementById("totalTillDate").innerHTML =`Total Token Distributed till Date : ${(Number(AdminWallets[9].result)/Math.pow(10,18)).toFixed(2)} DMTK`


var currentConversionFeeMembers = document.getElementById("currentConversionFeeMembers");
var changeCoversionFeeMembers = document.getElementById("changeCoversionFeeMembers");
currentConversionFeeMembers.innerHTML = `Current Conversion Fee : ${Number(AdminWallets[10].result)/10000}%`;

changeCoversionFeeMembers.addEventListener("click", async function() {
    var newConversionFeeMembers = document.getElementById("newConversionFeeMembers").value;
    if(newConversionFeeMembers==""){
        alert("Enter new Fee")
        return;
    }
    try{
        var result = await writeContract({
            address: tokenAddress,
            abi: ABI_DMTK,
            functionName: `setConversionFee_member`,
            args: [newConversionFeeMembers],
        });
        var tr = await waitForTransaction({
            hash: result.hash,
          })
          if(tr.status=='success'){
            alert("success");
          }else{
            alert("Error");
          }
    }catch(e){
        alert(e);
    }
})






// var currentConversionFeePromotor = document.getElementById("currentConversionFeePromotor");
// var changeCoversionFeePromotor = document.getElementById("changeCoversionFeePromotor");
// currentConversionFeePromotor.innerHTML = `Current Conversion Fee : ${Number(AdminWallets[11].result)}%`;

// changeCoversionFeePromotor.addEventListener("click", async function() {
//     var newConversionFeePromotor = document.getElementById("newConversionFeePromotor").value;
//     if(newConversionFeePromotor==""){
//         alert("Enter new Fee")
//         return;
//     }
//     try{
//         var result = await writeContract({
//             address: tokenAddress,
//             abi: ABI_DMTK,
//             functionName: `setConversionFee_promotor`,
//             args: [newConversionFeePromotor],
//         });
//         var tr = await waitForTransaction({
//             hash: result.hash,
//           })
//           if(tr.status=='success'){
//             alert("success");
//           }else{
//             alert("Error");
//           }
//     }catch(e){
//         alert(e);
//     }
// })





var currentTransactionFeeComm = document.getElementById("currentTransactionFeeComm");
var currentTransactionFeeFounder = document.getElementById("currentTransactionFeeFounder");
var changeTransactionFee = document.getElementById("changeTransactionFee");


currentTransactionFeeComm.innerHTML = `Community Pool : ${Number(AdminWallets[12].result)}%`;
currentTransactionFeeFounder.innerHTML = `Founders Wallet : ${Number(AdminWallets[13].result)}%`;

changeTransactionFee.addEventListener("click", async function() {
    var newTransactionFeeComm = document.getElementById("newTransactionFeeComm").value;
    var newTransactionFeeFounder = document.getElementById("newTransactionFeeFounder").value;
    if(newTransactionFeeComm=="" || newTransactionFeeFounder==""){
        alert("Enter new Fee")
        return;
    }
    try{
        var result = await writeContract({
            address: tokenAddress,
            abi: ABI_DMTK,
            functionName: `setTransactionFees`,
            args: [newTransactionFeeComm,newTransactionFeeFounder],
        });
        var tr = await waitForTransaction({
            hash: result.hash,
          })
          if(tr.status=='success'){
            alert("success");
          }else{
            alert("Error");
          }
    }catch(e){
        alert(e);
    }
})





var currentMinDepositMembers = document.getElementById("currentMinDepositMembers");
var changeMinimumDepositMembers = document.getElementById("changeMinimumDepositMembers");
currentMinDepositMembers.innerHTML = `Member's Joining min fee- Current value: ${Number(AdminWallets[14].result)/Math.pow(10,18)} USDT`;

changeMinimumDepositMembers.addEventListener("click", async function() {
    var newMinimumDepositMembers= document.getElementById("newMinimumDepositMembers").value;
    if(newMinimumDepositMembers==""){
        alert("Enter new Minimum joining fee for Members")
        return;
    }
    try{
        var result = await writeContract({
            address: tokenAddress,
            abi: ABI_DMTK,
            functionName: `updateMinimumDepositMembers`,
            args: [Number(newMinimumDepositMembers)*Math.pow(10,18)],
        });
        var tr = await waitForTransaction({
            hash: result.hash,
          })
          if(tr.status=='success'){
            alert("success");
          }else{
            alert("Error");
          }
    }catch(e){
        alert(e);
    }
})




var currentTopUpMembers = document.getElementById("currentTopUpMembers");
var changeTopUpMembers = document.getElementById("changeTopUpMembers");
currentTopUpMembers.innerHTML = `Member's topup min fee- Current value:  ${Number(AdminWallets[15].result)/Math.pow(10,18)} USDT`;

changeTopUpMembers.addEventListener("click", async function() {
    var newTopUpMembers= document.getElementById("newTopUpMembers").value;
    if(newTopUpMembers==""){
        alert("Enter new minimum topup fee")
        return;
    }
    try{
        var result = await writeContract({
            address: tokenAddress,
            abi: ABI_DMTK,
            functionName: `updateMinimumTopUpAmountMembers`,
            args: [Number(newTopUpMembers)*Math.pow(10,18)],
        });
        var tr = await waitForTransaction({
            hash: result.hash,
          })
          if(tr.status=='success'){
            alert("success");
          }else{
            alert("Error");
          }
    }catch(e){
        alert(e);
    }
})



var addFreeMember = document.getElementById("addFreeMember");
addFreeMember.addEventListener("click", async function() {
    var name= document.getElementById("name__").value;
    var mobile= document.getElementById("mobile__").value;
    var email= document.getElementById("email__").value;
    var referrer= document.getElementById("referrer__").value;
    var memberAddress= document.getElementById("memberAddress__").value;

    if(!name || !mobile || !referrer || !email || !memberAddress){
        addmembererrorx.innerHTML = "Please fill all the mandatory fields";
        return;
    }

    try{
        var result = await writeContract({
            address: tokenAddress,
            abi: ABI_DMTK,
            functionName: `addAMemberFree`,
            args: [memberAddress,0,referrer,email,mobile,name],
        });
        var tr = await waitForTransaction({
            hash: result.hash,
          })
          if(tr.status=='success'){
            alert("success");
          }else{
            alert("Error");
          }
    }catch(e){
        alert(e);
    }
})

document.getElementById("footer-menu").innerHTML = "";
