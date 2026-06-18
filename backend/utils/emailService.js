const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS, 
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

const sendOTPEmail = async (email, otp) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP Credentials missing! Cannot send real email. Check your .env file.");
    console.log(`[MOCK EMAIL] To: ${email} | OTP: ${otp}`);
    return; // For development if you haven't set up SMTP yet
  }

  const mailOptions = {
    from: `"KhedutSaathi" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your KhedutSaathi Registration OTP',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; max-width: 500px; margin: auto;">
        <h2 style="color: #4CAF50;">Welcome to KhedutSaathi</h2>
        <p>You are just one step away from joining us. Please use the following OTP to complete your registration:</p>
        <div style="font-size: 24px; font-weight: bold; background-color: #f3f4f6; padding: 10px; letter-spacing: 2px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  generateOTP,
  sendOTPEmail
};
