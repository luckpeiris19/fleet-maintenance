const express = require('express');
const mongoose = require('mongoose');
const Maintenance = require('./models/Maintenance');
require('dotenv').config();

const app = express();

// ✅ Enable CORS for frontend communication
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    mongoose.connection.once('open', async () => {
      const dbName = mongoose.connection.name;
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('🧠 Connected to DB:', dbName);
      console.log('📂 Collections:', collections.map(c => c.name));
    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// === READ Routes ===

// ✅ GET all maintenance records
app.get('/api/maintenance', async (req, res) => {
  const data = await Maintenance.find();
  res.json(data);
});

// ✅ Search by registration (case-insensitive)
app.get('/api/maintenance/registration/:reg', async (req, res) => {
  const reg = req.params.reg.trim().toUpperCase();
  const data = await Maintenance.find({
    registration: { $regex: new RegExp(`^${reg}$`, 'i') }
  });
  res.json(data);
});

// ✅ Search by vehicle type (case-insensitive)
app.get('/api/maintenance/type/:vehicle_type', async (req, res) => {
  const type = req.params.vehicle_type.trim();
  const data = await Maintenance.find({
    vehicle_type: { $regex: new RegExp(`^${type}$`, 'i') }
  });
  res.json(data);
});

// ✅ Test endpoint
app.get('/test', async (req, res) => {
  const data = await Maintenance.find().limit(1);
  res.json(data);
});

// === CREATE ===
app.post('/api/maintenance', async (req, res) => {
  try {
    const newVehicle = new Maintenance(req.body);
    const saved = await newVehicle.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// === UPDATE ===
app.put('/api/maintenance/:registration', async (req, res) => {
    try {
      const reg = req.params.registration.trim().toUpperCase();
      console.log("🔧 PUT update for:", reg);
      console.log("📦 Payload:", req.body);  // LOG THIS
      console.log("🔧 Update payload:", req.body);

  
      const updated = await Maintenance.findOneAndUpdate(
        { registration: reg },
        req.body,
        { new: true }
      );
  
      if (!updated) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
  
      res.json(updated);
    } catch (err) {
      console.error("❌ PUT Error:", err); // LOG ERROR
      res.status(400).json({ error: err.message });
    }
  });
  

// === DELETE ===
app.delete('/api/maintenance/:registration', async (req, res) => {
  try {
    const reg = req.params.registration.trim().toUpperCase();
    const deleted = await Maintenance.findOneAndDelete({ registration: reg });
    if (!deleted) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json({ message: "Vehicle deleted", deleted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
