import {waitForTransaction, writeContract,readContracts,readContract} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';
import { DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,DM_MEMBERSHIP_ADDRESS, usdtAddress,DM_TXN_ADDRESS } from './config';
import DM_CONFIG_ABI from './ABI_DM_CONFIG.json';
import DM_MANAGER_ABI from './ABI_DM_MANAGER.json';
import DM_CPDISTRIBUTOR_ABI from './ABI_DM_CPDISTRIBUTOR.json';
import DM_TOKEN_ABI from './ABI_DM_TOKEN.json';
import DM_MEMBERSHIP_ABI from './ABI_DM_MEMBERSHIP.json';
import DM_TXN_ABI from './ABI_DM_TXN.json';
import ERC20_ABI from './ABI_ERC20.json'

import { maskWalletAddress,getErrorMessageContent,getInfoMessageContent,
            getInfoMessageandTxn,getErrorMessageandTxn,defineMembership } from "./dm_utils";

import {membershipType,walletAddress,wconnected} from './common';
import {dmConfigContract,dmTXNContract,dmManagerContract,dmCPdistributorContract,
                dmTokenContract,dmMembershipContract,usdtContract} from './config';

const messagex = document.getElementById("messagex");

const actionsection = document.getElementById("actionsection");
const walletconnectBtn = document.getElementById("walletconnectBtn");

// Load the header, body, and footer from their respective HTML files
fetch('adheader.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header').innerHTML = data;
    });

