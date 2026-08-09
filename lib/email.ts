function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

async function sendEmail(email: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[Ascend] ${subject} for ${email}: ${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}`);
      return;
    }
    throw new Error("Email delivery is not configured.");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject,
      html,
    }),
  });
  if (!response.ok) throw new Error("Password reset email could not be sent.");
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return sendEmail(
    email,
    "Reset your Ascend password",
    `<p>A password reset was requested for your Ascend account.</p><p><a href="${escapeHtml(resetUrl)}">Reset password</a></p><p>This link expires in 30 minutes. If you did not request it, ignore this email.</p>`,
  );
}

export async function sendEmailVerification(email: string, verificationUrl: string) {
  return sendEmail(
    email,
    "Verify your Ascend email",
    `<p>Verify this email address for your Ascend account.</p><p><a href="${escapeHtml(verificationUrl)}">Verify email</a></p><p>This link expires in 60 minutes. If you did not request it, ignore this email.</p>`,
  );
}
