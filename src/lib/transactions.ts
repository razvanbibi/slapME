"use client";

import { openContractCall } from "@stacks/connect";

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
  return openContractCall({
    network,

    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,

    functionName: "slap",
    functionArgs: [],

    anchorMode: AnchorMode.OnChainOnly,
    postConditionMode: PostConditionMode.Allow,

    onFinish: (data) => {
      console.log("Slap TX Success:", data);
    },

    onCancel: () => {
      console.log("Slap cancelled");
    },
  });
}

export async function punch() {
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