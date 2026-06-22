import Redis from "ioredis";
import logger from "./logger";

let redis: Redis | null = null;

export const connectRedis = (): Redis | null => {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on("error", (err) => {
      logger.error({ message: "Redis error", error: err.message });
    });

    redis.on("connect", () => {
      logger.info("Redis connected");
    });

    redis.connect().catch((err) => {
      logger.warn({ message: "Redis connection failed — caching disabled", error: err.message });
      redis = null;
    });

    return redis;
  } catch (err) {
    logger.warn({ message: "Redis init failed — caching disabled", error: err });
    return null;
  }
};

export const getRedis = (): Redis | null => redis;

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds = 3600): Promise<void> => {
  if (!redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.warn({ message: "Redis cache set failed", key, error: err });
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // ignore
  }
};

export const buildAiCacheKey = (prefix: string, payload: unknown): string => {
  const hash = Buffer.from(JSON.stringify(payload)).toString("base64url").slice(0, 32);
  return `ai:${prefix}:${hash}`;
};
