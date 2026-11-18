const express = require('express');
const { db } = require('../db/database');
const { authenticateToken } = require('./auth');
const emailService = require('../services/emailService');

const router = express.Router();

/**
 * POST /api/email/subscribe
 * Subscribe user to daily emails
 */
router.post('/subscribe', authenticateToken, (req, res, next) => {
  try {
    const { userId } = req.user;

    const updatePref = db.prepare(`
      UPDATE email_preferences 
      SET subscribed = 1 
      WHERE user_id = ?
    `);
    
    updatePref.run(userId);

    res.json({
      success: true,
      message: 'Successfully subscribed to daily emails'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/email/unsubscribe
 * Unsubscribe user from daily emails
 */
router.post('/unsubscribe', authenticateToken, (req, res, next) => {
  try {
    const { userId } = req.user;

    const updatePref = db.prepare(`
      UPDATE email_preferences 
      SET subscribed = 0 
      WHERE user_id = ?
    `);
    
    updatePref.run(userId);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from daily emails'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/email/test
 * Send a test daily email immediately
 */
router.post('/test', authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.user;

    // Fetch user data
    const user = db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).get(userId);

    // Fetch financial profile
    const profile = db.prepare(`
      SELECT * FROM financial_profiles WHERE user_id = ?
    `).get(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Financial profile not found'
      });
    }

    // Parse JSON fields
    const parsedProfile = {
      ...profile,
      other_income: JSON.parse(profile.other_income || '[]'),
      expenses: JSON.parse(profile.expenses || '{}'),
      investment_types: JSON.parse(profile.investment_types || '[]')
    };

    // Fetch latest analysis
    const latestAnalysis = db.prepare(`
      SELECT analysis FROM ai_analyses 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `).get(userId);

    const analysis = latestAnalysis ? JSON.parse(latestAnalysis.analysis) : null;

    // Send test email
    const result = await emailService.sendDailyBriefing(user, parsedProfile, analysis);

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/email/status
 * Get email subscription status for user
 */
router.get('/status', authenticateToken, (req, res, next) => {
  try {
    const { userId } = req.user;

    const preferences = db.prepare(`
      SELECT subscribed, send_time, timezone 
      FROM email_preferences 
      WHERE user_id = ?
    `).get(userId);

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: 'Email preferences not found'
      });
    }

    res.json({
      success: true,
      data: { preferences }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
