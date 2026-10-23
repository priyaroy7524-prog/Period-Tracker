// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Cycle = require('./models/Cycle');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Aap yahan apni MongoDB Atlas URI ya local connection string daal sakti hain)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/period-tracker';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🗄️ MongoDB Connected Successfully!'))
  .catch((err) => console.error('Database connection error:', err));

// --- API ROUTES ---

// 1. Get All History (Purani history fetch karne ke liye)
app.get('/api/cycles', async (req, res) => {
    try {
        const cycles = await Cycle.find().sort({ startDate: -1 });
        res.json(cycles);
    } catch (err) {
        res.status(500).json({ error: 'Server error while fetching history' });
    }
},);
//   Naya entry save karne ke liye)
app.get('/api/cycles', async (req, res) => {
    try {
        const newCycle = new Cycle(req.body);
        const savedCycle = await newCycle.save();
        res.status(201).json(savedCycle);
    } catch (err) {
        res.status(400).json({ error: 'Failed to save cycle log' });
    }
});

// 2. Add New Cycle Log (Isko theek karein)
app.post('/api/cycles', async (req, res) => {
    try {
        const newCycle = new Cycle(req.body);
        const savedCycle = await newCycle.save();
        res.status(201).json(savedCycle);
    } catch (err) {
        res.status(400).json({ error: 'Failed to save cycle log' });
    }
});

// Test Route
app.get('/', (req, res) => {
    res.write('Period Tracker Backend is Running Successfully 🌸');
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});