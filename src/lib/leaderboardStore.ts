

import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
// একটি Redis Set ব্যবহার 
const KEY = "celodaily:leaderboard:addresses";
export async function addAddress(addr: string) {
  if (!addr) return;
  await redis.sadd(KEY, addr.toLowerCase());
}
export async function getAllAddresses(): Promise<string[]> {
  const res = await redis.smembers(KEY);
return res ?? [];
}
