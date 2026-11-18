const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/database');

const router = express.Router();

// JWT Secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'finwise_jwt_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * JWT Authentication Middleware
 * Extracts token from Authorization header and verifies it
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * POST /api/auth/register
 * Register a new user with automatic profile creation
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, age, profession, country } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password, age, profession, country)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const userResult = insertUser.run(
      name,
      email,
      hashedPassword,
      age || null,
      profession || null,
      country || 'India'
    );

    const userId = userResult.lastInsertRowid;

    // Create default financial profile
    const insertProfile = db.prepare(`
      INSERT INTO financial_profiles (user_id)
      VALUES (?)
    `);
    insertProfile.run(userId);

    // Create email preferences (subscribed by default)
    const insertEmailPref = db.prepare(`
      INSERT INTO email_preferences (user_id, subscribed)
      VALUES (?, 1)
    `);
    insertEmailPref.run(userId);

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data (without password) and token
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: userId,
          name,
          email,
          age: age || null,
          profession: profession || null,
          country: country || 'India'
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = db.prepare(`
      SELECT id, name, email, password, age, profession, country 
      FROM users 
      WHERE email = ?
    `).get(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user data (without password) and token
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          age: user.age,
          profession: user.profession,
          country: user.country
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user data
 */
router.get('/me', authenticateToken, (req, res, next) => {
  try {
    const { userId } = req.user;

    const user = db.prepare(`
      SELECT id, name, email, age, profession, country, created_at
      FROM users
      WHERE id = ?
    `).get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
