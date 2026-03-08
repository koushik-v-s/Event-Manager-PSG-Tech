const nodemailer = require('nodemailer');
const env = require('./dotenv.js');

const transporterConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
};

const transporter = nodemailer.createTransport(transporterConfig);

transporter.verify((error, success) => {
  if (error) {
    console.error(`Nodemailer configuration error for ${env.EMAIL_PROVIDER}: ${error}`);
  } else {
    console.log(`Nodemailer configured successfully (${env.EMAIL_PROVIDER})`);
  }
});

module.exports = transporter;