const nodemailer = require('nodemailer');
const { db } = require('../db/database');
const geminiService = require('./geminiService');
const stockService = require('./stockService');

// Gmail SMTP configuration
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'FinWise AI Advisor';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  }
});

/**
 * Send daily briefing email to user
 * @param {Object} user - User data
 * @param {Object} profile - Financial profile
 * @param {Object} analysis - Latest AI analysis (optional)
 * @returns {Object} Result of email sending
 */
async function sendDailyBriefing(user, profile, analysis) {
  try {
    // Validate email configuration
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      throw new Error('Email configuration missing. Set GMAIL_USER and GMAIL_APP_PASSWORD');
    }

    // Get market data
    const marketData = await stockService.getMarketSummary();

    // Generate AI content for email
    const aiContent = await geminiService.generateDailyBriefing(user, profile, marketData);

    // Build HTML email
    const htmlContent = buildEmailHTML(user, aiContent, marketData, analysis);

    // Send email
    const info = await transporter.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${GMAIL_USER}>`,
      to: user.email,
      subject: `Your Daily Financial Briefing - ${new Date().toLocaleDateString('en-IN')}`,
      html: htmlContent
    });

    // Log to database
    logEmail(user.id, 'Daily Financial Briefing', 'sent');

    console.log(`✉️  Daily briefing sent to ${user.email}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('Email Sending Error:', error);
    
    // Log failure
    logEmail(user.id, 'Daily Financial Briefing', 'failed');
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send welcome email to new user
 * @param {Object} user - User data
 * @returns {Object} Result of email sending
 */
async function sendWelcomeEmail(user) {
  try {
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.warn('Email configuration missing, skipping welcome email');
      return { success: false, error: 'Email not configured' };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to FinWise AI!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Welcome to your personal AI-powered financial advisor! We're excited to help you on your journey to financial wellness.</p>
            
            <h3>🚀 Get Started in 3 Easy Steps:</h3>
            <ol>
              <li><strong>Complete Your Profile</strong> - Add your income and expenses</li>
              <li><strong>Get AI Analysis</strong> - Receive personalized financial insights</li>
              <li><strong>Track & Grow</strong> - Monitor your progress with daily updates</li>
            </ol>
            
            <p>Your financial future starts today. Let's build wealth together!</p>
            
            <a href="${process.env.CLIENT_URL}/dashboard" class="button">Go to Dashboard</a>
            
            <div class="footer">
              <p>You're receiving this because you signed up for FinWise AI.</p>
              <p>© ${new Date().getFullYear()} FinWise AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${GMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome to FinWise AI - Your Personal Financial Advisor',
      html: htmlContent
    });

    logEmail(user.id, 'Welcome Email', 'sent');

    console.log(`✉️  Welcome email sent to ${user.email}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('Welcome Email Error:', error);
    logEmail(user.id, 'Welcome Email', 'failed');
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Build HTML email content
 * @param {Object} user - User data
 * @param {String} aiContent - AI-generated content
 * @param {Array} marketData - Market data
 * @param {Object} analysis - Financial analysis
 * @returns {String} Complete HTML email
 */
function buildEmailHTML(user, aiContent, marketData, analysis) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format market data HTML
  const marketHTML = marketData.slice(0, 5).map(stock => `
    <div style="display: inline-block; margin: 10px; padding: 15px; background: ${stock.changePositive ? '#e8f5e9' : '#ffebee'}; border-radius: 8px; min-width: 120px; text-align: center;">
      <div style="font-weight: bold; font-size: 14px;">${stock.name}</div>
      <div style="font-size: 18px; margin: 5px 0;">₹${stock.price}</div>
      <div style="color: ${stock.changePositive ? '#2e7d32' : '#c62828'}; font-size: 12px;">
        ${stock.changePositive ? '▲' : '▼'} ${stock.change} (${stock.changePercent}%)
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .date { opacity: 0.9; margin-top: 10px; }
        .content { padding: 30px; }
        .section { margin-bottom: 25px; }
        .section-title { color: #667eea; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
        .market-section { text-align: center; }
        .ai-content { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .unsubscribe { color: #999; text-decoration: none; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
        .stat-label { font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 FinWise AI Daily Briefing</h1>
          <div class="date">${today}</div>
        </div>
        
        <div class="content">
          <div class="section">
            <div class="ai-content">
              ${aiContent}
            </div>
          </div>

          <div class="section market-section">
            <div class="section-title">📈 Market Snapshot</div>
            <div>${marketHTML}</div>
          </div>

          ${analysis ? `
          <div class="section">
            <div class="section-title">💰 Your Financial Health</div>
            <div class="stats">
              <div class="stat">
                <div class="stat-value">₹${analysis.budget_analysis?.total_income?.toLocaleString() || '0'}</div>
                <div class="stat-label">Monthly Income</div>
              </div>
              <div class="stat">
                <div class="stat-value">${analysis.budget_analysis?.savings_rate || '0'}%</div>
                <div class="stat-label">Savings Rate</div>
              </div>
              <div class="stat">
                <div class="stat-value">${analysis.overall_score || '0'}/100</div>
                <div class="stat-label">Health Score</div>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">🎯 This Week's Action</div>
            <p>${analysis?.this_week_action || 'Review your budget and track your expenses daily.'}</p>
          </div>
        </div>

        <div class="footer">
          <p>You're receiving this daily briefing because you're subscribed to FinWise AI.</p>
          <p><a href="${process.env.CLIENT_URL}/dashboard" class="unsubscribe">Manage Preferences</a> | 
             <a href="${process.env.CLIENT_URL}/dashboard" class="unsubscribe">Unsubscribe</a></p>
          <p>© ${new Date().getFullYear()} FinWise AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Log email to database
 * @param {Number} userId - User ID
 * @param {String} subject - Email subject
 * @param {String} status - sent or failed
 */
function logEmail(userId, subject, status) {
  try {
    const insertLog = db.prepare(`
      INSERT INTO email_logs (user_id, subject, status)
      VALUES (?, ?, ?)
    `);
    insertLog.run(userId, subject, status);
  } catch (error) {
    console.error('Email Logging Error:', error);
  }
}

module.exports = {
  sendDailyBriefing,
  sendWelcomeEmail
};
