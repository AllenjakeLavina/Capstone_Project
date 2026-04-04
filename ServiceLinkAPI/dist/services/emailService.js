"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendProviderVerificationEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create transporter object
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});
// Send email with verification code
const sendVerificationEmail = (email, code, firstName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333;">Welcome, ${firstName}!</h2>
          <p>Thank you for registering with our service. To complete your registration, please use the verification code below:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; border-radius: 5px;">
            ${code}
          </div>
          <p>This code will expire in 24 hours.</p>
          <p>If you did not request this verification, please ignore this email.</p>
          <p>Best regards,<br>ServiceLink Team</p>
        </div>
      `
        };
        // Send email
        const info = yield transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return true;
    }
    catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
// Send email for password reset
const sendPasswordResetEmail = (email, code, firstName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
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
        };
        // Send email
        const info = yield transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return true;
    }
    catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
// Send provider account verification confirmation
const sendProviderVerificationEmail = (email, firstName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Create email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
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
        };
        // Send email
        const info = yield transporter.sendMail(mailOptions);
        console.log('Provider verification email sent:', info.messageId);
        return true;
    }
    catch (error) {
        console.error('Error sending provider verification email:', error);
        return false;
    }
});
exports.sendProviderVerificationEmail = sendProviderVerificationEmail;
