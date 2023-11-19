import {waitForTransaction, writeContract,readContracts,readContract} from '@wagmi/core';

import {utils} from 'ethers';

import { maskWalletAddress,getErrorMessageContent,getInfoMessageContent,
            getInfoMessageandTxn,getErrorMessageandTxn,defineMembership } from "./dm_utils";

import {membershipType,walletAddress,wconnected} from './common';
import {adminAuthMessage,loadadminheader} from './common';
import {dmConfigContract,dmTXNContract,dmManagerContract,dmCPdistributorContract,
                dmTokenContract,dmMembershipContract,usdtContract} from './config';


const messagex = document.getElementById("messagex");



//Load the admin header
loadadminheader();

if(wconnected){

        adminAuthMessage();

        const contractData = await readContracts({
            contracts: [
                {
                    ...dmMembershipContract,
                    functionName: 'getProfileDetails',
                }

            ],
        });



        //--------------------------------------------------------------Profile section------------------------------------------------------------------------------------
            // Prepare the profile table header
            
            var profileTableheaders = [ "Profile type", "Name","Wallet Address", "Phone", "Email","Subscribed Balance", "Rewards gained", "Sponsor", "USDT Balance", "DMTK Balance"]; // Profile header values
    
            var tableelement=document.getElementById("profiledetailstable");  
            //tableelement.removeChild("profTbl1");              
            var profiletable = document.createElement('table'); 
                            //profiletable.id="profTbl1";
                // Create header row              
                var headerRow1 = profiletable.insertRow();
                for (var i = 0; i < profileTableheaders.length; i++) {
                    var th = document.createElement('th');
                    th.textContent = profileTableheaders[i];
                    headerRow1.appendChild(th);
                }

            tableelement.appendChild(profiletable);


            var getProfileDetailsBtn=document.getElementById("getProfileDetailsBtn");
            getProfileDetailsBtn.addEventListener("click", async function() {

                getProfileDetailsBtn.innerHTML=`<i class="fa fa-refresh fa-spin"></i> Please Wait`;
                getProfileDetailsBtn.disabled=true;
                messagex.innerHTML = "";


                var rowCount = profiletable.rows.length;
                for (var i = rowCount - 1; i > 0; i--) {
                    profiletable.deleteRow(i);
                }

                var profResultLoc=0;

                var profiletypeArr = contractData[profResultLoc].result[0]; 
                var walletaddArr = contractData[profResultLoc].result[1];     
                var nameArr = contractData[profResultLoc].result[2]; 
                var emailArr = contractData[profResultLoc].result[3]; 
                var phoneArr = contractData[profResultLoc].result[4]; 
                var profilecount = contractData[profResultLoc].result[5]; 
                var subsBalanceArr = contractData[profResultLoc].result[6]; 
                var rewardsReceivedArr = contractData[profResultLoc].result[7] ; 
                var sponsor = contractData[profResultLoc].result[8]; 
                        
                var profileCountSpan = document.getElementById("profileCount");
                profileCountSpan.innerHTML = profilecount;
                                  
     
                // Create body rows
                for ( let i = 0; i < profilecount; i++) {
    
                    var newRow = profiletable.insertRow();
                    var profiletypecell = newRow.insertCell(0); 
                    var namecell = newRow.insertCell(1); 
                    var walletaddcell = newRow.insertCell(2); 
                    
                    var phonecell = newRow.insertCell(3); 
                    var emailcell = newRow.insertCell(4);
                    var subscell = newRow.insertCell(5);
                    var rewardscell = newRow.insertCell(6);
                    var sponsorcell = newRow.insertCell(7); 
                    var usdtBalancecell = newRow.insertCell(8);
                    var dmtkBalancecell = newRow.insertCell(9); 
            
                    
                    walletaddcell.value=walletaddArr[i]
                    walletaddcell.innerHTML = maskWalletAddress(walletaddArr[i]);
                    profiletypecell.innerHTML = defineMembership(profiletypeArr[i]);
                    namecell.innerHTML = nameArr[i];
                    phonecell.innerHTML = phoneArr[i];
                    emailcell.innerHTML = emailArr[i];
                    subscell.innerHTML = Number(utils.formatEther(subsBalanceArr[i])).toFixed(2);;
                    rewardscell.innerHTML = Number(utils.formatEther(rewardsReceivedArr[i])).toFixed(2);

                    sponsorcell.value=sponsor[i]
                    sponsorcell.innerHTML = maskWalletAddress(sponsor[i]);

                    var usdtBalance=0;
                    var dmtkBalance=0;

                    try {

                        const contractBalanceData = await readContracts({
                            contracts: [
                            {
                                ...usdtContract,
                                functionName: 'balanceOf',//0
                                args: [walletaddArr[i]],
                            },
                            {
                                ...dmTokenContract,
                                functionName: 'balanceOf',//1
                                args: [walletaddArr[i]],
                            }
                
                            ],
                        });
    
    
                        if(contractBalanceData!=null){
            
                            if(contractBalanceData[1].status='success'){
                                dmtkBalance=Number(utils.formatEther(contractBalanceData[1].result)).toFixed(2);
                            }

                            if(contractBalanceData[0].status='success'){
                                usdtBalance=Number(utils.formatEther(contractBalanceData[0].result)).toFixed(2);
                            }
                            
            
                        }
                        
                    } catch (error) {
                        messagex.innerHTML = getErrorMessageContent("Unable to fetch profile data from Contract");
                        console.log(error);
                    }

                    usdtBalancecell.innerHTML = usdtBalance;
                    dmtkBalancecell.innerHTML = dmtkBalance;
                    usdtBalancecell.style.textAlign="right";
                    dmtkBalancecell.style.textAlign="right";
                }

                getProfileDetailsBtn.disabled=false;
                getProfileDetailsBtn.innerHTML=`Fetch Data`;

            })


}//End of else loop, if wallet is connected
