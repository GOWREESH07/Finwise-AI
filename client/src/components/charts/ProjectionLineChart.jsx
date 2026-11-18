import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

/**
 * ProjectionLineChart - Displays wealth projection over time
 * Shows 1, 3, 5, and 10 year projections
 */
const ProjectionLineChart = ({ data }) => {
  // Format data for chart
  const chartData = [
    { year: 'Current', amount: 0 },
    { year: '1 Year', amount: data?.year1 || 0 },
    { year: '3 Years', amount: data?.year3 || 0 },
    { year: '5 Years', amount: data?.year5 || 0 },
    { year: '10 Years', amount: data?.year10 || 0 }
  ];

  // Format currency for tooltip
  const formatCurrency = (value) => {
    return `₹${(value / 100000).toFixed(1)}L`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-indigo-600">
            Projected Wealth: ₹{payload[0].value?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="year" 
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            name="Projected Wealth"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#4f46e5' }}
          />
        </LineChart>
      </ResponsiveContainer>
      
    </div>
  );
};

export default ProjectionLineChart;
