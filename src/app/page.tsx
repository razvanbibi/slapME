"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useWallet } from "@/lib/wallet";
import { slap, punch } from "@/lib/transactions";

import {
  getGlobalStats,
  getLastActivityId,
  getActivity,
} from "@/lib/read";



export default function Home() {
  const { wallet, connectWallet } = useWallet();
  const [userSlaps] = useState(24);
  const [userPunches] = useState(17);

  const [globalSlaps, setGlobalSlaps] = useState(0);
  const [globalPunches, setGlobalPunches] = useState(0);
  useEffect(() => {
    async function load() {
      try {
        const stats = await getGlobalStats();
        console.log("Global Stats:", stats);
        setGlobalSlaps(
          Number(stats.value.slaps.value)
        );
        setGlobalPunches(
          Number(stats.value.punches.value)
        );
        const last = await getLastActivityId();

        const lastId = Number(last.value);
        const activities = [];
        for (
          let id = lastId;
          id >= Math.max(1, lastId - 4);
          id--
        ) {

          const activity = await getActivity(id);

          console.log(activity);

          const item = activity.value.value;

          activities.push({

            address: item.user.value,

            action:
              Number(item.action.value) === 1
                ? "slap"
                : Number(item.action.value) === 2
                  ? "punch"
                  : Number(item.action.value) === 3
                    ? "patch"
                    : "hospital",

            block: "#" + item.block.value,

          });
          setRecentActivity(activities);
        }
        setRecentActivity(activities);
        console.log(activities);
      } catch (err) {
        console.error("Read Error:", err);
      }
    }

    load();
  }, []);

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const [animate, setAnimate] = useState(false);

  const handleSlap = async () => {
    setAnimate(true);

    setTimeout(() => {
      setAnimate(false);
    }, 250);

    if (!wallet.connected) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      console.log("Before slap()");
      await slap();
      console.log("After slap()");
    } catch (err) {
      console.error("SLAP ERROR:", err);
    }
  };

  const handlePunch = async () => {
    setAnimate(true);

    setTimeout(() => {
      setAnimate(false);
    }, 250);

    if (!wallet.connected) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      await punch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="grid-wrapper">
      <div className="grid-background" />

      <div className="relative z-10">

        {/* ================= HEADER ================= */}

        <header className="bg-[#090d1f] border-b border-slate-800">

          <div className="max-w-[1010px] mx-auto h-[45px] px-6 flex items-center justify-between">

            {/* Left */}

            <div className="flex items-center gap-4">

              <span className="text-3xl leading-none">
                ✋
              </span>

              <div>

                <h1 className="text-1xl font-black leading-none text-orange-400">
                  Slap me
                </h1>

                <p className="text-white text-[10px] mt-1">
                  Go ahead... slap or punch me! 😜
                </p>

              </div>

            </div>

            {/* Right */}

            <div className="flex items-center gap-2">

              <div className="flex items-center gap-2 bg-slate-800 text-white rounded-lg px-3 py-2 text-sm font-medium">
                <span>Stacks Mainnet</span>
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
              </div>

              <button
                onClick={connectWallet}
                className="cursor-pointer bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold"
              >
                {wallet.connected
                  ? `${wallet.address.slice(0, 5)}...${wallet.address.slice(-4)}`
                  : "Connect Wallet"}
              </button>

            </div>
          </div>

        </header>

        {/* ================= PAGE ================= */}

        <section className="max-w-[1280px] mx-auto px-5 py-6">

          <div className="grid grid-cols-[2.7fr_1fr] gap-4">

            {/* ================= CENTER ================= */}

            <div>

              <div className="bg-white rounded-[26px] shadow-xl p-6">

                {/* Bubble */}

                <div className="flex justify-center">
                  <div className="voltage-button">

                    <button>SLAP or PUNCH me!
                      I dare you 😝
                    </button>
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 234.6 61.3" preserveAspectRatio="none" xmlSpace="preserve">

                      <filter id="glow">
                        <feGaussianBlur className="blur" result="coloredBlur" stdDeviation="2"></feGaussianBlur>
                        <feTurbulence type="fractalNoise" baseFrequency="0.075" numOctaves="0.3" result="turbulence"></feTurbulence>
                        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="30" xChannelSelector="R" yChannelSelector="G" result="displace"></feDisplacementMap>
                        <feMerge>
                          <feMergeNode in="coloredBlur"></feMergeNode>
                          <feMergeNode in="coloredBlur"></feMergeNode>
                          <feMergeNode in="coloredBlur"></feMergeNode>
                          <feMergeNode in="displace"></feMergeNode>
                          <feMergeNode in="SourceGraphic"></feMergeNode>
                        </feMerge>
                      </filter>
                      <path className="voltage line-1" d="m216.3 51.2c-3.7 0-3.7-1.1-7.3-1.1-3.7 0-3.7 6.8-7.3 6.8-3.7 0-3.7-4.6-7.3-4.6-3.7 0-3.7 3.6-7.3 3.6-3.7 0-3.7-0.9-7.3-0.9-3.7 0-3.7-2.7-7.3-2.7-3.7 0-3.7 7.8-7.3 7.8-3.7 0-3.7-4.9-7.3-4.9-3.7 0-3.7-7.8-7.3-7.8-3.7 0-3.7-1.1-7.3-1.1-3.7 0-3.7 3.1-7.3 3.1-3.7 0-3.7 10.9-7.3 10.9-3.7 0-3.7-12.5-7.3-12.5-3.7 0-3.7 4.6-7.3 4.6-3.7 0-3.7 4.5-7.3 4.5-3.7 0-3.7 3.6-7.3 3.6-3.7 0-3.7-10-7.3-10-3.7 0-3.7-0.4-7.3-0.4-3.7 0-3.7 2.3-7.3 2.3-3.7 0-3.7 7.1-7.3 7.1-3.7 0-3.7-11.2-7.3-11.2-3.7 0-3.7 3.5-7.3 3.5-3.7 0-3.7 3.6-7.3 3.6-3.7 0-3.7-2.9-7.3-2.9-3.7 0-3.7 8.4-7.3 8.4-3.7 0-3.7-14.6-7.3-14.6-3.7 0-3.7 5.8-7.3 5.8-2.2 0-3.8-0.4-5.5-1.5-1.8-1.1-1.8-2.9-2.9-4.8-1-1.8 1.9-2.7 1.9-4.8 0-3.4-2.1-3.4-2.1-6.8s-9.9-3.4-9.9-6.8 8-3.4 8-6.8c0-2.2 2.1-2.4 3.1-4.2 1.1-1.8 0.2-3.9 2-5 1.8-1 3.1-7.9 5.3-7.9 3.7 0 3.7 0.9 7.3 0.9 3.7 0 3.7 6.7 7.3 6.7 3.7 0 3.7-1.8 7.3-1.8 3.7 0 3.7-0.6 7.3-0.6 3.7 0 3.7-7.8 7.3-7.8h7.3c3.7 0 3.7 4.7 7.3 4.7 3.7 0 3.7-1.1 7.3-1.1 3.7 0 3.7 11.6 7.3 11.6 3.7 0 3.7-2.6 7.3-2.6 3.7 0 3.7-12.9 7.3-12.9 3.7 0 3.7 10.9 7.3 10.9 3.7 0 3.7 1.3 7.3 1.3 3.7 0 3.7-8.7 7.3-8.7 3.7 0 3.7 11.5 7.3 11.5 3.7 0 3.7-1.4 7.3-1.4 3.7 0 3.7-2.6 7.3-2.6 3.7 0 3.7-5.8 7.3-5.8 3.7 0 3.7-1.3 7.3-1.3 3.7 0 3.7 6.6 7.3 6.6s3.7-9.3 7.3-9.3c3.7 0 3.7 0.2 7.3 0.2 3.7 0 3.7 8.5 7.3 8.5 3.7 0 3.7 0.2 7.3 0.2 3.7 0 3.7-1.5 7.3-1.5 3.7 0 3.7 1.6 7.3 1.6s3.7-5.1 7.3-5.1c2.2 0 0.6 9.6 2.4 10.7s4.1-2 5.1-0.1c1 1.8 10.3 2.2 10.3 4.3 0 3.4-10.7 3.4-10.7 6.8s1.2 3.4 1.2 6.8 1.9 3.4 1.9 6.8c0 2.2 7.2 7.7 6.2 9.5-1.1 1.8-12.3-6.5-14.1-5.5-1.7 0.9-0.1 6.2-2.2 6.2z" fill="transparent" stroke="#fff"></path>
                      <path className="voltage line-2" d="m216.3 52.1c-3 0-3-0.5-6-0.5s-3 3-6 3-3-2-6-2-3 1.6-6 1.6-3-0.4-6-0.4-3-1.2-6-1.2-3 3.4-6 3.4-3-2.2-6-2.2-3-3.4-6-3.4-3-0.5-6-0.5-3 1.4-6 1.4-3 4.8-6 4.8-3-5.5-6-5.5-3 2-6 2-3 2-6 2-3 1.6-6 1.6-3-4.4-6-4.4-3-0.2-6-0.2-3 1-6 1-3 3.1-6 3.1-3-4.9-6-4.9-3 1.5-6 1.5-3 1.6-6 1.6-3-1.3-6-1.3-3 3.7-6 3.7-3-6.4-6-6.4-3 2.5-6 2.5h-6c-3 0-3-0.6-6-0.6s-3-1.4-6-1.4-3 0.9-6 0.9-3 4.3-6 4.3-3-3.5-6-3.5c-2.2 0-3.4-1.3-5.2-2.3-1.8-1.1-3.6-1.5-4.6-3.3s-4.4-3.5-4.4-5.7c0-3.4 0.4-3.4 0.4-6.8s2.9-3.4 2.9-6.8-0.8-3.4-0.8-6.8c0-2.2 0.3-4.2 1.3-5.9 1.1-1.8 0.8-6.2 2.6-7.3 1.8-1 5.5-2 7.7-2 3 0 3 2 6 2s3-0.5 6-0.5 3 5.1 6 5.1 3-1.1 6-1.1 3-5.6 6-5.6 3 4.8 6 4.8 3 0.6 6 0.6 3-3.8 6-3.8 3 5.1 6 5.1 3-0.6 6-0.6 3-1.2 6-1.2 3-2.6 6-2.6 3-0.6 6-0.6 3 2.9 6 2.9 3-4.1 6-4.1 3 0.1 6 0.1 3 3.7 6 3.7 3 0.1 6 0.1 3-0.6 6-0.6 3 0.7 6 0.7 3-2.2 6-2.2 3 4.4 6 4.4 3-1.7 6-1.7 3-4 6-4 3 4.7 6 4.7 3-0.5 6-0.5 3-0.8 6-0.8 3-3.8 6-3.8 3 6.3 6 6.3 3-4.8 6-4.8 3 1.9 6 1.9 3-1.9 6-1.9 3 1.3 6 1.3c2.2 0 5-0.5 6.7 0.5 1.8 1.1 2.4 4 3.5 5.8 1 1.8 0.3 3.7 0.3 5.9 0 3.4 3.4 3.4 3.4 6.8s-3.3 3.4-3.3 6.8 4 3.4 4 6.8c0 2.2-6 2.7-7 4.4-1.1 1.8 1.1 6.7-0.7 7.7-1.6 0.8-4.7-1.1-6.8-1.1z" fill="transparent" stroke="#fff"></path>
                    </svg>
                    <div className="dots">
                      <div className="dot dot-1"></div>
                      <div className="dot dot-2"></div>
                      <div className="dot dot-3"></div>
                      <div className="dot dot-4"></div>
                      <div className="dot dot-5"></div>
                    </div>
                  </div>
                </div>

                {/* Cartoon */}

                <div
                  className={`
    flex
    justify-center
    -mt-18
              transition-all
              duration-200
              ${animate ? "scale-95 rotate-2 -translate-x-2" : ""}
            `}
                >

                  <Image
                    src="/images/slap-face.png"
                    alt="Slap Me"
                    width={460}
                    height={460}
                    className="select-none -mb-22"
                  />

                </div>
                {/* ACTION BUTTONS */}

                <div className="mt-0">

                  <div className="flex justify-center items-center gap-6">

                    <button
                      onClick={handleSlap}
                      className="
                  Btn
                "
                    >
                    </button>

                    <button
                      onClick={handlePunch}
                      className="
                  Btnn
                "
                    >
                    </button>

                  </div>

                  <p className="text-center text-slate-600 text-[14px] mt-3">
                    Each action is stored on-chain! ⚡
                  </p>

                </div>

              </div>

            </div>

            {/* ================= RIGHT SIDEBAR ================= */}

            <div className="space-y-4">

              <div className="bg-white rounded-[15px] shadow-xl p-7">

                <h2 className="text-[15px] font-black mb-7">
                  🌍 Global Stats
                </h2>

                <div>

                  <p className="text-slate-500 text-lg">
                    Total Slaps (All Users)
                  </p>

                  <p className="text-[14px] font-black text-red-500">
                    {globalSlaps.toLocaleString()}
                  </p>

                </div>

                <hr className="my-6" />

                <div>

                  <p className="text-slate-500 text-lg">
                    Total Punches (All Users)
                  </p>

                  <p className="text-[14px] font-black text-violet-600">
                    {globalPunches.toLocaleString()}
                  </p>

                </div>

                <hr className="my-6" />

                <div>

                  <p className="text-slate-500 text-lg">
                    Total Interactions
                  </p>

                  <p className="text-[14px] font-black text-slate-800">
                    {(globalSlaps + globalPunches).toLocaleString()}
                  </p>

                </div>

              </div>

              <div className="bg-white rounded-[16px] shadow-lg px-6 py-4">

                <h3 className="text-[14px] font-bold mb-4">
                  📄 Contract
                </h3>

                <p className="break-all text-slate-600">
                  SPTR...KM4J
                </p>

              </div>

            </div>

          </div>
          {/* ================= BOTTOM ================= */}

          <div className="mt-2 bg-white rounded-[26px] shadow-xl px-5 pt-4 pb-3">

            <div className="grid grid-cols-12 gap-5">

              {/* HOW IT WORKS */}

              <div className="col-span-4">

                <h2 className="text-[18px] font-black mb-3">
                  💡 How It Works
                </h2>

                <div className="space-y-2">

                  <div className="bg-orange-50 rounded-2xl px-2 py-1">
                    <p className="font-bold text-[15px]">1. Connect Wallet</p>
                    <p className="text-slate-600 text-xs mt-1">
                      Connect your Stacks wallet.
                    </p>
                  </div>

                  <div className="bg-red-50 rounded-2xl px-2 py-1">
                    <p className="font-bold text-[15px]">2. Slap or Punch</p>
                    <p className="text-slate-600 text-xs mt-1">
                      Click any button to interact.
                    </p>
                  </div>

                  <div className="bg-violet-50 rounded-2xl px-2 py-1">
                    <p className="font-bold text-[15px]">3. On-chain Action</p>
                    <p className="text-slate-600 text-xs mt-1">
                      Stored permanently on-chain.
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-2xl px-2 py-1">
                    <p className="font-bold text-[15px]">4. Become Legendary</p>
                    <p className="text-slate-600 text-xs mt-1">
                      Climb the Slap leaderboard.
                    </p>
                  </div>

                </div>

              </div>

              {/* RECENT ACTIVITY */}

              <div className="col-span-8">

                <h2 className="text-[18px] font-black mb-3">
                  ⚡ Recent Activity
                </h2>

                <div className="space-y-2">

                  {recentActivity.map((item, index) => (

                    <div
                      key={index}
                      className="flex items-center justify-between border-b border-slate-200 py-3 last:border-0"
                    >

                      {/* Address */}

                      <div className="flex items-center gap-3 w-[230px]">

                        <span className="text-xl">
                          {
                            item.action === "slap"
                              ? "✋"
                              : item.action === "punch"
                                ? "👊"
                                : item.action === "patch"
                                  ? "🩹"
                                  : "🏥"
                          }
                        </span>

                        <span className="font-medium text-sm">

                          {`${item.address.slice(0, 5)}...${item.address.slice(-4)}`}

                        </span>

                      </div>

                      {/* Action */}

                      <div className="w-[80px] text-center">

                        <span
                          className={`font-semibold text-sm ${item.action === "slap"
                            ? "text-red-500"
                            : item.action === "punch"
                              ? "text-violet-600"
                              : item.action === "patch"
                                ? "text-green-600"
                                : "text-blue-600"
                            }`}
                        >
                          {item.action}
                        </span>

                      </div>

                      {/* Block */}

                      <div className="w-[150px] text-center text-sm text-slate-500">

                        Block {item.block}

                      </div>

                      {/* Time */}

                      <div className="w-[90px] text-right text-sm text-slate-400">

                        On-chain

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ================= FOOTER ================= */}

        <footer className="mt-1 bg-[#090d1f]">

          <div className="max-w-[1010px] mx-auto h-[45px] px-6 flex items-center justify-between text-white text-sm">

            <div>
              Built on ⚡ Stacks
            </div>

            <div>
              SlapMe © 2026
            </div>

            <div>
              Made with 😂
            </div>

          </div>

        </footer>
      </div>

    </main>
  );
}