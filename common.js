import { readContracts,watchAccount,watchNetwork,getNetwork } from "@wagmi/core";
import ethereumClient from "./walletConnect";
import {defaultChainId,M_TYPE_Guest,M_TYPE_Member,M_TYPE_Promoter,M_TYPE_Admin} from './config'
import { usdtAddress,DM_MANAGER_ADDRESS,DM_CONFIG_ADDRESS,DM_CPDISTRIBUTOR_ADDRESS,DM_TOKEN_ADDRESS,DM_MEMBERSHIP_ADDRESS } from './config';
import DM_CONFIG_ABI from './ABI_DM_CONFIG.json';
import DM_MANAGER_ABI from './ABI_DM_MANAGER.json';
import DM_CPDISTRIBUTOR_ABI from './ABI_DM_CPDISTRIBUTOR.json';
import DM_TOKEN_ABI from './ABI_DM_TOKEN.json';
import DM_MEMBERSHIP_ABI from './ABI_DM_MEMBERSHIP.json';
import ABI_ERC20 from './ABI_ERC20.json'

export var wconnected = ethereumClient.getAccount().isConnected;
var previousAddress;
var previousNetwork;
var walletAddress="";
var membershipType=M_TYPE_Guest;
var welMess="Welcome, Dear visitor"; 
export const zeroaddress="0x0000000000000000000000000000000000000000";

if (wconnected) {

    const { chain } =  getNetwork();
    previousNetwork = chain.id;
    previousAddress = ethereumClient.getAccount().address;
    walletAddress=ethereumClient.getAccount().address;

    console.log('Common.js : Wallet connected with address: '+walletAddress);

    const usdtContract = {
      address: usdtAddress,
      abi: ABI_ERC20,
    }

    //New Contracts
    const dmConfigContract = {
      address: DM_CONFIG_ADDRESS,
      abi: DM_CONFIG_ABI,
    }

    const dmMembershipContract = {
      address: DM_MEMBERSHIP_ADDRESS,
      abi: DM_MEMBERSHIP_ABI,
    }


    var ClientData = await readContracts({
      contracts: [
           
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
              functionName: 'balanceOf',
              args: [ethereumClient.getAccount().address],
            }
      ],
    });

    if(ClientData!=null){

      if(ClientData[0].result[6]==zeroaddress){
        membershipType=M_TYPE_Guest;
      }else{
        membershipType=ClientData[0].result[0];
        console.log('Common.js : Fetched the membership details for wallet: '+walletAddress)+' Membership type: '+membershipType;
      }

          //promotor
      if(membershipType==M_TYPE_Promoter){
        welMess="Welcome, Dear Promoter";      
      }

      //member
      if(membershipType==M_TYPE_Member){
        welMess="Welcome, Dear Member";      
      }

      //Guest
      if(membershipType==M_TYPE_Guest){
        welMess="Welcome, Dear Guest";      
      }

      if(membershipType==M_TYPE_Admin){
        welMess="Welcome, Dear Admin";      
      }

    }

    const unwatch = watchAccount((account) => {
      if (account.address!=undefined && previousAddress != account.address) {
        window.location.reload();
      }
    });
    
    const unwatch1 = watchNetwork((network) =>
        {
          if(network.chain !=undefined){
            previousNetwork = network.chain.id;
        if(previousNetwork != defaultChainId){
            //window.location.href="./home.html";
            //switchChain.style.display ="block";
            //connectBtn.style.display = "none";
            //openApp.style.display = "none";
        }
      }
    });
}

export var walletAddress;
export var membershipType;
export var welMess;



// Footer menu
const footerMenu = `
<div class="bottom-navbar">
  <ul class="nav">
    <li class="nav-item" >
      <a data-bs-toggle="collapse" class="nav-link ${document.title=="Home"?"active":""}" href="index.html">
        <i class="fas fa-home"></i>
        <span>Home</span>
      </a>
      <div class="menu-content">
        <!-- Content for Home page goes here -->
      </div>
    </li>
    <li class="nav-item">
      <a class="nav-link ${document.title=="Assets"?"active":""}"" href="assets.html">
        <i class="fas fa-box-open"></i>
        <span>Assets</span>
      </a>
      <div class="menu-content">
        <!-- Content for Assets page goes here -->
      </div>
    </li>
    <li class="nav-item">
      <a class="nav-link ${document.title=="Subscription"?"active":""}"" href="subscription.html">
      <i class="fas fa-hand-holding-usd"></i>
      <span>Subscription</span>
    </a>
      <div class="menu-content">
        <!-- Content for Stake page goes here -->
      </div>
    </li>
    <li class="nav-item">
      <a class="nav-link ${document.title=="Team"?"active":""}"" href="team.html">
        <i class="fas fa-users"></i>
        <span>Team</span>
      </a>
      <div class="menu-content">
        <!-- Content for Team page goes here -->
      </div>
    </li>
  </ul>
</div>`;

document.getElementById("footer-menu").innerHTML = footerMenu;






const HomenavbarMenuContent = `
<nav class="top-navbar">
<div class="container">
  <h4 id="header-title" style="color:var(--primary-color)">
  <i onclick="history.back()" class="fa-solid fa-arrow-left"></i>${document.title}
  </h3>
  <w3m-core-button
    id="web3-login-button"
    class="web3-login-button"
  ></w3m-core-button>
  <div class="web3-wallet-address" style="display: none">
    <span></span>
  </div>
</div>
</nav>`;

const divNav = document.getElementById("navbarmenu");
if (divNav != null) {
  divNav.innerHTML = HomenavbarMenuContent;
}


$(function () { 
  $('.nav-item').on('click', function (e) {
      $('.navbar-collapse').collapse('hide');
  });
});