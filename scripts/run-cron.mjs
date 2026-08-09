const job = process.argv[2];
const allowedJobs = new Set(["daily-reset", "push-reminders", "weekly-report", "weekly-raid"]);
if (!allowedJobs.has(job)) throw new Error("Choose a supported Ascend cron job.");

const appUrl = process.env.APP_URL;
const secret = process.env.CRON_SECRET;
if (!appUrl || !secret) throw new Error("APP_URL and CRON_SECRET are required.");

const response = await fetch(`${new URL(appUrl).origin}/api/cron/${job}`, {
  headers: { authorization: `Bearer ${secret}` },
  signal: AbortSignal.timeout(55_000),
});
const body = await response.text();
if (!response.ok) throw new Error(`${job} failed with ${response.status}: ${body.slice(0, 300)}`);
console.log(`${job} completed with ${response.status}`);
