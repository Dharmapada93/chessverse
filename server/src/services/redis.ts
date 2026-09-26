import { Redis } from "ioredis";

// In-memory fallback cache store for environments without local Redis
type CacheEntry = {
  value: string;
  expiresAt?: number;
};

const memoryStore = new Map<string, CacheEntry>();

let redisClient: InstanceType<typeof Redis> | null = null;
let isRedisConnected = false;

// Attempt Redis connection if REDIS_URL or default is available
const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  try {
    const client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times: number) => (times > 3 ? null : Math.min(times * 100, 1000)),
    });

    client.connect()
      .then(() => {
        isRedisConnected = true;
        redisClient = client;
        console.log("Redis connected successfully.");
      })
      .catch((err: any) => {
        console.warn("Redis unavailable, using resilient in-memory caching fallback:", err?.message || err);
        isRedisConnected = false;
        redisClient = null;
      });

    client.on("error", () => {
      isRedisConnected = false;
    });
  } catch (err) {
    console.warn("Redis initialization skipped, using resilient memory cache.");
  }
}

/**
 * High-performance Cache GET
 */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      // Fallback to memory if redis fails mid-request
    }
  }

  const item = memoryStore.get(key);
  if (!item) return null;

  if (item.expiresAt && item.expiresAt < Date.now()) {
    memoryStore.delete(key);
    return null;
  }

  try {
    return JSON.parse(item.value) as T;
  } catch {
    return null;
  }
}

/**
 * High-performance Cache SET with TTL
 */
export async function cacheSet(
  key: string,
  value: any,
  ttlSeconds = 60,
): Promise<void> {
  const serialized = JSON.stringify(value);

  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, serialized, "EX", ttlSeconds);
      return;
    } catch {
      // Fallback to memory
    }
  }

  memoryStore.set(key, {
    value: serialized,
    expiresAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : undefined,
  });
}

/**
 * Cache DEL single or multiple keys
 */
export async function cacheDel(keys: string | string[]): Promise<void> {
  const keyArray = Array.isArray(keys) ? keys : [keys];

  if (isRedisConnected && redisClient) {
    try {
      if (keyArray.length > 0) {
        await redisClient.del(...keyArray);
      }
    } catch {}
  }

  for (const k of keyArray) {
    memoryStore.delete(k);
  }
}

/**
 * Invalidate all keys matching a prefix (e.g. "leaderboard:")
 */
export async function cacheInvalidatePrefix(prefix: string): Promise<void> {
  if (isRedisConnected && redisClient) {
    try {
      const keys = await redisClient.keys(`${prefix}*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch {}
  }

  for (const k of memoryStore.keys()) {
    if (k.startsWith(prefix)) {
      memoryStore.delete(k);
    }
  }
}

export function isUsingRedis(): boolean {
  return isRedisConnected;
}
