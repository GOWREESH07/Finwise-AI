import React from 'react';

function ScoreRing({ score }) {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;
    const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
    const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                <circle
                    cx="25" cy="25" r={radius} fill="none"
                    stroke={color} strokeWidth="4"
                    strokeDasharray={`${progress} ${circumference}`}
                    strokeLinecap="round"
                    transform="rotate(-90 25 25)"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                />
                <text x="25" y="29" textAnchor="middle" fill={color} fontSize="11" fontWeight="700">
                    {score}
                </text>
            </svg>
            <div>
                <div style={{ color, fontSize: 12, fontWeight: 600 }}>{label}</div>
                <div style={{ color: '#6B7280', fontSize: 10 }}>Score</div>
            </div>
        </div>
    );
}

export default ScoreRing;
