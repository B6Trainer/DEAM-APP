import {DM_MANAGER_ADDRESS,DM_TOKEN_ADDRESS } from "./config";
import {copyToClipboard} from "./dm_utils";

const deamcontractElement = document.getElementById("deamcontract");
const tokenContractElement = document.getElementById("tokenContract");

deamcontractElement.innerHTML = DM_MANAGER_ADDRESS;
tokenContractElement.innerHTML = DM_TOKEN_ADDRESS;


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















