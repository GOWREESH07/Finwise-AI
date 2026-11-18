import React, { useState, useEffect } from 'react';
import { getMarketData } from '../services/api';

function MarketSnapshot() {
    const [marketData, setMarketData] = useState([]);
    const [lastUpdated, setLastUpdated] = useState('just now');

    const fetchMarketData = async () => {
        try {
            const res = await getMarketData();
            setMarketData(res.data.data.market || []);
            setLastUpdated('just now');
        } catch (err) {
            console.error('Failed to fetch market data:', err);
        }
    };

    useEffect(() => {
        fetchMarketData();
        const interval = setInterval(fetchMarketData, 60000); // refresh every 60s
        return () => clearInterval(interval);
    }, []);

    // Update "just now" text relative to time
    useEffect(() => {
        const timeInterval = setInterval(() => {
            setLastUpdated(prev => {
                if (prev === 'just now') return '1 min ago';
                const mins = parseInt(prev.split(' ')[0]) || 0;
                return `${mins + 1} mins ago`;
            });
        }, 60000);
        return () => clearInterval(timeInterval);
    }, []);

    if (marketData.length === 0) {
        return (
            <div style={{
                background: 'linear-gradient(135deg, #111827, #1F2937)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20,
                padding: 24,
                marginBottom: 24
            }}>
                <div className="skeleton" style={{ height: 20, width: 120, marginBottom: 16 }}></div>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="skeleton" style={{ minWidth: 160, height: 100, borderRadius: 12 }}></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, #111827, #1F2937)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20,
            padding: 24,
            marginBottom: 24
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'Space Grotesk', color: '#F9FAFB' }}>📡 Live Market</h3>
                <span style={{ color: '#6B7280', fontSize: 12 }}>
                    🟢 Updated {lastUpdated}
                </span>
            </div>

            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                {marketData.map(stock => (
                    <div key={stock.symbol} style={{
                        minWidth: 160,
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${stock.change >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        borderRadius: 12,
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onClick={() => window.open(`https://finance.yahoo.com/quote/${stock.symbol}`, '_blank')}
                    >
                        <div style={{ color: '#9CA3AF', fontSize: 10, marginBottom: 4 }}>{stock.symbol}</div>
                        <div style={{ color: '#F9FAFB', fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 14 }}>
                            {stock.name}
                        </div>
                        <div style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color: '#F9FAFB', margin: '4px 0' }}>
                            ₹{stock.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                        <div style={{ color: stock.change >= 0 ? '#10B981' : '#EF4444', fontSize: 13, fontWeight: 600 }}>
                            {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent)?.toFixed(2)}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MarketSnapshot;
