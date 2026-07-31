export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[Ascend] Password reset for ${email}: ${resetUrl}`);
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
      subject: "Reset your Ascend password",
      html: `<p>A password reset was requested for your Ascend account.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 30 minutes. If you did not request it, ignore this email.</p>`,
    }),
  });
  if (!response.ok) throw new Error("Password reset email could not be sent.");
}
