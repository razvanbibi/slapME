import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
const KEY_PREFIX = "celodaily:profile:";
export async function saveStats( 
  address: string,
  data: { highestStreak: number }
) {
  await redis.hset(KEY_PREFIX + address.toLowerCase(), {
    highestStreak: String(data.highestStreak),
  });
}
export async function saveProfile(
  address: string, 
  data: { name: string | null; avatar: string | null;  }
) {
  await redis.hset(KEY_PREFIX + address.toLowerCase(), {
    name: data.name, 
    avatar: data.avatar,
    })
  };
export async function getProfile(address: string) {
  const res = await redis.hgetall<{
    name?: string;
    avatar?: string;
    highestStreak?: string;
  }>(KEY_PREFIX + address.toLowerCase());
  if (!res) return null;
  return {
    name: res.name ?? null,
    avatar: res.avatar ?? null,
    highestStreak: res.highestStreak
      ? Number(res.highestStreak)
      : null,
  };
}
export async function getProfiles(addresses: string[]) {
  const profiles = await Promise.all(
    addresses.map(async (address) => {
      const profile = await getProfile(address);
      return {
        address: address.toLowerCase(),
        ...profile,
      };
    })
  );
  return profiles;
}
