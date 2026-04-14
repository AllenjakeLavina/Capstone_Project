import dotenv from 'dotenv';
dotenv.config();

// Lazy initialize - only create when actually needed
const getResend = () => {
  const { Resend } = require('resend');
  return new Resend(process.env.RESEND_API_KEY);
};

// Send email with verification code - TEMPORARILY DISABLED
export const sendVerificationEmail = async (email: string, code: string, firstName: string) => {
  // Temporarily skip email verification
  console.log(`[DEV] Skipping verification email for ${email}. Code would be: ${code}`);
  return true;
};

// Send email for password reset
export const sendPasswordResetEmail = async (email: string, code: string, firstName: string) => {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: 'ServiceLink <onboarding@resend.dev>',
      to: email,
      subject: 'Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Hello, ${firstName}!</h2>
          <p>We received a request to reset your password. Please use the code below:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; border-radius: 5px;">
            ${code}
          </div>
          <p>This code will expire in 1 hour.</p>
          <p>Best regards,<br>ServiceLink Team</p>
        </div>
      `
    });
    if (error) { console.error('Error sending password reset email:', error); return false; }
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send provider account verification confirmation
export const sendProviderVerificationEmail = async (email: string, firstName: string) => {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: 'ServiceLink <onboarding@resend.dev>',
      to: email,
      subject: 'Account Verification Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Good news, ${firstName}!</h2>
          <p>Your service provider account has been verified by our administrators.</p>
          <p>Thank you for joining our platform!</p>
          <p>Best regards,<br>ServiceLink Team</p>
        </div>
      `
    });
    if (error) { console.error('Error sending provider verification email:', error); return false; }
    return true;
  } catch (error) {
    console.error('Error sending provider verification email:', error);
    return false;
  }
};