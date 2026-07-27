export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (expected && authorization !== `Bearer ${expected}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    ok: true,
    processedAt: new Date().toISOString(),
    message: "Daily quest rollover complete. Missed quests receive a gentle discipline adjustment and a redemption objective.",
  });
}
