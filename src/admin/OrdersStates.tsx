import { Inbox, RefreshCw, TriangleAlert } from 'lucide-react';

/**
 * The three explicit non-table states of the admin orders section:
 *   loading  → skeleton (mirrors the real table's columns so nothing shifts)
 *   empty    → `OrdersEmpty` (distinguishes "no orders" from "filter empty")
 *   error    → `OrdersError`
 * The success table is rendered by `OrdersPage`.
 */

/** Column widths mirror the real table so nothing shifts when data lands. */
export function OrdersTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">جارٍ تحميل الطلبات…</span>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {['رقم الطلب', 'العميل', 'الولاية', 'المجموع', 'الحالة', 'الإجراءات'].map((h) => (
              <th
                key={h}
                className="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 animate-pulse">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td className="px-6 py-4">
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded-full bg-gray-200" />
                  <div className="h-3 w-24 rounded-full bg-gray-200" />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded-full bg-gray-200" />
                  <div className="h-3 w-20 rounded-full bg-gray-200" />
                </div>
              </td>
              <td className="px-6 py-4"><div className="h-4 w-16 rounded-full bg-gray-200" /></td>
              <td className="px-6 py-4"><div className="h-4 w-20 rounded-full bg-gray-200" /></td>
              <td className="px-6 py-4"><div className="h-5 w-16 rounded-full bg-gray-200" /></td>
              <td className="px-6 py-4"><div className="h-8 w-8 rounded-lg bg-gray-200" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Full fallback while the very first page of orders loads. */
export function OrdersPageSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-52 rounded-full bg-gray-200 animate-pulse" />
        </div>
        <div className="h-11 w-full sm:w-32 rounded-xl bg-gray-200 animate-pulse" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-20 rounded-full bg-gray-200 animate-pulse" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <OrdersTableSkeleton />
      </div>
    </div>
  );
}

interface EmptyProps {
  /** A status filter is active — the empty result may just need the filter cleared. */
  filtered: boolean;
  onClearFilter?: () => void;
}

export function OrdersEmpty({ filtered, onClearFilter }: EmptyProps) {
  return (
    <div className="text-center py-16 px-6" role="status">
      <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 grid place-items-center mb-4">
        <Inbox size={30} className="text-gray-400" />
      </div>
      <h2 className="font-black text-lg text-[#0f2f52] mb-1">
        {filtered ? 'لا توجد طلبات بهذه الحالة' : 'لا توجد طلبات بعد'}
      </h2>
      <p className="text-sm font-bold text-gray-500 mb-6">
        {filtered
          ? 'جرّب اختيار حالة أخرى أو اعرض كل الطلبات.'
          : 'ستظهر هنا الطلبات فورماً يطلب عملاءكم من متجرك.'}
      </p>
      {filtered && (
        <button
          onClick={onClearFilter}
          className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-[#0f2f52] font-black px-5 py-2.5 rounded-xl transition-all"
        >
          <Inbox size={17} /> عرض كل الطلبات
        </button>
      )}
    </div>
  );
}

interface ErrorProps {
  error?: unknown;
  onRetry: () => void;
}

export function OrdersError({ error, onRetry }: ErrorProps) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : 'حدث خطأ غير متوقع أثناء تحميل الطلبات.';

  return (
    <div className="text-center py-16 px-6" role="alert">
      <div className="w-16 h-16 mx-auto rounded-full bg-red-50 grid place-items-center mb-4">
        <TriangleAlert size={30} className="text-red-500" />
      </div>
      <h2 className="font-black text-lg text-[#0f2f52] mb-1">تعذّر تحميل الطلبات</h2>
      <p className="text-sm font-bold text-gray-500 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-[#1565c0] hover:bg-[#0d47a1] text-white font-black px-5 py-2.5 rounded-xl transition-all active:scale-95"
      >
        <RefreshCw size={17} /> إعادة المحاولة
      </button>
    </div>
  );
}
