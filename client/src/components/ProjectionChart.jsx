import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

function ProjectionChart({ analysis }) {
    if (!analysis?.projections || !analysis.projections.year1) return null;

    const projectionData = [
        { year: 'Year 1', corpus: analysis.projections.year1.corpus, contribution: analysis.projections.year1.your_contribution || (analysis.projections.year1.corpus * 0.9) },
        { year: 'Year 3', corpus: analysis.projections.year3.corpus, contribution: analysis.projections.year3.your_contribution || (analysis.projections.year3.corpus * 0.8) },
        { year: 'Year 5', corpus: analysis.projections.year5.corpus, contribution: analysis.projections.year5.your_contribution || (analysis.projections.year5.corpus * 0.7) },
        { year: 'Year 10', corpus: analysis.projections.year10.corpus, contribution: analysis.projections.year10.your_contribution || (analysis.projections.year10.corpus * 0.5) }
    ];

    return (
        <div style={{
            background: 'linear-gradient(135deg, #111827, #1F2937)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 20,
            padding: '24px 24px 8px 24px',
            marginBottom: 24
        }}>
            <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Space Grotesk', color: '#F9FAFB', margin: 0 }}>📈 Wealth Projection</h3>
                <span style={{ color: '#9CA3AF', fontSize: 13 }}>Estimated 10-year growth based on AI portfolio matching</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="contribGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="year" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6B7280" tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                        contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: '#F9FAFB' }}
                        itemStyle={{ color: '#E5E7EB', fontSize: 13 }}
                        formatter={(value, name) => [`₹${(value / 100000).toFixed(2)}L`, name]}
                        labelStyle={{ color: '#9CA3AF', marginBottom: 4 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 10, fontSize: 13, color: '#9CA3AF' }} />
                    <Area type="monotone" dataKey="corpus" name="Total Corpus" stroke="#3B82F6" fill="url(#corpusGrad)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#3B82F6' }} />
                    <Area type="monotone" dataKey="contribution" name="Your Contribution" stroke="#10B981" fill="url(#contribGrad)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default ProjectionChart;
