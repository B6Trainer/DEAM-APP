import {TOKEN_PRICE,getShareData,subscriptionAddress,tokenAddress } from "./config";
import {copyToClipboard} from "./common.js";

const deamcontractElement = document.getElementById("deamcontract");
const tokenContractElement = document.getElementById("tokenContract");

deamcontractElement.innerHTML = subscriptionAddress;
tokenContractElement.innerHTML = tokenAddress;


console.log('index.js is being executed');



// Function to copy text to clipboard
function loadContent(sourcepage,targetelementid) {
      navigator.clipboard.writeText(sourcepage)
        .then(() => {
          alert("Copied to clipboard: " + sourcepage);
        })
        .catch(err => {
          console.error('Unable to copy text: ', err);
        });
}

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















