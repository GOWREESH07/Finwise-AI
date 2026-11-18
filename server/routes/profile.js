const express = require('express');
const { db } = require('../db/database');
const { authenticateToken } = require('./auth');

const router = express.Router();

/**
 * GET /api/profile
 * Fetch financial profile for authenticated user
 */
router.get('/', authenticateToken, (req, res, next) => {
  try {
    const { userId } = req.user;

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
      investment_types: JSON.parse(profile.investment_types || '[]'),
      investment_allocations: JSON.parse(profile.investment_allocations || '[]')
    };

    res.json({
      success: true,
      data: { profile: parsedProfile }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/profile
 * Update financial profile for authenticated user
 */
router.put('/', authenticateToken, (req, res, next) => {
  try {
    const { userId } = req.user;
    const {
      primary_income,
      other_income,
      expenses,
      risk_appetite,
      investment_horizon,
      investment_types,
      investment_allocations,
      monthly_budget
    } = req.body;

    // Get existing profile to preserve values not being updated
    const existingProfile = db.prepare(`
      SELECT * FROM financial_profiles WHERE user_id = ?
    `).get(userId);

    // Use existing values as defaults, only update provided fields
    const finalPrimaryIncome = primary_income !== undefined ? primary_income : (existingProfile?.primary_income || 0);
    const finalOtherIncome = other_income !== undefined ? other_income : JSON.parse(existingProfile?.other_income || '[]');
    const finalExpenses = expenses !== undefined ? expenses : JSON.parse(existingProfile?.expenses || '{}');
    const finalRiskAppetite = risk_appetite !== undefined ? risk_appetite : (existingProfile?.risk_appetite || 'medium');
    const finalInvestmentHorizon = investment_horizon !== undefined ? investment_horizon : (existingProfile?.investment_horizon || 'long');
    const finalInvestmentTypes = investment_types !== undefined ? investment_types : JSON.parse(existingProfile?.investment_types || '[]');
    const finalInvestmentAllocations = investment_allocations !== undefined ? investment_allocations : JSON.parse(existingProfile?.investment_allocations || '[]');
    const finalMonthlyBudget = monthly_budget !== undefined ? monthly_budget : (existingProfile?.monthly_budget || 0);

    // Stringify JSON fields
    const otherIncomeJson = JSON.stringify(finalOtherIncome);
    const expensesJson = JSON.stringify(finalExpenses);
    const investmentTypesJson = JSON.stringify(finalInvestmentTypes);
    const investmentAllocationsJson = JSON.stringify(finalInvestmentAllocations);

    if (existingProfile) {
      // Update existing profile
      const updateProfile = db.prepare(`
        UPDATE financial_profiles SET
          primary_income = ?,
          other_income = ?,
          expenses = ?,
          risk_appetite = ?,
          investment_horizon = ?,
          investment_types = ?,
          investment_allocations = ?,
          monthly_budget = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);

      updateProfile.run(
        finalPrimaryIncome,
        otherIncomeJson,
        expensesJson,
        finalRiskAppetite,
        finalInvestmentHorizon,
        investmentTypesJson,
        investmentAllocationsJson,
        finalMonthlyBudget,
        userId
      );
    } else {
      // Profile doesn't exist, create it
      const insertProfile = db.prepare(`
        INSERT INTO financial_profiles (
          user_id, primary_income, other_income, expenses,
          risk_appetite, investment_horizon, investment_types, investment_allocations, monthly_budget
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertProfile.run(
        userId,
        finalPrimaryIncome,
        otherIncomeJson,
        expensesJson,
        finalRiskAppetite,
        finalInvestmentHorizon,
        investmentTypesJson,
        investmentAllocationsJson,
        finalMonthlyBudget
      );
    }

    // Fetch and return updated profile
    const updatedProfile = db.prepare(`
      SELECT * FROM financial_profiles WHERE user_id = ?
    `).get(userId);

    const parsedProfile = {
      ...updatedProfile,
      other_income: JSON.parse(updatedProfile.other_income || '[]'),
      expenses: JSON.parse(updatedProfile.expenses || '{}'),
      investment_types: JSON.parse(updatedProfile.investment_types || '[]'),
      investment_allocations: JSON.parse(updatedProfile.investment_allocations || '[]')
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { profile: parsedProfile }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
