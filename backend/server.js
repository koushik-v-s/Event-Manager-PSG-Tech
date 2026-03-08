// backend/server.js
const env = require('./config/dotenv.js');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { pool, connectToDb } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventsRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
const corsOptions = {
  origin: env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// Routes with try/catch wrapper
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', async (req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    res.send(data);
  } catch (err) {
    console.error('Error reading HTML file:', err.stack || err);
    res.status(500).send('Server error');
  }
});

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Connect to database
connectToDb().catch(err => {
  console.error('Database connection failed:', err.stack || err);
  process.exit(1); // exit if DB fails
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Backend Error:', err.stack || err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Start server
const PORT = env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
