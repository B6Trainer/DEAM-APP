import { readContracts, writeContract, waitForTransaction } from "@wagmi/core";
import ethereumClient from "./walletConnect";
import { utils } from "ethers";
import { TOKEN_PRICE, swapAddress, usdtAddress, tokenAddress } from "./config";
import tokenABI from "./ABI_ERC20.json";
import ABI_DMTK from "./ABI_DMTK.json";
const dfn_perusdt = 1;
const dfnOutput = document.getElementById("dfnOutput");
const usdtInput = document.getElementById("usdtInput");
const errormsg = document.getElementById("errormsg");
const tokenSwap = document.getElementById("tokenSwap");
const DFN_BAL = document.getElementById("swap_dfn_balance");
const USDTBAL = document.getElementById("swap_usdt_balance");
const CurrentPrice = document.getElementById("currentPrice");
const containerOfSwap = document.getElementById("containerOfSwap");
CurrentPrice.innerHTML = TOKEN_PRICE;



const usdtContract = {
  address: usdtAddress,
  abi: tokenABI,
};

const tokenContract = {
  address: tokenAddress,
  abi: tokenABI,
};

var contractData = await readContracts({
  contracts: [
    {
      ...usdtContract,
      functionName: "allowance",
      args: [ethereumClient.getAccount().address, tokenAddress],
    },
    {
      ...usdtContract,
      functionName: "balanceOf",
      args: [ethereumClient.getAccount().address],
    },
    {
      ...tokenContract,
      functionName: "balanceOf",
      args: [ethereumClient.getAccount().address],
    },
  ],
});

const tokenAllowance = contractData[0].result;
const usdtBal = contractData[1].result;
const tokenBalance = contractData[2].result;

USDTBAL.innerHTML = Number(utils.formatEther(usdtBal)).toFixed(2);
DFN_BAL.innerHTML = Number(utils.formatEther(tokenBalance)).toFixed(2);

usdtInput.addEventListener("keyup", function (event) {
  if (usdtInput.value !== "") {
    if (
      Number(utils.parseEther(String(usdtInput.value))) <=
      Number(tokenAllowance)
    ) {
      tokenSwap.value = "swap";
      tokenSwap.innerHTML = "Swap Now";
      tokenSwap.style.background = "#26b562";
    } else {
      tokenSwap.value = "approve";
      tokenSwap.innerHTML = "Approve";
      tokenSwap.style.background = "#0d6efd";
    }
  }
});

usdtInput.addEventListener("keyup", async function (event) {
  const amount = usdtInput.value;
  const tokenBAmount = amount * dfn_perusdt;
  dfnOutput.value = tokenBAmount;
});

tokenSwap.addEventListener("click", async function (event) {
  errormsg.innerHTML = "";
  var valueToApprove = usdtInput.value;
  if (valueToApprove == "" || Number(valueToApprove) == 0) {
    errormsg.innerHTML = "USDT value must be greater than 0";
    return;
  }

  if(Number(utils.formatEther(usdtBal))<= Number(valueToApprove)){
    errormsg.innerHTML = "Not Enough USDT to Swap";
    return;
  }

  if (tokenSwap.value == "approve") {
    tokenSwap.disabled= true;
    tokenSwap.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Waiting for Approval`;
    try{
    const result = await writeContract({
      address: usdtAddress,
      abi: tokenABI,
      functionName: "approve",
      args: [tokenAddress, utils.parseUnits(String(valueToApprove), 18)],
    });
    console.log("0000", result);
    const resultTr = await waitForTransaction({
      hash: result.hash,
    });
    if (resultTr.status == "success") {
      tokenSwap.disabled= false;
      tokenSwap.innerHTML = "Swap Now";
      tokenSwap.value = "Swap";
      tokenSwap.style.backgroundColor = "#26b562";
    }else{
    tokenSwap.disabled= false;
    tokenSwap.innerHTML = `Approve`;
    }
  }catch(e){
    tokenSwap.disabled= false;
    tokenSwap.innerHTML = `Approve`;
    alert("Cancelled By User");
  }

  } else {
    tokenSwap.disabled = true;
    tokenSwap.innerHTML = `<i class="fa fa-refresh fa-spin"></i> Please Wait`;
    try{
    const swapresult = await writeContract({
      address: tokenAddress,
      abi: ABI_DMTK,
      functionName: "swapToDMTK",
      args: [utils.parseUnits(String(valueToApprove), 18)],
    });
    const swapresultTr = await waitForTransaction({
      hash: swapresult.hash,
    });

    console.log(swapresultTr);
    if (swapresultTr.status == "success") {
      containerOfSwap.style.display = "none";
      errormsg.style.display = "flex";
      errormsg.innerHTML = `<span class="alert alert-danger">Successs: <a href="https://testnet.ftmscan.com/tx/${swapresultTr.transactionHash}">${swapresultTr.transactionHash}</a></span>`;
    }
  }catch(e){
    tokenSwap.disabled = false;
    tokenSwap.innerHTML = `Swap Now`;
    alert("Cancelled By user");
  }
  }
});
