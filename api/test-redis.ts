import type { VercelRequest, VercelResponse } from "@vercel/node";
import { redis } from "../lib/redis";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const key = "test:connection";
    const value = {
      message: "Redis is connected",
      time: Date.now(),
    };

    // ذخیره در Redis
    await redis.set(key, value);

    // خواندن از Redis
    const stored = await redis.get(key);

    return res.status(200).json({
      success: true,
      written: value,
      read: stored,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}