 


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
    