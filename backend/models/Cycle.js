const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
    userId: { type: String, required: true, default: "default_user" }, 
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    cycleLength: { type: Number, default: 28 }, 
    periodLength: { type: Number, default: 5 },  
    symptoms: [{ type: String }], 
    mood: { type: String },       
    notes: { type: String },      
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cycle', cycleSchema);