import { PackageOpen, Plus, RefreshCw, SearchX, TriangleAlert } from 'lucide-react';

/**
 * The four explicit states of the admin product section:
 *   loading  → skeleton (this file, `ProductsTableSkeleton` / `ProductsPageSkeleton`)
 *   empty    → `ProductsEmpty`
 *   error    → `ProductsError`
 *   success  → the real table rendered by `ProductsPage`
 */

/** Column widths mirror the real table so nothing shifts when data lands. */
export function ProductsTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">جارٍ تحميل المنتجات…</span>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {['المنتج', 'الرابط', 'السنة', 'السعر', 'المخزون', 'الحالة', 'الإجراءات'].map((h) => (
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
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded-full bg-gray-200" />
                    <div className="h-3 w-20 rounded-full bg-gray-200" />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4"><div className="h-4 w-28 rounded-full bg-gray-200" /></td>
              <td className="px-6 py-4"><div className="h-4 w-12 rounded-full bg-gray-200" /></td>
              <td className="px-6 py-4"><div className="h-4 w-16 rounded-full bg-gray-200" /></td>
              <td className="px-6 py-4"><div className="h-4 w-10 rounded-full bg-gray-200" /></td>
              <td className="px-6 py-4"><div className="h-5 w-16 rounded-full bg-gray-200" /></td>
              <td className="px-6 py-4"><div className="h-8 w-20 rounded-lg bg-gray-200" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Full-page fallback used while the lazy ProductsPage chunk + data load. */
export function ProductsPageSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-52 rounded-full bg-gray-200 animate-pulse" />
        </div>
        <div className="h-11 w-full sm:w-44 rounded-xl bg-gray-200 animate-pulse" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="h-10 w-full rounded-xl bg-gray-100 animate-pulse" />
        </div>
        <ProductsTableSkeleton />
      </div>
    </div>
  );
}

interface EmptyProps {
  query?: string;
  onClearSearch?: () => void;
  onCreate?: () => void;
}

export function ProductsEmpty({ query, onClearSearch, onCreate }: EmptyProps) {
  const isSearch = Boolean(query?.trim());

  return (
    <div className="text-center py-16 px-6" role="status">
      <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 grid place-items-center mb-4">
        {isSearch ? (
          <SearchX size={30} className="text-gray-400" />
        ) : (
          <PackageOpen size={30} className="text-gray-400" />
        )}
      </div>
      <h2 className="font-black text-lg text-[#0f2f52] mb-1">
        {isSearch ? 'لا توجد نتائج مطابقة' : 'لا توجد منتجات بعد'}
      </h2>
      <p className="text-sm font-bold text-gray-500 mb-6">
        {isSearch
          ? `لم نجد أي منتج يطابق «${query}». جرّب كلمة بحث أخرى.`
          : 'ابدأ بإضافة أول منتج ليظهر هنا في لوحة الإدارة.'}
      </p>
      {isSearch ? (
        <button
          onClick={onClearSearch}
          className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-[#0f2f52] font-black px-5 py-2.5 rounded-xl transition-all"
        >
          <SearchX size={17} /> مسح البحث
        </button>
      ) : (
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 bg-[#0f2f52] hover:bg-[#1565c0] text-white font-black px-5 py-2.5 rounded-xl transition-all active:scale-95"
        >
          <Plus size={17} /> إنشاء منتج جديد
        </button>
      )}
    </div>
  );
}

interface ErrorProps {
  error?: unknown;
  onRetry: () => void;
}

export function ProductsError({ error, onRetry }: ErrorProps) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : 'حدث خطأ غير متوقع أثناء تحميل المنتجات.';

  return (
    <div className="text-center py-16 px-6" role="alert">
      <div className="w-16 h-16 mx-auto rounded-full bg-red-50 grid place-items-center mb-4">
        <TriangleAlert size={30} className="text-red-500" />
      </div>
      <h2 className="font-black text-lg text-[#0f2f52] mb-1">تعذّر تحميل المنتجات</h2>
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
