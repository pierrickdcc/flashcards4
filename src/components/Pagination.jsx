
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages === 0) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="btn btn-icon disabled:opacity-50"
        aria-label="Previous Page"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-sm font-medium text-muted-foreground">
        Page {currentPage} sur {totalPages}
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="btn btn-icon disabled:opacity-50"
        aria-label="Next Page"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;
