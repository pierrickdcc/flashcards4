import React from 'react';

const Stats = ({ stats }) => {
  const statItems = [
    { label: 'Total des cartes', value: stats.total, color: 'text-stat-value-total' },
    { label: 'À réviser', value: stats.toReview, color: 'text-stat-value-review' },
    { label: 'Matières', value: stats.subjects, color: 'text-stat-value-subjects' }
  ];

  return (
    <div className="bg-background-glass backdrop-blur-xl border border-border rounded-xl p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statItems.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <span className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;