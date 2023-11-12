import {waitForTransaction, writeContract,readContracts} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';
import { DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,DM_MEMBERSHIP_ADDRESS } from './config';
import DM_CONFIG_ABI from './ABI_DM_CONFIG.json';
import DM_MANAGER_ABI from './ABI_DM_MANAGER.json';
import DM_CPDISTRIBUTOR_ABI from './ABI_DM_CPDISTRIBUTOR.json';
import DM_TOKEN_ABI from './ABI_DM_TOKEN.json';
import DM_MEMBERSHIP_ABI from './ABI_DM_MEMBERSHIP.json';

const addmembererrorx = document.getElementById("addmembererrorx");


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
    // Load the header, body, and footer from their respective HTML files
    fetch('adheader.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
        });

/*
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
*/


const AdminWallets = await readContracts({
    contracts: [
    {
        ...dmConfigContract,
        functionName: 'communityPoolWallet',
    },
    {
        ...dmConfigContract,
        functionName: 'marketingWallet',
    },
    {
        ...dmConfigContract,
        functionName: 'technologyWallet',
    },
    {
        ...dmConfigContract,
        functionName: 'transactionPoolWallet',
    },
    {
        ...dmConfigContract,
        functionName: 'foundersWallet',
    },
    {
        ...dmConfigContract,
        functionName: 'conversionFeeWallet',
    },
    {
        ...dmConfigContract,
        functionName: 'owner',
    },
    {
        ...dmCPdistributorContract,
        functionName: 'lastCommunityDistributionTime',
    },
    {
        ...dmCPdistributorContract,
        functionName: 'communityDistributionFrequencyInDays',
    },
    {
        ...dmCPdistributorContract,
        functionName: 'totalCommunityDistribution',
    },
    {
        ...dmConfigContract,
        functionName: 'conversionFeeMember',
    },
    {
        ...dmConfigContract,
        functionName: 'conversionFeePromoter',
    },
    {
        ...dmConfigContract,
        functionName: 'transactionFee_communityPoolFeePercentage',
    },
    {
        ...dmConfigContract,
        functionName: 'transactionFee_foundersFeePercentage',
    },
    {
        ...dmConfigContract,
        functionName: 'minimumDepositForMembers',
    },
    {
        ...dmConfigContract,
        functionName: 'minimumTopUpAmountMembers',
    },
    {
        ...dmCPdistributorContract,
        functionName: 'startIndexOfNextBatch',
    },
    {
        ...dmMembershipContract,
        functionName: 'getProfileDetails',
    }

    ],
  });


  document.getElementById("startIndex").value = AdminWallets[16].result;
  document.getElementById("startIndex").disabled = true;
  if(AdminWallets[6].result != ethereumClient.getAccount().address){
    document.getElementById("adminaddress").innerHTML = "Unauthorized!! You are not an admin! Your wallet id:  "+ethereumClient.getAccount().address
    document.getElementById("adminaddress").style.color="red";
  }else{
    document.getElementById("adminaddress").innerHTML = "Welcome admin! "+ethereumClient.getAccount().address
  }
  //--------------------------------------------------------------Admin Wallet details------------------------------------------------------------------------------------
  var walletnamearray = ["communityPoolWallet","marketingWallet","technologyWallet","transactionPoolWallet","foundersWallet","conversionFeeWallet"]
  var table = document.getElementById("myTable");
  var tbody = document.getElementById("myTableBody");
  var adminWalletAddArray=[AdminWallets[0].result,AdminWallets[1].result,AdminWallets[2].result,AdminWallets[3].result,AdminWallets[4].result,AdminWallets[5].result]
    for(var i=0;i<6;i++){
        var newRow = table.insertRow(tbody.rows.length); 
        var cell1 = newRow.insertCell(0); 
        var cell2 = newRow.insertCell(1); 
        var cell3 = newRow.insertCell(2); 
        var cell4 = newRow.insertCell(3); 
        cell1.innerHTML = walletnamearray[i];
        cell2.innerHTML = AdminWallets[i].result;

        //Create a new input element
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
            var newWalletAddressValue =  document.getElementById(`input${this.id}`).value;
            if(newWalletAddressValue != ''){
                adminWalletAddArray[this.id] = newWalletAddressValue;
                try{
                    var result = await writeContract({
                        address: DM_CONFIG_ADDRESS,
                        abi: DM_CONFIG_ABI,
                        functionName: `updateAdminWalletAddresses`,
                        args: adminWalletAddArray,
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
                    alert("Exception: "+e);
                }
            }else{
                alert("Error! Entered Admin Wallet address is empty: "+newWalletAddressValue);
            }
            
        });
        // Append the button to the third cell
        cell4.appendChild(button);

    }


  //--------------------------------------------------------------Profile details------------------------------------------------------------------------------------

  var profResultLoc=17;

  if(AdminWallets!=null || AdminWallets[profResultLoc]!=null){

    var profiletypeArr = AdminWallets[profResultLoc].result[0]; 
    var walletaddArr = AdminWallets[profResultLoc].result[1];     
    var nameArr = AdminWallets[profResultLoc].result[2]; 
    var emailArr = AdminWallets[profResultLoc].result[3]; 
    var phoneArr = AdminWallets[profResultLoc].result[4]; 
    var profilecount = AdminWallets[profResultLoc].result[5]; 
    var subsBalanceArr = AdminWallets[profResultLoc].result[6]; 
    var rewardsReceivedArr = AdminWallets[profResultLoc].result[7] ; 
    var sponsor = AdminWallets[profResultLoc].result[8]; 
  
    var profiletable = document.getElementById("profileTable");
    var profiletheader = document.getElementById("profileTableHeader");
    var profiletbody = document.getElementById("profileTableBody");
    
    var profileCountSpan = document.getElementById("profileCount");
    profileCountSpan.innerHTML = profilecount;


//--------------------------------------------------------------Contract balance section------------------------------------------------------------------------------------
    // Prepare the Contracts table header
    var contractstable = document.getElementById("contractsTable");
    var contractstheader = document.getElementById("contractsTableHeader");
    var contractstbody = document.getElementById("contractsTableBody");
    var contractsCountSpan = document.getElementById("contractsCount");
   
    var headerRow=contractstheader.insertRow(0);
    var contractsTableheaders = ["Contract Name","Contract Address", "USDT Balance", "DMTK Balance"]; // Contract balance header values

 
    for (var i = 0; i < contractsTableheaders.length; i++) {
        var headerCell = document.createElement("th");
        var text = document.createTextNode(contractsTableheaders[i]);
        headerCell.appendChild(text);
        headerRow.appendChild(headerCell);
    }

    var contractsNameList =["DM_MANAGER_ADDRESS"] ;
    var contractsList =[DM_MANAGER_ADDRESS] ;
    var contractscount =contractsList.length; 

    const ContractBalanceDetails = await readContracts({
        contracts: [
        {
            ...dmManagerContract,
            functionName: 'getContractBalance',
        },
        ],
    });
    
    console.log("Contract balance : ");
    console.log(ContractBalanceDetails);

    var dmMangerContractBalance;
    if(ContractBalanceDetails[0].status=="success"){
        dmMangerContractBalance =ContractBalanceDetails[0].result;
    }else{
        dmMangerContractBalance=[0,0];
    }
    console.log(dmMangerContractBalance);
    console.log(ContractBalanceDetails[0].result);
        
    var ContractBalances =[dmMangerContractBalance];
    //contractsCountSpan.innerHTML = contractscount+"";

    // Prepare the contracts table body
    for(var i=0;i<contractscount;i++){
          
          var newRow = contractstable.insertRow(contractstbody.rows.length); 
          
          var contractNameCell = newRow.insertCell(0); 
          var contractCell = newRow.insertCell(1); 
          var usdtBalanceCell = newRow.insertCell(2); 
          var dmtkBalanceCell = newRow.insertCell(3); 
          
        
          var contractBalance =ContractBalances[i];
  
          contractNameCell.innerHTML=contractsNameList[i];
          contractCell.innerHTML = contractsList[i];
          usdtBalanceCell.innerHTML = Number(utils.formatEther(contractBalance[0])).toFixed(2);
          dmtkBalanceCell.innerHTML = Number(utils.formatEther(contractBalance[1])).toFixed(2);
          
          //phonecell.innerHTML = phoneArr[i];
          //emailcell.innerHTML = emailArr[i];
          //subscell.innerHTML = Number(utils.formatEther(subsBalanceArr[i])).toFixed(2);;
          //rewardscell.innerHTML = Number(utils.formatEther(rewardsReceivedArr[i])).toFixed(2);
          //sponsorcell.innerHTML = sponsor[i];
    
    }

  

//--------------------------------------------------------------Profile section------------------------------------------------------------------------------------
    // Prepare the profile table header
    var headerRow=profiletheader.insertRow(0);
    var profileTableheaders = ["Wallet Address", "Profile type", "Name", "Phone", "Email","Subs Balance", "Rewards", "Sponsor"]; // Profile header values
 
    for (var i = 0; i < profileTableheaders.length; i++) {
        var headerCell = document.createElement("th");
        var text = document.createTextNode(profileTableheaders[i]);
        headerCell.appendChild(text);
        headerRow.appendChild(headerCell);
    }

    // Prepare the profile table body
    for(var i=0;i<profilecount;i++){
          
          var newRow = profiletable.insertRow(profiletbody.rows.length); 
          var walletaddcell = newRow.insertCell(0); 
          var profiletypecell = newRow.insertCell(1); 
          var namecell = newRow.insertCell(2); 
          var phonecell = newRow.insertCell(3); 
          var emailcell = newRow.insertCell(4);
          var subscell = newRow.insertCell(5);
          var rewardscell = newRow.insertCell(6);
          var sponsorcell = newRow.insertCell(7); 
  
          walletaddcell.innerHTML = walletaddArr[i];
          profiletypecell.innerHTML = profiletypeArr[i];
          namecell.innerHTML = nameArr[i];
          phonecell.innerHTML = phoneArr[i];
          emailcell.innerHTML = emailArr[i];
          subscell.innerHTML = Number(utils.formatEther(subsBalanceArr[i])).toFixed(2);;
          rewardscell.innerHTML = Number(utils.formatEther(rewardsReceivedArr[i])).toFixed(2);
          sponsorcell.innerHTML = sponsor[i];
    
    }

  }

