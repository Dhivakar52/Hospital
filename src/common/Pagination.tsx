import React from "react";

interface PaginationTable {
  getState: () => { pagination: { pageIndex: number; pageSize: number } };
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  previousPage: () => void;
  nextPage: () => void;
  getCanPreviousPage: () => boolean;
  getCanNextPage: () => boolean;
}

interface PaginationProps {
  table: PaginationTable;
  totalCount: number;
}

const Pagination: React.FC<PaginationProps> = ({ table, totalCount }) => {
  if (!table) return null;

  const { pageIndex, pageSize } = table.getState().pagination;
  const currentPage = pageIndex + 1;
  const totalPages = Math.ceil(totalCount / pageSize) || 0;

  if (totalPages === 0) return null;

  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, totalCount);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    pages.push(1);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages.filter((page, index, arr) => arr.indexOf(page) === index);
  };

  const pages = getVisiblePages();

  return (
    <div className="flex items-center justify-between mt-4">
      {/* LEFT */}
      <div className="flex items-center gap-3 text-sm text-foreground">
        <div>
          Showing <b>{start}</b> to <b>{end}</b> of <b>{totalCount}</b>
        </div>

        <select
          value={pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
            table.setPageIndex(0);
          }}
          className="border border-border bg-background text-foreground px-2 py-1 rounded"
        >
          {[10, 25, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* RIGHT */}
      <div className="flex items-center">
        {/* Prev */}
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1 mx-1 rounded border border-border bg-background text-foreground hover:theme-color hover:border-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ‹
        </button>

        {/* Pages */}
        {pages.map((p, index) => {
          if (p === "...") {
            return (
              <span key={index} className="px-2 text-muted-foreground">
                ...
              </span>
            );
          }

          return (
            <button
              key={p}
              onClick={() => table.setPageIndex(Number(p) - 1)}
              className={`px-3 py-1 mx-1 rounded transition-colors ${
                p === currentPage
                  ? "theme-color"
                  : "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {p}
            </button>
          );
        })}

        {/* Next */}
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1 mx-1 rounded border border-border bg-background text-foreground hover:theme-color hover:border-transparent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default Pagination;
