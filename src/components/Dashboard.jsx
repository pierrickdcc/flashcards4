
import React, { useMemo } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const Dashboard = () => {
  const { cards, subjects } = useDataSync();

  const stats = useMemo(() => {
    if (!cards || cards.length === 0 || !subjects) {
      return null;
    }

    const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

    // 1. Review Forecast for the next 7 days
    const forecast = Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const day = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      const count = cards.filter(c => new Date(c.nextReview).toDateString() === date.toDateString()).length;
      return { day, a_reviser: count };
    });

    const toReviewToday = forecast[0].a_reviser;

    // 2. Strength by Subject (average interval)
    const strengthBySubject = (subjects || []).map(subject => {
      const subjectCards = cards.filter(c => c.subject_id === subject.id);
      if (subjectCards.length === 0) {
        return { name: subject.name, force: 0 };
      }
      const avgInterval = subjectCards.reduce((acc, c) => acc + (c.interval || 1), 0) / subjectCards.length;
      return { name: subject.name, force: Math.round(avgInterval * 10) / 10 };
    }).sort((a, b) => b.force - a.force);

    // 3. Card Distribution
    const cardDistribution = (subjects || []).map(subject => ({
      name: subject.name,
      value: cards.filter(c => c.subject_id === subject.id).length
    })).filter(s => s.value > 0);

    // 4. Difficult Cards
    const difficultCards = [...cards]
      .sort((a, b) => {
        const scoreA = (a.reviewCount || 0) / (a.interval || 1);
        const scoreB = (b.reviewCount || 0) / (b.interval || 1);
        return scoreB - scoreA; // Corrected the logic here
      })
      .slice(0, 5);

    return { forecast, toReviewToday, strengthBySubject, cardDistribution, difficultCards, subjectMap };
  }, [cards, subjects]);

  if (!stats) {
    return (
      <div className="text-center py-16 px-4 glass-card">
        <h2 className="text-2xl font-bold">Commencez à ajouter des cartes !</h2>
        <p className="opacity-70 mt-2">Le tableau de bord affichera vos statistiques une fois que vous aurez du contenu.</p>
      </div>
    );
  }

  const ChartContainer = ({ title, children }) => (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="space-y-8">
       <div className="stats-grid">
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-muted">Total des cartes</h3>
          <p className="text-3xl font-bold mt-2 stat-value-total">{cards.length}</p>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-muted">À réviser</h3>
          <p className="text-3xl font-bold mt-2 stat-value-à">{stats.toReviewToday}</p>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-muted">Matières</h3>
          <p className="text-3xl font-bold mt-2 stat-value-matières">{subjects?.length || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartContainer title="Prévisions de révision (7 prochains jours)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted-color)' }} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted-color)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--background-glass)',
                  borderColor: 'var(--border-color)'
                }}
              />
              <Legend />
              <Bar dataKey="a_reviser" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Force par matière (intervalle moyen en jours)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.strengthBySubject} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis type="number" tick={{ fill: 'var(--text-muted-color)' }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: 'var(--text-muted-color)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--background-glass)',
                  borderColor: 'var(--border-color)'
                }}
              />
              <Legend />
              <Bar dataKey="force" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Répartition des cartes">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.cardDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                {stats.cardDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--background-glass)',
                  borderColor: 'var(--border-color)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Cartes difficiles (Top 5)">
          <ul className="space-y-3">
            {stats.difficultCards.map(card => (
              <li key={card.id} className="flex justify-between items-center p-2 rounded-md" style={{ background: 'rgba(255, 255, 255, 0.05)'}}>
                <span className="text-sm font-medium">{card.question}</span>
                <span className="subject-badge text-xs">{stats.subjectMap.get(card.subject_id) || 'N/A'}</span>
              </li>
            ))}
          </ul>
        </ChartContainer>
      </div>
    </div>
  );
};

export default Dashboard;
