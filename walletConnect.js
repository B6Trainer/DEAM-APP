import { configureChains, createConfig} from "@wagmi/core";
import { bsc,bscTestnet,fantom,fantomTestnet} from "@wagmi/core/chains";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
 import { Web3Modal } from "@web3modal/html";

// 1. Define constants
const projectId = "24448e62f885c4bf3ad00a159240d5b1";
if (!projectId) {
  throw new Error("You need to provide VITE_PROJECT_ID env variable");
}
const chains = [bsc,bscTestnet,fantom,fantomTestnet];


// 2. Configure wagmi client
 const { publicClient, webSocketPublicClient} = configureChains(chains,[w3mProvider({ projectId })],{ stallTimeout: 10000 });
//const { publicClient, webSocketPublicClient } = configureChains(chains,[publicProvider()],{ stallTimeout: 10000 });
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ chains, projectId }),
  publicClient,
  webSocketPublicClient,
  
}); 



// 3. Create ethereum and modal clients
const ethereumClient = new EthereumClient(wagmiConfig, chains);
export const web3Modal = new Web3Modal(
  {
    projectId,
  },
  ethereumClient
);
console.log("Etheriem Wallet Client",ethereumClient.getNetwork())


export default ethereumClient;



