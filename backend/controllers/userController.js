const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');
const env = require('../config/dotenv');

const getProfile = async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const email = decoded.email;

    // Fetch user details
    const userResult = await pool.query(
      'SELECT name, email, dept, designation, role FROM Users WHERE email = $1',
      [email]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { email } = req.params;

    // Query the Users table by email
    const result = await pool.query(
      'SELECT name, email, role, dept, designation, phone_number FROM Users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Prepare response data
    const userData = {
      name: user.name || '',
      email: user.email || '',
    };

    // Include faculty-specific fields
    if (user.role === 'faculty') {
      userData.department = user.dept || '';
      userData.designation = user.designation || '';
      userData.phone_number = user.phone_number || '';
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = { getProfile, getUserProfile };