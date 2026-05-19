import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const KEY_PREFIX = "celodaily:donation:";

export async function saveDonation(
  address: string,
  total: number
) {

  await redis.set(
    KEY_PREFIX + address.toLowerCase(),
    total
  );
}

export async function getDonation(
  address: string
) {

  return await redis.get<number>(
    KEY_PREFIX + address.toLowerCase()
  );
}