import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile, analyze } from '../services/api';

/**
 * OnboardingForm - 4-step wizard for user onboarding
 * Collects personal info, income, expenses, and investment preferences
 */
const OnboardingForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    age: '',
    profession: '',
    country: 'India',

    // Step 2: Income
    primary_income: '',
    other_income: [],

    // Step 3: Expenses
    expenses: {
      housing: 0,
      food: 0,
      transport: 0,
      shopping: 0,
      entertainment: 0,
      healthcare: 0,
      education: 0,
      misc: 0
    },

    // Step 4: Investment Preferences
    risk_appetite: 'medium',
    investment_horizon: 'long',
    investment_types: [],
    monthly_budget: ''
  });

  // Other income input state
  const [otherIncomeLabel, setOtherIncomeLabel] = useState('');
  const [otherIncomeAmount, setOtherIncomeAmount] = useState('');

  // Investment type options
  const investmentOptions = [
    'Stocks',
    'Mutual Funds',
    'Fixed Deposits',
    'PPF',
    'NPS',
    'Gold',
    'Real Estate',
    'Cryptocurrency',
    'Bonds'
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle expense changes
  const handleExpenseChange = (category, value) => {
    setFormData(prev => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        [category]: parseFloat(value) || 0
      }
    }));
  };

  // Add other income source
  const addOtherIncome = () => {
    if (otherIncomeLabel && otherIncomeAmount) {
      setFormData(prev => ({
        ...prev,
        other_income: [
          ...prev.other_income,
          { label: otherIncomeLabel, amount: parseFloat(otherIncomeAmount) }
        ]
      }));
      setOtherIncomeLabel('');
      setOtherIncomeAmount('');
    }
  };

  // Remove other income
  const removeOtherIncome = (index) => {
    setFormData(prev => ({
      ...prev,
      other_income: prev.other_income.filter((_, i) => i !== index)
    }));
  };

  // Toggle investment type
  const toggleInvestmentType = (type) => {
    setFormData(prev => ({
      ...prev,
      investment_types: prev.investment_types.includes(type)
        ? prev.investment_types.filter(t => t !== type)
        : [...prev.investment_types, type]
    }));
  };

  // Calculate total expenses
  const calculateTotalExpenses = () => {
    return Object.values(formData.expenses).reduce((sum, val) => sum + val, 0);
  };

  // Calculate total income
  const calculateTotalIncome = () => {
    const primary = parseFloat(formData.primary_income) || 0;
    const other = formData.other_income.reduce((sum, item) => sum + item.amount, 0);
    return primary + other;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    console.log('Starting form submission...');

    try {
      // Update profile
      console.log('Updating profile...', {
        primary_income: parseFloat(formData.primary_income) || 0,
        other_income: formData.other_income,
        expenses: formData.expenses,
        risk_appetite: formData.risk_appetite,
        investment_horizon: formData.investment_horizon,
        investment_types: formData.investment_types,
        monthly_budget: parseFloat(formData.monthly_budget) || 0
      });

      const profileResponse = await updateProfile({
        primary_income: parseFloat(formData.primary_income) || 0,
        other_income: formData.other_income,
        expenses: formData.expenses,
        risk_appetite: formData.risk_appetite,
        investment_horizon: formData.investment_horizon,
        investment_types: formData.investment_types,
        monthly_budget: parseFloat(formData.monthly_budget) || 0
      });
      console.log('Profile update response:', profileResponse);

      // Generate AI analysis
      console.log('Generating AI analysis...');
      const analysisResponse = await analyze();
      console.log('AI analysis response:', analysisResponse);

      // Navigate to dashboard
      console.log('Navigating to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      console.error('Form submission error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      setError(err.response?.data?.message || err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
      console.log('Form submission complete');
    }
  };

  // Render step 1: Personal Info
  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white">Personal Information</h2>
        <p className="text-gray-400 mt-1">Let's start with some basic details about your profile.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[#1F2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
          placeholder="Enter your age"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Profession</label>
        <input
          type="text"
          name="profession"
          value={formData.profession}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[#1F2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
          placeholder="e.g., Software Engineer, Doctor, Business Owner"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[#1F2937] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none appearance-none"
        >
          <option value="India" className="bg-[#1F2937]">India</option>
          <option value="USA" className="bg-[#1F2937]">USA</option>
          <option value="UK" className="bg-[#1F2937]">UK</option>
          <option value="Canada" className="bg-[#1F2937]">Canada</option>
          <option value="Australia" className="bg-[#1F2937]">Australia</option>
          <option value="Other" className="bg-[#1F2937]">Other</option>
        </select>
      </div>
    </div>
  );

  // Render step 2: Income
  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white">Income Streams</h2>
        <p className="text-gray-400 mt-1">Tell us about your monthly capital flow.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Primary Monthly Income (₹)</label>
        <input
          type="number"
          name="primary_income"
          value={formData.primary_income}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[#1F2937] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium"
          placeholder="e.g., 50000"
        />
      </div>

      <div className="bg-[#1F2937]/50 border border-gray-800 p-5 rounded-xl">
        <label className="block text-sm font-medium text-gray-300 mb-3">Additional Income Sources</label>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            value={otherIncomeLabel}
            onChange={(e) => setOtherIncomeLabel(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#0A0F1E] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
            placeholder="Source (e.g., Dividends)"
          />
          <div className="flex gap-3">
            <input
              type="number"
              value={otherIncomeAmount}
              onChange={(e) => setOtherIncomeAmount(e.target.value)}
              className="w-full sm:w-32 px-4 py-3 bg-[#0A0F1E] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
              placeholder="Amount"
            />
            <button
              onClick={addOtherIncome}
              className="px-6 py-3 bg-blue-600/20 text-blue-400 font-medium border border-blue-500/30 rounded-xl hover:bg-blue-600/30 transition-all"
            >
              Add
            </button>
          </div>
        </div>

        {formData.other_income.length > 0 && (
          <div className="space-y-2 mb-4">
            {formData.other_income.map((income, index) => (
              <div key={index} className="flex justify-between items-center bg-[#0A0F1E]/50 px-4 py-3 rounded-xl border border-white/5">
                <span className="text-gray-300">{income.label}: <span className="font-medium text-white">₹{income.amount.toLocaleString()}</span></span>
                <button
                  onClick={() => removeOtherIncome(index)}
                  className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Total Monthly Yield</span>
            <span className="text-xl font-display font-bold text-green-400">
              ₹{calculateTotalIncome().toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render step 3: Expenses
  const renderStep3 = () => {
    const expenseCategories = [
      { key: 'housing', label: 'Housing (Rent/EMI)' },
      { key: 'food', label: 'Food & Groceries' },
      { key: 'transport', label: 'Transportation' },
      { key: 'shopping', label: 'Shopping' },
      { key: 'entertainment', label: 'Entertainment' },
      { key: 'healthcare', label: 'Healthcare' },
      { key: 'education', label: 'Education' },
      { key: 'misc', label: 'Miscellaneous' }
    ];

    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Monthly Expenditure</h2>
          <p className="text-gray-400 mt-1">Estimate your monthly outflows to compute surplus.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expenseCategories.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">{label} (₹)</label>
              <input
                type="number"
                value={formData.expenses[key]}
                onChange={(e) => handleExpenseChange(key, e.target.value)}
                className="w-full px-4 py-3 bg-[#1F2937] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                placeholder="0"
              />
            </div>
          ))}
        </div>

        <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-xl mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Total Monthly Expenses</span>
            <span className="text-lg font-medium text-red-400">
              ₹{calculateTotalExpenses().toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-blue-500/10">
            <span className="text-gray-300 font-medium">Monthly Surplus (Investable)</span>
            <span className="text-xl font-display font-bold text-blue-400">
              ₹{(calculateTotalIncome() - calculateTotalExpenses()).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render step 4: Investment Preferences
  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-display font-bold text-white">Investment Strategy</h2>
        <p className="text-gray-400 mt-1">Configure your risk algorithm and macro-goals.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Risk Appetite</label>
        <div className="flex gap-3">
          {['low', 'medium', 'high'].map((risk) => (
            <button
              key={risk}
              onClick={() => setFormData(prev => ({ ...prev, risk_appetite: risk }))}
              className={`flex-1 py-3 px-4 rounded-xl border capitalize transition-all duration-200 font-medium ${formData.risk_appetite === risk
                ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] glow-ring'
                : 'border-gray-700 bg-[#1F2937]/50 text-gray-400 hover:border-gray-600'
                }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Investment Horizon</label>
        <select
          name="investment_horizon"
          value={formData.investment_horizon}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[#1F2937] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none appearance-none"
        >
          <option value="short" className="bg-[#1F2937]">Short Term (1-3 years)</option>
          <option value="long" className="bg-[#1F2937]">Long Term (5+ years)</option>
          <option value="pension" className="bg-[#1F2937]">Retirement/Pension</option>
          <option value="government" className="bg-[#1F2937]">Government Schemes</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Asset Classes</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {investmentOptions.map((type) => (
            <button
              key={type}
              onClick={() => toggleInvestmentType(type)}
              className={`py-2.5 px-3 rounded-xl border text-sm transition-all duration-200 ${formData.investment_types.includes(type)
                ? 'border-purple-500/50 bg-purple-500/10 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                : 'border-gray-700 bg-[#1F2937]/30 text-gray-400 hover:border-gray-600'
                }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Target Monthly SIP (₹)</label>
        <input
          type="number"
          name="monthly_budget"
          value={formData.monthly_budget}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-[#1F2937] border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
          placeholder="Leave blank for AI allocation"
        />
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Leave blank and the AI Engine will optimize allocation against your exact surplus.
        </p>
      </div>
    </div>
  );

  // Progress bar
  const renderProgress = () => (
    <div className="mb-10">
      <div className="flex justify-between mb-3 relative z-10">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${s < step ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50' :
              s === step ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border-none' :
                'bg-[#1F2937] text-gray-500 border border-gray-700'
              }`}
          >
            {s < step ? '✓' : s}
          </div>
        ))}
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden absolute top-[68px] left-12 right-12 mt-0.5 z-0">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.8)] relative"
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        >
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:1rem_1rem] animate-[stripes_1s_linear_infinite]" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center px-4 font-sans relative overflow-hidden py-12">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-full p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-white text-xl font-bold font-display">F</span>
        </div>
        <span className="text-xl font-display font-bold text-white tracking-tight">FinWise <span className="text-blue-400">AI</span></span>
      </div>

      <div className="absolute top-[20%] right-[10%] w-[30%] h-[40%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[30%] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-8 relative z-10">
        {renderProgress()}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="min-h-[350px]">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        <div className="flex justify-between mt-10 pt-6 border-t border-gray-800">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2.5 border border-gray-700 text-gray-300 rounded-xl hover:bg-white/5 transition-all font-medium"
            >
              Back
            </button>
          ) : <div></div>} {/* Empty div to maintain flex spacing */}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-8 py-2.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-600/40 hover:text-white transition-all font-medium glow-ring"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Compiling...
                </>
              ) : 'Initialize Dashboard'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;
