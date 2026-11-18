import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

/**
 * AllocationBarChart - Displays investment allocation as horizontal bar chart
 */
const AllocationBarChart = ({ data }) => {
  // Default data if none provided
  const defaultAllocation = [
    { type: 'Emergency Fund', amount: 0, description: 'Liquid savings' },
    { type: 'Mutual Funds', amount: 0, description: 'Equity exposure' },
    { type: 'Fixed Deposits', amount: 0, description: 'Stable returns' },
    { type: 'Stocks', amount: 0, description: 'Direct equity' }
  ];

  const allocationData = data && data.length > 0 ? data : defaultAllocation;

  // Colors for different investment types
  const COLORS = {
    'Emergency Fund': '#10b981',    // Green
    'Mutual Funds': '#6366f1',       // Indigo
    'Fixed Deposits': '#f59e0b',     // Amber
    'Stocks': '#ec4899',             // Pink
    'PPF': '#8b5cf6',                // Violet
    'NPS': '#06b6d4',                // Cyan
    'Gold': '#ffd700',               // Gold
    'Real Estate': '#ef4444',        // Red
    'Cryptocurrency': '#6b7280',     // Gray
    'Bonds': '#84cc16'               // Lime
  };

  // Filter out zero amounts and emergency fund (shown separately), format data
  const chartData = allocationData
    .filter(item => item.amount > 0 && item.type !== 'Emergency Fund')
    .map(item => ({
      name: item.type,
      amount: item.amount,
      description: item.description,
      color: COLORS[item.type] || '#6366f1'
    }));

  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No investment data available. Click "Edit Amounts" to add investments.</p>
      </div>
    );
  }

  // Calculate max amount for domain
  const maxAmount = Math.max(...chartData.map(d => d.amount));
  const domainMax = Math.ceil(maxAmount * 1.2 / 1000) * 1000;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">{data.description}</p>
          <p className="text-indigo-600 mt-1 font-medium">
            ₹{data.amount?.toLocaleString()}/month
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label formatter
  const renderLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width + 5}
        y={y + 12}
        fill="#374151"
        textAnchor="start"
        fontSize="11"
        fontWeight="500"
      >
        ₹{(value / 1000).toFixed(1)}K
      </text>
    );
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 60, left: 100, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis 
            type="number" 
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, domainMax]}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
          />
          <YAxis 
            type="category" 
            dataKey="name"
            stroke="#374151"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={95}
            interval={0}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar 
            dataKey="amount" 
            radius={[0, 4, 4, 0]}
            barSize={24}
            isAnimationActive={false}
          >
            <LabelList content={renderLabel} position="right" />
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationBarChart;
