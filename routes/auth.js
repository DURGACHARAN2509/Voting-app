import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = express.Router();
const SALT_ROUNDS = 12;

// Admin creates client/user
router.post('/create-user', authenticate, requireAdmin, async (req, res) => {
  const { name, email, password, gender } = req.body;
  if (!email || !password) return res.status(400).send('Missing fields');
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).send('Email taken');
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = new User({ name, email, passwordHash: hash, gender, role: 'user' });
  await user.save();
  res.json({ message: 'User created' });
});

// Admin creates other admins (optional)
router.post('/create-admin', authenticate, requireAdmin, async (req, res) => {
  // similar to above with role: 'admin'
});

// Login (both admin and user)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, role: user.role });
});

export default router;
