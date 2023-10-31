import {TOKEN_PRICE,getShareData,subscriptionAddress,tokenAddress } from "./config";
import {copyToClipboard} from "./common.js";

const deamcontractElement = document.getElementById("deamcontract");
const tokenContractElement = document.getElementById("tokenContract");

deamcontractElement.innerHTML = subscriptionAddress;
tokenContractElement.innerHTML = tokenAddress;

fetch('footermenu.html')
.then(response => response.text())
.then(data => {
    document.getElementById('footer-menu-2').innerHTML = data;
});

const tokencopyButton = document.getElementById("tokencopybutton");
const textToCopy = document.getElementById("tokenContract").textContent;
tokencopyButton.addEventListener("click", () => {
      copyToClipboard(textToCopy);
});

const deamContractcopyicon = document.getElementById("deamContractcopyicon");
const deamContractAddToCopy = document.getElementById("deamcontract").textContent;
deamContractcopyicon.addEventListener("click", () => {
      copyToClipboard(deamContractAddToCopy);
});















