import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(
  to: string,
  link: string
) {
  await transporter.sendMail({
    from: `"CDGI No-Dues" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Verify Your No-Dues Application",
    html: `
      <h2>CDGI No-Dues Verification</h2>
      <p>Please click the button below to verify your application:</p>
      <a href="${link}" style="padding:10px 20px;background:#4f46e5;color:white;text-decoration:none;border-radius:5px">
        Verify Application
      </a>
      <p>This link expires in 24 hours.</p>
    `,
  });
}
