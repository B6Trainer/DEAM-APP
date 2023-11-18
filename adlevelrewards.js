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


            

         



}//End of else loop, if wallet is connected
