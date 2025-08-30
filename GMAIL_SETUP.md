# Gmail Setup for Password Reset

This guide explains how to configure Gmail to send password reset emails for the LinkzUp application.

## Prerequisites

1. A Gmail account
2. Two-factor authentication enabled on your Gmail account

## Setup Steps

### 1. Enable Two-Factor Authentication

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security"
3. Enable "2-Step Verification" if not already enabled

### 2. Generate App Password

1. In your Google Account settings, go to "Security"
2. Under "2-Step Verification", click on "App passwords"
3. Select "Mail" as the app and "Other" as the device
4. Enter a name like "LinkzUp Password Reset"
5. Click "Generate"
6. Copy the 16-character app password (it will look like: `abcd efgh ijkl mnop`)

### 3. Configure Environment Variables

Add these variables to your `.env.local` file:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

Replace:
- `your-email@gmail.com` with your actual Gmail address
- `your-16-character-app-password` with the app password you generated

### 4. Test the Configuration

1. Start your development server
2. Go to the sign-in page
3. Click "Forgot password?"
4. Enter your email address
5. Check your Gmail inbox for the reset email

## Security Notes

- Never commit your `.env.local` file to version control
- The app password is different from your regular Gmail password
- App passwords can be revoked at any time from your Google Account settings
- Each app password is specific to the application and can be deleted individually

## Troubleshooting

### "Invalid credentials" error
- Make sure you're using the app password, not your regular Gmail password
- Verify that 2-factor authentication is enabled
- Check that the app password was generated correctly

### "Less secure app access" error
- This error occurs when trying to use regular passwords
- Always use app passwords for programmatic access

### Emails not being sent
- Check your Gmail account for any security alerts
- Verify the environment variables are set correctly
- Check the application logs for detailed error messages

## Production Deployment

For production deployment:

1. Use a dedicated Gmail account for sending emails
2. Consider using a service like SendGrid or AWS SES for better deliverability
3. Set up proper SPF and DKIM records for your domain
4. Monitor email delivery rates and bounce rates
