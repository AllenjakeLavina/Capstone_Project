import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Send email with verification code
export const sendVerificationEmail = async (email: string, code: string, firstName: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'ServiceLink <onboarding@resend.dev>',
      to: '202210416@gordoncollege.edu.ph',
      subject: `Email Verification Code for ${email}`,  
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Welcome, ${firstName}!</h2>
          <p><strong>Registration email:</strong> ${email}</p>
          <p>Verification code:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; border-radius: 5px;">
            ${code}
          </div>
          <p>This code will expire in 24 hours.</p>
          <p>Best regards,<br>ServiceLink Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return false;
    }

    console.log('Verification email sent:', data);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send email for password reset
export const sendPasswordResetEmail = async (email: string, code: string, firstName: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'ServiceLink <onboarding@resend.dev>',
      to: email,
      subject: 'Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Hello, ${firstName}!</h2>
          <p>We received a request to reset your password. Please use the code below to reset your password:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; border-radius: 5px;">
            ${code}
          </div>
          <p>This code will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p>Best regards,<br>ServiceLink Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }

    console.log('Password reset email sent:', data);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send provider account verification confirmation
export const sendProviderVerificationEmail = async (email: string, firstName: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'ServiceLink <onboarding@resend.dev>',
      to: email,
      subject: 'Account Verification Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Good news, ${firstName}!</h2>
          <p>Your service provider account has been verified by our administrators.</p>
          <p>You can now start offering your services on our platform and receive bookings from clients.</p>
          <p>To get started:</p>
          <ol>
            <li>Complete your profile with all relevant information</li>
            <li>Add your services with detailed descriptions</li>
            <li>Set up your availability</li>
          </ol>
          <p>Thank you for joining our platform!</p>
          <p>Best regards,<br>ServiceLink Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending provider verification email:', error);
      return false;
    }

    console.log('Provider verification email sent:', data);
    return true;
  } catch (error) {
    console.error('Error sending provider verification email:', error);
    return false;
  }
};