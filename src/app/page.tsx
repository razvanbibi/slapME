"use client";
import { useEffect, useState } from "react";
import {
  getEthereum,
  getContractWithSigner,
  getReadOnlyContract,
  formatToken, 
  getTokenContractWithSigner,
  getVaultContractWithSigner,
  getVaultReadOnlyContract,
} from "@/lib/contract";
import Image from "next/image";
import { ethers } from "ethers";
import TodayMessageLoop from "./TodayMessageLoop";
import { saveDonation } from "@/lib/donationStore";
type Status = string | null;
type Toast =
  | { type: "checkin"; message: string }
  | { type: "claim"; message: string }
  | { type: "donation"; message: string }
  | null;
type Supporter = {
  address: string;
  total: number;
  name?: string;
  avatar?: string;
};
const USDM_TOKEN_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
function AvatarBubbleStream({ avatar }: { avatar: string }) {
  const [bubbles, setBubbles] = useState<
    { id: number; left: number; size: number }[]
  >([]);
  useEffect(() => { 
    const interval = setInterval(() => {
      setBubbles((prev) => [
        ...prev,
        {
          id: Date.now(),
          left: Math.random() * 30 - 15,
          size: 14 + Math.random() * 10,
        },
      ]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {bubbles.map((b) => (
        <img
          key={b.id}
          src={avatar}
          className="absolute rounded-full animate-avatar-float"
          style={{
            left: `calc(50% + ${b.left}px)`,
            bottom: "0px",
            width: b.size,
            height: b.size,
            animationDuration: "3.8s",
          }}
          onAnimationEnd={() =>
            setBubbles((prev) => prev.filter((x) => x.id !== b.id))
          }
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [account, setAccount] = useState<string | null>(null);
  const [streak, setStreak] = useState<bigint | null>(null);
  const [highestStreak, setHighestStreak] = useState<bigint | null>(null);
  const [pendingRewards, setPendingRewards] = useState("0");
  const [pendingTokens, setPendingTokens] = useState<bigint | null>(null);
  const [paused, setPaused] = useState<boolean | null>(null);
  const [totalEarned, setTotalEarned] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [recentlyClaimed, setRecentlyClaimed] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [totalSilver, setTotalSilver] = useState<bigint | null>(null);
  const [totalGold, setTotalGold] = useState<bigint | null>(null);
  const [totalDiamond, setTotalDiamond] = useState<bigint | null>(null);
  const [totalLegendary, setTotalLegendary] = useState<bigint | null>(null);
  const [pendingSilver, setPendingSilver] = useState<bigint | null>(null);
  const [pendingGold, setPendingGold] = useState<bigint | null>(null);
  const [pendingDiamond, setPendingDiamond] = useState<bigint | null>(null);
  const [pendingLegendary, setPendingLegendary] = useState<bigint | null>(null);
  const [showDonate, setShowDonate] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [vaultAmount, setVaultAmount] = useState("1");
  const [vaultBalance, setVaultBalance] = useState("0");
  const [userVaultBalance, setUserVaultBalance] = useState("0");
  const [donationAmount, setDonationAmount] = useState<string>("1");
  const [profileName, setProfileName] = useState<string>("");
  const [profileAvatar, setProfileAvatar] = useState<string>("/avatar.png");
  const [ethReady, setEthReady] = useState(false);
  const [topSupporters, setTopSupporters] = useState<Supporter[]>([]);
  const [taglineAnim, setTaglineAnim] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showBadgeInfo, setShowBadgeInfo] = useState(false);
  const [flashGlow, setFlashGlow] = useState(false);
  const [showRewardsTip, setShowRewardsTip] = useState(false);
  const [showBadgesTip, setShowBadgesTip] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<
    { address: string; highestStreak: number; name?: string | null; avatar?: string | null }[]
  >([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [showMintIdentity, setShowMintIdentity] = useState(false);
  const IDENTITY_NFT_ADDRESS = "0x934422770B2dA6d6CcA9CcaFf58523eC45491c43";
  const DEV_PASSWORD = "1245";
  const [hasIdentityNFT, setHasIdentityNFT] = useState<boolean | null>(null);
  const [identityTokenId, setIdentityTokenId] = useState<number | null>(null);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [devPasswordInput, setDevPasswordInput] = useState("");
  const [devUnlocked, setDevUnlocked] = useState(false);
  const [devRunning, setDevRunning] = useState(false);
  const [devMintAddress, setDevMintAddress] = useState("");
  const [devMintAmount, setDevMintAmount] = useState("");
  const [devBurnAmount, setDevBurnAmount] = useState("");
  const [devBurnCount, setDevBurnCount] = useState("500");
  const [devClaimAddress, setDevClaimAddress] = useState("");
  const [devClaimAmount, setDevClaimAmount] = useState("");
  const [devReverseToken, setDevReverseToken] = useState("");
  const [devReverseAmount, setDevReverseAmount] = useState("");
  const [devMultiAddresses, setDevMultiAddresses] = useState("");
  const [devMultiAmounts, setDevMultiAmounts] = useState("");
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [showBadgeTooltip, setShowBadgeTooltip] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem("celodaily_onboarding_v1");
    if (!seen) {
      setShowOnboarding(true);
      window.localStorage.setItem("celodaily_onboarding_v1", "1");
    }
  }, []);
  const closeOnboarding = () => {
    setShowOnboarding(false);
  };
  //প্রথমবার লোড হলে থিম পড়ে
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("celodaily_theme");

    if (stored === "dark") {
      setIsDarkMode(true);
    } else if (stored === "light") {
      setIsDarkMode(false);
    }
  }, []);


  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      "celodaily_theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);


  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      setEthReady(true);
    }
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const eth = (window as any).ethereum;

    if (eth?.isMiniPay) {
      setIsMiniPay(true);
      console.log("✅ MiniPay detected");
    }
  }, []);


  // ---- helpers for localStorage-based daily check-in ----
  function getTodayId() {
    const d = new Date();
    return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
  }

  function getTimeUntilTomorrowUTC() {
    const now = new Date();
    const tomorrow = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0
      )
    );
    const diff = tomorrow.getTime() - now.getTime();

    const hours = Math.floor(diff / 36e5);
    const minutes = Math.floor((diff % 36e5) / 6e4);

    return `${hours}h ${minutes}m`;
  }

  function getStorageKey(acc: string) {
    return `celodaily:checkin:${acc.toLowerCase()}`;
  }

  useEffect(() => {
    const eth = getEthereum();
    if (!eth) {
      setStatus("Please install MetaMask or a compatible wallet.");
      return;
    }

    const handleAccountsChanged = (accs: string[]) => {
      setAccount(accs[0] ?? null);
    };
    const handleChainChanged = () => {
      window.location.reload();
    };

    eth.request({ method: "eth_accounts" }).then((accs: string[]) => {
      if (accs.length > 0) setAccount(accs[0]);
    });

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", handleChainChanged);

    return () => {
      if (!eth.removeListener) return;
      eth.removeListener("accountsChanged", handleAccountsChanged);
      eth.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  useEffect(() => {

    if (!account || !ethReady) return;

    void refreshData();

    try {
      const key = getStorageKey(account);
      const stored = window.localStorage.getItem(key);
      setHasCheckedInToday(stored === getTodayId());
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, ethReady]);

  useEffect(() => {
    if (!account) return;

    loadVaultData(); 
  }, [account]);

  useEffect(() => {
    // initial animation already true

    const interval = setInterval(() => {
      setTaglineAnim(false);

      // re-trigger animation
      setTimeout(() => {
        setTaglineAnim(true);
      }, 50);
    }, 6000); // 6 seconds

    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    void loadDonationLeaderboard();
  }, []);

  useEffect(() => {
    if (!showLeaderboard) return;

    const close = () => setShowLeaderboard(false);
    window.addEventListener("click", close);

    return () => window.removeEventListener("click", close);
  }, [showLeaderboard]);

  const IDENTITY_NFT_ABI = [
    "function mint() external",
  ];


  async function handleMintIdentity() {
    try {
      if (!account) {
        setStatus("Connect wallet first");
        return;
      }

      setLoading(true);
      setStatus("Confirm mint in wallet...");

      await ensureCeloNetwork();

      const eth = getEthereum();
      if (!eth) throw new Error("Wallet not found");

      const provider = new ethers.BrowserProvider(eth as any);
      const signer = await provider.getSigner();

      const nft = new ethers.Contract(
        IDENTITY_NFT_ADDRESS,
        ["function mint()"],
        signer
      );

      const tx = await nft.mint();
      await tx.wait();

      setHasIdentityNFT(true);
      setStatus("Identity NFT minted 🎉");
      setShowMintIdentity(false);

    } catch (err: any) {
      console.error(err);

      setStatus(
        err?.info?.error?.message ??
        err?.shortMessage ??
        err?.message ??
        "Mint failed"
      );
    } finally {
      setLoading(false);
    }
  }
  async function getUSDmContractWithSigner() {
    const eth = getEthereum();
    if (!eth) throw new Error("Wallet not found");

    const provider = new ethers.BrowserProvider(eth as any);
    const signer = await provider.getSigner();

    const usdcAbi = [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function approve(address spender, uint256 amount) returns (bool)",
    ];

    const usdc = new ethers.Contract(USDM_TOKEN_ADDRESS, usdcAbi, signer);
    return { provider, signer, usdc };
  }
  useEffect(() => {
    if (!account || !ethReady) return;
    async function checkIdentityNFT() {
      try {
        const eth = getEthereum();
        if (!eth) return;
        const provider = new ethers.BrowserProvider(eth as any);
        const nft = new ethers.Contract(
          IDENTITY_NFT_ADDRESS,
          ["function balanceOf(address owner) view returns (uint256)"],
          provider
        );
        const balance = Number(await nft.balanceOf(account));

        setHasIdentityNFT(balance > 0);
      } catch (err) {
        console.error("Identity NFT check failed", err);
      }
    }

    checkIdentityNFT();
  }, [account, ethReady]);

  useEffect(() => {
    if (!account) return;

    const saved = localStorage.getItem(`profile:${account}`);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfileName(parsed.name || "");
        setProfileAvatar(parsed.avatar || "/avatar.png");
      } catch { }
    }
  }, [account]);

  async function saveProfile(name: string, avatar: string) {
    if (!account) return;

    // local state
    setProfileName(name);
    setProfileAvatar(avatar);

    // local storage
    localStorage.setItem(
      `profile:${account}`,
      JSON.stringify({ name, avatar })
    );

    // 🔥 instant Redis sync
    try {
      const res = await fetch("/api/profile/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: account,
          name,
          avatar,
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        console.error("Profile sync failed");
      }
    } catch (err) {
      console.error("Profile upload failed", err);
    }
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      saveProfile(profileName, base64);
    };
    reader.readAsDataURL(file);
  }

  async function ensureCeloNetwork() {
    const eth = getEthereum();
    if (!eth) throw new Error("Wallet not found");

    // 🔥 MiniPay skip
    if ((window as any).ethereum?.isMiniPay) {
      return;
    }

    const chainId = await eth.request({ method: "eth_chainId" });

    // Celo mainnet = 0xa4ec (42220)
    if (chainId !== "0xa4ec") {
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xa4ec" }],
        });
      } catch (err: any) {
        if (err.code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xa4ec",
                chainName: "Celo",
                rpcUrls: ["https://forno.celo.org"],
                nativeCurrency: {
                  name: "CELO",
                  symbol: "CELO",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://celoscan.io"],
              },
            ],
          });
        } else {
          throw err;
        }
      }
    }
  }

  async function connectWallet() {
    try {
      setStatus(null);

      const eth = getEthereum();
      if (!eth) {
        setStatus("Please install MetaMask.");
        return;
      }

      if ((window as any).ethereum?.isMiniPay) {
        console.log("Connecting via MiniPay...");
      }

      const accounts: string[] = await eth.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        setStatus("No account selected.");
        return;
      }

      setAccount(accounts[0]);

      await ensureCeloNetwork();

      await refreshData();
    } catch (err: any) {
      console.error(err);
      setStatus(err.message ?? "Failed to connect wallet.");
    }
  }

  async function refreshData(): Promise<{ pending: bigint | null } | void> {
    if (!account) return;
    try {
      setLoading(true);
      setStatus(null);
      await ensureCeloNetwork();
      const { contract } = await getReadOnlyContract();

      const [
        st,
        hs,
        pt,
        isPaused,
        pSil,
        pGold,
        pDia,
        pLeg,
        tSil,
        tGold,
        tDia,
        tLeg,
        tEarned,
      ] = await Promise.all([
        contract.streak(account),
        contract.highestStreak(account),
        contract.pendingTokens(account),
        contract.paused(),
        contract.pendingSilver(account),
        contract.pendingGold(account),
        contract.pendingDiamond(account),
        contract.pendingLegendary(account),
        contract.totalSilver(account),
        contract.totalGold(account),
        contract.totalDiamond(account),
        contract.totalLegendary(account),
        contract.totalEarnedTokens(account),
      ]);

      setStreak(st);
      setHighestStreak(hs);
      setPendingTokens(pt);
      setPendingRewards(formatToken(pt));
      setPaused(isPaused);

      // pending badges
      setPendingSilver(pSil);
      setPendingGold(pGold);
      setPendingDiamond(pDia);
      setPendingLegendary(pLeg);

      // lifetime totals
      setTotalSilver(tSil);
      setTotalGold(tGold);
      setTotalDiamond(tDia);
      setTotalLegendary(tLeg);
      setTotalEarned(tEarned);

      return { pending: pt };
    } catch (err: any) {
      console.error(err);
      setStatus(err.message ?? "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(next: Toast, durationMs = 2000) {
    setToast(next);
    if (next) {
      setTimeout(() => {
        setToast(null);
      }, durationMs);
    }
  }

  async function handleCheckIn() {
    try {
      if (!account) {
        setStatus("Connect your wallet first.");
        return;
      }
      setLoading(true);
      setStatus("Sending check-in transaction...");
      const prevPending = pendingTokens ?? BigInt(0);

      await ensureCeloNetwork();






      // normal MetaMask tx (no gasless)

      const { contract } = await getContractWithSigner();

      const tx = await contract.checkIn();

      await tx.wait();
      setStatus("Check-in confirmed 🎉");


      const result = await refreshData();

      const newPending =
        result?.pending ?? pendingTokens ?? BigInt(0);

      setPendingTokens(newPending);



      await fetch("/api/leaderboard/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account }),
      });

      // আজকের দিন localStorage এ সেভ + UI state সেট
      const key = getStorageKey(account);
      try {
        window.localStorage.setItem(key, getTodayId());
      } catch {
        // ignore
      }
      setHasCheckedInToday(true);



      await new Promise((r) => setTimeout(r, 300));



      const diff = newPending - prevPending;
      if (diff > BigInt(0)) {
        showToast(
          {
            type: "checkin",
            message: `+${formatToken(diff)} 0xtxn unlocked`,
          },
          2000
        );
      } else {
        showToast(
          {
            type: "checkin",
            message: "Check-in successful 🎉",
          },
          2000
        );
      }

      triggerAvatarRun(badgeProgress);



    } catch (err: any) {
      console.error(err);
      setStatus(
        err?.info?.error?.message ??
        err?.shortMessage ??
        err?.message ??
        "Check-in failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadLeaderboard() {
    try {
      setLeaderboardLoading(true);
      const res = await fetch("/api/leaderboard/lifetime");
      if (!res.ok) return;
      const data = await res.json();
      setLeaderboard(data);
    } finally {
      setLeaderboardLoading(false);
    }
  }


  function triggerAvatarRun(badgeProgress: number) {
    const runner = document.getElementById("avatar-runner");
    if (!runner) return;

    runner.style.setProperty("--target-x", `${badgeProgress * 100}%`);
    runner.classList.remove("hidden");
    runner.style.animation = "avatar-run 3s ease-out forwards";

    const originals = document.querySelectorAll("[data-avatar-main]");
    originals.forEach((el) => {
      (el as HTMLElement).style.opacity = "0";
    });
  }


  async function handleClaimAll() {
    try {
      if (!account) {
        setStatus("Connect your wallet first.");
        return;
      }

      if (!pendingTokens || pendingTokens === BigInt(0)) {
        setStatus("Nothing to claim right now.");
        return;
      }

      setLoading(true);
      setStatus("Sending claim transaction...");

      const claimAmount = pendingTokens;

      await ensureCeloNetwork();

      const { contract } = await getContractWithSigner();

      // 🔥 NEW LOGIC HERE
      const hasBadges =
        (pendingSilver ?? BigInt(0)) > BigInt(0) ||
        (pendingGold ?? BigInt(0)) > BigInt(0) ||
        (pendingDiamond ?? BigInt(0)) > BigInt(0) ||
        (pendingLegendary ?? BigInt(0)) > BigInt(0);

      let tx;

      if (!hasBadges) {
        // 👉 only tokens
        tx = await contract.claimTokens();
      } else {
        // 👉 tokens + badges
        tx = await contract.claimAll();
      }

      await tx.wait();
      setPendingTokens(BigInt(0));
      setPendingSilver(BigInt(0));
      setPendingGold(BigInt(0));
      setPendingDiamond(BigInt(0));
      setPendingLegendary(BigInt(0));

      setStatus("Claim successful 🎉");

      setRecentlyClaimed(true);
      await refreshData();

      showToast(
        {
          type: "claim",
          message: `Claimed ${formatToken(claimAmount!)} 0xtxn`,
        },
        2500
      );

    } catch (err: any) {
      console.error(err);
      setStatus(
        err?.info?.error?.message ??
        err?.shortMessage ??
        err?.message ??
        "Claim failed."
      );
    } finally {
      setLoading(false);
    }
  }


  const rewardTier = getRewardTier(pendingTokens);


  function getRewardTier(amount: bigint | null) {
    if (!amount || amount === BigInt(0)) return "none";

    // thresholds (tune later)
    const small = BigInt(5) * BigInt(1e18);
    const big = BigInt(50) * BigInt(1e18);

    if (amount < small) return "low";
    if (amount < big) return "mid";
    return "big";
  }


  function handleSelectDonation(amount: number) {
    setDonationAmount(amount.toString());
  }






  async function handleDonateClick() {
    try {
      if (!account) {
        setStatus("Connect your wallet first.");
        return;
      }

      const raw = donationAmount.trim();
      const amountNumber = Number(raw);

      if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
        setStatus("Enter a valid donation amount.");
        return;
      }

      const amountScaled = ethers.parseUnits(raw, 18);

      setLoading(true);

      await ensureCeloNetwork();

      // 1️⃣ Approve
      setStatus("Approve USDm in wallet...");

      const { usdc } = await getUSDmContractWithSigner();

      const approveTx = await usdc.approve(

        amountScaled
      );

      await approveTx.wait();

      // 2️⃣ Donate
      setStatus("Confirm donation in wallet...");

      const eth = getEthereum();
      if (!eth) throw new Error("Wallet not found");

      const provider = new ethers.BrowserProvider(eth as any);
      const signer = await provider.getSigner();

      const donationContract = new ethers.Contract(
        "0x6ea4C7e400cC455712e284883E74B49402C5C818",
        ["function donate(uint256 amount)"],
        signer
      );

      const donateTx = await donationContract.donate(amountScaled);
      await donateTx.wait();

      // ✅ success
      setStatus("Donation successful 💙");

      await loadDonationLeaderboard();
      showToast(
        {
          type: "donation",
          message: `Thank you! Donated ${amountNumber} USDm 💙`,
        },
        2500
      );

    } catch (err: any) {
      console.error(err);

      setStatus(
        err?.info?.error?.message ??
        err?.shortMessage ??
        err?.message ??
        "Donation failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVaultDeposit() {
    try {
      if (!account) {
        setStatus("Connect wallet first");
        return;
      }

      const amountScaled = ethers.parseUnits(vaultAmount, 18);

      setLoading(true);

      const { usdc } = await getUSDmContractWithSigner();

      setStatus("Approve USDm...");

      const approveTx = await usdc.approve(
        "0x6ea4C7e400cC455712e284883E74B49402C5C818",
        amountScaled
      );

      await approveTx.wait();

      setStatus("Deposit confirmation...");

      const { contract } = await getVaultContractWithSigner();

      const tx = await contract.deposit(amountScaled);

      await tx.wait();

      setStatus("Vault deposit successful 💎");

      await loadVaultData();

    } catch (err: any) {
      console.error(err);

      setStatus(
        err?.shortMessage ??
        err?.message ??
        "Deposit failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVaultWithdraw() {
    try {
      if (!account) {
        setStatus("Connect wallet first");
        return;
      }

      const amountScaled = ethers.parseUnits(vaultAmount, 18);

      setLoading(true);

      const { contract } = await getVaultContractWithSigner();

      const tx = await contract.withdraw(amountScaled);

      await tx.wait();

      setStatus("Withdraw successful 💸");

      await loadVaultData();

    } catch (err: any) {
      console.error(err);

      setStatus(
        err?.shortMessage ??
        err?.message ??
        "Withdraw failed"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    const APP_URL = "https://celo-daily.vercel.app/";

    const text =
      "CeloDaily\n\n" +
      "Building a daily habit on Celo. Checking in, growing my streak, earning 0xtxn.\n\n" +
      "Join the journey 👇";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "CeloDaily",
          text,
          url: APP_URL,
        });
      } else {
        await navigator.clipboard.writeText(
          text + "\n" + APP_URL
        );

        alert("Link copied! Share it anywhere 🚀");
      }
    } catch (err) {
      console.error("Share failed", err);
    }
  }

  async function handleDevMint() {
    try {
      setDevRunning(true);

      const { contract } = await getTokenContractWithSigner();

      const tx = await contract.mint(
        devMintAddress,
        ethers.parseUnits(devMintAmount, 18)
      );

      await tx.wait();

      setStatus("Mint successful ✅");
    } catch (err: any) {
      console.error(err);

      setStatus(err.message ?? "Mint failed");
    } finally {
      setDevRunning(false);
    }
  }

  async function handleDevBurn() {
    try {
      setDevRunning(true);

      const burnAmount = ethers.parseUnits(
        devBurnAmount,
        18
      );

      const burnCount = Number(devBurnCount);

      setStatus(
        `Starting ${burnCount} burns...`
      );

      const res = await fetch(
        "/api/dev-burn-flood",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: burnAmount.toString(),
            count: burnCount,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Burn failed"
        );
      }

      setStatus(
        `Success: ${data.total} burns`
      );

    } catch (err: any) {
      console.error(err);

      setStatus(
        err?.message || "Burn failed"
      );

    } finally {
      setDevRunning(false);
    }
  }


  async function handleDevClaim() {
    try {
      setDevRunning(true);

      const { contract } = await getTokenContractWithSigner();

      const tx = await contract.claim(
        devClaimAddress,
        ethers.parseUnits(devClaimAmount, 18)
      );

      await tx.wait();

      setStatus("Claim successful ✅");
    } catch (err: any) {
      console.error(err);

      setStatus(err.message ?? "Claim failed");
    } finally {
      setDevRunning(false);
    }
  }

  async function handleDevReverse() {
    try {
      setDevRunning(true);

      const { contract } = await getContractWithSigner();

      const tx = await contract.reverse(
        devReverseToken,
        ethers.parseUnits(devReverseAmount, 18)
      );

      await tx.wait();

      setStatus("Reverse successful ✅");
    } catch (err: any) {
      console.error(err);

      setStatus(err.message ?? "Reverse failed");
    } finally {
      setDevRunning(false);
    }
  }

  async function handleDevMultiSend() {
    try {
      setDevRunning(true);

      const recipients = devMultiAddresses
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);

      const amounts = devMultiAmounts
        .split("\n")
        .map((x) => ethers.parseUnits(x.trim(), 18));

      if (recipients.length !== amounts.length) {
        throw new Error("Address & amount count mismatch");
      }

      const { contract } = await getTokenContractWithSigner();

      const tx = await contract.multiSend(
        recipients,
        amounts
      );

      await tx.wait();

      setStatus("MultiSend successful ✅");
    } catch (err: any) {
      console.error(err);

      setStatus(err.message ?? "MultiSend failed");
    } finally {
      setDevRunning(false);
    }
  }

  async function loadVaultData() {
    try {
      if (!account) return;

      const { contract } = await getVaultReadOnlyContract();

      const [vaultBal, userBal] = await Promise.all([
        contract.getVaultBalance(),
        contract.getUserBalance(account),
      ]);

      setVaultBalance(
        ethers.formatUnits(vaultBal, 18)
      );

      setUserVaultBalance(
        ethers.formatUnits(userBal, 18)
      );

    } catch (err) {
      console.error("Vault load failed", err);
    }
  }

  async function loadDonationLeaderboard() {
    try {
      const provider = new ethers.JsonRpcProvider(
        "https://forno.celo.org"
      );

      // ethers v6 interface
      const iface = new ethers.Interface([
        "event Donation(address indexed donor, uint256 amount, uint256 timestamp)"
      ]);

      const donationTopic = ethers.id("Donation(address,uint256,uint256)");

      const logs = await provider.getLogs({

        topics: [donationTopic],
        fromBlock: BigInt(0),
        toBlock: "latest",
      });

      const totals: Record<string, number> = {};

      for (const log of logs) {
        const parsed = iface.decodeEventLog("Donation", log.data, log.topics);
        const donor = (parsed.donor as string).toLowerCase();
        const amount = Number(
          ethers.formatUnits(parsed.amount as bigint, 18)
        ); 
        totals[donor] = (totals[donor] ?? 0) + amount;
      }
      const entries = Object.entries(totals)
        .map(([address, total]) => ({ address, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      setTopSupporters(entries);
    } catch (err) {
      console.error("Failed to load on-chain leaderboard", err);
    }
  }

  const unclaimedReadable =
    pendingTokens !== null ? formatToken(pendingTokens) : null;

  const streakNumber = streak ? Number(streak) : 0;

  const highestNumber = highestStreak ? Number(highestStreak) : 0;

  const pendingSilverCount = pendingSilver ? Number(pendingSilver) : 0;
  const pendingGoldCount = pendingGold ? Number(pendingGold) : 0;
  const pendingDiamondCount = pendingDiamond ? Number(pendingDiamond) : 0;
  const pendingLegendaryCount = pendingLegendary ? Number(pendingLegendary) : 0;
  const hasUnclaimedBadges =
    pendingSilverCount > 0 ||
    pendingGoldCount > 0 ||
    pendingDiamondCount > 0 ||
    pendingLegendaryCount > 0;


  const baseEarned =
    totalEarned ? Number(formatToken(totalEarned)) : 0;

  const bonusEarned =
    (totalSilver ? Number(totalSilver) * 1500 : 0) +
    (totalGold ? Number(totalGold) * 5000 : 0) +
    (totalDiamond ? Number(totalDiamond) * 25000 : 0) +
    (totalLegendary ? Number(totalLegendary) * 500000 : 0);

  const correctedTotalEarned =
    baseEarned + bonusEarned;

  const totalEarnedReadable =
    correctedTotalEarned.toLocaleString();

  const totalSilverCount = totalSilver ? Number(totalSilver) : 0;
  const totalGoldCount = totalGold ? Number(totalGold) : 0;
  const totalDiamondCount = totalDiamond ? Number(totalDiamond) : 0;
  const totalLegendaryCount = totalLegendary ? Number(totalLegendary) : 0;

  const glassCard =
    "rounded-3xl bg-white/10 dark:bg-slate-900/55 backdrop-blur-[2px] " +
    "border border-white/15 dark:border-white/10 " +
    "shadow-[0_20px_50px_rgba(0,0,0,0.45)]";

  function getBadgeProgress(streak: number) {
    if (streak <= 0) return 0.05; // start একটু বামে

    // milestones
    const silver = 7;
    const gold = 15;
    const diamond = 30;
    const legendary = 100;

    // UI positions (MATCHING YOUR SKETCH)
    const pStart = 0.05;
    const pSilver = 0.28;
    const pGold = 0.52;
    const pDiamond = 0.74;
    const pLegendary = 0.92;

    // 0 → 7 (fast + visible)
    if (streak < silver) {
      return (
        pStart +
        (streak / silver) * (pSilver - pStart)
      );
    }

    // 7 → 15
    if (streak < gold) {
      return (
        pSilver +
        ((streak - silver) / (gold - silver)) * (pGold - pSilver)
      );
    }

    // 15 → 30 (slower)
    if (streak < diamond) {
      return (
        pGold +
        ((streak - gold) / (diamond - gold)) * (pDiamond - pGold)
      );
    }

    // 30 → 100 (slowest)
    if (streak < legendary) {
      return (
        pDiamond +
        ((streak - diamond) / (legendary - diamond)) *
        (pLegendary - pDiamond)
      );
    }

    return pLegendary;
  }

  const badgeProgress = getBadgeProgress(streakNumber);

  return (
    <main
      className={`min-h-screen relative overflow-hidden ${isDarkMode ? "text-slate-50" : "text-slate-900"
        }`}
      style={{
        backgroundImage: isDarkMode ? "url('/bg-lamp.jpg')" : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      {!isDarkMode && (
        <div className="basedaily-day-bg absolute inset-0 -z-10" />
      )}


      {/* dark overlay for contrast */}
      <div
        className={`absolute inset-0 pointer-events-none ${isDarkMode ? "bg-slate-950/65" : "bg-white/65"
          }`}
      />

      {/* content */}
      <div className="relative z-10 mx-auto max-w-md px-4 pb-10 pt-6 space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={isDarkMode ? "/logo-0x.png" : "/logo-0x-day.png"}
                alt="0x logo"
                className="h-full w-full object-contain transition-opacity duration-200"
              />

            </div>
            <div className="flex flex-col leading-tight">
              <span
                className={`text-base font-semibold tracking-tight ${isDarkMode ? "text-sky-100" : "text-slate-900"
                  }`}
              >
                CeloDaily
              </span>

              <span
                className={`text-[11px] ${isDarkMode ? "text-slate-300" : "text-slate-700"
                  } ${taglineAnim ? "animate-[fade-up_0.6s_ease-out]" : ""}`}
              >

                Building a daily habit on Celo
              </span>
            </div>

          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="
               h-9 w-9 inline-flex items-center justify-center
                rounded-xl bg-slate-900/90
                shadow-lg shadow-black/40
                transition
                hover:scale-105
                  active:scale-95
                   hover:bg-slate-800
                   "
          >

            <span className="inline-block w-3.5 space-y-[3px]">
              <span className="block h-[2px] rounded bg-slate-200" />
              <span className="block h-[2px] rounded bg-slate-200" />
              <span className="block h-[2px] rounded bg-slate-200" />
            </span>
          </button>
        </header>

        {/* Welcome / wallet card */}
        <section
          className={`
    p-4 space-y-3
    ${isDarkMode ? glassCard : ""}
  `}
        >

          {/* top row */}
          <div className="flex items-start justify-between gap-3">
            {/* left text */}
            <div className="flex-1">
              <TodayMessageLoop
                isDarkMode={isDarkMode}
                account={account}
              />
            </div>


            {/* right wallet / connect */}
            <div className="shrink-0">
              {account ? (
                <div className="flex flex-col items-end gap-1 pr-2">
                  {/* Wallet + Celo */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500">Wallet</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {isMiniPay ? "MiniPay" : "Celo"}
                    </span>
                  </div>

                  {/* address */}
                  <span className="text-[11px] px-2 py-1 rounded-full bg-slate-950/70 text-slate-100 mt-0.5">
                    {account.slice(0, 4)}…{account.slice(-4)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="
        px-3 py-1.5
        rounded-full
        text-[11px] font-semibold
        bg-sky-500/90
        text-slate-950
        shadow-md
        hover:bg-sky-400
        active:scale-95
        transition
      "
                >
                  Connect
                </button>
              )}
            </div>

          </div>
        </section>


        {/* Today card */}
        <section
          className={`
    p-4 space-y-3
    ${isDarkMode ? glassCard : ""}
  `}
        >

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CeloBlockLogo
                checkedIn={hasCheckedInToday}
                isDark={isDarkMode}
              />
            </h2>
            {/* RIGHT: stats */}
            <div className="flex gap-6 text-center">

              <div>
                <div
                  className={`text-xl font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-900"
                    }`}
                >

                  {streakNumber}
                </div>
                <div
                  className={`text-[11px] ${isDarkMode ? "text-slate-400" : "text-slate-900"
                    }`}
                >
                  Current
                </div>

              </div>

              <div className="relative">
                <div
                  className={`text-xl font-semibold ${isDarkMode ? "text-sky-300" : "text-sky-500"
                    }`}
                >
                  {highestNumber}
                </div>
                <AvatarBubbleStream avatar={profileAvatar || "/avatar.png"} />

                <div
                  className={`text-[11px] ${isDarkMode ? "text-slate-400" : "text-slate-900"
                    }`}
                >
                  Highest
                </div>
                {showLeaderboard && (
                  <div
                    className={`
      absolute
      right-3
      top-[58px]
      w-[180px]
      max-h-[120px]
      rounded-xl
      p-2
      text-xs
      overflow-y-auto overflow-visible
      z-20

      ${isDarkMode
                        ? "bg-slate-950/90 text-slate-200"
                        : "bg-white text-slate-900 border border-slate-200 shadow-lg"
                      }
    `}
                  >


                    {leaderboardLoading && <p className="text-slate-400">Loading…</p>}

                    {!leaderboardLoading && leaderboard.length === 0 && (
                      <p className="text-slate-400">No data yet</p>
                    )}

                    <ul className="space-y-2">
                      {leaderboard.map((u, i) => (
                        <li
                          key={u.address}
                          className={`relative flex items-center justify-between ${u.address.toLowerCase() === account?.toLowerCase()
                            ? "you-row-highlight"
                            : ""
                            }`}
                        >


                          <div className="flex items-center gap-2">
                            <img
                              src={
                                u.address.toLowerCase() === account?.toLowerCase()
                                  ? profileAvatar || "/avatar.png"
                                  : u.avatar || "/avatar.png"
                              }
                              className="h-6 w-6 rounded-full object-cover ring-1 ring-sky-400/30"
                            />

                            <span>
                              #{i + 1}{" "}
                              {u.name
                                ? u.name
                                : `${u.address.slice(0, 6)}…${u.address.slice(-4)}`}
                            </span>

                          </div>
                          <span
                            className={`
    font-semibold
    ${isDarkMode ? "text-slate-200" : "text-sky-500"}
  `}
                          >
                            {u.highestStreak}
                          </span>

                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 🏆 Leaderboard button — EXACT RED BOX POSITION */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLeaderboard(true);
                    loadLeaderboard();
                  }}

                  className={`
  absolute
  mt-1 left-1/2 -translate-x-1/2
  h-7 w-7
  rounded-full
  flex items-center justify-center
  bg-slate-900/70
  border border-white/10
  shadow-md
  text-sm
  hover:bg-slate-800
  active:scale-95
  transition
  ${showLeaderboard ? "opacity-0 pointer-events-none" : ""}
`}

                >
                  🏆
                </button>

              </div>

            </div>
          </div>

          <p
            className={`text-xs -mt-1 ${isDarkMode ? "text-slate-400" : "text-slate-900"
              }`}
          >

            {account
              ? hasCheckedInToday
                ? "You've already checked in today. Come back tomorrow!"
                : "Tap check-in to unlock today’s 0xtxn reward."
              : "Connect your wallet to start your daily check-in streak."}
          </p>

          {account && (
            <div className="flex justify-center mt-2">
              {hasCheckedInToday ? (
                <div className="flex flex-col items-center gap-1">
                  <button
                    disabled
                    className="
                      inline-flex items-center justify-center
                       px-8 py-3 rounded-full
                        text-base font-semibold
                         text-emerald-600
                         bg-emerald-500/10
                           border border-emerald-400/5
                            shadow-inner shadow-emerald-900/40
                            cursor-not-allowed
                           "
                  >
                    Checked-in
                  </button>

                  <span className="text-[11px] text-slate-400">
                    Next check-in in {getTimeUntilTomorrowUTC()}
                  </span>
                </div>


              ) : (
                <button
                  onClick={handleCheckIn}
                  disabled={loading || paused === true}
                  className={`
          inline-flex items-center justify-center
          px-8 py-3 rounded-full
          text-base font-semibold
          transition
          shadow-lg shadow-emerald-900/70
          animate-[breathe_4.2s_ease-in-out_infinite]
          bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500
          text-slate-950 hover:brightness-110 active:scale-95
          ${loading ? "opacity-70" : ""}
        `}
                >
                  {loading ? "Processing…" : "Check-in"}
                </button>
              )}
            </div>
          )}

          {paused && (
            <p className="text-[11px] text-amber-300 mt-1">
              The contract is currently paused. Please try again later.
            </p>
          )}
        </section>

        {/* Rewards card */}

        <section
          className={`
    p-4 space-y-3
    ${isDarkMode ? glassCard : ""}
    ${flashGlow ? "ring-2 ring-sky-400 animate-pulse" : ""}
  `}
        >

          <div className="relative group inline-flex">
            <div className="relative inline-flex">
              <button
                className={`text-sm font-semibold flex items-center gap-2 select-none ${isDarkMode ? "text-slate-100" : "text-slate-900"
                  }`}
                onClick={() => {
                  setShowRewardsTip(true);
                  setTimeout(() => setShowRewardsTip(false), 2000);
                }}
              >
                <span className="text-lg">💰</span> Rewards
              </button>

              {showRewardsTip && (
                <div className="absolute z-50 top-full mt-2 w-64 rounded-2xl
                    bg-slate-950/95 backdrop-blur-xl
                    border border-white/10 shadow-2xl
                    px-3 py-2 text-[11px] text-slate-200">
                  <p className="font-semibold text-sky-300 mb-1">How rewards work</p>
                  <ul className="list-disc pl-4 space-y-1 relative">
                    <li>Check-in once per day</li>

                    <li>Each streak day increases reward (n×100)</li>

                    <li
                      className="relative cursor-pointer text-cyan-300"
                      onClick={() => setShowBadgeTooltip(!showBadgeTooltip)}
                    >
                      Badge milestones unlock bonus rewards

                      {showBadgeTooltip && (
                        <div className="absolute left-0 top-7 z-50 w-64 rounded-xl border border-cyan-500/30 bg-[#020817] p-3 shadow-2xl">
                          <ul className="space-y-1 pl-4 text-white">
                            <li>🥈 Silver → +1,500 0xtxn</li>
                            <li>🥇 Gold → +5,000 0xtxn</li>
                            <li>💎 Diamond → +25,000 0xtxn</li>
                            <li>🌟 Legendary → +500,000 0xtxn</li>
                          </ul>
                        </div>
                      )}
                    </li>

                    <li>Miss a day → streak resets</li>

                    <li>Rewards stack until you claim</li>
                  </ul>
                </div>
              )}
            </div>

            <HoverInfo title="How rewards work">
              <ul className="list-disc pl-4 space-y-1">
                <li>Check-in once per day</li>
                <li>Each streak day increases reward (n*100)</li>
                <li>Miss a day → streak resets</li>
                <li>Rewards stack until you claim</li>
              </ul>
            </HoverInfo>
          </div>

          <div className="space-y-2 text-sm">
            <div
              className={`
    flex w-full items-start justify-between
    py-3
    transition-all duration-500
  `}
            >
              {/* LEFT: 0xtxn hero */}
              <div
                className={`
      flex flex-col
      transition-all duration-500
      ${hasUnclaimedBadges ? "items-start" : "items-center w-full"}
    `}
              >
                <span
                  className={`
    text-[12px]
    uppercase
    tracking-wide
    flex items-center gap-1
    ${isDarkMode ? "text-slate-400" : "text-slate-900"}
  `}
                >
                  Unclaimed
                  <span
                    className={`
      font-extrabold
      tracking-tight
      bg-gradient-to-r from-sky-400 to-blue-500
      bg-clip-text text-transparent
      drop-shadow-[0_0_6px_rgba(56,189,248,0.45)]
    `}
                  >
                    0xtxn
                  </span>
                </span>


                <span
                  className={`text-3xl font-bold tracking-tight ${isDarkMode ? "text-sky-200" : "text-sky-500"
                    }`}
                >
                  {unclaimedReadable ?? "0"}
                </span>
              </div>
              {/* RIGHT: Unclaimed badges */}
              <div className="flex flex-col items-end gap-1">

                {/* Badge label + icons ONLY */}
                <div
                  className={`
      flex flex-col items-end gap-1
      transition-all duration-500
      ${hasUnclaimedBadges ? "" : "opacity-40 grayscale"}
    `}
                >
                  <span
                    className={`
        text-[12px] uppercase tracking-wide
        transition-all duration-300
        ${hasUnclaimedBadges
                        ? isDarkMode
                          ? "text-slate-400"
                          : "text-slate-900"
                        : isDarkMode
                          ? "text-slate-500"
                          : "text-slate-700"
                      }
      `}
                  >
                    Unclaimed badges
                  </span>

                  <div className="flex items-center gap-2 transition-all duration-500">
                    {pendingSilverCount > 0
                      ? <BadgeGlow icon="🥈" count={pendingSilverCount} />
                      : <BadgeGhost icon="🥈" />
                    }

                    {pendingGoldCount > 0
                      ? <BadgeGlow icon="🥇" count={pendingGoldCount} />
                      : <BadgeGhost icon="🥇" />
                    }
                    {pendingDiamondCount > 0
                      ? <BadgeGlow icon="💎" count={pendingDiamondCount} />
                      : <BadgeGhost icon="💎" />
                    }
                    {pendingLegendaryCount > 0
                      ? <BadgeGlow icon="🌟" count={pendingLegendaryCount} />
                      : <BadgeGhost icon="🌟" />
                    }
                  </div>
                </div>

                {/* ✅ Identity button — ALWAYS LIVE */}
                <button
                  onClick={() => setShowMintIdentity(true)}
                  className={`
  group
  relative
  isolate
  overflow-hidden
  rounded-2xl

  border
  px-3 py-1.5

  text-[11px]
  font-semibold
  tracking-[0.18em]
  uppercase

  backdrop-blur-3xl
  transition-all
  duration-500
  hover:scale-[1.03]

  ${isDarkMode
                      ? `
        border-white/15
        bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.04))]
        text-slate-400
        shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.18)]
        hover:border-white/30
        hover:shadow-[0_15px_45px_rgba(0,0,0,0.55),0_0_25px_rgba(255,255,255,0.12)]
      `
                      : `
        border-sky-300/40
        bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(230,240,255,0.72))]
        text-slate-800
        shadow-[0_10px_30px_rgba(56,189,248,0.18),inset_0_1px_0_rgba(255,255,255,0.9)]
        hover:border-sky-400/60
        hover:shadow-[0_15px_45px_rgba(56,189,248,0.28)]
      `
                    }

  before:absolute
  before:inset-0
  before:rounded-2xl
  before:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_45%)]

  after:absolute
  after:inset-0
  after:rounded-2xl
  after:bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.22)_50%,transparent_80%)]
  after:translate-x-[-160%]
  hover:after:translate-x-[160%]
  after:transition-transform
  after:duration-[1800ms]

  [&>span]:relative
  [&>span]:z-10
`}
                >
                  {hasIdentityNFT ? "View Identity" : "Mint Identity"}
                </button>

                <button
                  onClick={() => setShowVault(true)}
                  className="
    flex h-10 w-10 items-center justify-center
    overflow-hidden
    rounded-2xl
    
    transition-all
    hover:scale-105
  "
                >

                  <Image
                    src="/vault.png"
                    alt="Vault"
                    width={32}
                    height={32}
                    className="object-contain"
                  />

                </button>

              </div>
            </div>
          </div>
          {account && (
            <div className="flex justify-center mt-2">
              <button
                onClick={handleClaimAll}
                disabled={!!(loading || !pendingTokens || pendingTokens === BigInt(0) || paused)}
                className={`
    inline-flex items-center justify-center
    px-8 py-3 rounded-full
    text-base font-semibold
    transition
    shadow-lg
    ${rewardTier === "low"
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 shadow-purple-900/50 text-slate-50"
                    : rewardTier === "mid"
                      ? "bg-gradient-to-r from-sky-500 to-blue-500 shadow-blue-900/50 text-slate-50"
                      : rewardTier === "big"
                        ? "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-900 shadow-amber-500/60"
                        : "bg-fuchsia-900/40 text-fuchsia-200/80"
                  }
    ${loading || !pendingTokens || pendingTokens === BigInt(0) || paused
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:brightness-110 active:scale-95"
                  }
  `}
              >
                {(pendingTokens ?? BigInt(0)) > BigInt(0)
                  ? "Claim all"
                  : recentlyClaimed
                    ? "Claimed"
                    : "Claimed"}
              </button>
            </div>
          )}
        </section>

        {/* Badge progress + badge list */}
        <section
          className={`
    p-4 space-y-3
    ${isDarkMode ? glassCard : ""}
  `}
        >
          <div className="relative group inline-flex">
            <div className="relative inline-flex">
              <button
                className={`text-sm font-semibold flex items-center gap-2 select-none ${isDarkMode ? "text-slate-100" : "text-slate-900"
                  }`}
                onClick={() => {
                  setShowBadgesTip(true);
                  setTimeout(() => setShowBadgesTip(false), 2000);
                }}
              >
                <span className="text-lg">🏅</span> Badges
              </button>
              {showBadgesTip && (
                <div className="absolute z-50 top-full mt-2 w-64 rounded-2xl
                    bg-slate-950/95 backdrop-blur-xl
                    border border-white/10 shadow-2xl
                    px-3 py-2 text-[11px] text-slate-200">
                  <p className="font-semibold text-sky-300 mb-1">Badge milestones</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>🥈 Silver — 7 days</li>
                    <li>🥇 Gold — 15 days</li>
                    <li>💎 Diamond — 30 days</li>
                    <li>🌟 Legendary — 100 days</li>
                  </ul>
                </div>
              )}
            </div>
            <HoverInfo title="Badge milestones">
              <ul className="list-disc pl-4 space-y-1">
                <li>🥈 Silver — 7 days</li>
                <li>🥇 Gold — 15 days</li>
                <li>💎 Diamond — 30 days</li>
                <li>🌟 Legendary — 100 days</li>
              </ul>
            </HoverInfo>
          </div>
          {/* progress path */}
          <div className="relative mt-1 mb-2"
            onClick={() => {
              const runner = document.getElementById("avatar-runner");
              if (!runner) return;
              runner.style.setProperty(
                "--target-x",
                `${badgeProgress * 100}%`
              );
              runner.classList.remove("hidden");
              runner.style.animation = "avatar-run 3s ease-out forwards";
              // hide original avatar briefly
              const originals = document.querySelectorAll("[data-avatar-main]");
              originals.forEach(el => {
                (el as HTMLElement).style.opacity = "0";
              });
            }}
          >
            {/* base line */}
            <div className="relative h-[2px] w-full rounded-full bg-slate-700/70 overflow-hidden">
              {/* progress fill */}
              <div
                className="
      absolute left-0 top-0 h-full
      bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500
      transition-all duration-700 ease-out
               "
                style={{
                  width: `${badgeProgress * 100}%`,
                }}
              />
            </div>
            {/* badge icons – SKETCH BASED POSITIONS */}
            <div className="absolute inset-0 -top-3 text-lg">
              <span className="absolute left-[28%] -translate-x-1/2">🥈</span>
              <span className="absolute left-[52%] -translate-x-1/2">🥇</span>
              <span className="absolute left-[74%] -translate-x-1/2">💎</span>
              <span className="absolute left-[92%] -translate-x-1/2">🌟</span>
            </div>

            {/* avatar progress */}
            <div
              data-avatar-main
              className="absolute -top-5 h-7 w-7 rounded-full ring-2 ring-sky-400 bg-slate-900 overflow-hidden shadow-lg shadow-sky-900 transition-all"
              style={{
                left: `${badgeProgress * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              <img
                src={profileAvatar || "/avatar.png"}
                alt="User avatar"
                className="h-full w-full object-cover"
              />
            </div>
            {/* RUN ANIMATION OVERLAY (visual only) */}
            <div
              id="avatar-runner"
              onAnimationEnd={() => {
                const runner = document.getElementById("avatar-runner");
                if (!runner) return;

                runner.classList.add("hidden");
                runner.style.animation = "none";

                const originals = document.querySelectorAll("[data-avatar-main]");
                originals.forEach(el => {
                  (el as HTMLElement).style.opacity = "1";
                });
              }}
              className="pointer-events-none absolute -top-8 hidden"
              style={{ left: "5%", transform: "translateX(-50%)" }}
            >
              {/* avatar bubble */}
              <div className="relative h-7 w-7 rounded-full overflow-hidden ring-2 ring-sky-400 bg-slate-900 z-10">
                <img
                  src={profileAvatar || "/avatar.png"}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* legs — OUTSIDE avatar */}
              <div className="absolute top-[28px] left-1/2 -translate-x-1/2 flex gap-[4px]">
                <span className="leg leg-left" />
                <span className="leg leg-right" />
              </div>
            </div>
          </div>
          <p
            className={`text-[11px] ${isDarkMode ? "text-slate-500" : "text-slate-900"
              }`}
          >
            As your streak grows, your avatar moves along the badge path. Silver,
            Gold, Diamond and Legendary/Loyalty badges will unlock at different
            milestones.
          </p>
          {/* your badges */}
          <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
            <BadgeCard
              icon="🥈"
              name="Silver"
              owned={Math.max(totalSilverCount - pendingSilverCount, 0)}
              isDarkMode={isDarkMode}
            />
            <BadgeCard
              icon="🥇"
              name="Gold"
              owned={Math.max(totalGoldCount - pendingGoldCount, 0)}
              isDarkMode={isDarkMode}
            />
            <BadgeCard
              icon="💎"
              name="Diamond"
              owned={Math.max(totalDiamondCount - pendingDiamondCount, 0)}
              isDarkMode={isDarkMode}
            />
            <BadgeCard
              icon="🌟"
              name="Legendary / Loyalty"
              owned={Math.max(totalLegendaryCount - pendingLegendaryCount, 0)}
              isDarkMode={isDarkMode}
            />
          </div>
        </section>
        {/* Donation */}
        <section
          className={`
    p-4 space-y-3
    ${isDarkMode ? glassCard : ""}
  `}
        >
          <button
            type="button"
            onClick={() => setShowDonate((v) => !v)}
            className="w-full flex items-center justify-between text-sm font-semibold text-slate-100 active:scale-[0.98] transition-transform
            "
          >
            <span
              className={`flex items-center gap-2 text medium ${isDarkMode ? "text-slate-400" : "text-slate-900"
                }`}
            >
              <span className="text-lg"></span> Creator support
            </span>
            <span
              className={`text-[11px] ${isDarkMode ? "text-slate-500" : "text-slate-900"
                }`}
            >
              {showDonate ? "Hide" : "Tip in USDm on Celo"}
            </span>
          </button>

          {showDonate && (
            <div className="mt-3 space-y-3 text-xs bg-slate-950/80 rounded-2xl p-3 shadow-inner shadow-slate-950">
              <p className="text-slate-300">Tip in USDm on Celo</p>

              <div className="flex flex-wrap gap-2">
                {[1, 5, 10, 100].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleSelectDonation(v)}
                    className={`px-3 py-1.5 rounded-full border text-xs active:scale-[0.98] transition-transform
                        ${donationAmount === v.toString()
                        ? "border-sky-400 bg-sky-500/10 text-sky-200"
                        : "border-slate-700 bg-slate-900 text-slate-300"
                      }`}
                  >
                    {v} USDm
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs outline-none focus:border-sky-400 ${isDarkMode
                    ? "bg-slate-900 border border-slate-700 text-slate-100"
                    : "bg-white border border-slate-300 text-slate-900"
                    }`}
                  placeholder="Custom amount"
                />
                <button
                  type="button"
                  onClick={handleDonateClick}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition active:scale-[0.98] transition-transform
                  "
                >
                  Donate
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-slate-500">Top supporters</p>
                {topSupporters.length === 0 ? (
                  <p className="text-[11px] text-slate-500">No supporters yet.</p>
                ) : (
                  <ul className="text-[11px] text-slate-400 space-y-1">
                    {topSupporters.map((s, i) => (
                      <li
                        key={s.address}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {s.avatar ? (
                            <img
                              src={s.avatar}
                              alt={s.name || s.address}
                              className="h-5 w-5 rounded-full"
                            />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-slate-700" />
                          )}
                          <span className="text-[11px]">
                            #{i + 1}{" "}
                            {s.name ||
                              `${s.address.slice(0, 6)}…${s.address.slice(-4)}`}
                          </span>
                        </div>
                        <span className="text-[11px]">
                          {s.total.toFixed(2)} USDm
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>
          )}
        </section>

        {/* Status */}
        {status && (
          <div className="mt-2 text-[11px] text-amber-200 bg-amber-950/40 rounded-2xl p-2.5 whitespace-pre-wrap shadow-inner shadow-amber-900/60">
            {status}
          </div>
        )}

        {/* Footer */}
        <footer
          className={`pt-3 mt-4 flex items-center justify-between text-[11px] ${isDarkMode ? "text-slate-400" : "text-slate-700"
            }`}
        >
          <span className={isDarkMode ? "" : "text-slate-900"}>
            Built on Celo 
          </span>

          <a
            href="https://celoscan.io/token/0xf3473730b41f0f5720bc8aa8fade0480062125ba"
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2 transition ${isDarkMode
              ? "hover:text-sky-300"
              : "hover:text-sky-700 text-slate-900"
              }`}
          >
            <span>Powered by</span>

            <span className="flex items-center gap-1">
              <img
                src="/celo-logo.jpg"
                alt="0xtxn logo"
                className="h-5 w-5 rounded-sm object-contain"
              />
              <span className="font-medium">0xtxn</span>
            </span>
          </a>
        </footer>

      </div>








      {showVault && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">

          {/* Backdrop */}
          <div
            className="
        absolute inset-0
        bg-black/70
        backdrop-blur-md
      "
            onClick={() => setShowVault(false)}
          />

          {/* Modal */}
          <div
            className="
        relative
        w-full
        max-w-[380px]
        rounded-[32px]
        border
        border-cyan-400/20
        bg-[#050816]
        p-4
        shadow-[0_0_60px_rgba(0,255,255,0.12)]
      "
          >

            {/* Top Header */}
            <div className="mb-4 flex items-center justify-between">

              <div className="flex items-center gap-3">

                {/* Icon */}
                {/* Icon */}
                <div
                  className="
    flex h-12 w-12 items-center justify-center
    overflow-hidden
    rounded-2xl
    transition-all
    hover:scale-105
  "
                >

                  <Image
                    src="/vault.png"
                    alt="Vault"
                    width={56}
                    height={56}
                    className="object-contain"
                  />

                </div>

                {/* Title */}
                <div>
                  <h2
                    className="
                text-[28px]
                font-black
                tracking-tight
                text-yellow-300
              "
                  >
                    Vault
                  </h2>

                  <p className="text-xs text-slate-400">
                    Store your USDm securely
                  </p>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={() => setShowVault(false)}
                className="
            flex h-11 w-11 items-center justify-center
            rounded-full
            border border-white/10
            bg-white/5
            text-slate-300
            transition
            hover:bg-white/10
            hover:text-white
          "
              >
                ✕
              </button>
            </div>

            {/* Total Vault Balance Card */}
            <div
              className="
          relative
          overflow-hidden
          rounded-[24px]
          border border-yellow-500/15
          bg-[#11141d]
          px-5
          py-5
          shadow-[0_0_50px_rgba(255,180,0,0.08)]
        "
            >

              {/* Glow */}
              <div
                className="
            absolute inset-0
            bg-[radial-gradient(circle_at_top_left,rgba(255,180,0,0.22),transparent_45%)]
            pointer-events-none
          "
              />

              {/* Bottom Beam */}
              <div
                className="
            absolute bottom-0 left-0 right-0
            h-[1px]
            bg-gradient-to-r
            from-transparent
            via-yellow-400/50
            to-transparent
          "
              />

              <div className="relative flex items-center justify-between">

                {/* Left */}
                <div>

                  <p className="text-[13px] font-medium text-yellow-100/70">
                    Total Vault Balance
                  </p>

                  <h2
                    className="
                mt-1
                text-[30px]
                font-black
                tracking-tight
                text-yellow-300
                drop-shadow-[0_0_10px_rgba(255,210,0,0.25)]
              "
                  >
                    {vaultBalance} USDm
                  </h2>

                </div>

                {/* Right */}
                <div className="relative flex items-center">

                  {/* Graph */}
                  <svg
                    width="90"
                    height="40"
                    viewBox="0 0 90 40"
                    fill="none"
                    className="absolute right-7 opacity-80"
                  >
                    <path
                      d="
                  M0 28
                  C15 10, 25 10, 40 28
                  S65 38, 90 12
                "
                      stroke="url(#gold)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    <defs>
                      <linearGradient
                        id="gold"
                        x1="0"
                        y1="0"
                        x2="90"
                        y2="0"
                      >
                        <stop stopColor="#facc15" />
                        <stop offset="1" stopColor="#fde68a" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Coin */}
                  <div className="relative z-10 text-[52px]">
                    🪙
                  </div>

                </div>
              </div>
            </div>

            {/* User Balance */}
            <div className="mt-4">

              <p className="text-sm text-slate-400">
                Your Vault Balance
              </p>

              <h3
                className="
      mt-1
      text-[21px]
      leading-none
      font-black
      tracking-tight
      text-white
    "
              >
                {userVaultBalance} USDm
              </h3>

            </div>

            {/* Input */}
            <div className="mt-5">

              <div
                className="
      flex items-center
      rounded-[22px]
      border border-white/10
      bg-[#0b1225]
      px-5
      py-4
    "
              >

                <input
                  type="number"
                  min="0"
                  value={vaultAmount}
                  onChange={(e) => setVaultAmount(e.target.value)}
                  placeholder="0"
                  className="
        w-full
        bg-transparent
        text-[24px]
        font-bold
        text-white
        outline-none
        placeholder:text-slate-500
      "
                />

                <div
                  className="
        ml-3
        flex items-center gap-1
        text-sm
        font-semibold
        text-slate-300
      "
                >
                  USDm

                  <span className="text-slate-500">
                    ▼
                  </span>
                </div>

              </div>

            </div>

            {/* Buttons */}
            <div className="mt-6">

              <div className="grid grid-cols-2 gap-3">

                {/* Deposit */}
                <button
                  onClick={handleVaultDeposit}
                  className="
        flex items-center justify-center gap-2
        rounded-2xl
        bg-[#f5c842]
        py-4
        text-[17px]
        font-black
        text-black
        shadow-[0_8px_30px_rgba(245,200,66,0.28)]
        transition-all
        hover:scale-[1.02]
      "
                >
                  <span className="text-lg">
                    ↓
                  </span>

                  Deposit
                </button>

                {/* Withdraw */}
                <button
                  onClick={handleVaultWithdraw}
                  className="
        flex items-center justify-center gap-2
        rounded-2xl
        border border-white/10
        bg-[#111827]
        py-4
        text-[17px]
        font-black
        text-white
        transition-all
        hover:bg-[#182033]
      "
                >
                  <span className="text-lg text-yellow-300">
                    ↑
                  </span>

                  Withdraw
                </button>

              </div>

              {/* Bottom Text */}
              <div
                className="
    mt-4
    flex items-center justify-center gap-2
    text-sm
    text-slate-400
  "
              >

                {/* Shield Icon */}
                <div
                  className="
      flex h-5 w-5 items-center justify-center
      rounded-full
      bg-[#0b1733]
      border border-blue-500/20
      shadow-[0_0_12px_rgba(59,130,246,0.18)]
    "
                >

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    className="h-3 w-3 text-blue-400"
                  >
                    <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>

                </div>

                <span className="font-medium">
                  Your assets. Your control.
                </span>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* Onboarding overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="
    w-[90%] max-w-sm rounded-3xl
    bg-slate-950/80 backdrop-blur-xl
    border border-sky-400/50
    shadow-[0_0_25px_rgba(56,189,248,0.45),0_0_60px_rgba(56,189,248,0.25)]
    p-5 space-y-3
    animate-[overlayFade_0.55s_ease-out]
            "
          >

            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center">
                <img
                  src="/logo-0x.png"
                  alt="0x logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Welcome to CeloDaily</span>
                <span className="text-[11px] text-slate-300">
                  Check in every day on Celo, grow your streak and earn 0xtxn rewards.
                </span>
              </div>
            </div>

            <ul className="text-[11px] text-slate-200 space-y-1 pl-4 list-disc">
              <li>Tap <span className="font-semibold">Check-in</span> once per day to keep your streak alive.</li>
              <li>Claim your <span className="font-semibold">0xtxn</span> rewards when the button turns pink.</li>
              <li>Tip in Mento Dollar (USDm) to climb the supporter leaderboard.</li>
            </ul>

            <button
              onClick={closeOnboarding}
              className="mt-2 w-full rounded-full bg-sky-500 text-xs font-semibold text-slate-950 py-2 hover:bg-sky-400 transition active:scale-[0.98] transition-transform
              "
            >
              Got it, let&apos;s start
            </button>
          </div>
        </div>
      )}

      {/* Toast popup */}
      {toast && (
        <div className="pointer-events-none fixed top-6 left-0 right-0 flex justify-center z-40">
          <div
            className="pointer-events-auto rounded-2xl bg-slate-950/95 border border-sky-400/60 px-4 py-2.5 text-xs text-sky-50 shadow-lg backdrop-blur-lg flex items-center gap-2 animate-[toast-pop_0.28s_ease-out]"
          >
            <span className="text-base">
              {toast.type === "checkin" ? "⚡" : "💰"}
            </span>
            <div className="flex flex-col">
              <span className="font-semibold">
                {toast.type === "checkin"
                  ? "Check-in reward"
                  : toast.message.toLowerCase().includes("donated")
                    ? "Thank you for your support"
                    : "Reward claimed"}
              </span>
              <span className="text-[11px] text-slate-200">
                {toast.message}
              </span>
            </div>
          </div>
        </div>
      )}

      {showDevPanel && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

          <div className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-950 border border-sky-400/40 p-6">

            <div className="flex justify-between items-center">

              <span className="text-sm font-semibold text-sky-300">
                Dev panel
              </span>

              <button
                onClick={() => {
                  setShowDevPanel(false);
                  setDevUnlocked(false);
                  setDevPasswordInput("");
                }}
                className="text-slate-400"
              >
                ✕
              </button>

            </div>

            {!devUnlocked && (

              <input

                type="password"

                maxLength={4}

                value={devPasswordInput}

                onChange={(e) => {

                  const val = e.target.value;

                  setDevPasswordInput(val);

                  if (val === DEV_PASSWORD) {

                    setDevUnlocked(true);

                  }
                }}
                placeholder="Enter 4-digit password"
                className="w-full rounded-xl px-3 py-2 text-xs bg-slate-900 border border-slate-700 text-slate-100"
              />
            )}

            {devUnlocked && (
              <div className="flex flex-col gap-2">

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                  {/* MINT */}
                  <div className="border border-white/10 rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-lg">Mint Tokens</h3>

                    <input
                      value={devMintAddress}
                      onChange={(e) => setDevMintAddress(e.target.value)}
                      placeholder="Wallet address"
                      className="w-full rounded-lg bg-black/30 p-3"
                    />

                    <input
                      value={devMintAmount}
                      onChange={(e) => setDevMintAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-full rounded-lg bg-black/30 p-3"
                    />

                    <button
                      onClick={handleDevMint}
                      disabled={devRunning}
                      className="w-full rounded-lg bg-blue-500 p-3 font-bold"
                    >
                      Mint
                    </button>
                  </div>

                  {/* BURN */}
                  <div className="border border-white/10 rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-lg">Burn Tokens</h3>

                    <input
                      value={devBurnAmount}
                      onChange={(e) => setDevBurnAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-full rounded-lg bg-black/30 p-3"
                    />

                    <input
                      type="number"
                      value={devBurnCount}
                      onChange={(e) =>
                        setDevBurnCount(e.target.value)
                      }
                      placeholder="Burn Count"
                      className="
    w-full rounded-xl
    bg-slate-900
    border border-slate-700
    px-3 py-2
    text-sm text-white
    outline-none
  "
                    />

                    <button
                      onClick={handleDevBurn}
                      disabled={devRunning}
                      className="w-full rounded-lg bg-red-500 p-3 font-bold"
                    >
                      Burn
                    </button>
                  </div>

                  {/* CLAIM */}
                  <div className="border border-white/10 rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-lg">Claim From Contract</h3>

                    <input
                      value={devClaimAddress}
                      onChange={(e) => setDevClaimAddress(e.target.value)}
                      placeholder="Wallet address"
                      className="w-full rounded-lg bg-black/30 p-3"
                    />

                    <input
                      value={devClaimAmount}
                      onChange={(e) => setDevClaimAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-full rounded-lg bg-black/30 p-3"
                    />

                    <button
                      onClick={handleDevClaim}
                      disabled={devRunning}
                      className="w-full rounded-lg bg-green-500 p-3 font-bold"
                    >
                      Claim
                    </button>
                  </div>

                  {/* REVERSE */}
                  <div className="border border-white/10 rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-lg">Reverse Tokens</h3>

                    <input
                      value={devReverseToken}
                      onChange={(e) => setDevReverseToken(e.target.value)}
                      placeholder="Token contract"
                      className="w-full rounded-lg bg-black/30 p-3"
                    />

                    <input
                      value={devReverseAmount}
                      onChange={(e) => setDevReverseAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-full rounded-lg bg-black/30 p-3"
                    />

                    <button
                      onClick={handleDevReverse}
                      disabled={devRunning}
                      className="w-full rounded-lg bg-yellow-500 p-3 font-bold text-black"
                    >
                      Reverse
                    </button>
                  </div>

                  {/* MULTISEND */}
                  <div className="border border-white/10 rounded-xl p-4 space-y-3">
                    <h3 className="font-bold text-lg">MultiSend</h3>

                    <textarea
                      value={devMultiAddresses}
                      onChange={(e) => setDevMultiAddresses(e.target.value)}
                      placeholder="One address per line"
                      className="w-full rounded-lg bg-black/30 p-3 h-32"
                    />

                    <textarea
                      value={devMultiAmounts}
                      onChange={(e) => setDevMultiAmounts(e.target.value)}
                      placeholder="One amount per line"
                      className="w-full rounded-lg bg-black/30 p-3 h-32"
                    />

                    <button
                      onClick={handleDevMultiSend}
                      disabled={devRunning}
                      className="w-full rounded-lg bg-purple-500 p-3 font-bold"
                    >
                      MultiSend
                    </button>
                  </div>

                </div>


                <hr className="border-white/10 my-1" />

                <div className="text-[11px] text-slate-400 text-center">

                  NFT actions

                </div>

              </div>

            )}

          </div>

        </div>

      )}

      {/* Profile drawer (animated */}
      <div
        className={`
          fixed inset-0 z-50 flex
          transition-opacity duration-300
          ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* overlay */}
        <div
          className={`
            flex-1 bg-black/40 backdrop-blur-sm
            transition-opacity duration-300
            ${drawerOpen ? "opacity-100" : "opacity-0"}
          `}


          onClick={() => {
            setDrawerOpen(false);
            setShowBadgeInfo(false);
          }}

        />

        {/* panel */}
        <div
          className={`
    w-4/5 max-w-xs
    p-4 flex flex-col gap-4
    transform transition-transform duration-300 ease-out

    ${isDarkMode
              ? "bg-sky-950/70 backdrop-blur-2xl border border-sky-500/10 shadow-2xl shadow-black/70"
              : "basedaily-drawer-day border border-slate-200 shadow-xl"
            }

    ${drawerOpen ? "translate-x-0" : "translate-x-full"}
  `}
        >

          {/* header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">

            </h2>
            <button
              onClick={() => setDrawerOpen(false)}
              className="text-slate-400 text-sm hover:text-slate-100 active:scale-[0.98] transition-transform
              "
            >
              ✕
            </button>
          </div>

          <div
            className={`rounded-2xl px-3 py-2.5 flex items-center justify-between gap-3 border 
              ${isDarkMode ? "bg-slate-950/60 border-white/5" : "bg-white/80 border-sky-100/60"}`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <img
                src={profileAvatar || "/raihan-avatar.png"}
                alt="User avatar"
                className="h-15 w-15 rounded-full object-cover cursor-pointer"
                onClick={() => document.getElementById("avatarUpload")?.click()}
              />

              {/* hidden file input (OUTSIDE layout) */}
              <input
                id="avatarUpload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              {/* Name */}
              <div className="flex flex-col">
                <span
                  className="text-sm font-semibold cursor-pointer"
                  onClick={() => {
                    const name = prompt("Enter your name", profileName || "");
                    if (name !== null) saveProfile(name, profileAvatar);
                  }}
                >
                  {profileName || "Celo user"}
                </span>

                {/* username REMOVE → blank বা small hint */}
                <span className="text-[11px] text-slate-400">
                  Tap name to edit
                </span>
              </div>
            </div>

            {/* Theme toggle button */}
            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              aria-label="Toggle theme"
              className={`relative inline-flex items-center justify-between w-14 h-7 rounded-full px-1 border text-[13px] select-none overflow-hidden active:scale-95 transition-transform

                ${isDarkMode ? "bg-slate-900/90 border-slate-600" : "bg-sky-100 border-sky-300"}`}
            >
              <span
                className={`z-10 transition-opacity ${isDarkMode ? "opacity-100" : "opacity-40"
                  }`}
              >
                🌙
              </span>
              <span
                className={`z-10 transition-opacity ${isDarkMode ? "opacity-40" : "opacity-100"
                  }`}
              >
                ☀️
              </span>
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transform transition-transform duration-200
                  ${isDarkMode ? "translate-x-0" : "translate-x-7"}`}
              />
            </button>
          </div>

          {/* FID + Neynar score */}
          <div
            className={`
    rounded-2xl
    px-3 py-3 space-y-1
    text-[11px]
    ${isDarkMode
                ? "bg-slate-950/60 border border-white/5 text-slate-300"
                : "bg-white border border-slate-200 text-slate-700"
              }
  `}
          >

            <div className="flex justify-between">

              <span
                className={`
      font-mono
      ${isDarkMode ? "text-slate-100" : "text-slate-900 font-semibold"}
    `}
              >

              </span>
            </div>

            <div className="flex justify-between">

              <span
                className={`
    ${isDarkMode ? "text-sky-300" : "text-sky-500"}
    font-semibold
    text-[14px]
  `}
              >

              </span>

            </div>

          </div>

          {/* Your stats (on-chain) */}
          <div
            className={`
    rounded-2xl
    px-3 py-3
    ${isDarkMode
                ? "bg-slate-950/60 border border-white/5"
                : "bg-white border border-slate-200"
              }
  `}
          >
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">

              {/* 🔥 Streak */}
              <div>
                <p className="text-lg">🔥</p>
                <p
                  className={`
          font-semibold
          ${isDarkMode ? "text-slate-100" : "text-slate-900"}
        `}
                >
                  {streakNumber}
                </p>
                <p
                  className={`
          ${isDarkMode ? "text-slate-400" : "text-slate-900"}
        `}
                >
                  Streak
                </p>
              </div>

              {/* 🏅 Badges */}
              <div className="flex flex-col items-center relative">
                <button
                  type="button"
                  onClick={() => setShowBadgeInfo((v) => !v)}
                  className="flex flex-col items-center active:scale-95 transition active:scale-[0.98]"
                >
                  <p className="text-lg">🏅</p>
                  <p
                    className={`
            font-semibold
            ${isDarkMode ? "text-slate-100" : "text-slate-900"}
          `}
                  >
                    {totalSilverCount + totalGoldCount + totalDiamondCount + totalLegendaryCount}
                  </p>
                  <p
                    className={`
            ${isDarkMode ? "text-slate-400" : "text-slate-900"}
          `}
                  >
                    Badges
                  </p>
                </button>

                {showBadgeInfo && (
                  <div
                    className="
            absolute top-full mt-2 left-1/2 -translate-x-1/2
            bg-slate-950/95 backdrop-blur-xl
            border border-white/10
            rounded-xl px-3 py-2
            text-[11px] text-slate-200
            shadow-2xl z-50
            animate-[toast-pop_0.18s_ease-out]
          "
                  >
                    <div className="flex flex-col gap-1 whitespace-nowrap">
                      <span>🥈 Silver: {totalSilverCount}</span>
                      <span>🥇 Gold: {totalGoldCount}</span>
                      <span>💎 Diamond: {totalDiamondCount}</span>
                      <span>🌟 Legendary: {totalLegendaryCount}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 💰 0xtxn */}
              <div>
                <p className="text-lg">💰</p>
                <p
                  className={`
          font-semibold
          ${isDarkMode ? "text-slate-100" : "text-slate-900"}
        `}
                >
                  {totalEarnedReadable ?? "—"}
                </p>
                <p
                  className={`
          ${isDarkMode ? "text-slate-400" : "text-slate-900"}
        `}
                >
                  0xtxn
                </p>
              </div>

            </div>
          </div>

          {/* Contact dev */}
          <div
            className={`
              rounded-2xl
               px-3 py-3 space-y-2
              ${isDarkMode
                ? "bg-slate-950/60 border border-white/5"
                : "bg-white border border-slate-200"
              }
              `}
          >

            <p
              className={`
    text-xs font-semibold
    ${isDarkMode ? "text-slate-100" : "text-slate-900"}
  `}
            >
              Contact dev
            </p>

            <div className="flex items-center gap-3 text-[20px] text-slate-300">

              <a
                href="https://x.com/Oxxtxn"
                target="_blank"
                rel="noreferrer"
                className="hover:text-sky-400"
                title="X (Twitter)"
              >
                𝕏
              </a>
              <a
                href="mailto:kabir.business.marketing@gmail.com"
                className="hover:text-sky-400"
                title="Email"
              >
                ✉️
              </a>

            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowDevPanel(true)}
              className={`
    w-full
    rounded-xl
    px-3 py-2
    text-xs
    font-semibold
    transition
    ${isDarkMode
                  ? "bg-slate-950/60 border border-white/5 text-slate-300 hover:bg-slate-800"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }
  `}
            >
              Dev panel
            </button>
          </div>

          {/* bottom row */}
          <div className="mt-auto flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
            <button
              onClick={() => setAboutOpen(true)}
              className="relative
                 px-3 py-1.5
                  rounded-full
                    text-[11px]
                      font-medium
                        text-sky-300
                          bg-sky-500/10
                            border border-sky-400/30
                              shadow-[0_0_12px_rgba(56,189,248,0.25)]
                                hover:text-sky-200
                                  hover:bg-sky-400/20
                                    hover:shadow-[0_0_18px_rgba(56,189,248,0.45)]
                                      transition-all
                                        duration-300 active:scale-[0.98] transition-transform
                                        "
            >
              <span className={isDarkMode ? "text-sky-300" : "text-slate-900"}>
                About us
              </span>
              <span> 📒</span>
            </button>
            <button
              onClick={handleShare}
              className="
                relative
                 px-3 py-1.5
                  rounded-full
                    text-[11px]
                      font-medium
                        text-sky-300
                          bg-sky-500/10
                            border border-sky-400/30
                              shadow-[0_0_12px_rgba(56,189,248,0.25)]
                                hover:text-sky-200
                                  hover:bg-sky-400/20
                                    hover:shadow-[0_0_18px_rgba(56,189,248,0.45)]
                                      transition-all
                                        duration-300 active:scale-[0.98] transition-transform

                                          "
            >
              <span className={isDarkMode ? "text-sky-300" : "text-slate-900"}>
                Share
              </span>
            </button>

          </div>

          <div className="mt-3 text-center text-[10px] text-slate-500">
            © 2026 CeloDaily by{" "}
            <a
              href="https://celoscan.io/token/0xf3473730b41f0f5720bc8aa8fade0480062125ba"
              target="_blank"
              rel="noreferrer"
              className="text-sky-500 hover:underline"
            >
              0xtxn
            </a>{" "}
            — All rights reserved.
          </div>

        </div>

      </div>

      {/* About us modal */}
      {aboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* overlay */}
          <button
            className="absolute inset-0 bg-black/50 backdrop-blur-sm active:scale-[0.98] transition-transform
            "
            onClick={() => setAboutOpen(false)}
          />

          {/* panel */}
          <div
            className="relative z-10 mx-4 max-w-sm w-full rounded-3xl bg-slate-950/95 border border-sky-500/20 shadow-2xl shadow-black/70 px-4 py-4 text-xs text-slate-100 animate-[toast-pop_0.28s_ease-out]"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold flex items-center gap-1">
                <span>About CeloDaily</span>
                <span>📒</span>
              </h3>
              <button
                onClick={() => setAboutOpen(false)}
                className="text-slate-400 hover:text-slate-100 text-sm active:scale-[0.98] transition-transform
                "
              >
                ✕
              </button>
            </div>

            <p className="mb-2 text-[11px] text-slate-300">
              CeloDaily is a miniapp where you Check-in to the Celo network every day to increase your streak and unlock 0xtxn rewards.
            </p>

            <p className="mb-2 text-[11px] text-slate-300">
              Daily reward = celo reward × your current streak. The more days of streak
              , the more 0xtxn will be accumulated in the pending balance, which you can claim later with one click.
            </p>

            <p className="mb-2 text-[11px] text-slate-300">
              Badges are unlocked at specific milestones:
              7 days = Silver, 15 days = Gold, 30 days = Diamond, 100 days = Legendary / Loyalty.
              When you check-in, new badges are added to the pending list on milestone days, and when you claim
              those badges are minted in your wallet.
            </p>

            <p className="text-[11px] text-slate-400">
              If you want, you can also support the project by tipping Mento Dollar (USDm) from the Support creator section below. 💙
            </p>
          </div>
        </div>
      )}

      {flashGlow && (
        <div
          className="
      pointer-events-none fixed inset-0 z-40
      bg-sky-400/20
      animate-[flashGlow_0.6s_ease-out]
    "
        />
      )}

      {showMintIdentity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMintIdentity(false)}
          />

          {/* modal */}
          <div className="
      relative z-10 w-[90%] max-w-sm
      rounded-3xl
      bg-slate-950/90 backdrop-blur-xl
      border border-sky-400/30
      shadow-2xl shadow-black/70
      p-4 space-y-3
      animate-[toast-pop_0.28s_ease-out]
    ">
            <h3
              className={`
    relative
    text-center
    text-lg
    font-semibold
    tracking-tight
    transition-all
    duration-500

    ${hasIdentityNFT
                  ? `
          bg-gradient-to-r from-emerald-300 via-sky-300 to-blue-400
          bg-clip-text text-transparent
          animate-[identityPulse_3.5s_ease-in-out_infinite]
        `
                  : `
          text-slate-100
        `
                }
  `}
            >
              {hasIdentityNFT ? "Your Identity" : "Mint Your CeloDaily Identity"}

              {/* subtle underline glow */}
              {hasIdentityNFT && (
                <span
                  className="
        pointer-events-none
        absolute
        left-1/2
        -bottom-1
        h-[2px]
        w-24
        -translate-x-1/2
        rounded-full
        bg-gradient-to-r from-transparent via-sky-400/60 to-transparent 
        blur-sm
      "
                />
              )}
            </h3>
            {/* NFT preview card */}
            <div
              className="
    relative
    rounded-2xl
    p-4 space-y-3
    overflow-hidden
    bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#020617]
    border border-white/10
    shadow-[0_0_40px_rgba(56,189,248,0.15)]
  "
            >

              {/* glow blob */}
              <div className="
  absolute -top-10 -right-10
  h-32 w-32
  rounded-full
  bg-sky-500/20
  blur-3xl
" />

              {/* subtle grid texture */}
              <div className="
  absolute inset-0
  opacity-[0.06]
  bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]
  bg-[size:24px_24px]
  pointer-events-none
" />

              <div className="flex items-center gap-3">
                <img
                  src={profileAvatar || "/avatar.png"}
                  className="h-12 w-12 rounded-full ring-2 ring-sky-400 animate-[breath_3.6s_ease-in-out_infinite]" 
                />
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {profileName || "Celo user"}
                  </p>
                  <p className="text-[11px] text-slate-400">

                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">🔥 Highest streak</span>
                <span className=" text-right
    text-xl font-extrabold
    bg-gradient-to-r from-amber-300 to-yellow-400
    bg-clip-text text-transparent
    drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]
  ">
                  {highestNumber}
                </span>


                <span className="text-right text-sm font-semibold text-sky-300">

                </span>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-slate-400 text-center">
                <img src="/logo-0x.png" className="h-4 w-4" />
                CeloDaily Identity NFT
              </div>
            </div>

            {/* mint button */}
            <div className="flex justify-center mt-3">
              <button
                onClick={handleMintIdentity}
                disabled={hasIdentityNFT === true}
                className={`
    mx-auto
    px-6 py-2
    rounded-full
    border border-sky-400/40
    backdrop-blur-md
    text-sm font-semibold
    shadow-[0_0_20px_rgba(56,189,248,0.25)]
    transition-all

    ${hasIdentityNFT
                    ? `
          bg-emerald-500/10
          text-emerald-300
          cursor-not-allowed
          shadow-[0_0_20px_rgba(16,185,129,0.25)]
        `
                    : `
          bg-sky-500/10
          text-sky-300
          hover:bg-sky-500/20
          hover:shadow-[0_0_30px_rgba(56,189,248,0.45)]
          active:scale-[0.97]
        `
                  }
  `}
              >
                {hasIdentityNFT ? "Minted ✓" : "Mint"}
              </button>

            </div>

          </div>
        </div>
      )}


    </main>
  );
}

function BadgeCard({
  icon,
  name,
  owned,
  isDarkMode,
}: {
  icon: string;
  name: string;
  owned: number;
  isDarkMode: boolean;
}) {
  return (
    <div
      className={`
        rounded-2xl
        px-3 py-2
        flex items-center justify-between

        ${isDarkMode
          ? "bg-slate-950/80 shadow-inner shadow-slate-950/70"
          : "bg-white border border-slate-200"
        }
      `}
    >
      <div className="flex items-center gap-2">
        <span
          className={`text-lg ${owned === 0
            ? "opacity-40 animate-[badge-pulse_1.8s_ease-in-out_infinite]"
            : ""
            }`}
        >
          {icon}
        </span>

        <span
          className={`text-[11px] ${isDarkMode ? "text-slate-100" : "text-slate-900"
            }`}
        >
          {name}
        </span>
      </div>

      <span
        className={`text-[11px] font-semibold ${isDarkMode ? "text-slate-400" : "text-slate-900"
          }`}
      >
        x{owned}
      </span>
    </div>
  );
}

function BadgeGlow({
  icon,
  count,
}:
  {
    icon: string;
    count: number;
  }) {
  return (
    <div className="relative">
      <span
        className="
          text-xl
          animate-[badge-glow_2.4s_ease-in-out_infinite]
        "
      >
        {icon}
      </span>

      {count > 1 && (
        <span
          className="
            absolute -top-1 -right-1
            text-[9px] font-bold
            bg-sky-500 text-slate-950
            rounded-full px-1
          "
        >
          {count}
        </span>
      )}
    </div>
  );
}

function BadgeGhost({ icon }: { icon: string }) {
  return (
    <span className="text-xl opacity-20 grayscale select-none">
      {icon}
    </span>
  );
}

function CeloBlockLogo({
  checkedIn,
  isDark,
}: {
  checkedIn: boolean;
  isDark: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <img
        src={isDark ? "/celo-white.png" : "/celo.png"}
        alt="Celo"
        className="h-6 w-auto object-contain transition-opacity duration-200"
      />

      {checkedIn && (
        <span className="ml-1 text-xs text-emerald-400 animate-[fade-up_0.3s_ease-out]">
          ✓
        </span>
      )}
    </div>
  );
}

function HoverInfo({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        absolute z-40 top-full mt-2 left-0
        w-64
        rounded-2xl
        bg-slate-950/95 backdrop-blur-xl
        border border-white/10
        shadow-2xl
        px-3 py-2
        text-[11px] text-slate-200
        opacity-0 scale-95
        group-hover:opacity-100 group-hover:scale-100
        transition-all duration-200
        pointer-events-none
      "
    >
      <p className="font-semibold text-sky-300 mb-1">{title}</p>
      {children}
    </div>
  );
}
