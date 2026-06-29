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