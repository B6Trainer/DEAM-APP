import {waitForTransaction, writeContract,readContracts,readContract} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';
import { DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,DM_MEMBERSHIP_ADDRESS, usdtAddress,DM_TXN_ADDRESS } from './config';
import DM_CONFIG_ABI from './ABI_DM_CONFIG.json';
import DM_MANAGER_ABI from './ABI_DM_MANAGER.json';
import DM_CPDISTRIBUTOR_ABI from './ABI_DM_CPDISTRIBUTOR.json';
import DM_TOKEN_ABI from './ABI_DM_TOKEN.json';
import DM_MEMBERSHIP_ABI from './ABI_DM_MEMBERSHIP.json';
import USDT_ABI from './ABI_ERC20.json';
import DM_TXN_ABI from './ABI_DM_TXN.json';
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

        const dmTXNContract = {
            address: DM_TXN_ADDRESS,
            abi: DM_TXN_ABI,
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
        

        var cpwalletloc=0;
        var cpwalletloc=0;
        var cpwalletloc=0;
        var cpwalletloc=0;



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

        var profResultLoc=17;
        var startIndexLoc=16;
        var minTopUpLoc=15;
        var minDepoLoc=14;

        //-------------------------------------------------------------Welcome message--------------------------------------------------------
       

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
        const txndetails = document.getElementById("txndetails");
        
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
            txndetails.style.display ="none";  

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
            }else if (selectedActionValue == "LR") {
                txndetails.style.display ="block";  
            }

        });




        //--------------------------------------------------------------Admin Wallet details------------------------------------------------------------------------------------
        var walletnamearray = ["CommunityPoolWallet","MarketingWallet","TechnologyWallet","TransactionPoolWallet","FoundersWallet","ConversionFeeWallet"]
        
        var adminWalletAddArray=[contractData[0].result,contractData[1].result,contractData[2].result,contractData[3].result,contractData[4].result,contractData[5].result]
        
        var table = document.getElementById("myTable");
        var tbody = document.getElementById("myTableBody");

        var adminWalletTableheaders = ["Wallet Name","Wallet Address", "New Address", "Update"]; 
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

        var tableelement=document.getElementById("adminwallettable");
        tableelement.appendChild(adminWallettable);

       


        if(contractData!=null || contractData[profResultLoc]!=null){


        



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

                //contractListandBalances.push(contractBalanceData);
                console.log(contractBalanceData);
                console.log(ContractBalanceDetails[0].result+" "+ContractBalanceDetails[1].result);
    
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
            var profileTableheaders = [ "Profile type", "Name","Wallet Address", "Phone", "Email","Subscribed Balance", "Rewards gained", "Sponsor"]; // Profile header values
                    
            var profileCountSpan = document.getElementById("profileCount");
                profileCountSpan.innerHTML = profilecount;
          

            var profiletable = document.createElement('table');   
            // Create header row              
            var headerRow1 = profiletable.insertRow();
            for (var i = 0; i < profileTableheaders.length; i++) {
                var th = document.createElement('th');
                th.textContent = profileTableheaders[i];
                headerRow1.appendChild(th);
            }
 
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
        
                walletaddcell.innerHTML = maskWalletAddress(walletaddArr[i]);
                profiletypecell.innerHTML = defineMembership(profiletypeArr[i]);
                namecell.innerHTML = nameArr[i];
                phonecell.innerHTML = phoneArr[i];
                emailcell.innerHTML = emailArr[i];
                subscell.innerHTML = Number(utils.formatEther(subsBalanceArr[i])).toFixed(2);;
                rewardscell.innerHTML = Number(utils.formatEther(rewardsReceivedArr[i])).toFixed(2);
                sponsorcell.innerHTML = maskWalletAddress(sponsor[i]);
                
            }
            var tableelement=document.getElementById("profiledetailstable");
            tableelement.appendChild(profiletable);

        }

        //--------------------------------------------------------------Distribution logic------------------------------------------------------------------------------------


        var lastDistributeTime = document.getElementById("lastDistributeTime");
        lastDistributeTime.innerHTML = "";// ` ${new Date(Number(contractData[7].result)*1000)}`;

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
                    messagex.innerHTML = getInfoMessageandTxn("DCP distribution successful : ",result.hash);
                   // alert("success");
                }else{
                    messagex.innerHTML = getErrorMessageandTxn("DCP distribution failed: ",result.hash);
                    //alert("Error");
                }
            }catch(e){
                messagex.innerHTML = getErrorMessageandTxn("DCP distribution failed due to exception ");
                console.log("DCP distribution failed due to exception ");
                console.log(e);
            }
        })

       
        
    var dcpRefresh = document.getElementById("dcpRefresh");
    var compoolbalanceElm = document.getElementById("compoolbalance");
    var totalDistributionElm = document.getElementById("totalTillDate");
       //Adding event to  frequency update button
       dcpRefresh.addEventListener("click", async function(){

            var comPoolAddress=adminWalletAddArray[0];
            const dcpContractData = await readContracts({
                contracts: [

                    {
                        ...dmTokenContract,
                        functionName: 'balanceOf',//0
                        args: [comPoolAddress],
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
                    compoolbalance=dcpContractData[0].result;
                }

            }

            compoolbalanceElm.innerHTML=compoolbalance;
            lastDistributeTime.innerHTML = ` ${new Date(Number(dcpContractData[1].result)*1000)}`;
            currentfrequency.innerHTML  = ` ${dcpContractData[2].result} seconds (${(Number(dcpContractData[2].result)/86400).toFixed(2)} Days)`
            totalDistributionElm.innerHTML =`${(Number(dcpContractData[3].result)/Math.pow(10,18)).toFixed(2)} DMTK`
            startIndexTextbox.value = dcpContractData[4].result;
            startIndexTextbox.disabled=false;



        });//End of refersh button event
        
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

        //-----------------------------------------------------------------------Level Reward section -----------------------------------------------------


            var sponsorlevelsearchbtn = document.getElementById("sponsorlevelsearchbtn");
            sponsorlevelsearchbtn.addEventListener("click", async function() {
            var txndetails1element=document.getElementById("txndetailstable");
            messagex.innerHTML = "";
            txndetails1element.innerHTML="";

            var sponsorAddress=    document.getElementById("sponsoridleveltext").value;
        
            if(sponsorAddress == null || sponsorAddress ==""){
                messagex.innerHTML = getErrorMessageContent("Sponsor address cannot be empty");
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



            if(ContractResponseData[0].status =="failure" || ContractResponseData[0].result[6]=="0x0000000000000000000000000000000000000000"){

                txndetails1element.innerHTML="Unable to fetch data from Contract";

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


        })



}//End of else loop, if wallet is connected
