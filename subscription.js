import {writeContract,waitForTransaction,readContract,readContracts, erc20ABI} from '@wagmi/core';
import ethereumClient from "./walletConnect";
import {utils} from 'ethers';
import {subscriptionAddress,tokenAddress,usdtAddress} from './config';
import subscriptionABI from './ABI_SUBSCRIPTION.json';
import ABI_ERC20 from './ABI_ERC20.json'
import getPlanName from "./contractUtils";
import ABI_DMTK from "./ABI_DMTK.json";
import {copyToClipboard} from "./common.js";

const planName = document.getElementById("plan-name");
const validity = document.getElementById("validity");
const walletid = document.getElementById("walletid");
const totalDeposits = document.getElementById("total-deposits");
const totalEarnings = document.getElementById("total-earnings");
const benefits = document.getElementById("benefits");
const carddiv = document.getElementById("carddiv");
const renewbtndiv = document.getElementById("button-renew");
const topupdiv = document.getElementById("button-topup");
const renewBtn = document.getElementById("btn-renew");
const topupBtn = document.getElementById("btn-topup");
const labeltopup = document.getElementById("labeltopup");
const renewalCharge = document.getElementById("renewalCharge");
const errorx = document.getElementById("errorx");
const amountx = document.getElementById("amountx");
const btnApprove = document.getElementById("btn-approve");
const availableUSDT = document.getElementById("availableUSDT");
const mindeposit = document.getElementById("mindeposit");
const subscribeBtn = document.getElementById("subscribeBtnxx");
const subscribeBtnCont = document.getElementById("subscribeBtnCont");
const amountsubscriptionnewx = document.getElementById("amountsubscriptionnew")
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
var MTYPE_Memeber = "0";
var MTYPE_Promoter = "1";

var AccountData=null;
if(!connected){
  carddiv.innerHTML =``;
  carddiv.innerHTML =`<span style="text-align:center;margin-left:110px;margin-top:100px;position: fixed;">
                        Please connect your wallet <br> to join as a member.
                      <span>`;
  
                      console.log('Warning: Unable to fetch the membership details as wallet is not connected ');

}else{
      walletConnectedid=ethereumClient.getAccount().address;

      const subscriptionContract = {
        address: subscriptionAddress,
        abi: subscriptionABI,
      }
        
      const dmtkCOntract = {
        address: tokenAddress,
        abi: ABI_DMTK,
      }
      
      const usdtContract = {
          address: usdtAddress,
          abi: ABI_ERC20,
      }

      AccountData = await readContracts({
        contracts: [
              {
                  ...dmtkCOntract,
                  functionName: 'balanceOf',
                  args: [ethereumClient.getAccount().address],
              },
              {
                ...subscriptionContract,
                functionName: 'getSubscriptionDetails',
                args:[ethereumClient.getAccount().address]
              },
              {
                ...dmtkCOntract,
                functionName: 'conversionFeeWallet',
              },
              {
                ...usdtContract,
                functionName: 'allowance',
                args: [ethereumClient.getAccount().address,tokenAddress],
              },
              {
                ...usdtContract,
                functionName: 'balanceOf',
                args: [ethereumClient.getAccount().address],
              },
              {
                ...dmtkCOntract,
                functionName: 'minimumDepositForMembers',
              },
      
              {
                ...dmtkCOntract,
                functionName: 'minimumTopUpAmountMembers',
              },
        ],
      });
      console.log('Fetched the membership details for wallet: '+walletConnectedid);
      console.log('Membership details : '+AccountData);
}



if(AccountData != null){

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

    //minimumDepositFee
    amountx.addEventListener("keyup",()=>{
      const amout__ = amountx.value;
      if(Number(amout__)<=Number(utils.formatEther(AccountData[3].result)).toFixed(2)){
        topupBtn.style.display = "block";
        btnApprove.style.display = "none";
      }else{
        btnApprove.style.display = "block";
        topupBtn.style.display = "none";
      }
      
    });
}


function formatDateToDDMMYYYY(date) {
  // Get the day, month, and year components from the Date object
  const day = date.getDate().toString().padStart(2, '0'); // Ensure 2-digit day
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, so add 1
  const year = date.getFullYear().toString();

  // Create the formatted string in "DD-MM-YYYY" format
  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
}


