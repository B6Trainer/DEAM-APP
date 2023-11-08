const network='Test'

var subAddress;
var usdtAdd;
var tokenAdd;
var chain;

const appEnv = import.meta.env.VITE_APP_ENV;
console.log("Application is starting in ENV: "+appEnv);

if(appEnv=='PROD'){
     //Mainnet
     subAddress=import.meta.env.VITE_prod_subAddress;
     usdtAdd = import.meta.env.VITE_prod_usdtAdd;
     tokenAdd = import.meta.env.VITE_prod_tokenAdd;
     chain=import.meta.env.VITE_prod_chain;
     
     
}else{
     //TestNet
     subAddress=import.meta.env.VITE_test_subAddress;
     usdtAdd = import.meta.env.VITE_test_usdtAdd;
     tokenAdd = import.meta.env.VITE_test_tokenAdd;
     chain=import.meta.env.VITE_test_chain;
}

console.log("Chain id: "+chain);
console.log("Subscription Contract Address: "+subAddress);
console.log("Custom Token Contract Address: "+tokenAdd);
console.log("USDT Contract Address: "+usdtAdd);


export const usdtAddress = usdtAdd;
export const subscriptionAddress = subAddress;
export const tokenAddress =tokenAdd;



export const stakingAddress = '0x95804085CcD0cDba510FCBCDA78355D15a5632f2';
export const swapAddress = '0xC17F1Cf5d7a49f4b63BDeaf57De9645fDA3Aa68F';
export const icoAddress = '0x4F80f1eAaa19236653Cfa76286C9a024aA89536e';
export const TOKEN_PRICE = '1';
export const defaultChainId =chain;
export const getShareData =(address)=> {
   return `{title: "DMTK",text: "Hi I would like to invite you to DMTK. \nfollow the link and register using my Account as referralCode i.e :\n${address}\n\n,url: "https://dmtk.com"}`;
};







