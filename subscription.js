import {writeContract,waitForTransaction,readContract,readContracts, erc20ABI} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';
import {M_TYPE_Member,M_TYPE_Promoter,M_TYPE_Guest} from './config';
import subscriptionABI from './ABI_SUBSCRIPTION.json';
import ABI_ERC20 from './ABI_ERC20.json'
import getPlanName from "./contractUtils";
import ABI_DMTK from "./ABI_DMTK.json";
import {copyToClipboard} from "./common.js";

import { usdtAddress,DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,DM_MEMBERSHIP_ADDRESS } from './config';
import DM_CONFIG_ABI from './ABI_DM_CONFIG.json';
import DM_MANAGER_ABI from './ABI_DM_MANAGER.json';
import DM_CPDISTRIBUTOR_ABI from './ABI_DM_CPDISTRIBUTOR.json';
import DM_TOKEN_ABI from './ABI_DM_TOKEN.json';
import DM_MEMBERSHIP_ABI from './ABI_DM_MEMBERSHIP.json';

const actionsselect = document.getElementById("actionsselect")

const planName = document.getElementById("plan-name");
const validity = document.getElementById("validity");
const walletid = document.getElementById("walletid");
const totalDeposits = document.getElementById("total-deposits");
const totalEarnings = document.getElementById("total-earnings");
const benefits = document.getElementById("benefits");
const carddiv = document.getElementById("carddiv");
const depoandearningdiv = document.getElementById("depoandearningdiv");
const renewbtndiv = document.getElementById("button-renew");
const topupdiv = document.getElementById("button-topup");
const renewBtn = document.getElementById("btn-renew");
const topupBtn = document.getElementById("btn-topup");
const labeltopup = document.getElementById("labeltopup");
const renewalCharge = document.getElementById("renewalCharge");
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
const membershipType = document.getElementById("membershipType")
const benefitsSection = document.getElementById("benefits-section")
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

var connected = ethereumClient.getAccount().isConnected;
var walletConnectedid="";

var memberType=M_TYPE_Guest;
var actionTab="";
   
var MemberbenifitsHtml = null;

var PromotorbenifitsHtml = null;

subscribeBtnCont.style.display ="none";
renewbtndiv.style.display = "none";
topupBtn.style.display = "none";
labeltopup.style.display = "none";
topupdiv.style.display = "none";
depoandearningdiv.innerHTML ="";
benefits.innerHTML = "";
topupamount.style.display ="none";
subscribeform.style.display ="none";
errorx.innerHTML = "";



function formatDateToDDMMYYYY(date) {
  // Get the day, month, and year components from the Date object
  const day = date.getDate().toString().padStart(2, '0'); // Ensure 2-digit day
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, so add 1
  const year = date.getFullYear().toString();

  // Create the formatted string in "DD-MM-YYYY" format
  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
}

