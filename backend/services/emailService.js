import nodemailer from 'nodemailer';

// Helper to check if SMTP credentials are configured in .env
const hasSmtpConfig = () => {
  return process.env.SMTP_USER && 
         process.env.SMTP_PASS && 
         !process.env.SMTP_USER.includes('placeholder') &&
         process.env.SMTP_USER !== 'your-email@gmail.com';
};

// @desc    Send email with 6-digit OTP for password verification / reset
// @param   {string} toEmail - Recipient email address
// @param   {string} otp - 6-digit verification code
// @param   {string} userName - User's display name
export const sendPasswordResetEmail = async (toEmail, otp, userName = 'NanoLink User') => {
  try {
    const subject = '🔐 NanoLink — Password Change Verification Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 12px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #f97316; margin: 0;">NanoLink</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Security & Account Protection</p>
        </div>
        <p style="font-size: 16px; line-height: 1.5; color: #e2e8f0;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">
          We received a request to change the password for your NanoLink account. Please use the verification code below to complete your password update:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; background-color: #1e293b; color: #f97316; padding: 12px 24px; border-radius: 8px; border: 1px dashed #f97316; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          This verification code will expire in <strong>15 minutes</strong>. If you did not request a password change, please ignore this email or contact support immediately.
        </p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">
          © 2026 NanoLink Platform. All rights reserved.
        </p>
      </div>
    `;

    if (hasSmtpConfig()) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.FROM_EMAIL || `"NanoLink Security" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject,
        html
      });

      console.log(`✉️ Live SMTP verification email sent to ${toEmail}`);
      return { success: true, isMock: false };
    } else {
      // Zero-config mock fallback per user instruction: "i will provide the key later, use any smtp SERVICE THATS FREE"
      console.log('\n================================================================');
      console.log('📬 [EMAIL SERVICE ZERO-CONFIG MOCK MODE]');
      console.log(`✉️ To:       ${toEmail}`);
      console.log(`📑 Subject:  ${subject}`);
      console.log(`🔑 OTP Code: ${otp}`);
      console.log('💡 Note:     Configure SMTP_USER and SMTP_PASS in .env to send live emails.');
      console.log('================================================================\n');

      return { success: true, isMock: true, mockOtp: otp };
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send verification email. Please check SMTP configuration.');
  }
};

export default {
  sendPasswordResetEmail
};
