"use client";

import { useState } from "react";
import { showConnect } from "@stacks/connect";

export function useWallet() {
  const [wallet, setWallet] = useState({
    connected: false,
    address: "",
  });

  const connectWallet = async () => {
    showConnect({
      appDetails: {
        name: "SlapMe",
      },

      onFinish: ({ userSession }) => {
        const data = userSession.loadUserData();

        const address =
          data.profile.stxAddress.mainnet ||
          data.profile.stxAddress.testnet;

        setWallet({
          connected: true,
          address,
        });
      },

      onCancel: () => {
        console.log("Wallet connection cancelled");
      },
    });
  };

  return {
    wallet,
    setWallet,
    connectWallet,
  };
}