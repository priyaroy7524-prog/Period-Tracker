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

// MongoDB Connection 
const MONGO_URI = "mongodb+srv://priyaroy7524_db_user:Priya2003@cluster0.1xb9emn.mongodb.net/periodtracker?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Database Connected Successfully! 🎉"))
  .catch((err) => console.log("Database connection error:", err));

// --- API ROUTES ---

// 1. Get All History (Purani history fetch karne ke liye)
app.get('/api/cycles', async (req, res) => {
    try {
        const cycles = await Cycle.find().sort({ startDate: -1 });
        res.json(cycles);
    } catch (err) {
        res.status(500).json({ error: 'Server error while fetching history' });
    }
});

// 2. Add New Cycle Log (Naya entry save karne ke liye)
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
    res.send('Period Tracker Backend is Running Successfully 🌸');
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});