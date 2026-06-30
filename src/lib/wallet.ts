"use client";

import { useEffect, useState } from "react";
import { showConnect } from "@stacks/connect";
import { UserSession, AppConfig } from "@stacks/auth";

const appConfig = new AppConfig(["store_write"]);

const userSession = new UserSession({
  appConfig,
});

export function useWallet() {
  const [wallet, setWallet] = useState({
    connected: false,
    address: "",
  });

  useEffect(() => {

    if (userSession.isUserSignedIn()) {

      const data = userSession.loadUserData();

      const address =
        data.profile.stxAddress.mainnet ||
        data.profile.stxAddress.testnet;

      setWallet({
        connected: true,
        address,
      });

    }

  }, []);

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

  const disconnectWallet = () => {

    userSession.signUserOut();

    setWallet({
      connected: false,
      address: "",
    });

  };

  return {
  wallet,
  setWallet,
  connectWallet,
  disconnectWallet,
};
}