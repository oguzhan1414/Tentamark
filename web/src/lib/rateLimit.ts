import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory token bucket / sliding window table
const store = new Map<string, RateLimitEntry>();

// Periodic cleanup every 60 seconds to prevent memory leaks
let lastCleanup = Date.now();
function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

export interface RateLimitOptions {
  limit: number; // Maximum number of requests allowed in window
  windowSeconds: number; // Time window duration in seconds
  keyPrefix?: string; // Optional namespace (e.g. "media-gen", "oauth")
  identifier?: string; // Optional explicit client ID (e.g. userId or brandId)
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

/**
 * Extracts a client IP address from standard request headers.
 */
export function getClientIp(req: Request | NextRequest): string {
  const headers = req.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ip = forwardedFor.split(",")[0].trim();
    if (ip) return ip;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}

/**
 * Checks and increments the rate limit counter for a given client and route.
 */
export function checkRateLimit(
  req: Request | NextRequest,
  options: RateLimitOptions
): RateLimitResult {
  cleanupExpired();

  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const clientKey = options.identifier || getClientIp(req);
  const fullKey = `${options.keyPrefix ?? "default"}:${clientKey}`;

  let entry = store.get(fullKey);

  if (!entry || entry.resetAt <= now) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    store.set(fullKey, entry);
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetAt: entry.resetAt,
      retryAfterSeconds: 0,
    };
  }

  if (entry.count >= options.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterSeconds,
    };
  }

  entry.count += 1;
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - entry.count,
    resetAt: entry.resetAt,
    retryAfterSeconds: 0,
  };
}

/**
 * Returns a standardized 429 Too Many Requests response with RFC-compliant headers.
 */
export function rateLimitErrorResponse(
  result: RateLimitResult,
  message: string = "Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin."
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      retryAfter: result.retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": result.retryAfterSeconds.toString(),
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": Math.ceil(result.resetAt / 1000).toString(),
      },
    }
  );
}
