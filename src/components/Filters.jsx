import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { useDataSync } from '../context/DataSyncContext';
import { LayoutGrid, List, Play, BarChart3 } from 'lucide-react';

const Filters = ({ view, setView }) => {
  const { subjects = [] } = useDataSync();
  const {
    selectedSubject,
    setSelectedSubject,
  } = useUIState();

  return (
    <div className="filters">
      <div className="flex items-center gap-4">
        <select
          className="select"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="all">Toutes les matières</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.name}>
              {subject.name}
            </option>
          ))}
        </select>

        <div className="view-toggle">
          <button onClick={() => setView('cards')} className={view === 'cards' ? 'active' : ''}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setView('table')} className={view === 'table' ? 'active' : ''}>
            <List size={18} />
          </button>
        </div>

        <button className="btn-secondary" disabled>
          <Play size={18} />
           Réviser (0)
        </button>

        <button className="btn-secondary" onClick={() => setView('dashboard')}>
          <BarChart3 size={18} />
           Tableau de bord
        </button>
      </div>
    </div>
  );
};

export default Filters;
