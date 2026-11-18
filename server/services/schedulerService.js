const cron = require('node-cron');
const { db } = require('../db/database');
const emailService = require('./emailService');

/**
 * Start the email scheduler
 * Runs daily at 8:00 AM IST
 */
function startScheduler() {
  console.log('📅 Starting email scheduler...');

  // Schedule: 0 8 * * * = At 8:00 AM every day
  // Timezone: Asia/Kolkata (IST)
  cron.schedule('0 8 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running daily email job...`);
    
    try {
      await sendDailyEmails();
    } catch (error) {
      console.error('Daily email job failed:', error);
    }
  }, {
    timezone: 'Asia/Kolkata',
    scheduled: true
  });

  console.log('✅ Email scheduler started - Daily emails at 8:00 AM IST');
}

/**
 * Send daily emails to all subscribed users
 */
async function sendDailyEmails() {
  try {
    // Get all subscribed users with their profiles
    const subscribedUsers = db.prepare(`
      SELECT 
        u.id, u.name, u.email,
        fp.primary_income, fp.other_income, fp.expenses,
        fp.risk_appetite, fp.investment_horizon, fp.investment_types,
        fp.monthly_budget
      FROM users u
      JOIN email_preferences ep ON u.id = ep.user_id
      LEFT JOIN financial_profiles fp ON u.id = fp.user_id
      WHERE ep.subscribed = 1
    `).all();

    console.log(`Found ${subscribedUsers.length} subscribed users`);

    if (subscribedUsers.length === 0) {
      console.log('No subscribed users found');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    // Send emails to each user
    for (const user of subscribedUsers) {
      try {
        // Parse JSON fields
        const profile = {
          primary_income: user.primary_income || 0,
          other_income: JSON.parse(user.other_income || '[]'),
          expenses: JSON.parse(user.expenses || '{}'),
          risk_appetite: user.risk_appetite || 'medium',
          investment_horizon: user.investment_horizon || 'long',
          investment_types: JSON.parse(user.investment_types || '[]'),
          monthly_budget: user.monthly_budget || 0
        };

        // Get latest analysis for user
        const latestAnalysis = db.prepare(`
          SELECT analysis FROM ai_analyses 
          WHERE user_id = ? 
          ORDER BY created_at DESC 
          LIMIT 1
        `).get(user.id);

        const analysis = latestAnalysis ? JSON.parse(latestAnalysis.analysis) : null;

        // Send email
        const result = await emailService.sendDailyBriefing(
          { id: user.id, name: user.name, email: user.email },
          profile,
          analysis
        );

        if (result.success) {
          successCount++;
        } else {
          failCount++;
          console.error(`Failed to send email to ${user.email}:`, result.error);
        }

        // Add small delay to avoid rate limiting
        await sleep(1000);

      } catch (userError) {
        failCount++;
        console.error(`Error processing user ${user.id}:`, userError.message);
      }
    }

    console.log(`📧 Daily email job completed: ${successCount} sent, ${failCount} failed`);

  } catch (error) {
    console.error('Send Daily Emails Error:', error);
    throw error;
  }
}

/**
 * Utility function to sleep for specified milliseconds
 * @param {Number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after ms milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Manually trigger daily emails (for testing)
 */
async function triggerDailyEmails() {
  console.log('🚀 Manually triggering daily emails...');
  await sendDailyEmails();
}

module.exports = {
  startScheduler,
  triggerDailyEmails
};
