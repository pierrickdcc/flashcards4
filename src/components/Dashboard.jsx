import React, { useMemo } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext'; // To open memos
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Pin } from 'lucide-react';

// Consistent and accessible colors for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

const ChartContainer = ({ title, children }) => (
  <div className="bg-background-glass border border-border rounded-xl p-6 h-full flex flex-col">
    <h3 className="text-md font-semibold text-text-heading-color mb-4">{title}</h3>
    <div className="flex-grow">
      {children}
    </div>
  </div>
);

const Dashboard = () => {
  const { cards, subjects, memos } = useDataSync();
  const { setShowAddMemoModal, setEditingMemo } = useUIState(); // Assuming these exist

  const stats = useMemo(() => {
    if (!cards || !subjects || !memos) return null;

    const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

    // 1. Review Forecast (7 days)
    const forecast = Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setHours(5, 0, 0, 0);
      date.setDate(date.getDate() + i);
      const day = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      const count = cards.filter(c => {
        if (!c.nextReview) return false;
        const reviewDate = new Date(c.nextReview);
        reviewDate.setHours(5, 0, 0, 0);
        return reviewDate.toDateString() === date.toDateString();
      }).length;
      return { day, à_réviser: count };
    });

    // 2. Strength by Subject (average interval)
    const strengthBySubject = subjects.map(subject => {
      const subjectCards = cards.filter(c => c.subject_id === subject.id);
      const avgInterval = subjectCards.length > 0
        ? subjectCards.reduce((acc, c) => acc + (c.interval || 0), 0) / subjectCards.length
        : 0;
      return { name: subject.name, force: Math.round(avgInterval) };
    }).sort((a, b) => b.force - a.force);

    // 3. Card Distribution
    const cardDistribution = subjects.map(subject => ({
      name: subject.name,
      value: cards.filter(c => c.subject_id === subject.id).length
    })).filter(s => s.value > 0);

    // 4. Difficult Cards (low ease factor)
    const difficultCards = [...cards]
      .filter(c => c.easeFactor)
      .sort((a, b) => (a.easeFactor || 2.5) - (b.easeFactor || 2.5))
      .slice(0, 5);

    // 5. Pinned Memos
    const pinnedMemos = memos.filter(memo => memo.isPinned).slice(0, 3); // Show max 3

    return { forecast, strengthBySubject, cardDistribution, difficultCards, pinnedMemos, subjectMap };
  }, [cards, subjects, memos]);

  if (!stats) {
    return (
      <div className="text-center py-16 px-4 bg-background-glass border border-border rounded-xl">
        <h2 className="text-2xl font-bold">Commencez à ajouter du contenu !</h2>
        <p className="text-muted-foreground mt-2">Le tableau de bord affichera vos stats une fois que vous aurez des cartes et des mémos.</p>
      </div>
    );
  }

  const handleMemoClick = (memo) => {
    setEditingMemo(memo); // Function to be added in context
    setShowAddMemoModal(true);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <ChartContainer title="Prévisions de révision (7 jours)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.forecast} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted-color)', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted-color)', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                contentStyle={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', borderRadius: '0.5rem' }}
              />
              <Bar dataKey="à_réviser" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ChartContainer title="Force par matière (Intervalle moyen)">
           <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.strengthBySubject} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted-color)', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted-color)', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                contentStyle={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', borderRadius: '0.5rem' }}
              />
              <Bar dataKey="force" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {stats.pinnedMemos.length > 0 && (
          <ChartContainer title="Mémos Épinglés">
            <div className="space-y-3">
              {stats.pinnedMemos.map(memo => (
                <div key={memo.id} onClick={() => handleMemoClick(memo)} className={`p-3 rounded-lg border cursor-pointer hover:border-${memo.color}-border/80`} style={{ background: `var(--memo-${memo.color}-bg)`, borderColor: `var(--memo-${memo.color}-border)`}}>
                  <p className="text-sm line-clamp-3" style={{ color: `var(--memo-${memo.color}-text)` }}>{memo.content}</p>
                </div>
              ))}
            </div>
          </ChartContainer>
        )}
        <ChartContainer title="Cartes Difficiles (Top 5)">
          <div className="space-y-2">
            {stats.difficultCards.map(card => (
              <div key={card.id} className="p-2 bg-white/5 rounded-md text-sm flex justify-between items-center">
                <span className="truncate pr-4">{card.question}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary whitespace-nowrap">{stats.subjectMap.get(card.subject_id)}</span>
              </div>
            ))}
          </div>
        </ChartContainer>
         <ChartContainer title="Répartition des cartes">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.cardDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                {stats.cardDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                 contentStyle={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)', borderRadius: '0.5rem' }}
              />
              <Legend iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default Dashboard;