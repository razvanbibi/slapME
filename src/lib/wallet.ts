"use client";

import { useState } from "react";

export function useWallet() {
  const [wallet, setWallet] = useState({
    connected: false,
    address: "",
  });

  return {
    wallet,
    setWallet,
  };
}