import "server-only";

/**
 * Transactional email via the Resend REST API — no SDK dependency, just fetch.
 * Server-only; the API key never reaches the client. Every send is best-effort:
 * callers ignore the result so a bounced email can't fail the surrounding action.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
// Sending to arbitrary addresses needs a verified domain in Resend; the default
// onboarding@resend.dev only delivers to the Resend account owner (test mode).
const RESEND_FROM = process.env.RESEND_FROM || "onboarding@resend.dev";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  if (!RESEND_API_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Branded dark welcome email for a newly-registered visitor. */
export function welcomeEmail(name: string): {
  subject: string;
  html: string;
  text: string;
} {
  const first = name.trim().split(/\s+/)[0] || "there";
  const subject = "Welcome to Srinivas RC's portfolio";
  const text =
    `Hi ${first},\n\n` +
    `Thanks for creating an account on Srinivas RC's portfolio. You can now ` +
    `sign in anytime to explore his AI/ML projects, chat with Jerry (his AI ` +
    `assistant), and view his resume.\n\n` +
    `— Jerry, on behalf of Srinivas RC`;
  const html = `<!doctype html>
<html><body style="margin:0;background:#0a0a0a;padding:32px 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#111113;border:1px solid #262629;border-radius:16px;overflow:hidden">
      <tr><td style="height:4px;background:#22d3ee"></td></tr>
      <tr><td style="padding:28px 28px 8px">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#22d3ee">System Initialized</div>
        <h1 style="margin:8px 0 0;font-size:20px;color:#fff">Welcome, ${escapeHtml(first)}.</h1>
      </td></tr>
      <tr><td style="padding:8px 28px 4px;color:#c4c4c7;font-size:14px;line-height:1.6">
        Your account on <strong style="color:#fff">Srinivas RC's</strong> portfolio is ready. Sign in anytime to:
      </td></tr>
      <tr><td style="padding:8px 28px">
        <div style="color:#c4c4c7;font-size:14px;line-height:1.9">
          &#9655;&nbsp; Explore his AI/ML &amp; agentic projects<br/>
          &#9655;&nbsp; Chat with <strong style="color:#fff">Jerry</strong>, his AI assistant<br/>
          &#9655;&nbsp; View and download his resume
        </div>
      </td></tr>
      <tr><td style="padding:20px 28px 28px">
        <div style="border-top:1px solid #262629;padding-top:16px;color:#6b6b70;font-size:12px">
          — Jerry, on behalf of Srinivas RC
        </div>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  return { subject, html, text };
}

/** Minimal HTML escaper for values interpolated into the email template. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
