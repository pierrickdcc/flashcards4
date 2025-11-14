import React, { useMemo } from 'react';
import Masonry from 'react-masonry-css';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { Plus } from 'lucide-react';

const MemoCard = ({ memo, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`memo-card memo-${memo.color}`}
    >
      <p className="whitespace-pre-wrap">{memo.content}</p>
    </div>
  );
};

const MemoWall = ({ onMemoSelect }) => {
  const { memos } = useDataSync();
  const { setShowAddMemoModal } = useUIState();

  const sortedMemos = useMemo(() => {
    return [...(memos || [])].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [memos]);

  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    900: 2,
    600: 1
  };

  return (
    <div className="relative">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="memo-wall"
        columnClassName="memo-wall-column"
      >
        {sortedMemos.map((memo) => (
          <MemoCard key={memo.id} memo={memo} onClick={() => onMemoSelect(memo)} />
        ))}
      </Masonry>

      <button
        onClick={() => setShowAddMemoModal(true)}
        className="btn btn-primary btn-fab"
        title="Ajouter un mémo"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default MemoWall;
