// src/lib/contract.ts
"use client"; 
import { BrowserProvider, Contract, formatUnits } from "ethers";
export const OXTXN_STREAK_CONTRACT =
  "0xd7fbd56e05f29184e235C991e680f1D57e1C7924" as const;
export const OXTXN_TOKEN_CONTRACT =
  "0xF3473730b41f0F5720bC8AA8fade0480062125bA" as const;
export const CELODAILY_VAULT_CONTRACT =
  "0x6ea4C7e400cC455712e284883E74B49402C5C818" as const;
export const CELO_CHAIN_ID_HEX = "0xa4ec";
export const OXTXN_STREAK_ABI = [
  {
    type: "function",
    name: "streak",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "pendingTokens",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "highestStreak",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "paused",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "lastCheckInDay",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getCurrentDay",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "checkIn",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "claimAll",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "claimTokens",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "reverse",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [],
  },

  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "pendingSilver",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view", 
    "type": "function" 
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "pendingGold",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "pendingDiamond",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function" 
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "pendingLegendary",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function" 
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "totalSilver",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "totalGold",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "totalDiamond",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "totalLegendary",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "totalEarnedTokens",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "pendingTokens",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },



] as const;
export const OXTXN_TOKEN_ABI = [
  {
    type: "function",
    name: "burn",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "claim",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "multiSend",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipients", type: "address[]" },
      { name: "amounts", type: "uint256[]" },
    ],
    outputs: [],
  },
] as const;
export const CELODAILY_VAULT_ABI = [
  {
    type: "function",
    name: "deposit",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "donate",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function", 
    name: "getUserBalance", 
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getVaultBalance",
    stateMutability: "view", 
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
// MetaMask আছে কিনা চেক
export function getEthereum() { 
  if (typeof window === "undefined") return null;
  return (window as any).ethereum ?? null;
}
// provider + signer + contract পাওয়ার হেল্পার
export async function getContractWithSigner() {
  const eth = getEthereum();
  if (!eth) throw new Error("MetaMask / wallet পাওয়া যায়নি");
  const provider = new BrowserProvider(eth);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();
  if (network.chainId !== BigInt(42220)) {
    throw new Error("Please switch network to Celo mainnet");
  }
  const contract = new Contract(
    OXTXN_STREAK_CONTRACT,
    OXTXN_STREAK_ABI,
    signer
  );
  return { provider, signer, contract };
}
export async function getTokenContractWithSigner() {
  const eth = getEthereum();
  if (!eth) throw new Error("Wallet not found");
  const provider = new BrowserProvider(eth);
  const signer = await provider.getSigner();
  const contract = new Contract(
    OXTXN_TOKEN_CONTRACT,
    OXTXN_TOKEN_ABI,
    signer
  );
  return { provider, signer, contract };
}
// শুধু read করার জন্য (signer ছাড়াই)
export async function getReadOnlyContract() {
  const eth = getEthereum();
  if (!eth) throw new Error("MetaMask / wallet পাওয়া যায়নি");
  const provider = new BrowserProvider(eth);
  const network = await provider.getNetwork();
  if (network.chainId !== BigInt(42220)) {
    throw new Error("Please switch network to Celo mainnet");
  }
  const contract = new Contract(
    OXTXN_STREAK_CONTRACT,
    OXTXN_STREAK_ABI,
    provider
  );
  return { provider, contract };
}
// BigInt টোকেন ভ্যালু কে 18 decimal ধরে ফরম্যাট
export function formatToken(amount: bigint): string {
  try {
    return formatUnits(amount, 18);
  } catch {
    return amount.toString();
  }
}
export async function getVaultContractWithSigner() {
  const eth = getEthereum();
  if (!eth) throw new Error("Wallet not found");
  const provider = new BrowserProvider(eth);
  const signer = await provider.getSigner();
  const contract = new Contract(
    CELODAILY_VAULT_CONTRACT,
    CELODAILY_VAULT_ABI,
    signer
  );
  return { provider, signer, contract };
}
export async function getVaultReadOnlyContract() {
  const eth = getEthereum();
  if (!eth) throw new Error("Wallet not found");
  const provider = new BrowserProvider(eth);
  const contract = new Contract(
    CELODAILY_VAULT_CONTRACT,
    CELODAILY_VAULT_ABI,
    provider
  );
  return { provider, contract };
}
