"use client";

import {
  openContractCall,
} from "@stacks/connect";

import {
  AnchorMode,
  PostConditionMode,
} from "@stacks/transactions";

import {
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
} from "./contract";

export async function slap() {
  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,

    functionName: "slap",

    functionArgs: [],

    network: "mainnet",

    anchorMode: AnchorMode.Any,

    postConditionMode: PostConditionMode.Allow,

    onFinish(data) {
      console.log("TX Success", data);
    },

    onCancel() {
      console.log("Cancelled");
    },
  });
}