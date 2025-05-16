// api/index.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const pingDbRoute = require('../routes/ping-db');
require('dotenv').config();

const app = express();

// === CORS Configuration ===
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8086',
    'https://backend.ridhsdesign.com',
    'https://www.ridhsdesign.com'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// === Mount Routes ===
app.use('/ping-db', pingDbRoute);

module.exports = serverless(app);
