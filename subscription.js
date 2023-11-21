import {writeContract,waitForTransaction,readContract,readContracts, erc20ABI} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';
import {M_TYPE_Member,M_TYPE_Promoter,M_TYPE_Guest,M_TYPE_Admin} from './config';

import {copyToClipboard} from "./dm_utils";

import { usdtAddress,DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,DM_MEMBERSHIP_ADDRESS } from './config';
import DM_MANAGER_ABI from './ABI_DM_MANAGER.json';
import ABI_ERC20 from './ABI_ERC20.json';
import { maskWalletAddress,getErrorMessageContent,getInfoMessageContent,getInfoMessageandTxn,getErrorMessageandTxn,getWarnMessageandTxn } from "./dm_utils";
import {dmConfigContract,dmTXNContract,dmManagerContract,dmCPdistributorContract,
                                dmTokenContract,dmMembershipContract,usdtContract} from './config';   

import { generateBodyContent,walletAddress,membershipType,welMess } from './common';



if(generateBodyContent){
  
    var walletConnectedid=walletAddress;
    var memberType=membershipType;
    var actionTab="";
    var approvedtopupValue;
    var MemberbenifitsHtml = null;
    var PromotorbenifitsHtml = null;     

    const actionsselect = document.getElementById("actionsselect")

    const welcomemessage = document.getElementById("plan-name");
    const validity = document.getElementById("validity");
    const walletid = document.getElementById("walletid");
    const totalDeposits = document.getElementById("total-deposits");
    const totalEarnings = document.getElementById("total-earnings");
    const benefits = document.getElementById("benefits");
    const topupdiv = document.getElementById("button-topup");
    
    const topupBtn = document.getElementById("btn-topup");
    const labeltopup = document.getElementById("labeltopup");
    const subscribeBtnxx = document.getElementById("subscribeBtnxx");
    const errorx = document.getElementById("errorx");
    const topupamount = document.getElementById("amountx");
    const btnApprove = document.getElementById("btn-approve");
    const availableUSDT = document.getElementById("availableUSDT");
    const mindeposit = document.getElementById("mindeposit");
    const approvedeposit = document.getElementById("approvedeposit");
    const myapprovedeposit = document.getElementById("myapprovedeposit");
    const approvedtopup = document.getElementById("approvedtopup");
    const subscribeBtn = document.getElementById("subscribeBtnxx");
    const subscribeBtnCont = document.getElementById("subscribeBtnCont");
    const joinBtn = document.getElementById("joinBtn");
    const joinBtnCont = document.getElementById("joinBtnCont");
    const amountsubscriptionnewx = document.getElementById("amountsubscriptionnew")
    const amountSelfRegister = document.getElementById("myamount")
    //const membershipType1 = document.getElementById("membershipType")    
    const mindepositcontainer = document.getElementById("mindepositcontainer")
    const userAddress_ = document.getElementById("userAddress")
    const name_ = document.getElementById("name")
    const mobile_ = document.getElementById("mobile")
    const email_ = document.getElementById("email")
    const referrerAc___ = document.getElementById("referrerAc")
    const amountInput___ = document.getElementById("amountInput")
    const minimumTopup = document.getElementById("minimumTopup")
    const mandatory = document.getElementById("mandatory")
    const minimumDepositFee=100;
     
    var AccountData = await readContracts({
        contracts: [
              {
                  ...dmTokenContract,
                  functionName: 'balanceOf',
                  args: [ethereumClient.getAccount().address],
              },
              {
                ...dmMembershipContract,
                functionName: 'getSubscriptionDetails',
                args:[ethereumClient.getAccount().address]
              },
              {
                ...dmConfigContract,
                functionName: 'conversionFeeWallet',
              },
              {
                ...usdtContract,
                functionName: 'allowance',
                args: [ethereumClient.getAccount().address,DM_MANAGER_ADDRESS],
              },
              {
                ...usdtContract,
                functionName: 'balanceOf',
                args: [ethereumClient.getAccount().address],
              },
              {
                ...dmConfigContract,
                functionName: 'minimumDepositForMembers',
              },
      
              {
                ...dmConfigContract,
                functionName: 'minimumTopUpAmountMembers',
              },
        ],
      });

      
          
      MemberbenifitsHtml = `Benefits: <ul>
      <li style="font-size: x-small; line-height:1">Earn Level Rewards <a style="font-size: x-small" href="./index.html"> click for more </a></li>
      <li style="font-size: x-small; line-height:1">Earnigns upto 3X of investment</li>
      <li style="font-size: x-small; line-height:1">Get Weekly Community Rewards</li>
      <li style="font-size: x-small; line-height:1">Top Up Anytime</li>
      </ul>`;

      PromotorbenifitsHtml = `    Benefits: <ul>
      <li style="font-size: x-small; line-height:1">Earn Level Rewards <a href="./index.html"> click for more </a></li>
      <li style="font-size: x-small; line-height:1">Unlimited Earnings</li>
      <li style="font-size: x-small; line-height:1">Valid For 1 Year</li>
      <li style="font-size: x-small; line-height:1">You can Renew Once Validity Expires</li>
      </ul>`;


      if(AccountData != null){

        walletid.value=walletConnectedid;
        walletid.innerHTML = maskWalletAddress(String(walletConnectedid));
      
          var minTopupfees;
          if(AccountData[6].status == "failure"){
            minTopupfees = minimumDepositFee;
          }else{
            minTopupfees = `(Min TopUp: ${Number(utils.formatEther(AccountData[6].result)).toFixed(2)} USDT)`;
          }
          minimumTopup.innerHTML = minTopupfees;
      
          if(AccountData[5].status == "failure"){
            mindeposit.innerHTML = minimumDepositFee;
          }else{
            mindeposit.innerHTML = Number(utils.formatEther(AccountData[5].result)).toFixed(2);
          }
      
          if(AccountData[4].result){
            availableUSDT.innerHTML = Number(utils.formatEther(AccountData[4].result)).toFixed(2)
          }
      
          if(AccountData[3].status == "success"){
            approvedtopupValue=Number(utils.formatEther(AccountData[3].result)).toFixed(2);
            updateApprovedUSDTValue(approvedtopupValue);
          }
      
      
       
        //----------------------------------------------------------- All Forms pereration section -----------------------------------------------------------------
        if(AccountData[1].status== "success"){
          
          memberType=M_TYPE_Guest;
          errorx.innerHTML="";

         // var listBox = document.getElementById("actionsselect");

          // Array of data to populate the list box
          var listOptions = ["--Select your action--", "Home", "Join Membership", "Refer a Member", "Top up my account"];
          var listValues = ["H", "H", "S", "R", "T"];
      
          if(AccountData[1].result[6]=="0x0000000000000000000000000000000000000000"){
            memberType=M_TYPE_Guest;
          }else{
            memberType=AccountData[1].result[0];
          }
      
          totalDeposits.innerHTML = Number(utils.formatEther(AccountData[1].result[1])).toFixed(2);
          totalEarnings.innerHTML = Number(utils.formatEther(AccountData[1].result[2])).toFixed(2);
       
          //promotor
          if(memberType==M_TYPE_Promoter){
            
            listOptions = ["--Select your action--", "Home",  "Refer a Member"];
            listValues = ["H", "H", "R"];
            benefits.innerHTML = PromotorbenifitsHtml;
            validity.innerHTML = "Annual";   
            //validity.innerHTML = "";//formatDateToDDMMYYYY(new Date(Number(String(AccountData[1].result[3]))*1000));
            //renewalCharge.innerHTML = Number(utils.formatEther(AccountData[2].result)).toFixed(2);
            
          }
      
          //member
          if(memberType==M_TYPE_Member){
            
            benefits.innerHTML = MemberbenifitsHtml;
            validity.innerHTML = "Lifetime";   
      
          }
      
          //Admin
          if(memberType==M_TYPE_Admin){
            
            benefits.innerHTML = "";
            validity.innerHTML = "Lifetime";   
      
          }
      
          //neither
          if(memberType==M_TYPE_Guest){
            
            if(AccountData[1].result[6]=="0x0000000000000000000000000000000000000000"){              
              benefits.innerHTML = "";              
            }
          }
      
           welcomemessage.innerHTML = welMess; 
        }
      


                
        // Loop through the data and create options
        for (var i = 0; i < listOptions.length; i++) {
            var option = document.createElement("option");
            option.value = listValues[i]; 
            option.text = listOptions[i]; 
            actionsselect.appendChild(option); 
        }

        //--------------------------------------------------------------Events ---------------------------------------------------------------------------------
        //Member's top up button event
        topupBtn.addEventListener('click', async function (e) {
          try{
              errorx.innerHTML = "";
              topupBtn.disabled = true;
              topupBtn.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Please Wait`;
              var amountoTopup_ = topupamount.value;
              const result = await writeContract({
                address: DM_MANAGER_ADDRESS,
                abi: DM_MANAGER_ABI,
                functionName: 'topUpSubscriptionForMember',
                args: [utils.parseUnits(String(amountoTopup_), 18)],
              })
      
              const resultTr = await waitForTransaction({
                hash: result.hash,
              })
                if(resultTr.status=='success'){          
                  errorx.innerHTML = getInfoMessageandTxn(amountoTopup_+" USDT top up was successfull with hash: ",result.hash);
                  topupamount.value=0;
                }else{
                  errorx.innerHTML = getErrorMessageandTxn(amountoTopup_+" USDT top up failed hash: ",result.hash);
                  topupBtn.disabled = false;   
                }
            }catch(e){
              errorx.innerHTML = getErrorMessageContent(" Exception occurred: Top up failed "+e.shortMessage);
              topupBtn.disabled = false;   
            }finally{
              topupBtn.innerHTML = `Top Up`;             
            }
        })
      
      
        //Approve button event
        btnApprove.addEventListener('click', async function (e) {
          
          var amountToApprove_ = 0;
          
          if(actionTab=="R"){
            amountToApprove_=amountsubscriptionnewx.value;
          }else if(actionTab=="T"){
            amountToApprove_=topupamount.value;
          }else if(actionTab=="S"){
            amountToApprove_=amountSelfRegister.value;
          }
      
          if(amountToApprove_==0 || amountToApprove_==""){
            alert('Approval amount cannot be zero');
            return;
          }
          
          var result;
            try{
              btnApprove.disabled = true;
              btnApprove.innerHTML  = `<i class="fa fa-refresh fa-spin"></i> Please Wait`;
              result = await writeContract({address: usdtAddress, abi: ABI_ERC20, functionName: 'approve',
                                              args: [DM_MANAGER_ADDRESS, utils.parseUnits(String(amountToApprove_), 18)], });
              
            }catch(e){
                btnApprove.disabled = false;
                btnApprove.innerHTML  = `Approve to Subscribe/Top-up`;
                // btnApprove.disabled = false;
                errorx.innerHTML = getErrorMessageContent("Error: "+e.shortMessage);
            }
          
          const resultTr = await waitForTransaction({ hash: result.hash,  })
          
          if(resultTr.status=='success'){
                  
            btnApprove.innerHTML  = `Approved successfully`;
      
            updateApprovedUSDTValue(amountToApprove_);
            errorx.innerHTML=getWarnMessageandTxn(amountToApprove_+" USDT successfully approved, Proceed with join/top-up ",result.hash);
      
            if(actionTab=="R"){
              
              btnApprove.disabled = false;
              btnApprove.style.display = "none";
              
              subscribeBtn.style.display ="block"
      
            }else if(actionTab=="T"){
              
              btnApprove.disabled = false;
              btnApprove.style.display = "none";
      
              topupdiv.style.display = "block";
              topupBtn.style.display = "block";
      
            }
            else if(actionTab=="S"){
              
              btnApprove.disabled = false;
              btnApprove.style.display = "none";
      
              joinBtnCont.style.display = "block";
              joinBtn.style.display = "block";
      
            }
            //window.location.reload();
          }
        })
      
      //Typing event on amount text in new Joining member
        amountsubscriptionnewx.addEventListener("keyup",()=>{
          const amout__ = amountsubscriptionnewx.value;
          errorx.innerHTML = "";
          btnApprove.innerHTML  = `Approve to Subscribe/Top-up `;
      
          if(amout__>0){
            btnApprove.disabled = false;
            subscribeBtn.disabled = false;
          }else{
            btnApprove.disabled = true;
            subscribeBtn.disabled = true;
          }
      
          if(Number(amout__)<=Number(utils.formatEther(AccountData[3].result)).toFixed(2)){
            btnApprove.style.display = "none";
            subscribeBtn.style.display ="block"
          }else{
            btnApprove.style.display = "block";
            subscribeBtn.style.display ="none"
            
          }
          
        });
      
      //Typing event on amount text in Topup for memeber
        topupamount.addEventListener("keyup",()=>{
            const amout__ = topupamount.value;
           
            errorx.innerHTML = "";
            btnApprove.innerHTML  = `Approve to Subscribe/Top-up `;
      
            if(amout__>0){
              btnApprove.disabled = false;
              topupBtn.disabled = false;
            }else{
              btnApprove.disabled = true;
              topupBtn.disabled = true;
            }
            
            if(Number(amout__)<=Number(utils.formatEther(AccountData[3].result)).toFixed(2)){
              topupdiv.style.display = "block";
              topupBtn.style.display = "block";
              btnApprove.style.display = "none";
            }else{
              btnApprove.style.display = "block";
              topupBtn.style.display = "none";
            }
            
          });
      
      
        //Typing event on amount text self Joining member
        amountSelfRegister.addEventListener("keyup",()=>{
          const amout__ = amountSelfRegister.value;
      
          errorx.innerHTML = "";
          btnApprove.innerHTML  = `Approve to Subscribe/Top-up `;

          if(amout__>0){
            btnApprove.disabled = false;
            joinBtn.disabled = false;
          }else{
            btnApprove.disabled = true;
            joinBtn.disabled = true;
          }
      
          if(Number(amout__)<=Number(utils.formatEther(AccountData[3].result)).toFixed(2)){
            btnApprove.style.display = "none";
            joinBtnCont.style.display ="block"
          }else{
            btnApprove.style.display = "block";
            joinBtnCont.style.display ="none"
          }
          
        });
      
        //Refer a member registration
        subscribeBtn.addEventListener('click', async function (e) {
      
          errorx.innerHTML="";
          const amountsubscriptionnew = document.getElementById("amountsubscriptionnew").value;
          const referrerAccount = document.getElementById("referrerAccount").value;
          const userAddress = document.getElementById("userAddress__").value;
          const name = document.getElementById("name__").value;
          const mobile = document.getElementById("mobile__").value;
          const email = document.getElementById("email__").value;
          if(!userAddress || !name || !referrerAccount){
            errorx.innerHTML = getErrorMessageContent("Please fill all the mandatory fields");
            return;
          }
                    
          var minDeposit = Number(utils.formatEther(AccountData[5].result)).toFixed(2);
      
          if(Number(amountsubscriptionnew)<minDeposit){
            errorx.innerHTML =getErrorMessageContent( "Error: Minimum Deposit is "+minDeposit);
            return;
          }
   
            subscribeBtn.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Please Wait`;
            subscribeBtn.disabled =true;
            try{
              const result = await writeContract({
                address: DM_MANAGER_ADDRESS,
                abi: DM_MANAGER_ABI,
                functionName: 'registerForAMember',
                args: [userAddress,utils.parseUnits(String(amountsubscriptionnew), 18),referrerAccount,email,mobile,name],
            });
            
            const resultTr = await waitForTransaction({
                hash: result.hash,
              })
              if(resultTr.status=='success'){
                //errorx.innerHTML = "Joined SuccessFully!";
                errorx.innerHTML=getInfoMessageandTxn(amountsubscriptionnew+
                  " USDT paid & successfully registered for your member",result.hash);
                //window.location.reload();
              }
            }catch(e){
              errorx.innerHTML = getErrorMessageContent("Error: Unable to register for member "+
                                      userAddress+" Error Message:"+e.shortMessage);
              subscribeBtn.innerHTML = `Re-try Registering`;
              subscribeBtn.disabled =false;
              
            }
          
        });
      
        //self registration after approval event  
        joinBtn.addEventListener('click', async function (e) {
      
          const amountsubscriptionnew = document.getElementById("myamount").value;
          const referrerAccount = document.getElementById("myreferrerAccount").value;
          //const userAddress = document.getElementById("userAddress__").value;
          //const name = document.getElementById("name__").value;
          //const mobile = document.getElementById("mobile__").value;
          //const email = document.getElementById("email__").value;
          if(!referrerAccount){
            errorx.innerHTML = getErrorMessageContent("Please fill all the mandatory fields");
            return;
          }
          
          var minDeposit = Number(utils.formatEther(AccountData[5].result)).toFixed(2);
      
          if(Number(amountsubscriptionnew)<minDeposit){
            errorx.innerHTML = getErrorMessageContent("Error: Minimum Deposit is "+minDeposit);
            return;
          }
      
          if(actionTab=="S"){
            subscribeBtn.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Please Wait`;
            subscribeBtn.disabled =true;
            try{
              const result = await writeContract({
                address: DM_MANAGER_ADDRESS,
                abi: DM_MANAGER_ABI,
                functionName: 'SelfRegistrationasMember',
                args: [utils.parseUnits(String(amountsubscriptionnew), 18),referrerAccount],
              });
            
              const resultTr = await waitForTransaction({ hash: result.hash,    })
              if(resultTr.status=='success'){
                errorx.innerHTML = getInfoMessageandTxn("Joined as memeber successFully!",result.hash);
                //window.location.reload();
              }
            }catch(e){
              errorx.innerHTML = getErrorMessageContent("Error:"+e.shortMessage);
              joinBtn.innerHTML = `Try again to Join`;
              joinBtn.disabled =false;        
            }
          }else{
            /*
            
                  try{
      
              const result = await writeContract({
                address: DM_MANAGER_ADDRESS,
                abi: DM_MANAGER_ABI,
                functionName: 'subscribeAsPromotor',//Need to work on this
                args: [referrerAccount],
                 });
            
      
                const resultTr = await waitForTransaction({
                                    hash: result.hash,        })
      
              if(resultTr.status=='success'){
                errorx.innerHTML = "SUCCESS";
              }
            }catch(e){
              errorx.innerHTML = "Error:";
              joinBtn.innerHTML = `Subscribe`;
              joinBtn.disabled =false;
            }
            
            */
      
          }
        });
      
      

        const walletidCopybutton = document.getElementById("walletidCopybutton");
        const textToCopyValue = document.getElementById("walletid").value;
        walletidCopybutton.addEventListener("click", () => {
              copyToClipboard(textToCopyValue);
        });
      
        //Adding even for copy button on Sponsor input box.
        const copymine = document.getElementById("copymineassponsor");
        const referrerAccountInputBox = document.getElementById("referrerAccount");  
        copymine.addEventListener("click", () => {
             referrerAccountInputBox.value=walletConnectedid;
        });

        //Event to handle the action selection
      
        actionsselect.addEventListener("change", function() {
      
          //alert("Member Type: "+memberType);
          const selectedActionValue = actionsselect.value;
          errorx.innerHTML="";
          actionTab=selectedActionValue;

          referMemberform.style.display ="none"; 
          selfregisterform.style.display ="none"; 
          topupform.style.display ="none";
          commonform.style.display ="none";     
          benefits.style.display ="none"; 

          if(memberType==M_TYPE_Admin){
      
            errorx.innerHTML=getInfoMessageContent("Admin dont have access to Subscription actions");
            referMemberform.style.display ="none"; 
            selfregisterform.style.display ="none"; 
            topupform.style.display ="none";
            commonform.style.display ="none";     
            benefits.style.display ="block";   
            return;
          }
      
          if (selectedActionValue == "R") {
            referMemberform.style.display ="block";    
            benefits.style.display ="none";             
            selfregisterform.style.display ="none";    
            commonform.style.display ="block";  

            if(approvedtopupValue>0){
              subscribeBtnxx.style.display ="block";
              subscribeBtnxx.disabled = false;

              
              btnApprove.style.display = "none";
              btnApprove.disabled = true;  
            }else{
              subscribeBtnxx.style.display ="none";
              subscribeBtnxx.disabled = true;

              
              btnApprove.style.display = "block";
              btnApprove.disabled = false;
            }


            
          }else if (selectedActionValue == "S") {
              
              referMemberform.style.display ="none";  
              topupform.style.display ="none";        
              benefits.style.display ="none"; 
      
              selfregisterform.style.display ="block";  
      
              if(memberType==M_TYPE_Member){
                selfregisterform.innerHTML="You are already registered. Top up to enjoy more benefits"
                topupBtn.style.display = "none";  
                btnApprove.style.display = "none";          
              }else{
                commonform.style.display ="block";  
                if(approvedtopupValue>0){
                  joinBtn.style.display = "block";  
                  joinBtn.disabled = true;          
                  btnApprove.style.display = "none";
                  btnApprove.disabled = true;
                }else{
                  joinBtn.style.display = "none";
                  joinBtn.disabled = true;
                  btnApprove.style.display = "block";
                  btnApprove.disabled = true;
                }       
              }   
      
      
      
          }else if (selectedActionValue == "T") {
            
            referMemberform.style.display ="none";       
            selfregisterform.style.display ="none"; 
            benefits.style.display ="none";    
      
            topupform.style.display ="block";  
            if(memberType != M_TYPE_Member){
              topupform.innerHTML="Please register as member before you can top up."
            }else{
              commonform.style.display ="block";  
      
              if(approvedtopupValue>0){
                topupBtn.style.display = "block";  
                topupBtn.disabled = true;          
                btnApprove.style.display = "none";
                btnApprove.disabled = true;
              }else{
                topupBtn.style.display = "none";
                topupBtn.disabled = true;
                btnApprove.style.display = "block";
                btnApprove.disabled = true;
              }        
            }   
            
          }else{
            referMemberform.style.display ="none"; 
            selfregisterform.style.display ="none"; 
            topupform.style.display ="none";
            commonform.style.display ="none";     
            benefits.style.display ="block";   
          }
      
        });
      
      }else{
        errorx.innerHTML="Unable to connect to connect the DM Web3"
      }

      function updateApprovedUSDTValue(newapprovedtopupValue){
        approvedtopupValue=newapprovedtopupValue
        approvedeposit.innerHTML = approvedtopupValue
        approvedtopup.innerHTML = approvedtopupValue
        myapprovedeposit.innerHTML = approvedtopupValue
      }

}








