import {waitForTransaction, writeContract,readContracts,readContract} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';

import { maskWalletAddress,getErrorMessageContent,getInfoMessageContent,getInfoMessageandTxn,getErrorMessageandTxn,defineMembership } from "./dm_utils";

import {dmConfigContract,dmTXNContract} from './config';
import {membershipType,walletAddress,wconnected} from './common';


const messagex = document.getElementById("messagex");

const walletconnectBtn = document.getElementById("walletconnectBtn");
const txndetails = document.getElementById("txndetails");
var sponsorlevelsearchbtn = document.getElementById("sponsorlevelsearchbtn");

// Load the header, body, and footer from their respective HTML files

fetch('adheader.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header').innerHTML = data;
    });




if(!wconnected){

    messagex.innerHTML=getErrorMessageContent("Please connect your wallet");    
    walletconnectBtn.style.display="block";

}else{

    walletconnectBtn.style.display="none";

        const contractData = await readContracts({
            contracts: [
            {
                ...dmConfigContract,
                functionName: 'owner',
            },

            ],
        });

        var isAdmin=false;
        //-------------------------------------------------------------Welcome message--------------------------------------------------------
       

        if(contractData[0].result != ethereumClient.getAccount().address){
            document.getElementById("authmessage").innerHTML = "Unauthorized!! You are not an admin! ";
            document.getElementById("authmessage").style.color="red";   
            document.getElementById("authmessage1").innerHTML = "Wallet id: "+ethereumClient.getAccount().address;
            document.getElementById("authmessage1").style.color="red";           
            isAdmin=false;
        }else{
            document.getElementById("authmessage").innerHTML = "Welcome admin! ";
            document.getElementById("authmessage").style.color="green";            
            document.getElementById("authmessage1").innerHTML = "Wallet id: "+ethereumClient.getAccount().address
            document.getElementById("authmessage1").style.color="green";            
            isAdmin=true;
        }
        document.getElementById("authmessage").style.fontSize="small";
        document.getElementById("authmessage1").style.fontSize="small";

        
        
        
        if(!isAdmin){
            messagex.innerHTML=getInfoMessageContent("Restricted access only to Admins ");                    
            txndetails.style.display ="none";  
        }else{
            txndetails.style.display ="block";  
        }

        //-------------------------------------------------------------Action Select--------------------------------------------------------
        
       
       
        //-----------------------------------------------------------------------Level Reward section -----------------------------------------------------


            

            sponsorlevelsearchbtn.addEventListener("click", async function() {
                
                sponsorlevelsearchbtn.innerHTML=`<i class="fa fa-refresh fa-spin"></i> Please Wait`;
                sponsorlevelsearchbtn.disabled=true;

                var txndetails1element=document.getElementById("txndetailstable");
                messagex.innerHTML = "";
                txndetails1element.innerHTML="";

                var sponsorAddress=    document.getElementById("sponsoridleveltext").value;
            
                if(sponsorAddress == null || sponsorAddress ==""){
                    messagex.innerHTML = getErrorMessageContent("Sponsor address cannot be empty");
                    
                    sponsorlevelsearchbtn.disabled=false;
                    sponsorlevelsearchbtn.innerHTML="Fetch Level Rewards";
                    return;
                }

                var ContractResponseData = await readContracts({
                    contracts: [                  
                        {
                            ...dmTXNContract,
                            functionName: 'getSponsorLevelrewards',
                            args:[sponsorAddress]
                        }
                    ],
                });



                if(ContractResponseData[0].status =="failure"){

                    txndetails1element.innerHTML="(Please check if the sponsor id is correct)";
                    messagex.innerHTML = getErrorMessageContent("Unable to fetch data from Contract");

                }
                else{
                        
                var memAddressArr=ContractResponseData[0].result[0];
                var levelRewardsArr=ContractResponseData[0].result[1];
                var levelArr=ContractResponseData[0].result[2];
    
                var arrLength= memAddressArr.length;
                var txnTableheaders = [ "Level", "Member Wallet Address","Rewards generated"]; // Profile header values
      
                var table = document.createElement('table');                                   
                
                //Create header row              
                var headerRow1 = table.insertRow();
                for (var i = 0; i < txnTableheaders.length; i++) {
                    var th = document.createElement('th');
                    th.textContent = txnTableheaders[i];
                    headerRow1.appendChild(th);
                 }
    
                 if(arrLength<=0){
                    txndetails1element.innerHTML="No rewards available for Sponsor: "+sponsorAddress;
                    
                 }else{
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

                txndetails1element.appendChild(table);
               

            }

            sponsorlevelsearchbtn.disabled=false;
            sponsorlevelsearchbtn.innerHTML="Fetch Level Rewards";
        })



}//End of else loop, if wallet is connected
