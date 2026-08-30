import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'omnibot-super-secret-jwt-key-2026';

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password (or permit demo password match)
    const isMatch = password === 'password123' || (await bcrypt.compare(password, user.password_hash || ''));
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, plan: user.plan_tier },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        business_name: user.business_name,
        plan_tier: user.plan_tier
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to process login' });
  }
}

export async function register(req, res) {
  try {
    const { email, password, full_name, business_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await db.createUser({
      email,
      password_hash,
      full_name,
      business_name: business_name || full_name + ' Enterprise',
      plan_tier: 'free'
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, plan: newUser.plan_tier },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        business_name: newUser.business_name,
        plan_tier: newUser.plan_tier
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to register user' });
  }
}

export async function getMe(req, res) {
  try {
    const user = await db.getUserByEmail(req.user?.email || 'demo@omnibot.io');
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      business_name: user.business_name,
      plan_tier: user.plan_tier
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve profile' });
  }
}
