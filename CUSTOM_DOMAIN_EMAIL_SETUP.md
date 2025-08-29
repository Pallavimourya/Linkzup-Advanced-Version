# Custom Domain Email Setup for LinkzUp

This guide explains how to set up a custom domain email (like `noreply@linkzup.com`) for sending welcome emails and other communications.

## Why Use Custom Domain Email?

- **Professional Appearance**: Emails appear as coming from your brand
- **Better Deliverability**: Higher chance of reaching inbox instead of spam
- **Brand Trust**: Users trust emails from your domain more
- **Consistency**: All communications use your domain

## Setup Options

### Option 1: Gmail with Custom Domain (Recommended)

1. **Purchase Domain** (if you don't have one)
   - Buy a domain like `linkzup.com` from any registrar
   - Cost: ~$10-15/year

2. **Set Up Google Workspace**
   - Go to [Google Workspace](https://workspace.google.com/)
   - Sign up for Google Workspace (formerly G Suite)
   - Cost: $6/month per user
   - Verify your domain ownership

3. **Create Email Address**
   - Create `noreply@linkzup.com` in Google Workspace
   - Set up app password for this email

4. **Update Environment Variables**
   ```env
   GMAIL_USER=noreply@linkzup.com
   GMAIL_APP_PASSWORD=your-app-password
   LINKZUP_EMAIL=noreply@linkzup.com
   ```

### Option 2: Free Email Service with Custom Domain

1. **Use Zoho Mail (Free)**
   - Sign up at [Zoho Mail](https://www.zoho.com/mail/)
   - Add your custom domain
   - Create `noreply@linkzup.com`
   - Free for up to 5 users

2. **Configure SMTP Settings**
   ```env
   SMTP_HOST=smtp.zoho.com
   SMTP_PORT=587
   SMTP_USER=noreply@linkzup.com
   SMTP_PASS=your-app-password
   LINKZUP_EMAIL=noreply@linkzup.com
   ```

### Option 3: Email Service Provider

1. **SendGrid**
   - Sign up for free account (100 emails/day)
   - Verify your domain
   - Use SendGrid's SMTP or API

2. **Mailgun**
   - Free tier available
   - Domain verification required
   - Good for high volume

## Current Setup (Gmail with Custom Display Name)

If you want to keep using Gmail but make it look professional:

```env
GMAIL_USER=your-personal-gmail@gmail.com
GMAIL_APP_PASSWORD=your-app-password
# LINKZUP_EMAIL= (leave empty to use GMAIL_USER)
```

**Result**: Emails will appear as "LinkzUp <your-gmail@gmail.com>"

## Testing Your Setup

1. **Test Current Setup**:
   ```bash
   POST /api/test-welcome-email
   {
     "name": "Test User",
     "email": "your-test-email@gmail.com"
   }
   ```

2. **Check Email Headers**:
   - Look at the "From" field in the received email
   - Should show "LinkzUp" as the sender name

## Production Recommendations

For production deployment:

1. **Use Google Workspace** with custom domain
2. **Set up SPF, DKIM, and DMARC** records
3. **Monitor email deliverability**
4. **Set up email analytics**

## Cost Comparison

| Option | Setup Cost | Monthly Cost | Professional Level |
|--------|------------|--------------|-------------------|
| Gmail (current) | $0 | $0 | ⭐⭐⭐ |
| Zoho Mail | $0 | $0 | ⭐⭐⭐⭐ |
| Google Workspace | $0 | $6/month | ⭐⭐⭐⭐⭐ |
| SendGrid | $0 | $0 (100/day) | ⭐⭐⭐⭐ |

## Quick Start (Current Setup)

If you want to start immediately with the current setup:

1. **No changes needed** - it's already configured
2. **Emails will show as**: "LinkzUp <your-gmail@gmail.com>"
3. **Users will see**: Professional LinkzUp branding
4. **Works immediately** with your existing Gmail setup

The current setup provides a professional appearance while using your existing Gmail account. You can upgrade to a custom domain email later when you're ready for production.