var AccountData=null;
if(!connected){
  carddiv.innerHTML =``;
  carddiv.innerHTML =`<span style="text-align:center;margin-left:110px;margin-top:100px;position: fixed;">
                        Please connect your wallet <br> to join as a member.
                      <span>`;
  
                      console.log('Warning: Unable to fetch the membership details as wallet is not connected ');

}else{
      walletConnectedid=ethereumClient.getAccount().address;
     
      const usdtContract = {
          address: usdtAddress,
          abi: ABI_ERC20,
      }

      //New Contracts
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

      AccountData = await readContracts({
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
      console.log('Fetched the membership details for wallet: '+walletConnectedid);
      console.log(AccountData);

         
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

}



if(AccountData != null){

  walletid.innerHTML = walletConnectedid;

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
      approvedeposit.innerHTML = Number(utils.formatEther(AccountData[3].result)).toFixed(2)
      approvedtopup.innerHTML = Number(utils.formatEther(AccountData[3].result)).toFixed(2)
      myapprovedeposit.innerHTML = Number(utils.formatEther(AccountData[3].result)).toFixed(2)
    }


 

  if(AccountData[1].status == "failure" || AccountData[1].result[6]=="0x0000000000000000000000000000000000000000"){
    
    memberType=M_TYPE_Guest;

    planName.innerHTML = "Welcome, Dear Guest";
    subscribeform.style.display ="block";

  }else{

    memberType=AccountData[1].result[0];
    planName.innerHTML = AccountData[1].result[0]==0?"Welcome, Dear Member":"Welcome, Dear Promoter";
  
    totalDeposits.innerHTML = Number(utils.formatEther(AccountData[1].result[1])).toFixed(2);
    totalEarnings.innerHTML = Number(utils.formatEther(AccountData[1].result[2])).toFixed(2);
 
    //promotor
    if(memberType==M_TYPE_Promoter){
      topupdiv.style.display = "none";
      labeltopup.style.display ="none";
      benefits.innerHTML = PromotorbenifitsHtml;
      validity.innerHTML = formatDateToDDMMYYYY(new Date(Number(String(AccountData[1].result[3]))*1000));
      renewalCharge.innerHTML = Number(utils.formatEther(AccountData[2].result)).toFixed(2);
      topupamount.style.display ="none";
      //walletid.innerHTML = walletConnectedid;
      //subscribeform.style.display ="none";
      //renewbtndiv.style.display = "block";
    }

    //member
    if(memberType==M_TYPE_Member){
      //subscribeform.style.display ="none";
      //renewbtndiv.style.display = "block";
      benefits.innerHTML = MemberbenifitsHtml;
      validity.innerHTML = "Lifetime";
      
      labeltopup.style.display = "block";
      topupamount.style.display ="block";

      btnApprove.innerHTML  = `Approve to Subscribe/Top-up `;
      btnApprove.style.display = "block";

      if(0<=Number(utils.formatEther(AccountData[3].result)).toFixed(2)){
        topupdiv.style.display = "block";
        topupBtn.style.display = "block";
        topupBtn.disabled = true;
        btnApprove.style.display = "none";
      }else{
        btnApprove.style.display = "block";
        topupBtn.style.display = "none";
      }

    }

      //neither
    if(AccountData[1].result[6]=="0x0000000000000000000000000000000000000000"){
      renewbtndiv.style.display = "none";
      topupdiv.style.display = "none";
      labeltopup.style.display ="none";
      benefits.innerHTML = "";
      topupamount.style.display ="none";
      subscribeform.style.display ="none";
      subscribeform.style.display ="block";
    }
      
  }

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
        window.location.reload();
      }
      }catch(e){
        topupBtn.innerHTML = `Top Up`;
        topupBtn.disabled = false;
        errorx.innerHTML = "Error: "+e.shortMessage;
      }
  })

  renewBtn.addEventListener('click', async function (e) {
    try{
        const result = await writeContract({   
                                        address: DM_MANAGER_ADDRESS,
                                        abi: DM_MANAGER_ABI,
                                       functionName: 'renewSubscriptionForPromotor',});//Need to work on this
        const resultTr = await waitForTransaction({    hash: result.hash,  })
        if(resultTr.status=='success'){
            renewalCharge.innerHTML ="Membership  Renewed! Hash: "+result.hash;
        }
    }catch(e){
      errorx.innerHTML = "Error: Validity not Expired";
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
          btnApprove.innerHTML  = `Approve to Subscribe/Top-up `;
          // btnApprove.disabled = false;
          errorx.innerHTML = "Error: "+e.shortMessage;
      }
    
    const resultTr = await waitForTransaction({    hash: result.hash,  })
    if(resultTr.status=='success'){
      
      btnApprove.innerHTML  = `Approved successfully`;
      if(actionTab=="R"){
        
        btnApprove.disabled = false;
        btnApprove.style.display = "none";
        
        subscribeBtnCont.style.display ="block"

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

//Typing event on amount text new Joining member
  amountsubscriptionnewx.addEventListener("keyup",()=>{
    const amout__ = amountsubscriptionnewx.value;

    if(amout__>0){
      btnApprove.disabled = false;
      subscribeBtn.disabled = false;
    }else{
      btnApprove.disabled = true;
      subscribeBtn.disabled = true;
    }

    if(Number(amout__)<=Number(utils.formatEther(AccountData[3].result)).toFixed(2)){
      btnApprove.style.display = "none";
      subscribeBtnCont.style.display ="block"
    }else{
      btnApprove.style.display = "block";
      subscribeBtnCont.style.display ="none"
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

    const amountsubscriptionnew = document.getElementById("amountsubscriptionnew").value;
    const referrerAccount = document.getElementById("referrerAccount").value;
    const userAddress = document.getElementById("userAddress__").value;
    const name = document.getElementById("name__").value;
    const mobile = document.getElementById("mobile__").value;
    const email = document.getElementById("email__").value;
    if(!userAddress || !name || !mobile || !email || !referrerAccount){
      errorx.innerHTML = "Please fill all the mandatory fields";
      return;
    }
    var selectMTypeElement = document.getElementById("membershipType");
    var mTypeSelectedValue = selectMTypeElement.value;
    
    var minDeposit = Number(utils.formatEther(AccountData[5].result)).toFixed(2);

    if(Number(amountsubscriptionnew)<minDeposit){
      errorx.innerHTML = "Error: Minimum Deposit is "+minDeposit;
      return;
    }

    if(mTypeSelectedValue==0){
      subscribeBtn.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Please Wait`;
      subscribeBtn.disabled =true;
      try{
        const result = await writeContract({
          address: DM_MANAGER_ADDRESS,
          abi: DM_MANAGER_ABI,
          functionName: 'subscribeAsMember',
          args: [utils.parseUnits(String(amountsubscriptionnew), 18),referrerAccount,email,mobile,name],
      });
      
      const resultTr = await waitForTransaction({
          hash: result.hash,
        })
        if(resultTr.status=='success'){
          errorx.innerHTML = "Joined SuccessFully!";
          window.location.reload();
        }
      }catch(e){
        subscribeBtn.innerHTML = `Subscribe`;
        subscribeBtn.disabled =false;
        errorx.innerHTML = "Error:"+e.shortMessage;
      }
    }else{
      try{
        const result = await writeContract({
          address: DM_MANAGER_ADDRESS,
          abi: DM_MANAGER_ABI,
          functionName: 'subscribeAsPromotor',//Need to work on this
          args: [referrerAccount],
      });
      

      const resultTr = await waitForTransaction({
          hash: result.hash,
        })
        if(resultTr.status=='success'){
          errorx.innerHTML = "SUCCESS";
        }
      }catch(e){
        errorx.innerHTML = "Error:";
        subscribeBtn.innerHTML = `Subscribe`;
        subscribeBtn.disabled =false;
      }
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
      errorx.innerHTML = "Please fill all the mandatory fields";
      return;
    }
    var selectMTypeElement = document.getElementById("membershipType");
    var mTypeSelectedValue = selectMTypeElement.value;
    
    var minDeposit = Number(utils.formatEther(AccountData[5].result)).toFixed(2);

    if(Number(amountsubscriptionnew)<minDeposit){
      errorx.innerHTML = "Error: Minimum Deposit is "+minDeposit;
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
      
      const resultTr = await waitForTransaction({
          hash: result.hash,
        })
        if(resultTr.status=='success'){
          errorx.innerHTML = "Joined SuccessFully!";
          //window.location.reload();
        }
      }catch(e){
        joinBtn.innerHTML = `Join`;
        joinBtn.disabled =false;
        errorx.innerHTML = "Error:"+e.shortMessage;
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



  membershipType.addEventListener("change", function() {
    const mTypeSelectedValue = membershipType.value;
    if (mTypeSelectedValue === "0") {
      $('#amountInput').show();
      if(AccountData[5].status == "failure"){
        mindeposit.innerHTML = minimumDepositFee;
      }else{
        mindeposit.innerHTML = Number(utils.formatEther(AccountData[5].result)).toFixed(2);
      }



      benefitsSection.innerHTML =MemberbenifitsHtml;
      mindepositcontainer.style.display ="none";
      referrerAc___.style.display ="block";
      amountInput___.style.display ="block";
      name_.style.display ="block";
      userAddress_.style.display = "block";
      mobile_.style.display ="block";
      //approvedeposit.style.display="block;"
      
      email_.style.display ="block";
      mandatory.style.display ="block";
      subscribeBtnCont.style.display ="none";

      errorx.innerHTML = "";
      btnApprove.innerHTML  = `Approve to Subscribe/Top-up `;
      btnApprove.style.display = "block";
      btnApprove.disabled = true;

    } else if(mTypeSelectedValue === "1"){
      $('#amountInput').hide();
      if(Number(utils.formatEther(AccountData[3].result))  < Number(utils.formatEther(AccountData[2].result))){
        btnApprove.style.display = "block";
        subscribeBtnCont.style.display ="none"
      }else{
        btnApprove.style.display = "none";
        subscribeBtnCont.style.display ="block"
      }

      if(AccountData[5].status == "failure"){
        mindeposit.innerHTML = 120;
      }else{
        mindeposit.innerHTML = Number(utils.formatEther(AccountData[2].result)).toFixed(2);
      }

      benefitsSection.innerHTML =PromotorbenifitsHtml;
      mindepositcontainer.style.display ="none";
      referrerAc___.style.display ="block";
      amountInput___.style.display ="none";
      name_.style.display ="block";
      userAddress_.style.display = "block";
      mobile_.style.display ="block";
      email_.style.display ="block";
      madatory.style.display ="block";
    }else{
      mindepositcontainer.style.display ="none";
      benefitsSection.innerHTML ="";
      referrerAc___.style.display ="none";
      amountInput___.style.display ="none";
      name_.style.display ="none";
      userAddress_.style.display = "none";
      mobile_.style.display ="none";
      email_.style.display ="none";
      mandatory.style.display ="none";
    }
  });

  const walletidCopybutton = document.getElementById("walletidCopybutton");
  const textToCopy = document.getElementById("walletid").textContent;
  walletidCopybutton.addEventListener("click", () => {
        copyToClipboard(textToCopy);
  });



  actionsselect.addEventListener("change", function() {
    const selectedActionValue = actionsselect.value;

    actionTab=selectedActionValue;
    if (selectedActionValue == "R") {
      subscribeform.style.display ="block";    
      selfregisterform.style.display ="none";    
      topupform.style.display ="none";
      commonform.style.display ="block";  
      benefits.style.display ="none"; 
    }else if (selectedActionValue == "S") {
        subscribeform.style.display ="none";  
        selfregisterform.style.display ="block";     
        topupform.style.display ="none";
        commonform.style.display ="block";  
        benefits.style.display ="none"; 
    }else if (selectedActionValue == "T") {
      subscribeform.style.display ="none"; 
      selfregisterform.style.display ="none"; 
      topupform.style.display ="block";  
      commonform.style.display ="block";  
      benefits.style.display ="none";    
    }else{
      subscribeform.style.display ="none"; 
      selfregisterform.style.display ="none"; 
      topupform.style.display ="none";
      commonform.style.display ="none";     
      benefits.style.display ="block";   
    }

  });

}




