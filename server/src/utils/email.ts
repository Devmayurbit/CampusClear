import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.emailHost,
  port: env.emailPort,
  secure: env.emailSecure,
  auth: {
    user: env.emailUser,
    pass: env.emailPass,
  },
});

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  return transporter.sendMail({
    from: env.emailFrom,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export function verificationEmailTemplate(name: string, link: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Welcome to CDGI No-Dues Portal</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>Please verify your No-Dues request by clicking below:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${link}" style="display:inline-block;padding:12px 30px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Verify Request</a>
      </div>
      <p style="color:#6b7280;font-size:14px;">Or copy this link:<br/><code>${link}</code></p>
    </div>
  `;
}

export function passwordResetEmailTemplate(name: string, link: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Reset Your Password</h2>
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${link}" style="display:inline-block;padding:12px 30px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Reset Password</a>
      </div>
      <p style="color:#6b7280;font-size:14px;">If you didn't request this, you can safely ignore this email.</p>
      <p style="color:#6b7280;font-size:14px;">Or copy this link:<br/><code>${link}</code></p>
    </div>
  `;
}

export function statusChangeEmailTemplate(studentName: string, department: string, status: string, remarks?: string) {
  const statusColor = status === "APPROVED" ? "#16a34a" : status === "REJECTED" ? "#dc2626" : "#ca8a04";
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">CDGI No-Dues Portal - Status Update</h2>
      <p>Hello <strong>${studentName}</strong>,</p>
      <p>Your <strong>${department}</strong> department clearance status has been updated to:</p>
      <p style="font-size: 18px; font-weight: bold; color: ${statusColor};">${status}</p>
      ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ""}
      <p>Please log in to the portal to view details.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color:#6b7280;font-size:12px;">This is an automated notification from the CDGI No-Dues Portal.</p>
    </div>
  `;
}