if(AccountData != null){
  if(AccountData[1].status == "failure" || AccountData[1].result[6]=="0x0000000000000000000000000000000000000000"){
    planName.innerHTML = "Welcome, Dear Guest";

      renewbtndiv.style.display = "none";
      topupdiv.style.display = "none";
      labeltopup.style.display ="none";
      benefits.innerHTML = "";
      amountx.style.display ="none";
      walletid.innerHTML = walletConnectedid;
      //subscribeform.style.display ="none";
      subscribeform.style.display ="block";

  }else{
    planName.innerHTML = AccountData[1].result[0]==0?"Welcome, Dear Member":"Welcome, Dear Promoter";
    totalDeposits.innerHTML = Number(utils.formatEther(AccountData[1].result[1])).toFixed(2);
    totalEarnings.innerHTML = Number(utils.formatEther(AccountData[1].result[2])).toFixed(2);
    walletid.innerHTML = walletConnectedid;

      var MemberbenifitsHtml = `Benefits: <ul>
      <li>Earn Level Rewards <a href="./index.html"> click for more </a></li>
      <li>Earnigns upto 3X of investment</li>
      <li>Get Weekly Community Rewards</li>
      <li>Top Up Anytime</li>
      </ul>`;

      var PromotorbenifitsHtml = `    Benefits: <ul>
      <li>Earn Level Rewards <a href="./index.html"> click for more </a></li>
      <li>Unlimited Earnings</li>
      <li>Valid For 1 Year</li>
      <li>You can Renew Once Validity Expires</li>
      </ul>`;

    //promotor
    if(AccountData[1].result[0]==1){
      topupdiv.style.display = "none";
      labeltopup.style.display ="none";
      benefits.innerHTML = PromotorbenifitsHtml;
      validity.innerHTML = formatDateToDDMMYYYY(new Date(Number(String(AccountData[1].result[3]))*1000));
      renewalCharge.innerHTML = Number(utils.formatEther(AccountData[2].result)).toFixed(2);
      amountx.style.display ="none";
      //walletid.innerHTML = walletConnectedid;
      subscribeform.style.display ="none";
    }

    //member
    if(AccountData[1].result[0]==0){
      subscribeform.style.display ="none";
      renewbtndiv.style.display = "none";
      benefits.innerHTML = MemberbenifitsHtml;
      validity.innerHTML = "Lifetime";
      //walletid.innerHTML = walletConnectedid;
      amountx.style.display ="block";

      topupBtn.addEventListener('click', async function (e) {
        try{
          topupBtn.disabled = true;
          topupBtn.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Please Wait`;
          var amountx_ = amountx.value;
          const result = await writeContract({
            address: tokenAddress,
            abi: ABI_DMTK,
            functionName: 'topUpSubscriptionForMember',
            args: [utils.parseUnits(String(amountx_), 18)],
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

    }

      //neither
    if(AccountData[1].result[6]=="0x0000000000000000000000000000000000000000"){
      renewbtndiv.style.display = "none";
      topupdiv.style.display = "none";
      labeltopup.style.display ="none";
      benefits.innerHTML = "";
      amountx.style.display ="none";
      subscribeform.style.display ="none";
      subscribeform.style.display ="block";
    }
  
    
  }


  renewBtn.addEventListener('click', async function (e) {
    try{
        const result = await writeContract({    address: tokenAddress,    abi: ABI_DMTK,    functionName: 'renewSubscriptionForPromotor',});
        const resultTr = await waitForTransaction({    hash: result.hash,  })
        if(resultTr.status=='success'){
            renewalCharge.innerHTML ="Membership  Renewed! Hash: "+result.hash;
        }
    }catch(e){
      errorx.innerHTML = "Error: Validity not Expired";
    }
  })

  btnApprove.addEventListener('click', async function (e) {
    var amountx_p = amountx.value;
    var amountx_ = amountx.value;
    if(amountx_==""){
      amountx_ =  amountsubscriptionnewx.value;
      if(amountx_==""){
        amountx_ = Number(utils.formatEther(AccountData[2].result)).toFixed(2);
      }
    }
    
    var result;
      try{
        btnApprove.disabled = true;
        btnApprove.innerHTML  = `<i class="fa fa-refresh fa-spin"></i> Please Wait`;
        result = await writeContract({address: usdtAddress, abi: ABI_ERC20, functionName: 'approve',
                                        args: [tokenAddress, utils.parseUnits(String(amountx_), 18)], });
      }catch(e){
          btnApprove.disabled = false;
          btnApprove.innerHTML  = `Approve`;
          // btnApprove.disabled = false;
          errorx.innerHTML = "Error: "+e.shortMessage;
      }


    const resultTr = await waitForTransaction({    hash: result.hash,  })
    if(resultTr.status=='success'){
      if(amountx_p==""){
        btnApprove.disabled = false;
        btnApprove.style.display = "none";
        subscribeBtnCont.style.display ="block"

      }else{
        btnApprove.disabled = false;
      btnApprove.style.display = "none";
      topupBtn.style.display = "block";
      }
    }
  })


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
    console.log("Membershiptype value: "+mTypeSelectedValue);
    var min = Number(utils.formatEther(AccountData[5].result)).toFixed(2);

    if(Number(amountsubscriptionnew)<min){
      errorx.innerHTML = "Error:"+"Minimum Deposit is "+min;
      return;
    }
    
    if(mTypeSelectedValue==0){
      subscribeBtn.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Please Wait`;
      subscribeBtn.disabled =true;
      try{
        const result = await writeContract({
          address: tokenAddress,
          abi: ABI_DMTK,
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
          address: tokenAddress,
          abi: ABI_DMTK,
          functionName: 'subscribeAsPromotor',
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

  amountsubscriptionnewx.addEventListener("keyup",()=>{
    const amout__ = amountsubscriptionnewx.value;
    if(Number(amout__)<=Number(utils.formatEther(AccountData[3].result)).toFixed(2)){
      btnApprove.style.display = "none";
      subscribeBtnCont.style.display ="block"
    }else{
      btnApprove.style.display = "block";
      subscribeBtnCont.style.display ="none"
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
      
      email_.style.display ="block";
      mandatory.style.display ="block";
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

}



