//export const usdtAddress = '0x2f1a799ef1b62369815173b93e3d603d87bd5c7c';//Testnet
//export const usdtAddress = '0x55d398326f99059fF775485246999027B3197955';//Mainnet
//export const tokenAddress = '0xb42Aa29a78c25A5e254cB835F9EcCd347E5365b8';//TestNet
//export const tokenAddress = '0x3f120977b0e1Ad22E407976C63159c7BB80f7beC';//Mainnet

//export const subscriptionAddress = '0xC3DA84c5991610a800D480fA5c88c50612A3CdEc';
//export const subscriptionAddress = '0x2E045F1f224Da9A10229410BF502d529C6C95bB8';
//export const subscriptionAddress = '0x175228E3B5681c7B3CD85d7C619a27ee6dEf5851';//Testnet
//export const subscriptionAddress = '0x5075cda7dedccb7a7b438541f87f783a73b3283c';//Mainnet

const network='Test'

var subAddress;
var usdtAdd;
var tokenAdd;

if(network=='Main'){
     subAddress='0x5075cda7dedccb7a7b438541f87f783a73b3283c';//Mainnet
     usdtAdd = '0x55d398326f99059fF775485246999027B3197955';//Mainnet
     tokenAdd = '0x3f120977b0e1Ad22E407976C63159c7BB80f7beC';//Mainnet
     
}else{
     subAddress='0x175228E3B5681c7B3CD85d7C619a27ee6dEf5851';//Testnet
     usdtAdd = '0x2f1a799ef1b62369815173b93e3d603d87bd5c7c';//Testnet
     tokenAdd = '0xb42Aa29a78c25A5e254cB835F9EcCd347E5365b8';//Testnet
}

export const usdtAddress = usdtAdd;
export const subscriptionAddress = subAddress;
export const tokenAddress =tokenAdd;



export const stakingAddress = '0x95804085CcD0cDba510FCBCDA78355D15a5632f2';
export const swapAddress = '0xC17F1Cf5d7a49f4b63BDeaf57De9645fDA3Aa68F';
export const icoAddress = '0x4F80f1eAaa19236653Cfa76286C9a024aA89536e';
export const TOKEN_PRICE = '1';
export const defaultChainId =56
export const getShareData =(address)=> {
   return `{title: "DMTK",text: "Hi I would like to invite you to DMTK. \nfollow the link and register using my Account as referralCode i.e :\n${address}\n\n,url: "https://dmtk.com"}`;
};







