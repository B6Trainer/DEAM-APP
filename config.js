const network='Test'

var subAddress;
var usdtAdd;
var tokenAdd;
var chain;

var DM_MANAGER_ADD;
var DM_CONFIG_ADD;
var DM_CPDISTRIBUTOR_ADD;
var DM_TOKEN_ADD;
var DM_MEMBERSHIP_ADD;
var DM_TXN_EXPLORER;

const appEnv = import.meta.env.VITE_APP_ENV;
console.log("Application is starting in ENV: "+appEnv);

if(appEnv=='PROD'){
     //Mainnet
     subAddress=import.meta.env.VITE_prod_subAddress;
     usdtAdd = import.meta.env.VITE_prod_usdtAdd;
     tokenAdd = import.meta.env.VITE_prod_tokenAdd;
     chain=import.meta.env.VITE_prod_chain;
     
     DM_TXN_EXPLORER=import.meta.env.VITE_PROD_TXN_EXPLORER;
     
     DM_MANAGER_ADD=import.meta.env.VITE_PROD_DM_MANAGER_ADDRESS;
     DM_CONFIG_ADD=import.meta.env.VITE_PROD_DM_CONFIG_ADDRESS;
     DM_CPDISTRIBUTOR_ADD=import.meta.env.VITE_PROD_DM_CPDISTRIBUTOR_ADDRESS;
     DM_TOKEN_ADD=import.meta.env.VITE_PROD_DM_TOKEN_ADDRESS;
     DM_MEMBERSHIP_ADD=import.meta.env.VITE_PROD_DM_MEMBERSHIP_ADDRESS;

}else{
     //TestNet
     subAddress=import.meta.env.VITE_test_subAddress;
     usdtAdd = import.meta.env.VITE_test_usdtAdd;
     tokenAdd = import.meta.env.VITE_test_tokenAdd;
     chain=import.meta.env.VITE_test_chain;

     DM_TXN_EXPLORER=import.meta.env.VITE_TEST_TXN_EXPLORER;

     DM_MANAGER_ADD=import.meta.env.VITE_TEST_DM_MANAGER_ADDRESS;
     DM_CONFIG_ADD=import.meta.env.VITE_TEST_DM_CONFIG_ADDRESS;
     DM_CPDISTRIBUTOR_ADD=import.meta.env.VITE_TEST_DM_CPDISTRIBUTOR_ADDRESS;
     DM_TOKEN_ADD=import.meta.env.VITE_TEST_DM_TOKEN_ADDRESS;
     DM_MEMBERSHIP_ADD=import.meta.env.VITE_TEST_DM_MEMBERSHIP_ADDRESS;

}

console.log("Chain id: "+chain);
console.log("Subscription Contract Address: "+subAddress);
console.log("Custom Token Contract Address: "+tokenAdd);
console.log("USDT Contract Address: "+usdtAdd);

console.log("DM_MANAGER_ADDRESS: "+DM_MANAGER_ADD);
console.log("DM_CONFIG_ADDRESS: "+DM_CONFIG_ADD);
console.log("DM_CPDISTRIBUTOR_ADDRESS: "+DM_CPDISTRIBUTOR_ADD);
console.log("DM_MEMBERSHIP_ADD: "+DM_MEMBERSHIP_ADD);

export const usdtAddress = usdtAdd;
export const subscriptionAddress = subAddress;
export const tokenAddress =tokenAdd;
export const DM_TXN_HASH_EXPLORER=DM_TXN_EXPLORER;
export const DM_MANAGER_ADDRESS = DM_MANAGER_ADD;
export const DM_CONFIG_ADDRESS = DM_CONFIG_ADD;
export const DM_CPDISTRIBUTOR_ADDRESS =DM_CPDISTRIBUTOR_ADD;
export const DM_TOKEN_ADDRESS =DM_TOKEN_ADD;
export const DM_MEMBERSHIP_ADDRESS =DM_MEMBERSHIP_ADD;

export const stakingAddress = '0x95804085CcD0cDba510FCBCDA78355D15a5632f2';
export const swapAddress = '0xC17F1Cf5d7a49f4b63BDeaf57De9645fDA3Aa68F';
export const icoAddress = '0x4F80f1eAaa19236653Cfa76286C9a024aA89536e';
export const TOKEN_PRICE = '1';
export const defaultChainId =chain;
export const getShareData =(address)=> {
   return `{title: "DMTK",text: "Hi I would like to invite you to DMTK. \nfollow the link and register using my Account as referralCode i.e :\n${address}\n\n,url: "https://dmtk.com"}`;
};


//App Constants
export const  M_TYPE_Member = 0;
export const  M_TYPE_Promoter = 1;
export const  M_TYPE_Guest = 2;
export const  M_TYPE_Admin = 3;




