import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export async function sendEmails({ subject, html, recipients }) {
  const provider = process.env.EMAIL_PROVIDER || 'resend';

  console.log("📨 sendEmails() called with:", { subject, recipients }); // DEBUG

  if (!recipients || (Array.isArray(recipients) && recipients.length === 0)) {
    throw new Error("❌ No recipients provided to sendEmails()");
  }

  if (provider === 'resend') {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      console.log("⚡ Using Resend provider with recipients:", recipients);

      const r = await resend.emails.send({
        from: process.env.MAIL_FROM,
        to: Array.isArray(recipients) ? recipients : [recipients], // ✅ always array
        subject,
        html,
      });

      console.log("✅ Resend response:", r);

      return [
        {
          to: recipients,
          providerId: r?.data?.id,
          sentAt: new Date(),
        },
      ];
    } catch (err) {
      console.error("❌ Resend API error:", err);
      throw err;
    }
  }

  // ✅ Nodemailer fallback
  try {
    console.log("⚡ Using Nodemailer provider with recipients:", recipients);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: Array.isArray(recipients) ? recipients.join(",") : recipients,
      subject,
      html,
    });

    console.log("✅ Nodemailer response:", info);

    return [
      {
        to: recipients,
        providerId: info.messageId,
        sentAt: new Date(),
      },
    ];
  } catch (err) {
    console.error("❌ Nodemailer error:", err);
    throw err;
  }
}
