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
 * Send verification email
 */
export async function sendVerificationEmail(
  to: string,
  link: string,
  name: string
) {
  console.log("📧 Sending verification email to:", to);

  await transporter.sendMail({
    from: `"CDGI No-Dues" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your Email - CDGI No-Dues Portal",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to CDGI No-Dues Portal</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering. Please verify your email address to activate your account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="display: inline-block; padding: 12px 30px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Or copy this link: <br/>
          <code style="background: #f3f4f6; padding: 10px; border-radius: 4px; display: block; word-break: break-all;">${link}</code>
        </p>
        
        <p style="color: #6b7280; font-size: 12px;">
          This link expires in 24 hours. If you didn't register, please ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © 2024 Chameli Devi Group of Institutions. All rights reserved.
        </p>
      </div>
    `,
  });

  console.log("✅ Verification email sent");
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  link: string,
  name: string
) {
  console.log("📧 Sending password reset email to:", to);

  await transporter.sendMail({
    from: `"CDGI No-Dues" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset Your Password - CDGI No-Dues Portal",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Password Reset Request</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>We received a request to reset your password. Click the link below to create a new password.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="display: inline-block; padding: 12px 30px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Or copy this link: <br/>
          <code style="background: #f3f4f6; padding: 10px; border-radius: 4px; display: block; word-break: break-all;">${link}</code>
        </p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>⚠️ Security:</strong> This link expires in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © 2024 Chameli Devi Group of Institutions. All rights reserved.
        </p>
      </div>
    `,
  });

  console.log("✅ Password reset email sent");
}

/**
 * Send No-Dues submission email to student
 */
export async function sendNoDuesSubmittedEmail(
  to: string,
  name: string,
  noDuesId: string
) {
  console.log("📧 Sending No-Dues confirmation email to:", to);

  await transporter.sendMail({
    from: `"CDGI No-Dues" <${process.env.EMAIL_USER}>`,
    to,
    subject: "No-Dues Application Submitted - CDGI",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">✅ No-Dues Application Submitted</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your No-Dues clearance application has been submitted successfully.</p>
        
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="color: #166534; margin: 0;"><strong>Reference ID:</strong> ${noDuesId}</p>
        </div>
        
        <p style="color: #6b7280;">Your application is now being verified by the departments. You will receive updates via email as each department processes your request.</p>
        
        <p style="color: #6b7280;">You can track the status of your application anytime by logging into your dashboard.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © 2024 Chameli Devi Group of Institutions. All rights reserved.
        </p>
      </div>
    `,
  });

  console.log("✅ No-Dues confirmation email sent");
}

/**
 * Send department approval notification
 */
export async function sendDepartmentApprovalEmail(
  to: string,
  name: string,
  departmentName: string,
  status: "approved" | "rejected",
  remarks?: string
) {
  const subject =
    status === "approved"
      ? `${departmentName} Clearance Approved - CDGI`
      : `${departmentName} Clearance Action Required - CDGI`;

  const html =
    status === "approved"
      ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">✅ Clearance Approved</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p><strong>${departmentName}</strong> has approved your clearance.</p>
        ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ""}
        <p>Check your dashboard for the latest status.</p>
      </div>
    `
      : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">⚠️ Action Required</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p><strong>${departmentName}</strong> requires additional action on your clearance request.</p>
        ${remarks ? `<p><strong>Reason:</strong> ${remarks}</p>` : ""}
        <p>Please log in to your dashboard to complete the required steps.</p>
      </div>
    `;

  await transporter.sendMail({
    from: `"CDGI No-Dues" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log(`✅ Department notification email sent to ${to}`);
}

