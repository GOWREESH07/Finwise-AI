const express = require('express');
const { db } = require('../db/database');
const { authenticateToken } = require('./auth');
const geminiService = require('../services/geminiService');

const router = express.Router();

/**
 * POST /api/analyze
 * Generate new AI financial analysis for user
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { userId } = req.user;
    console.log('=== ANALYZE REQUEST ===');
    console.log('User ID:', userId);

    // Fetch user data
    const user = db.prepare(`
      SELECT id, name, email, age, profession, country 
      FROM users 
      WHERE id = ?
    `).get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Fetch financial profile
    const profile = db.prepare(`
      SELECT * FROM financial_profiles 
      WHERE user_id = ?
    `).get(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Financial profile not found'
      });
    }

    console.log('Raw profile from DB:', {
      primary_income: profile.primary_income,
      other_income: profile.other_income,
      expenses: profile.expenses
    });

    // Parse JSON fields
    const parsedProfile = {
      ...profile,
      other_income: JSON.parse(profile.other_income || '[]'),
      expenses: JSON.parse(profile.expenses || '{}'),
      investment_types: JSON.parse(profile.investment_types || '[]'),
      investment_allocations: JSON.parse(profile.investment_allocations || '[]')
    };

    console.log('Parsed profile:', {
      primary_income: parsedProfile.primary_income,
      other_income: parsedProfile.other_income,
      expenses: parsedProfile.expenses
    });

    // Call Gemini AI for analysis
    const analysis = await geminiService.analyzeFinances(user, parsedProfile);
    
    console.log('Analysis result - budget:', {
      total_income: analysis.budget_analysis?.total_income,
      total_expenses: analysis.budget_analysis?.total_expenses,
      monthly_surplus: analysis.budget_analysis?.monthly_surplus
    });

    // Save analysis to database
    const insertAnalysis = db.prepare(`
      INSERT INTO ai_analyses (user_id, analysis)
      VALUES (?, ?)
    `);
    
    insertAnalysis.run(userId, JSON.stringify(analysis));

    res.json({
      success: true,
      message: 'Analysis completed successfully',
      data: { analysis }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analyze/history
 * Get last 5 analyses for user
 */
router.get('/history', authenticateToken, (req, res, next) => {
  try {
    const { userId } = req.user;

    const analyses = db.prepare(`
      SELECT id, analysis, created_at 
      FROM ai_analyses 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `).all(userId);

    // Parse analysis JSON
    const parsedAnalyses = analyses.map(a => ({
      ...a,
      analysis: JSON.parse(a.analysis)
    }));

    res.json({
      success: true,
      data: { 
        analyses: parsedAnalyses,
        count: parsedAnalyses.length
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analyze/latest
 * Get most recent analysis for user
 */
router.get('/latest', authenticateToken, (req, res, next) => {
  try {
    const { userId } = req.user;

    const analysis = db.prepare(`
      SELECT id, analysis, created_at 
      FROM ai_analyses 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(userId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No analysis found. Please create one first.'
      });
    }

    res.json({
      success: true,
      data: { 
        analysis: {
          ...analysis,
          analysis: JSON.parse(analysis.analysis)
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
