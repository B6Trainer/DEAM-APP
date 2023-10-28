import { switchNetwork,watchAccount,watchNetwork,getNetwork } from "@wagmi/core";
import ethereumClient from "./walletConnect";
import {defaultChainId} from './config'

const switchChain = document.getElementById("switchChain");

var connected = ethereumClient.getAccount().isConnected;
var previousAddress;
var previousNetwork;

if (connected) {
    const { chain } =  getNetwork();
previousNetwork = chain.id;
  previousAddress = ethereumClient.getAccount().address;

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
          switchChain.style.display ="block";
          connectBtn.style.display = "none";
          openApp.style.display = "none";
      }
    }
  });
}

switchChain.addEventListener("click", async () => {
  const networks__ = await switchNetwork({
    chainId: defaultChainId,
  })
  console.log(networks__);
});





// document.getElementById("footer-menu").style.zIndex = "100";
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
if(document.getElementById("footer-menu"))
document.getElementById("footer-menu").innerHTML = footerMenu;






const HomenavbarMenuContent = `
<nav class="top-navbar">
<div class="container">
  <h4 id="header-title" style="color:var(--primary-color)">
  <i onclick="history.back()" class="fa-solid fa-arrow-left"></i>${document.title}
  </h3>
  <span class="navbar-text">
  <div id="connectBtn">
  <w3m-core-button id="wagmiButton"></w3m-core-button>
</div>
  <button style="display: none;" class="btn btn-info" id="switchChain">Switch Chain</button>
  <button id="openApp" style="display: none;" onclick="window.location.href='./home.html'"  class="smooth-anchor ml-auto mr-auto ml-md-0 btn primary-button aos-init aos-animate" >Open App</button>
</span>
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