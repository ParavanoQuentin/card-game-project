import * as brevo from '@getbrevo/brevo';

interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export class EmailService {
  private apiInstance: brevo.TransactionalEmailsApi;
  private config: EmailConfig;

  constructor() {
    this.config = {
      apiKey: process.env.BREVO_API_KEY || '',
      fromEmail: process.env.FROM_EMAIL || 'noreply@aetherbeasts.com',
      fromName: process.env.FROM_NAME || 'Aether Beasts'
    };

    if (!this.config.apiKey) {
      throw new Error('BREVO_API_KEY is required in environment variables');
    }

    // Configure Brevo API using environment variable
    process.env.BREVO_API_KEY = this.config.apiKey;
    this.apiInstance = new brevo.TransactionalEmailsApi();
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const sendSmtpEmail = {
        subject: emailData.subject,
        htmlContent: emailData.htmlContent,
        textContent: emailData.textContent || this.stripHtml(emailData.htmlContent),
        sender: {
          name: this.config.fromName,
          email: this.config.fromEmail
        },
        to: [{
          email: emailData.to,
          name: emailData.to.split('@')[0] // Use email username as name
        }]
      };

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Email sent successfully:', response.body);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, username: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email - Aether Beasts</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 Welcome to Aether Beasts!</h1>
            </div>
            <div class="content">
              <h2>Hello ${username},</h2>
              <p>Thank you for registering with Aether Beasts! To complete your registration and start your mythological card game journey, please verify your email address.</p>
              
              <p>Click the button below to verify your email:</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="background: #eee; padding: 10px; border-radius: 4px; word-break: break-all;">${verificationUrl}</p>
              
              <p><strong>This verification link will expire in 24 hours.</strong></p>
              
              <p>If you didn't create an account with Aether Beasts, please ignore this email.</p>
              
              <p>Best regards,<br>The Aether Beasts Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Aether Beasts. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Aether Beasts',
      htmlContent,
      textContent: `Hello ${username},\n\nThank you for registering with Aether Beasts! Please verify your email by clicking this link: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nThe Aether Beasts Team`
    });
  }

  async sendPasswordResetEmail(email: string, username: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password - Aether Beasts</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${username},</h2>
              <p>We received a request to reset your password for your Aether Beasts account.</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account is secure.
              </div>
              
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="background: #eee; padding: 10px; border-radius: 4px; word-break: break-all;">${resetUrl}</p>
              
              <p><strong>This reset link will expire in 1 hour for security reasons.</strong></p>
              
              <p>Best regards,<br>The Aether Beasts Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Aether Beasts. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Aether Beasts',
      htmlContent,
      textContent: `Hello ${username},\n\nWe received a request to reset your password for your Aether Beasts account.\n\nClick this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Aether Beasts Team`
    });
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

export let emailService: EmailService;

export function initializeEmailService() {
  if (!emailService) {
    emailService = new EmailService();
  }
  return emailService;
}
