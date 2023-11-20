import {waitForTransaction, writeContract,readContracts,readContract} from '@wagmi/core';

import {utils} from 'ethers';
import DM_CONFIG_ABI from './ABI_DM_CONFIG.json';
import { maskWalletAddress,getErrorMessageContent,getInfoMessageContent,
            getInfoMessageandTxn,getErrorMessageandTxn,defineMembership } from "./dm_utils";

import {membershipType,walletAddress,generateBodyContent} from './common';
import {adminAuthMessage,loadadminheader} from './common';
import {dmConfigContract,dmTXNContract,dmManagerContract,dmCPdistributorContract,
                dmTokenContract,dmMembershipContract,usdtContract} from './config';


const messagex = document.getElementById("messagex");



//Load the admin header
loadadminheader();

if(generateBodyContent){

        adminAuthMessage();

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
            },
            {
                ...dmCPdistributorContract,
                functionName: 'lastCommunityDistributionTime',//7-unused
            },
            {
                ...dmCPdistributorContract,
                functionName: 'communityDistributionFrequencyInDays',//8 -unused
            },
            {
                ...dmCPdistributorContract,
                functionName: 'totalCommunityDistribution',//9 -unused
            },
            {
                ...dmConfigContract,
                functionName: 'conversionFeeMember',//10
            },
            {
                ...dmConfigContract,
                functionName: 'conversionFeePromoter',//11
            },
            {
                ...dmConfigContract,
                functionName: 'transactionFee_communityPoolFeePercentage',//12
            },
            {
                ...dmConfigContract,
                functionName: 'transactionFee_foundersFeePercentage',//13
            },
            {
                ...dmConfigContract,
                functionName: 'minimumDepositForMembers',//14
            },
            {
                ...dmConfigContract,
                functionName: 'minimumTopUpAmountMembers',//15
            },
            {
                ...dmCPdistributorContract,
                functionName: 'startIndexOfNextBatch',//16
            },
            {
                ...dmMembershipContract,
                functionName: 'getProfileDetails',//17
            }

            ],
        });



       //----------------------------------------------------------------------------Conversion Fee section-------------------------------------------------------
                 var currentConversionFeeMembers = document.getElementById("currentConversionFeeMembers");
                 var changeCoversionFeeMembers = document.getElementById("changeCoversionFeeMembers");
                 currentConversionFeeMembers.innerHTML = `Current Member Fee : ${Number(contractData[10].result)/10000}%`;
         
                 var currentConversionFeePromoters = document.getElementById("currentConversionFeePromoters");
                 var changeCoversionFeePromoters = document.getElementById("changeCoversionFeePromoters");
                 currentConversionFeePromoters.innerHTML = `Current Promoter Fee : ${Number(contractData[11].result)/10000}%`;
         
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
                            //alert("Successfully updated the Promoter Conversion fee");
                            messagex.innerHTML = getInfoMessageandTxn("Member Conversion fee updation successful : ",result.hash);
                        }else{
                            messagex.innerHTML = getErrorMessageandTxn("Member Conversion fee updation failed : ",result.hash);
                        }
                    }catch(e){
                       
                        messagex.innerHTML = getErrorMessageContent("Member Conversion fee updation failed due to exception ");
                        console.log("Member Conversion fee updation failed due to exception ");
                        console.log(e);
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
                             //alert("Successfully updated the Promoter Conversion fee");
                             messagex.innerHTML = getInfoMessageandTxn("Promoter Conversion fee updation successful : ",result.hash);
                         }else{
                             messagex.innerHTML = getErrorMessageandTxn("Promoter Conversion fee updation failed : ",result.hash);
                         }
                     }catch(e){
                        
                         messagex.innerHTML = getErrorMessageContent("Promoter Conversion fee updation failed due to exception ");
                         console.log("Promoter Conversion fee updation failed due to exception ");
                         console.log(e);
                     }
                 })
         
         
         
                 var currentTransactionFeeComm = document.getElementById("currentTransactionFeeComm");
                 var currentTransactionFeeFounder = document.getElementById("currentTransactionFeeFounder");
                 var changeTransactionFee = document.getElementById("changeTransactionFee");
         
         
                 currentTransactionFeeComm.innerHTML = `Community Pool : ${Number(contractData[12].result)}%`;
                 currentTransactionFeeFounder.innerHTML = `Founders Wallet : ${Number(contractData[13].result)}%`;
         
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
                            messagex.innerHTML = getInfoMessageandTxn("Transaction fee updation successful : ",result.hash);
                        }else{
                            messagex.innerHTML = getErrorMessageandTxn("Transaction fee updation failed : ",result.hash);
                        }
                    }catch(e){
                       
                        messagex.innerHTML = getErrorMessageContent("Transaction fee updation failed due to exception ");
                        console.log("Transaction fee updation failed due to exception ");
                        console.log(e);
                    }
                 })
         
         
                 var currentMinDepositMembers = document.getElementById("currentMinDepositMembers");
                 var changeMinimumDepositMembers = document.getElementById("changeMinimumDepositMembers");
                 currentMinDepositMembers.innerHTML = `Member's Joining min fee- Current value: ${Number(contractData[14].result)/Math.pow(10,18)} USDT`;
         
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
                            messagex.innerHTML = getInfoMessageandTxn("Min Deposit amt updation successful : ",result.hash);
                        }else{
                            messagex.innerHTML = getErrorMessageandTxn("Min Deposit amt updation failed : ",result.hash);
                        }
                    }catch(e){
                       
                        messagex.innerHTML = getErrorMessageContent("Min Deposit amt updation failed due to exception ");
                        console.log("Min Deposit amt updation failed due to exception ");
                        console.log(e);
                    }
                 })
         
         
         
         
                 var currentTopUpMembers = document.getElementById("currentTopUpMembers");
                 var changeTopUpMembers = document.getElementById("changeTopUpMembers");
                 currentTopUpMembers.innerHTML = `Member's topup min fee- Current value:  ${Number(contractData[15].result)/Math.pow(10,18)} USDT`;
         
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
                            messagex.innerHTML = getInfoMessageandTxn("Min Topup amt updation successful : ",result.hash);
                        }else{
                            messagex.innerHTML = getErrorMessageandTxn("Min Topup amt updation failed : ",result.hash);
                        }
                    }catch(e){
                       
                        messagex.innerHTML = getErrorMessageContent("Min Topup amt updation failed due to exception ");
                        console.log("Min Topup amt updation failed due to exception ");
                        console.log(e);
                    }
                 })


}//End of body generation
