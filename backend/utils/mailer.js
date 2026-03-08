const nodemailer = require('nodemailer');
const env = require('../config/dotenv');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"PSGCT Event Permission System" <${env.EMAIL_USER}>`,
    to: email,
    subject: 'One-Time Password (OTP) for PSGCT Event Permission System',
    text: `Dear Faculty,

You have requested a One-Time Password (OTP) for accessing the PSGCT Event Permission System.

Your OTP is: ${otp}

Please note that this OTP is valid for 10 minutes and should not be shared with anyone for security reasons.
If you did not request this OTP, please ignore this email.

Thank you,
PSGCT Event Permission System`,
  });
};


module.exports = { sendOtpEmail };