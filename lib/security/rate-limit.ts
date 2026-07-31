type Bucket = { tokens: number; updatedAt: number };

const buckets = new Map<string, Bucket>();

export function consumeRateLimit(
  key: string,
  options: { capacity: number; refillPerSecond: number },
) {
  const now = Date.now();
  if (buckets.size > 10_000) {
    for (const [bucketKey, value] of buckets) {
      if (now - value.updatedAt > 60 * 60 * 1000) buckets.delete(bucketKey);
    }
  }
  const bucket = buckets.get(key) ?? { tokens: options.capacity, updatedAt: now };
  const elapsedSeconds = Math.max(0, now - bucket.updatedAt) / 1000;
  bucket.tokens = Math.min(
    options.capacity,
    bucket.tokens + elapsedSeconds * options.refillPerSecond,
  );
  bucket.updatedAt = now;
  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}

export function requestRateLimitKey(request: Request, scope: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${scope}:${forwarded || "local"}`;
}
