import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Compact page list with ellipsis, e.g. 1 … 4 5 6 … 20 */
function pageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const visible = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const out: (number | 'ellipsis')[] = [];
  visible.forEach((p, i) => {
    if (i > 0 && p - visible[i - 1] > 1) out.push('ellipsis');
    out.push(p);
  });
  return out;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const base =
    'min-w-9 h-9 px-3 rounded-lg font-black text-sm transition-all flex items-center justify-center';

  return (
    <nav className="flex items-center gap-1" aria-label="ترقيم الصفحات">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="الصفحة السابقة"
        className={`${base} ${
          page <= 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-[#0f2f52] hover:bg-gray-100'
        }`}
      >
        <ChevronRight size={18} />
      </button>

      {pageNumbers(page, totalPages).map((item, i) =>
        item === 'ellipsis' ? (
          <span key={`e-${i}`} className="px-1 text-gray-400 font-black select-none">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`${base} ${
              item === page
                ? 'bg-[#0f2f52] text-white'
                : 'text-[#0f2f52] hover:bg-gray-100'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="الصفحة التالية"
        className={`${base} ${
          page >= totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-[#0f2f52] hover:bg-gray-100'
        }`}
      >
        <ChevronLeft size={18} />
      </button>
    </nav>
  );
}
