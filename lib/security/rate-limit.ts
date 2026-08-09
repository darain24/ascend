import { createHash } from "crypto";
import { db } from "@/lib/db";

export async function consumeRateLimit(
  key: string,
  options: { capacity: number; refillPerSecond: number },
) {
  const now = new Date();
  const windowMs = Math.max(
    1_000,
    Math.ceil((options.capacity / Math.max(options.refillPerSecond, 0.001)) * 1_000),
  );
  const resetBefore = new Date(now.getTime() - windowMs);
  const expiresAt = new Date(now.getTime() + windowMs * 2);
  const rows = await db.$queryRaw<Array<{ count: number }>>`
    INSERT INTO "RateLimitBucket" ("key", "count", "windowStart", "expiresAt")
    VALUES (${key}, 1, ${now}, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."windowStart" <= ${resetBefore} THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "RateLimitBucket"."windowStart" <= ${resetBefore} THEN ${now}
        ELSE "RateLimitBucket"."windowStart"
      END,
      "expiresAt" = ${expiresAt}
    RETURNING "count"
  `;
  return (rows[0]?.count ?? options.capacity + 1) <= options.capacity;
}

export function requestRateLimitKey(request: Request, scope: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
  const digest = createHash("sha256").update(address).digest("hex").slice(0, 24);
  return `${scope}:${digest}`;
}
