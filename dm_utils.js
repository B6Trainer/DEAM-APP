import { DM_TXN_HASH_EXPLORER } from './config';
import {M_TYPE_Member,M_TYPE_Promoter,M_TYPE_Guest,M_TYPE_Admin,M_TYPE_Owner} from './config';
import {M_TYPE_Member_DEF,M_TYPE_Promoter_DEF,M_TYPE_Guest_DEF,M_TYPE_Admin_DEF,M_TYPE_Owner_DEF} from './config';

export function maskWalletAddress(walletAddress) {
  if (typeof walletAddress !== 'string') {
    throw new Error('Input must be a string representing the wallet address');
  }

  if (walletAddress.length < 10) {
    throw new Error('Wallet address must have at least 10 characters');
  }

  const firstFive = walletAddress.slice(0, 5);
  const lastFive = walletAddress.slice(-5);
  const middleAsterisks = "*******";

  return `${firstFive}${middleAsterisks}${lastFive}`;
}
    

export function getInfoMessageContent(message){

  var constructedMessage=` <div class="alert alert-info alert-dismissible fade show">
  <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
  <strong >Info!</strong> ${message} !</div>`;

  return constructedMessage;
}

export function getErrorMessageContent(message){

  var constructedMessage=` <div class="alert alert-danger alert-dismissible fade show">
  <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
  <strong >Error!</strong> ${message} !</div>`;


  return constructedMessage;
}

export function getErrorMessageandTxn(message,txn){

  var constructedHashlink=constructTxnLink(txn)

  var constructedMessage=` <div class="alert alert-danger alert-dismissible fade show">
  <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
  <strong >Error!</strong> ${message}<br> Txn Hash:${constructedHashlink} </div>`;

  return constructedMessage;
}

export function getInfoMessageandTxn(message,txn){

  var constructedHashlink=constructTxnLink(txn)

  var constructedMessage=` <div class="alert alert-info alert-dismissible fade show">
  <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
  <strong >Info!</strong> ${message}<br> Txn Hash : ${constructedHashlink} </div>`;

  return constructedMessage;
}

export function getWarnMessageandTxn(message,txn){

  var constructedHashlink=constructTxnLink(txn)

  var constructedMessage=` <div class="alert alert-warning alert-dismissible fade show">
  <span style="margin-right:10px" type="button" class="close" data-dismiss="alert">&times;</span>
  <strong >Info!</strong> ${message}<br> Txn Hash : ${constructedHashlink} </div>`;

  return constructedMessage;
}

function constructTxnLink(txn){

  var fullurl=DM_TXN_HASH_EXPLORER+txn;
  var maskedTxnHash=maskWalletAddress(txn);
  
  var constructedHashLink=`<a href="${fullurl}" target="_blank" class="no-decoration">${maskedTxnHash}
                          <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
  
  return constructedHashLink;

}


// Function to copy text to clipboard
export function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      alert("Copied to clipboard: " + text);
    })
    .catch(err => {
      console.error('Unable to copy text: ', err);
    });
}



export function formatDateToDDMMYYYY(date) {
  // Get the day, month, and year components from the Date object
  const day = date.getDate().toString().padStart(2, '0'); // Ensure 2-digit day
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, so add 1
  const year = date.getFullYear().toString();

  // Create the formatted string in "DD-MM-YYYY" format
  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
}


export function defineMembership( memType){

  var memTypeDef=""

  switch (memType) {
    case M_TYPE_Admin:
      memTypeDef=M_TYPE_Admin_DEF
      break;
  
    case M_TYPE_Member:
      memTypeDef=M_TYPE_Member_DEF
      break;
  
    case M_TYPE_Guest:
      memTypeDef=M_TYPE_Guest_DEF
      break;
  
    case M_TYPE_Promoter:
      memTypeDef=M_TYPE_Promoter_DEF
      break;
  
    case M_TYPE_Owner:
      memTypeDef=M_TYPE_Owner_DEF
      break;
  
    default:
      memTypeDef=""
  }


  return memTypeDef;
}
