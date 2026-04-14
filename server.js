const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

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

  res.status(401).json({ success: false });
});

/* =========================
   🗄️ MONGODB CONNECTION
========================= */
mongoose.connect(process.env.MONGO_URI)
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
    res.json({ message: "Enquiry saved" });
  } catch (error) {
    res.status(500).json({ error: "Error" });
  }
});

/* =========================
   🔒 GET ENQUIRIES
========================= */
app.get('/api/enquiries', async (req, res) => {
  if (req.headers.authorization !== "admin123") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const data = await Enquiry.find().sort({ date: -1 });
  res.json(data);
});

/* =========================
   🗑️ DELETE
========================= */
app.delete('/api/enquiry/:id', async (req, res) => {
  if (req.headers.authorization !== "admin123") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  await Enquiry.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* =========================
   🚀 START SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));