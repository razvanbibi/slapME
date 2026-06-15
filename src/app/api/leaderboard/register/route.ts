import { NextResponse } from "next/server";
import { addAddress } from "@/lib/leaderboardStore";
import { saveStats } from "@/lib/profileStore";
import { getReadOnlyContractServer } from "@/lib/contract.server";
export async function POST(req: Request) {
  const { address } = await req.json();
  if (!address) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  // 1️ address register
  await addAddress(address);
  // after addAddress(address)
const { contract } = getReadOnlyContractServer();
const hs = Number(await contract.highestStreak(address));
await saveStats(address, {
  highestStreak: hs,
});
  return NextResponse.json({ ok: true });
}
