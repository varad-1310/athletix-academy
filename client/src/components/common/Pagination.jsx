import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        padding: '12px 0'
      }}
    >
      <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
        Showing page <strong style={{ color: 'var(--dark-text)' }}>{currentPage}</strong> of{' '}
        <strong style={{ color: 'var(--dark-text)' }}>{totalPages}</strong> ({totalItems} total records)
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          className="btn-secondary"
          style={{ padding: '6px 12px' }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} /> Prev
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) pageNum = i + 1;
          else if (currentPage <= 3) pageNum = i + 1;
          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
          else pageNum = currentPage - 2 + i;

          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              className={isActive ? 'btn-primary' : 'btn-secondary'}
              style={{
                width: 36,
                height: 36,
                padding: 0,
                borderRadius: 'var(--radius-md)'
              }}
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          className="btn-secondary"
          style={{ padding: '6px 12px' }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
