import React from 'react';

const Memo = ({ memo, onClick }) => {
  // Définir un mappage de couleurs pour Tailwind CSS
  const colorVariants = {
    yellow: 'bg-yellow-200',
    blue: 'bg-blue-200',
    green: 'bg-green-200',
    pink: 'bg-pink-200',
    purple: 'bg-purple-200',
    gray: 'bg-gray-200',
  };

  const bgColor = colorVariants[memo.color] || 'bg-yellow-200';

  return (
    <div
      onClick={onClick}
      className={`memo-card p-4 rounded-lg shadow-md cursor-pointer h-full flex flex-col ${bgColor}`}
    >
      <p className="flex-grow">{memo.content}</p>
    </div>
  );
};

export default Memo;
