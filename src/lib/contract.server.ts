// src/lib/contract.server.ts
import { JsonRpcProvider, Contract } from "ethers";
import { OXTXN_STREAK_CONTRACT } from "./contract.abi";
import { OXTXN_STREAK_ABI } from "./contract.abi";

// Celo mainnet public RPC (simple & safe)
const RPC_URL = "https://forno.celo.org";

export function getReadOnlyContractServer() {
  const provider = new JsonRpcProvider(RPC_URL);

  const contract = new Contract(
    OXTXN_STREAK_CONTRACT,
    OXTXN_STREAK_ABI,
    provider
  );

  return { contract };
}