require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:8086',
  'https://www.ridhsdesign.com',
  'https://ridhsdesign.com',
  'https://backend.ridhsdesign.com',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json());

// Serve static files (Note: serverless has limitations here)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes

app.use('/api/ping-db', require('./ping-db'));
app.use('/api/contact', require('./contact'));
app.use('/api/products', require('./products'));
console.log('✅ Register route mounted'); // 👈 Just before mounting
app.use('/api/register', require('./register'));


// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ✅ Local dev support
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on http://localhost:${PORT}`);
  });
} else {
  // ✅ Vercel support
  module.exports = (req, res) => {
    app(req, res);
  };
}
