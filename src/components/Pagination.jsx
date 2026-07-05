export default function Pagination({ page, totalPages, totalElements, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-row">
      <span className="pagination-row__info">
        Page {page + 1} of {totalPages} · {totalElements} total
      </span>
      <div className="pagination-row__controls">
        <button
          className="btn btn--outline btn--sm"
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
        >
          ← Previous
        </button>
        <button
          className="btn btn--outline btn--sm"
          disabled={page >= totalPages - 1}
          onClick={() => onChange(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
