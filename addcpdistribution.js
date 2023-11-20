import {waitForTransaction, writeContract,readContracts,readContract} from '@wagmi/core';

import {utils} from 'ethers';
import DM_CPDISTRIBUTOR_ABI from './ABI_DM_CPDISTRIBUTOR.json';

import { maskWalletAddress,getErrorMessageContent,getInfoMessageContent,
            getInfoMessageandTxn,getErrorMessageandTxn,defineMembership } from "./dm_utils";

import {membershipType,walletAddress,generateBodyContent} from './common';
import {adminAuthMessage,loadadminheader} from './common';
import {dmConfigContract,dmTXNContract,dmManagerContract,dmCPdistributorContract,
                dmTokenContract,dmMembershipContract,usdtContract} from './config';
import { DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,
                DM_MEMBERSHIP_ADDRESS, usdtAddress,DM_TXN_ADDRESS } from './config';


const messagex = document.getElementById("messagex");



//Load the admin header
loadadminheader();

if(generateBodyContent){

        adminAuthMessage();

        const contractData = await readContracts({
            contracts: [
                {
                    ...dmMembershipContract,
                    functionName: 'getProfileDetails',
                },
                {
                    ...dmConfigContract,
                    functionName: 'communityPoolWallet',//0
                },

            ],
        });



         //--------------------------------------------------------------Distribution logic------------------------------------------------------------------------------------

        var commonPoolAddress=contractData[1].result;
         var lastDistributeTime = document.getElementById("lastDistributeTime");
         //lastDistributeTime.innerHTML = "";// ` ${new Date(Number(contractData[7].result)*1000)}`;
 
         var currentfrequency = document.getElementById("currentfrequency");
         currentfrequency.innerHTML  ="";// `Current distribtion Frequency : ${contractData[8].result} seconds (${(Number(contractData[8].result)/86400).toFixed(2)} Days)`
         var changeFrequency = document.getElementById("changeFrequency");
 
         var startIndexTextbox = document.getElementById("startIndex");
         startIndexTextbox.disabled=true;
         startIndexTextbox.value = 0;//contractData[16].result;
         //document.getElementById("startIndex").disabled = true;
 
         //Adding event to  frequency update button
         changeFrequency.addEventListener("click", async function() {
 
             messagex.innerHTML="";
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
                     messagex.innerHTML = getInfoMessageandTxn("Updated new frequency successfully : "+newFrequency,result.hash);
                     //alert("success");
                     
                 }else{
                     messagex.innerHTML = getErrorMessageandTxn("Failed to updated new frequency : "+newFrequency,result.hash);
                     //alert("Error");
                 }
             }catch(e){
                 //messagex.innerHTML = getErrorMessageandTxn("Failed to updated new frequency due to exception ");
                 console.log("Failed to updated new frequency due to exception ");
                 console.log(e);
             }
         });
 
         var distributeButton = document.getElementById("distributeButton")
         distributeButton.addEventListener("click", async function() {
 
         messagex.innerHTML="";
         
         var startIndex = document.getElementById("startIndex").value
         var lastIndex = document.getElementById("lastIndex").value
         var forcerunbox = document.getElementById("forcerunbox");
         var forceRun = forcerunbox.checked ? 1 : 0;
 
             try{
                 var result = await writeContract({
                     address: DM_CPDISTRIBUTOR_ADDRESS,
                     abi: DM_CPDISTRIBUTOR_ABI,
                     functionName: `DistributeCommunityPool`,
                     args: [startIndex,lastIndex,forceRun],
                 });
                 var tr = await waitForTransaction({
                     hash: result.hash,
                 })
                 if(tr.status=='success'){
                     messagex.innerHTML = getInfoMessageandTxn("DCP distribution successful : ",result.hash);
                    // alert("success");
                 }else{
                     messagex.innerHTML = getErrorMessageandTxn("DCP distribution failed: ",result.hash);
                     //alert("Error");
                 }
             }catch(e){
                 messagex.innerHTML = getErrorMessageContent("DCP distribution failed due to exception ");
                 console.log("DCP distribution failed due to exception ");
                 console.log(e);
             }
         })
 
        
         
         var dcpRefresh = document.getElementById("dcpRefresh");
         var compoolbalanceElm = document.getElementById("compoolbalance");
         var totalDistributionElm = document.getElementById("totalTillDate");
        //Adding event to  frequency update button
        dcpRefresh.addEventListener("click", async function(){
 
             //var comPoolAddress=commonPoolAddress;
             const dcpContractData = await readContracts({
                 contracts: [
 
                     {
                         ...dmTokenContract,
                         functionName: 'balanceOf',//0
                         args: [commonPoolAddress],
                     },
 
                     {
                         ...dmCPdistributorContract,
                         functionName: 'lastCommunityDistributionTime',//1
                     },
                     {
                         ...dmCPdistributorContract,
                         functionName: 'communityDistributionFrequencyInDays',//2
                     },
                     {
                         ...dmCPdistributorContract,
                         functionName: 'totalCommunityDistribution',//3
                     },
                     {
                         ...dmCPdistributorContract,
                         functionName: 'startIndexOfNextBatch',//4
                     },
                     
 
     
                 ]
             });
 
             var compoolbalance=0;
             if(dcpContractData!=null){
 
                 if(dcpContractData[0].status='success'){
                     compoolbalance=Number(utils.formatEther(dcpContractData[0].result)).toFixed(2);
                 }
 
             }
 
             compoolbalanceElm.innerHTML=compoolbalance;
             lastDistributeTime.innerHTML = ` ${new Date(Number(dcpContractData[1].result)*1000)}`;
             currentfrequency.innerHTML  = ` ${dcpContractData[2].result} seconds (${(Number(dcpContractData[2].result)/86400).toFixed(2)} Days)`
             totalDistributionElm.innerHTML =`${(Number(dcpContractData[3].result)/Math.pow(10,18)).toFixed(2)} DMTK`
             startIndexTextbox.value = dcpContractData[4].result;
             startIndexTextbox.disabled=false;
 
 
 
         });//End of refersh button event


}//End of else loop, if wallet is connected
