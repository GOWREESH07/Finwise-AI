import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

function InvestmentCard({ category }) {
    // Simple fake data for the mini trend line chart at the bottom
    const miniChartData = Array.from({ length: 10 }, (_, i) => ({ value: Math.random() * 50 + 50 + (i * 10) }));

    const getCategoryEmoji = (cat) => {
        const lcat = cat?.toLowerCase() || '';
        if (lcat.includes('stock')) return '📈';
        if (lcat.includes('mutual')) return '💜';
        if (lcat.includes('deposit') || lcat.includes('fd')) return '🏦';
        if (lcat.includes('gold')) return '🪙';
        if (lcat.includes('scheme') || lcat.includes('ppf')) return '🏛️';
        if (lcat.includes('emergency')) return '🛡️';
        if (lcat.includes('crypto')) return '₿';
        if (lcat.includes('estate') || lcat.includes('reit')) return '🏢';
        return '💰';
    };

    const renderInvestmentItem = (catName, inv) => {
        const lcat = catName?.toLowerCase() || '';

        // Direct Stocks
        if (lcat.includes('stock')) {
            return (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span className="ticker-badge">{inv.ticker || 'STOCK'}</span>
                            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: '#F9FAFB', fontSize: 16 }}>{inv.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
                            <span style={{ color: '#9CA3AF', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>{inv.sector || 'Equity'}</span>
                            <span style={{ color: '#6B7280' }}>via {inv.buy_via || 'Broker'}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', flex: '1 1 150px' }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color: '#F9FAFB' }}>{inv.approx_current_price}</div>
                        <div className="return-badge" style={{ display: 'inline-block', marginTop: 4 }}>{inv.expected_1yr_return} /yr</div>
                    </div>
                    <div style={{ width: '100%', color: '#3B82F6', fontSize: 13, background: 'rgba(59,130,246,0.08)', padding: '8px 12px', borderRadius: 8 }}>
                        💡 {inv.why_for_this_user || 'Recommended for your portfolio.'} ({inv.shares_you_can_buy || 'Buy fractions if available'})
                    </div>
                </div>
            );
        }

        // Mutual Funds
        if (lcat.includes('mutual') || lcat.includes('sip')) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: '#F9FAFB', fontSize: 16 }}>{inv.name}</div>
                            <div style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>{inv.amc || 'AMC'} • {inv.fund_category || 'Equity'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#8B5CF6', fontSize: 10, fontWeight: 700 }}>MONTHLY SIP</div>
                            <div style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color: '#F9FAFB' }}>₹{inv.sip_amount?.toLocaleString('en-IN') || category.monthly_amount}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#6B7280', fontSize: 11 }}>NAV</div>
                            <div style={{ color: '#E5E7EB', fontWeight: 600, fontSize: 13 }}>{inv.approx_nav || 'N/A'}</div>
                        </div>
                        <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#6B7280', fontSize: 11 }}>1Y Return</div>
                            <div style={{ color: '#10B981', fontWeight: 600, fontSize: 13 }}>{inv.returns?.['1yr'] || inv.expected_return || 'N/A'}</div>
                        </div>
                        <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#6B7280', fontSize: 11 }}>3Y CAGR</div>
                            <div style={{ color: '#10B981', fontWeight: 600, fontSize: 13 }}>{inv.returns?.['3yr_cagr'] || 'N/A'}</div>
                        </div>
                    </div>
                    <div style={{ color: '#9CA3AF', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Platform: <span style={{ color: '#E5E7EB' }}>{inv.invest_via || 'Groww/Coin'}</span></span>
                        {inv.why_for_this_user && <span style={{ color: '#8B5CF6' }}>💡 {inv.why_for_this_user}</span>}
                    </div>
                </div>
            );
        }

        // Fixed Deposits
        if (lcat.includes('deposit') || lcat.includes('fd')) {
            return (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: '#F9FAFB', fontSize: 16 }}>{inv.name}</div>
                        <div style={{ color: '#10B981', fontSize: 14, fontWeight: 600, marginTop: 4 }}>💰 {inv.current_rate || '6-7%'} p.a. for {inv.tenure || '1 year'}</div>
                        <div style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>Open at: {inv.open_at || 'Your Primary Bank'}</div>
                    </div>
                    <div style={{ flex: '1 1 200px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: 12, borderRadius: 8 }}>
                        <div style={{ color: '#10B981', fontSize: 13, marginBottom: 4 }}>🛡️ {inv.is_insured || 'DICGC Insured up to ₹5L'}</div>
                        <div style={{ color: '#E5E7EB', fontSize: 13 }}>📈 {inv.maturity_amount_example || 'Guaranteed Maturity Returns'}</div>
                    </div>
                </div>
            );
        }

        // Government Schemes / PPF / NPS
        if (lcat.includes('scheme') || lcat.includes('ppf') || lcat.includes('nps')) {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: '#F9FAFB', fontSize: 16 }}>{inv.name}</div>
                            <div style={{ color: '#F59E0B', fontSize: 14, fontWeight: 600, marginTop: 2 }}>🏦 {inv.current_interest_rate || inv.expected_return || '7.1%'} p.a.</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#F59E0B', fontSize: 10, fontWeight: 700 }}>CONTRIBUTION</div>
                            <div style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color: '#F9FAFB' }}>₹{inv.your_monthly_contribution || category.monthly_amount}</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8, fontSize: 13 }}>
                            <span style={{ color: '#9CA3AF' }}>Lock-in:</span> <span style={{ color: '#E5E7EB' }}>{inv.lock_in_period || '15 Years'}</span>
                        </div>
                        <div style={{ background: 'rgba(16,185,129,0.05)', padding: '8px 12px', borderRadius: 8, fontSize: 13, color: '#10B981' }}>
                            ✅ {inv.tax_benefit || 'Tax Exempt (EEE)'}
                        </div>
                    </div>
                    <div style={{ color: '#9CA3AF', fontSize: 13 }}>
                        📈 {inv.maturity_example || 'Compounded annually'} • Open at: {inv.open_at || 'Post Office / Bank'}
                    </div>
                </div>
            );
        }

        // Fallback display
        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: '#F9FAFB', fontSize: 16 }}>{inv.name || 'Investment Option'}</div>
                    <div style={{ color: '#9CA3AF', fontSize: 13, marginTop: 4 }}>{inv.why_for_this_user || inv.expected_return || 'Diversified asset allocation'}</div>
                </div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 16, fontWeight: 700, color: '#F9FAFB' }}>
                    ₹{inv.amount || inv.sip_amount || inv.monthly_amount || category.monthly_amount || 0}
                </div>
            </div>
        );
    };

    return (
        <div className="hover-card" style={{
            background: 'linear-gradient(135deg, rgba(17,24,39,0.95), rgba(31,41,55,0.95))',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: 24,
            marginBottom: 20,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative gradient blur in background */}
            <div style={{
                position: 'absolute', top: -50, right: -50, width: 150, height: 150,
                background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
                borderRadius: '50%', zIndex: 0, pointerEvents: 'none'
            }} />

            {/* Card top: category + monthly amount */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                    }}>
                        {getCategoryEmoji(category.category || category.type)}
                    </div>
                    <div>
                        <h3 style={{ fontFamily: 'Space Grotesk', color: '#F9FAFB', margin: 0, fontSize: 18 }}>
                            {category.category || category.type}
                        </h3>
                        <span style={{ color: '#9CA3AF', fontSize: 12 }}>
                            {category.investments?.length || 1} specific recommendations
                        </span>
                    </div>
                </div>
                <div style={{
                    background: 'rgba(59,130,246,0.1)',
                    border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: 12,
                    padding: '8px 16px',
                    textAlign: 'right'
                }}>
                    <div style={{ color: '#60A5FA', fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>MONTHLY</div>
                    <div style={{ fontFamily: 'Space Grotesk', color: '#F9FAFB', fontWeight: 700, fontSize: 18 }}>
                        ₹{(category.monthly_amount || category.amount || 0).toLocaleString('en-IN')}
                    </div>
                </div>
            </div>

            {/* Individual investment items */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {category.investments && category.investments.length > 0 ? (
                    category.investments.map((inv, i) => (
                        <div key={i} style={{
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.04)',
                            borderRadius: 14,
                            padding: '16px',
                            marginBottom: i < category.investments.length - 1 ? 12 : 16
                        }}>
                            {renderInvestmentItem(category.category || category.type, inv)}
                        </div>
                    ))
                ) : (
                    <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: 14,
                        padding: '16px',
                        marginBottom: 16,
                        color: '#9CA3AF',
                        fontSize: 14,
                        textAlign: 'center'
                    }}>
                        <p style={{ marginBottom: 4 }}>{category.description || 'AI optimal portfolio distribution'}</p>
                        <p style={{ fontSize: 12, color: '#6B7280' }}>Edit your budget or regenerate analysis for specific stock/fund picks.</p>
                    </div>
                )}
            </div>

            {/* Mini chart */}
            <div style={{ height: 60, opacity: 0.5, marginTop: 8 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={miniChartData}>
                        <YAxis domain={['auto', 'auto']} hide />
                        <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default InvestmentCard;
