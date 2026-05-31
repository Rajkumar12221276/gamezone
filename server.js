const express    = require('express');
const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const cors       = require('cors');
const path       = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ HTML files serve karo
app.use(express.static(path.join(__dirname)));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ========== MONGODB CONNECT ==========
mongoose.connect('mongodb+srv://rajkumar2003sin_db_user:iUa3EmI1q6yaTyCS@cluster0.vkdmkut.mongodb.net/gamezone?appName=Cluster0')
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// ========== USER MODEL ==========
const UserSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  phone:       { type: String, required: true },
  password:    { type: String, required: true },
  highScore:   { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  device:      { type: String, default: 'Unknown' },
  browser:     { type: String, default: 'Unknown' },
  lastLogin:   { type: Date, default: Date.now },
  createdAt:   { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// ========== REGISTER ==========
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password, device, browser } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.json({ success: false, message: 'Email already registered!' });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, phone, password: hashed, device, browser });
    await user.save();
    res.json({ success: true, message: 'Account created!', user: { name, email } });
  } catch (err) {
    res.json({ success: false, message: 'Server error!' });
  }
});

// ========== LOGIN ==========
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, device, browser } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: 'Email not found!' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: 'Wrong password!' });
    user.lastLogin = new Date();
    user.device    = device || user.device;
    user.browser   = browser || user.browser;
    await user.save();
    res.json({ success: true, message: 'Login successful!', user: {
      name: user.name, email: user.email, highScore: user.highScore,
      gamesPlayed: user.gamesPlayed, createdAt: user.createdAt
    }});
  } catch (err) {
    res.json({ success: false, message: 'Server error!' });
  }
});

// ========== SAVE SCORE ==========
app.post('/api/score', async (req, res) => {
  try {
    const { email, score } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false });
    user.gamesPlayed += 1;
    if (score > user.highScore) user.highScore = score;
    await user.save();
    res.json({ success: true, highScore: user.highScore, gamesPlayed: user.gamesPlayed });
  } catch (err) {
    res.json({ success: false });
  }
});

// ========== ALL USERS ==========
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({ success: true, users });
  } catch (err) {
    res.json({ success: false });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('🚀 Server running on port ' + PORT);
});