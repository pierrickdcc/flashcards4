import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { useDataSync } from '../context/DataSyncContext';
import { LayoutGrid, List, Book, ClipboardList, BarChart3, X } from 'lucide-react';

const Filters = ({ view, setView }) => {
  const { subjects = [] } = useDataSync();
  const { selectedSubjects, setSelectedSubjects } = useUIState();

  const handleSubjectChange = (subjectId) => {
    if (subjectId === 'all') {
      setSelectedSubjects(['all']);
    } else {
      let newSelection = selectedSubjects.includes('all') ? [] : [...selectedSubjects];

      if (newSelection.includes(subjectId)) {
        newSelection = newSelection.filter(id => id !== subjectId);
      } else {
        newSelection.push(subjectId);
      }

      if (newSelection.length === 0) {
        setSelectedSubjects(['all']);
      } else {
        setSelectedSubjects(newSelection);
      }
    }
  };

  const viewOptions = [
    { id: 'dashboard', icon: BarChart3, label: 'Tableau de bord' },
    { id: 'courses', icon: Book, label: 'Cours' },
    { id: 'cards', icon: LayoutGrid, label: 'Cartes' },
    { id: 'table', icon: List, label: 'Tableau' },
    { id: 'memos', icon: ClipboardList, label: 'Mémos' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      {/* Subject Filters (simplified for the new UI) */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            className="accent-primary"
            checked={selectedSubjects.includes('all')}
            onChange={() => handleSubjectChange('all')}
          />
          Toutes les matières
        </label>
        {/* Simplified view, maybe a dropdown for subjects would be better in the future */}
      </div>

      {/* View Toggle */}
      <div className="flex items-center bg-white/5 border border-border rounded-lg p-1">
        {viewOptions.map(option => (
          <button
            key={option.id}
            onClick={() => setView(option.id)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
              view === option.id
                ? 'bg-primary/20 text-text-heading-color'
                : 'text-muted-foreground hover:text-text-heading-color'
            }`}
            title={option.label}
          >
            <option.icon size={16} />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Filters;
