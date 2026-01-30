import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ EMAIL_USER or EMAIL_PASS missing in environment variables");
}

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test connection on server start
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mail Transport Error:", error);
  } else {
    console.log("✅ Mail server is ready to send emails");
  }
});

/**
 * Send verification email (Register / Token verification)
 */
export async function sendVerificationEmail(
  to: string,
  link: string
) {
  console.log("📧 Sending verification email to:", to);

  await transporter.sendMail({
    from: `"CDGI No-Dues" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Account - CDGI No-Dues",
    html: `
      <h2>Welcome to CDGI No-Dues</h2>
      <p>Please verify your account by clicking below:</p>
      <a href="${link}" style="padding:12px 20px;background:#4f46e5;color:white;text-decoration:none;border-radius:6px">
        Verify Account
      </a>
      <p>This link expires in 24 hours.</p>
    `,
  });

  console.log("✅ Verification email sent");
}

/**
 * Send No-Dues submission email
 */
export async function sendNoDuesSubmittedEmail(to: string) {
  console.log("📧 Sending No-Dues confirmation email to:", to);

  await transporter.sendMail({
    from: `"CDGI No-Dues" <${process.env.EMAIL_USER}>`,
    to,
    subject: "No-Dues Application Submitted",
    html: `
      <h2>✅ No-Dues Submitted</h2>
      <p>Your No-Dues application has been submitted successfully.</p>
      <p>You will receive further updates once departments verify it.</p>
    `,
  });

  console.log("✅ No-Dues confirmation email sent");
}
