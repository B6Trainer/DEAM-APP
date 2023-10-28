import { switchNetwork,getNetwork } from "@wagmi/core";
import ethereumClient from "./walletConnect";
import {defaultChainId} from './config';
var connected = ethereumClient.getAccount().isConnected;
var path = window.location.pathname;
const switchChain = document.getElementById("switchChain");
const connectBtn = document.getElementById("connectBtn");
const openApp = document.getElementById("openApp");

if(connected==true && switchChain!=null ){
switchChain.addEventListener("click", async () => {
  const networks__ = await switchNetwork({
    chainId: defaultChainId,
  })
  console.log(networks__);
});
}
var mainLoopId = setInterval(async function () {
  if (connected != true) {
    if (path != "/" && path != "/index.html") {
      // window.location.href = "/index.html";
      // alert("Please Connect your Wallet First.")
    }
  } else if (connected == true && (path == "/" || path == "/index.html")) {
  const { chain } =  getNetwork();
  if(chain.id != defaultChainId){
    switchChain.style.display ="block";
    connectBtn.style.display = "none";
    openApp.style.display = "none";
  }else{
    //window.location.href = "./home.html";
    switchChain.style.display ="none";
    connectBtn.style.display = "block";
    openApp.style.display = "none";
  }
  } else {
    console.log("connected...");
  }

  connected = ethereumClient.getAccount().isConnected;
}, 1000);








