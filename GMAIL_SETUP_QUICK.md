# 🚀 Quick Gmail Setup for Reply System

## ⚡ Fast Setup (5 minutes)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. In Google Account → Security → "2-Step Verification"
2. Click "App passwords"
3. Select "Mail" → "Other" → Name: "LinkzUp"
4. Copy the 16-character password (like: `abcd efgh ijkl mnop`)

### Step 3: Set Environment Variables
Create or update your `.env.local` file:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Other required variables (if not already set)
NEXTAUTH_URL=https://www.linkzup.in
NEXTAUTH_SECRET=your-nextauth-secret
MONGODB_URI=your-mongodb-connection-string
```

### Step 4: Test Configuration
1. Go to Admin Dashboard → Test Gmail
2. Click "Check Gmail Config"
3. Send a test email to yourself
4. Check your inbox!

## ✅ Verification Steps

### Check Configuration:
- Admin Dashboard → Test Gmail → "Check Gmail Config"
- Should show "Configured" status

### Send Test Email:
- Enter your email address
- Click "Send Test"
- Check your inbox for test email

### Test Reply System:
- Go to Contact Submissions
- Click "Reply to [Name]"
- Choose "Email" and send a reply

## 🔧 Troubleshooting

### "Not Configured" Error:
- Check if `.env.local` file exists
- Verify GMAIL_USER and GMAIL_APP_PASSWORD are set
- Restart your application after adding variables

### "Invalid Credentials" Error:
- Make sure you're using App Password, not regular password
- Verify 2-factor authentication is enabled
- Check if App Password was generated correctly

### "Less Secure App Access" Error:
- This means you're using regular password
- Always use App Password for programmatic access

### Emails Not Sending:
- Check console logs for error messages
- Verify Gmail credentials are correct
- Test with a simple email first

## 📧 Gmail Limits

- **Free Gmail**: 500 emails/day
- **Gmail Business**: 2000 emails/day
- **For Production**: Consider SendGrid, AWS SES, or Mailgun

## 🎯 Next Steps

1. ✅ Set up Gmail credentials
2. ✅ Test configuration
3. ✅ Send test email
4. ✅ Test reply system
5. 🚀 Start using for customer support!

---

**Need Help?** Check the Test Gmail page in Admin Dashboard for real-time configuration status and testing.
