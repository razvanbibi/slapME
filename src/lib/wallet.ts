"use client";

import { useEffect, useState } from "react";
import { showConnect } from "@stacks/connect";
import { UserSession, AppConfig } from "@stacks/connect";

export function useWallet() {
  const [wallet, setWallet] = useState({
    connected: false,
    address: "",
  });

  const connectWallet = async () => {
    try {
      await showConnect({
        appDetails: {
          name: "SlapMe",
          icon: `${window.location.origin}/icon.png`,
        },

        onFinish: ({ userSession }) => {
          console.log("Finished", userSession);

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
          console.log("Cancelled");
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  return {
    wallet,
    setWallet,
    connectWallet,
  };
}