import {waitForTransaction, writeContract,readContracts} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';
import { DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,DM_MEMBERSHIP_ADDRESS, usdtAddress } from './config';
import DM_CONFIG_ABI from './ABI_DM_CONFIG.json';
import DM_MANAGER_ABI from './ABI_DM_MANAGER.json';
import DM_CPDISTRIBUTOR_ABI from './ABI_DM_CPDISTRIBUTOR.json';
import DM_TOKEN_ABI from './ABI_DM_TOKEN.json';
import DM_MEMBERSHIP_ABI from './ABI_DM_MEMBERSHIP.json';
import USDT_ABI from './ABI_ERC20.json';
import { maskWalletAddress,getErrorMessageContent,getInfoMessageContent,getInfoMessageandTxn,getErrorMessageandTxn,defineMembership } from "./dm_utils";
import {M_TYPE_Member,M_TYPE_Promoter,M_TYPE_Guest,M_TYPE_Admin,M_TYPE_Owner} from './config';
import {M_TYPE_Member_DEF,M_TYPE_Promoter_DEF,M_TYPE_Guest_DEF,M_TYPE_Admin_DEF,M_TYPE_Owner_DEF} from './config';
import {membershipType,walletAddress,wconnected} from './common';


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

        const usdtContract = {
            address: usdtAddress,
            abi: USDT_ABI,
        }
        




        const contractData = await readContracts({
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

        //-------------------------------------------------------------Welcome message--------------------------------------------------------
       
        document.getElementById("startIndex").value = contractData[16].result;
        document.getElementById("startIndex").disabled = true;
        if(contractData[6].result != ethereumClient.getAccount().address){
            document.getElementById("authmessage").innerHTML = "Unauthorized!! You are not an admin! <br>  Wallet id:  "+ethereumClient.getAccount().address
            document.getElementById("authmessage").style.color="red";            
        }else{
            document.getElementById("authmessage").innerHTML = "Welcome admin! <br> Wallet id:"+ethereumClient.getAccount().address
            document.getElementById("authmessage").style.color="green";            
        }
        document.getElementById("authmessage").style.fontSize="small";

        //-------------------------------------------------------------Action Select--------------------------------------------------------
        
        const contractsBalancedetails = document.getElementById("contractsBalancedetails");
        const profiledetails = document.getElementById("profiledetails");
        const adminwallets = document.getElementById("adminwallets");
        const weeklydistribution = document.getElementById("weeklydistribution");
        const feesetup = document.getElementById("feesetup");
        const registerpromoter = document.getElementById("registerpromoter");
        const homesection = document.getElementById("homesection");
        
        var actionTab;
       

        
        actionsselect.addEventListener("change", function() {

            const selectedActionValue = actionsselect.value;
            messagex.innerHTML="";
            actionTab=selectedActionValue;

            homesection.style.display ="none"; 
            contractsBalancedetails.style.display ="none"; 
            profiledetails.style.display ="none"; 
            adminwallets.style.display ="none";
            weeklydistribution.style.display ="none";     
            feesetup.style.display ="none";   
            registerpromoter.style.display ="none";  

            if(membershipType!=M_TYPE_Owner && membershipType!=M_TYPE_Member){
                messagex.innerHTML=getInfoMessageContent("Restricted access only to Admins ");        
                return;
            }


            if (selectedActionValue == "HM") {
                homesection.style.display ="block";   
            }else if (selectedActionValue == "AW") {
                adminwallets.style.display ="block";  
            }else if (selectedActionValue == "P") {
                profiledetails.style.display ="block";  
            }else if (selectedActionValue == "CB") {
                contractsBalancedetails.style.display ="block";  
            }else if (selectedActionValue == "WR") {
                weeklydistribution.style.display ="block";  
            }else if (selectedActionValue == "FS") {
                feesetup.style.display ="block";  
            }else if (selectedActionValue == "RP") {
                registerpromoter.style.display ="block";  
            }

        });


        //--------------------------------------------------------------Admin Wallet details------------------------------------------------------------------------------------
        var walletnamearray = ["CommunityPoolWallet","MarketingWallet","TechnologyWallet","TransactionPoolWallet","FoundersWallet","ConversionFeeWallet"]
        var table = document.getElementById("myTable");
        var tbody = document.getElementById("myTableBody");
        var adminWalletAddArray=[contractData[0].result,contractData[1].result,contractData[2].result,contractData[3].result,contractData[4].result,contractData[5].result]
            for(var i=0;i<6;i++){
                var newRow = table.insertRow(tbody.rows.length); 
                var cell1 = newRow.insertCell(0); 
                var cell2 = newRow.insertCell(1); 
                var cell3 = newRow.insertCell(2); 
                var cell4 = newRow.insertCell(3); 
                cell1.innerHTML = walletnamearray[i];
                cell2.innerHTML = contractData[i].result;

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

       
        var profResultLoc=17;

        if(contractData!=null || contractData[profResultLoc]!=null){


        



        //--------------------------------------------------------------Contract balance section------------------------------------------------------------------------------------
            // Prepare the Contracts table header
            var contractstable = document.getElementById("contractsTable");
            var contractstheader = document.getElementById("contractsTableHeader");
            var contractstbody = document.getElementById("contractsTableBody");
            var contractsCountSpan = document.getElementById("contractscount");
        
            var headerRow=contractstheader.insertRow(0);
            var contractsTableheaders = ["Contract Name","Contract Address", "USDT Balance", "DMTK Balance"]; // Contract balance header values

        
            for (var i = 0; i < contractsTableheaders.length; i++) {
                var headerCell = document.createElement("th");
                var text = document.createTextNode(contractsTableheaders[i]);
                headerCell.appendChild(text);
                headerRow.appendChild(headerCell);
            }

            var contractsNameList =["DM_MANAGER_ADDRESS","DM_MEMBERSHIP_ADDRESS"] ;
            var contractsList =[DM_MANAGER_ADDRESS, DM_MEMBERSHIP_ADDRESS] ;
            var contractscount =contractsList.length; 

            
            contractsCountSpan.innerHTML = contractscount;

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

                //contractListandBalances.push(contractBalanceData);
                console.log(contractBalanceData);
                console.log(ContractBalanceDetails[0].result+" "+ContractBalanceDetails[1].result);
    
                var newRow = contractstable.insertRow(contractstbody.rows.length); 
                
                var contractNameCell = newRow.insertCell(0); 
                var contractCell = newRow.insertCell(1); 
                var usdtBalanceCell = newRow.insertCell(2); 
                var dmtkBalanceCell = newRow.insertCell(3); 
                
                contractNameCell.innerHTML=contractsNameList[i];
                contractCell.innerHTML = maskWalletAddress(contractsList[i]);
                usdtBalanceCell.innerHTML = Number(utils.formatEther(contractBalanceData[0])).toFixed(2);
                dmtkBalanceCell.innerHTML = Number(utils.formatEther(contractBalanceData[1])).toFixed(2);

            }


        

        //--------------------------------------------------------------Profile section------------------------------------------------------------------------------------
            // Prepare the profile table header

            var profiletypeArr = contractData[profResultLoc].result[0]; 
            var walletaddArr = contractData[profResultLoc].result[1];     
            var nameArr = contractData[profResultLoc].result[2]; 
            var emailArr = contractData[profResultLoc].result[3]; 
            var phoneArr = contractData[profResultLoc].result[4]; 
            var profilecount = contractData[profResultLoc].result[5]; 
            var subsBalanceArr = contractData[profResultLoc].result[6]; 
            var rewardsReceivedArr = contractData[profResultLoc].result[7] ; 
            var sponsor = contractData[profResultLoc].result[8]; 
          
            var profiletable = document.getElementById("profileTable");
            var profiletheader = document.getElementById("profileTableHeader");
            var profiletbody = document.getElementById("profileTableBody");
            
            var profileCountSpan = document.getElementById("profileCount");
            profileCountSpan.innerHTML = profilecount;
          
            var headerRow=profiletheader.insertRow(0);
            var profileTableheaders = [ "Profile type", "Name","Wallet Address", "Phone", "Email","Subs Balance", "Rewards", "Sponsor"]; // Profile header values
        
            for (var i = 0; i < profileTableheaders.length; i++) {
                var headerCell = document.createElement("th");
                var text = document.createTextNode(profileTableheaders[i]);
                headerCell.appendChild(text);
                headerRow.appendChild(headerCell);
            }

            // Prepare the profile table body
            for(var i=0;i<profilecount;i++){
                
                
                var newRow = profiletable.insertRow(profiletbody.rows.length); 
                var profiletypecell = newRow.insertCell(0); 
                var namecell = newRow.insertCell(1); 
                var walletaddcell = newRow.insertCell(2); 
                
                var phonecell = newRow.insertCell(3); 
                var emailcell = newRow.insertCell(4);
                var subscell = newRow.insertCell(5);
                var rewardscell = newRow.insertCell(6);
                var sponsorcell = newRow.insertCell(7); 
        
                walletaddcell.innerHTML = maskWalletAddress(walletaddArr[i]);
                profiletypecell.innerHTML = defineMembership(profiletypeArr[i]);
                namecell.innerHTML = nameArr[i];
                phonecell.innerHTML = phoneArr[i];
                emailcell.innerHTML = emailArr[i];
                subscell.innerHTML = Number(utils.formatEther(subsBalanceArr[i])).toFixed(2);;
                rewardscell.innerHTML = Number(utils.formatEther(rewardsReceivedArr[i])).toFixed(2);
                sponsorcell.innerHTML = maskWalletAddress(sponsor[i]);
            
            }

        }

        //--------------------------------------------------------------Distribution logic------------------------------------------------------------------------------------

        var lastDistributeTime = document.getElementById("lastDistributeTime");
            lastDistributeTime.innerHTML = `Last Distribution Time : ${new Date(Number(contractData[7].result)*1000)}`;

        var currentfrequency = document.getElementById("currentfrequency");
        currentfrequency.innerHTML  = `Current Value : ${contractData[8].result} seconds (${(Number(contractData[8].result)/86400).toFixed(2)} Days)`
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

        document.getElementById("totalTillDate").innerHTML =`Total Token Distributed till Date : ${(Number(contractData[9].result)/Math.pow(10,18)).toFixed(2)} DMTK`


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
                    alert("success");
                }else{
                    alert("Error");
                }
            }catch(e){
                alert(e);
            }
        })



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
