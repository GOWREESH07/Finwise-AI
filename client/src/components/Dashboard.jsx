import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLatestAnalysis, analyze, getProfile, updateProfile } from '../services/api';

// Premium Components
import ScoreRing from './ScoreRing';
import MarketSnapshot from './MarketSnapshot';
import ProjectionChart from './ProjectionChart';
import InvestmentCard from './InvestmentCard';

/**
 * Dashboard - Main financial dashboard with dark premium Bloomberg Terminal aesthetic
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [analysis, setAnalysis] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Edit modes
  const [editingBudget, setEditingBudget] = useState(false);
  const [editedBudget, setEditedBudget] = useState('');

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analysisRes, profileRes] = await Promise.all([
        getLatestAnalysis().catch(() => null),
        getProfile()
      ]);

      if (analysisRes) {
        setAnalysis(analysisRes.data.data.analysis.analysis);
      }
      setProfile(profileRes.data.data.profile);

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh analysis
  const handleRefreshAnalysis = async () => {
    try {
      setRefreshing(true);
      await analyze();
      const response = await getLatestAnalysis();
      setAnalysis(response.data.data.analysis.analysis);
      setSuccessMessage('Analysis refreshed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to refresh analysis');
    } finally {
      setRefreshing(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Start editing budget
  const startEditingBudget = () => {
    setEditedBudget(profile?.monthly_budget || '');
    setEditingBudget(true);
  };

  // Save budget
  const saveBudget = async () => {
    try {
      setLoading(true);
      await updateProfile({
        monthly_budget: editedBudget ? parseFloat(editedBudget) : 0
      });

      // Refresh profile and analysis
      await analyze();
      const [profileRes, analysisRes] = await Promise.all([
        getProfile(),
        getLatestAnalysis()
      ]);
      setProfile(profileRes.data.data.profile);
      setAnalysis(analysisRes.data.data.analysis.analysis);

      setEditingBudget(false);
      setSuccessMessage('Budget updated & analysis regenerated!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to update budget');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] text-white">
        <div className="text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-[#3B82F6] border-t-transparent rounded-full mb-4"></div>
          <p className="text-[#9CA3AF] font-['Space_Grotesk'] tracking-widest uppercase text-sm">Initializing Terminal</p>
        </div>
      </div>
    );
  }

  // Safely extract analysis components
  const budget = analysis?.budget_analysis || {};
  const emergency = analysis?.emergency_fund || {};

  // Top Stat Cards Data
  const statCards = [
    { label: 'Total Monthly Income', value: budget.total_income, prefix: '₹', color: '#3B82F6', icon: '💰', sub: '+steady income' },
    { label: 'Total Expenses', value: budget.total_expenses, prefix: '₹', color: '#EF4444', icon: '📊', sub: `${budget.savings_rate_percent || 0}% of income` },
    { label: 'Monthly Surplus', value: budget.monthly_surplus, prefix: '₹', color: '#10B981', icon: '📈', sub: 'Available to invest' },
    { label: 'Savings Rate', value: budget.savings_rate_percent, suffix: '%', color: '#8B5CF6', icon: '🎯', sub: 'Target: 20%+' }
  ];

  return (
    <div className="dashboard-wrapper">

      {/* Dark sticky navbar with blur */}
      <nav style={{
        background: 'rgba(10,15,30,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18
          }}>💹</div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 20, color: '#F9FAFB' }}>
            FinWise <span style={{ color: '#3B82F6' }}>AI</span>
          </span>
        </div>

        {/* Center: Welcome */}
        <span style={{ color: '#9CA3AF', fontSize: 14 }}>
          Welcome back, <span style={{ color: '#F9FAFB', fontWeight: 600 }}>{user?.name || 'Investor'}</span>
        </span>

        {/* Right: Score + Buttons */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <ScoreRing score={analysis?.overall_financial_score || 0} />
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" onClick={handleRefreshAnalysis} disabled={refreshing}>
              {refreshing ? '🔄 Syncing...' : '🔄 Refresh Analysis'}
            </button>
            <button className="btn-ghost" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="dashboard-container">

        {/* Notifications */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', padding: '12px 16px', borderRadius: 12, marginBottom: 24 }}>
            ⚠️ {error}
          </div>
        )}
        {successMessage && (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6EE7B7', padding: '12px 16px', borderRadius: 12, marginBottom: 24 }}>
            ✅ {successMessage}
          </div>
        )}

        {/* Market Ticker */}
        <MarketSnapshot />

        {/* Stat Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
          {statCards.map((card, i) => (
            <div key={i} className="hover-card" style={{
              background: 'linear-gradient(135deg, rgba(17,24,39,0.9), rgba(31,41,55,0.9))',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Top accent bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, ${card.color}, transparent)`
              }} />

              <div style={{ fontSize: 28 }}>{card.icon}</div>
              <div style={{ color: '#6B7280', fontSize: 13, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{card.label}</div>
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 32, fontWeight: 700,
                color: '#F9FAFB', margin: '4px 0 8px 0'
              }}>
                {card.prefix}{card.value?.toLocaleString('en-IN') || 0}{card.suffix}
              </div>
              <div style={{ color: card.color, fontSize: 13, background: `${card.color}15`, padding: '4px 8px', borderRadius: 6, display: 'inline-block' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Financial Wealth Projection */}
        <ProjectionChart analysis={analysis} />

        {/* Investment Portfolio AI Allocations */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
            <h2 className="section-title" style={{ margin: 0 }}>💼 Investment Portfolio</h2>

            {!editingBudget ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ color: '#9CA3AF', fontSize: 14 }}>
                  Monthly Investible Budget: <span style={{ color: '#F9FAFB', fontWeight: 600, fontFamily: 'Space Grotesk', fontSize: 16 }}>{profile?.monthly_budget ? `₹${profile.monthly_budget.toLocaleString()}` : 'AI Selected'}</span>
                </span>
                <button
                  onClick={startEditingBudget}
                  className="btn-ghost"
                  style={{ padding: '6px 12px', fontSize: 13 }}
                >
                  ✏️ Edit Budget
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="number"
                  value={editedBudget}
                  onChange={(e) => setEditedBudget(e.target.value)}
                  placeholder="Enter monthly budget..."
                  style={{
                    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#F9FAFB', padding: '8px 12px', borderRadius: 8, fontFamily: 'Space Grotesk',
                    outline: 'none'
                  }}
                />
                <button onClick={() => setEditingBudget(false)} className="btn-ghost" style={{ padding: '8px 16px' }}>Cancel</button>
                <button onClick={saveBudget} className="btn-primary" style={{ padding: '8px 16px' }}>Save Budget</button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {analysis?.monthly_allocation?.filter(c => c.monthly_amount > 0 || c.amount > 0).map((category, idx) => (
              <InvestmentCard key={idx} category={category} />
            ))}
          </div>
        </div>

        {/* Tax Tips and Risk Warnings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

          {/* Tax Tips */}
          <div className="hover-card" style={{ background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 20, padding: 24 }}>
            <h3 className="section-title" style={{ color: '#10B981' }}>💰 Tax Optimization</h3>
            {Array.isArray(analysis?.tax_optimization) ? analysis.tax_optimization.map((tip, i) => (
              <div key={i} style={{ marginBottom: 16, padding: 16, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: 12 }}>
                <div style={{ color: '#34D399', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{tip.section || tip}</div>
                {tip.instrument && <div style={{ color: '#F9FAFB', fontSize: 14, marginBottom: 8 }}>{tip.instrument}</div>}
                {tip.max_deduction && <div style={{ color: '#9CA3AF', fontSize: 13, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Max deduction: {tip.max_deduction}</span>
                  <span style={{ color: '#10B981', fontWeight: 600 }}>Save: {tip.tax_saved_approx || 'Calculable'}</span>
                </div>}
              </div>
            )) : (
              <div style={{ padding: 16, background: 'rgba(16,185,129,0.05)', borderRadius: 12, color: '#9CA3AF', fontSize: 14 }}>
                {analysis?.tax_tips?.map((t, i) => <div key={i} style={{ marginBottom: 8 }}>• {t}</div>) || "Optimal tax planning achieved."}
              </div>
            )}
          </div>

          {/* Risk Warnings */}
          <div className="hover-card" style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 20, padding: 24 }}>
            <h3 className="section-title" style={{ color: '#EF4444' }}>⚠️ Risk Warnings</h3>
            {analysis?.risk_warnings?.map((warn, i) => (
              <div key={i} style={{
                marginBottom: 12, padding: '16px', background: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.1)', borderRadius: 12,
                color: '#FCA5A5', fontSize: 14, display: 'flex', gap: 12, alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: 18, marginTop: -2 }}>🔴</span>
                <span>{warn}</span>
              </div>
            ))}
            {(!analysis?.risk_warnings || analysis.risk_warnings.length === 0) && (
              <div style={{ padding: 16, background: 'rgba(239,68,68,0.05)', borderRadius: 12, color: '#9CA3AF', fontSize: 14 }}>
                Portfolio risk is well within limits.
              </div>
            )}
          </div>
        </div>

        {/* This Week's Action & Emergency Fund */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, paddingBottom: 60 }}>

          {/* This Week's Action */}
          <div className="hover-card" style={{
            background: 'linear-gradient(135deg, rgba(30,58,95,0.6), rgba(30,27,75,0.6))',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 20, padding: 24
          }}>
            <h3 className="section-title" style={{ color: '#60A5FA' }}>🚀 This Week's Actions</h3>
            {analysis?.this_week_action ?
              (typeof analysis.this_week_action === 'string'
                ? <div style={{ color: '#E0E7FF', fontSize: 15, lineHeight: 1.6 }}>{analysis.this_week_action}</div>
                : Object.values(analysis.this_week_action).map((action, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-start' }}>
                    <div style={{
                      minWidth: 28, height: 28, borderRadius: '50%',
                      background: 'rgba(59,130,246,0.2)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700
                    }}>{i + 1}</div>
                    <span style={{ color: '#E0E7FF', fontSize: 15, lineHeight: 1.5, paddingTop: 2 }}>{action}</span>
                  </div>
                ))
              ) : <div style={{ color: '#9CA3AF' }}>Maintain current portfolio allocation.</div>
            }
          </div>

          {/* Emergency Fund */}
          <div className="hover-card" style={{
            background: 'linear-gradient(135deg, rgba(26,47,30,0.6), rgba(20,41,26,0.6))',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 20, padding: 24
          }}>
            <h3 className="section-title" style={{ color: '#34D399' }}>🛡️ Emergency Fund Snapshot</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <div>
                <div style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 4 }}>Recommended Target (6 Months)</div>
                <div style={{ color: '#F9FAFB', fontWeight: 700, fontFamily: 'Space Grotesk', fontSize: 24 }}>
                  ₹{(emergency.recommended_amount || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 4 }}>Current Coverage</div>
                <div style={{ color: '#34D399', fontWeight: 700, fontSize: 20 }}>
                  {(emergency.current_months_covered || 0).toFixed(1)} Months
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 99, height: 10, marginBottom: 20, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(((emergency.current_months_covered || 0) / 6) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #10B981, #34D399)',
                borderRadius: 99, height: '100%',
                transition: 'width 1.5s ease-in-out'
              }} />
            </div>

            <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', padding: 16, borderRadius: 12 }}>
              <div style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 6 }}>
                💡 Where to keep: <span style={{ color: '#E5E7EB', fontWeight: 500 }}>{emergency.where_to_keep || 'Liquid Funds / High Yield Savings'}</span>
              </div>
              <div style={{ color: '#6EE7B7', fontSize: 14 }}>
                {emergency.action || 'Keep bolstering your emergency funds until you hit 6 months of expenses.'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
