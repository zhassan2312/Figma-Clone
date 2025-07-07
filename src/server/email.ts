import nodemailer from 'nodemailer';
import { env } from '@/env';

// Create a transporter based on your email service
const createTransporter = async () => {
  

  return nodemailer.createTransport({
    service: env.SERVICE,
    auth: {
      user: env.USER_EMAIL,
      pass: env.USER_PASSWORD,
    },
  });
};

export async function sendVerificationEmail(email: string, verificationCode: string) {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: env.USER_EMAIL || 'noreply@figmaclone.com',
      to: email,
      subject: 'Verify Your Email - Figma Clone',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="text-align: center; padding: 40px 20px;">
            <h1 style="color: #333; margin-bottom: 20px;">Verify Your Email</h1>
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
              Please use the verification code below to complete your registration:
            </p>
            <div style="background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="color: #333; font-family: 'Courier New', monospace; font-size: 32px; letter-spacing: 4px; margin: 0;">
                ${verificationCode}
              </h2>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6;">
              <p style="color: #999; font-size: 12px;">
                This email was sent from Figma Clone. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
        Verify Your Email - Figma Clone
        
        Please use the verification code below to complete your registration:
        
        ${verificationCode}
        
        This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: 'Failed to send verification email' };
  }
}
