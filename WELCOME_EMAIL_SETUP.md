# Welcome Email Setup for LinkzUp

This guide explains the welcome email feature that automatically sends congratulatory emails to new users when they sign up.

## Overview

When a new user signs up for LinkzUp, they will automatically receive a beautiful welcome email that includes:
- Personalized greeting with their name
- Information about their free credits and trial period
- Quick tips to get started
- Links to the dashboard and support

## Email Triggers

Welcome emails are sent in the following scenarios:

1. **Regular Registration** (`/api/auth/register`)
   - When users sign up with email and password
   - Email sent immediately after successful account creation

2. **OAuth Sign-up** (Google/LinkedIn)
   - When users sign up using Google or LinkedIn OAuth
   - Email sent via NextAuth.js `signIn` event handler

3. **LinkedIn Direct Sign-up** (`/api/linkedin/callback`)
   - When users sign up directly through LinkedIn callback
   - Email sent after successful user creation

## Configuration

### Required Environment Variables

Add these to your `.env.local` file:

```env
# Gmail Configuration for Welcome Emails
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
NEXTAUTH_URL=http://localhost:3000

# LinkzUp Email Configuration (Optional)
# If you have a custom domain email, use it here for professional appearance
# LINKZUP_EMAIL=noreply@linkzup.com
```

### Gmail Setup

1. **Enable Two-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings → Security
   - Under "2-Step Verification", click "App passwords"
   - Select "Mail" and "Other"
   - Name it "LinkzUp Welcome Emails"
   - Copy the 16-character password

3. **Update Environment Variables**:
   - Set `GMAIL_USER` to your Gmail address
   - Set `GMAIL_APP_PASSWORD` to the generated app password

### Email Display Options

**Option 1: Gmail with Custom Display Name (Current)**
- Emails will appear as: "LinkzUp <your-gmail@gmail.com>"
- Works immediately with Gmail
- Professional appearance

**Option 2: Custom Domain Email (Recommended for Production)**
- Set `LINKZUP_EMAIL=noreply@linkzup.com` in your `.env.local`
- Emails will appear as: "LinkzUp <noreply@linkzup.com>"
- Requires domain email setup
- Most professional appearance

## Email Content

The welcome email includes:

- **Header**: Gradient design with LinkzUp branding
- **Personalized Greeting**: "Congratulations, [Name]! 🚀"
- **Welcome Message**: Explains what LinkzUp offers
- **Benefits List**: 
  - 10 Free Credits
  - AI-Powered Content Generation
  - Professional Templates
  - Analytics & Insights
  - 24/7 Support
- **Call-to-Action Button**: "Start Creating Content"
- **Quick Tips**: Getting started guide
- **Support Information**: Contact email
- **Footer**: Links to privacy policy and terms

## Testing

### Test Endpoint

Use the test endpoint to verify email functionality:

```bash
POST /api/test-welcome-email
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com"
}
```

### Manual Testing

1. Start your development server
2. Sign up a new user through any method
3. Check the user's email for the welcome message
4. Verify the email content and links work correctly

## Error Handling

- Email failures don't prevent user registration
- All email errors are logged to console
- Users can still access the platform even if welcome email fails

## Customization

### Email Template

To customize the email content, edit `lib/email-utils.ts`:

- Modify the HTML template in `sendWelcomeEmail` function
- Update colors, branding, or content as needed
- Test changes using the test endpoint

### Email Subject

Change the subject line in `sendWelcomeEmail`:

```typescript
subject: "🎉 Welcome to LinkzUp! Your Account is Ready",
```

### Email Sender

Update the sender name and email:

```typescript
from: `"LinkzUp Team" <${process.env.GMAIL_USER}>`,
```

## Production Deployment

For production:

1. **Use Dedicated Email Service**: Consider SendGrid, AWS SES, or Mailgun
2. **Set Up Domain Authentication**: Configure SPF, DKIM, and DMARC
3. **Monitor Delivery Rates**: Track email delivery and bounce rates
4. **Test Thoroughly**: Send test emails to various email providers

## Troubleshooting

### Email Not Sending

1. Check Gmail credentials in environment variables
2. Verify 2-factor authentication is enabled
3. Ensure app password is correct
4. Check console logs for error messages

### Email Going to Spam

1. Set up proper SPF and DKIM records
2. Use a dedicated email service
3. Warm up the email sending reputation
4. Include proper unsubscribe links

### Gmail Quota Limits

- Gmail has daily sending limits (500/day for regular accounts)
- Consider using Gmail Business or dedicated email service for high volume

## Security Notes

- Never commit `.env.local` to version control
- App passwords can be revoked from Google Account settings
- Each app password is specific to the application
- Monitor for any unauthorized email sending
