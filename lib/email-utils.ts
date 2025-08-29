import nodemailer from 'nodemailer'

// Configure Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export interface WelcomeEmailData {
  name: string
  email: string
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    // Option 1: Use Gmail with custom display name (works with Gmail)
    // Option 2: Use custom domain email (requires domain setup)
    const fromEmail = process.env.LINKZUP_EMAIL || process.env.GMAIL_USER
    const fromName = "LinkzUp"
    
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      replyTo: `"LinkzUp Support" <${process.env.GMAIL_USER}>`,
      to: data.email,
      subject: "🎉 Welcome to LinkzUp! Your Account is Ready",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
              🎉 Welcome to LinkzUp!
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              Your journey to LinkedIn success starts now
            </p>
          </div>
          
          <div style="background: white; padding: 40px 20px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">
              Congratulations, ${data.name}! 🚀
            </h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Thank you for joining LinkzUp! We're excited to help you create engaging LinkedIn content 
              that will boost your professional presence and grow your network.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">
                🎁 What You Get as a New Member:
              </h3>
              <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li><strong>10 Free Credits</strong> to start creating amazing content</li>
                <li><strong>AI-Powered Content Generation</strong> for LinkedIn posts</li>
                <li><strong>Professional Templates</strong> and design tools</li>
                <li><strong>Analytics & Insights</strong> to track your performance</li>
                <li><strong>24/7 Support</strong> to help you succeed</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;
                        font-size: 16px;">
                🚀 Start Creating Content
              </a>
            </div>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #2563eb; margin: 0 0 10px 0; font-size: 16px;">
                💡 Quick Tips to Get Started:
              </h4>
              <ol style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Explore our AI content generator for viral LinkedIn posts</li>
                <li>Check out our professional templates and designs</li>
                <li>Connect your LinkedIn account for seamless posting</li>
                <li>Join our community for tips and best practices</li>
              </ol>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              If you have any questions or need help getting started, don't hesitate to reach out to our support team 
              at <a href="mailto:techzuperstudio@gmail.com" style="color: #667eea;">techzuperstudio@gmail.com</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Welcome aboard! We can't wait to see the amazing content you'll create. 🎯
            </p>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2024 LinkzUp. All rights reserved.
            </p>
            <p style="color: #999; margin: 5px 0 0 0; font-size: 12px;">
              <a href="${process.env.NEXTAUTH_URL}/privacy" style="color: #999;">Privacy Policy</a> | 
              <a href="${process.env.NEXTAUTH_URL}/terms" style="color: #999;">Terms of Service</a>
            </p>
          </div>
        </div>
      `
    }

    // Send email
    await transporter.sendMail(mailOptions)
    console.log(`Welcome email sent successfully to ${data.email}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}


