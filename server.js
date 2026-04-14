const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

/* =========================
   🔐 SIMPLE ADMIN AUTH
========================= */
const ADMIN = {
  email: "admin@gmail.com",
  password: "12345"
};

// LOGIN API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN.email && password === ADMIN.password) {
    return res.json({ success: true, token: "admin123" });
  }

  res.status(401).json({ success: false, message: "Invalid credentials" });
});

/* =========================
   🗄️ MONGODB CONNECTION
========================= */
mongoose.connect('mongodb://127.0.0.1:27017/triptravvy')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* =========================
   📦 SCHEMA
========================= */
const enquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  destination: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);

/* =========================
   📩 SAVE ENQUIRY
========================= */
app.post('/api/enquiry', async (req, res) => {
  try {
    const newEnquiry = new Enquiry(req.body);
    await newEnquiry.save();
    res.json({ message: "Enquiry saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

/* =========================
   🔒 GET ENQUIRIES (PROTECTED)
========================= */
app.get('/api/enquiries', async (req, res) => {
  const token = req.headers.authorization;

  if (token !== "admin123") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const data = await Enquiry.find().sort({ date: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

/* =========================
   🗑️ DELETE ENQUIRY (PROTECTED)
========================= */
app.delete('/api/enquiry/:id', async (req, res) => {
  const token = req.headers.authorization;

  if (token !== "admin123") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

/* =========================
   🚀 START SERVER
========================= */
app.listen(5000, () => console.log("Server running on port 5000"));