# Brevo Setup Instructions

## 1. Create Brevo Account

1. Go to https://www.brevo.com/
2. Sign up for a free account
3. Verify your email address
4. Complete the onboarding process

## 2. Get API Key

1. Log in to your Brevo dashboard
2. Go to "Settings" → "API Keys"
3. Click "Create a new API key"
4. Name it something like "Aether Beasts API"
5. Copy the generated API key

## 3. Configure Sender

1. Go to "Settings" → "Senders & IP"
2. Add a sender email (e.g., noreply@yourdomain.com)
3. If you don't have a domain, you can use a verified email address
4. For development, you can use your own email as the sender

## 4. Update Environment Variables

Update the `.env` file in your backend folder:

```env
# Replace with your actual Brevo API key
BREVO_API_KEY=your_actual_api_key_here

# Replace with your verified sender email
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Aether Beasts

# Update if your frontend runs on a different port
FRONTEND_URL=http://localhost:3000
```

## 5. Domain Configuration (Optional but Recommended)

For production:
1. Add your domain to Brevo
2. Set up SPF and DKIM records
3. Verify domain ownership

## 6. Free Plan Limits

Brevo's free plan includes:
- 300 emails per day
- Unlimited contacts
- Basic email templates
- Basic analytics

## 7. Testing

Once configured, you can test email sending by:
1. Registering a new user
2. Checking your email for verification
3. Testing password reset functionality

## 8. Email Templates

The system includes:
- Welcome/verification emails with branded styling
- Password reset emails with security warnings
- Responsive HTML templates
- Fallback text versions

## 9. Security Features

- Verification tokens expire after 24 hours
- Password reset tokens expire after 1 hour
- Email verification required before login
- Secure token generation using UUID v4

## 10. Monitoring

Monitor your email delivery in the Brevo dashboard:
- Email statistics
- Delivery reports
- Bounce and complaint tracking
- Real-time logs