if(!wconnected){

    messagex.innerHTML=getErrorMessageContent("Please connect your wallet");
    actionsection.style.display="none";
    walletconnectBtn.style.display="block";

}else{

    walletconnectBtn.style.display="none";

        const contractData = await readContracts({
            contracts: [
            {
                ...dmConfigContract,
                functionName: 'communityPoolWallet',//0
            },
            {
                ...dmConfigContract,
                functionName: 'marketingWallet',//1
            },
            {
                ...dmConfigContract,
                functionName: 'technologyWallet',//2
            },
            {
                ...dmConfigContract,
                functionName: 'transactionPoolWallet',//3
            },
            {
                ...dmConfigContract,
                functionName: 'foundersWallet',//4
            },
            {
                ...dmConfigContract,
                functionName: 'conversionFeeWallet',//5
            },
            {
                ...dmConfigContract,
                functionName: 'owner',//6
            }


            ],
        });

       
        var startIndexLoc=16;
        var minTopUpLoc=15;
        var minDepoLoc=14;

        var isAdmin=false;
        //-------------------------------------------------------------Welcome message--------------------------------------------------------
       

        if(contractData[6].result != ethereumClient.getAccount().address){
            document.getElementById("authmessage").innerHTML = "Unauthorized!! You are not an admin! <br>  Wallet id:  "+ethereumClient.getAccount().address
            document.getElementById("authmessage").style.color="red";            
            isAdmin=false;
        }else{
            document.getElementById("authmessage").innerHTML = "Welcome admin! <br> Wallet id:"+ethereumClient.getAccount().address
            document.getElementById("authmessage").style.color="green";            
            isAdmin=true;
        }
        document.getElementById("authmessage").style.fontSize="small";

        if(!isAdmin){
            messagex.innerHTML=getInfoMessageContent("Restricted access only to Admins ");        
            //return;
        }

        //-------------------------------------------------------------Action Select--------------------------------------------------------
        
        const contractsBalancedetails = document.getElementById("contractsBalancedetails");
        const adminwallets = document.getElementById("adminwallets");

        const registerpromoter = document.getElementById("registerpromoter");
        const homesection = document.getElementById("homesection");
  
        
        var actionTab;
        const actionsselect = document.getElementById("actionsselect");

        
        actionsselect.addEventListener("change", function() {

            const selectedActionValue = actionsselect.value;
            messagex.innerHTML="";
            actionTab=selectedActionValue;

            homesection.style.display ="none"; 
            contractsBalancedetails.style.display ="none"; 
            adminwallets.style.display ="none";
   
            registerpromoter.style.display ="none";  

            if(!isAdmin){
                messagex.innerHTML=getInfoMessageContent("Restricted access only to Admins ");        
                return;
            }


            if (selectedActionValue == "HM") {
                homesection.style.display ="block";   
            }else if (selectedActionValue == "AW") {
                adminwallets.style.display ="block";  
            }else if (selectedActionValue == "CB") {
                contractsBalancedetails.style.display ="block";  
            }else if (selectedActionValue == "RP") {
                registerpromoter.style.display ="block";  
            }

        });




        //--------------------------------------------------------------Admin Wallet details------------------------------------------------------------------------------------
        var walletnamearray = ["CommunityPoolWallet","MarketingWallet","TechnologyWallet","TransactionPoolWallet","FoundersWallet","ConversionFeeWallet"]
        
        var adminWalletAddArray=[contractData[0].result,contractData[1].result,contractData[2].result,contractData[3].result,contractData[4].result,contractData[5].result]
        
        var table = document.getElementById("myTable");
        var tbody = document.getElementById("myTableBody");

        var adminWalletTableheaders = ["Wallet Name","Wallet Address","USDT Balance","DMTK Balance", "New Address", "Update"]; 
        var adminWallettable = document.createElement('table');   
        // Create header row              
        var headerRow1 = adminWallettable.insertRow();
        for (var i = 0; i < adminWalletTableheaders.length; i++) {
            var th = document.createElement('th');
            th.textContent = adminWalletTableheaders[i];
            headerRow1.appendChild(th);
        }

        for(var i=0;i<walletnamearray.length;i++){
                var newRow = adminWallettable.insertRow(); 
                var cell1 = newRow.insertCell(0); 
                var cell2 = newRow.insertCell(1); 
                var usdtBalancecell = newRow.insertCell(2); 
                var dmtkBalancecell = newRow.insertCell(3); 
                var cell3 = newRow.insertCell(4); 
                var cell4 = newRow.insertCell(5); 
                cell1.innerHTML = walletnamearray[i];
                cell2.innerHTML = contractData[i].result;

                var adwalletAddress=contractData[i].result;

                var usdtBalance=0;
                var dmtkBalance=0;

                    try {

                        const contractBalanceData = await readContracts({
                            contracts: [
                           
                                {
                                    ...dmTokenContract,
                                    functionName: 'balanceOf',//1
                                    args: [adwalletAddress],
                                },
                                {
                                    ...usdtContract,
                                    functionName: 'balanceOf',//0
                                    args: [adwalletAddress],
                                }

                
                            ],
                        });
    
    
                        if(contractBalanceData!=null){
            
                            if(contractBalanceData[0].status='success'){
                                dmtkBalance=Number(utils.formatEther(contractBalanceData[0].result)).toFixed(2);
                            }
                            if(contractBalanceData[1].status='success'){
                                usdtBalance=Number(utils.formatEther(contractBalanceData[1].result)).toFixed(2);
                            }
                    
            
                        }
                        
                    } catch (error) {
                        console.log("Error while loading balance details for walletid: "+walletnamearray[i]+" id: "+adwalletAddress);
                        console.log(error);
                    }

                usdtBalancecell.innerHTML = usdtBalance;
                dmtkBalancecell.innerHTML = dmtkBalance;
                usdtBalancecell.style.textAlign="center";
                dmtkBalancecell.style.textAlign="center";


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
                                messagex.innerHTML = getInfoMessageandTxn("Successfully updated the Admin wallets: ",result.hash);
                                
                            }else{
                                messagex.innerHTML = getErrorMessageandTxn("Failed to updated the Admin wallets: ",result.hash);                        
                            }
                        }catch(e){
                            messagex.innerHTML = getErrorMessageandTxn("Exception occured, Failed to updated the Admin wallets: ",result.hash);   
                            alert("Exception: "+e);
                        }
                    }else{                
                        messagex.innerHTML = getErrorMessageContent("Entered Admin Wallet address is empty: "+newWalletAddressValue);   
                    }
                    
                });
                // Append the button to the third cell
                cell4.appendChild(button);

        }

        var tableelement=document.getElementById("adminwallettable");
        tableelement.appendChild(adminWallettable);

       


        //--------------------------------------------------------------Contract balance section------------------------------------------------------------------------------------
            // Prepare the Contracts table header
            
            var contractsCountSpan = document.getElementById("contractscount");        

            var contractsNameList =["DM_MANAGER_ADDRESS","DM_MEMBERSHIP_ADDRESS","DM_CONFIG_ADDRESS","DM_CPDISTRIBUTOR_ADDRESS"] ;
            var contractsList =[DM_MANAGER_ADDRESS, DM_MEMBERSHIP_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS] ;
            var contractscount =contractsList.length; 
            var contractsTableheaders = ["Contract Name","Contract Address", "USDT Balance", "DMTK Balance"]; // Contract balance header values
            contractsCountSpan.innerHTML = contractscount;

            var contractstable = document.createElement('table');   
            // Create header row              
            var headerRow1 = contractstable.insertRow();
            for (var i = 0; i < contractsTableheaders.length; i++) {
                var th = document.createElement('th');
                th.textContent = contractsTableheaders[i];
                headerRow1.appendChild(th);
            }

        
            for(var i=0;i<contractscount;i++){
            
                var contractAddressName= contractsList[i];                
                var ContractBalanceDetails = await readContracts({
                    contracts: [                  
                        {
                            ...usdtContract,
                            functionName: 'balanceOf',
                            args: [contractAddressName],
                        },
                            {
                            ...dmTokenContract,
                            functionName: 'balanceOf',
                            args: [contractAddressName],
                        }
                    ],
                });

                var contractBalanceData=[0,0];

                if(ContractBalanceDetails[0].status=="success"){//Checking for USDT balance
                    contractBalanceData[0] =ContractBalanceDetails[0].result;
                }else{
                    contractBalanceData[0]=0;
                }
    
                if(ContractBalanceDetails[1].status=="success"){//Checking for DMTK balance
                    contractBalanceData[1] =ContractBalanceDetails[1].result;
                }else{
                    contractBalanceData[1]=0;
                }

                
                //var newRow = contractstable.insertRow(contractstbody.rows.length); 
                var newRow = contractstable.insertRow();
                
                var contractNameCell = newRow.insertCell(0); 
                var contractCell = newRow.insertCell(1); 
                var usdtBalanceCell = newRow.insertCell(2); 
                var dmtkBalanceCell = newRow.insertCell(3); 
                
                contractNameCell.innerHTML=contractsNameList[i];
                contractCell.innerHTML = maskWalletAddress(contractsList[i]);
                usdtBalanceCell.innerHTML = Number(utils.formatEther(contractBalanceData[0])).toFixed(2);
                dmtkBalanceCell.innerHTML = Number(utils.formatEther(contractBalanceData[1])).toFixed(2);

            }
            var tableelement=document.getElementById("contractdetailstable");
            tableelement.appendChild(contractstable);

        


//------------------------------------------------------------------------Adding a promoter----------------------------------------------

        var addPromoter = document.getElementById("addPromoter");
        addPromoter.addEventListener("click", async function() {
            var name= document.getElementById("name__").value;
            var mobile= document.getElementById("mobile__").value;
            var email= document.getElementById("email__").value;
            //var referrer= document.getElementById("referrer__").value;
            var promoterAddress= document.getElementById("memberAddress__").value;

            if(!name || !mobile || !email || !promoterAddress){
                messagex.innerHTML = getErrorMessageContent("Please fill all the mandatory fields");
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
                    messagex.innerHTML = getInfoMessageandTxn("New member added successfully : "+promoterAddress,result.hash);
                    alert("success");
                }else{
                    messagex.innerHTML = getErrorMessageandTxn(" Unable to register promoter: "+promoterAddress,result.hash);
                    alert("Error");
                }
            }catch(e){
                messagex.innerHTML = getErrorMessageContent("Exception occured: Unable to register promoter: "+promoterAddress);
                console.log(e);                
            }
        })

        document.getElementById("footer-menu").innerHTML = "";




}//End of else loop, if wallet is connected
