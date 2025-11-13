
import React from 'react';

const Stats = ({ stats }) => {
  const statItems = [
    { label: 'Total', value: stats.total, color: 'text-blue-500' },
    { label: 'À réviser', value: stats.toReview, color: 'text-yellow-500' },
    { label: 'Matières', value: stats.subjects, color: 'text-green-500' }
  ];

  return (
    <div className="glass-card p-6 mb-6">
      <div className="stats-grid">
        {statItems.map((stat, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="text-sm font-medium opacity-70">{stat.label}</div>
            <div className={`text-3xl font-bold stat-value-${stat.label.toLowerCase()}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;
