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

export interface InvoiceEmailData {
  to: string
  invoice: {
    invoiceNumber: string
    invoiceDate: string
    dueDate: string
    customer: {
      name: string
      email: string
      address: string
    }
    items: Array<{
      description: string
      quantity: number
      unitPrice: number
      total: number
    }>
    subtotal: number
    discount: number
    total: number
    payment: {
      method: string
      transactionId: string
      orderId: string
      status: string
      paidAt: string
    }
    coupon?: {
      code: string
      type: string
      value: number
    }
  }
}

export async function sendInvoiceEmail(data: InvoiceEmailData) {
  try {
    const fromEmail = process.env.LINKZUP_EMAIL || process.env.GMAIL_USER
    const fromName = "LinkzUp"
    
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      replyTo: `"LinkzUp Support" <${process.env.GMAIL_USER}>`,
      to: data.to,
      subject: `📄 Invoice ${data.invoice.invoiceNumber} - LinkzUp`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
              📄 Invoice
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              ${data.invoice.invoiceNumber}
            </p>
          </div>
          
          <div style="background: white; padding: 40px 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
              <div>
                <h2 style="color: #333; margin: 0 0 10px 0; font-size: 20px;">Bill To:</h2>
                <p style="color: #666; margin: 0; font-size: 14px;">${data.invoice.customer.name}</p>
                <p style="color: #666; margin: 0; font-size: 14px;">${data.invoice.customer.email}</p>
                <p style="color: #666; margin: 0; font-size: 14px;">${data.invoice.customer.address}</p>
              </div>
              <div style="text-align: right;">
                <p style="color: #666; margin: 0; font-size: 14px;"><strong>Invoice Date:</strong> ${formatDate(data.invoice.invoiceDate)}</p>
                <p style="color: #666; margin: 0; font-size: 14px;"><strong>Due Date:</strong> ${formatDate(data.invoice.dueDate)}</p>
                <p style="color: #666; margin: 0; font-size: 14px;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Paid</span></p>
              </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Description</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">Unit Price</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${data.invoice.items.map(item => `
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${item.description}</td>
                    <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">${item.quantity}</td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">${formatCurrency(item.unitPrice)}</td>
                    <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">${formatCurrency(item.total)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="text-align: right; margin: 20px 0;">
              <div style="display: inline-block; min-width: 200px;">
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                  <span>Subtotal:</span>
                  <span>${formatCurrency(data.invoice.subtotal)}</span>
                </div>
                ${data.invoice.discount > 0 ? `
                  <div style="display: flex; justify-content: space-between; margin: 5px 0; color: #10b981;">
                    <span>Discount${data.invoice.coupon ? ` (${data.invoice.coupon.code})` : ''}:</span>
                    <span>-${formatCurrency(data.invoice.discount)}</span>
                  </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; margin: 10px 0; padding-top: 10px; border-top: 2px solid #333; font-weight: bold; font-size: 18px;">
                  <span>Total:</span>
                  <span>${formatCurrency(data.invoice.total)}</span>
                </div>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Payment Details:</h3>
              <p style="color: #666; margin: 5px 0; font-size: 14px;"><strong>Method:</strong> ${data.invoice.payment.method}</p>
              <p style="color: #666; margin: 5px 0; font-size: 14px;"><strong>Transaction ID:</strong> ${data.invoice.payment.transactionId}</p>
              <p style="color: #666; margin: 5px 0; font-size: 14px;"><strong>Order ID:</strong> ${data.invoice.payment.orderId}</p>
              <p style="color: #666; margin: 5px 0; font-size: 14px;"><strong>Paid On:</strong> ${formatDate(data.invoice.payment.paidAt)}</p>
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
                🚀 Access Your Dashboard
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              Thank you for your business! If you have any questions about this invoice, please contact our support team 
              at <a href="mailto:techzuperstudio@gmail.com" style="color: #667eea;">techzuperstudio@gmail.com</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              This is an automated invoice. Please keep this for your records.
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
    console.log(`Invoice email sent successfully to ${data.to}`)
    return { success: true }
  } catch (error) {
    console.error('Error sending invoice email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
