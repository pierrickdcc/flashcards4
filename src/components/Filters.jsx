import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { useDataSync } from '../context/DataSyncContext';
import { LayoutGrid, List, Play, BarChart3 } from 'lucide-react';

const Filters = ({ view, setView }) => {
  const { subjects = [] } = useDataSync();
  const {
    selectedSubjects,
    setSelectedSubjects,
  } = useUIState();

  const handleSubjectChange = (subjectName) => {
    if (subjectName === 'all') {
      setSelectedSubjects(['all']);
    } else {
      const newSelectedSubjects = selectedSubjects.includes('all')
        ? [subjectName]
        : selectedSubjects.includes(subjectName)
          ? selectedSubjects.filter((s) => s !== subjectName)
          : [...selectedSubjects, subjectName];

      if (newSelectedSubjects.length === 0) {
        setSelectedSubjects(['all']);
      } else {
        setSelectedSubjects(newSelectedSubjects);
      }
    }
  };

  return (
    <div className="filters">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedSubjects.includes('all')}
              onChange={() => handleSubjectChange('all')}
            />
            Toutes les matières
          </label>
          {subjects.map((subject) => (
            <label key={subject.id} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSubjects.includes(subject.name)}
                onChange={() => handleSubjectChange(subject.name)}
                disabled={selectedSubjects.includes('all')}
              />
              {subject.name}
            </label>
          ))}
        </div>

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
