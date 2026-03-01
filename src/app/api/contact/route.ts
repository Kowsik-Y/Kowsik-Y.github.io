import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  // Always log server-side
  console.log("📩 Contact form submission:", { name, email, message });

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (apiKey && toEmail) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: toEmail,
        replyTo: email,
        subject: `New message from ${name} — Portfolio Contact`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;background:#0f0f15;border-radius:12px;color:#e2e8f0">
            <h2 style="color:#a78bfa;margin-top:0">New Portfolio Message</h2>
            <p><strong style="color:#94a3b8">From:</strong> ${name} &lt;${email}&gt;</p>
            <hr style="border:none;border-top:1px solid #1e293b;margin:16px 0"/>
            <p style="white-space:pre-wrap;line-height:1.7">${message}</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Resend error:", err);
      // Still return success so UX isn't broken — message was logged
    }
  }

  return NextResponse.json({ success: true });
}
