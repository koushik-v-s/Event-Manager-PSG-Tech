const { pool } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/dotenv');
const { generateOtp, storeOtp, verifyOtp } = require('../utils/otp');
const { sendOtpEmail } = require('../utils/mailer');

const sendOtp = async (req, res) => {
  const { email, context } = req.body;
  if (!email || !context) {
    return res.status(400).json({ error: 'Email and context are required' });
  }
  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail.endsWith('@psgtech.ac.in')) {
    return res.status(400).json({ error: 'Email must end with @psgtech.ac.in' });
  }
  try {
    const userExists = await pool.query('SELECT * FROM Users WHERE email = $1', [normalizedEmail]);
    if (context === 'register' && userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    if (context === 'password-reset' && userExists.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const otp = generateOtp();
    await storeOtp(normalizedEmail, context, otp); // add await if it's async
    await sendOtpEmail(normalizedEmail, otp);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error(err); // log full error
    res.status(500).json({ error: 'Failed to send OTP', details: err.message });
  }
};

const verifyOtpHandler = async (req, res) => {
  const { email, otp, context } = req.body;
  if (!email || !otp || !context) {
    return res.status(400).json({ error: 'Email, OTP, and context are required' });
  }
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const { valid, error } = verifyOtp(normalizedEmail, context, otp);
    if (!valid) {
      return res.status(400).json({ error });
    }
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const register = async (req, res) => {
  const { name, email, dept, designation, phone_number, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  if (!name || !email || !dept || !designation || !phone_number || !password) {
    return res.status(400).json({ error: 'Name, email, department, designation, phone number, and password are required' });
  }
  if (!/^\d{10}$/.test(phone_number)) {
    return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
  }
  try {
    const userExists = await pool.query('SELECT * FROM Users WHERE email = $1', [normalizedEmail]);
    if (userExists.rows.length > 0 && userExists.rows[0].password) {
      return res.status(400).json({ error: 'User already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = 'faculty'; // Default role
    if (userExists.rows.length > 0) {
      await pool.query(
        'UPDATE Users SET dept = $1, designation = $2, role = $3, password = $4, name = $5, phone_number = $6 WHERE email = $7',
        [dept, designation, 'faculty', hashedPassword, name, phone_number, normalizedEmail]
      );
    } else {
      await pool.query(
        'INSERT INTO Users (email, dept, designation, role, password, name, phone_number) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [normalizedEmail, dept, designation, 'faculty', hashedPassword, name, phone_number]
      );
    }
    const token = jwt.sign({ email: normalizedEmail, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRY });
    res.status(201).json({ message: 'User registered successfully', token, email: normalizedEmail, role });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const result = await pool.query('SELECT * FROM Users WHERE email = $1', [normalizedEmail]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    if (!user.password) {
      return res.status(400).json({ error: 'User not fully registered' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ email: normalizedEmail, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRY });
    res.status(200).json({ token, role: user.role, email: normalizedEmail });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    await sendOtp({ body: { email, context: 'password-reset' } }, res);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  const normalizedEmail = email ? email.toLowerCase().trim() : null;
  if (!normalizedEmail || !newPassword) {
    return res.status(400).json({ error: `Email and new password are required. Received: email=${email}, newPassword=${newPassword}` });
  }
  try {
    const userExists = await pool.query('SELECT * FROM Users WHERE email = $1', [normalizedEmail]);
    if (userExists.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE Users SET password = $1 WHERE email = $2', [hashedPassword, normalizedEmail]);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { sendOtp, verifyOtpHandler, register, login, forgotPassword, resetPassword };