import React from 'react';

const EmptyState = ({ icon: Icon, title, message }) => {
  return (
    <div className="text-center py-12 px-4 glass-card">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
        {Icon && <Icon className="h-6 w-6 text-primary" />}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm opacity-70">{message}</p>
    </div>
  );
};

export default EmptyState;
