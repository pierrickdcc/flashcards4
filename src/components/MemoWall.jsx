import React, { useState } from 'react';
import Masonry from 'react-masonry-css';
import Memo from './Memo';
import MemoModal from './MemoModal';
import { useDataSync } from '../context/DataSyncContext';
import { Plus } from 'lucide-react';
import './MemoWall.css';

const MemoWall = () => {
  const { memos, addMemo, updateMemoWithSync, deleteMemoWithSync } = useDataSync();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memoToEdit, setMemoToEdit] = useState(null);

  const handleOpenModal = (memo = null) => {
    setMemoToEdit(memo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setMemoToEdit(null);
    setIsModalOpen(false);
  };

  const handleSaveMemo = (memoData) => {
    if (memoToEdit) {
      updateMemoWithSync(memoToEdit.id, memoData);
    } else {
      addMemo(memoData);
    }
  };

  const sortedMemos = [...(memos || [])].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  });

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <div>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {sortedMemos.map((memo) => (
          <Memo key={memo.id} memo={memo} onClick={() => handleOpenModal(memo)} />
        ))}
      </Masonry>

      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-8 right-8 btn-primary btn-fab"
      >
        <Plus size={24} />
      </button>

      <MemoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveMemo}
        memoToEdit={memoToEdit}
        onDelete={deleteMemoWithSync}
      />
    </div>
  );
};

export default MemoWall;
