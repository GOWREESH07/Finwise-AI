import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

/**
 * ExpensePieChart - Displays expense breakdown as a pie chart
 */
const ExpensePieChart = ({ data }) => {
  // Default data if none provided
  const defaultData = {
    housing: 0,
    food: 0,
    transport: 0,
    shopping: 0,
    entertainment: 0,
    healthcare: 0,
    education: 0,
    misc: 0
  };

  const expenseData = data || defaultData;

  // Colors for each category
  const COLORS = {
    housing: '#6366f1',      // Indigo
    food: '#10b981',         // Emerald
    transport: '#f59e0b',    // Amber
    shopping: '#ec4899',     // Pink
    entertainment: '#8b5cf6', // Violet
    healthcare: '#ef4444',    // Red
    education: '#06b6d4',    // Cyan
    misc: '#6b7280'          // Gray
  };

  // Format data for chart
  const chartData = Object.entries(expenseData)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: formatLabel(name),
      value: value,
      color: COLORS[name] || '#6b7280'
    }));

  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No expense data available
      </div>
    );
  }

  // Format label
  function formatLabel(key) {
    const labels = {
      housing: 'Housing',
      food: 'Food',
      transport: 'Transport',
      shopping: 'Shopping',
      entertainment: 'Entertainment',
      healthcare: 'Healthcare',
      education: 'Education',
      misc: 'Misc'
    };
    return labels[key] || key;
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-indigo-600">
            ₹{payload[0].value?.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            {((payload[0].value / getTotal()) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate total
  const getTotal = () => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Total Expenses */}
      <div className="text-center mt-2">
        <p className="text-sm text-gray-500">Total Expenses</p>
        <p className="text-xl font-bold text-gray-800">₹{getTotal().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ExpensePieChart;
