import { ChevronRight, ChevronLeft } from "lucide-react";
/**
 * PaginationControls — reusable sticky pagination bar.
 *
 * Props:
 *   page        {number}   current page (1-indexed)
 *   totalPages  {number}   total number of pages
 *   total       {number}   total record count (used for "Showing X – Y of Z" label)
 *   limit       {number}   records per page
 *   label       {string}   optional noun for the "Showing … of … <label>" text (default: "records")
 *   onChange    {Function} called with the new page number when the user navigates
 */
export default function PaginationControls({ page, totalPages, total, limit, label = 'records', onChange }) {
  if (!total || total === 0) return null;

  const MAX_VISIBLE = 5;
  const half = Math.floor(MAX_VISIBLE / 2);
  let start = Math.max(1, page - half);
  let end = start + MAX_VISIBLE - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - MAX_VISIBLE + 1);
  }
  const pageRange = Array.from({ length: end - start + 1 }, (_, idx) => start + idx);

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="sticky bottom-0 z-10 px-6 py-4 bg-grey-50 border-t border-grey-200 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-grey-600">
        Showing {from} to {to} of {total} {label}
      </p>

      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-7 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg border border-grey-200 text-grey-600 hover:bg-grey-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed mr-1 font-semibold"
          title="Previous Page"
        >
          <ChevronLeft size={16}/>
        </button>

        {/* First page + ellipsis */}
        {start > 1 && (
          <>
            <button
              onClick={() => onChange(1)}
              className="w-7 h-7 md:w-9 md:h-9 rounded-lg border border-grey-200 text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer text-grey-600 hover:bg-grey-100"
            >
              1
            </button>
            {start > 2 && <span className="text-grey-400 font-bold px-1">…</span>}
          </>
        )}

        {/* Page range */}
        {pageRange.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onChange(pageNum)}
            className={`w-7 h-7 md:w-9 md:h-9 rounded-lg border text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer ${
              pageNum === page
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'border-grey-200 text-grey-600 hover:bg-grey-100'
            }`}
          >
            {pageNum}
          </button>
        ))}

        {/* Last page + ellipsis */}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-grey-400 font-bold px-1">…</span>}
            <button
              onClick={() => onChange(totalPages)}
              className="w-7 h-7 md:w-9 md:h-9 rounded-lg border border-grey-200 text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer text-grey-600 hover:bg-grey-100"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next */}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="w-7 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg border border-grey-200 text-grey-600 hover:bg-grey-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed ml-1 font-semibold"
          title="Next Page"
        >
          <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  );
}
