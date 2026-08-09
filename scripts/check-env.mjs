import { existsSync, readFileSync } from "node:fs";

const hostKeys = new Set(Object.keys(process.env));
for (const file of [".env", ".env.local"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (!match || hostKeys.has(match[1])) continue;
    process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
}

const required = ["NEXT_PUBLIC_APP_URL", "DATABASE_URL", "DIRECT_URL", "AUTH_SECRET", "CRON_SECRET"];
const missing = required.filter((key) => !process.env[key]);
const problems = [];
if (missing.length) problems.push(`Missing: ${missing.join(", ")}`);

for (const key of ["NEXT_PUBLIC_APP_URL", "DATABASE_URL", "DIRECT_URL"]) {
  if (!process.env[key]) continue;
  try {
    const url = new URL(process.env[key]);
    if (key === "NEXT_PUBLIC_APP_URL" && process.env.NODE_ENV === "production" && url.protocol !== "https:") {
      problems.push("NEXT_PUBLIC_APP_URL must use HTTPS in production.");
    }
  } catch {
    problems.push(`${key} is not a valid URL.`);
  }
}

for (const key of ["AUTH_SECRET", "CRON_SECRET"]) {
  if (process.env[key] && process.env[key].length < 32) problems.push(`${key} must contain at least 32 characters.`);
}

if (process.env.REQUIRE_EMAIL_VERIFICATION === "true") {
  if (!process.env.RESEND_API_KEY) problems.push("RESEND_API_KEY is required when email verification is enabled.");
  if (!process.env.EMAIL_FROM) problems.push("EMAIL_FROM is required when email verification is enabled.");
}

if (problems.length) {
  console.error("Ascend environment check failed:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("Ascend environment check passed. Secret values were not displayed.");
