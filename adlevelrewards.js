import {waitForTransaction, writeContract,readContracts,readContract} from '@wagmi/core';
import {utils} from 'ethers';

import { maskWalletAddress,getErrorMessageContent,getInfoMessageContent,
                    getInfoMessageandTxn,getErrorMessageandTxn,defineMembership } from "./dm_utils";

import {dmConfigContract,DM_TXN_ADDRESS} from './config';
import {generateBodyContent,walletAddress} from './common';
import {adminAuthMessage,loadadminheader} from './common';
import DM_TXN_ABI from './ABI_DM_TXN.json';

import ethereumClient from "./walletConnect";

const messagex = document.getElementById("messagex");

const walletconnectBtn = document.getElementById("walletconnectBtn");

var sponsorlevelsearchbtn = document.getElementById("sponsorlevelsearchbtn");
var newWallAdd=ethereumClient.getAccount().address

//Load the admin header
loadadminheader();

if(generateBodyContent){

    adminAuthMessage();

    //-----------------------------------------------------------------------Level Reward section -----------------------------------------------------
            sponsorlevelsearchbtn.addEventListener("click", async function() {
                
                sponsorlevelsearchbtn.innerHTML=`<i class="fa fa-refresh fa-spin"></i> Please Wait`;
                sponsorlevelsearchbtn.disabled=true;
                messagex.innerHTML = "";

                var txndetails1element=document.getElementById("txndetailstable");

                txndetails1element.innerHTML="";

                var sponsorAddress=    document.getElementById("sponsoridleveltext").value;
            
                if(sponsorAddress == null || sponsorAddress ==""){
                    messagex.innerHTML = getErrorMessageContent("Sponsor address cannot be empty");
                    
                    sponsorlevelsearchbtn.disabled=false;
                    sponsorlevelsearchbtn.innerHTML="Fetch Level Rewards";
                    return;
                }

                const dmTXNContract2 = {
                    address: DM_TXN_ADDRESS,
                    abi: DM_TXN_ABI,
                  }

                var ContractResponseData = await readContracts({
                    contracts: [                  
                        {
                            ...dmTXNContract2,
                            functionName: 'getSponsorLevelrewards',
                            args:[sponsorAddress]
                        }
                    ],
                });

                console.log("Wallet address "+ethereumClient.getAccount().address);

                if(ContractResponseData[0].status =="failure"){

                    txndetails1element.innerHTML="(Please check if the sponsor id is correct)";
                    messagex.innerHTML = getErrorMessageContent("Unable to fetch data from Contract "+ContractResponseData[0].error.message);

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
