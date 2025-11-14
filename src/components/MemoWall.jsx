import React, { useMemo } from 'react';
import Masonry from 'react-masonry-css';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { Plus } from 'lucide-react';

const MemoCard = ({ memo, onClick }) => {
  // Construct the class names for the memo card based on its color
  const bgColor = `bg-memo-${memo.color}-bg`;
  const borderColor = `border-memo-${memo.color}-border`;
  const textColor = `text-memo-${memo.color}-text`;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-transform hover:-translate-y-1 ${bgColor} ${borderColor} ${textColor}`}
    >
      <p className="text-sm whitespace-pre-wrap">{memo.content}</p>
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
      // Keep original order for memos with same pinned status
      return 0;
    });
  }, [memos]);

  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    900: 2,
    600: 1
  };

  return (
    <div>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid" // Defined in MemoWall.css
        columnClassName="my-masonry-grid_column" // Defined in MemoWall.css
      >
        {sortedMemos.map((memo) => (
          <MemoCard key={memo.id} memo={memo} onClick={() => onMemoSelect(memo)} />
        ))}
      </Masonry>

      <button
        onClick={() => setShowAddMemoModal(true)}
        className="btn-primary fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        title="Ajouter un mémo"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default MemoWall;
