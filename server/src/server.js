import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
const port = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const publicUser = user => ({ id: user._id, name: user.name, email: user.email, createdAt: user.createdAt });
const signToken = user => jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated.' });
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(id);
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found.' });
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
  }
};

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields are required.' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    if (await User.exists({ email: email.toLowerCase().trim() })) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ success: true, message: 'Account created. Please sign in.', data: publicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to create account.', error: error.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required.' });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    res.json({ success: true, token: signToken(user), data: publicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to sign in.', error: error.message });
  }
});

app.get('/api/auth/me', auth, (req, res) => res.json({ success: true, data: publicUser(req.user) }));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/25070521259')
  .then(() => app.listen(port, () => console.log(`API listening on http://localhost:${port}`)))
  .catch((error) => { console.error('MongoDB connection failed:', error.message); process.exit(1); });
