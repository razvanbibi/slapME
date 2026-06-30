"use client";

import { openContractCall } from "@stacks/connect-react";

import {
  AnchorMode,
  PostConditionMode,
} from "@stacks/transactions";

import { STACKS_MAINNET } from "@stacks/network";

import {
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
} from "./contract";

const network = STACKS_MAINNET;

export async function slap() {
  
 console.log((window as any).LeatherProvider);
  return openContractCall({
    network,

    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,

    functionName: "slap",
    functionArgs: [],

    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,

    onFinish: (data) => {
      console.log("TX Success:", data);
    },

    onCancel: () => {
      console.log("TX Cancelled");
    },
  });
}

export async function punch() {

  console.log("Calling openContractCall (Punch)...");
  return openContractCall({
    network,

    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,

    functionName: "punch",
    functionArgs: [],

    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,

    onFinish: (data) => {
      console.log("Punch TX Success:", data);
    },

    onCancel: () => {
      console.log("Punch cancelled");
    },
  });
}