//--------------------------------------------------------------Distribution logic------------------------------------------------------------------------------------

var lastDistributeTime = document.getElementById("lastDistributeTime");
    lastDistributeTime.innerHTML = `Last Distribution Time : ${new Date(Number(AdminWallets[7].result)*1000)}`;

var currentfrequency = document.getElementById("currentfrequency");
currentfrequency.innerHTML  = `Current Value : ${AdminWallets[8].result} seconds (${(Number(AdminWallets[8].result)/86400).toFixed(2)} Days)`
var changeFrequency = document.getElementById("changeFrequency");
changeFrequency.addEventListener("click", async function() {
var newFrequency = document.getElementById("newfrequency").value;
    try{
        var result = await writeContract({
            address: DM_CPDISTRIBUTOR_ADDRESS,
            abi: DM_CPDISTRIBUTOR_ABI,
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
            address: DM_CPDISTRIBUTOR_ADDRESS,
            abi: DM_CPDISTRIBUTOR_ABI,
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
currentConversionFeeMembers.innerHTML = `Current Member Fee : ${Number(AdminWallets[10].result)/10000}%`;

var currentConversionFeePromoters = document.getElementById("currentConversionFeePromoters");
var changeCoversionFeePromoters = document.getElementById("changeCoversionFeePromoters");
currentConversionFeePromoters.innerHTML = `Current Promoter Fee : ${Number(AdminWallets[11].result)/10000}%`;

changeCoversionFeeMembers.addEventListener("click", async function() {
    var newConversionFeeMembers = document.getElementById("newConversionFeeMembers").value;
    if(newConversionFeeMembers==""){
        alert("Enter the new Member Fee")
        return;
    }
    try{
        var result = await writeContract({
            address: DM_CONFIG_ADDRESS,
            abi: DM_CONFIG_ABI,
            functionName: `setConversionFee_member`,
            args: [newConversionFeeMembers],
        });
        var tr = await waitForTransaction({
            hash: result.hash,
          })
          if(tr.status=='success'){
            alert("Successfully updated the Member Conversion fee");
          }else{
            alert("Error!! Unable to update the Member Conversion fee");
          }
    }catch(e){
        alert(e);
    }
})

changeCoversionFeePromoters.addEventListener("click", async function() {
    var newConversionFeePromoters = document.getElementById("newConversionFeePromoters").value;
    if(newConversionFeePromoters==""){
        alert("Enter the new Promoter Fee")
        return;
    }
    try{
        var result = await writeContract({
            address: DM_CONFIG_ADDRESS,
            abi: DM_CONFIG_ABI,
            functionName: `setConversionFee_promoter`,
            args: [newConversionFeePromoters],
        });
        var tr = await waitForTransaction({
            hash: result.hash,
          })
          if(tr.status=='success'){
            alert("Successfully updated the Promoter Conversion fee");
          }else{
            alert("Error!! Unable to update the Promoter Conversion fee");
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
            address: DM_CONFIG_ADDRESS,
            abi: DM_CONFIG_ABI,
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
            address: DM_CONFIG_ADDRESS,
            abi: DM_CONFIG_ABI,
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
            address: DM_CONFIG_ADDRESS,
            abi: DM_CONFIG_ABI,
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
    //var referrer= document.getElementById("referrer__").value;
    var promoterAddress= document.getElementById("memberAddress__").value;

    if(!name || !mobile || !email || !promoterAddress){
        addmembererrorx.innerHTML = "Please fill all the mandatory fields";
        return;
    }

    try{
        var result = await writeContract({
            address: DM_MANAGER_ADDRESS,
            abi: DM_MANAGER_ABI,
            functionName: `addPromotor`,
            args: [promoterAddress,email,mobile,name],
        });
        var tr = await waitForTransaction({
            hash: result.hash,
          })
          if(tr.status=='success'){
            addmembererrorx.innerHTML = "New member added successfully : "+promoterAddress;
            alert("success");
          }else{
            addmembererrorx.innerHTML = "ERROR: while adding new member: "+promoterAddress;
            alert("Error");
          }
    }catch(e){
        addmembererrorx.innerHTML = "ERROR!! : while adding new member: "+promoterAddress;
        alert(e);
    }
})

document.getElementById("footer-menu").innerHTML = "";
