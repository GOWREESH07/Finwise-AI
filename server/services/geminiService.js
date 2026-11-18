const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Use the correct model name
const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Calculate total income from primary and other sources
 */
function calculateTotalIncome(primaryIncome, otherIncome) {
  const primary = parseFloat(primaryIncome) || 0;
  const other = (otherIncome || []).reduce((sum, item) => {
    return sum + (parseFloat(item.amount) || 0);
  }, 0);
  return primary + other;
}

/**
 * Calculate total expenses from expense categories
 */
function calculateTotalExpenses(expenses) {
  if (!expenses || typeof expenses !== 'object') return 0;
  return Object.values(expenses).reduce((sum, val) => {
    return sum + (parseFloat(val) || 0);
  }, 0);
}

/**
 * Analyze user finances using Gemini AI
 */
async function analyzeFinances(user, profile) {
  // Calculate financial metrics first (always needed)
  const totalIncome = calculateTotalIncome(profile.primary_income, profile.other_income);
  const totalExpenses = calculateTotalExpenses(profile.expenses);
  const surplus = totalIncome - totalExpenses;

  try {
    // Build the prompt for Gemini
    const prompt = `You are a certified AI financial advisor and SEBI-registered stock market analyst specializing in Indian markets (NSE/BSE). 

Today's Date: ${new Date().toDateString()}

USER PROFILE:
- Name: ${user.name}
- Age: ${user.age || 'Not specified'}
- Profession: ${user.profession || 'Not specified'}
- Country: ${user.country || 'India'}
- Monthly Primary Income: ₹${profile.primary_income || 0}
- Other Income Sources: ${JSON.stringify(profile.other_income || [])}
- Total Monthly Income: ₹${totalIncome}
- Monthly Expenses: ${JSON.stringify(profile.expenses || {})}
- Total Monthly Expenses: ₹${totalExpenses}
- Monthly Surplus: ₹${surplus}
- Risk Appetite: ${profile.risk_appetite || 'medium'}
- Investment Horizon: ${profile.investment_horizon || 'long'}
- Interested In: ${(profile.investment_types || []).join(', ')}
- Monthly Investment Budget: ${profile.monthly_budget ? `₹${profile.monthly_budget}` : 'Decide an optimal budget dynamically based on their surplus and profile'}

YOUR JOB:
Analyze this person's complete financial profile and dynamically recommend the BEST specific investments available in India RIGHT NOW that suit them. 

STRICT RULES — NEVER BREAK THESE:

RULE 1 — NO GENERIC ADVICE EVER:
❌ WRONG: "Consider investing in large cap mutual funds"
✅ RIGHT: "Invest ₹3,000/month SIP in Mirae Asset Large Cap Fund - Direct Growth (3yr CAGR: 18.4%)"

❌ WRONG: "Buy some blue chip stocks"  
✅ RIGHT: "Buy 3 shares of Infosys Ltd (INFY.NS) at approx ₹1,820/share, expected 12-15% annual return"

❌ WRONG: "Government schemes are safe"
✅ RIGHT: "Deposit ₹5,000/month in PPF at SBI Bank (7.1% p.a., tax-free, Section 80C benefit)"

RULE 2 — EVERY INVESTMENT MUST HAVE:
- Exact full product name
- Ticker symbol or scheme code (where applicable)
- Current approximate price/NAV/rate
- Exact rupee amount to invest from their budget
- Expected return percentage per year
- Historical CAGR (1yr, 3yr, 5yr) where applicable
- Platform/app/bank to buy it from
- Why THIS specific product suits THIS specific user's age, income, and risk profile

RULE 3 — DYNAMICALLY PICK based on:
- Their AGE: younger = more equity, older = more debt/government
- Their RISK: decide the equity:debt:gold ratio dynamically
- Their PROFESSION: salaried = more SIPs, business owner = more tax-saving instruments
- Their SURPLUS: if surplus < ₹10,000 prioritize SIPs and PPF; if > ₹50,000 include direct stocks
- Their HORIZON: short = FDs/debt funds; long = equity/ELSS; pension = NPS/PPF; government = SGBs/schemes

RULE 4 — SPLIT THEIR INVESTMENT BUDGET ACROSS:
If a specific budget is provided: Split exactly ₹${profile.monthly_budget || 0}.
If NO budget is provided: Calculate and recommend an optimal monthly investment amount based on their ₹${surplus} surplus and financial goals, and split that amount.
Decide the best split dynamically for this user. Example categories to choose from (pick what fits):
- Direct NSE/BSE Stocks (specific company name + ticker)
- Mutual Fund SIPs (specific fund name + AMC + 3yr/5yr CAGR)
- ELSS Tax Saving Funds (if they need 80C benefit)
- PPF / NPS / SSY / SCSS / NSC (exact scheme + bank + rate)
- Fixed Deposits (specific bank name + tenure + current rate)
- Sovereign Gold Bonds (SGB) or Gold ETF (specific series/fund)
- REITs (if surplus > ₹25,000)
- Index Funds/ETFs (Nifty 50, Sensex ETF — specific fund name)
- Corporate Bonds / Debt Funds (if low risk)

RULE 5 — FOR STOCKS SPECIFICALLY:
- Name exactly 3-6 individual stocks to buy
- Give ticker symbol (e.g. RELIANCE.NS, TCS.NS)
- State approximate current price per share
- State how many shares they can buy with their stock budget
- Give 1-year and 3-year expected return %
- Give one-line reason why this stock suits them NOW

RULE 6 — FOR MUTUAL FUNDS SPECIFICALLY:
- Name the exact fund (e.g. "Quant Small Cap Fund - Direct Plan - Growth")
- Name the AMC (fund house)
- Give current NAV approximately
- Give 1yr, 3yr, 5yr CAGR %
- Give the exact SIP amount from the determined budget
- State the platform to invest (Groww / Zerodha Coin / MF Central / Paytm Money)

RULE 7 — WEALTH PROJECTIONS:
Calculate realistic projections of their total invested amount compounding over time:
- Assume their investment grows at the blended rate of their portfolio
- Show Year 1, Year 3, Year 5, Year 10 corpus value
- Show how much of that is their contribution vs returns earned

Return ONLY a valid raw JSON object. No markdown. No code blocks. No explanation. Just the JSON.

{
  "budget_analysis": {
    "total_income": number,
    "total_expenses": number,
    "monthly_surplus": number,
    "investable_surplus": number,
    "savings_rate_percent": number,
    "financial_health_score": number,
    "financial_health_label": "Excellent | Good | Fair | Needs Improvement | Critical",
    "summary": "2-3 sentence plain English summary of their financial situation"
  },

  "investment_strategy": {
    "strategy_name": "e.g. Aggressive Growth | Conservative Wealth Preservation | Balanced SIP Portfolio",
    "equity_percent": number,
    "debt_percent": number,
    "gold_percent": number,
    "alternate_percent": number,
    "rationale": "Why this split suits this specific user"
  },

  "monthly_allocation": [
    {
      "category": "Direct Stocks",
      "monthly_amount": number,
      "percent_of_budget": number,
      "investments": [
        {
          "name": "full company name",
          "ticker": "SYMBOL.NS or SYMBOL.BO",
          "sector": "e.g. Banking | IT | FMCG | Auto",
          "approx_current_price": "₹XXXX",
          "shares_you_can_buy": "X shares with allocated amount",
          "expected_1yr_return": "X-Y%",
          "expected_3yr_cagr": "X-Y%",
          "dividend_yield": "X%",
          "buy_via": "Zerodha / Groww / Upstox / Angel One",
          "why_for_this_user": "Specific reason tied to their age/risk/income"
        }
      ]
    },
    {
      "category": "Mutual Fund SIPs",
      "monthly_amount": number,
      "percent_of_budget": number,
      "investments": [
        {
          "name": "Exact Fund Name - Direct Plan - Growth",
          "amc": "Fund House Name",
          "fund_category": "Large Cap | Mid Cap | Small Cap | Flexi Cap | ELSS | Hybrid",
          "approx_nav": "₹XX",
          "sip_amount": number,
          "returns": {
            "1yr": "X%",
            "3yr_cagr": "X%",
            "5yr_cagr": "X%"
          },
          "risk_rating": "Low | Moderate | Moderately High | High",
          "invest_via": "Groww / Zerodha Coin / MF Central / Paytm Money",
          "why_for_this_user": "Specific reason tied to their profile"
        }
      ]
    },
    {
      "category": "Government Schemes",
      "monthly_amount": number,
      "percent_of_budget": number,
      "investments": [
        {
          "name": "Full Scheme Name",
          "scheme_type": "PPF | NPS | SSY | SCSS | NSC | PMVVY",
          "current_interest_rate": "X.X% p.a.",
          "lock_in_period": "X years",
          "tax_benefit": "Section 80C / 80CCD / Exempt",
          "min_monthly": "₹XXX",
          "max_annual": "₹X,XX,XXX",
          "your_monthly_contribution": number,
          "open_at": "SBI / Post Office / HDFC / Online at npstrust.org.in",
          "maturity_example": "₹X,XXX/month for X years = ₹XX Lakhs at maturity",
          "why_for_this_user": "Specific reason"
        }
      ]
    },
    {
      "category": "Fixed Deposits",
      "monthly_amount": number,
      "percent_of_budget": number,
      "investments": [
        {
          "name": "Bank/NBFC Name Fixed Deposit",
          "institution": "Bank or NBFC name",
          "current_rate": "X.XX% p.a.",
          "tenure": "X months / X years",
          "min_deposit": "₹X,XXX",
          "your_deposit_amount": number,
          "maturity_amount_example": "₹X,XXX becomes ₹X,XXX in X years",
          "is_insured": "Yes - up to ₹5L under DICGC",
          "open_at": "Bank branch / Net Banking / Groww / Stable Money app",
          "why_for_this_user": "Specific reason"
        }
      ]
    },
    {
      "category": "Gold",
      "monthly_amount": number,
      "percent_of_budget": number,
      "investments": [
        {
          "name": "Exact Gold Product Name",
          "type": "SGB | Gold ETF | Digital Gold",
          "current_rate_or_nav": "₹XXXX per gram / unit",
          "expected_return": "X-X% p.a. + price appreciation",
          "extra_benefit": "2.5% interest p.a. for SGB on issue price",
          "buy_via": "Zerodha / Groww / RBI Retail Direct / Bank",
          "why_for_this_user": "Specific reason"
        }
      ]
    }
  ],

  "projections": {
    "monthly_investment": number,
    "blended_expected_rate": "X.X%",
    "year1": {
      "corpus": number,
      "your_contribution": number,
      "returns_earned": number
    },
    "year3": {
      "corpus": number,
      "your_contribution": number,
      "returns_earned": number
    },
    "year5": {
      "corpus": number,
      "your_contribution": number,
      "returns_earned": number
    },
    "year10": {
      "corpus": number,
      "your_contribution": number,
      "returns_earned": number
    }
  },

  "tax_optimization": [
    {
      "section": "80C / 80CCD / 80D etc.",
      "instrument": "Exact product name",
      "max_deduction": "₹X,XX,XXX",
      "your_recommended_amount": number,
      "tax_saved_approx": "₹XX,XXX (at 20% slab)"
    }
  ],

  "emergency_fund": {
    "recommended_amount": number,
    "months_of_expenses": 6,
    "current_status": "Adequate | Build required | Critical",
    "where_to_keep": "Liquid Fund name OR High-interest savings account name e.g. IDFC First Bank Savings (7% p.a.)",
    "action": "specific step to build emergency fund"
  },

  "risk_warnings": [
    "Specific warning relevant to their portfolio"
  ],

  "this_week_action": {
    "step1": "Exact action e.g. Open Zerodha account at zerodha.com",
    "step2": "Exact action e.g. Start SIP of ₹3,000 in Parag Parikh Flexi Cap on Groww",
    "step3": "Exact action e.g. Visit SBI branch to open PPF account with ₹2,000/month"
  },

  "overall_financial_score": number,
  "score_breakdown": {
    "savings_rate": number,
    "investment_diversity": number,
    "emergency_fund": number,
    "debt_management": number,
    "tax_efficiency": number
  }
}`;

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    let analysis;
    try {
      // Try to parse the entire response as JSON
      analysis = JSON.parse(text);
    } catch (e) {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
        text.match(/```\s*([\s\S]*?)\s*```/) ||
        text.match(/{[\s\S]*}/);

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        analysis = JSON.parse(jsonStr);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    // Validate and ensure all required fields exist
    return validateAnalysis(analysis, totalIncome, totalExpenses, surplus, profile);

  } catch (error) {
    console.error('Gemini AI Analysis Error:', error);

    // Return fallback analysis if AI fails
    return generateFallbackAnalysis(user, profile, totalIncome, totalExpenses, surplus);
  }
}

/**
 * Validate and fill missing fields in AI analysis
 */
function validateAnalysis(analysis, totalIncome, totalExpenses, surplus, profile) {
  console.log("=== GEMINI RAW MONTHLY ALLOCATION ===");
  console.log(JSON.stringify(analysis.monthly_allocation, null, 2));
  console.log("=====================================");

  // Ensure AI values are valid - if AI returns 0 or invalid, use calculated values
  const aiBudget = analysis.budget_analysis || {};
  const validTotalIncome = (aiBudget.total_income > 0) ? aiBudget.total_income : totalIncome;
  const validTotalExpenses = (aiBudget.total_expenses > 0) ? aiBudget.total_expenses : totalExpenses;
  const validSurplus = (aiBudget.monthly_surplus !== undefined) ? aiBudget.monthly_surplus : surplus;

  // Determine the active budget to use for fallbacks
  const activeBudget = profile.monthly_budget ? parseFloat(profile.monthly_budget) : Math.max(0, validSurplus * 0.5);

  // Build allocation from AI response if available
  let allocation;
  if (analysis.monthly_allocation && analysis.monthly_allocation.length > 0) {
    // Preserve monthly_allocation intact for the new detailed UI
    let monthlyAllocation = [];
    if (analysis.monthly_allocation && Array.isArray(analysis.monthly_allocation)) {
      monthlyAllocation = analysis.monthly_allocation.map(cat => ({
        category: cat.category || cat.type || 'Other',
        monthly_amount: parseFloat(cat.monthly_amount) || parseFloat(cat.amount) || 0,
        percent_of_budget: cat.percent_of_budget || cat.percentage || 0,
        investments: Array.isArray(cat.investments) ? cat.investments : []
      }));
    } else {
      // Generate fallback allocation
      const defaultTotal = Math.max(0, validSurplus * 0.5);
      monthlyAllocation = [
        { category: 'Mutual Funds', monthly_amount: defaultTotal * 0.4, percentage: 40, investments: [] },
        { category: 'Fixed Deposits', monthly_amount: defaultTotal * 0.3, percentage: 30, investments: [] },
        { category: 'Stocks', monthly_amount: defaultTotal * 0.1, percentage: 10, investments: [] },
        { category: 'Emergency Fund', monthly_amount: defaultTotal * 0.2, percentage: 20, investments: [] }
      ];
    }

    // Preserve complex objects instead of converting them to strings for the new UI
    let thisWeekAction = analysis.this_week_action || 'Review your monthly expenses and identify areas to reduce spending';
    let riskWarnings = analysis.risk_warnings || ['Market volatility can affect returns', 'Inflation may erode purchasing power'];
    let taxOptimization = analysis.tax_optimization || [
      { section: "80C", instrument: "ELSS Mutual Funds", max_deduction: "₹1,50,000", tax_saved_approx: "₹46,800" }
    ];

    const defaultAnalysis = {
      budget_analysis: {
        total_income: validTotalIncome,
        total_expenses: validTotalExpenses,
        monthly_surplus: validSurplus,
        savings_rate: validTotalIncome > 0 ? ((validSurplus / validTotalIncome) * 100).toFixed(1) : 0,
        expense_breakdown: profile.expenses || {},
        financial_health_score: analysis.overall_financial_score || analysis.overall_score || 50,
        financial_health_label: aiBudget.financial_health_label || 'Fair'
      },
      investment_strategy: analysis.investment_strategy || {
        strategy_name: 'Balanced Growth',
        equity_percent: 60,
        debt_percent: 40,
        rationale: 'Balanced approach based on your profile'
      },
      monthly_allocation: monthlyAllocation,
      projections: analysis.projections || {
        year1: { corpus: validSurplus * 0.5 * 12 * 1.05, your_contribution: validSurplus * 0.5 * 12 },
        year3: { corpus: validSurplus * 0.5 * 36 * 1.15, your_contribution: validSurplus * 0.5 * 36 },
        year5: { corpus: validSurplus * 0.5 * 60 * 1.25, your_contribution: validSurplus * 0.5 * 60 },
        year10: { corpus: validSurplus * 0.5 * 120 * 1.5, your_contribution: validSurplus * 0.5 * 120 }
      },
      tax_optimization: taxOptimization,
      emergency_fund: analysis.emergency_fund || {
        recommended_amount: validTotalExpenses * 6,
        current_months_covered: validTotalExpenses > 0 ? (validSurplus / validTotalExpenses) : 0,
        target_months: 6,
        status: validSurplus >= validTotalExpenses ? 'adequate' : 'needs_attention',
        where_to_keep: 'Liquid Funds or High-yield Savings',
        action: 'Start diverting 20% of surplus to buildup your emergency layers.'
      },
      risk_warnings: riskWarnings,
      this_week_action: thisWeekAction,
      overall_financial_score: analysis.overall_financial_score || analysis.overall_score || 50
    };

    // Merge with defaults
    return {
      ...defaultAnalysis,
      ...analysis,
      budget_analysis: {
        ...defaultAnalysis.budget_analysis,
        ...(analysis.budget_analysis || {}),
        total_income: validTotalIncome,
        total_expenses: validTotalExpenses,
        monthly_surplus: validSurplus
      },
      monthly_allocation: monthlyAllocation,
      tax_optimization: taxOptimization,
      projections: defaultAnalysis.projections,
      emergency_fund: defaultAnalysis.emergency_fund,
      this_week_action: thisWeekAction,
      overall_financial_score: defaultAnalysis.overall_financial_score
    };
  }
}

/**
 * Get description for investment type
 */
function getInvestmentDescription(type) {
  const descriptions = {
    'Stocks': 'Direct equity investment',
    'Mutual Funds': 'Diversified equity exposure',
    'Fixed Deposits': 'Stable returns with low risk',
    'PPF': 'Long-term tax-free savings',
    'NPS': 'Retirement planning',
    'Gold': 'Hedge against inflation',
    'Real Estate': 'Property investment',
    'Cryptocurrency': 'High-risk digital assets',
    'Bonds': 'Fixed income securities',
    'Emergency Fund': 'Liquid savings for emergencies'
  };
  return descriptions[type] || 'Investment option';
}

/**
 * Generate fallback analysis when AI fails
 */
function generateFallbackAnalysis(user, profile, totalIncome, totalExpenses, surplus) {
  const activeBudget = profile.monthly_budget ? parseFloat(profile.monthly_budget) : Math.max(0, surplus * 0.5);

  const allocation = [
    { type: 'Emergency Fund', percentage: 20, amount: activeBudget * 0.2, description: 'Liquid savings for emergencies' },
    { type: 'Mutual Funds', percentage: 40, amount: activeBudget * 0.4, description: 'Diversified equity exposure' },
    { type: 'Fixed Deposits', percentage: 30, amount: activeBudget * 0.3, description: 'Stable returns with low risk' },
    { type: 'Stocks', percentage: 10, amount: activeBudget * 0.1, description: 'Direct equity investment' }
  ];

  return {
    budget_analysis: {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      monthly_surplus: surplus,
      savings_rate: totalIncome > 0 ? ((surplus / totalIncome) * 100).toFixed(1) : 0,
      expense_breakdown: profile.expenses || {},
      health_score: 50,
      health_label: surplus > 0 ? 'Good' : 'Needs Attention'
    },
    investment_plan: {
      recommended_monthly_investment: activeBudget,
      allocation: allocation,
      strategy_summary: 'Start with a balanced portfolio and gradually increase equity exposure'
    },
    recommendations: [
      {
        title: 'Create Emergency Fund',
        description: 'Build 6 months of expenses in a liquid fund or high-yield savings',
        risk_level: 'low',
        expected_return: '6-7% annually',
        time_horizon: 'Immediate'
      },
      {
        title: 'Start SIP in Index Funds',
        description: 'Invest in Nifty 50 or Sensex index funds for long-term wealth creation',
        risk_level: 'medium',
        expected_return: '12-15% annually',
        time_horizon: '5+ years'
      }
    ],
    projections: {
      year1: totalIncome * 12 + (surplus * 6),
      year3: totalIncome * 36 + (surplus * 18),
      year5: totalIncome * 60 + (surplus * 30),
      year10: totalIncome * 120 + (surplus * 60)
    },
    risk_warnings: [
      'Ensure adequate insurance coverage before investing',
      'Do not invest emergency funds in volatile assets'
    ],
    tax_tips: [
      'Maximize Section 80C benefits with ELSS and PPF',
      'Consider NPS for additional tax benefits under Section 80CCD'
    ],
    emergency_fund: {
      recommended_amount: totalExpenses * 6,
      current_months_covered: totalExpenses > 0 ? (surplus / totalExpenses) : 0,
      target_months: 6,
      status: surplus >= totalExpenses ? 'adequate' : 'needs_attention'
    },
    this_week_action: 'Set up automatic transfers to your savings account on salary day',
    overall_score: Math.min(100, Math.max(0, 50 + (surplus > 0 ? 20 : -20)))
  };
}

/**
 * Generate daily briefing content for email
 */
async function generateDailyBriefing(user, profile, marketData) {
  try {
    const totalIncome = calculateTotalIncome(profile.primary_income, profile.other_income);
    const totalExpenses = calculateTotalExpenses(profile.expenses);
    const surplus = totalIncome - totalExpenses;

    const prompt = `You are a friendly AI financial advisor. Create a brief, personalized daily financial briefing.

User: ${user.name}
Monthly Income: ₹${totalIncome}
Monthly Expenses: ₹${totalExpenses}
Surplus: ₹${surplus}
Risk Appetite: ${profile.risk_appetite}

Market Today: ${JSON.stringify(marketData?.slice(0, 3) || [])}

Generate a brief HTML email content with:
1. A personalized greeting
2. One market insight relevant to Indian investors
3. One actionable financial tip
4. One motivational quote about wealth/finance
5. Keep it under 200 words
6. Use simple HTML tags (<p>, <strong>, <em>)

Return only the HTML content, no markdown.`;

    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();

  } catch (error) {
    console.error('Daily Briefing Generation Error:', error);

    // Return fallback content
    return `
      <p>Good morning ${user.name},</p>
      <p>Here's your daily financial tip: <strong>Review your subscriptions today.</strong> 
      Cancel any services you haven't used in the last 30 days.</p>
      <p><em>"The best time to start investing was yesterday. The second best time is today."</em></p>
      <p>Have a prosperous day!</p>
    `;
  }
}

module.exports = {
  analyzeFinances,
  generateDailyBriefing
};
