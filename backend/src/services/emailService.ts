import * as brevo from '@getbrevo/brevo';

// Initialize Brevo API instance
const apiInstance = new brevo.TransactionalEmailsApi();
if (!process.env.BREVO_API_KEY) {
  throw new Error('BREVO_API_KEY is not set in environment variables');
}
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

export interface EmailVerificationData {
  email: string;
  username: string;
  verificationToken: string;
  verificationUrl: string;
}

export interface PasswordResetData {
  email: string;
  username: string;
  resetToken: string;
  resetUrl: string;
}

class EmailService {
  private fromEmail = process.env.FROM_EMAIL || 'noreply@aetherbeas.ts.com';
  private fromName = process.env.FROM_NAME || 'Aether Beasts';

  /**
   * Send email verification email
   */
  async sendVerificationEmail(data: EmailVerificationData): Promise<boolean> {
    console.error('❌ DEBUG', process.env.BREVO_API_KEY);
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = 'Verify your Aether Beasts account';
      sendSmtpEmail.htmlContent = this.getVerificationEmailTemplate(data);
      sendSmtpEmail.sender = {
        name: this.fromName,
        email: this.fromEmail,
      };
      sendSmtpEmail.to = [
        {
          email: data.email,
          name: data.username,
        },
      ];
      sendSmtpEmail.replyTo = {
        email: this.fromEmail,
        name: this.fromName,
      };

      await apiInstance.sendTransacEmail(sendSmtpEmail);

      console.log(`✅ Verification email sent to: ${data.email}`);
      return true;
    } catch (error) {
      console.error('❌ DEBUG', process.env.BREVO_API_KEY);
      console.error('❌ Failed to send verification email:', error);
      console.error('❌ DEBUG', process.env.BREVO_API_KEY);
      return false;
    }
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = 'Welcome to Aether Beasts!';
      sendSmtpEmail.htmlContent = this.getWelcomeEmailTemplate(username);
      sendSmtpEmail.sender = {
        name: this.fromName,
        email: this.fromEmail,
      };
      sendSmtpEmail.to = [
        {
          email,
          name: username,
        },
      ];
      sendSmtpEmail.replyTo = {
        email: this.fromEmail,
        name: this.fromName,
      };

      await apiInstance.sendTransacEmail(sendSmtpEmail);

      console.log(`✅ Welcome email sent to: ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(data: PasswordResetData): Promise<boolean> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = 'Reset your Aether Beasts password';
      sendSmtpEmail.htmlContent = this.getPasswordResetEmailTemplate(data);
      sendSmtpEmail.sender = {
        name: this.fromName,
        email: this.fromEmail,
      };
      sendSmtpEmail.to = [
        {
          email: data.email,
          name: data.username,
        },
      ];
      sendSmtpEmail.replyTo = {
        email: this.fromEmail,
        name: this.fromName,
      };

      await apiInstance.sendTransacEmail(sendSmtpEmail);

      console.log(`✅ Password reset email sent to: ${data.email}`);
      return true;
    } catch (error) {
      console.error('❌ DEBUG', process.env.BREVO_API_KEY);
      console.error('❌ Failed to send password reset email:', error);
      console.error('❌ DEBUG', process.env.BREVO_API_KEY);
      return false;
    }
  }

  /**
   * Generate verification email HTML template
   */
  private getVerificationEmailTemplate(data: EmailVerificationData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Aether Beasts Account</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4a90e2;
            margin-bottom: 10px;
        }
        .title {
            color: #333;
            font-size: 22px;
            margin-bottom: 20px;
        }
        .verify-button {
            display: inline-block;
            background-color: #4a90e2;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .verify-button:hover {
            background-color: #357abd;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚡ Aether Beasts</div>
        </div>
        
        <h1 class="title">Welcome, ${data.username}!</h1>
        
        <p>Thank you for joining Aether Beasts! To complete your registration and start your mythological adventure, please verify your email address.</p>
        
        <div style="text-align: center;">
            <a href="${data.verificationUrl}" class="verify-button">Verify Email Address</a>
        </div>
        
        <div class="warning">
            <strong>⚠️ Important:</strong> This verification link will expire in 24 hours for security reasons.
        </div>
        
        <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
            ${data.verificationUrl}
        </p>
        
        <p>If you didn't create an account with Aether Beasts, please ignore this email.</p>
        
        <div class="footer">
            <p>This email was sent to ${data.email}</p>
            <p>© 2025 Aether Beasts. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate welcome email HTML template
   */
  private getWelcomeEmailTemplate(username: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Aether Beasts!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4a90e2;
            margin-bottom: 10px;
        }
        .title {
            color: #333;
            font-size: 22px;
            margin-bottom: 20px;
        }
        .play-button {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .features {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚡ Aether Beasts</div>
        </div>
        
        <h1 class="title">Welcome to Aether Beasts, ${username}! 🎉</h1>
        
        <p>Your email has been successfully verified! You're now ready to embark on an epic mythological adventure.</p>
        
        <div class="features">
            <h3>🎮 What awaits you:</h3>
            <ul>
                <li><strong>🔥 Epic Battles:</strong> Command mythological beasts from Greek, Egyptian, Norse, and Chinese legends</li>
                <li><strong>⚔️ Strategic Combat:</strong> Use powerful techniques and artifacts to defeat your opponents</li>
                <li><strong>🏗️ Deck Building:</strong> Create custom decks with your favorite mythology</li>
                <li><strong>🌍 Multiplayer:</strong> Challenge players from around the world</li>
            </ul>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="play-button">Start Playing Now!</a>
        </div>
        
        <p>May the power of ancient legends guide you to victory!</p>
        
        <div class="footer">
            <p>Happy gaming!</p>
            <p>The Aether Beasts Team</p>
            <p>© 2025 Aether Beasts. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Generate password reset email HTML template
   */
  private getPasswordResetEmailTemplate(data: PasswordResetData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Aether Beasts Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4a90e2;
            margin-bottom: 10px;
        }
        .title {
            color: #333;
            font-size: 22px;
            margin-bottom: 20px;
        }
        .reset-button {
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
        }
        .reset-button:hover {
            background-color: #c82333;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #666;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .security-notice {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 10px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">⚡ Aether Beasts</div>
        </div>
        
        <h1 class="title">Password Reset Request</h1>
        
        <p>Hello ${data.username},</p>
        
        <p>We received a request to reset your password for your Aether Beasts account. If you made this request, click the button below to reset your password:</p>
        
        <div style="text-align: center;">
            <a href="${data.resetUrl}" class="reset-button">Reset Password</a>
        </div>
        
        <div class="warning">
            <strong>⚠️ Important:</strong> This password reset link will expire in 1 hour for security reasons.
        </div>
        
        <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">
            ${data.resetUrl}
        </p>
        
        <div class="security-notice">
            <strong>🔒 Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account is secure and no changes have been made.
        </div>
        
        <p>If you continue to have issues or didn't request this reset, please contact our support team.</p>
        
        <div class="footer">
            <p>This email was sent to ${data.email}</p>
            <p>© 2025 Aether Beasts. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }
}

export const emailService = new EmailService();
