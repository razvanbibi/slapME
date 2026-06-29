import {
    fetchCallReadOnlyFunction,
    cvToJSON,
    principalCV,
    uintCV,
} from "@stacks/transactions";

import { STACKS_MAINNET } from "@stacks/network";

import {
    CONTRACT_ADDRESS,
    CONTRACT_NAME,
} from "./contract";

const network = STACKS_MAINNET;

export async function getGlobalStats() {
    const result = await fetchCallReadOnlyFunction({
        network,

        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,

        functionName: "get-global-stats",

        functionArgs: [],

        senderAddress: CONTRACT_ADDRESS,
    });

    return cvToJSON(result);
}

export async function getUserStats(address: string) {
    const result = await fetchCallReadOnlyFunction({
        network,

        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,

        functionName: "get-user-stats",

        functionArgs: [
            principalCV(address),
        ],

        senderAddress: address,
    });

    return cvToJSON(result);
}

export async function getLastActivityId() {
    const result = await fetchCallReadOnlyFunction({
        network,

        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,

        functionName: "get-last-activity-id",

        functionArgs: [],

        senderAddress: CONTRACT_ADDRESS,
    });

    return cvToJSON(result);
}

export async function getActivity(id: number) {
    const result = await fetchCallReadOnlyFunction({
        network,

        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,

        functionName: "get-activity",

        functionArgs: [
            uintCV(id),
        ],

        senderAddress: CONTRACT_ADDRESS,
    });

    return cvToJSON(result);
}