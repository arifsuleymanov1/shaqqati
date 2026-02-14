import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@yourdomain.com";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "RealEstate Platform";

// =============================================
// Send verification email after registration
// =============================================
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Verify your email - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: #16a34a; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${APP_NAME}</h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px;">Verify your email address</h2>
              <p style="color: #52525b; line-height: 1.6; margin: 0 0 24px;">
                Thank you for signing up! Please click the button below to verify your email address and activate your account.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Verify Email
                </a>
              </div>
              <p style="color: #71717a; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #16a34a; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>
            <div style="padding: 16px 32px; background: #f4f4f5; text-align: center;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                If you didn't create an account, please ignore this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Send verification email failed:", err);
    return { success: false, error: "Failed to send verification email" };
  }
}

// =============================================
// Send password reset email
// =============================================
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Reset your password - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
          <div style="max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="background: #16a34a; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">${APP_NAME}</h1>
            </div>
            <div style="padding: 32px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px;">Reset your password</h2>
              <p style="color: #52525b; line-height: 1.6; margin: 0 0 24px;">
                We received a request to reset your password. Click the button below to choose a new password.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              <p style="color: #71717a; font-size: 14px; line-height: 1.6;">
                This link will expire in 1 hour. If you didn't request a password reset, ignore this email.
              </p>
            </div>
            <div style="padding: 16px 32px; background: #f4f4f5; text-align: center;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Send password reset email failed:", err);
    return { success: false, error: "Failed to send password reset email" };
  }
}
