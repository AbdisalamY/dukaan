// src/lib/email.ts
import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

// Send a payment reminder email
export const sendPaymentReminder = async (email: string, message: string) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Teke Teke" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Payment Reminder - Teke Teke Marketplace',
      text: message,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Payment Reminder</h2>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p style="font-size: 12px; color: #666;">
                  This is an automated message from Teke Teke Marketplace. Please do not reply to this email.
                </p>
            </div>`,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Payment reminder sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return false;
  }
};

// Send a welcome email after registration
export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Teke Teke" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Welcome to Teke Teke Marketplace',
      text: `Dear ${name},\n\nWelcome to Teke Teke Marketplace! Your account has been created successfully.\n\nThank you for joining our community of shop owners. We're excited to have you on board.\n\nBest regards,\nTeke Teke Team`,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Welcome to Teke Teke Marketplace!</h2>
                <p>Dear ${name},</p>
                <p>Welcome to Teke Teke Marketplace! Your account has been created successfully.</p>
                <p>Thank you for joining our community of shop owners. We're excited to have you on board.</p>
                <p>Best regards,<br>Teke Teke Team</p>
                <hr>
                <p style="font-size: 12px; color: #666;">
                  This is an automated message from Teke Teke Marketplace. Please do not reply to this email.
                </p>
            </div>`,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send a shop approval notification
export const sendShopApprovalEmail = async (email: string, name: string, shopName: string) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Teke Teke" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Your Shop Has Been Approved - Teke Teke Marketplace',
      text: `Dear ${name},\n\nCongratulations! Your shop "${shopName}" has been approved on Teke Teke Marketplace.\n\nYour shop is now visible to customers on our platform. You can now manage your shop and make payments through your dashboard.\n\nBest regards,\nTeke Teke Team`,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Your Shop Has Been Approved!</h2>
                <p>Dear ${name},</p>
                <p>Congratulations! Your shop "<strong>${shopName}</strong>" has been approved on Teke Teke Marketplace.</p>
                <p>Your shop is now visible to customers on our platform. You can now manage your shop and make payments through your dashboard.</p>
                <p>Best regards,<br>Teke Teke Team</p>
                <hr>
                <p style="font-size: 12px; color: #666;">
                  This is an automated message from Teke Teke Marketplace. Please do not reply to this email.
                </p>
            </div>`,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Shop approval email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending shop approval email:', error);
    return false;
  }
};

// Send a payment confirmation email
export const sendPaymentConfirmationEmail = async (
  email: string,
  name: string,
  shopName: string,
  amount: number,
  transactionId: string
) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Teke Teke" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Payment Confirmation - Teke Teke Marketplace',
      text: `Dear ${name},\n\nThank you for your payment of KES ${amount.toLocaleString()} for "${shopName}".\n\nTransaction ID: ${transactionId}\nDate: ${new Date().toLocaleDateString()}\n\nYour shop will remain active on our platform. Thank you for your continued partnership.\n\nBest regards,\nTeke Teke Team`,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Payment Confirmation</h2>
                <p>Dear ${name},</p>
                <p>Thank you for your payment of <strong>KES ${amount.toLocaleString()}</strong> for "<strong>${shopName}</strong>".</p>
                <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
                  <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                  <p style="margin: 5px 0;"><strong>Amount:</strong> KES ${amount.toLocaleString()}</p>
                </div>
                <p>Your shop will remain active on our platform. Thank you for your continued partnership.</p>
                <p>Best regards,<br>Teke Teke Team</p>
                <hr>
                <p style="font-size: 12px; color: #666;">
                  This is an automated message from Teke Teke Marketplace. Please do not reply to this email.
                </p>
            </div>`,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    return false;
  }
};