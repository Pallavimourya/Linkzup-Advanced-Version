# WhatsApp Business API Integration Setup

This guide explains how to set up WhatsApp Business API for sending automated replies to user enquiries.

## 🎯 Overview

The WhatsApp integration allows admins to reply to user enquiries directly via WhatsApp messages. This provides a more personal and immediate communication channel.

## 📋 Prerequisites

1. **WhatsApp Business Account**
2. **Meta Business Account** 
3. **Phone Number** (for WhatsApp Business)
4. **Domain Verification** (for webhook)

## 🚀 Setup Options

### Option 1: WhatsApp Business API (Recommended for Production)

#### Step 1: Create Meta Business Account
1. Go to [Meta Business](https://business.facebook.com/)
2. Create a new business account
3. Verify your business information

#### Step 2: Set up WhatsApp Business API
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add WhatsApp product to your app
4. Follow the setup wizard

#### Step 3: Get Required Credentials
You'll need these values:
- **Phone Number ID**: Found in WhatsApp > API Setup
- **Access Token**: Generate from WhatsApp > API Setup
- **Webhook Verify Token**: Create a random string
- **Webhook URL**: `https://yourdomain.com/api/webhooks/whatsapp`

#### Step 4: Environment Variables
Add these to your `.env.local`:

```env
# WhatsApp Business API
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=your-access-token-here
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id-here
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-random-verify-token-here
```

### Option 2: Twilio WhatsApp API (Alternative)

#### Step 1: Twilio Account Setup
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get a Twilio phone number with WhatsApp capability
3. Get your Account SID and Auth Token

#### Step 2: Environment Variables
```env
# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## 🔧 Implementation Details

### Message Templates
WhatsApp Business API requires pre-approved message templates for automated messages. You'll need to create templates for:

1. **Enquiry Reply Template**
```
Hello {{1}}! 👋

Thank you for reaching out to LinkzUp. Here's our response to your enquiry:

{{2}}

---
Your Original Enquiry:
{{3}}

Best regards,
LinkzUp Support Team
📧 support@linkzup.in
🌐 https://linkzup.in
```

2. **Trial Reminder Template** (for future use)
```
Hello {{1}}! 

Your LinkzUp trial is ending soon. Don't miss out on creating amazing LinkedIn content!

Upgrade now: {{2}}

Best regards,
LinkzUp Team
```

### Rate Limits
- **Free Tier**: 1,000 messages/month
- **Paid Tier**: Based on your plan
- **Message Limits**: 250 messages per day per phone number

## 🧪 Testing

### Test WhatsApp Integration
1. Use the test endpoint: `POST /api/test/whatsapp`
2. Send a test message to your own number
3. Verify message delivery

### Test with Contact Form
1. Submit a contact form with your phone number
2. Go to admin dashboard
3. Try replying via WhatsApp
4. Check if message is received

## 📊 Monitoring

### Webhook Setup (Optional)
To receive delivery status updates:

1. Create webhook endpoint: `/api/webhooks/whatsapp`
2. Configure webhook in Meta Business Manager
3. Handle delivery status updates

### Logs
Check these logs for WhatsApp integration:
- API response logs
- Message delivery status
- Error logs for failed messages

## 💰 Cost Estimation

### WhatsApp Business API
- **Free Tier**: 1,000 messages/month
- **Paid**: ~₹0.50-1.00 per message
- **Monthly Cost**: ₹500-2000 for moderate usage

### Twilio WhatsApp
- **Setup**: Free
- **Per Message**: ~₹0.30-0.50
- **Monthly Cost**: ₹300-1500 for moderate usage

## 🔒 Security Considerations

1. **Access Token Security**: Store securely, rotate regularly
2. **Webhook Security**: Verify webhook signatures
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Data Privacy**: Comply with WhatsApp Business Policy

## 🚨 Troubleshooting

### Common Issues

1. **"Phone number not verified"**
   - Ensure phone number is verified in Meta Business Manager
   - Check if number is associated with WhatsApp Business

2. **"Template not approved"**
   - Wait for template approval (can take 24-48 hours)
   - Ensure template follows WhatsApp guidelines

3. **"Rate limit exceeded"**
   - Check your message limits
   - Implement proper rate limiting

4. **"Invalid phone number format"**
   - Ensure phone number includes country code
   - Format: +91XXXXXXXXXX (for India)

### Debug Mode
Enable debug logging by setting:
```env
WHATSAPP_DEBUG=true
```

## 📞 Support

- **WhatsApp Business API**: [Meta Business Support](https://business.facebook.com/support)
- **Twilio WhatsApp**: [Twilio Support](https://support.twilio.com/)

## 🔄 Next Steps

1. Set up WhatsApp Business API
2. Configure environment variables
3. Test the integration
4. Monitor message delivery
5. Set up webhooks (optional)
6. Create message templates for different use cases

---

**Note**: WhatsApp Business API setup can take 1-2 weeks for approval. Plan accordingly for production deployment.
